// BusinessProfile.tsx
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { baseURL } from "@/api";
import { getUserById, UserAttrs } from "@/api/users";
import colors from "./Colors";

const SERVER_URL = `${baseURL}/uploads/`;
const buildImageUrl = (img?: string) =>
  img
    ? img.startsWith("http")
      ? img
      : `${SERVER_URL}${img}`
    : "https://via.placeholder.com/200x200";

export default function BusinessProfile() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  // FETCH CURRENT USER (use same key "user" used elsewhere -> important for invalidation)
  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery<UserAttrs>({
    queryKey: ["user"],
    queryFn: getUserById,
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ["user"] });
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color={colors.secondary} />
        <Text style={{ marginTop: 8, color: colors.text }}>
          Loading profile...
        </Text>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ color: "red" }}>{(error as Error).message}</Text>
      </SafeAreaView>
    );
  }

  // vendors are embedded on the user (as you explained)
  const vendors = Array.isArray(user?.vendors) ? user!.vendors : [];

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.vendorCard}
      onPress={() => router.push(`/(vendorD)/${item._id}`)}
    >
      <Image
        source={{ uri: buildImageUrl(item.logo) }}
        style={styles.vendorLogo}
      />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.vendorName}>
          {item.business_name ?? "Untitled"}
        </Text>
        <Text style={styles.vendorBio} numberOfLines={2}>
          {item.bio ?? "No bio provided"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.root}>
      {/* profile header */}
      <View style={styles.headerCard}>
        <View style={styles.avatarWrapper}>
          <Image
            source={{ uri: buildImageUrl(user?.image) }}
            style={styles.avatar}
          />
        </View>
        <Text style={styles.name}>{user?.username ?? "User"}</Text>
        <Text style={styles.role}>
          {user?.role === "Vendor" ? "Vendor Account" : user?.role ?? ""}
        </Text>
      </View>

      {/* Vendors list */}
      <FlatList
        data={vendors}
        // keyExtractor={(item, index) => (item?._id ? String(item._id) : String(index))}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No vendors yet. Tap + to create one.
          </Text>
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />

      {/* Floating action button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/createVendor")}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const cardRadius = 16;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.backgroundMuted },
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
    margin: 16,
  },
  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.backgroundLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    overflow: "hidden",
  },
  avatar: { width: 110, height: 110, borderRadius: 55 },
  name: { fontSize: 20, fontWeight: "700", color: "#333" },
  role: { fontSize: 13, color: "#999", marginTop: 2 },

  vendorCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    color: colors.backgroundMuted,
  },
  vendorLogo: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#eee",
  },
  vendorName: { fontSize: 16, fontWeight: "600", color: "#333" },
  vendorBio: { fontSize: 13, color: "#666", marginTop: 4 },
  emptyText: { textAlign: "center", marginTop: 20, color: "#777" },

  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  fabText: { fontSize: 32, color: "#fff", fontWeight: "bold", marginTop: -2 },
});
