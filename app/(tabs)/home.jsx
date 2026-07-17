import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Bell, MapPin, User, Clock, ChevronRight, CalendarX2 } from "lucide-react-native";
import { useAppStore } from "@/utils/appStore";
import { colors, font, getTodayName, formatFullDate, WEEKDAYS } from "@/utils/theme";
import { Card, StatusBadge, EmptyState } from "@/components/ui/UI";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { student, timetable } = useAppStore();
  const today = getTodayName();
  const isClassDay = WEEKDAYS.includes(today);
  const todaysLectures = isClassDay ? timetable[today] || [] : [];
  const firstName = student?.fullName?.split(" ")[0] || "Student";

  const LectureCard = ({ lecture }) => (
    <Card style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <View
              style={{
                backgroundColor: colors.backgroundAlt,
                borderRadius: 999,
                paddingHorizontal: 9,
                paddingVertical: 4,
              }}
            >
              <Text style={{ fontSize: 10.5, fontFamily: font.semibold, color: colors.body }}>
                {lecture.courseCode}
              </Text>
            </View>
            <StatusBadge status={lecture.status} size="sm" />
          </View>
          <Text style={{ fontSize: 17, fontFamily: font.semibold, color: colors.ink }}>
            {lecture.courseTitle}
          </Text>
        </View>
      </View>

      <View style={{ marginTop: 14, gap: 8 }}>
        <Row icon={User} text={lecture.lecturerName} />
        <Row icon={MapPin} text={lecture.venue} />
        <Row icon={Clock} text={`${lecture.startTime} - ${lecture.endTime}`} />
      </View>
    </Card>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />

      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        {/* Flat greeting row — plain background, scrolls with content */}
        <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 24, paddingBottom: 4 }}>
          <Text style={{ fontSize: 11, fontFamily: font.semibold, color: colors.muted, textTransform: "uppercase", letterSpacing: 1 }}>
            {formatFullDate()}
          </Text>
        </View>

        {/* Floating hero card — inset on all sides, rounded, sits above the page */}
        <View style={{ paddingHorizontal: 24, marginTop: 8, marginBottom: 26 }}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 22,
              padding: 22,
              overflow: "hidden",
              shadowColor: colors.primaryDark,
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.22,
              shadowRadius: 20,
              elevation: 8,
            }}
          >
            <View
              style={{
                position: "absolute",
                width: 140,
                height: 140,
                borderRadius: 70,
                backgroundColor: colors.accent,
                opacity: 0.15,
                top: -50,
                right: -30,
              }}
            />

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
                <Text style={{ fontSize: 24, fontFamily: font.bold, color: colors.white, letterSpacing: -0.4 }}>
                  Hi, {firstName} 👋
                </Text>
                <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", fontFamily: font.regular, marginTop: 4 }}>
                  {student?.level ? `Level ${student.level} · ${student?.semester}` : "Computer Science"}
                </Text>
              </View>
              <TouchableOpacity
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  flexShrink: 0,
                  backgroundColor: "rgba(255,255,255,0.16)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Bell size={19} color={colors.white} />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        <View style={{ paddingHorizontal: 24 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 17, fontFamily: font.semibold, color: colors.ink }}>
              Today's Lectures
            </Text>
            <View
              style={{
                backgroundColor: colors.accentSoft,
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderWidth: 1,
                borderColor: colors.accentLight,
              }}
            >
              <Text style={{ fontSize: 11, fontFamily: font.semibold, color: colors.accentDark }}>
                {today}
              </Text>
            </View>
          </View>

          {todaysLectures.length > 0 ? (
            todaysLectures.map((lecture) => <LectureCard key={lecture.id} lecture={lecture} />)
          ) : (
            <Card>
              <EmptyState
                icon={CalendarX2}
                title={isClassDay ? "No lectures uploaded yet" : "No classes today"}
                subtitle={
                  isClassDay
                    ? "Your admin hasn't published lectures for today."
                    : "Enjoy your weekend — check the Schedule tab for the week ahead."
                }
              />
            </Card>
          )}

          <TouchableOpacity
            onPress={() => router.push("/(tabs)/schedule")}
            style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 8, paddingVertical: 14 }}
          >
            <Text style={{ fontSize: 13.5, fontFamily: font.semibold, color: colors.primary }}>
              View full weekly timetable
            </Text>
            <ChevronRight size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function Row({ icon: Icon, text }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Icon size={14} color={colors.muted} />
      <Text style={{ fontSize: 13.5, color: colors.body, fontFamily: font.regular }}>{text}</Text>
    </View>
  );
}