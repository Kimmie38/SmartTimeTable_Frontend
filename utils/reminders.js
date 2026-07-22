import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const REMINDER_STORE_KEY = "lectureReminders"; // { [lectureId]: { notificationId, offsetMinutes, label } }

export const REMINDER_OFFSETS = [
  { label: "5 minutes before", minutes: 5 },
  { label: "15 minutes before", minutes: 15 },
  { label: "30 minutes before", minutes: 30 },
  { label: "1 hour before", minutes: 60 },
  { label: "2 hours before", minutes: 120 },
  { label: "3 hours before", minutes: 180 },
];

// JS Date.getDay(): Sunday=0..Saturday=6. Expo's WEEKLY trigger uses
// Sunday=1..Saturday=7, so this map goes straight to Expo's convention.
const WEEKDAY_TO_EXPO = {
  Sunday: 1,
  Monday: 2,
  Tuesday: 3,
  Wednesday: 4,
  Thursday: 5,
  Friday: 6,
  Saturday: 7,
};

export async function ensureNotificationPermission() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus === "granted" && Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  return finalStatus === "granted";
}

// Given a class's day + "HH:mm" start time and how many minutes before it
// to fire, returns the weekday/hour/minute the reminder should fire at —
// rolling back to the previous day if the offset pushes past midnight.
function getReminderTime(day, startTime, offsetMinutes) {
  const [h, m] = startTime.split(":").map(Number);
  let totalMinutes = h * 60 + m - offsetMinutes;

  let expoWeekday = WEEKDAY_TO_EXPO[day];
  while (totalMinutes < 0) {
    totalMinutes += 24 * 60;
    expoWeekday = expoWeekday === 1 ? 7 : expoWeekday - 1; // step back a day
  }

  return {
    weekday: expoWeekday,
    hour: Math.floor(totalMinutes / 60) % 24,
    minute: totalMinutes % 60,
  };
}

async function loadReminders() {
  const raw = await AsyncStorage.getItem(REMINDER_STORE_KEY);
  return raw ? JSON.parse(raw) : {};
}

async function saveReminders(map) {
  await AsyncStorage.setItem(REMINDER_STORE_KEY, JSON.stringify(map));
}

// Returns the currently set reminder for a lecture, or null.
export async function getLectureReminder(lectureId) {
  const map = await loadReminders();
  return map[lectureId] || null;
}

// lecture must include: id, day, startTime, courseCode, courseTitle, venue
export async function setLectureReminder(lecture, offsetMinutes, label) {
  const granted = await ensureNotificationPermission();
  if (!granted) {
    return { ok: false, error: "Notification permission was denied." };
  }

  await clearLectureReminder(lecture.id);

  const { weekday, hour, minute } = getReminderTime(lecture.day, lecture.startTime, offsetMinutes);

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: `${lecture.courseCode} starts soon`,
      body: `${lecture.courseTitle} — ${lecture.venue} at ${lecture.startTime}`,
      sound: "default",
      data: { lectureId: lecture.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday,
      hour,
      minute,
      repeats: true,
    },
  });

  const map = await loadReminders();
  map[lecture.id] = { notificationId, offsetMinutes, label };
  await saveReminders(map);
  return { ok: true };
}

export async function clearLectureReminder(lectureId) {
  const map = await loadReminders();
  const existing = map[lectureId];
  if (!existing) return;

  try {
    await Notifications.cancelScheduledNotificationAsync(existing.notificationId);
  } catch (err) {
    // Already fired/cancelled — safe to ignore
  }
  delete map[lectureId];
  await saveReminders(map);
}