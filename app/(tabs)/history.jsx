import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Clock, MapPin, User, FileText, Image as ImageIcon, Inbox, History as HistoryIcon } from "lucide-react-native";
import { useAppStore } from "@/utils/appStore";
import { colors, font } from "@/utils/theme";
import { Card, EmptyState } from "@/components/ui/UI";

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { history } = useAppStore();

  const HistoryCard = ({ item }) => (
    <View
      style={{
        flexDirection: "row",
        marginBottom: 14,
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: colors.surface,
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 2,
      }}
    >
      <LinearGradient
        colors={[colors.primary, colors.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ width: 4 }}
      />

      <View style={{ flex: 1, padding: 16 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <View style={{ flex: 1, minWidth: 0, marginRight: 10 }}>
            <Text style={{ fontSize: 11.5, fontFamily: font.semibold, color: colors.muted, marginBottom: 4 }}>
              {formatDate(item.date)}
            </Text>
            <Text style={{ fontSize: 15.5, fontFamily: font.semibold, color: colors.ink }}>
              {item.courseCode} · {item.courseTitle}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: colors.infoBg,
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 4,
              flexShrink: 0,
            }}
          >
            <Text style={{ fontSize: 10.5, fontFamily: font.semibold, color: colors.info }}>Completed</Text>
          </View>
        </View>

        <View style={{ gap: 7 }}>
          <Row icon={User} text={item.lecturerName} />
          <Row icon={MapPin} text={item.venue} />
          <Row icon={Clock} text={`${item.startTime} - ${item.endTime}`} />
        </View>

        {item.attachment ? (
          <TouchableOpacity
            style={{
              marginTop: 14,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              backgroundColor: colors.backgroundAlt,
              borderRadius: 10,
              padding: 10,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                backgroundColor: item.attachment.type === "pdf" ? colors.dangerBg : colors.primaryLight,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {item.attachment.type === "pdf" ? (
                <FileText size={16} color={colors.danger} />
              ) : (
                <ImageIcon size={16} color={colors.primary} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12.5, fontFamily: font.medium, color: colors.ink }} numberOfLines={1}>
                {item.attachment.name}
              </Text>
              <Text style={{ fontSize: 11, fontFamily: font.regular, color: colors.muted }}>
                Uploaded by admin · Tap to view
              </Text>
            </View>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="dark" />

      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        {/* Flat greeting row — plain background, no card, no border */}
        <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 24, paddingBottom: 4 }}>
          <Text style={{ fontSize: 11, fontFamily: font.semibold, color: colors.muted, letterSpacing: 0.5, textTransform: "uppercase" }}>
            Faculty of Computing
          </Text>
        </View>

        {/* Floating hero card — inset on all sides, rounded, sits above the page */}
        <View style={{ paddingHorizontal: 24, marginTop: 8, marginBottom: 22 }}>
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
                  Lecture History
                </Text>
                <Text style={{ fontSize: 13, fontFamily: font.regular, color: "rgba(255,255,255,0.8)", marginTop: 6, lineHeight: 18 }}>
                  Completed lectures with notes uploaded by your admin.
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
                <HistoryIcon size={22} color={colors.white} />
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={{ paddingHorizontal: 24 }}>
          {history.length > 0 ? (
            history.map((item) => <HistoryCard key={item.id} item={item} />)
          ) : (
            <EmptyState icon={Inbox} title="No history yet" subtitle="Completed lectures will show up here." />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function Row({ icon: Icon, text }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Icon size={13} color={colors.muted} />
      <Text style={{ fontSize: 13, color: colors.body, fontFamily: font.regular }}>{text}</Text>
    </View>
  );
}

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}