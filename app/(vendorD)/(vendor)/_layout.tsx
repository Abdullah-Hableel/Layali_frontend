import { getUserNotifications } from "@/api/notifications";
import { deleteToken, getToken } from "@/api/storage";
import AuthContext from "@/app/context/AuthContext";
import colors from "@/components/Colors";
import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import Foundation from "@expo/vector-icons/Foundation";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { router, Tabs } from "expo-router";
import { jwtDecode } from "jwt-decode";
import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const queryClient = new QueryClient();

export default function RootLayout() {
  const { setIsAuthenticated } = useContext(AuthContext);
  const [userId, setUserId] = useState<string | null>(null);

  // ✅ Get user ID from JWT
  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (token) {
        const decoded: any = jwtDecode(token);
        setUserId(decoded?.userId || decoded?._id || null);
      }
    })();
  }, []);

  const handleLogOut = async () => {
    await deleteToken();
    const token = await getToken();
    console.log("After delete:", token);
    setIsAuthenticated(false);
    router.dismissTo("/landingPage");
  };

  // 📩 Fetch notifications for current user
  const { data: notifications } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: () => getUserNotifications(userId!),
    enabled: !!userId,
  });

  const unreadCount = notifications?.filter((n: any) => !n.read)?.length || 0;

  return (
    <QueryClientProvider client={queryClient}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.secondary,
          tabBarInactiveTintColor: "#999",
          tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
          animation: "shift",
          headerTintColor: colors.secondary,
          headerStyle: { backgroundColor: colors.backgroundMuted },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Explore",
            tabBarIcon: ({ color }) => (
              <FontAwesome5 name="search" size={20} color={color} />
            ),
            headerRight: () => (
              <TouchableOpacity onPress={handleLogOut}>
                <MaterialIcons name="logout" size={20} color={colors.danger} />
              </TouchableOpacity>
            ),
          }}
        />

        <Tabs.Screen
          name="services"
          options={{
            title: "Services",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons
                name="room-service"
                size={24}
                color={color}
              />
            ),
            headerRight: () => (
              <TouchableOpacity onPress={handleLogOut}>
                <MaterialIcons name="logout" size={20} color={colors.danger} />
              </TouchableOpacity>
            ),
          }}
        />

        <Tabs.Screen
          name="Vendor"
          options={{
            title: "Business Profile",
            tabBarIcon: ({ color }) => (
              <Foundation name="torso-business" size={24} color={color} />
            ),
            headerLeft: () =>
              userId ? (
                <TouchableOpacity
                  style={{ marginLeft: 15 }}
                  onPress={() => router.push("/notificationPage")}
                >
                  <View>
                    <Ionicons
                      name="notifications-outline"
                      size={24}
                      color={colors.secondary}
                    />
                    {unreadCount > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{unreadCount}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ) : null,
            headerRight: () => (
              <TouchableOpacity onPress={handleLogOut}>
                <MaterialIcons name="logout" size={20} color={colors.danger} />
              </TouchableOpacity>
            ),
          }}
        />
      </Tabs>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: colors.danger,
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
    minWidth: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
});
