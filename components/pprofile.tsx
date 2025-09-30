import { getUserById, UserAttrs } from "@/api/users";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import colors from "./Colors";

const PersonalProfile = () => {
  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery<UserAttrs>({
    queryKey: ["userProfile"],
    queryFn: getUserById,
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.secondary} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "red" }}>{(error as Error).message}</Text>
      </View>
    );
  }

  const displayRole =
    user?.role === "Normal" ? "Personal Account" : user?.role || "";
  const eventsCount = Array.isArray(user?.events)
    ? user!.events.length
    : user?.events
    ? 1
    : 0;

  return (
    <View style={styles.root}>
      <View style={styles.headerCard}>
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: user?.image }} style={styles.avatar} />
        </View>

        <Text style={styles.name}>{user?.username || "User"}</Text>
        <Text style={styles.role}>{displayRole}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{eventsCount}</Text>
            <Text style={styles.statLabel}>Events</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionsCard}>
        <TouchableOpacity
          style={styles.actionItem}
          activeOpacity={0.85}
          onPress={() => router.push("/(personal)/(protect)/(tabs)/events")}
        >
          <Feather name="calendar" size={18} color={colors.text || "#333"} />
          <Text style={styles.actionText}>My Events</Text>
          <Feather name="chevron-right" size={18} color="#9a9a9a" />
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.actionItem} activeOpacity={0.85}>
          <Feather name="settings" size={18} color={colors.text || "#333"} />
          <Text style={styles.actionText}>Settings</Text>
          <Feather name="chevron-right" size={18} color="#9a9a9a" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PersonalProfile;

const cardRadius = 16;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.backgroundMuted, padding: 16 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.backgroundMuted,
  },
  headerCard: {
    backgroundColor: "#fff",
    borderRadius: cardRadius,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  editBtn: {
    position: "absolute",
    right: 12,
    top: 12,
    backgroundColor: "#f28b82",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  editText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  avatarWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.backgroundLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    overflow: "hidden",
  },
  avatar: { width: 130, height: 130, borderRadius: 65 },
  name: { fontSize: 20, fontWeight: "700", color: "#333" },
  role: { fontSize: 13, color: "#999", marginTop: 2 },
  email: { fontSize: 14, color: "#777", marginTop: 4 },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 16,
  },
  statBox: {
    alignItems: "center",
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    minWidth: 170,
  },
  statValue: { fontSize: 18, fontWeight: "700", color: "#333" },
  statLabel: { fontSize: 12, color: "#777" },
  actionsCard: {
    backgroundColor: "#fff",
    borderRadius: cardRadius,
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 6,
  },
  actionText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#333",
    fontWeight: "600",
  },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#eee" },
});
