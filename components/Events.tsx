import { getMyEvents } from "@/api/event";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import colors from "./Colors";
import EventCard from "./EventCard";

const Events = () => {
  const {
    data: events,
    isFetching,
    isError,
    refetch,
    error,
  } = useQuery({
    queryKey: ["Myevents"],
    queryFn: getMyEvents,
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const data = events ?? [];

  return (
    <View style={styles.root}>
      <FlatList
        data={data}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <EventCard
            item={item}
            onPress={() => router.push(`/(personal)/(events)/${item._id}`)}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          data.length === 0 && styles.listEmptyContent,
        ]}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            {isFetching ? (
              <ActivityIndicator color={colors.secondary} size="small" />
            ) : isError ? (
              <Text style={styles.error}>
                {error instanceof Error
                  ? "No events found"
                  : "Failed to load events"}
              </Text>
            ) : (
              <Text style={styles.empty}>No events found</Text>
            )}
          </View>
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/createEvents")}
        activeOpacity={0.85}
      >
        <MaterialIcons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default Events;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.backgroundMuted,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  listEmptyContent: {
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1,
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  empty: { color: colors.secondary, fontSize: 16, fontWeight: "600" },
  error: { color: colors.danger, fontSize: 14, fontWeight: "600" },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    zIndex: 10,
  },
});
