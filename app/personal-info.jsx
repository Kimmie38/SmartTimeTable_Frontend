import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { ChevronLeft, User, Mail, Hash, Building2, GraduationCap, Calendar } from "lucide-react-native";
import { useAppStore } from "@/utils/appStore";
import { colors, font } from "@/utils/theme";

export default function PersonalInfoScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { student } = useAppStore();

  const Row = ({ icon: Icon, label, value }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
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
          backgroundColor: colors.backgroundAlt,
          justifyContent: "center",
          alignItems: "center",
          marginRight: 12,
        }}
      >
        <Icon size={17} color={colors.body} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 12, fontFamily: font.medium, color: colors.muted }}>{label}</Text>
        <Text style={{ fontSize: 15, fontFamily: font.medium, color: colors.ink, marginTop: 2 }}>
          {value || "—"}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="dark" />
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 24,
          paddingBottom: 12,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ChevronLeft size={20} color={colors.ink} />
        </TouchableOpacity>
        <Text style={{ marginLeft: 12, fontSize: 18, fontFamily: font.semibold, color: colors.ink }}>
          Personal Information
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text
          style={{
            fontSize: 12.5,
            color: colors.muted,
            fontFamily: font.regular,
            paddingHorizontal: 24,
            marginTop: 8,
            marginBottom: 16,
          }}
        >
          These details were set when you registered and can't be edited here.
        </Text>

        <View style={{ borderTopWidth: 1, borderTopColor: colors.divider, borderBottomWidth: 1, borderBottomColor: colors.divider }}>
          <Row icon={User} label="Full Name" value={student?.fullName} />
          <Row icon={Mail} label="Email Address" value={student?.email} />
          <Row icon={Hash} label="Matric Number" value={student?.matricNumber} />
          <Row icon={Building2} label="Department" value={student?.department} />
          <Row icon={GraduationCap} label="Level" value={student?.level ? `Level ${student.level}` : null} />
          <Row icon={Calendar} label="Semester" value={student?.semester} />
        </View>
      </ScrollView>
    </View>
  );
}