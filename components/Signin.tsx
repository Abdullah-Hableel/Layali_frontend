import { login } from "@/api/auth";
import { MaterialIcons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
// signin

const SigninScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      Alert.alert("Success", "Account loggedin successfully!");
      console.log("Signin success:", data);
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || "Something went wrong";
      Alert.alert("Error", message);
      console.error(err);
    },
  });
  const handleSignIn = () => {
    mutate({ email, password });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>
          Sign in to continue planning your special day
        </Text>

        {/* Email Input */}
        <Text style={{ color: "#9d8189dd", fontWeight: "bold" }}>Email</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor="#aaa"
            underlineColorAndroid="transparent"
          />
          <MaterialIcons
            name="email"
            size={20}
            color="#9D8189"
            style={styles.icon}
          />
        </View>

        {/* Password Input */}
        <Text style={{ color: "#9d8189dd", fontWeight: "bold" }}>Password</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#aaa"
            underlineColorAndroid="transparent"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <MaterialIcons
              name={showPassword ? "visibility" : "visibility-off"}
              size={20}
              color="#9D8189"
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSignIn}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text style={styles.linkText}>Create account</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.vendorContainer}>
          <MaterialIcons
            name="store"
            size={20}
            color="#9D8189"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.vendorText}>Sign-in as a vendor</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};
export default SigninScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#FFE5D9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#9D8189",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#9D8189",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc", //here also
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    padding: 12,
    color: "#333",
    borderWidth: 0, //here
  },
  icon: {
    marginLeft: 0,
  },
  button: {
    backgroundColor: "#f48fb1",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  vendorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
  },
  vendorText: {
    color: "#9D8189",
    fontSize: 14,
  },
  linkText: {
    color: "#9D8189",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
  },
});
