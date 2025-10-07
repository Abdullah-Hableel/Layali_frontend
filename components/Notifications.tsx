import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  deleteNotification,
  getUserNotifications,
  markNotificationAsRead,
} from "@/api/notifications";
import { getToken } from "@/api/storage";
import colors from "./Colors";

export default function NotificationsScreen({ headerMode = false }) {
  const [userId, setUserId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // ✅ Decode userId from token
  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (token) {
        const decoded: any = jwtDecode(token);
        setUserId(decoded?.userId || decoded?._id || null);
      }
    })();
  }, []);

  // ✅ Fetch notifications with auto refetch every 10s
  const {
    data: notifications = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: () => getUserNotifications(userId!),
    enabled: !!userId,
    refetchInterval: 7000, // 🔁 auto-refresh every 10s
    refetchIntervalInBackground: true,
  });

  // ✅ Mark as read
  const { mutate: markRead } = useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] }),
  });

  // ✅ Delete notification
  const { mutate: remove } = useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] }),
  });

  // 🧠 Count unread notifications
  const unreadCount = notifications?.filter((n: any) => !n.read).length || 0;

  // ✅ MODE 1: HEADER ICON ONLY
  if (headerMode) {
    return (
      <TouchableOpacity
        style={{ marginLeft: 15 }}
        onPress={() => router.push("/notificationPage")}
        disabled={!userId || isLoading}
      >
        <View>
          <Ionicons
            name="notifications-outline"
            size={24}
            color={colors.secondary}
          />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  // ✅ MODE 2: FULL NOTIFICATIONS PAGE
  if (!userId) return <Text style={styles.loading}>Getting user info...</Text>;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.secondary} />
        <Text style={styles.loading}>Loading notifications...</Text>
      </View>
    );
  }

  if (isError) {
    return <Text style={styles.error}>Failed to load notifications ❌</Text>;
  }

  if (!notifications || notifications.length === 0) {
    return <Text style={styles.empty}>No notifications yet 📭</Text>;
  }

  return (
    <FlatList
      data={notifications}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[styles.notification, item.read ? styles.read : styles.unread]}
          onPress={() => markRead(item._id)}
        >
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.message}>{item.message}</Text>
          <Text style={styles.vendor}>
            Vendor: {item.vendor?.business_name || "Unknown"}
          </Text>

          <TouchableOpacity onPress={() => remove(item._id)}>
            <Text style={styles.delete}>Delete</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -4,
    right: -6,
    backgroundColor: colors.danger,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  notification: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  unread: {
    backgroundColor: "#f0f8ff",
  },
  read: {
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  message: {
    fontSize: 14,
    marginVertical: 4,
  },
  vendor: {
    fontSize: 12,
    color: "#888",
  },
  delete: {
    color: "red",
    marginTop: 4,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  loading: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
  error: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "red",
  },
  empty: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#555",
  },
});
