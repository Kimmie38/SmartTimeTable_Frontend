import React, { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import {
  ChevronLeft,
  Clock,
  MapPin,
  Play,
  RotateCcw,
  XCircle,
  CheckCircle2,
  Paperclip,
  Plus,
} from "lucide-react-native";
import { colors, font, WEEKDAYS, WEEKDAY_SHORT } from "@/utils/theme";
import { Card, StatusBadge, EmptyState } from "@/components/ui/UI";
import { API_BASE_URL } from "@/utils/config";

const SEMESTERS = ["First", "Second"];

async function authHeaders() {
  const token = await AsyncStorage.getItem("@smtt/admin_token");
  return token ? { Authorization: `Bearer ${token}` } : null;
}

// The admin's level lives on their saved profile (set at login/signup) —
// everything they manage is scoped to it on the backend, so there's
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

export default function AdminLectures() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [selectedDay, setSelectedDay] = useState(WEEKDAYS[0]);
  const [adminLevel, setAdminLevel] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(SEMESTERS[0]);

  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null); // disables buttons on the card mid-request

  // The backend resets a lecture's status back to "Pending" the instant it's
  // marked complete (so it's ready for next week). Without this, the badge
  // would flip straight from "Ongoing" to "Pending" with no visible
  // confirmation. This holds a "Completed" badge on-screen briefly before
  // the real (reset) status is fetched and shown.
  const [justCompletedIds, setJustCompletedIds] = useState([]);

  // Load the admin's own level once on mount.
  useEffect(() => {
    (async () => {
      const lvl = await getAdminLevel();
      if (!lvl) {
        setError("Session expired. Please log in again.");
        return;
      }
      setAdminLevel(lvl);
    })();
  }, []);

  const loadLectures = useCallback(async (opts = {}) => {
    if (!adminLevel) return;
    if (!opts.silent) setLoading(true);
    setError("");
    const headers = await authHeaders();
    if (!headers) {
      setError("Session expired. Please log in again.");
      setLoading(false);
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
        setError(data.message || "Could not load lectures.");
        setLectures([]);
        return;
      }
      setLectures(data.data || []);
    } catch (e) {
      setError("Could not reach the server. Check your connection and try again.");
      setLectures([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDay, selectedSemester, adminLevel]);

  // Refetch on focus too — statuses can change from this same screen or elsewhere.
  useFocusEffect(
    useCallback(() => {
      loadLectures();
    }, [loadLectures])
  );

  const updateStatus = async (lecture, status) => {
    setUpdatingId(lecture._id);
    const headers = await authHeaders();
    if (!headers) {
      Alert.alert("Session expired", "Please log in again.");
      setUpdatingId(null);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/timetable/${lecture._id}/status`, {
        method: "PATCH",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!data.success) {
        Alert.alert("Couldn't update status", data.message || "Please try again.");
        return;
      }
      await loadLectures();
    } catch (e) {
      Alert.alert("Couldn't update status", "Check your connection and try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const completeLecture = async (lecture, file) => {
    setUpdatingId(lecture._id);
    const headers = await authHeaders();
    if (!headers) {
      Alert.alert("Session expired", "Please log in again.");
      setUpdatingId(null);
      return;
    }
    try {
      let res;
      if (file) {
        const formData = new FormData();
        formData.append("file", {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || (file.type === "pdf" ? "application/pdf" : "image/jpeg"),
        });
        res = await fetch(`${API_BASE_URL}/api/admin/timetable/${lecture._id}/complete`, {
          method: "POST",
          headers, // do NOT set Content-Type manually — fetch sets the multipart boundary
          body: formData,
        });
      } else {
        // No file to attach — send a plain JSON request instead of an empty
        // multipart body. React Native's fetch can produce a malformed or
        // missing boundary for a truly empty FormData, which multer then
        // fails to parse. Multer steps aside for non-multipart requests,
        // so this still reaches the route fine with req.file left unset.
        res = await fetch(`${API_BASE_URL}/api/admin/timetable/${lecture._id}/complete`, {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
      }
      const data = await res.json();
      if (!data.success) {
        Alert.alert("Couldn't mark complete", data.message || "Please try again.");
        return;
      }
      setJustCompletedIds((prev) => [...prev, lecture._id]);
      setTimeout(() => {
        setJustCompletedIds((prev) => prev.filter((id) => id !== lecture._id));
        loadLectures({ silent: true });
      }, 2200);
    } catch (e) {
      Alert.alert("Couldn't mark complete", "Check your connection and try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleComplete = (lecture) => {
    Alert.alert("Mark as Completed", `Attach a file for ${lecture.courseCode} before marking it complete?`, [
      { text: "Attach PDF", onPress: () => pickDocument(lecture) },
      { text: "Attach Image", onPress: () => pickImage(lecture) },
      { text: "Complete without file", onPress: () => completeLecture(lecture, null) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const pickDocument = async (lecture) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "application/pdf" });
      if (!result.canceled && result.assets?.length) {
        const file = result.assets[0];
        completeLecture(lecture, { uri: file.uri, name: file.name, mimeType: file.mimeType, type: "pdf" });
      }
    } catch (e) {
      completeLecture(lecture, null);
    }
  };

  const pickImage = async (lecture) => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        completeLecture(lecture, null);
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"] });
      if (!result.canceled && result.assets?.length) {
        const file = result.assets[0];
        const name = file.fileName || file.uri.split("/").pop() || "image.jpg";
        completeLecture(lecture, { uri: file.uri, name, mimeType: file.mimeType, type: "image" });
      }
    } catch (e) {
      completeLecture(lecture, null);
    }
  };

  const AdminLectureCard = ({ lecture }) => {
    const justCompleted = justCompletedIds.includes(lecture._id);
    const busy = updatingId === lecture._id || justCompleted;
    const displayStatus = justCompleted ? "Completed" : lecture.status;
    return (
      <Card style={{ marginBottom: 14, opacity: updatingId === lecture._id ? 0.6 : 1 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flex: 1, minWidth: 0, marginRight: 10 }}>
            <Text style={{ fontSize: 12, fontFamily: font.semibold, color: colors.primary, marginBottom: 4 }}>
              {lecture.courseCode}
            </Text>
            <Text style={{ fontSize: 17, fontFamily: font.semibold, color: colors.ink }}>{lecture.courseTitle}</Text>
          </View>
          <View style={{ flexShrink: 0 }}>
            <StatusBadge status={displayStatus} />
          </View>
        </View>

        <View style={{ marginTop: 12, gap: 6 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Clock size={13} color={colors.muted} />
            <Text style={{ fontSize: 12.5, color: colors.muted, fontFamily: font.regular }}>
              {lecture.startTime} - {lecture.endTime}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <MapPin size={13} color={colors.muted} />
            <Text style={{ fontSize: 12.5, color: colors.muted, fontFamily: font.regular }}>{lecture.venue}</Text>
          </View>
        </View>

        <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.divider, flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          <ActionBtn
            icon={Play}
            label="Start"
            tint={colors.success}
            bg={colors.successBg}
            border={colors.successBorder}
            disabled={busy}
            onPress={() => updateStatus(lecture, "Ongoing")}
          />
          <ActionBtn
            icon={RotateCcw}
            label="Reset"
            tint={colors.warning}
            bg={colors.warningBg}
            border={colors.warningBorder}
            disabled={busy}
            onPress={() => updateStatus(lecture, "Pending")}
          />
          <ActionBtn
            icon={XCircle}
            label="Cancel"
            tint={colors.danger}
            bg={colors.dangerBg}
            border={colors.dangerBorder}
            disabled={busy}
            onPress={() => updateStatus(lecture, "Cancelled")}
          />
          <ActionBtn
            icon={CheckCircle2}
            label="Complete"
            tint={colors.info}
            bg={colors.infoBg}
            border="#C7DBFC"
            disabled={busy}
            onPress={() => handleComplete(lecture)}
            full
          />
        </View>
      </Card>
    );
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
            <Text style={{ fontSize: 19, fontFamily: font.bold, color: colors.ink }}>Manage Lectures</Text>
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
        {error ? (
          <View style={{ marginBottom: 14 }}>
            <Text style={{ color: colors.danger, fontFamily: font.medium, fontSize: 13.5 }}>{error}</Text>
            <TouchableOpacity onPress={loadLectures} style={{ marginTop: 6 }}>
              <Text style={{ color: colors.primary, fontFamily: font.semibold, fontSize: 13.5 }}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {loading ? (
          <View style={{ paddingVertical: 24, alignItems: "center" }}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : lectures.length > 0 ? (
          lectures.map((lecture) => <AdminLectureCard key={lecture._id} lecture={lecture} />)
        ) : (
          <EmptyState
            icon={Paperclip}
            title={`No lectures on ${selectedDay}`}
            subtitle={`Nothing to manage for ${adminLevel ? `${adminLevel}L` : ""} ${selectedSemester.toLowerCase()} semester on this day.`}
          />
        )}

        <TouchableOpacity
          onPress={() => router.push({ pathname: "/admin/upload-timetable", params: { day: selectedDay } })}
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            borderWidth: 1.5,
            borderColor: colors.border,
            borderStyle: "dashed",
            padding: 20,
            alignItems: "center",
            marginTop: 8,
          }}
        >
          <Plus size={22} color={colors.muted} style={{ marginBottom: 8 }} />
          <Text style={{ fontSize: 13.5, fontFamily: font.medium, color: colors.muted }}>
            Upload New Lecture for {selectedDay}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function ActionBtn({ icon: Icon, label, tint, bg, border, onPress, full, disabled }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
      style={{
        flexGrow: full ? 1 : 0,
        flexBasis: full ? "100%" : "31%",
        height: 38,
        borderRadius: 8,
        backgroundColor: bg,
        borderWidth: 1,
        borderColor: border,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        gap: 6,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Icon size={14} color={tint} />
      <Text style={{ fontSize: 12, fontFamily: font.semibold, color: tint }}>{label}</Text>
    </TouchableOpacity>
  );
}