import { login } from "@/api/auth";
import AuthContext from "@/app/context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { Formik } from "formik";
import React, { useContext, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import * as Yup from "yup";
import colors from "./Colors";
import CustomButton from "./customButton";

const SignInSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

const SigninScreen = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);
  const { user, setUser } = useContext(AuthContext);

  const [showPassword, setShowPassword] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setIsAuthenticated(true);
      setUser(data.user);
      Toast.show({
        type: "success",
        text1: "Welcome back 👋",
        text2: "You signed in successfully.",
        visibilityTime: 3500,
      });
      router.replace("/");

      console.log("Signin success:", data, data.user);
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message || "Network error. Please try again.";
      Toast.show({
        type: "error",
        text1: "Sign in failed",
        text2: message,
        position: "bottom",
        visibilityTime: 4500,
      });
    },
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={SignInSchema}
          onSubmit={(values) => {
            mutate(values);
          }}
        >
          {({
            handleChange,
            handleSubmit,
            handleBlur,
            values,
            errors,
            touched,
            submitCount,
          }) => (
            <View style={styles.container}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>
                Sign in to continue planning your special day
              </Text>

              <Text style={styles.fieldLabel}>Email</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, {}]}
                  placeholder="Enter your email"
                  value={values.email}
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  placeholderTextColor={colors.secondary + "99"}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                {/* <MaterialIcons
                  name="email"
                  size={20}
                  color={colors.secondary}
                  style={styles.leftIcon}
                /> */}
              </View>
              {(touched.email || submitCount > 0) && errors.email && (
                <Text
                  style={{
                    color: colors.danger,
                    fontSize: 12,
                    marginBottom: 4,
                  }}
                >
                  {errors.email}
                </Text>
              )}

              <Text style={styles.fieldLabel}>Password</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, { paddingRight: 60 }]}
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  value={values.password}
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  placeholderTextColor={colors.secondary + "99"}
                />
                <Pressable
                  onPress={() => setShowPassword((s) => !s)}
                  style={styles.toggleWrap}
                  hitSlop={8}
                >
                  <Text style={styles.toggleText}>
                    {showPassword ? "Hide" : "Show"}
                  </Text>
                </Pressable>
              </View>
              {(touched.password || submitCount > 0) && errors.password && (
                <Text
                  style={{
                    color: colors.danger,
                    fontSize: 12,
                    marginBottom: 4,
                  }}
                >
                  {errors.password}
                </Text>
              )}

              <View
                style={{ width: "100%", marginTop: 16, alignItems: "center" }}
              >
                <CustomButton
                  text={isPending ? "Signing In..." : "Sign In"}
                  onPress={handleSubmit as any}
                  disabled={!values.email || !values.password}
                />
              </View>

              <TouchableOpacity onPress={() => router.push("./signup")}>
                <Text style={styles.linkText}>Create account</Text>
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SigninScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundMuted,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: colors.backgroundMuted,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 6,
    color: colors.secondary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: colors.secondary + "CC",
    marginBottom: 20,
    textAlign: "center",
  },
  fieldLabel: {
    width: "100%",
    fontSize: 14,
    fontWeight: "700",
    color: colors.secondary,
    marginTop: 10,
    marginBottom: 6,
  },
  inputContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral,
    marginBottom: 14,
    height: 48,
  },
  input: {
    flex: 1,
    color: colors.secondary,
    paddingVertical: 0,
    paddingHorizontal: 14,
  },
  leftIcon: {
    position: "absolute",
    left: 10,
    zIndex: 1,
  },
  toggleWrap: {
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
  linkText: {
    color: colors.secondary,
    fontSize: 14,
    textAlign: "center",
    marginTop: 12,
    fontWeight: "600",
  },
});
