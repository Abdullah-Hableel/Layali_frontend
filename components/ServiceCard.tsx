import { capitalizeWords } from "@/Utils/capitalize";
import { Service } from "@/api/users";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import colors from "./Colors";

export const ServiceCard = ({ item }: { item: Service }) => {
  const goToDetails = () => {
    router.push(`/(personal)/(serviceDetails)/${item._id}`);
    console.log(item._id);
  };
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={goToDetails}
    >
      <View style={styles.card}>
        <Feather
          name="chevron-right"
          size={18}
          color="#9a9a9a"
          style={styles.topIcon}
        />

        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.cardPrice}>
            {Number(item.price).toFixed(2)} KWD
          </Text>
          {!!item.type && (
            <Text style={styles.meta}>{capitalizeWords(item.type)}</Text>
          )}
          {!!item.time && (
            <Text style={styles.meta}>{capitalizeWords(item.time)}</Text>
          )}
          {!!item.description && (
            <Text style={styles.desc} numberOfLines={2}>
              {capitalizeWords(item.description)}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  topIcon: {
    position: "absolute",
    top: 55,
    right: 8,
    zIndex: 10,
  },
  card: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: "hidden",
    width: "97%",
    alignSelf: "center",
    marginBottom: 6,
  },
  cardImage: {
    width: 120,
    height: "100%",
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  imageFallback: {
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  imageFallbackText: {
    fontSize: 12,
    color: colors.text,
  },
  cardBody: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.secondary,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.accent,
  },
  meta: {
    fontSize: 12,
    color: colors.secondary,
  },
  desc: {
    fontSize: 13,
    color: colors.text,
  },
});
