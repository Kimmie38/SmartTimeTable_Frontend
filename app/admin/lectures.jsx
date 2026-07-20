import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
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
import { useAppStore } from "@/utils/appStore";
import { colors, font, WEEKDAYS, WEEKDAY_SHORT } from "@/utils/theme";
import { Card, StatusBadge, EmptyState } from "@/components/ui/UI";

export default function AdminLectures() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { timetable, updateLectureStatus, completeLecture } = useAppStore();
  const [selectedDay, setSelectedDay] = useState(WEEKDAYS[0]);

  const lectures = timetable[selectedDay] || [];

  const handleComplete = (lecture) => {
    Alert.alert("Mark as Completed", `Attach a file for ${lecture.courseCode} before marking it complete?`, [
      { text: "Attach PDF", onPress: () => pickDocument(lecture) },
      { text: "Attach Image", onPress: () => pickImage(lecture) },
      { text: "Complete without file", onPress: () => completeLecture(selectedDay, lecture, null) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const pickDocument = async (lecture) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "application/pdf" });
      if (!result.canceled && result.assets?.length) {
        const file = result.assets[0];
        completeLecture(selectedDay, lecture, { type: "pdf", name: file.name });
      }
    } catch (e) {
      completeLecture(selectedDay, lecture, null);
    }
  };

  const pickImage = async (lecture) => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        completeLecture(selectedDay, lecture, null);
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"] });
      if (!result.canceled && result.assets?.length) {
        const file = result.assets[0];
        const name = file.fileName || file.uri.split("/").pop() || "image.jpg";
        completeLecture(selectedDay, lecture, { type: "image", name });
      }
    } catch (e) {
      completeLecture(selectedDay, lecture, null);
    }
  };

  const AdminLectureCard = ({ lecture }) => (
    <Card style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <View style={{ flex: 1, minWidth: 0, marginRight: 10 }}>
          <Text style={{ fontSize: 12, fontFamily: font.semibold, color: colors.primary, marginBottom: 4 }}>
            {lecture.courseCode}
          </Text>
          <Text style={{ fontSize: 17, fontFamily: font.semibold, color: colors.ink }}>{lecture.courseTitle}</Text>
        </View>
        <View style={{ flexShrink: 0 }}>
          <StatusBadge status={lecture.status} />
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
          onPress={() => updateLectureStatus(selectedDay, lecture.id, "Ongoing")}
        />
        <ActionBtn
          icon={RotateCcw}
          label="Reset"
          tint={colors.warning}
          bg={colors.warningBg}
          border={colors.warningBorder}
          onPress={() => updateLectureStatus(selectedDay, lecture.id, "Pending")}
        />
        <ActionBtn
          icon={XCircle}
          label="Cancel"
          tint={colors.danger}
          bg={colors.dangerBg}
          border={colors.dangerBorder}
          onPress={() => updateLectureStatus(selectedDay, lecture.id, "Cancelled")}
        />
        <ActionBtn
          icon={CheckCircle2}
          label="Complete"
          tint={colors.info}
          bg={colors.infoBg}
          border="#C7DBFC"
          onPress={() => handleComplete(lecture)}
          full
        />
      </View>
    </Card>
  );

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
            <Text style={{ fontSize: 19, fontFamily: font.bold, color: colors.ink }}>Manage Lectures</Text>
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
        {lectures.length > 0 ? (
          lectures.map((lecture) => <AdminLectureCard key={lecture.id} lecture={lecture} />)
        ) : (
          <EmptyState icon={Paperclip} title={`No lectures on ${selectedDay}`} subtitle="Nothing to manage for this day." />
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

function ActionBtn({ icon: Icon, label, tint, bg, border, onPress, full }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
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
      }}
    >
      <Icon size={14} color={tint} />
      <Text style={{ fontSize: 12, fontFamily: font.semibold, color: tint }}>{label}</Text>
    </TouchableOpacity>
  );
}
