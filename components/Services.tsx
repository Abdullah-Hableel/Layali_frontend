// app/screens/TestUser.tsx
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { ActivityIndicator, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUserById, UserAttrs } from "../api/users"; // adjust the path

const COLORS = {
  background: "#F0F8FF",
  text: "#333333",
  primary: "#4A90E2",
};

export default function TestUser() {
  const { data, isLoading, error } = useQuery<UserAttrs>({
    queryKey: ["user"],
    queryFn: getUserById,
  });

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.center, { backgroundColor: COLORS.background }]}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10, color: COLORS.text }}>
          Loading user...
        </Text>
      </SafeAreaView>
    );
  }

  if (error) {
    console.log("🚀 ~ TestUser ~ error:", error, data?.vendors);
    return (
      <SafeAreaView
        style={[styles.center, { backgroundColor: COLORS.background }]}
      >
        <Text style={{ color: "red" }}>Error: {(error as Error).message}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: COLORS.background }]}
    >
      <Text style={styles.title}>User Data:</Text>
      <Text>ID: {data?._id}</Text>
      <Text>Username: {data?.username}</Text>
      <Text>Email: {data?.email}</Text>
      <Text>Role: {data?.role}</Text>
      <Text>Image URL: {data?.image}</Text>
      <Text>Vendors: {data?.vendors?.length}</Text>
      <Text>Events: {data?.events?.length}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-start",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    color: "#333333",
  },
});
