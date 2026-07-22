import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Hash, Lock, ShieldCheck, Eye, EyeOff } from "lucide-react-native";
import { colors, font } from "@/utils/theme";
import { API_BASE_URL } from "@/utils/config";

// --- real student login against the backend ---
async function loginStudent(matricNumber: string, password: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matricNumber, password }),
    });
    const data = await res.json();
    if (!data.success) {
      return { ok: false, error: data.message || "Invalid matric number or password." };
    }
    await AsyncStorage.setItem("@smtt/student_token", data.data.token);
    await AsyncStorage.setItem("@smtt/student_profile", JSON.stringify(data.data));
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: "Could not reach the server. Check your connection and try again.",
    };
  }
}

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [matricNumber, setMatricNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!matricNumber.trim() || !password) {
      setError("Enter your matric number and password.");
      return;
    }
    setLoading(true);
    const res = await loginStudent(matricNumber.trim(), password);
    setLoading(false);
    if (res.ok) {
      router.replace("/(tabs)/home");
    } else {
      setError(res.error!);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar style="dark" />
      <KeyboardAwareScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 32,
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: 24,
        }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraHeight={24}
      >
        {/* Logo */}
        <View style={{ alignItems: "center", marginBottom: 36 }}>
         <View
            style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                backgroundColor: colors.white,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1,
                borderColor: colors.accentLight,
                padding: 8,
            }}
            >
            <Image
                source={require("../../assets/images/university-logo.png")}
                style={{ width: 56, height: 56 }}
                resizeMode="contain"
            />
            </View>
          <Text
            style={{
              marginTop: 14,
              fontFamily: font.bold,
              fontSize: 15,
              color: colors.ink,
              letterSpacing: 0.5,
            }}
          >
            Federal University of Lafia
          </Text>
        </View>

        {/* Heading */}
        <View style={{ marginBottom: 28 }}>
          <Text style={{ fontSize: 26, fontFamily: font.bold, color: colors.ink, letterSpacing: -0.5 }}>
            Welcome back
          </Text>
          <Text style={{ fontSize: 14.5, color: colors.muted, fontFamily: font.regular, marginTop: 6 }}>
            Sign in with your matric number to view your lecture schedule.
          </Text>
        </View>

        {/* Fields */}
        <View style={{ gap: 18 }}>
          <View>
            <Text style={{ fontFamily: font.medium, fontSize: 13, color: colors.ink, marginBottom: 6 }}>
              Matric Number
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
              <Hash size={18} color={colors.muted} />
              <TextInput
                value={matricNumber}
                onChangeText={setMatricNumber}
                placeholder="2025/CP/CSC/0036"
                placeholderTextColor={colors.faint}
                autoCapitalize="characters"
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  paddingHorizontal: 10,
                  fontFamily: font.regular,
                  fontSize: 15,
                  color: colors.ink,
                }}
              />
            </View>
          </View>

          <View>
            <Text style={{ fontFamily: font.medium, fontSize: 13, color: colors.ink, marginBottom: 6 }}>
              Password
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
              <Lock size={18} color={colors.muted} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.faint}
                secureTextEntry={!showPassword}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  paddingHorizontal: 10,
                  fontFamily: font.regular,
                  fontSize: 15,
                  color: colors.ink,
                }}
              />
              <TouchableOpacity onPress={() => setShowPassword((s) => !s)}>
                {showPassword ? (
                  <EyeOff size={18} color={colors.muted} />
                ) : (
                  <Eye size={18} color={colors.muted} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {error ? (
          <Text style={{ color: colors.danger, fontSize: 13, fontFamily: font.medium, marginTop: 14 }}>
            {error}
          </Text>
        ) : null}

        <TouchableOpacity style={{ alignSelf: "flex-end", marginTop: 14 }}>
          <Text style={{ fontSize: 13.5, color: colors.primary, fontFamily: font.medium }}>
            Forgot password?
          </Text>
        </TouchableOpacity>

        {/* Sign in button */}
        <TouchableOpacity
          onPress={handleLogin}
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
              Sign In
            </Text>
          )}
        </TouchableOpacity>

        <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 24 }}>
          <Text style={{ color: colors.muted, fontFamily: font.regular, fontSize: 14 }}>
            New student?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
            <Text style={{ color: colors.primary, fontFamily: font.semibold, fontSize: 14 }}>
              Create an account
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }} />

        <TouchableOpacity
          onPress={() => router.push("/admin/login")}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            alignSelf: "center",
            marginTop: 28,
            paddingVertical: 10,
            paddingHorizontal: 18,
            backgroundColor: colors.accentSoft,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: colors.accentLight,
          }}
        >
          <ShieldCheck size={14} color={colors.accentDark} />
          <Text style={{ fontSize: 12.5, color: colors.accentDark, fontFamily: font.semibold }}>
            Staff / Admin Portal
          </Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </KeyboardAvoidingView>
  );
}