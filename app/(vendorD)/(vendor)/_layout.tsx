import { deleteToken, getToken } from "@/api/storage";
import AuthContext from "@/app/context/AuthContext";
import colors from "@/components/Colors";
import {
  FontAwesome5,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import Foundation from "@expo/vector-icons/Foundation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router, Tabs } from "expo-router";
import React, { useContext } from "react";
import { TouchableOpacity } from "react-native";

const queryClient = new QueryClient();

export default function RootLayout() {
  const { setIsAuthenticated } = useContext(AuthContext);

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
          // ✅ commit: enable active/inactive tinting for icons & labels
          tabBarActiveTintColor: colors.secondary,
          tabBarInactiveTintColor: "#999",

          // ✅ commit: make labels a bit bolder
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },

          animation: "shift",
          headerTintColor: colors.secondary,
          headerStyle: {
            backgroundColor: colors.backgroundMuted,
          },
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
          name="vendor"
          options={{
            title: "Business Profile",

            // ✅ commit: active/inactive handled automatically
            tabBarIcon: ({ color }) => (
              <Foundation name="torso-business" size={24} color={color} />
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
