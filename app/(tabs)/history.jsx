import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Clock, MapPin, User, FileText, Image as ImageIcon, Inbox, History as HistoryIcon, Download } from "lucide-react-native";
import { useAppStore } from "@/utils/appStore";
import { colors, font } from "@/utils/theme";
import { Card, EmptyState } from "@/components/ui/UI";

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { history, isHistoryLoading, historyError, fetchHistory } = useAppStore();
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    if (history.length === 0) fetchHistory();
  }, []);

  // Downloads the attachment to the device, then opens the native
  // Save/Share sheet so the person can save it into Files (iOS) or
  // their preferred app (Android) — instead of just opening it in a browser tab.
  const downloadAttachment = async (item) => {
    if (!item.attachment?.url) return;
    setDownloadingId(item.id);
    try {
      const fileName = item.attachment.fileName || `attachment-${item.id}`;
      const destinationFile = new File(Paths.document, fileName);

      // Downloading again with the same filename can fail if it already
      // exists from a previous attempt — clear it first.
      if (destinationFile.exists) {
        destinationFile.delete();
      }

      const output = await File.downloadFileAsync(item.attachment.url, destinationFile);

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(output.uri);
      } else {
        Alert.alert("Downloaded", `Saved to ${output.uri}`);
      }
    } catch (err) {
      console.log("Attachment download error:", err);
      Alert.alert(
        "Download failed",
        err?.message || "Couldn't download this file. Check your connection and try again."
      );
    } finally {
      setDownloadingId(null);
    }
  };

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
          <Row icon={User} text={item.lecturer} />
          <Row icon={MapPin} text={item.venue} />
          <Row icon={Clock} text={item.time} />
        </View>

        {item.attachment ? (
          <TouchableOpacity
            onPress={() => downloadAttachment(item)}
            disabled={downloadingId === item.id}
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
              opacity: downloadingId === item.id ? 0.6 : 1,
            }}
          >
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                backgroundColor: item.attachment.fileType === "pdf" ? colors.dangerBg : colors.primaryLight,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {item.attachment.fileType === "pdf" ? (
                <FileText size={16} color={colors.danger} />
              ) : (
                <ImageIcon size={16} color={colors.primary} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12.5, fontFamily: font.medium, color: colors.ink }} numberOfLines={1}>
                {item.attachment.fileName}
              </Text>
              <Text style={{ fontSize: 11, fontFamily: font.regular, color: colors.muted }}>
                {downloadingId === item.id ? "Downloading…" : "Uploaded by admin · Tap to download"}
              </Text>
            </View>
            {downloadingId === item.id ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Download size={16} color={colors.muted} />
            )}
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={
          <RefreshControl refreshing={isHistoryLoading} onRefresh={fetchHistory} tintColor={colors.primary} />
        }
      >
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
          {isHistoryLoading && history.length === 0 ? (
            <View style={{ paddingVertical: 40, alignItems: "center" }}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : historyError ? (
            <>
              <EmptyState icon={Inbox} title="Couldn't load history" subtitle={historyError} />
              <TouchableOpacity onPress={fetchHistory} style={{ alignSelf: "center", marginTop: 12, paddingVertical: 8 }}>
                <Text style={{ color: colors.primary, fontFamily: font.semibold, fontSize: 13.5 }}>Try again</Text>
              </TouchableOpacity>
            </>
          ) : history.length > 0 ? (
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
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}