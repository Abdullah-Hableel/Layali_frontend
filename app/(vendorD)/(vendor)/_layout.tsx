import { deleteToken, getToken } from "@/api/storage";
import AuthContext from "@/app/context/AuthContext";
import colors from "@/components/Colors";
import NotificationsScreen from "@/components/Notifications"; // ✅ unified notifications component
import {
  FontAwesome5,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router, Tabs } from "expo-router";
import { jwtDecode } from "jwt-decode";
import React, { useContext, useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

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
        {/* 🏠 Explore */}
        <Tabs.Screen
          name="index"
          options={{
            title: "Explore",
            tabBarIcon: ({ color }) => (
              <FontAwesome5 name="search" size={20} color={color} />
            ),
            headerLeft: () => (
              <NotificationsScreen headerMode /> // ✅ now showing icon with badge + auto refresh
            ),
            headerRight: () => (
              <TouchableOpacity onPress={handleLogOut}>
                <MaterialIcons name="logout" size={20} color={colors.danger} />
              </TouchableOpacity>
            ),
          }}
        />

        {/* 🛎 Services */}
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
            headerLeft: () => (
              <NotificationsScreen headerMode /> // ✅ now showing icon with badge + auto refresh
            ),
            headerRight: () => (
              <TouchableOpacity onPress={handleLogOut}>
                <MaterialIcons name="logout" size={20} color={colors.danger} />
              </TouchableOpacity>
            ),
          }}
        />

        {/* 🏢 Business Profile */}
        <Tabs.Screen
          name="vendor"
          options={{
            title: "Business Profile",
            headerLeft: () => (
              <NotificationsScreen headerMode /> // ✅ now showing icon with badge + auto refresh
            ),
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
