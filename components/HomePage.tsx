import { Feather } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
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

const SERVER_URL = "http://172.20.10.5:8000/uploads/"; // put ur ip

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
const contactInfo = [
  {
    id: "1",
    label: "Phone",
    value: "+965 94977560",
    icon: "phone",
    onPress: () => Linking.openURL("tel:+96594977560"),
  },
  {
    id: "2",
    label: "Email",
    value: "Layali@gmail.com",
    icon: "mail",
    onPress: () => Linking.openURL("mailto:Layali@gmail.com"),
  },
  {
    id: "3",
    label: "Website",
    value: "www.Layali.com",
    icon: "globe",
    onPress: () => Linking.openURL("https://www.Layali.com"),
  },
  {
    id: "4",
    label: "Instagram",
    value: "@Layali_kw",
    icon: "instagram",
    onPress: () => Linking.openURL("https://www.instagram.com/Layali_kw"),
  },
];
const HomePage = () => {
  const [searchText, setSearchText] = useState("");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: getServices,
  });

  const services = data ?? [];

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchText.toLowerCase())
  );

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
      <Text style={styles.serviceName}>{item.name}</Text>
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
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoWrapper}>
        <Image
          source={require("../assets/images/Logo-withoutbg.png")} // adjust the path to your logo
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <View style={styles.contactGrid}>
        {contactInfo.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.contactCard}
            onPress={item.onPress}
          >
            <Feather name={item.icon as any} size={20} color={colors.primary} />
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.contactLabel}>{item.label}</Text>
              <Text style={styles.contactValue}>{item.value}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      {/* Search Bar */}
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

      {/* Service List */}
      <FlatList
        data={filteredServices}
        keyExtractor={(item) => item._id}
        renderItem={renderService}
        contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No services found 🔍</Text>
        }
      />

      {/* Modal */}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundLight },
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
  serviceName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginHorizontal: 10,
    marginTop: 10,
    marginBottom: 5,
  },
  vendorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
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
    marginBottom: 10,
    textAlign: "center",
    color: colors.text,
  },
  modalImage: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginBottom: 15,
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
  contactGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 20,
  },
  contactCard: {
    backgroundColor: colors.backgroundMuted,
    width: "48%",
    borderRadius: 12,
    padding: 7,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowOffset: { width: 3, height: 9 },
    shadowRadius: 5,
    elevation: 3,
  },
  contactLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.secondary,
  },
  contactValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 2,
  },
  logoWrapper: {
    alignItems: "center",
    marginTop: -50, // adjust spacing from status bar
    marginBottom: 10, // spacing before contact grid
  },
  logo: {
    width: 150, // adjust size as needed
    height: 60, // adjust height as needed
  },
});
