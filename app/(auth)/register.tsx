import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChevronLeft, User, Mail, Hash, Lock, Building2, Eye, EyeOff } from "lucide-react-native";
import { colors, font } from "@/utils/theme";
import { API_BASE_URL } from "@/utils/config";

// --- local constants ---
const DEPARTMENT = "Computer Science";
const LEVELS = ["100", "200", "300", "400"];
const SEMESTERS = ["First Semester", "Second Semester"];


// UI shows "First Semester" / "Second Semester" — backend only accepts "First" / "Second"
function semesterToBackend(uiValue: string) {
  return uiValue.startsWith("First") ? "First" : "Second";
}

// --- real registration against the backend ---
async function registerStudent(data: {
  fullName: string;
  email: string;
  matricNumber: string;
  level: string;
  semester: string;
  password: string;
}) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: data.fullName,
        email: data.email,
        matricNumber: data.matricNumber,
        level: parseInt(data.level, 10),
        semester: semesterToBackend(data.semester),
        password: data.password,
      }),
    });
    const result = await res.json();
    if (!result.success) {
      return { ok: false, error: result.message || "Registration failed." };
    }
    await AsyncStorage.setItem("@smtt/student_token", result.data.token);
    await AsyncStorage.setItem("@smtt/student_profile", JSON.stringify(result.data));
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: "Could not reach the server. Check your connection and try again.",
    };
  }
}

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [matricNumber, setMatricNumber] = useState("");
  const [level, setLevel] = useState("100");
  const [semester, setSemester] = useState(SEMESTERS[0]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
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
    const res = await registerStudent({
      fullName: fullName.trim(),
      email: email.trim(),
      matricNumber: matricNumber.trim(),
      level,
      semester,
      password,
    });
    setLoading(false);
    if (res.ok) {
      router.replace("/(tabs)/home");
    } else {
      setError(res.error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar style="dark" />

      {/* Back button */}
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
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 24,
        }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraHeight={24}
      >
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 26, fontFamily: font.bold, color: colors.ink, letterSpacing: -0.5 }}>
            Create your account
          </Text>
          <Text style={{ fontSize: 14.5, color: colors.muted, fontFamily: font.regular, marginTop: 6 }}>
            Register as a Computer Science student to get your personalized timetable.
          </Text>
        </View>

        <View style={{ gap: 18 }}>
          {/* Full Name */}
          <Field label="Full Name" icon={User}>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="e.g. John Doe"
              placeholderTextColor={colors.faint}
              autoCapitalize="words"
              style={fieldInputStyle}
            />
          </Field>

          {/* Email */}
          <Field label="Email Address" icon={Mail}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="student@university.edu"
              placeholderTextColor={colors.faint}
              keyboardType="email-address"
              autoCapitalize="none"
              style={fieldInputStyle}
            />
          </Field>

          {/* Matric Number */}
          <Field label="Matric Number" icon={Hash}>
            <TextInput
              value={matricNumber}
              onChangeText={setMatricNumber}
              placeholder="2025/CP/CSC/0036"
              placeholderTextColor={colors.faint}
              autoCapitalize="characters"
              style={fieldInputStyle}
            />
          </Field>

          {/* Locked Department field */}
          <View>
            <Text style={{ fontFamily: font.medium, fontSize: 13, color: colors.ink, marginBottom: 6 }}>
              Department
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 14,
                backgroundColor: colors.accentSoft,
              }}
            >
              <Building2 size={18} color={colors.muted} />
              <Text
                style={{
                  flex: 1,
                  marginLeft: 10,
                  fontFamily: font.regular,
                  fontSize: 15,
                  color: colors.muted,
                }}
              >
                {DEPARTMENT}
              </Text>
            </View>
          </View>

          {/* Level chip select */}
          <ChipSelect label="Level" options={LEVELS} value={level} onChange={setLevel} />

          {/* Semester chip select */}
          <ChipSelect label="Semester" options={SEMESTERS} value={semester} onChange={setSemester} />

          {/* Password */}
          <Field label="Password" icon={Lock}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Minimum 6 characters"
              placeholderTextColor={colors.faint}
              secureTextEntry={!showPassword}
              style={fieldInputStyle}
            />
            <TouchableOpacity onPress={() => setShowPassword((s) => !s)}>
                            {showConfirmPassword? (
                              <EyeOff size={18} color={colors.muted} />
                            ) : (
                              <Eye size={18} color={colors.muted} />
                            )}
            </TouchableOpacity>
          </Field>

          {/* Confirm Password */}
          <Field label="Confirm Password" icon={Lock}>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter password"
              placeholderTextColor={colors.faint}
              secureTextEntry={!showConfirmPassword}
              style={fieldInputStyle}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword((s) => !s)}>
                            {showConfirmPassword ? (
                              <EyeOff size={18} color={colors.muted} />
                            ) : (
                              <Eye size={18} color={colors.muted} />
                            )}
            </TouchableOpacity>
          </Field>
        </View>

        {error ? (
          <Text style={{ color: colors.danger, fontSize: 13, fontFamily: font.medium, marginTop: 16 }}>
            {error}
          </Text>
        ) : null}

        <TouchableOpacity
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.85}
          style={{
            marginTop: 28,
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
              Create Account
            </Text>
          )}
        </TouchableOpacity>

        <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 20 }}>
          <Text style={{ color: colors.muted, fontFamily: font.regular, fontSize: 14 }}>
            Already have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}> 
            <Text style={{ color: colors.primary, fontFamily: font.semibold, fontSize: 14 }}>
              Sign in
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </KeyboardAvoidingView>
  );
}

// --- small local helpers, kept in-file on purpose ---

const fieldInputStyle = {
  flex: 1,
  paddingVertical: 14,
  paddingHorizontal: 10,
  fontFamily: font.regular,
  fontSize: 15,
  color: colors.ink,
} as const;

function Field({ label, icon: Icon, children }: { label: string; icon: any; children: React.ReactNode }) {
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

function ChipSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View>
      <Text style={{ fontFamily: font.medium, fontSize: 13, color: colors.ink, marginBottom: 6 }}>
        {label}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {options.map((opt) => {
          const selected = opt === value;
          return (
            <TouchableOpacity
              key={opt}
              onPress={() => onChange(opt)}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: selected ? colors.primary : colors.border,
                backgroundColor: selected ? colors.primary : colors.white,
              }}
            >
              <Text
                style={{
                  fontFamily: font.medium,
                  fontSize: 13.5,
                  color: selected ? colors.white : colors.ink,
                }}
              >
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}