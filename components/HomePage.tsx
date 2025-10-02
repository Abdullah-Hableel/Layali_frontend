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
  time?: string;
  description?: string;
  type?: string;
};

// 5-phase budget ranges, last phase = All
const budgetSteps = [0, 100, 500, 1000, Infinity];

const HomePage = () => {
  const [searchText, setSearchText] = useState("");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingImages, setLoadingImages] = useState<{
    [key: string]: boolean;
  }>({});
  const [modalImageLoading, setModalImageLoading] = useState(true);

  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    "All"
  );
  const [budgetStepIndex, setBudgetStepIndex] = useState<number>(
    budgetSteps.length - 1
  );

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

    const matchesCategory =
      selectedCategory && selectedCategory !== "All"
        ? service.categories.some((c) => c.name === selectedCategory)
        : true;

    const min = budgetSteps[budgetStepIndex];
    const max = budgetSteps[budgetStepIndex + 1] || Infinity;
    const matchesBudget =
      budgetStepIndex === budgetSteps.length - 1
        ? true
        : service.price >= min && service.price <= max;

    return matchesSearch && matchesCategory && matchesBudget;
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
      onPress={() => {
        setSelectedService(item);
        setModalImageLoading(true);
      }}
    >
      <View>
        <Image
          source={{
            uri:
              buildImageUrl(item.image) ||
              "https://via.placeholder.com/300x180",
          }}
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

      {/* Search + Filter */}
      <View style={styles.searchWrapper}>
        <Feather name="search" size={20} color={colors.text} />
        <TextInput
          placeholder="Search services..."
          placeholderTextColor="#888"
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
        />
        <TouchableOpacity onPress={() => setFilterVisible(true)}>
          <Feather name="sliders" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Applied Filters Display */}
      <View style={styles.appliedFilters}>
        <Text style={styles.appliedFilterText}>
          Category: {selectedCategory || "All"}
        </Text>
        <Text style={styles.appliedFilterText}>
          Price:{" "}
          {budgetStepIndex === budgetSteps.length - 1
            ? "All"
            : `${budgetSteps[budgetStepIndex]}+${
                budgetStepIndex === budgetSteps.length - 2
                  ? ""
                  : budgetSteps[budgetStepIndex + 1]
              } KD`}
        </Text>
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

      {/* Service Modal */}
      {selectedService && (
        <Modal
          visible={!!selectedService}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSelectedService(null)}
        >
          <View style={styles.modalOverlay}>
            {/* Spinner overlay */}
            {modalImageLoading && (
              <View style={styles.modalSpinnerOverlay}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            )}

            {/* Modal Content */}
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

                {buildImageUrl(selectedService.image) && (
                  <Image
                    source={{
                      uri:
                        buildImageUrl(selectedService.image) ||
                        "https://via.placeholder.com/300x180",
                    }}
                    style={styles.modalImage}
                    onLoadStart={() => setModalImageLoading(true)}
                    onLoadEnd={() => setModalImageLoading(false)}
                  />
                )}

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

                <View style={{ marginLeft: 38 }}>
                  <Text style={styles.modalSection}>Categories:</Text>
                  <Text style={styles.modalText}>
                    {selectedService.categories
                      .map((cat) => cat.name)
                      .join(", ")}
                  </Text>
                </View>

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

                {/* Close Button at the bottom */}
                <TouchableOpacity
                  style={[
                    styles.closeButton,
                    { marginTop: 15, alignSelf: "center", width: 100 },
                  ]}
                  onPress={() => setSelectedService(null)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Filter Modal */}
      {filterVisible && (
        <Modal
          visible={filterVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setFilterVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxHeight: "60%" }]}>
              <Text style={{ fontWeight: "600", marginBottom: 5 }}>
                Category
              </Text>
              <ScrollView style={{ maxHeight: 200 }}>
                <TouchableOpacity
                  onPress={() => setSelectedCategory("All")}
                  style={{
                    padding: 8,
                    backgroundColor:
                      selectedCategory === "All" ? colors.primary : "#eee",
                    marginVertical: 2,
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      color:
                        selectedCategory === "All" ? colors.white : colors.text,
                    }}
                  >
                    All
                  </Text>
                </TouchableOpacity>
                {Array.from(
                  new Set(
                    services.flatMap((s) => s.categories.map((c) => c.name))
                  )
                ).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    style={{
                      padding: 8,
                      backgroundColor:
                        selectedCategory === cat ? colors.primary : "#eee",
                      marginVertical: 2,
                      borderRadius: 8,
                    }}
                  >
                    <Text
                      style={{
                        color:
                          selectedCategory === cat ? colors.white : colors.text,
                      }}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={{ fontWeight: "600", marginTop: 15 }}>Price</Text>
              <Text style={{ marginBottom: 5 }}>
                {budgetStepIndex === budgetSteps.length - 1
                  ? "All"
                  : `${budgetSteps[budgetStepIndex]}+${
                      budgetStepIndex === budgetSteps.length - 2
                        ? ""
                        : budgetSteps[budgetStepIndex + 1]
                    } KD`}
              </Text>
              <Slider
                minimumValue={0}
                maximumValue={budgetSteps.length - 1}
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
                <Text>0-100</Text>
                <Text>100-500</Text>
                <Text>500-1000</Text>
                <Text>1000+</Text>
                <Text>All</Text>
              </View>

              <TouchableOpacity
                style={[styles.closeButton, { marginTop: 15 }]}
                onPress={() => setFilterVisible(false)}
              >
                <Text style={styles.closeButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

export default HomePage;

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
  searchInput: { flex: 1, marginLeft: 8, color: colors.text, fontSize: 16 },
  appliedFilters: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: 10,
  },
  appliedFilterText: { color: colors.primary, fontWeight: "600" },
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
    marginBottom: 10,
    marginTop: 10,
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
  modalSection: { fontSize: 16, color: colors.text, fontWeight: "600" },
  modalText: { fontSize: 14, color: colors.text },
  modalDescription: {
    fontSize: 16,
    color: colors.text,
    textAlign: "center",
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 15,
    alignItems: "center",
  },
  closeButtonText: { color: colors.white, fontWeight: "bold" },
  logoWrapper: { alignItems: "center", marginTop: -50, marginBottom: 10 },
  logo: { width: 150, height: 60 },
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
  modalSpinnerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
});
