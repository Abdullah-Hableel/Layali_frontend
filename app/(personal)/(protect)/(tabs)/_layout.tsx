import { deleteToken, getToken } from "@/api/storage";
import AuthContext from "@/app/context/AuthContext";
import colors from "@/components/Colors";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, Tabs } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";

const FloatingAIButton = ({
  onPress,
  isActive,
}: {
  onPress?: any;
  isActive?: boolean;
}) => {
  const scale = useState(new Animated.Value(1))[0];

  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scale.setValue(1); // reset when inactive
    }
  }, [isActive]);

  return (
    <View style={styles.fabContainer}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.9}
          style={[styles.fab, isActive && { backgroundColor: colors.accent }]}
        >
          <FontAwesome name="magic" size={28} color="white" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default function RootLayout() {
  const { setIsAuthenticated } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState<string>("");

  const handleLogOut = async () => {
    await deleteToken();
    const token = await getToken();
    console.log("After delete:", token);
    setIsAuthenticated(false);
    router.dismissTo("/landingPage");
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.secondary,
        headerTintColor: colors.secondary,
        headerStyle: { backgroundColor: colors.backgroundMuted },
      }}
    >
      {/* Events Tab */}
      <Tabs.Screen
        name="events"
        options={{
          title: "My Events",
          tabBarIcon: () => (
            <MaterialCommunityIcons
              name="party-popper"
              size={24}
              color={colors.secondary}
            />
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleLogOut}>
              <MaterialIcons name="logout" size={20} color={colors.danger} />
            </TouchableOpacity>
          ),
        }}
        listeners={{
          focus: () => setActiveTab("events"),
        }}
      />

      {/* Guest Tab */}
      <Tabs.Screen
        name="guest"
        options={{
          title: "Guest",
          tabBarIcon: () => (
            <MaterialIcons
              name="people-alt"
              size={24}
              color={colors.secondary}
            />
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleLogOut}>
              <MaterialIcons name="logout" size={20} color={colors.danger} />
            </TouchableOpacity>
          ),
        }}
        listeners={{
          focus: () => setActiveTab("guest"),
        }}
      />

      {/* AI Suggestion Tab */}
      <Tabs.Screen
        name="suggestion"
        options={{
          title: "Ask me",
          tabBarButton: (props) => (
            <FloatingAIButton
              {...props}
              isActive={activeTab === "suggestion"}
            />
          ),
        }}
        listeners={{
          focus: () => setActiveTab("suggestion"),
          blur: () => setActiveTab(""),
        }}
      />

      {/* Shop Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Shop",
          tabBarIcon: () => (
            <Entypo name="shop" size={24} color={colors.secondary} />
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleLogOut}>
              <MaterialIcons name="logout" size={20} color={colors.danger} />
            </TouchableOpacity>
          ),
        }}
        listeners={{
          focus: () => setActiveTab("index"),
        }}
      />

      {/* Vendor Tab */}
      <Tabs.Screen
        name="vendor"
        options={{
          title: "Vendor",
          tabBarIcon: () => (
            <Entypo name="shop" size={24} color={colors.secondary} />
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleLogOut}>
              <MaterialIcons name="logout" size={20} color={colors.danger} />
            </TouchableOpacity>
          ),
        }}
        listeners={{
          focus: () => setActiveTab("vendor"),
        }}
      />

      {/* Profile Tab */}
      <Tabs.Screen
        name="pprofile"
        options={{
          title: "Profile",
          tabBarIcon: () => (
            <FontAwesome name="user" size={24} color={colors.secondary} />
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleLogOut}>
              <MaterialIcons name="logout" size={20} color={colors.danger} />
            </TouchableOpacity>
          ),
        }}
        listeners={{
          focus: () => setActiveTab("pprofile"),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: "relative",
    top: -25,
    alignItems: "center",
    justifyContent: "center",
    width: 75,
    height: 75,
  },
  fab: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.secondary,
    width: 75,
    height: 75,
    borderRadius: 37,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },
});
