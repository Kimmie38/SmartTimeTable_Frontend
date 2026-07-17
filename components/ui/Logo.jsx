import React from "react";
import { View, Text, Image } from "react-native";
import { colors, font } from "@/utils/theme";

const LOGO_SOURCE = require("../../assets/images/university-logo.png");

// Renders the official Federal University of Lafia seal.
// size: "sm" | "md" | "lg"
export default function Logo({ size = "md" }) {
  const dims = {
    sm: 44,
    md: 68,
    lg: 104,
  }[size];

  return (
    <Image
      source={LOGO_SOURCE}
      style={{ width: dims, height: dims }}
      resizeMode="contain"
    />
  );
}

export function BrandWordmark({ align = "center", light = false }) {
  return (
    <View style={{ alignItems: align === "center" ? "center" : "flex-start" }}>
      <Text
        style={{
          fontSize: 17,
          fontFamily: font.bold,
          color: light ? colors.white : colors.ink,
          letterSpacing: -0.2,
          textAlign: align === "center" ? "center" : "left",
        }}
      >
        Federal University of Lafia
      </Text>
      <Text
        style={{
          fontSize: 11,
          fontFamily: font.medium,
          color: light ? "rgba(255,255,255,0.75)" : colors.muted,
          letterSpacing: 1.2,
          textTransform: "uppercase",
          marginTop: 2,
        }}
      >
        Faculty of Computing
      </Text>
    </View>
  );
}
