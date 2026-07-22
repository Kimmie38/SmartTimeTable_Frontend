import React, { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ChevronLeft, MapPin, Clock, UploadCloud, Trash2 } from "lucide-react-native";
import { colors, font, WEEKDAYS, WEEKDAY_SHORT } from "@/utils/theme";
import { Card, StatusBadge, EmptyState, PrimaryButton } from "@/components/ui/UI";
import { TextField } from "@/components/ui/Field";
import { API_BASE_URL } from "@/utils/config";

const SEMESTERS = ["First", "Second"];

// Backend stores times as 24hr "HH:mm" strings.
function formatTime24(date) {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}
function formatTimeDisplay(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

async function authHeaders() {
  const token = await AsyncStorage.getItem("@smtt/admin_token");
  return token ? { Authorization: `Bearer ${token}` } : null;
}

// The admin's level lives on their saved profile (set at login/signup) —
// everything they create is scoped to it on the backend, so there's
// nothing to pick here, just something to read and display.
async function getAdminLevel() {
  try {
    const raw = await AsyncStorage.getItem("@smtt/admin_profile");
    if (!raw) return null;
    const profile = JSON.parse(raw);
    return profile.adminLevel ?? null;
  } catch (e) {
    return null;
  }
}

export default function UploadTimetableScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();

  const initialDay = WEEKDAYS.includes(params.day) ? params.day : WEEKDAYS[0];
  const [selectedDay, setSelectedDay] = useState(initialDay);
  const [selectedSemester, setSelectedSemester] = useState(SEMESTERS[0]);
  const [adminLevel, setAdminLevel] = useState(null);

  const [departmentId, setDepartmentId] = useState(null);
  const [departmentError, setDepartmentError] = useState("");

  const [dayLectures, setDayLectures] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");

  const [courseCode, setCourseCode] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [lecturerName, setLecturerName] = useState("");
  const [venue, setVenue] = useState("");
  const [startTime, setStartTime] = useState(null); // Date object, time-of-day only
  const [endTime, setEndTime] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load the admin's own level once on mount.
  useEffect(() => {
    (async () => {
      const lvl = await getAdminLevel();
      if (!lvl) {
        setDepartmentError("Session expired. Please log in again.");
        return;
      }
      setAdminLevel(lvl);
    })();
  }, []);

  // Fetch the (single, for now) department once on mount.
  useEffect(() => {
    (async () => {
      const headers = await authHeaders();
      if (!headers) {
        setDepartmentError("Session expired. Please log in again.");
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/departments`, { headers });
        const data = await res.json();
        if (!data.success) {
          setDepartmentError(data.message || "Could not load department.");
          return;
        }
        if (!data.data || data.data.length === 0) {
          setDepartmentError("No department exists yet — create one before uploading a timetable.");
          return;
        }
        setDepartmentId(data.data[0]._id);
      } catch (e) {
        setDepartmentError("Could not reach the server. Check your connection and try again.");
      }
    })();
  }, []);

  const loadLectures = useCallback(async () => {
    if (!adminLevel) return;
    setListLoading(true);
    setListError("");
    const headers = await authHeaders();
    if (!headers) {
      setListError("Session expired. Please log in again.");
      setListLoading(false);
      return;
    }
    try {
      // level is not sent — the backend always scopes to the logged-in
      // admin's own level (req.user.adminLevel), it's not a client filter.
      const query = new URLSearchParams({
        day: selectedDay,
        semester: selectedSemester,
      }).toString();
      const res = await fetch(`${API_BASE_URL}/api/admin/timetable?${query}`, { headers });
      const data = await res.json();
      if (!data.success) {
        setListError(data.message || "Could not load timetable.");
        setDayLectures([]);
        return;
      }
      setDayLectures(data.data || []);
    } catch (e) {
      setListError("Could not reach the server. Check your connection and try again.");
      setDayLectures([]);
    } finally {
      setListLoading(false);
    }
  }, [selectedDay, selectedSemester, adminLevel]);

  useEffect(() => {
    loadLectures();
  }, [loadLectures]);

  const resetForm = () => {
    setCourseCode("");
    setCourseTitle("");
    setLecturerName("");
    setVenue("");
    setStartTime(null);
    setEndTime(null);
  };

  const handleUpload = async () => {
    setError("");
    if (
      !courseCode.trim() ||
      !courseTitle.trim() ||
      !lecturerName.trim() ||
      !venue.trim() ||
      !startTime ||
      !endTime
    ) {
      setError("Please fill in every field before uploading.");
      return;
    }
    if (!departmentId) {
      setError(departmentError || "No department loaded yet — try again in a moment.");
      return;
    }
    if (!adminLevel) {
      setError("Session expired. Please log in again.");
      return;
    }

    const headers = await authHeaders();
    if (!headers) {
      setError("Session expired. Please log in again.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/timetable`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          courseCode: courseCode.trim().toUpperCase(),
          courseTitle: courseTitle.trim(),
          lecturer: lecturerName.trim(),
          venue: venue.trim(),
          day: selectedDay,
          startTime: formatTime24(startTime),
          endTime: formatTime24(endTime),
          department: departmentId,
          semester: selectedSemester,
          // level is intentionally omitted — the backend always uses the
          // logged-in admin's own level, it can't be chosen here.
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Could not upload this course.");
        return;
      }
      resetForm();
      await loadLectures();
    } catch (e) {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="dark" />
      <View
        style={{
          backgroundColor: colors.surface,
          paddingTop: insets.top + 16,
          paddingBottom: 16,
          paddingHorizontal: 24,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: colors.border, justifyContent: "center", alignItems: "center" }}
          >
            <ChevronLeft size={20} color={colors.ink} />
          </TouchableOpacity>
          <View>
            <Text style={{ fontSize: 11, fontFamily: font.semibold, color: colors.muted, textTransform: "uppercase" }}>
              Admin Portal{adminLevel ? ` · ${adminLevel}L` : ""}
            </Text>
            <Text style={{ fontSize: 19, fontFamily: font.bold, color: colors.ink }}>Upload Timetable</Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
          {WEEKDAYS.map((day) => {
            const active = selectedDay === day;
            return (
              <TouchableOpacity
                key={day}
                onPress={() => setSelectedDay(day)}
                style={{
                  flex: 1,
                  paddingVertical: 9,
                  borderRadius: 10,
                  alignItems: "center",
                  backgroundColor: active ? colors.primary : colors.backgroundAlt,
                }}
              >
                <Text style={{ fontSize: 12, fontFamily: active ? font.semibold : font.medium, color: active ? colors.white : colors.body }}>
                  {WEEKDAY_SHORT[day]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ flexDirection: "row", gap: 8 }}>
          {SEMESTERS.map((sem) => {
            const active = selectedSemester === sem;
            return (
              <TouchableOpacity
                key={sem}
                onPress={() => setSelectedSemester(sem)}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 10,
                  alignItems: "center",
                  backgroundColor: active ? colors.ink : colors.backgroundAlt,
                }}
              >
                <Text style={{ fontSize: 11.5, fontFamily: active ? font.semibold : font.medium, color: active ? colors.white : colors.body }}>
                  {sem}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
        <Card style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 15, fontFamily: font.semibold, color: colors.ink, marginBottom: 4 }}>
            Add a course to {selectedDay} · {adminLevel ? `${adminLevel}L` : "…"} · {selectedSemester} semester
          </Text>
          <Text style={{ fontSize: 12.5, fontFamily: font.regular, color: colors.muted, marginBottom: 18 }}>
            This appears instantly on matching students' Today and Schedule tabs.
          </Text>

          {departmentError ? (
            <Text style={{ color: colors.danger, fontSize: 12.5, fontFamily: font.medium, marginBottom: 14 }}>
              {departmentError}
            </Text>
          ) : null}

          <View style={{ gap: 14 }}>
            <TextField label="Course Code" value={courseCode} onChangeText={setCourseCode} placeholder="CSC101" autoCapitalize="characters" />
            <TextField label="Course Title" value={courseTitle} onChangeText={setCourseTitle} placeholder="Introduction to Computer Science" autoCapitalize="words" />
            <TextField label="Lecturer Name" value={lecturerName} onChangeText={setLecturerName} placeholder="Dr. Emily Carter" autoCapitalize="words" />
            <TextField label="Venue" value={venue} onChangeText={setVenue} placeholder="Auditorium A" autoCapitalize="words" />
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <PickerField
                  label="Start Time"
                  icon={Clock}
                  value={startTime ? formatTimeDisplay(startTime) : ""}
                  placeholder="Select time"
                  onPress={() => setShowStartPicker(true)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <PickerField
                  label="End Time"
                  icon={Clock}
                  value={endTime ? formatTimeDisplay(endTime) : ""}
                  placeholder="Select time"
                  onPress={() => setShowEndPicker(true)}
                />
              </View>
            </View>

            {showStartPicker && (
              <DateTimePicker
                value={startTime || new Date()}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, selected) => {
                  setShowStartPicker(false);
                  if (event.type !== "dismissed" && selected) setStartTime(selected);
                }}
              />
            )}
            {showEndPicker && (
              <DateTimePicker
                value={endTime || new Date()}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, selected) => {
                  setShowEndPicker(false);
                  if (event.type !== "dismissed" && selected) setEndTime(selected);
                }}
              />
            )}
          </View>

          {error ? (
            <Text style={{ color: colors.danger, fontSize: 12.5, fontFamily: font.medium, marginTop: 14 }}>
              {error}
            </Text>
          ) : null}

          {submitting ? (
            <View style={{ marginTop: 20, alignItems: "center" }}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <PrimaryButton label="Upload to Timetable" icon={UploadCloud} onPress={handleUpload} style={{ marginTop: 20 }} />
          )}
        </Card>

        <Text style={{ fontSize: 12, fontFamily: font.semibold, color: colors.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>
          {selectedDay} · {listLoading ? "…" : dayLectures.length} course{dayLectures.length === 1 ? "" : "s"} uploaded
        </Text>

        {listError ? (
          <Text style={{ color: colors.danger, fontSize: 12.5, fontFamily: font.medium, marginBottom: 14 }}>
            {listError}
          </Text>
        ) : null}

        {listLoading ? (
          <View style={{ paddingVertical: 24, alignItems: "center" }}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : dayLectures.length > 0 ? (
          dayLectures.map((lecture) => (
            <Card key={lecture._id} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <View style={{ flex: 1, minWidth: 0, marginRight: 10 }}>
                  <Text style={{ fontSize: 11.5, fontFamily: font.semibold, color: colors.primary, marginBottom: 3 }}>
                    {lecture.courseCode}
                  </Text>
                  <Text style={{ fontSize: 14.5, fontFamily: font.semibold, color: colors.ink }}>
                    {lecture.courseTitle}
                  </Text>
                </View>
                <View style={{ flexShrink: 0 }}>
                  <StatusBadge status={lecture.status} size="sm" />
                </View>
              </View>
              <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 5, marginTop: 8 }}>
                <MapPin size={12} color={colors.muted} />
                <Text style={{ fontSize: 12, color: colors.muted, fontFamily: font.regular }}>{lecture.venue}</Text>
                <Text style={{ fontSize: 12, color: colors.faint }}>·</Text>
                <Clock size={12} color={colors.muted} />
                <Text style={{ fontSize: 12, color: colors.muted, fontFamily: font.regular }}>
                  {lecture.startTime} - {lecture.endTime}
                </Text>
              </View>
            </Card>
          ))
        ) : (
          <EmptyState
            icon={Trash2}
            title={`Nothing uploaded for ${selectedDay}`}
            subtitle={`No ${adminLevel ? `${adminLevel}L` : ""} ${selectedSemester.toLowerCase()} semester courses yet. Use the form above to add the first one.`}
          />
        )}
      </ScrollView>
    </View>
  );
}

// Tap-to-open field for date/time values — visually matches TextField
// (bordered box, same label style) but opens a native picker instead of the keyboard.
function PickerField({ label, icon: Icon, value, placeholder, onPress }) {
  return (
    <View>
      <Text style={{ fontFamily: font.medium, fontSize: 13, color: colors.ink, marginBottom: 6 }}>{label}</Text>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 14,
          paddingHorizontal: 14,
          paddingVertical: 14,
          backgroundColor: colors.white,
          gap: 10,
        }}
      >
        {Icon ? <Icon size={16} color={colors.muted} /> : null}
        <Text style={{ fontFamily: font.regular, fontSize: 15, color: value ? colors.ink : colors.faint }}>
          {value || placeholder}
        </Text>
      </TouchableOpacity>
    </View>
  );
}