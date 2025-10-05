import { getAllGiftCards } from "@/api/giftCards";
import colors from "@/components/Colors";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface DecodedToken {
  _id: string;
  email: string;
  username?: string;
}

interface GiftCard {
  _id: string;
  sender: {
    _id: string;
    name?: string;
    email: string;
  };
  couple: {
    _id: string;
    name?: string;
    email: string;
  };
  amount: number;
  status: string;
  expirationDate?: string;
  createdAt: string;
}

const MyGiftCardsScreen = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [activeTab, setActiveTab] = useState<"Received" | "Sent">("Received");
  const [filteredCards, setFilteredCards] = useState<GiftCard[]>([]);

  // decode current user
  useEffect(() => {
    const loadUser = async () => {
      const token = await SecureStore.getItemAsync("token");
      if (token) {
        const decoded: DecodedToken = jwtDecode(token);
        setUserId(decoded._id);
      }
    };
    loadUser();
  }, []);

  // fetch all cards
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const all = await getAllGiftCards();
        setGiftCards(all);
      } catch (err) {
        console.log("Error fetching gift cards:", err);
      }
    };
    fetchCards();
  }, []);

  // filter by active tab
  useEffect(() => {
    if (!userId) return;

    const filtered =
      activeTab === "Received"
        ? giftCards.filter((g) => g.couple?._id === userId)
        : giftCards.filter((g) => g.sender?._id === userId);

    setFilteredCards(filtered);
  }, [activeTab, giftCards, userId]);

  const renderCard = ({ item }: { item: GiftCard }) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.email}>
          {activeTab === "Received"
            ? `From: ${item.sender.email}`
            : `To: ${item.couple.email}`}
        </Text>
        <Text style={styles.amount}>Amount: {item.amount} KWD</Text>
        <Text style={styles.status}>Status: {item.status}</Text>
        <Text style={styles.date}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  const totalReceived = giftCards.filter(
    (g) => g.couple?._id === userId
  ).length;
  const totalSent = giftCards.filter((g) => g.sender?._id === userId).length;

  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>My Gift Cards</Text> */}

      {/* Summary Counters */}
      <View style={styles.summaryBox}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{totalReceived}</Text>
          <Text style={styles.summaryLabel}>Received</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNumber, { color: colors.primary }]}>
            {totalSent}
          </Text>
          <Text style={styles.summaryLabel}>Sent</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {["Received", "Sent"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filteredCards}
        keyExtractor={(item) => item._id}
        renderItem={renderCard}
        ListEmptyComponent={
          <Text
            style={{
              textAlign: "center",
              marginTop: 30,
              color: colors.placeholder,
            }}
          >
            No {activeTab.toLowerCase()} gift cards yet.
          </Text>
        }
      />
    </View>
  );
};

export default MyGiftCardsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundMuted,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 16,
  },
  summaryBox: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutral,
  },
  summaryItem: { alignItems: "center" },
  summaryNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.secondary,
  },
  summaryLabel: { color: colors.placeholder },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.secondary,
    backgroundColor: colors.white,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: { color: colors.secondary },
  tabTextActive: { color: colors.white, fontWeight: "bold" },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.neutral,
    padding: 16,
    marginBottom: 10,
  },
  email: { color: colors.text, fontWeight: "600", marginBottom: 4 },
  amount: { color: colors.primary, fontWeight: "bold" },
  status: { color: colors.secondary, marginTop: 4 },
  date: { color: colors.placeholder, marginTop: 2, fontSize: 12 },
});
