import {
  deleteNotification,
  getUserNotifications,
  markNotificationAsRead,
} from "@/api/notifications";
import { getToken } from "@/api/storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Notifications() {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);

  // ✅ Get userId from JWT token
  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (token) {
        const decoded: any = jwtDecode(token);
        setUserId(decoded._id);
      }
    })();
  }, []);

  const {
    data: notifications,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: () => getUserNotifications(userId!),
    enabled: !!userId, // only fetch when we have userId
  });

  const { mutate: markRead } = useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] }),
  });

  const { mutate: remove } = useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] }),
  });

  if (!userId) {
    return <Text style={styles.loading}>Getting user info...</Text>;
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
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
