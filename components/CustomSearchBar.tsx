import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import colors from "./Colors";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
};

const CustomSearchBar = ({
  value,
  onChangeText,
  placeholder = "Search...",
  onFilterPress,
}: Props) => {
  return (
    <View style={styles.searchWrapper}>
      <Feather name="search" size={20} color={colors.text} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#888"
        value={value}
        onChangeText={onChangeText}
        style={styles.searchInput}
      />
      {onFilterPress && (
        <TouchableOpacity onPress={onFilterPress}>
          <Feather name="sliders" size={20} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default CustomSearchBar;

const styles = StyleSheet.create({
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    margin: 20,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    shadowColor: colors.black,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 8,
    elevation: 5,
  },
  searchInput: { flex: 1, marginLeft: 8, color: colors.text, fontSize: 16 },
});
