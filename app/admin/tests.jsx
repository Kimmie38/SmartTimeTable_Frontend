import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { ChevronLeft, ClipboardList, GraduationCap, Plus, X } from "lucide-react-native";
import { useAppStore } from "@/utils/appStore";
import { colors, font } from "@/utils/theme";
import { Card, EmptyState, PrimaryButton } from "@/components/ui/UI";
import { TextField, ChipSelect } from "@/components/ui/Field";

export default function AdminTests() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { tests, addTest } = useAppStore();
  const [showForm, setShowForm] = useState(false);

  const [courseCode, setCourseCode] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [type, setType] = useState("Test");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [venue, setVenue] = useState("");
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setCourseCode("");
    setCourseTitle("");
    setType("Test");
    setDate("");
    setStartTime("");
    setVenue("");
    setNotes("");
  };

  const handleAdd = () => {
    if (!courseCode.trim() || !courseTitle.trim() || !date.trim() || !startTime.trim() || !venue.trim()) return;
    addTest({ courseCode: courseCode.trim().toUpperCase(), courseTitle: courseTitle.trim(), type, date: date.trim(), startTime: startTime.trim(), venue: venue.trim(), notes: notes.trim() });
    resetForm();
    setShowForm(false);
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
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
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

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
        {showForm ? (
          <Card style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 15, fontFamily: font.semibold, color: colors.ink, marginBottom: 16 }}>
              Post a new assessment
            </Text>
            <View style={{ gap: 14 }}>
              <ChipSelect label="Type" options={["Test", "Exam"]} value={type} onChange={setType} />
              <TextField label="Course Code" value={courseCode} onChangeText={setCourseCode} placeholder="CSC101" autoCapitalize="characters" />
              <TextField label="Course Title" value={courseTitle} onChangeText={setCourseTitle} placeholder="Introduction to Computer Science" autoCapitalize="words" />
              <TextField label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} placeholder="2026-07-20" />
              <TextField label="Start Time" value={startTime} onChangeText={setStartTime} placeholder="09:00 AM" />
              <TextField label="Venue" value={venue} onChangeText={setVenue} placeholder="Auditorium A" autoCapitalize="words" />
              <TextField label="Notes (optional)" value={notes} onChangeText={setNotes} placeholder="Coverage, requirements, etc." />
            </View>
            <PrimaryButton label="Post Assessment" onPress={handleAdd} style={{ marginTop: 18 }} />
          </Card>
        ) : null}

        {sorted.length > 0 ? (
          sorted.map((item) => (
            <Card key={item.id} style={{ marginBottom: 12 }}>
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
                      {item.date} · {item.startTime} · {item.venue}
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          ))
        ) : (
          <EmptyState icon={ClipboardList} title="No assessments posted" subtitle="Use the + button to add a test or exam." />
        )}
      </ScrollView>
    </View>
  );
}
