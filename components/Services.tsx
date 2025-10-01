import { baseURL } from "@/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUserById, UserAttrs } from "../api/users";
import colors from "../components/Colors";

const SERVER_URL = `${baseURL}/uploads/`;
const buildImageUrl = (img?: string) =>
  img ? `${SERVER_URL}${img}` : "https://via.placeholder.com/300x180";

export default function Service() {
  const queryClient = useQueryClient();
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, error } = useQuery<UserAttrs>({
    queryKey: ["user"],
    queryFn: getUserById,
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["user"] });
    setRefreshing(false);
  }, [queryClient]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10, color: colors.text }}>
          Loading user...
        </Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ color: colors.danger }}>
          Error: {(error as Error).message}
        </Text>
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ color: colors.text }}>No user found 😔</Text>
      </SafeAreaView>
    );
  }

  // Flatten services from all vendors
  const services =
    (data.vendors as any)?.flatMap((vendor: any) =>
      vendor.services.map((service: any) => ({
        ...service,
        vendorName: vendor.business_name,
        vendorLogo: vendor.logo,
      }))
    ) ?? [];

  const renderService = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => setSelectedService(item)}
    >
      <Image
        source={{ uri: buildImageUrl(item.image) }}
        style={styles.cardImage}
      />

      <View style={styles.cardContent}>
        {/* Service Name */}
        <Text style={styles.serviceName}>{item.name}</Text>

        {/* Price below name, aligned right */}
        <View style={{ alignItems: "flex-end", marginTop: -8 }}>
          <Text style={styles.priceTag}>{item.price} KD</Text>
        </View>

        {/* Vendor row */}
        {item.vendorName && (
          <View style={styles.vendorRow}>
            <Image
              source={{ uri: buildImageUrl(item.vendorLogo) }}
              style={styles.vendorLogo}
            />
            <Text style={styles.vendorName}>{item.vendorName}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <Text style={styles.title}>
        🛎️ number of your services: {services.length}
      </Text>
      <FlatList
        data={services}
        keyExtractor={(item) => item._id}
        renderItem={renderService}
        contentContainerStyle={{ padding: 20 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No services found 🔍</Text>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />

      {/* Modal for service details */}
      {selectedService && (
        <Modal
          visible={!!selectedService}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSelectedService(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView>
                {/* Service Name */}
                <Text style={styles.modalTitle}>{selectedService.name}</Text>

                {/* Price below name, aligned right */}
                <View style={{ alignItems: "flex-end", marginTop: -25 }}>
                  <Text style={styles.modalPrice}>
                    {selectedService.price} KD
                  </Text>
                </View>

                <Image
                  source={{ uri: buildImageUrl(selectedService.image) }}
                  style={styles.modalImage}
                />

                {selectedService.vendorName && (
                  <View style={styles.modalVendorRow}>
                    <Image
                      source={{
                        uri: buildImageUrl(selectedService.vendorLogo),
                      }}
                      style={styles.modalVendorLogo}
                    />
                    <Text style={styles.modalVendorName}>
                      {selectedService.vendorName}
                    </Text>
                  </View>
                )}
              </ScrollView>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedService(null)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/createService")}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundMuted,
    justifyContent: "flex-start",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
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
  serviceName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    flex: 1,
  },
  priceTag: {
    backgroundColor: colors.accent,
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    overflow: "hidden",
  },
  vendorRow: { flexDirection: "row", alignItems: "center", marginTop: -15 },
  vendorLogo: { width: 30, height: 30, borderRadius: 15, marginRight: 8 },
  vendorName: { fontSize: 14, color: colors.text, fontWeight: "500" },
  emptyText: {
    color: colors.text,
    fontSize: 16,
    marginTop: 20,
    textAlign: "center",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 15,
    maxHeight: "80%",
    shadowColor: colors.black,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 6,
  },
  modalTitle: { fontSize: 22, fontWeight: "bold", color: colors.text, flex: 1 },
  modalPrice: {
    backgroundColor: colors.accent,
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    overflow: "hidden",
  },
  modalImage: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginBottom: 15,
    marginTop: 10,
  },
  modalVendorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: -30,
    color: colors.primary,
    marginLeft: 23,
  },
  modalVendorLogo: { width: 30, height: 30, borderRadius: 15, marginRight: 8 },
  modalVendorName: { fontSize: 16, fontWeight: "600", color: colors.text },
  closeButton: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 15,
    alignItems: "center",
  },
  closeButtonText: { color: colors.white, fontWeight: "bold" },
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
  fabText: { fontSize: 32, color: "#fff", fontWeight: "bold" },
});
