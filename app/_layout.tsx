import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import colors from "../components/Colors"; // ✅ import your palette

export default function RootLayout() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
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
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="signup"
          options={{ title: "Signup", headerBackButtonDisplayMode: "minimal" }}
        />
      </Stack>
    </QueryClientProvider>
  );
}
