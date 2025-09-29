import React, { ReactNode } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import colors from "./Colors";

type ButtonProps = {
  text: string;
  children?: ReactNode;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  disabled?: boolean;
};

const CustomButton = ({
  text,
  onPress,
  variant = "primary",
  disabled,
}: ButtonProps) => {
  return (
    <Pressable
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        disabled && { backgroundColor: "#ccc", borderColor: "#ccc" },
        variant === "primary" && {
          backgroundColor: pressed ? colors.secondary : colors.primary,
        },
        !disabled &&
          variant === "secondary" && {
            backgroundColor: pressed ? colors.accent : colors.secondary,
          },
        !disabled &&
          variant === "outline" && {
            backgroundColor: pressed ? colors.backgroundMuted : colors.white,
            borderWidth: 2,
            borderColor: colors.primary,
          },
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.text,
          variant === "secondary" && { color: colors.white },
          variant === "outline" && { color: colors.secondary }, // 👆 text purple
        ]}
      >
        {text}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    width: 350,
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.white,
  },
});

export default CustomButton;
