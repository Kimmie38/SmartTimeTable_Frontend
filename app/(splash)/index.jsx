import React, { useEffect, useRef } from "react";
import { View, Text, Image, Animated, Easing } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors, font } from "@/utils/theme";

export default function SplashScreen() {
  const router = useRouter();
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const barWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          tension: 60,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(barWidth, {
        toValue: 120,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();

    const timer = setTimeout(() => {
      router.replace("/(auth)/login");
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.primary,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <StatusBar style="light" />
      <Animated.View style={{ opacity, transform: [{ scale }], alignItems: "center" }}>
        <View
          style={{
            width: 128,
            height: 128,
            borderRadius: 28,
            backgroundColor: "rgba(255,255,255,0.94)",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 20,
            padding: 10,
          }}
        >
          <Image
            source={require("../../assets/images/university-logo.png")}
            style={{ width: 108, height: 108 }}
            resizeMode="contain"
          />
        </View>
        <Text
          style={{
            fontSize: 20,
            fontFamily: font.bold,
            color: colors.white,
            letterSpacing: -0.3,
            textAlign: "center",
          }}
        >
          Federal University of Lafia
        </Text>
        <Text
          style={{
            fontSize: 12,
            fontFamily: font.medium,
            color: "rgba(255,255,255,0.75)",
            letterSpacing: 1.5,
            textTransform: "uppercase",
            marginTop: 6,
          }}
        >
          Faculty of Computing
        </Text>
      </Animated.View>
      <Animated.View
        style={{
          width: barWidth,
          height: 3,
          borderRadius: 2,
          backgroundColor: colors.accent,
          marginTop: 40,
        }}
      />
    </View>
  );
}