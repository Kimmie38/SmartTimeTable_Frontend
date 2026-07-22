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
import { ChevronLeft, User, Mail, Hash, Lock, Layers, Info, KeyRound, Eye, EyeOff } from "lucide-react-native";
import { colors, font } from "@/utils/theme";
import { API_BASE_URL } from "@/utils/config";

const LEVELS = [100, 200, 300, 400];

// --- real admin registration against the backend ---
async function registerAdmin(data) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: data.fullName,
        email: data.email,
        matricNumber: data.matricNumber,
        level: data.level,
        password: data.password,
        registrationKey: data.registrationKey,
      }),
    });
    const result = await res.json();
    if (!result.success) {
      return { ok: false, error: result.message || "Registration failed." };
    }
    await AsyncStorage.setItem("@smtt/admin_token", result.data.token);
    await AsyncStorage.setItem("@smtt/admin_profile", JSON.stringify(result.data));
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: "Could not reach the server. Check your connection and try again.",
    };
  }
}

export default function AdminSignupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [matricNumber, setMatricNumber] = useState("");
  const [level, setLevel] = useState(null);
  const [registrationKey, setRegistrationKey] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError("");
    if (
      !fullName.trim() ||
      !email.trim() ||
      !matricNumber.trim() ||
      !registrationKey.trim() ||
      !password
    ) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!level) {
      setError("Select the level you'll be managing.");
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
    const res = await registerAdmin({
      fullName: fullName.trim(),
      email: email.trim(),
      matricNumber: matricNumber.trim(),
      level,
      registrationKey: registrationKey.trim(),
      password,
    });
    setLoading(false);
    if (res.ok) {
      router.replace("/admin/dashboard");
    } else {
      setError(res.error);
    }
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

      <KeyboardAwareScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraHeight={24}
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

            {/* Level selector — determines which students see what this admin creates */}
            <View>
              <Text style={{ fontFamily: font.medium, fontSize: 13, color: colors.ink, marginBottom: 6 }}>
                Level You'll Manage
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {LEVELS.map((lvl) => {
                  const selected = level === lvl;
                  return (
                    <TouchableOpacity
                      key={lvl}
                      onPress={() => setLevel(lvl)}
                      activeOpacity={0.85}
                      style={{
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        borderWidth: 1,
                        borderColor: selected ? colors.primary : colors.accentLight,
                        backgroundColor: selected ? colors.primary : colors.white,
                        borderRadius: 12,
                        paddingVertical: 12,
                      }}
                    >
                      <Layers size={14} color={selected ? colors.white : colors.muted} />
                      <Text
                        style={{
                          fontFamily: font.semibold,
                          fontSize: 13.5,
                          color: selected ? colors.white : colors.ink,
                        }}
                      >
                        {lvl}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={{ fontSize: 11.5, color: colors.muted, fontFamily: font.regular, marginTop: 6 }}>
                Each level allows a maximum of 2 admin accounts.
              </Text>
            </View>

            <Field label="Registration Key" icon={KeyRound}>
              <TextInput
                value={registrationKey}
                onChangeText={setRegistrationKey}
                placeholder="Provided by your project setup"
                placeholderTextColor={colors.faint}
                secureTextEntry
                style={fieldInputStyle}
              />
            </Field>

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
                {showPassword ? (
                  <EyeOff size={18} color={colors.muted} />
                ) : (
                  <Eye size={18} color={colors.muted} />
                )}
              </TouchableOpacity>
            </Field>

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
              Already have a student account? Enter the same email and password here to link
              admin access to it — you'll be able to sign in to both the student and admin
              portals with one account. Your existing matric number will carry over as your
              admin login too.
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
      </KeyboardAwareScrollView>
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