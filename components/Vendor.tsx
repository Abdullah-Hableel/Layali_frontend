import { getVendor } from "@/api/vendor";
import { buildImageUrl } from "@/Utils/buildImage";
import { capitalizeWords } from "@/Utils/capitalize";
import { Feather } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import colors from "./Colors";

const Vendor = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const {
    data: vendor,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["vendor"],
    queryFn: getVendor,
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
        <Text style={styles.error}>Shops not found</Text>
      </View>
    );
  }

  const filtered = vendor.filter((v: any) =>
    (v?.business_name || "").toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <View style={styles.root}>
      <View style={styles.searchWrapper}>
        <Feather name="search" size={20} color={colors.text} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by shop name..."
          placeholderTextColor="#888"
          style={styles.searchInput}
        />
      </View>

      <FlatList
        contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 20 }}
        data={filtered}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {search ? "No matching vendors 🔍" : "No vendors available"}
          </Text>
        }
        renderItem={({ item }) => {
          const uri =
            buildImageUrl(item.logo) || "https://via.placeholder.com/600x300";

          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.88}
              onPress={() => router.push(`/(personal)/(shop)/${item._id}`)}
            >
              <Image
                source={{ uri }}
                style={styles.cardImage}
                resizeMode="cover"
              />

              <View style={styles.cardContent}>
                <View
                  style={{ flexDirection: "row", alignItems: "flex-start" }}
                >
                  <Text style={styles.vendorName} numberOfLines={1}>
                    {capitalizeWords(item.business_name)}
                  </Text>
                  <View style={{ flex: 1 }} />
                  <Feather name="chevron-right" size={18} color="#9a9a9a" />
                </View>

                {!!item.bio && (
                  <Text numberOfLines={2} style={styles.meta}>
                    {capitalizeWords(item.bio)}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

export default Vendor;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.backgroundMuted },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.backgroundMuted,
  },

  error: { color: colors.danger, fontSize: 12, fontWeight: "600" },

  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    margin: 20,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    shadowColor: colors.black,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 8,
    elevation: 5,
  },
  searchInput: { flex: 1, marginLeft: 8, color: colors.text, fontSize: 16 },

  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    marginBottom: 20,
    shadowColor: colors.black,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 8,
    elevation: 6,
    overflow: "hidden",
    paddingBottom: 10,
  },
  cardImage: { width: "100%", height: 180 },
  cardContent: { paddingHorizontal: 10, paddingTop: 8 },

  vendorName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    flexShrink: 1,
    maxWidth: "85%",
  },

  meta: {
    color: colors.secondary,
    fontSize: 14,
    marginTop: 4,
  },

  emptyText: {
    color: colors.text,
    fontSize: 16,
    marginTop: 20,
    textAlign: "center",
  },
});
