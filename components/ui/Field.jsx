import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Eye, EyeOff, ChevronDown } from "lucide-react-native";
import { colors, font, radius } from "@/utils/theme";
import { FieldLabel } from "./UI";

export function TextField({
  label,
  icon: Icon,
  secure,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize = "none",
  error,
}) {
  const [hidden, setHidden] = useState(!!secure);
  const [focused, setFocused] = useState(false);

  return (
    <View>
      {label ? <FieldLabel>{label}</FieldLabel> : null}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1.5,
          borderColor: error ? colors.danger : focused ? colors.primary : colors.border,
          borderRadius: radius.md,
          paddingHorizontal: 14,
          height: 52,
          backgroundColor: colors.surface,
        }}
      >
        {Icon ? <Icon size={18} color={focused ? colors.primary : colors.faint} style={{ marginRight: 10 }} /> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.faint}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          secureTextEntry={secure && hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          style={{
            flex: 1,
            fontSize: 14.5,
            color: colors.ink,
            fontFamily: font.regular,
            outlineStyle: "none",
            outlineWidth: 0,
            borderWidth: 0,
          }}
        />
        {secure ? (
          <TouchableOpacity onPress={() => setHidden(!hidden)} hitSlop={8}>
            {hidden ? <Eye size={18} color={colors.faint} /> : <EyeOff size={18} color={colors.faint} />}
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? (
        <Text style={{ fontSize: 12, color: colors.danger, fontFamily: font.regular, marginTop: 4 }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

// Read-only field, e.g. Department fixed to "Computer Science"
export function LockedField({ label, value, icon: Icon }) {
  return (
    <View>
      {label ? <FieldLabel>{label}</FieldLabel> : null}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1.5,
          borderColor: colors.borderSoft,
          borderRadius: radius.md,
          paddingHorizontal: 14,
          height: 52,
          backgroundColor: colors.backgroundAlt,
        }}
      >
        {Icon ? <Icon size={18} color={colors.faint} style={{ marginRight: 10 }} /> : null}
        <Text style={{ flex: 1, fontSize: 14.5, color: colors.body, fontFamily: font.medium }}>
          {value}
        </Text>
      </View>
    </View>
  );
}

// Horizontal chip-selector, e.g. Level: 100 / 200 / 300 / 400, Semester: 1st / 2nd
export function ChipSelect({ label, icon: Icon, options, value, onChange }) {
  return (
    <View>
      {label ? <FieldLabel>{label}</FieldLabel> : null}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {options.map((opt) => {
          const active = value === opt;
          return (
            <TouchableOpacity
              key={opt}
              onPress={() => onChange(opt)}
              style={{
                paddingHorizontal: 16,
                height: 44,
                borderRadius: radius.md,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: active ? colors.primary : colors.surface,
                borderWidth: 1.5,
                borderColor: active ? colors.primary : colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: 13.5,
                  fontFamily: active ? font.semibold : font.medium,
                  color: active ? colors.white : colors.body,
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
