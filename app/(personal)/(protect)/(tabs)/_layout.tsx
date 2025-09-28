import { deleteToken, getToken } from "@/api/storage";
import AuthContext from "@/app/context/AuthContext";
import colors from "@/components/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import { router, Tabs } from "expo-router";
import React, { useContext } from "react";
import { TouchableOpacity } from "react-native";

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
        name="index"
        options={{
          title: "Home",

          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={24} color={colors.secondary} />
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
        }}
      />
    </Tabs>
  );
}
