import React, { useState, useCallback, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Clock, MapPin, CalendarX2, CalendarDays, Bell, BellOff, X, Check } from "lucide-react-native";
import { useAppStore } from "@/utils/appStore";
import { colors, font, WEEKDAYS, WEEKDAY_SHORT, getTodayName, formatFullDate } from "@/utils/theme";
import { StatusBadge, EmptyState } from "@/components/ui/UI";
import { REMINDER_OFFSETS, getLectureReminder, setLectureReminder, clearLectureReminder } from "@/utils/reminders";

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets();
  const { timetable, isTimetableLoading, timetableError, fetchTimetable } = useAppStore();
  const today = getTodayName();
  const defaultDay = WEEKDAYS.includes(today) ? today : "Monday";
  const [selectedDay, setSelectedDay] = useState(defaultDay);

  const [reminderTarget, setReminderTarget] = useState(null);
  const [activeReminder, setActiveReminder] = useState(null);
  const [savingReminder, setSavingReminder] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchTimetable();
    }, [fetchTimetable])
  );

  const lectures = timetable[selectedDay] || [];

  const openReminderPicker = async (lecture) => {
    const existing = await getLectureReminder(lecture.id);
    setActiveReminder(existing);
    setReminderTarget({ lecture, day: selectedDay });
  };

  const closeReminderPicker = () => {
    setReminderTarget(null);
    setActiveReminder(null);
  };

  const handlePickOffset = async (offset) => {
    if (!reminderTarget) return;
    setSavingReminder(true);
    const { lecture, day } = reminderTarget;
    const result = await setLectureReminder({ ...lecture, day }, offset.minutes, offset.label);
    setSavingReminder(false);
    if (result.ok) {
      closeReminderPicker();
    } else {
      setActiveReminder({ error: result.error });
    }
  };

  const handleRemoveReminder = async () => {
    if (!reminderTarget) return;
    setSavingReminder(true);
    await clearLectureReminder(reminderTarget.lecture.id);
    setSavingReminder(false);
    closeReminderPicker();
  };

  const LectureRow = ({ lecture }) => {
    const [hasReminder, setHasReminder] = useState(false);

    useEffect(() => {
      let mounted = true;
      getLectureReminder(lecture.id).then((r) => mounted && setHasReminder(!!r));
      return () => {
        mounted = false;
      };
    }, [lecture.id]);

    return (
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
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <StatusBadge status={lecture.status} size="sm" />
              <TouchableOpacity
                onPress={() => openReminderPicker(lecture)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  backgroundColor: hasReminder ? colors.accentSoft : colors.backgroundAlt,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {hasReminder ? (
                  <Bell size={13} color={colors.accentDark} />
                ) : (
                  <BellOff size={13} color={colors.faint} />
                )}
              </TouchableOpacity>
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
              {lecture.lecturer}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={
          <RefreshControl refreshing={isTimetableLoading} onRefresh={fetchTimetable} tintColor={colors.primary} />
        }
      >
        <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 24, paddingBottom: 4 }}>
          <Text style={{ fontSize: 11, fontFamily: font.semibold, color: colors.muted, textTransform: "uppercase", letterSpacing: 1 }}>
            {formatFullDate()}
          </Text>
        </View>

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
          {isTimetableLoading && Object.keys(timetable).length === 0 ? (
            <View style={{ paddingVertical: 40, alignItems: "center" }}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : timetableError ? (
            <>
              <EmptyState icon={CalendarX2} title="Couldn't load your schedule" subtitle={timetableError} />
              <TouchableOpacity onPress={fetchTimetable} style={{ alignSelf: "center", marginTop: 12, paddingVertical: 8 }}>
                <Text style={{ color: colors.primary, fontFamily: font.semibold, fontSize: 13.5 }}>Try again</Text>
              </TouchableOpacity>
            </>
          ) : lectures.length > 0 ? (
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

      <Modal
        visible={!!reminderTarget}
        transparent
        animationType="slide"
        onRequestClose={closeReminderPicker}
      >
        <View style={{ flex: 1, backgroundColor: colors.overlay, justifyContent: "flex-end" }}>
          <View
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingHorizontal: 24,
              paddingTop: 18,
              paddingBottom: insets.bottom + 20,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <View>
                <Text style={{ fontSize: 16, fontFamily: font.semibold, color: colors.ink }}>
                  Remind me
                </Text>
                {reminderTarget ? (
                  <Text style={{ fontSize: 12.5, fontFamily: font.regular, color: colors.muted, marginTop: 2 }}>
                    {reminderTarget.lecture.courseCode} · {reminderTarget.day} {reminderTarget.lecture.startTime}
                  </Text>
                ) : null}
              </View>
              <TouchableOpacity onPress={closeReminderPicker} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <X size={20} color={colors.muted} />
              </TouchableOpacity>
            </View>

            {activeReminder?.error ? (
              <Text style={{ color: colors.danger, fontSize: 12.5, fontFamily: font.medium, marginBottom: 12 }}>
                {activeReminder.error}
              </Text>
            ) : null}

            {REMINDER_OFFSETS.map((offset) => {
              const isActive = activeReminder && activeReminder.offsetMinutes === offset.minutes;
              return (
                <TouchableOpacity
                  key={offset.minutes}
                  onPress={() => handlePickOffset(offset)}
                  disabled={savingReminder}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 13,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.divider,
                  }}
                >
                  <Text style={{ fontSize: 14.5, fontFamily: font.regular, color: colors.ink }}>
                    {offset.label}
                  </Text>
                  {isActive ? <Check size={18} color={colors.primary} /> : null}
                </TouchableOpacity>
              );
            })}

            {activeReminder && !activeReminder.error ? (
              <TouchableOpacity
                onPress={handleRemoveReminder}
                disabled={savingReminder}
                style={{ paddingVertical: 14, alignItems: "center", marginTop: 4 }}
              >
                <Text style={{ fontSize: 13.5, fontFamily: font.semibold, color: colors.danger }}>
                  Remove reminder
                </Text>
              </TouchableOpacity>
            ) : null}

            {savingReminder ? (
              <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.6)" }}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}