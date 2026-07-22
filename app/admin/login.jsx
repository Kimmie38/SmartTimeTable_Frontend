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
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChevronLeft, UserCog, Lock, Eye, EyeOff } from "lucide-react-native";
import { colors, font } from "@/utils/theme";
import { API_BASE_URL } from "@/utils/config";

// --- real admin login against the backend ---
async function loginAdmin(email, password) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!data.success) {
      return { ok: false, error: data.message || "Invalid email or password." };
    }
    await AsyncStorage.setItem("@smtt/admin_token", data.data.token);
    await AsyncStorage.setItem("@smtt/admin_profile", JSON.stringify(data.data));
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: "Could not reach the server. Check your connection and try again.",
    };
  }
}

export default function AdminLoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [matricNumber, setMatricNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!matricNumber.trim() || !password) {
      setError("Enter your admin matric number and password.");
      return;
    }
    setLoading(true);
    const res = await loginAdmin(matricNumber.trim(), password);
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
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "rgba(255,255,255,0.1)",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <ChevronLeft size={20} color={colors.white} />
        </TouchableOpacity>

        {/* Logo + heading */}
        <View style={{ alignItems: "center", marginBottom: 32, marginTop: 20 }}>
          <View
            style={{
              width: 84,
              height: 84,
              borderRadius: 22,
              backgroundColor: colors.white,
              justifyContent: "center",
              alignItems: "center",
              padding: 10,
            }}
          >
            <Image
              source={require("../../assets/images/university-logo.png")}
              style={{ width: 64, height: 64 }}
              resizeMode="contain"
            />
          </View>
          <Text style={{ fontSize: 22, fontFamily: font.bold, color: colors.white, marginTop: 18 }}>
            Admin Portal
          </Text>
          <Text
            style={{
              fontSize: 13.5,
              color: "rgba(255,255,255,0.7)",
              fontFamily: font.regular,
              marginTop: 6,
              textAlign: "center",
            }}
          >
            Manage lectures, attendance history and assessments{"\n"}for the Computer Science department.
          </Text>
        </View>

        {/* Form card */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 20,
            padding: 24,
          }}
        >
          <View style={{ gap: 18 }}>
            <Field label="Admin Matric Number" icon={UserCog}>
              <TextInput
                value={matricNumber}
                onChangeText={setMatricNumber}
                placeholder="2025/CP/CSC/0036"
                placeholderTextColor={colors.faint}
                autoCapitalize="characters"
                style={fieldInputStyle}
              />
            </Field>

            <Field label="Password" icon={Lock}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
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
          </View>

          {error ? (
            <Text style={{ color: colors.danger, fontSize: 13, fontFamily: font.medium, marginTop: 14 }}>
              {error}
            </Text>
          ) : null}

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
            style={{
              marginTop: 24,
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
                Sign In to Dashboard
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 20 }}>
          <Text style={{ color: "rgba(255,255,255,0.7)", fontFamily: font.regular, fontSize: 14 }}>
            New administrator?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.push("/admin/signup")}>
            <Text style={{ color: colors.accent, fontFamily: font.semibold, fontSize: 14 }}>
              Create an account
            </Text>
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