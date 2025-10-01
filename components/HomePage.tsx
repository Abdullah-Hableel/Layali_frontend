import { baseURL } from "@/api";
import { Feather } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getServices } from "../api/service";
import colors from "../components/Colors";

const SERVER_URL = `${baseURL}/uploads/`;
const buildImageUrl = (img?: string) =>
  img ? `${SERVER_URL}${img}` : undefined;

type Vendor = { _id: string; business_name: string; logo?: string } | null;
type Category = { _id: string; name: string };
type Service = {
  _id: string;
  name: string;
  image?: string;
  price: number;
  vendor: Vendor;
  categories: Category[];
};

// ← 5-phase budget ranges, last phase = All
const budgetSteps = [0, 100, 500, 1000, Infinity];

const HomePage = () => {
  const [searchText, setSearchText] = useState("");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [budgetStepIndex, setBudgetStepIndex] = useState<number>(0);

  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: getServices,
  });

  const services = data ?? [];

  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name
      .toLowerCase()
      .includes(searchText.toLowerCase());

    if (budgetStepIndex === budgetSteps.length - 1) {
      // last phase: show all
      return matchesSearch;
    }

    const min = budgetSteps[budgetStepIndex];
    const max = budgetSteps[budgetStepIndex + 1];
    const matchesBudget = service.price >= min && service.price <= max;

    return matchesSearch && matchesBudget;
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["services"] });
    setRefreshing(false);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={{ color: colors.danger, fontSize: 18 }}>
          Failed to load services 😔
        </Text>
      </View>
    );
  }

  const renderService = ({ item }: { item: Service }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => setSelectedService(item)}
    >
      <Image
        source={{
          uri:
            buildImageUrl(item.image) || "https://via.placeholder.com/300x180",
        }}
        style={styles.cardImage}
      />

      <View style={styles.cardContent}>
        <Text style={styles.serviceName}>{item.name}</Text>

        <View style={{ alignItems: "flex-end", marginTop: -8 }}>
          <Text style={styles.priceTag}>{item.price} KD</Text>
        </View>

        {item.vendor && (
          <View style={styles.vendorRow}>
            <Image
              source={{
                uri:
                  buildImageUrl(item.vendor.logo) ||
                  "https://via.placeholder.com/30",
              }}
              style={styles.vendorLogo}
            />
            <Text style={styles.vendorName}>{item.vendor.business_name}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.logoWrapper}>
        <Image
          source={require("../assets/images/Logo-withoutbg.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.searchWrapper}>
        <Feather name="search" size={20} color={colors.text} />
        <TextInput
          placeholder="Search services..."
          placeholderTextColor="#888"
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
        />
      </View>

      {/* ← 5-phase Budget Slider with aligned labels */}
      <View style={{ marginHorizontal: 20, marginBottom: 10 }}>
        <Text style={{ color: colors.text, marginBottom: 5 }}>
          Budget:{" "}
          {budgetStepIndex === budgetSteps.length - 1
            ? "All"
            : `${budgetSteps[budgetStepIndex]} - ${
                budgetStepIndex === budgetSteps.length - 2
                  ? "∞"
                  : budgetSteps[budgetStepIndex + 1]
              } KD`}
        </Text>
        <Slider
          minimumValue={0}
          maximumValue={budgetSteps.length - 1} // 5 phases
          step={1}
          value={budgetStepIndex}
          onValueChange={setBudgetStepIndex}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor="#ccc"
          thumbTintColor={colors.primary}
        />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 5,
          }}
        >
          <Text style={{ color: colors.text }}>0</Text>
          <Text style={{ color: colors.text }}>100</Text>
          <Text style={{ color: colors.text }}>500</Text>
          <Text style={{ color: colors.text }}>1000+</Text>
          <Text style={{ color: colors.text }}>All</Text>
        </View>
      </View>

      <FlatList
        data={filteredServices}
        keyExtractor={(item) => item._id}
        renderItem={renderService}
        contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No services found 🔍</Text>
        }
      />

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
                <Text style={styles.modalTitle}>{selectedService.name}</Text>

                <View style={{ alignItems: "flex-end", marginTop: -25 }}>
                  <Text style={styles.modalPrice}>
                    {selectedService.price} KD
                  </Text>
                </View>

                <Image
                  source={{
                    uri:
                      buildImageUrl(selectedService.image) ||
                      "https://via.placeholder.com/300x180",
                  }}
                  style={styles.modalImage}
                />

                {selectedService.vendor && (
                  <View style={styles.modalVendorRow}>
                    <Image
                      source={{
                        uri:
                          buildImageUrl(selectedService.vendor.logo) ||
                          "https://via.placeholder.com/30",
                      }}
                      style={styles.modalVendorLogo}
                    />
                    <Text style={styles.modalVendorName}>
                      {selectedService.vendor.business_name}
                    </Text>
                  </View>
                )}

                <Text style={styles.modalSection}>Categories:</Text>
                <Text style={styles.modalText}>
                  {selectedService.categories.map((cat) => cat.name).join(", ")}
                </Text>
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
    </SafeAreaView>
  );
};

export default HomePage;

// ← Styles unchanged
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundMuted },
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
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: colors.text,
    fontSize: 16,
  },
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
  cardImage: {
    width: "100%",
    height: 180,
  },
  cardContent: {
    paddingHorizontal: 10,
    paddingTop: 8,
  },
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
  vendorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -15,
  },
  vendorLogo: { width: 30, height: 30, borderRadius: 15, marginRight: 8 },
  vendorName: { fontSize: 14, color: colors.text, fontWeight: "500" },
  emptyText: {
    color: colors.text,
    fontSize: 16,
    marginTop: 20,
    textAlign: "center",
  },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

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
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text,
    flex: 1,
  },
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
  modalVendorLogo: { width: 30, height: 30, borderRadius: 15, marginRight: 8 },
  modalVendorName: { fontSize: 16, fontWeight: "600", color: colors.text },
  modalSection: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    color: colors.text,
  },
  modalText: { fontSize: 14, marginTop: 5, color: colors.text },
  closeButton: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 15,
    alignItems: "center",
  },
  closeButtonText: { color: colors.white, fontWeight: "bold" },
  logoWrapper: {
    alignItems: "center",
    marginTop: -50,
    marginBottom: 10,
  },
  logo: {
    width: 150,
    height: 60,
  },
});
