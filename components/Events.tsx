import { getMyEvents } from "@/api/event";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
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
    enabled: false,
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );
  if (isFetching) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.secondary} size={"small"} />
      </View>
    );
  }

  if (!events || events.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>No events found</Text>
      </View>
    );
  }
  return (
    <>
      <FlatList
        data={events}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <EventCard item={item} />}
        ItemSeparatorComponent={() => <View style={{ height: 0 }} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} />
        }
        showsVerticalScrollIndicator={false}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {}}
        activeOpacity={0.85}
      >
        <MaterialIcons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </>
  );
};

export default Events;

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.backgroundMuted,
  },
  empty: { color: colors.secondary, fontSize: 16, fontWeight: "600" },
  listContent: {
    padding: 16,
    backgroundColor: colors.backgroundMuted,
    flexGrow: 1,
  },
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
    elevation: 4,
  },
});
