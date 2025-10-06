import { getAllCategory } from "@/api/category";
import { getVendor } from "@/api/vendor";
import { Category } from "@/data/category";
import { buildImageUrl } from "@/Utils/buildImage";
import { capitalizeWords } from "@/Utils/capitalize";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import colors from "./Colors";

const Vendor = () => {
  const [search, setSearch] = useState("");
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categorySearch, setCategorySearch] = useState("");

  const {
    data: vendors = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["vendor"],
    queryFn: getVendor,
  });

  const { data: allCategories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: getAllCategory,
  });

  const filtered = vendors.filter((vendor: any) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = (vendor?.business_name || "")
      .toLowerCase()
      .includes(query);

    const matchesCategory =
      selectedCategory === "All"
        ? true
        : Array.isArray(vendor.categories) &&
          vendor.categories.some(
            (c: any) =>
              (typeof c === "string" ? c : c?.name) === selectedCategory
          );

    if (!search && selectedCategory === "All") return true;
    if (search && selectedCategory !== "All")
      return matchesSearch && matchesCategory; // AND
    return search ? matchesSearch : matchesCategory;
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

  return (
    <View style={styles.root}>
      {/* Search & Filter Bar */}
      <View style={styles.searchWrapper}>
        <Feather name="search" size={20} color={colors.text} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by shop name..."
          placeholderTextColor="#888"
          style={styles.searchInput}
        />
        <TouchableOpacity onPress={() => setFilterVisible(true)}>
          <Feather name="sliders" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.giftCardCta}
        activeOpacity={0.9}
        onPress={() => router.push("/creategiftcard")}
      >
        <View style={styles.giftCardLeft}>
          <Feather name="gift" size={20} color={colors.white} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.giftCardTitle}>Send a Gift Card</Text>
          <Text style={styles.giftCardSubtitle} numberOfLines={1}>
            Surprise someone special with Layali 🎁
          </Text>
        </View>
        <Feather name="chevron-right" size={20} color={colors.white} />
      </TouchableOpacity>

      {(selectedCategory !== "All" || search.trim() !== "") && (
        <View style={styles.filterInfo}>
          <Text style={styles.filterText}>
            {search ? `Search: "${search}"` : ""}
            {search && selectedCategory !== "All" ? " · " : ""}
            {selectedCategory !== "All" ? `Category: ${selectedCategory}` : ""}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setSearch("");
              setSelectedCategory("All");
              setCategorySearch("");
            }}
          >
            <Text style={styles.clearFilter}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 20 }}
        data={filtered}
        keyExtractor={(item: any, index) => String(item?._id ?? index)}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {search || selectedCategory !== "All"
              ? "No matching vendors 🔍"
              : "No vendors available"}
          </Text>
        }
        renderItem={({ item }) => {
          const uri =
            buildImageUrl(item.logo) ||
            require("../assets/images/NotFoundimg.png");

          const categories: string[] = Array.isArray(item.categories)
            ? item.categories
                .map((c: any) => (typeof c === "string" ? c : c?.name))
                .filter(Boolean)
            : [];

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

                {categories.length > 0 && (
                  <View style={styles.categoryRow}>
                    {categories.map((cat, idx) => (
                      <View
                        key={`${item._id}-${idx}`}
                        style={styles.categoryChip}
                      >
                        <Text style={styles.categoryChipText}>
                          {capitalizeWords(cat)}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {filterVisible && (
        <Modal
          visible={filterVisible}
          animationType="fade"
          transparent
          onRequestClose={() => setFilterVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Filter by Category</Text>

              <TextInput
                placeholder="Search category..."
                placeholderTextColor="#999"
                style={styles.modalSearchInput}
                value={categorySearch}
                onChangeText={setCategorySearch}
              />

              <View style={styles.modalDivider} />

              <ScrollView
                style={{ maxHeight: 260 }}
                contentContainerStyle={{ paddingVertical: 6 }}
                showsVerticalScrollIndicator={false}
              >
                <TouchableOpacity
                  key="__all__"
                  onPress={() => setSelectedCategory("All")}
                  activeOpacity={0.8}
                  style={[
                    styles.modalOption,
                    selectedCategory === "All" && styles.modalOptionSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      selectedCategory === "All" &&
                        styles.modalOptionTextSelected,
                    ]}
                  >
                    All
                  </Text>
                  {selectedCategory === "All" && (
                    <Feather name="check" size={18} color={colors.primary} />
                  )}
                </TouchableOpacity>

                {(allCategories as Category[])
                  .filter((cat) =>
                    (cat?.name || "")
                      .toLowerCase()
                      .includes(categorySearch.trim().toLowerCase())
                  )
                  .map((cat, idx) => {
                    const name = cat?.name || "";
                    const key = String(cat?._id || `${name}-${idx}`);
                    return (
                      <TouchableOpacity
                        key={key}
                        onPress={() => setSelectedCategory(name)}
                        activeOpacity={0.8}
                        style={[
                          styles.modalOption,
                          selectedCategory === name &&
                            styles.modalOptionSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.modalOptionText,
                            selectedCategory === name &&
                              styles.modalOptionTextSelected,
                          ]}
                        >
                          {capitalizeWords(name)}
                        </Text>
                        {selectedCategory === name && (
                          <Feather
                            name="check"
                            size={18}
                            color={colors.primary}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
              </ScrollView>

              <View style={styles.modalDivider} />

              <TouchableOpacity
                style={styles.applyButton}
                activeOpacity={0.9}
                onPress={() => setFilterVisible(false)}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
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
  },
  searchInput: { flex: 1, marginLeft: 8, color: colors.text, fontSize: 16 },

  giftCardCta: {
    marginHorizontal: 20,
    marginTop: -8,
    marginBottom: 8,
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
    color: colors.white,
    opacity: 0.95,
    fontSize: 12,
  },

  filterInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: 10,
    alignItems: "center",
  },
  filterText: { color: colors.text, fontSize: 14 },
  clearFilter: { color: colors.secondary, fontWeight: "600" },

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
  meta: { color: colors.secondary, fontSize: 14, marginTop: 4 },

  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  categoryChip: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  categoryChipText: {
    color: colors.secondary,
    fontSize: 12,
    fontWeight: "600",
  },

  emptyText: {
    color: colors.text,
    fontSize: 16,
    marginTop: 20,
    textAlign: "center",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.secondary,
    marginBottom: 10,
    textAlign: "center",
  },
  modalSearchInput: {
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    color: colors.text,
    marginBottom: 10,
    fontSize: 15,
  },
  modalDivider: {
    height: 1,
    backgroundColor: colors.neutral,
    opacity: 0.6,
    borderRadius: 0.5,
    marginVertical: 10,
  },
  modalOption: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalOptionSelected: { backgroundColor: colors.accent + "22" },
  modalOptionText: { fontSize: 16, color: colors.text },
  modalOptionTextSelected: { color: colors.primary, fontWeight: "700" },
  applyButton: {
    marginTop: 15,
    backgroundColor: colors.backgroundPink,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  applyButtonText: { color: colors.white, fontWeight: "bold" },
});
