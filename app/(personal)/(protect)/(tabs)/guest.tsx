import { getAllEvents } from "@/api/event";
import { getInvitesByEvent } from "@/api/invite";
import colors from "@/components/Colors";
import CustomButton from "@/components/customButton";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

enum RSVPStatus {
  Pending = "Pending",
  Attending = "Attending",
  NotAttending = "NotAttending",
}

interface Guest {
  _id: string;
  guestName: string;
  guestEmail: string;
  rsvpStatus: RSVPStatus;
  event?: { _id: string };
}

interface DecodedToken {
  _id: string;
  email: string;
  username?: string;
  exp: number;
}

const Guest = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>([]);
  const [activeFilter, setActiveFilter] = useState<
    "All" | "Attending" | "Pending" | "Declined"
  >("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadUserId = async () => {
      const token = await SecureStore.getItemAsync("token");
      if (token) {
        const decoded: DecodedToken = jwtDecode(token);
        setUserId(decoded._id);
      }
    };
    loadUserId();
  }, []);

  const fetchEventAndGuests = async () => {
    if (!userId) return;

    try {
      setLoading(true);

      const events = await getAllEvents();
      const userEvents = events.filter((e: any) => String(e.user) === userId);

      if (userEvents.length === 0) {
        console.log("No events for this user");
        return;
      }

      const firstEventId = userEvents[0]._id;

      const res = await getInvitesByEvent(firstEventId);
      setGuests(res.invites);
      setFilteredGuests(res.invites);
    } catch (err) {
      console.log("Error fetching events/guests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchEventAndGuests();
    }
  }, [userId]);

  const applyFilter = (filter: typeof activeFilter) => {
    setActiveFilter(filter);
    if (filter === "All") {
      setFilteredGuests(guests);
    } else if (filter === "Declined") {
      setFilteredGuests(
        guests.filter((g) => g.rsvpStatus === RSVPStatus.NotAttending)
      );
    } else {
      setFilteredGuests(
        guests.filter((g) => g.rsvpStatus === (filter as RSVPStatus))
      );
    }
  };

  useEffect(() => {
    let filtered = guests;
    if (activeFilter !== "All") {
      filtered =
        activeFilter === "Declined"
          ? filtered.filter((g) => g.rsvpStatus === RSVPStatus.NotAttending)
          : filtered.filter(
              (g) => g.rsvpStatus === (activeFilter as RSVPStatus)
            );
    }
    if (search.trim()) {
      filtered = filtered.filter(
        (g) =>
          g.guestName.toLowerCase().includes(search.toLowerCase()) ||
          g.guestEmail.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilteredGuests(filtered);
  }, [search, activeFilter, guests]);

  const renderGuest = ({ item }: { item: Guest }) => (
    <View style={styles.guestCard}>
      <View>
        <Text style={styles.guestName}>{item.guestName}</Text>
        <Text style={styles.guestEmail}>{item.guestEmail}</Text>
      </View>
      <View
        style={[
          styles.status,
          item.rsvpStatus === RSVPStatus.Attending
            ? styles.attending
            : item.rsvpStatus === RSVPStatus.Pending
            ? styles.pending
            : styles.declined,
        ]}
      >
        <Text style={styles.statusText}>
          {item.rsvpStatus === RSVPStatus.NotAttending
            ? "Declined"
            : item.rsvpStatus}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Counters Box */}
      <View style={styles.counterBox}>
        <View style={styles.counterItem}>
          <Text style={styles.counterNumber}>{guests.length}</Text>
          <Text style={styles.counterLabel}>Invited</Text>
        </View>
        <View style={styles.counterItem}>
          <Text style={[styles.counterNumber, { color: colors.secondary }]}>
            {guests.filter((g) => g.rsvpStatus === RSVPStatus.Attending).length}
          </Text>
          <Text style={styles.counterLabel}>Attending</Text>
        </View>
        <View style={[styles.counterItem, styles.counterItemLast]}>
          <Text style={[styles.counterNumber, { color: colors.danger }]}>
            {
              guests.filter((g) => g.rsvpStatus === RSVPStatus.NotAttending)
                .length
            }
          </Text>
          <Text style={styles.counterLabel}>Declined</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* search */}
      <TextInput
        placeholder="Search guests..."
        value={search}
        onChangeText={setSearch}
        style={styles.search}
        placeholderTextColor={"grey"}
      />

      {/* filter tabs */}
      <View style={styles.tabs}>
        {["All", "Attending", "Pending", "Declined"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeFilter === tab && styles.tabActive]}
            onPress={() => applyFilter(tab as any)}
          >
            <Text
              style={[
                styles.tabText,
                activeFilter === tab && styles.tabTextActive,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* guests list */}
      <FlatList
        data={filteredGuests}
        keyExtractor={(item) => item._id}
        renderItem={renderGuest}
        refreshing={loading}
        onRefresh={fetchEventAndGuests}
        ListEmptyComponent={
          !loading ? (
            <Text style={{ textAlign: "center", marginTop: 20 }}>
              No guests found
            </Text>
          ) : null
        }
      />
      <View style={{ alignItems: "center", marginVertical: 20 }}>
        <CustomButton
          text="+ Add Guest"
          onPress={() => router.push("/invitetemplate")}
          variant="primary"
        />
      </View>
    </View>
  );
};

export default Guest;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: colors.backgroundLight },

  search: {
    borderWidth: 1,
    borderColor: colors.neutral,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    backgroundColor: colors.white,
    color: colors.black,
  },

  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
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

  guestCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.neutral,
  },
  guestName: { fontWeight: "bold", fontSize: 16, color: colors.black },
  guestEmail: { color: colors.secondary },

  status: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontWeight: "bold", color: colors.black },

  attending: { backgroundColor: colors.backgroundMuted },
  pending: { backgroundColor: colors.accent },
  declined: { backgroundColor: colors.danger },

  counterBox: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderRadius: 12,
    paddingVertical: 20,
    marginBottom: 8,
  },
  counterItem: {
    alignItems: "center",
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: colors.primary,
  },
  counterItemLast: {
    borderRightWidth: 0,
  },
  counterNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
  },
  counterLabel: {
    fontSize: 14,
    color: colors.secondary,
    marginTop: 4,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    marginBottom: 12,
  },
});
