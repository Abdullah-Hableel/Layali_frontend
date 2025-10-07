import { deleteToken, getToken } from "@/api/storage";
import AuthContext from "@/app/context/AuthContext";
import colors from "@/components/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { router, Tabs } from "expo-router";
import React, { useContext } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

const FloatingAIButton = ({
  children,
  onPress,
  accessibilityRole,
  accessibilityState,
  style,
}: BottomTabBarButtonProps) => {
  return (
    <View pointerEvents="box-none" style={styles.fabContainer}>
      <TouchableOpacity
        onPress={onPress}
        accessibilityRole={accessibilityRole}
        accessibilityState={accessibilityState}
        activeOpacity={0.9}
        style={[styles.fab, style]}
      >
        {children}
      </TouchableOpacity>
    </View>
  );
};
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
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.secondary,
        animation: "shift",
        headerTintColor: colors.secondary,
        headerStyle: {
          backgroundColor: colors.backgroundMuted,
        },
      }}
    >
      <Tabs.Screen
        name="events"
        options={{
          title: "My Events",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="party-popper"
              size={24}
              color={colors.secondary}
            />
          ),
          headerRight: () => (
            <React.Fragment>
              <TouchableOpacity onPress={handleLogOut}>
                <MaterialIcons name="logout" size={20} color={colors.danger} />
              </TouchableOpacity>
            </React.Fragment>
          ),
        }}
      />

      <Tabs.Screen
        name="guest"
        options={{
          title: "Guest",
          tabBarIcon: ({ color }) => (
            <MaterialIcons
              name="people-alt"
              size={24}
              color={colors.secondary}
            />
          ),
          headerRight: () => (
            <React.Fragment>
              <TouchableOpacity onPress={handleLogOut}>
                <MaterialIcons name="logout" size={20} color={colors.danger} />
              </TouchableOpacity>
            </React.Fragment>
          ),
        }}
      />
      <Tabs.Screen
        name="suggestion"
        options={{
          title: "",
          tabBarIcon: () => (
            <FontAwesome name="magic" size={28} color={colors.secondary} />
          ),
          tabBarButton: (props) => <FloatingAIButton {...props} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Shop",

          tabBarIcon: ({ color }) => (
            <Entypo name="shop" size={24} color={colors.secondary} />
          ),

          headerRight: () => (
            <React.Fragment>
              <TouchableOpacity onPress={handleLogOut}>
                <MaterialIcons name="logout" size={20} color={colors.danger} />
              </TouchableOpacity>
            </React.Fragment>
          ),
        }}
      />
      <Tabs.Screen
        name="vendor"
        options={{
          title: "Shop",
          tabBarIcon: ({ color }) => (
            <Entypo name="shop" size={24} color={colors.secondary} />
          ),
          headerRight: () => (
            <React.Fragment>
              <TouchableOpacity onPress={handleLogOut}>
                <MaterialIcons name="logout" size={20} color={colors.danger} />
              </TouchableOpacity>
            </React.Fragment>
          ),
        }}
      />

      <Tabs.Screen
        name="pprofile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="user" size={24} color={colors.secondary} />
          ),
          headerRight: () => (
            <React.Fragment>
              <TouchableOpacity onPress={handleLogOut}>
                <MaterialIcons name="logout" size={20} color={colors.danger} />
              </TouchableOpacity>
            </React.Fragment>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    backgroundColor: colors.white,
    position: "relative",
    top: -25,
    alignItems: "center",
    justifyContent: "center",
    width: 75,
    height: 75,
    borderRadius: 40,
    paddingTop: 10,
  },
  fab: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.secondary,
    width: 110,
    height: 55,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
    flexDirection: "row",
    gap: 8,
  },
});
