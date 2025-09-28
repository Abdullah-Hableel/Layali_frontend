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
        <Text style={styles.cardTitle}>{item.location}</Text>
        <Text style={styles.meta}>📅 {new Date(item.date).toDateString()}</Text>
        <Text style={styles.meta}>💰 {item.budget ?? 0}</Text>
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
    padding: 13,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.secondary,
    marginBottom: 8,
  },
  meta: {
    color: colors.secondary,
    fontSize: 14,
    marginBottom: 4,
  },
});
