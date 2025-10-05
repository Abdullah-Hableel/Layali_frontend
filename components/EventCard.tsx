import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Event } from "../data/events";
import colors from "./Colors";

type Props = {
  item: Event;
  onPress?: () => void;
};

export default function EventCard({ item, onPress }: Props) {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.card}>
      <View style={styles.cardBody}>
        <View style={styles.info}>
          <Text style={styles.cardTitle}>{item.location}</Text>
          <Text style={styles.meta}>
            📅 {new Date(item.date).toDateString()}
          </Text>
          <Text style={styles.meta}>💰 {item.budget ?? 0}</Text>
        </View>
        <Feather name="chevron-right" size={20} color={colors.secondary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.neutral,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    marginBottom: 14,
  },
  cardBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 13,
  },
  info: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.secondary,
    marginBottom: 8,
  },
  meta: {
    color: colors.secondary,
    fontSize: 14,
    marginBottom: 4,
  },
});
