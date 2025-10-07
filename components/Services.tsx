import { baseURL } from "@/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import LottieView from "lottie-react-native";
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

  // track loading states
  const [loadingImages, setLoadingImages] = useState<{
    [key: string]: boolean;
  }>({});

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
        <LottieView
          source={require("../assets/lottie/fUotSZvXcr.json")}
          autoPlay
          loop
          style={{ width: 140, height: 140 }}
        />
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

  const services =
    (data.vendors as any)?.flatMap((vendor: any) =>
      vendor.services.map((service: any) => ({
        ...service,
        vendorName: vendor.business_name,
        vendorLogo: vendor.logo,
      }))
    ) ?? [];
  // setSelectedService(item)
  const renderService = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        console.log("Service ID:", item._id);
        router.push(`/(vendorD)/(serviceInfo)/${item._id}`);
      }}
      onLongPress={() => {
        setSelectedService(item);
      }}
    >
      <View>
        <Image
          source={{ uri: buildImageUrl(item.image) }}
          style={styles.cardImage}
          onLoadStart={() =>
            setLoadingImages((prev) => ({ ...prev, [item._id]: true }))
          }
          onLoadEnd={() =>
            setLoadingImages((prev) => ({ ...prev, [item._id]: false }))
          }
        />
        {loadingImages[item._id] && (
          <View style={styles.imageSpinnerOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.serviceName}>{item.name}</Text>

        <View style={{ alignItems: "flex-end", marginTop: -8 }}>
          <Text style={styles.priceTag}>{item.price} KD</Text>
        </View>

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

      {/* Service Details Modal */}
      {selectedService && (
        <Modal
          visible={!!selectedService}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSelectedService(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <View style={{ flexDirection: "column" }}>
                    <Text style={styles.modalTitle}>
                      {selectedService.name}
                    </Text>
                    {selectedService.type && (
                      <Text style={styles.modalType}>
                        Type: {selectedService.type}
                      </Text>
                    )}
                  </View>

                  <View style={{ alignSelf: "flex-start", marginTop: 10 }}>
                    <Image
                      source={require("../assets/images/Logo-withoutbg.png")}
                      style={{ width: 100, height: 40 }}
                    />
                  </View>
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
                    <Text style={styles.modalPrice}>
                      {selectedService.price} KD
                    </Text>
                  </View>
                )}

                {selectedService.time && (
                  <Text style={styles.modalTimeRow}>
                    Duration: {selectedService.time}
                  </Text>
                )}

                <View style={{ flex: 1 }} />
                <View
                  style={{
                    width: 200,
                    height: 2,
                    backgroundColor: colors.accent,
                    alignSelf: "center",
                    marginVertical: 10,
                    borderRadius: 1,
                  }}
                />

                {selectedService.description && (
                  <Text style={styles.modalDescription}>
                    {selectedService.description}
                  </Text>
                )}
              </ScrollView>

              <TouchableOpacity
                style={styles.closeButtonWide}
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
  serviceName: { fontSize: 18, fontWeight: "bold", color: colors.text },
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
  modalType: { fontSize: 16, fontWeight: "600", color: colors.text },
  modalPrice: {
    backgroundColor: colors.accent,
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    overflow: "hidden",
    marginLeft: "auto",
  },
  modalImage: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginVertical: 10,
  },
  modalVendorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  modalVendorLogo: { width: 30, height: 30, borderRadius: 15, marginRight: 8 },
  modalVendorName: { fontSize: 16, fontWeight: "600", color: colors.text },
  modalTimeRow: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 10,
    marginLeft: 38,
  },
  modalDescription: {
    fontSize: 16,
    color: colors.text,
    textAlign: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: -30,
    color: colors.primary,
    marginLeft: 23,
  },
  closeButtonWide: {
    backgroundColor: colors.accent,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    width: "35%",
    alignSelf: "center",
  },
  closeButtonText: { color: colors.white, fontWeight: "bold", fontSize: 18 },
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
  imageSpinnerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
});
