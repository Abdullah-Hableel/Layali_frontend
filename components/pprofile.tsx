import { getMyEventStats } from "@/api/event";
import { getAllGiftCards } from "@/api/giftCards";
import { getUserById, UserAttrs } from "@/api/users";
import { EventStats } from "@/data/events";
import { AntDesign, Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import LottieView from "lottie-react-native";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import colors from "./Colors";

const PersonalProfile = () => {
  const [userId, setUserId] = useState<string | null>(null);

  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery<UserAttrs>({
    queryKey: ["userProfile"],
    queryFn: getUserById,
  });

  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
  } = useQuery<EventStats>({
    queryKey: ["eventStats"],
    queryFn: getMyEventStats,
    refetchOnMount: "always",
  });

  useEffect(() => {
    const loadUser = async () => {
      const token = await SecureStore.getItemAsync("token");
      if (token) {
        const decoded: any = jwtDecode(token);
        setUserId(decoded._id);
      }
    };
    loadUser();
  }, []);

  const { data: giftCards = [] } = useQuery({
    queryKey: ["giftCards"],
    queryFn: getAllGiftCards,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
    enabled: !!userId,
  });

  const balance = React.useMemo(() => {
    if (!userId || !giftCards.length) return 0;
    const received = giftCards.filter(
      (g: { couple?: { _id?: string }; status?: string; amount?: number }) =>
        g.couple?._id === userId && g.status === "active"
    );
    return received.reduce(
      (sum: number, g: { amount?: number }) => sum + (g.amount || 0),
      0
    );
  }, [giftCards, userId]);

  const displayRole =
    user?.role === "Normal" ? "Personal Account" : user?.role || "";

  return (
    <View style={styles.root}>
      {isLoading || statsLoading ? (
        <View style={styles.center}>
          <LottieView
            source={require("../assets/lottie/fUotSZvXcr.json")}
            autoPlay
            loop
            style={{ width: 140, height: 140 }}
          />
        </View>
      ) : isError || statsError ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>
            {(error as Error)?.message || "Failed to load stats"}
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.headerCard}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: user?.image }} style={styles.avatar} />
            </View>

            <Text style={styles.name}>{user?.username || "User"}</Text>
            <Text style={styles.role}>{displayRole}</Text>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>
                  {statsLoading ? "—" : stats?.total ?? 0}
                </Text>
                <Text style={styles.statLabel}>Total Events</Text>
              </View>

              <View style={styles.verticalDivider} />

              <View style={styles.statBox}>
                <Text style={styles.statValue}>
                  {statsLoading ? "—" : stats?.upcoming ?? 0}
                </Text>
                <Text style={styles.statLabel}>Upcoming Events</Text>
              </View>

              <View style={styles.verticalDivider} />

              <View style={styles.statBox}>
                <Text style={styles.statValue}>
                  {statsLoading ? "—" : stats?.old ?? 0}
                </Text>
                <Text style={styles.statLabel}>Old Events</Text>
              </View>
            </View>
          </View>

          <View style={styles.giftCardHeader}>
            <TouchableOpacity onPress={() => router.push("/mygiftcards")}>
              <Text style={styles.giftTitle}>My Gift Cards</Text>
            </TouchableOpacity>
            <Text style={styles.balanceText}>Balance: {balance} KWD</Text>
          </View>

          <View style={styles.actionsCard}>
            <TouchableOpacity
              style={styles.actionItem}
              activeOpacity={0.85}
              onPress={() => router.push("/(personal)/(protect)/(tabs)/events")}
            >
              <Feather name="calendar" size={18} color={colors.secondary} />
              <Text style={styles.actionText}>My Events</Text>
              <Feather name="chevron-right" size={18} color="#9a9a9a" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.actionItem}
              activeOpacity={0.85}
              onPress={() => router.push("/(personal)/settings")}
            >
              <AntDesign
                name="customer-service"
                size={18}
                color={colors.secondary}
              />
              <Text style={styles.actionText}>Contact us</Text>
              <Feather name="chevron-right" size={18} color="#9a9a9a" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

export default PersonalProfile;

const cardRadius = 16;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.backgroundMuted, padding: 16 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.backgroundMuted,
  },
  errorText: { color: "red" },
  headerCard: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  avatarWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.backgroundLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    overflow: "hidden",
  },
  avatar: { width: 130, height: 130, borderRadius: 65 },
  name: { fontSize: 20, fontWeight: "700", color: "#333" },
  role: { fontSize: 13, color: "#999", marginTop: 2 },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginTop: 16,
    justifyContent: "space-around",
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  statValue: { fontSize: 18, fontWeight: "700", color: "#333" },
  statLabel: { fontSize: 12, color: "#777", textAlign: "center" },
  verticalDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.secondary,
    alignSelf: "stretch",
  },
  actionsCard: {
    backgroundColor: "#fff",
    borderRadius: cardRadius,
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 6,
  },
  actionText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#333",
    fontWeight: "600",
  },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#eee" },

  giftCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  giftTitle: {
    fontWeight: "700",
    fontSize: 15,
    color: colors.secondary,
  },
  balanceText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.secondary,
  },
});

// import { getMyEventStats } from "@/api/event";
// import { getUserById, UserAttrs } from "@/api/users";
// import { EventStats } from "@/data/events";
// import { AntDesign, Feather } from "@expo/vector-icons";
// import { useQuery } from "@tanstack/react-query";
// import { router } from "expo-router";
// import React from "react";
// import {
//   ActivityIndicator,
//   Image,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import colors from "./Colors";

// const PersonalProfile = () => {
//   const {
//     data: user,
//     isLoading,
//     isError,
//     error,
//   } = useQuery<UserAttrs>({
//     queryKey: ["userProfile"],
//     queryFn: getUserById,
//   });

//   const {
//     data: stats,
//     isLoading: statsLoading,
//     isError: statsError,
//   } = useQuery<EventStats>({
//     queryKey: ["eventStats"],
//     queryFn: getMyEventStats,
//     refetchOnMount: "always",
//   });

//   if (isLoading || statsLoading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator color={colors.secondary} />
//       </View>
//     );
//   }

//   if (isError || statsError) {
//     return (
//       <View style={styles.center}>
//         <Text style={styles.errorText}>
//           {(error as Error)?.message || "Failed to load stats"}
//         </Text>
//       </View>
//     );
//   }

//   const displayRole =
//     user?.role === "Normal" ? "Personal Account" : user?.role || "";

//   return (
//     <View style={styles.root}>
//       <View style={styles.headerCard}>
//         <View style={styles.avatarWrapper}>
//           <Image source={{ uri: user?.image }} style={styles.avatar} />
//         </View>

//         <Text style={styles.name}>{user?.username || "User"}</Text>
//         <Text style={styles.role}>{displayRole}</Text>

//         <View style={styles.statsRow}>
//           <View style={styles.statBox}>
//             <Text style={styles.statValue}>
//               {statsLoading ? "—" : stats?.total ?? 0}
//             </Text>
//             <Text style={styles.statLabel}>Total Events</Text>
//           </View>

//           <View style={styles.verticalDivider} />

//           <View style={styles.statBox}>
//             <Text style={styles.statValue}>
//               {statsLoading ? "—" : stats?.upcoming ?? 0}
//             </Text>
//             <Text style={styles.statLabel}>Upcoming Events</Text>
//           </View>

//           <View style={styles.verticalDivider} />

//           <View style={styles.statBox}>
//             <Text style={styles.statValue}>
//               {statsLoading ? "—" : stats?.old ?? 0}
//             </Text>
//             <Text style={styles.statLabel}>Old Events</Text>
//           </View>
//         </View>
//       </View>
//       <TouchableOpacity onPress={() => router.push("/mygiftcards")}>
//         <Text style={{ color: colors.secondary, fontWeight: "bold" }}>
//           My Gift Cards
//         </Text>
//       </TouchableOpacity>

//       <View style={styles.actionsCard}>
//         <TouchableOpacity
//           style={styles.actionItem}
//           activeOpacity={0.85}
//           onPress={() => router.push("/(personal)/(protect)/(tabs)/events")}
//         >
//           <Feather name="calendar" size={18} color={colors.secondary} />
//           <Text style={styles.actionText}>My Events</Text>
//           <Feather name="chevron-right" size={18} color="#9a9a9a" />
//         </TouchableOpacity>

//         <View style={styles.divider} />

//         <TouchableOpacity
//           style={styles.actionItem}
//           activeOpacity={0.85}
//           onPress={() => router.push("/(personal)/settings")}
//         >
//           <AntDesign
//             name="customer-service"
//             size={18}
//             color={colors.secondary}
//           />
//           <Text style={styles.actionText}>Contact us</Text>
//           <Feather name="chevron-right" size={18} color="#9a9a9a" />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// export default PersonalProfile;

// const cardRadius = 16;

// const styles = StyleSheet.create({
//   root: { flex: 1, backgroundColor: colors.backgroundMuted, padding: 16 },
//   center: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: colors.backgroundMuted,
//   },
//   errorText: { color: "red" },

//   headerCard: {
//     paddingVertical: 20,
//     paddingHorizontal: 16,
//     alignItems: "center",
//   },

//   avatarWrapper: {
//     width: 140,
//     height: 140,
//     borderRadius: 70,
//     backgroundColor: colors.backgroundLight,
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 12,
//     overflow: "hidden",
//   },
//   avatar: { width: 130, height: 130, borderRadius: 65 },

//   name: { fontSize: 20, fontWeight: "700", color: "#333" },
//   role: { fontSize: 13, color: "#999", marginTop: 2 },

//   statsRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     width: "100%",
//     marginTop: 16,
//     justifyContent: "space-around",
//   },
//   statBox: {
//     flex: 1,
//     alignItems: "center",
//     paddingVertical: 10,
//     paddingHorizontal: 6,
//   },
//   statValue: { fontSize: 18, fontWeight: "700", color: "#333" },
//   statLabel: { fontSize: 12, color: "#777", textAlign: "center" },
//   verticalDivider: {
//     width: StyleSheet.hairlineWidth,
//     backgroundColor: colors.secondary,
//     alignSelf: "stretch",
//   },

//   actionsCard: {
//     backgroundColor: "#fff",
//     borderRadius: cardRadius,
//     marginTop: 16,
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//   },
//   actionItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingVertical: 14,
//     paddingHorizontal: 6,
//   },
//   actionText: {
//     flex: 1,
//     marginLeft: 10,
//     fontSize: 15,
//     color: "#333",
//     fontWeight: "600",
//   },
//   divider: { height: StyleSheet.hairlineWidth, backgroundColor: "#eee" },
// });
