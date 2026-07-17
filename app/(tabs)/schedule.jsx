import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Clock, MapPin, CalendarX2, CalendarDays } from "lucide-react-native";
import { useAppStore } from "@/utils/appStore";
import { colors, font, WEEKDAYS, WEEKDAY_SHORT, getTodayName, formatFullDate } from "@/utils/theme";
import { StatusBadge, EmptyState } from "@/components/ui/UI";

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets();
  const { timetable } = useAppStore();
  const today = getTodayName();
  const defaultDay = WEEKDAYS.includes(today) ? today : "Monday";
  const [selectedDay, setSelectedDay] = useState(defaultDay);

  const lectures = timetable[selectedDay] || [];

  const LectureRow = ({ lecture }) => (
    <View style={{ flexDirection: "row", paddingVertical: 14 }}>
      <View style={{ width: 76 }}>
        <Text style={{ fontSize: 12.5, fontFamily: font.semibold, color: colors.ink }}>
          {lecture.startTime}
        </Text>
        <Text style={{ fontSize: 11, color: colors.faint, fontFamily: font.regular, marginTop: 2 }}>
          {lecture.endTime}
        </Text>
      </View>
      <View
        style={{
          flex: 1,
          backgroundColor: colors.surface,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 14,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <Text style={{ fontSize: 12, fontFamily: font.semibold, color: colors.primary, flexShrink: 1, marginRight: 8 }}>
            {lecture.courseCode}
          </Text>
          <View style={{ flexShrink: 0 }}>
            <StatusBadge status={lecture.status} size="sm" />
          </View>
        </View>
        <Text style={{ fontSize: 14.5, fontFamily: font.semibold, color: colors.ink }}>
          {lecture.courseTitle}
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 5, marginTop: 6 }}>
          <MapPin size={12} color={colors.muted} />
          <Text style={{ fontSize: 12, color: colors.muted, fontFamily: font.regular }}>
            {lecture.venue}
          </Text>
          <Text style={{ fontSize: 12, color: colors.faint }}>·</Text>
          <Text style={{ fontSize: 12, color: colors.muted, fontFamily: font.regular, flexShrink: 1 }}>
            {lecture.lecturerName}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="dark" />

      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        {/* Flat eyebrow — plain background, scrolls with content */}
        <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 24, paddingBottom: 4 }}>
          <Text style={{ fontSize: 11, fontFamily: font.semibold, color: colors.muted, textTransform: "uppercase", letterSpacing: 1 }}>
            {formatFullDate()}
          </Text>
        </View>

        {/* Floating hero card */}
        <View style={{ paddingHorizontal: 24, marginTop: 8, marginBottom: 16 }}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 22,
              padding: 22,
              overflow: "hidden",
              shadowColor: colors.primaryDark,
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.22,
              shadowRadius: 20,
              elevation: 8,
            }}
          >
            <View
              style={{
                position: "absolute",
                width: 140,
                height: 140,
                borderRadius: 70,
                backgroundColor: colors.accent,
                opacity: 0.15,
                top: -50,
                right: -30,
              }}
            />

            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={{ fontSize: 20, fontFamily: font.bold, color: colors.white, letterSpacing: -0.3 }}>
                  Weekly Schedule
                </Text>
                <Text style={{ fontSize: 13, fontFamily: font.regular, color: "rgba(255,255,255,0.8)", marginTop: 6, lineHeight: 18 }}>
                  All your lectures for {selectedDay}, in one place.
                </Text>
              </View>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "rgba(255,255,255,0.16)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CalendarDays size={22} color={colors.white} />
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Floating day-selector card — separate surface, not glued to the hero or the top */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              backgroundColor: colors.surface,
              borderRadius: 18,
              padding: 8,
              shadowColor: colors.primaryDark,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.06,
              shadowRadius: 10,
              elevation: 2,
            }}
          >
            {WEEKDAYS.map((day) => {
              const active = selectedDay === day;
              const isToday = day === today;
              return (
                <TouchableOpacity
                  key={day}
                  onPress={() => setSelectedDay(day)}
                  style={{
                    alignItems: "center",
                    paddingVertical: 8,
                    flex: 1,
                    borderRadius: 12,
                    backgroundColor: active ? colors.primary : "transparent",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12.5,
                      fontFamily: active ? font.semibold : font.medium,
                      color: active ? colors.white : colors.muted,
                    }}
                  >
                    {WEEKDAY_SHORT[day]}
                  </Text>
                  {isToday ? (
                    <View
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: active ? colors.accent : colors.primary,
                        marginTop: 4,
                      }}
                    />
                  ) : (
                    <View style={{ height: 8 }} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ paddingHorizontal: 24 }}>
          {lectures.length > 0 ? (
            lectures.map((lecture) => <LectureRow key={lecture.id} lecture={lecture} />)
          ) : (
            <EmptyState
              icon={CalendarX2}
              title={`No lectures for ${selectedDay}`}
              subtitle="Nothing has been scheduled for this day yet."
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}