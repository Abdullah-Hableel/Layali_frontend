// app/index.tsx
import AuthContext from "@/app/context/AuthContext";
import { Redirect, router } from "expo-router";
import React, { useContext } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import colors from "./Colors";
import CustomButton from "./customButton";

export default function Landing() {
  const { isAuthenticated, user } = useContext(AuthContext);

  if (isAuthenticated && user?.role === "Admin") {
    return <Redirect href="/(admin)" />;
  }
  if (isAuthenticated && user?.role === "Vendor") {
    return <Redirect href="/(vendor)" />;
  }
  if (isAuthenticated && user?.role === "Normal") {
    return <Redirect href="/(personal)/(protect)/(tabs)" />;
  }
  const year = new Date().getFullYear();
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("../assets/images/Logo-withoutbg.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <View style={styles.buttons}>
        <CustomButton text="Sign Up" onPress={() => router.push("/signup")} />
        <CustomButton
          text="Sign In"
          variant="outline"
          onPress={() => router.push("/signin")}
        />
      </View>

      <Text style={styles.footer}>© {year} LAYALI</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundMuted,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 40,
  },
  header: {
    marginTop: 180,
    alignItems: "center",
  },
  logo: {
    width: "60%",
    maxWidth: 270,
    aspectRatio: 2.2,
  },
  buttons: {
    width: "100%",
    alignItems: "center",
    gap: 12,
  },
  footer: {
    fontSize: 12,
    color: colors.secondary,
  },
});
