import { baseURL } from "@/api";
import { Feather } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
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
  const [categorySearchText, setCategorySearchText] = useState(""); // For category search
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
        <LottieView
          source={require("../assets/lottie/fUotSZvXcr.json")}
          autoPlay
          loop
          style={{ width: 140, height: 140 }}
        />{" "}
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

  // Filtered and unique categories for the filter modal
  const uniqueCategories = Array.from(
    new Set(services.flatMap((s) => s.categories.map((c) => c.name)))
  ).filter((cat) =>
    cat.toLowerCase().includes(categorySearchText.toLowerCase())
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

      {/* Send a Gift Button (styled like Vendor's Gift Card button) */}
      {/* Send a Gift Button */}
      <TouchableOpacity
        style={styles.giftCardCta}
        activeOpacity={0.9}
        onPress={() => router.push("/creategiftcard")}
      >
        {/* Left icon */}
        <View style={styles.giftCardLeft}>
          <Feather name="gift" size={20} color={colors.white} />
        </View>

        {/* Title + Subtitle */}
        <View style={{ flexDirection: "column", flex: 1 }}>
          <Text style={styles.giftCardTitle}>Send a Gift?</Text>
          <Text style={{ color: colors.white, fontSize: 12, opacity: 0.9 }}>
            Send a gift for your customers 🎁
          </Text>
        </View>

        {/* Chevron right */}
        <Feather name="chevron-right" size={20} color={colors.white} />
      </TouchableOpacity>

      {/* Selected Category & Price below the button */}
      {/* Selected Category & Price in one row */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginHorizontal: 20,
          marginBottom: 10,
        }}
      >
        <Text style={styles.giftCardSubtitle}>
          Category:{" "}
          <Text style={{ fontWeight: "bold" }}>
            {selectedCategory === "All" ? "All" : selectedCategory}
          </Text>
        </Text>

        <Text style={styles.giftCardSubtitle}>
          Price:{" "}
          <Text style={{ fontWeight: "bold" }}>
            {budgetStepIndex === budgetSteps.length - 1
              ? "All"
              : budgetStepIndex === budgetSteps.length - 2
              ? `${budgetSteps[budgetStepIndex]}+ KD`
              : `${budgetSteps[budgetStepIndex]}-${
                  budgetSteps[budgetStepIndex + 1]
                } KD`}
          </Text>
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
            {modalImageLoading && (
              <View style={styles.modalSpinnerOverlay}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            )}

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

                {/* Duration */}
                {selectedService.time && (
                  <Text
                    style={{
                      marginLeft: 38,
                      marginTop: -1,
                      color: colors.secondary,
                    }}
                  >
                    Duration: {selectedService.time}
                  </Text>
                )}

                {/* Categories */}
                <Text
                  style={{
                    marginLeft: 38,
                    marginTop: 4,
                    color: colors.secondary,
                  }}
                >
                  Categories: {"\n"}
                  <Text style={{ fontWeight: "bold" }}>
                    {selectedService.categories
                      .map((cat) => cat.name)
                      .join(", ")}
                  </Text>
                </Text>

                {/* Separation line stays */}
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

                {/* Description */}
                {selectedService.description && (
                  <View style={{ alignItems: "center" }}>
                    <Text
                      style={[
                        styles.modalDescription,
                        { color: colors.secondary },
                      ]}
                    >
                      {selectedService.description}
                    </Text>
                  </View>
                )}
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

              {/* Category search input */}
              <TextInput
                placeholder="Search category..."
                placeholderTextColor="#888"
                value={categorySearchText}
                onChangeText={setCategorySearchText}
                style={{
                  backgroundColor: "#f0f0f0",
                  padding: 8,
                  borderRadius: 8,
                  marginBottom: 8,
                  color: colors.text,
                }}
              />

              {/* Separator line */}
              <View
                style={{
                  height: 1,
                  backgroundColor: "#ccc",
                  borderRadius: 0.5,
                  marginBottom: 8,
                }}
              />

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
                {uniqueCategories.map((cat) => (
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
                  : budgetStepIndex === budgetSteps.length - 2
                  ? `${budgetSteps[budgetStepIndex]}+ KD`
                  : `${budgetSteps[budgetStepIndex]}-${
                      budgetSteps[budgetStepIndex + 1]
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

// ------------------------- STYLES -------------------------
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

  // ----- Gift Card button style from Vendor component -----
  giftCardCta: {
    marginHorizontal: 20,
    marginTop: -8,
    marginBottom: 10,
    backgroundColor: colors.backgroundPink,
    borderRadius: 14,
    borderColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  giftCardLeft: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#ffffff22",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  giftCardTitle: {
    color: colors.white,
    fontWeight: "800",
    fontSize: 15,
    marginBottom: 2,
  },
  giftCardSubtitle: {
    color: colors.secondary,
    opacity: 0.95,
    fontSize: 12,
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
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 24,
  },
  logoWrapper: { alignItems: "center", marginTop: -50, marginBottom: 10 },
  logo: { width: 150, height: 60 },
  imageSpinnerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#000000AA",
    justifyContent: "center",
  },
  modalSpinnerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    marginHorizontal: 20,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: { fontSize: 22, fontWeight: "bold", color: colors.text },
  modalType: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
    opacity: 0.7,
  },
  modalImage: { width: "100%", height: 220, marginTop: 10, borderRadius: 12 },
  modalVendorRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  modalVendorLogo: { width: 30, height: 30, borderRadius: 15, marginRight: 8 },
  modalVendorName: { fontSize: 14, fontWeight: "500", color: colors.text },
  modalPrice: {
    backgroundColor: colors.accent,
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
    paddingVertical: 3,
    paddingHorizontal: 12,
    borderRadius: 10,
    overflow: "hidden",
    marginLeft: "auto", // pushes it to the right
  },
  modalTimeRow: { fontSize: 14, marginTop: 8 },
  modalSection: { fontSize: 14, fontWeight: "600", marginTop: 10 },
  modalText: { fontSize: 14, marginTop: 4 },
  modalDescription: { fontSize: 14, marginTop: 10 },
  closeButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  closeButtonText: {
    color: colors.white,
    fontWeight: "600",
    textAlign: "center",
  },
});
