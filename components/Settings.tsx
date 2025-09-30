import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  Image,
  Linking,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import colors from "./Colors";

const contactInfo = [
  {
    id: "1",
    label: "Phone",
    value: "+965 94977560",
    icon: "phone",
    onPress: () => Linking.openURL("tel:+96594977560"),
  },
  {
    id: "2",
    label: "Email",
    value: "Layali@gmail.com",
    icon: "mail",
    onPress: () =>
      Linking.openURL(
        `mailto:layalikwt.info@gmail.com?subject=${encodeURIComponent(
          "Inquiry from Layali app"
        )}&body=${encodeURIComponent("Hello,\n\nI’d like to ask about…")}`
      ),
  },
  {
    id: "3",
    label: "Website",
    value: "www.Layali.com",
    icon: "globe",
    onPress: () => Linking.openURL("https://www.Layali.com"),
  },
  {
    id: "4",
    label: "Instagram",
    value: "@Layali.kwt",
    icon: "instagram",
    onPress: () => Linking.openURL("https://www.instagram.com/Layali.kwt"),
  },
];

const handlePress = async (url: string) => {
  const supported = await Linking.canOpenURL(url);
  if (supported) {
    await Linking.openURL(url);
  } else {
    Alert.alert("Error", "Unable to open this link.");
  }
};

const SettingsScreen = () => {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Image
          source={require("../assets/images/Logo-withoutbg.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <View style={styles.headerWrap}>
        <Text style={styles.headerTitle}>Contact Us</Text>
        <Text style={styles.headerSubtitle}>We’d love to hear from you</Text>
      </View>

      <View style={styles.contactGrid}>
        {contactInfo.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.contactCard}
            activeOpacity={0.85}
            onPress={item.onPress}
          >
            <View style={styles.iconBadge}>
              <Feather name={item.icon as any} size={18} color={colors.white} />
            </View>

            <View style={styles.textWrap}>
              <Text style={styles.contactLabel}>{item.label}</Text>
              <Text style={styles.contactValue} numberOfLines={1}>
                {item.value}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.backgroundMuted,
  },

  headerWrap: {
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.secondary,
    marginTop: 2,
  },

  contactGrid: {
    flexDirection: "column",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },

  contactCard: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
    borderWidth: Platform.OS === "android" ? 0.5 : 0,
    borderColor: "#00000010",
  },
  header: {
    alignItems: "center",
    marginBottom: 4,
  },
  logo: {
    width: "60%",
    maxWidth: 200,
    aspectRatio: 2.2,
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  textWrap: { marginLeft: 10, flex: 1 },
  contactLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.secondary,
  },
  contactValue: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
    marginTop: 2,
  },
});
