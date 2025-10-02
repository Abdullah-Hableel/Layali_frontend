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
      <View style={styles.searchWrap}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by shop name"
          placeholderTextColor={colors.secondary}
          style={styles.searchInput}
        />
      </View>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={filtered}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {search ? "No matching vendors" : "No vendors available"}
          </Text>
        }
        renderItem={({ item }) => {
          const uri = buildImageUrl(item.logo);

          return (
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.85}
              onPress={() => router.push(`/(personal)/(shop)/${item._id}`)}
            >
              <Image source={{ uri }} style={styles.logo} />
              <View style={styles.info}>
                <Text style={styles.name}>
                  {capitalizeWords(item.business_name)}
                </Text>
                {!!item.bio && (
                  <Text numberOfLines={3} style={styles.meta}>
                    {capitalizeWords(item.bio)}
                  </Text>
                )}
              </View>

              <Feather name="chevron-right" size={18} color="#9a9a9a" />
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
  listContent: { padding: 16, backgroundColor: colors.backgroundMuted },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    marginBottom: 10,
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: colors.black,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    height: 95,
  },
  logo: { width: 70, height: 70, borderRadius: 50, backgroundColor: "#eee" },
  searchWrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    backgroundColor: colors.backgroundMuted,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.neutral,
    borderRadius: 12,
    padding: 10,
    backgroundColor: colors.white,
    color: colors.black,
  },
  info: { flex: 1 },
  name: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.secondary,
  },
  empty: { textAlign: "center", color: colors.text, marginTop: 20 },
  meta: {
    color: colors.secondary,
    fontSize: 14,
    marginBottom: 4,
  },
});
