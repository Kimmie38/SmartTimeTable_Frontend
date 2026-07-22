import React, { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ChevronLeft, ClipboardList, GraduationCap, Plus, X, Calendar, Clock } from "lucide-react-native";
import { colors, font } from "@/utils/theme";
import { Card, EmptyState, PrimaryButton } from "@/components/ui/UI";
import { TextField, ChipSelect } from "@/components/ui/Field";
import { API_BASE_URL } from "@/utils/config";

const SEMESTERS = ["First", "Second"];

// Backend stores times as 24hr "HH:mm" strings and dates as ISO datetimes.
function formatTime24(date) {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}
function formatTimeDisplay(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function formatDateISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function formatDateDisplay(date) {
  return date.toLocaleDateString([], { weekday: "short", year: "numeric", month: "short", day: "numeric" });
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

export default function AdminTests() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  const [adminLevel, setAdminLevel] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(SEMESTERS[0]);

  const [departmentId, setDepartmentId] = useState(null);
  const [departmentError, setDepartmentError] = useState("");

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");

  const [courseCode, setCourseCode] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [type, setType] = useState("Test");
  const [date, setDate] = useState(null); // Date object
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [venue, setVenue] = useState("");
  const [notes, setNotes] = useState("");
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
          setDepartmentError("No department exists yet — create one before posting an assessment.");
          return;
        }
        setDepartmentId(data.data[0]._id);
      } catch (e) {
        setDepartmentError("Could not reach the server. Check your connection and try again.");
      }
    })();
  }, []);

  const loadTests = useCallback(async () => {
    if (!adminLevel) return;
    setLoading(true);
    setListError("");
    const headers = await authHeaders();
    if (!headers) {
      setListError("Session expired. Please log in again.");
      setLoading(false);
      return;
    }
    try {
      // level is not sent — the backend always scopes to the logged-in
      // admin's own level (req.user.adminLevel), it's not a client filter.
      const query = new URLSearchParams({
        semester: selectedSemester,
      }).toString();
      const res = await fetch(`${API_BASE_URL}/api/admin/tests-exams?${query}`, { headers });
      const data = await res.json();
      if (!data.success) {
        setListError(data.message || "Could not load assessments.");
        setTests([]);
        return;
      }
      setTests(data.data || []);
    } catch (e) {
      setListError("Could not reach the server. Check your connection and try again.");
      setTests([]);
    } finally {
      setLoading(false);
    }
  }, [selectedSemester, adminLevel]);

  useFocusEffect(
    useCallback(() => {
      loadTests();
    }, [loadTests])
  );

  const resetForm = () => {
    setCourseCode("");
    setCourseTitle("");
    setType("Test");
    setDate(null);
    setStartTime(null);
    setEndTime(null);
    setVenue("");
    setNotes("");
  };

  const handleAdd = async () => {
    setError("");
    if (!courseCode.trim() || !courseTitle.trim() || !date || !startTime || !endTime || !venue.trim()) {
      setError("Please fill in every required field.");
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
      const res = await fetch(`${API_BASE_URL}/api/admin/tests-exams`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          courseCode: courseCode.trim().toUpperCase(),
          courseTitle: courseTitle.trim(),
          date: formatDateISO(date),
          startTime: formatTime24(startTime),
          endTime: formatTime24(endTime),
          venue: venue.trim(),
          department: departmentId,
          semester: selectedSemester,
          instructions: notes.trim(),
          // level is intentionally omitted — the backend always uses the
          // logged-in admin's own level, it can't be chosen here.
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Could not post this assessment.");
        return;
      }
      resetForm();
      setShowForm(false);
      await loadTests();
    } catch (e) {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const sorted = [...tests].sort((a, b) => new Date(a.date) - new Date(b.date));

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
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
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
              <Text style={{ fontSize: 19, fontFamily: font.bold, color: colors.ink }}>Tests & Exams</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setShowForm((v) => !v)}
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, justifyContent: "center", alignItems: "center" }}
          >
            {showForm ? <X size={20} color={colors.white} /> : <Plus size={20} color={colors.white} />}
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
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
        {showForm ? (
          <Card style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 15, fontFamily: font.semibold, color: colors.ink, marginBottom: 4 }}>
              Post a new assessment
            </Text>
            <Text style={{ fontSize: 12.5, fontFamily: font.regular, color: colors.muted, marginBottom: 16 }}>
              For {adminLevel ? `${adminLevel}L` : "…"} · {selectedSemester} semester
            </Text>

            {departmentError ? (
              <Text style={{ color: colors.danger, fontSize: 12.5, fontFamily: font.medium, marginBottom: 14 }}>
                {departmentError}
              </Text>
            ) : null}

            <View style={{ gap: 14 }}>
              <ChipSelect label="Type" options={["Test", "Exam"]} value={type} onChange={setType} />
              <TextField label="Course Code" value={courseCode} onChangeText={setCourseCode} placeholder="CSC101" autoCapitalize="characters" />
              <TextField label="Course Title" value={courseTitle} onChangeText={setCourseTitle} placeholder="Introduction to Computer Science" autoCapitalize="words" />
              <PickerField
                label="Date"
                icon={Calendar}
                value={date ? formatDateDisplay(date) : ""}
                placeholder="Select date"
                onPress={() => setShowDatePicker(true)}
              />
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

              {showDatePicker && (
                <DateTimePicker
                  value={date || new Date()}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  minimumDate={new Date()}
                  onChange={(event, selected) => {
                    setShowDatePicker(false);
                    if (event.type !== "dismissed" && selected) setDate(selected);
                  }}
                />
              )}
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
              <TextField label="Venue" value={venue} onChangeText={setVenue} placeholder="Auditorium A" autoCapitalize="words" />
              <TextField label="Notes (optional)" value={notes} onChangeText={setNotes} placeholder="Coverage, requirements, etc." />
            </View>

            {error ? (
              <Text style={{ color: colors.danger, fontSize: 12.5, fontFamily: font.medium, marginTop: 14 }}>
                {error}
              </Text>
            ) : null}

            {submitting ? (
              <View style={{ marginTop: 18, alignItems: "center" }}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : (
              <PrimaryButton label="Post Assessment" onPress={handleAdd} style={{ marginTop: 18 }} />
            )}
          </Card>
        ) : null}

        {listError ? (
          <View style={{ marginBottom: 14 }}>
            <Text style={{ color: colors.danger, fontFamily: font.medium, fontSize: 13.5 }}>{listError}</Text>
            <TouchableOpacity onPress={loadTests} style={{ marginTop: 6 }}>
              <Text style={{ color: colors.primary, fontFamily: font.semibold, fontSize: 13.5 }}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {loading ? (
          <View style={{ paddingVertical: 24, alignItems: "center" }}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : sorted.length > 0 ? (
          sorted.map((item) => (
            <Card key={item._id} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10, flex: 1, minWidth: 0 }}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      backgroundColor: item.type === "Exam" ? colors.dangerBg : colors.accentSoft,
                      justifyContent: "center",
                      alignItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    {item.type === "Exam" ? (
                      <GraduationCap size={17} color={colors.danger} />
                    ) : (
                      <ClipboardList size={17} color={colors.accentDark} />
                    )}
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontSize: 11, fontFamily: font.semibold, color: colors.muted }}>{item.courseCode}</Text>
                    <Text style={{ fontSize: 14.5, fontFamily: font.semibold, color: colors.ink }}>{item.courseTitle}</Text>
                    <Text style={{ fontSize: 11.5, fontFamily: font.regular, color: colors.muted, marginTop: 2 }}>
                      {new Date(item.date).toISOString().slice(0, 10)} · {item.startTime} · {item.venue}
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          ))
        ) : (
          <EmptyState
            icon={ClipboardList}
            title="No assessments posted"
            subtitle={`Nothing yet for ${adminLevel ? `${adminLevel}L` : ""} ${selectedSemester.toLowerCase()} semester. Use the + button to add one.`}
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