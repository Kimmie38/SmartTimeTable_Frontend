import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import {
  Bell,
  Lock,
  LogOut,
  ChevronRight,
  User,
  Shield,
  Info,
  Moon,
  Clock,
  Mail,
} from "lucide-react-native";
import { useAppStore } from "@/utils/appStore";
import { colors, font } from "@/utils/theme";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { student, logoutStudent } = useAppStore();
  const [notifications, setNotifications] = React.useState(true);
  const [reminders, setReminders] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);

  const initials = (student?.fullName || "Student")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    logoutStudent();
    router.replace("/(auth)/login");
  };

  const SettingRow = ({ icon: Icon, label, value, onPress, isSwitch, switchValue, onSwitchChange, danger }) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={isSwitch}
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 20,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: danger ? colors.dangerBg : colors.backgroundAlt,
          justifyContent: "center",
          alignItems: "center",
          marginRight: 12,
        }}
      >
        <Icon size={17} color={danger ? colors.danger : colors.body} />
      </View>
      <View style={{ flex: 1, minWidth: 0, marginRight: 8 }}>
        <Text style={{ fontSize: 14.5, fontFamily: font.medium, color: danger ? colors.danger : colors.ink }}>
          {label}
        </Text>
        {value && (
          <Text style={{ fontSize: 12.5, color: colors.muted, fontFamily: font.regular, marginTop: 1 }}>
            {value}
          </Text>
        )}
      </View>
      {isSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: colors.border, true: colors.primaryLight }}
          thumbColor={switchValue ? colors.primary : "#F9FAFB"}
        />
      ) : (
        <ChevronRight size={18} color={colors.faint} />
      )}
    </TouchableOpacity>
  );

  const SectionLabel = ({ children }) => (
    <Text
      style={{
        fontSize: 11,
        fontFamily: font.semibold,
        color: colors.muted,
        paddingHorizontal: 24,
        marginBottom: 8,
        textTransform: "uppercase",
        letterSpacing: 1,
      }}
    >
      {children}
    </Text>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="dark" />

      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        <View
          style={{
            backgroundColor: colors.primary,
            paddingTop: insets.top + 24,
            paddingBottom: 30,
            paddingHorizontal: 24,
            alignItems: "center",
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: "rgba(255,255,255,0.12)",
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 2.5,
              borderColor: colors.accent,
              marginBottom: 14,
            }}
          >
            <Text style={{ fontSize: 24, fontFamily: font.bold, color: colors.white }}>{initials}</Text>
          </View>
          <Text style={{ fontSize: 19, fontFamily: font.semibold, color: colors.white }}>
            {student?.fullName || "Student"}
          </Text>
          <Text style={{ fontSize: 13.5, color: "rgba(255,255,255,0.75)", fontFamily: font.regular, marginTop: 3 }}>
            {student?.matricNumber}
          </Text>

          <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
            <Chip label={student?.department || "Computer Science"} />
            <Chip label={student?.level ? `Level ${student.level}` : "Level 100"} />
          </View>
        </View>

        <View style={{ marginTop: 24 }}>
          <SectionLabel>Account</SectionLabel>
          <View style={{ borderTopWidth: 1, borderTopColor: colors.divider, borderBottomWidth: 1, borderBottomColor: colors.divider }}>
            <SettingRow icon={User} label="Personal Information" value={student?.fullName} />
            <SettingRow icon={Mail} label="Email Address" value={student?.email} />
          </View>
        </View>

        <View style={{ marginTop: 24 }}>
          <SectionLabel>Preferences</SectionLabel>
          <View style={{ borderTopWidth: 1, borderTopColor: colors.divider, borderBottomWidth: 1, borderBottomColor: colors.divider }}>
            <SettingRow icon={Bell} label="Lecture Notifications" isSwitch switchValue={notifications} onSwitchChange={setNotifications} />
            <SettingRow icon={Clock} label="Class Reminders" value="30 minutes before" isSwitch switchValue={reminders} onSwitchChange={setReminders} />
            <SettingRow icon={Moon} label="Dark Mode" isSwitch switchValue={darkMode} onSwitchChange={setDarkMode} />
          </View>
        </View>

        <View style={{ marginTop: 24 }}>
          <SectionLabel>Security & Support</SectionLabel>
          <View style={{ borderTopWidth: 1, borderTopColor: colors.divider, borderBottomWidth: 1, borderBottomColor: colors.divider }}>
            <SettingRow icon={Lock} label="Change Password" />
            <SettingRow icon={Shield} label="Privacy Policy" />
            <SettingRow icon={Info} label="About Application" value="v2.0.0" />
            <SettingRow icon={LogOut} label="Log Out" onPress={handleLogout} danger />
          </View>
        </View>

        <Text style={{ textAlign: "center", marginTop: 32, fontSize: 12, color: colors.faint, fontFamily: font.regular }}>
          Faculty of Computing Timetable System
        </Text>
      </ScrollView>
    </View>
  );
}

function Chip({ label }) {
  return (
    <View
      style={{
        backgroundColor: "rgba(255,255,255,0.14)",
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 5,
      }}
    >
      <Text style={{ fontSize: 11.5, fontFamily: font.medium, color: colors.white }}>{label}</Text>
    </View>
  );
}
