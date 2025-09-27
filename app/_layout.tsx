import { getToken } from "@/api/storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import colors from "../components/Colors";
import AuthContext from "./context/AuthContext";

export default function RootLayout() {
  const queryClient = new QueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  console.log(isAuthenticated);

  const checkToken = async () => {
    const token = await getToken();
    if (token) {
      setIsAuthenticated(!!token);
      console.log(token);
    }
  };
  useEffect(() => {
    checkToken();
  }),
    [];
  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
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
          <Stack.Protected guard={isAuthenticated}>
            <Stack.Screen
              name="(protect)/(tabs)"
              options={{ headerShown: false }}
            />
          </Stack.Protected>
        </Stack>
      </AuthContext.Provider>
      <Toast position="bottom" />
    </QueryClientProvider>
  );
}
