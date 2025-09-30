import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Linking,
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
    onPress: () => Linking.openURL("mailto:Layali@gmail.com"),
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
    value: "@Layali_kw",
    icon: "instagram",
    onPress: () => Linking.openURL("https://www.instagram.com/Layali_kw"),
  },
];
const SettingsScreen = () => {
  return (
    <View>
      <View style={styles.contactGrid}>
        {contactInfo.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.contactCard}
            onPress={item.onPress}
          >
            <Feather name={item.icon as any} size={20} color={colors.primary} />
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.contactLabel}>{item.label}</Text>
              <Text style={styles.contactValue}>{item.value}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  contactCard: {
    backgroundColor: colors.backgroundMuted,
    width: "48%",
    borderRadius: 12,
    padding: 7,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    shadowOffset: { width: 3, height: 9 },
    shadowRadius: 5,
    elevation: 3,
  },
  contactLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.secondary,
  },
  contactValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 2,
  },
  contactGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 20,
  },
});
