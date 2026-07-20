import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ChevronLeft, User, Mail, Hash, Lock, Briefcase, Info } from "lucide-react-native";
import { colors, font } from "@/utils/theme";

// --- mock admin registration, swap for real API/store later ---
function registerAdmin(data) {
  return { ok: true };
}

export default function AdminSignupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [matricNumber, setMatricNumber] = useState("");
  const [title, setTitle] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = () => {
    setError("");
    if (!fullName.trim() || !email.trim() || !matricNumber.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const res = registerAdmin({
        fullName: fullName.trim(),
        email: email.trim(),
        matricNumber: matricNumber.trim(),
        title: title.trim(),
        password,
      });
      setLoading(false);
      if (res.ok) {
        router.replace("/admin/dashboard");
      } else {
        setError("Something went wrong. Try again.");
      }
    }, 400);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.primaryDarker }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar style="light" />

      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 24, paddingBottom: 8 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "rgba(255,255,255,0.1)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ChevronLeft size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 24, fontFamily: font.bold, color: colors.white, letterSpacing: -0.5 }}>
            Create admin account
          </Text>
          <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", fontFamily: font.regular, marginTop: 6 }}>
            Register to manage lectures, timetables and assessments.
          </Text>
        </View>

        <View style={{ backgroundColor: colors.surface, borderRadius: 20, padding: 24 }}>
          <View style={{ gap: 18 }}>
            <Field label="Full Name" icon={User}>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="e.g. Dr. Ada Obiora"
                placeholderTextColor={colors.faint}
                autoCapitalize="words"
                style={fieldInputStyle}
              />
            </Field>

            <Field label="Email Address" icon={Mail}>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="staff@university.edu"
                placeholderTextColor={colors.faint}
                keyboardType="email-address"
                autoCapitalize="none"
                style={fieldInputStyle}
              />
            </Field>

            <Field label="Staff ID / Matric Number" icon={Hash}>
              <TextInput
                value={matricNumber}
                onChangeText={setMatricNumber}
                placeholder="ADM/CSC/001"
                placeholderTextColor={colors.faint}
                autoCapitalize="characters"
                style={fieldInputStyle}
              />
            </Field>

            <Field label="Role / Title (optional)" icon={Briefcase}>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Course Coordinator"
                placeholderTextColor={colors.faint}
                autoCapitalize="words"
                style={fieldInputStyle}
              />
            </Field>

            <Field label="Password" icon={Lock}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Minimum 6 characters"
                placeholderTextColor={colors.faint}
                secureTextEntry
                style={fieldInputStyle}
              />
            </Field>

            <Field label="Confirm Password" icon={Lock}>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter password"
                placeholderTextColor={colors.faint}
                secureTextEntry
                style={fieldInputStyle}
              />
            </Field>
          </View>

          {error ? (
            <Text style={{ color: colors.danger, fontSize: 13, fontFamily: font.medium, marginTop: 16 }}>
              {error}
            </Text>
          ) : null}

          <View
            style={{
              flexDirection: "row",
              gap: 8,
              backgroundColor: colors.primarySoft,
              borderRadius: 10,
              padding: 12,
              marginTop: 18,
              alignItems: "flex-start",
            }}
          >
            <Info size={15} color={colors.primary} style={{ marginTop: 1 }} />
            <Text style={{ flex: 1, fontSize: 12, color: colors.body, fontFamily: font.regular, lineHeight: 17 }}>
              Already have a student account? Enter the same ID and password here to link admin
              access to it — you'll be able to sign in to both the student and admin portals with
              one account.
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
            style={{
              marginTop: 20,
              backgroundColor: colors.primary,
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: "center",
              justifyContent: "center",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={{ color: colors.white, fontFamily: font.semibold, fontSize: 15.5 }}>
                Create Admin Account
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 20 }}>
          <Text style={{ color: "rgba(255,255,255,0.7)", fontFamily: font.regular, fontSize: 14 }}>
            Already an admin?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: colors.accent, fontFamily: font.semibold, fontSize: 14 }}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// --- local helpers, kept in-file on purpose ---

const fieldInputStyle = {
  flex: 1,
  paddingVertical: 14,
  paddingHorizontal: 10,
  fontFamily: font.regular,
  fontSize: 15,
  color: colors.ink,
};

function Field({ label, icon: Icon, children }) {
  return (
    <View>
      <Text style={{ fontFamily: font.medium, fontSize: 13, color: colors.ink, marginBottom: 6 }}>
        {label}
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderColor: colors.accentLight,
          borderRadius: 14,
          paddingHorizontal: 14,
          backgroundColor: colors.white,
        }}
      >
        <Icon size={18} color={colors.muted} />
        {children}
      </View>
    </View>
  );
}