import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ChevronLeft, MapPin, Clock, UploadCloud, Trash2 } from "lucide-react-native";
import { useAppStore } from "@/utils/appStore";
import { colors, font, WEEKDAYS, WEEKDAY_SHORT } from "@/utils/theme";
import { Card, StatusBadge, EmptyState, PrimaryButton } from "@/components/ui/UI";
import { TextField } from "@/components/ui/Field";

export default function UploadTimetableScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { timetable, addLecture } = useAppStore();

  const initialDay = WEEKDAYS.includes(params.day) ? params.day : WEEKDAYS[0];
  const [selectedDay, setSelectedDay] = useState(initialDay);

  const [courseCode, setCourseCode] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [lecturerName, setLecturerName] = useState("");
  const [venue, setVenue] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState("");

  const dayLectures = timetable[selectedDay] || [];

  const resetForm = () => {
    setCourseCode("");
    setCourseTitle("");
    setLecturerName("");
    setVenue("");
    setStartTime("");
    setEndTime("");
  };

  const handleUpload = () => {
    setError("");
    if (!courseCode.trim() || !courseTitle.trim() || !lecturerName.trim() || !venue.trim() || !startTime.trim() || !endTime.trim()) {
      setError("Please fill in every field before uploading.");
      return;
    }
    addLecture(selectedDay, {
      courseCode: courseCode.trim().toUpperCase(),
      courseTitle: courseTitle.trim(),
      lecturerName: lecturerName.trim(),
      venue: venue.trim(),
      startTime: startTime.trim(),
      endTime: endTime.trim(),
    });
    resetForm();
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
              Admin Portal
            </Text>
            <Text style={{ fontSize: 19, fontFamily: font.bold, color: colors.ink }}>Upload Timetable</Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 8 }}>
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
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
        <Card style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 15, fontFamily: font.semibold, color: colors.ink, marginBottom: 4 }}>
            Add a course to {selectedDay}
          </Text>
          <Text style={{ fontSize: 12.5, fontFamily: font.regular, color: colors.muted, marginBottom: 18 }}>
            This appears instantly on students' Today and Schedule tabs.
          </Text>

          <View style={{ gap: 14 }}>
            <TextField label="Course Code" value={courseCode} onChangeText={setCourseCode} placeholder="CSC101" autoCapitalize="characters" />
            <TextField label="Course Title" value={courseTitle} onChangeText={setCourseTitle} placeholder="Introduction to Computer Science" autoCapitalize="words" />
            <TextField label="Lecturer Name" value={lecturerName} onChangeText={setLecturerName} placeholder="Dr. Emily Carter" autoCapitalize="words" />
            <TextField label="Venue" value={venue} onChangeText={setVenue} placeholder="Auditorium A" autoCapitalize="words" />
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <TextField label="Start Time" value={startTime} onChangeText={setStartTime} placeholder="08:00 AM" />
              </View>
              <View style={{ flex: 1 }}>
                <TextField label="End Time" value={endTime} onChangeText={setEndTime} placeholder="10:00 AM" />
              </View>
            </View>
          </View>

          {error ? (
            <Text style={{ color: colors.danger, fontSize: 12.5, fontFamily: font.medium, marginTop: 14 }}>
              {error}
            </Text>
          ) : null}

          <PrimaryButton label="Upload to Timetable" icon={UploadCloud} onPress={handleUpload} style={{ marginTop: 20 }} />
        </Card>

        <Text style={{ fontSize: 12, fontFamily: font.semibold, color: colors.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>
          {selectedDay} · {dayLectures.length} course{dayLectures.length === 1 ? "" : "s"} uploaded
        </Text>

        {dayLectures.length > 0 ? (
          dayLectures.map((lecture) => (
            <Card key={lecture.id} style={{ marginBottom: 12 }}>
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
          <EmptyState icon={Trash2} title={`Nothing uploaded for ${selectedDay}`} subtitle="Use the form above to add the first course." />
        )}
      </ScrollView>
    </View>
  );
}
