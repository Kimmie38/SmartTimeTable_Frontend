import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import {
  CalendarClock,
  ClipboardList,
  History,
  LogOut,
  ChevronRight,
  Activity,
  CheckCircle2,
  Hourglass,
  UploadCloud,
} from "lucide-react-native";
import { colors, font, getTodayName, formatFullDate, WEEKDAYS } from "@/utils/theme";

// --- mock data, swap for real store/API later ---
const adminUser = {
  fullName: "Dr. Ada Obiora",
  title: "Course Coordinator",
  roles: ["admin"],
};

const timetable = {
  Monday: [
    { id: "1", status: "Ongoing" },
    { id: "2", status: "Pending" },
  ],
  Wednesday: [{ id: "3", status: "Pending" }],
};

const history = [{ id: "h1" }, { id: "h2" }, { id: "h3" }, { id: "h4" }, { id: "h5" }];

function logoutAdmin() {}

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const today = getTodayName();
  const todaysLectures = WEEKDAYS.includes(today) ? timetable[today] || [] : [];
  const ongoing = todaysLectures.filter((l) => l.status === "Ongoing").length;
  const pending = todaysLectures.filter((l) => l.status === "Pending").length;

  const initials = adminUser.fullName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    logoutAdmin();
    router.replace("/(auth)/login");
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          backgroundColor: colors.primaryDarker,
          paddingTop: insets.top + 20,
          paddingBottom: 32,
          paddingHorizontal: 24,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1, marginRight: 12 }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: "rgba(255,255,255,0.12)",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 14,
              }}
            >
              <Text style={{ fontFamily: font.semibold, fontSize: 16, color: colors.white }}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 17, fontFamily: font.semibold, color: colors.white }} numberOfLines={1}>
                {adminUser.fullName}
              </Text>
              <Text
                style={{ fontSize: 13.5, fontFamily: font.regular, color: "rgba(255,255,255,0.65)", marginTop: 2 }}
                numberOfLines={1}
              >
                {adminUser.title}
                {adminUser.roles?.includes("student") ? " · Student & Admin" : ""}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: "rgba(255,255,255,0.1)",
              justifyContent: "center",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <LogOut size={18} color={colors.white} />
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 28 }}>
          <Text
            style={{
              fontSize: 12,
              fontFamily: font.semibold,
              color: "rgba(255,255,255,0.55)",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            {formatFullDate()}
          </Text>
          <Text style={{ fontSize: 28, fontFamily: font.bold, color: colors.white, marginTop: 6, letterSpacing: -0.5 }}>
            Computer Science Overview
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
        {/* Stat cards */}
        <View style={{ flexDirection: "row", gap: 14, marginTop: 24, marginBottom: 32 }}>
          <StatCard icon={Activity} label="Ongoing now" value={ongoing} tint={colors.success} bg={colors.successBg} />
          <StatCard icon={Hourglass} label="Pending today" value={pending} tint={colors.warning} bg={colors.warningBg} />
          <StatCard icon={CheckCircle2} label="Complete" value={history.length} tint={colors.info} bg={colors.infoBg} />
        </View>

        <Text
          style={{
            fontSize: 12,
            fontFamily: font.semibold,
            color: colors.muted,
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 14,
          }}
        >
          Manage
        </Text>

        <ActionRow
          icon={UploadCloud}
          title="Upload Timetable"
          subtitle="Add courses to the weekly schedule"
          tint={colors.primary}
          bg={colors.primaryLight}
          onPress={() => router.push("/admin/upload-timetable")}
        />
        <ActionRow
          icon={CalendarClock}
          title="Manage Lectures"
          subtitle="Start, cancel, or complete today's lectures"
          tint={colors.success}
          bg={colors.successBg}
          onPress={() => router.push("/admin/lectures")}
        />
        <ActionRow
          icon={ClipboardList}
          title="Tests & Exams"
          subtitle="Upload upcoming assessments"
          tint={colors.accentDark}
          bg={colors.accentSoft}
          onPress={() => router.push("/admin/tests")}
        />
        <ActionRow
          icon={History}
          title="Attendance History"
          subtitle={`${history.length} completed record${history.length === 1 ? "" : "s"}`}
          tint={colors.info}
          bg={colors.infoBg}
          onPress={() => router.push("/admin/lectures")}
          last
        />
      </ScrollView>
    </View>
  );
}

// --- local helpers, kept in-file on purpose ---

const cardShadow = {
  shadowColor: "#0F2A22",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.06,
  shadowRadius: 12,
  elevation: 2,
};

function StatCard({ icon: Icon, label, value, tint, bg }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: 20,
        paddingVertical: 20,
        paddingHorizontal: 16,
        ...cardShadow,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: bg,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Icon size={18} color={tint} />
      </View>
      <Text style={{ fontSize: 28, fontFamily: font.bold, color: colors.ink }}>{value}</Text>
      <Text style={{ fontSize: 13, fontFamily: font.medium, color: colors.muted, marginTop: 4, lineHeight: 17 }}>
        {label}
      </Text>
    </View>
  );
}

function ActionRow({ icon: Icon, title, subtitle, onPress, tint, bg, last }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.surface,
          borderRadius: 18,
          padding: 16,
          marginBottom: last ? 0 : 14,
          ...cardShadow,
        }}
      >
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 15,
            backgroundColor: bg,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 16,
          }}
        >
          <Icon size={24} color={tint} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontFamily: font.semibold, color: colors.ink }}>{title}</Text>
          <Text style={{ fontSize: 13, fontFamily: font.regular, color: colors.muted, marginTop: 3 }}>
            {subtitle}
          </Text>
        </View>
        <ChevronRight size={20} color={colors.faint} />
      </View>
    </TouchableOpacity>
  );
}