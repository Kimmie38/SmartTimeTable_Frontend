import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Clock, MapPin, ClipboardList, GraduationCap } from "lucide-react-native";
import { useAppStore } from "@/utils/appStore";
import { colors, font } from "@/utils/theme";
import { Card, EmptyState } from "@/components/ui/UI";

export default function TestsScreen() {
  const insets = useSafeAreaInsets();
  const { tests } = useAppStore();

  const sorted = [...tests].sort((a, b) => new Date(a.date) - new Date(b.date));
  const upcomingCount = sorted.filter((item) => getDaysLeft(item.date) >= 0).length;

  const TestCard = ({ item }) => {
    const isExam = item.type === "Exam";
    const daysLeft = getDaysLeft(item.date);
    return (
      <Card style={{ marginBottom: 14 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10, flex: 1, minWidth: 0, marginRight: 10 }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: isExam ? colors.dangerBg : colors.accentSoft,
                justifyContent: "center",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              {isExam ? (
                <GraduationCap size={19} color={colors.danger} />
              ) : (
                <ClipboardList size={19} color={colors.accentDark} />
              )}
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: 11, fontFamily: font.semibold, color: colors.muted }}>
                {item.courseCode}
              </Text>
              <Text style={{ fontSize: 15.5, fontFamily: font.semibold, color: colors.ink, marginTop: 1 }}>
                {item.courseTitle}
              </Text>
            </View>
          </View>
          <View
            style={{
              backgroundColor: isExam ? colors.dangerBg : colors.accentSoft,
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 4,
              flexShrink: 0,
            }}
          >
            <Text
              style={{
                fontSize: 10.5,
                fontFamily: font.semibold,
                color: isExam ? colors.danger : colors.accentDark,
              }}
            >
              {item.type}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: 14, gap: 8 }}>
          <Row icon={Clock} text={`${formatDate(item.date)} · ${item.startTime}`} />
          <Row icon={MapPin} text={item.venue} />
        </View>

        {item.notes ? (
          <View
            style={{
              marginTop: 12,
              backgroundColor: colors.backgroundAlt,
              borderRadius: 8,
              padding: 10,
            }}
          >
            <Text style={{ fontSize: 12.5, color: colors.body, fontFamily: font.regular, lineHeight: 18 }}>
              {item.notes}
            </Text>
          </View>
        ) : null}

        <View
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: colors.divider,
          }}
        >
          <Text style={{ fontSize: 12, fontFamily: font.semibold, color: daysLeft <= 3 ? colors.danger : colors.primary }}>
            {daysLeft === 0 ? "Today" : daysLeft > 0 ? `In ${daysLeft} day${daysLeft > 1 ? "s" : ""}` : "Past"}
          </Text>
        </View>
      </Card>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="dark" />

      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        {/* Flat eyebrow — plain background, scrolls with content */}
        <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 24, paddingBottom: 4 }}>
          <Text style={{ fontSize: 11, fontFamily: font.semibold, color: colors.muted, textTransform: "uppercase", letterSpacing: 1 }}>
            Faculty of Computing
          </Text>
        </View>

        {/* Floating hero card */}
        <View style={{ paddingHorizontal: 24, marginTop: 8, marginBottom: 22 }}>
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

            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={{ fontSize: 20, fontFamily: font.bold, color: colors.white, letterSpacing: -0.3 }}>
                  Tests & Exams
                </Text>
                <Text style={{ fontSize: 13, fontFamily: font.regular, color: "rgba(255,255,255,0.8)", marginTop: 6, lineHeight: 18 }}>
                  {upcomingCount > 0
                    ? `${upcomingCount} upcoming assessment${upcomingCount > 1 ? "s" : ""} on your calendar.`
                    : "Nothing on the calendar right now."}
                </Text>
              </View>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "rgba(255,255,255,0.16)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <GraduationCap size={22} color={colors.white} />
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={{ paddingHorizontal: 24 }}>
          {sorted.length > 0 ? (
            sorted.map((item) => <TestCard key={item.id} item={item} />)
          ) : (
            <EmptyState icon={ClipboardList} title="Nothing scheduled" subtitle="Tests and exams will appear here once posted." />
          )}
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

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function getDaysLeft(dateStr) {
  const target = new Date(dateStr + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((target - now) / (1000 * 60 * 60 * 24));
}