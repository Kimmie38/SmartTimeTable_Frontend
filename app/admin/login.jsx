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
import { ChevronLeft, UserCog, Lock } from "lucide-react-native";
import { colors, font } from "@/utils/theme";

// --- mock admin login, swap for real API/store later ---
function loginAdmin(username, password) {
  if (username.trim().toUpperCase() === "ADM/CSC/001" && password === "admin123") {
    return { ok: true };
  }
  return { ok: false, error: "Invalid staff ID or password." };
}

export default function AdminLoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setError("");
    if (!username.trim() || !password) {
      setError("Enter your admin username and password.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const res = loginAdmin(username, password);
      setLoading(false);
      if (res.ok) {
        router.replace("/admin/dashboard");
      } else {
        setError(res.error);
      }
    }, 400);
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
            <Field label="Staff ID / Matric Number" icon={UserCog}>
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="ADM/CSC/001"
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
                secureTextEntry
                style={fieldInputStyle}
              />
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

        <Text
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.5)",
            fontFamily: font.regular,
            textAlign: "center",
            marginTop: 16,
          }}
        >
          Demo login · ADM/CSC/001 · admin123
        </Text>
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