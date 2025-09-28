// app/screens/SignupScreen.tsx
import AuthContext from "@/app/context/AuthContext";
import { Role } from "@/data/role";
import { useMutation } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Formik } from "formik";
import React, { useContext, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import * as Yup from "yup";
import { register } from "../api/auth";
import colors from "./Colors";
import CustomButton from "./customButton";

const RegisterSchema = Yup.object().shape({
  username: Yup.string()
    .min(4, "Username must be at least 4 characters")
    .required("Username is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(
      /[@$!%*?&#]/,
      "Password must contain at least one special character"
    ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirmation password is required"),
  role: Yup.mixed<Role>()
    .oneOf(Object.values(Role), "Please select a role")
    .required("Role is required"),
  image: Yup.string().required("Image is required"),
});

const roles = [
  { value: "Normal", label: "Personal" },
  { value: "Vendor", label: "Business" },
] as const;
const SignupScreen = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);
  const { setUser } = useContext(AuthContext);

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      setIsAuthenticated(true);
      setUser(data.user);
      Toast.show({
        type: "success",
        text1: "Account created 🎉",
        text2: "Welcome aboard! Setting things up...",
        position: "top",
        visibilityTime: 4000,
      });
      router.dismissTo("/");
      console.log("Signup success:", data);
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message || "Signup failed. Please try again.";
      Toast.show({
        type: "error",
        text1: "Signup failed ❌",
        text2: message,
        position: "bottom",
        visibilityTime: 5000,
      });
      console.log("Signup Error:", err);
    },
  });

  const pickImage = async (setFieldValue: (f: string, v: any) => void) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted)
      return Alert.alert("Permission denied", "Cannot access gallery.");
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setFieldValue("image", result.assets[0].uri);
  };

  const onSubmit = (values: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: string;
    image: string;
  }) => {
    const formData = new FormData();
    formData.append("username", values.username);
    formData.append("email", values.email);
    formData.append("password", values.password);
    formData.append("role", values.role);
    formData.append("image", {
      uri: values.image,
      name: "profile.jpg",
      type: "image/jpeg",
    } as any);
    mutate(formData);
  };

  return (
    <Formik
      initialValues={{
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
        image: "",
      }}
      validationSchema={RegisterSchema}
      onSubmit={onSubmit}
      validateOnBlur
      validateOnChange
    >
      {({
        handleChange,
        handleBlur,
        handleSubmit,
        values,
        errors,
        touched,
        setFieldValue,
      }) => (
        <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
          >
            <Pressable
              style={styles.avatarWrap}
              onPress={() => pickImage(setFieldValue)}
            >
              <Image
                source={
                  values.image
                    ? { uri: values.image }
                    : require("../assets/images/avatar-placeholder.png")
                }
                style={styles.avatar}
              />
              <Text style={styles.avatarHint}>
                {values.image ? "Edit photo" : "Add a photo"}
              </Text>
            </Pressable>
            {touched.image && errors.image ? (
              <Text style={styles.error}>{errors.image}</Text>
            ) : null}
            <Text style={styles.fieldLabel}>Username</Text>
            <View style={styles.inputRow}>
              <TextInput
                placeholder="Enter your username"
                placeholderTextColor={colors.secondary + "99"}
                style={styles.input}
                value={values.username}
                onChangeText={handleChange("username")}
                onBlur={handleBlur("username")}
                autoCapitalize="words"
              />
            </View>
            {touched.username && errors.username ? (
              <Text style={styles.error}>{errors.username}</Text>
            ) : null}

            <Text style={styles.fieldLabel}>Email</Text>
            <View style={styles.inputRow}>
              <TextInput
                placeholder="name@example.com"
                placeholderTextColor={colors.secondary + "99"}
                style={styles.input}
                value={values.email}
                onChangeText={handleChange("email")}
                onBlur={handleBlur("email")}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {touched.email && errors.email ? (
              <Text style={styles.error}>{errors.email}</Text>
            ) : null}

            <Text style={styles.fieldLabel}>Password</Text>
            <View style={styles.inputRow}>
              <TextInput
                placeholder="••••••••"
                placeholderTextColor={colors.secondary + "99"}
                style={[styles.input, styles.inputWithToggle]}
                value={values.password}
                onChangeText={handleChange("password")}
                onBlur={handleBlur("password")}
                secureTextEntry={!showPass}
              />
              <Pressable
                onPress={() => setShowPass((s) => !s)}
                style={styles.toggleBtn}
                hitSlop={8}
              >
                <Text style={styles.toggleText}>
                  {showPass ? "Hide" : "Show"}
                </Text>
              </Pressable>
            </View>
            {touched.password && errors.password ? (
              <Text style={styles.error}>{errors.password}</Text>
            ) : null}

            <Text style={styles.fieldLabel}>Confirm Password</Text>
            <View style={styles.inputRow}>
              <TextInput
                placeholder="Repeat your password"
                placeholderTextColor={colors.secondary + "99"}
                style={[styles.input, styles.inputWithToggle]}
                value={values.confirmPassword}
                onChangeText={handleChange("confirmPassword")}
                onBlur={handleBlur("confirmPassword")}
                secureTextEntry={!showConfirm}
              />
              <Pressable
                onPress={() => setShowConfirm((s) => !s)}
                style={styles.toggleBtn}
                hitSlop={8}
              >
                <Text style={styles.toggleText}>
                  {showConfirm ? "Hide" : "Show"}
                </Text>
              </Pressable>
            </View>
            {touched.confirmPassword && errors.confirmPassword ? (
              <Text style={styles.error}>{errors.confirmPassword}</Text>
            ) : null}

            <Text style={styles.fieldLabel}>Role</Text>
            <View style={styles.roleContainer}>
              {roles.map((r) => {
                const selected = values.role === r.value;
                return (
                  <TouchableOpacity
                    key={r.value}
                    style={[
                      styles.roleButton,
                      selected && {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                      },
                    ]}
                    onPress={() => setFieldValue("role", r.value)}
                  >
                    <Text
                      style={[styles.roleText, selected && { color: "#fff" }]}
                    >
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {touched.role && errors.role ? (
              <Text style={styles.error}>{errors.role}</Text>
            ) : null}
            <View
              style={{ width: "100%", marginTop: 16, alignItems: "center" }}
            >
              <CustomButton
                text={isPending ? "Signing Up..." : "Sign Up"}
                onPress={() => handleSubmit()}
                disabled={
                  !values.username ||
                  !values.email ||
                  !values.password ||
                  !values.confirmPassword ||
                  !values.role ||
                  !values.image ||
                  Object.keys(errors).length > 0
                }
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      )}
    </Formik>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundMuted,
  },
  container: {
    flexGrow: 1,
    backgroundColor: colors.backgroundMuted,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
  },
  avatarWrap: {
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 80,
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  avatarHint: {
    marginTop: 8,
    fontSize: 12,
    color: colors.secondary + "CC",
    fontWeight: "600",
  },

  fieldLabel: {
    width: "100%",
    fontSize: 14,
    fontWeight: "700",
    color: colors.secondary,
    marginTop: 10,
    marginBottom: 6,
  },

  inputRow: {
    width: "100%",
    position: "relative",
  },
  input: {
    width: "100%",
    height: 48,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    borderRadius: 12,
    color: colors.secondary,
    borderWidth: 1,
    borderColor: colors.neutral,
  },
  inputWithToggle: {
    paddingRight: 70,
  },
  toggleBtn: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  toggleText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.secondary,
  },

  roleContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    width: "100%",
    marginBottom: 6,
  },
  roleButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: colors.neutral,
  },
  roleText: {
    color: colors.secondary,
    fontWeight: "700",
  },

  error: {
    alignSelf: "flex-start",
    marginBottom: 6,
    color: colors.danger,
    opacity: 0.9,
    fontSize: 12,
    fontWeight: "600",
  },
});
