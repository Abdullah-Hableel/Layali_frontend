import { getToken, getUser } from "@/api/storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router, Stack } from "expo-router";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import colors from "../components/Colors";
import AuthContext, { User } from "./context/AuthContext";

export default function RootLayout() {
  const queryClient = new QueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  console.log(isAuthenticated);

  const checkSession = async () => {
    const token = await getToken();
    const storedUser = await getUser();
    if (!token || !storedUser || !storedUser.role) {
      setIsAuthenticated(false);
      setUser(null);
      router.replace("/landingPage");
      return;
    }

    setIsAuthenticated(true);
    setUser(storedUser);
  };

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (!user?.role) return;

    if (user.role === "Admin") router.replace("/(admin)");
    else if (user.role === "Vendor") router.replace("/(vendor)");
    else router.replace("/(personal)/(protect)/(tabs)");
  }, [user]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider
        value={{ isAuthenticated, setIsAuthenticated, user, setUser }}
      >
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.backgroundMuted,
            },
            headerTintColor: colors.primary,
            headerTitleStyle: {
              fontWeight: "700",
              color: colors.secondary,
            },
          }}
        >
          <Stack.Screen name="landingPage" options={{ headerShown: false }} />
          <Stack.Screen
            name="signup"
            options={{
              title: "Signup",
              headerBackButtonDisplayMode: "minimal",
            }}
          />
          <Stack.Screen
            name="signin"
            options={{
              title: "Signin",
              headerBackButtonDisplayMode: "minimal",
            }}
          />
          <Stack.Screen
            name="creategiftcard"
            options={{
              title: "Create Gift Card",
            }}
          />
          <Stack.Screen
            name="mygiftcards"
            options={{
              title: "My Gift Cards",
            }}
          />
          <Stack.Screen
            name="(personal)/(protect)/(tabs)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen name="(vendor)" options={{ headerShown: false }} />
          <Stack.Screen
            name="(personal)/createEvents"
            options={{
              title: "Create Event",
            }}
          />
          <Stack.Screen
            name="(personal)/(events)/[id]"
            options={{
              title: "My Event",
            }}
          />
          <Stack.Screen
            name="(personal)/settings"
            options={{
              title: "Contact us",
            }}
          />
          <Stack.Screen
            name="createService"
            options={{
              title: "Post Your Service",
              headerBackVisible: true,
              headerBackTitle: "Back",
            }}
          />
          <Stack.Screen
            name="(vendorD)/[id]"
            options={{
              title: "Vendor Details",
              headerBackVisible: true,
              headerBackTitle: "Back",
            }}
          />
          <Stack.Screen
            name="(vendorD)/(vendor)"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="(personal)/(shop)/[id]"
            options={{
              title: "Shop Details",
            }}
          />
          <Stack.Screen
            name="(personal)/(serviceDetails)/[id]"
            options={{
              title: "Shop Details",
            }}
          />
          <Stack.Screen
            name="(personal)/(serviceDetails)/(viewDetails)/[id]"
            options={{
              title: "My Services",
            }}
          />
          {/* invites */}
          <Stack.Screen
            name="customizeinvitation"
            options={{
              title: "Customize Invitation",
            }}
          />
          <Stack.Screen
            name="invitetemplate"
            options={{
              title: "Find Your Perfect Invite",
            }}
          />
          <Stack.Screen
            name="(vendorD)/(serviceInfo)/[id]"
            options={{ title: "Service Info" }}
          />
        </Stack>
      </AuthContext.Provider>
      <Toast position="bottom" />
    </QueryClientProvider>
  );
}
