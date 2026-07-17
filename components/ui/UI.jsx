import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { colors, font, radius, spacing, shadow, statusStyles } from "@/utils/theme";

export function Card({ children, style, ...rest }) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing.lg,
        },
        shadow.card,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

export function StatusBadge({ status, size = "md" }) {
  const s = statusStyles[status] || statusStyles.Pending;
  const dot = size === "sm" ? 5 : 6;
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: s.bg,
        borderWidth: 1,
        borderColor: s.border,
        borderRadius: radius.pill,
        paddingHorizontal: 10,
        paddingVertical: 5,
        alignSelf: "flex-start",
      }}
    >
      <View style={{ width: dot, height: dot, borderRadius: dot, backgroundColor: s.color }} />
      <Text
        style={{
          fontSize: size === "sm" ? 10 : 11,
          fontFamily: font.semibold,
          color: s.color,
          letterSpacing: 0.2,
        }}
      >
        {s.label}
      </Text>
    </View>
  );
}

export function Pill({ label, active, onPress, style }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        {
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: radius.pill,
          backgroundColor: active ? colors.primary : colors.backgroundAlt,
          borderWidth: 1,
          borderColor: active ? colors.primary : colors.border,
        },
        style,
      ]}
    >
      <Text
        style={{
          fontSize: 12,
          fontFamily: active ? font.semibold : font.medium,
          color: active ? colors.white : colors.body,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function PrimaryButton({ label, onPress, loading, disabled, icon: Icon, style, variant = "primary" }) {
  const isGhost = variant === "ghost";
  const isDanger = variant === "danger";
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[
        {
          height: 52,
          borderRadius: radius.md,
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "row",
          gap: 8,
          backgroundColor: isGhost ? "transparent" : isDanger ? colors.danger : colors.primary,
          borderWidth: isGhost ? 1.5 : 0,
          borderColor: colors.primary,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isGhost ? colors.primary : colors.white} />
      ) : (
        <>
          {Icon ? <Icon size={18} color={isGhost ? colors.primary : colors.white} /> : null}
          <Text
            style={{
              color: isGhost ? colors.primary : colors.white,
              fontSize: 15,
              fontFamily: font.semibold,
            }}
          >
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

export function ScreenHeader({ eyebrow, title, right, subtitle }) {
  return (
    <View>
      {eyebrow ? (
        <Text
          style={{
            fontSize: 11,
            fontFamily: font.semibold,
            color: colors.primary,
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 4,
          }}
        >
          {eyebrow}
        </Text>
      ) : null}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text
          style={{
            fontSize: 24,
            fontFamily: font.bold,
            color: colors.ink,
            letterSpacing: -0.5,
            flex: 1,
          }}
        >
          {title}
        </Text>
        {right}
      </View>
      {subtitle ? (
        <Text style={{ fontSize: 13, fontFamily: font.regular, color: colors.muted, marginTop: 4 }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

export function IconCircle({ icon: Icon, size = 36, bg = colors.backgroundAlt, color = colors.body, iconSize = 17 }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Icon size={iconSize} color={color} />
    </View>
  );
}

export function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <View style={{ alignItems: "center", paddingVertical: spacing.xxxl * 1.3, paddingHorizontal: spacing.xl }}>
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.backgroundAlt,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        {Icon ? <Icon size={26} color={colors.faint} /> : null}
      </View>
      <Text style={{ fontSize: 15, fontFamily: font.semibold, color: colors.inkSoft, marginBottom: 4 }}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={{ fontSize: 13, fontFamily: font.regular, color: colors.muted, textAlign: "center" }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

export function SectionLabel({ children, style }) {
  return (
    <Text
      style={[
        {
          fontSize: 11,
          fontFamily: font.semibold,
          color: colors.muted,
          textTransform: "uppercase",
          letterSpacing: 1,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function FieldLabel({ children }) {
  return (
    <Text
      style={{
        fontSize: 12,
        fontFamily: font.medium,
        color: colors.body,
        marginBottom: 8,
        textTransform: "uppercase",
        letterSpacing: 0.5,
      }}
    >
      {children}
    </Text>
  );
}
