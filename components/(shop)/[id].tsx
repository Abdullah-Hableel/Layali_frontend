import { getVendorById2 } from "@/api/vendor";
import { buildImageUrl } from "@/Utils/buildImage";
import { capitalizeWords } from "@/Utils/capitalize";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ServiceCard } from "..//ServiceCard";
import colors from "../Colors";

type Service = {
  _id: string;
  name: string;
  price: number;
  image?: string;
  description?: string;
  type?: string;
  time?: string;
};

type Vendor = {
  _id: string;
  business_name: string;
  bio?: string;
  logo?: string;
  services?: Service[];
};

const ShopDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    data: vendor,
    isLoading,
    isError,
    error,
  } = useQuery<Vendor>({
    queryKey: ["vendorById", id],
    queryFn: () => getVendorById2(String(id)),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.secondary} />
      </View>
    );
  }

  if (isError || !vendor) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Vendor not found</Text>
      </View>
    );
  }

  const services: Service[] = Array.isArray(vendor.services)
    ? vendor.services
    : [];
  const logoUri = vendor.logo ? vendor.logo : undefined;
  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <FlatList
        data={services}
        keyExtractor={(s) => String(s._id)}
        renderItem={({ item }) => <ServiceCard item={item as any} />}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            {logoUri ? (
              <Image
                source={{ uri: buildImageUrl(logoUri) }}
                style={styles.logo}
              />
            ) : (
              <View style={[styles.logo, styles.logoFallback]}>
                <Text style={{ color: colors.text, fontSize: 12 }}>
                  No Logo
                </Text>
              </View>
            )}

            <Text style={styles.title}>
              {capitalizeWords(vendor.business_name)}
            </Text>
            {!!vendor.bio && (
              <Text style={styles.desc}>{capitalizeWords(vendor.bio)}</Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No services yet.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default ShopDetails;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundMuted },
  listContent: { paddingBottom: 24, gap: 12, alignItems: "center" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.backgroundMuted,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: 16,
  },
  header: {
    alignItems: "center",
    paddingTop: 30,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#eee",
    marginBottom: 16,
  },
  logoFallback: { justifyContent: "center", alignItems: "center" },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.secondary,
    textAlign: "center",
  },
  desc: { fontSize: 14, color: colors.text, marginTop: 8, textAlign: "center" },
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
});
