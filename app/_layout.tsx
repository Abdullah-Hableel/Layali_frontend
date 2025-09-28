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
            name="(personal)/(protect)/(tabs)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen name="(vendor)" options={{ headerShown: false }} />
        </Stack>
      </AuthContext.Provider>
      <Toast position="bottom" />
    </QueryClientProvider>
  );
}
