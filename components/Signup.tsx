import { useMutation } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { register } from "../api/auth"; // adjust path
import { COLORS } from "../components/Colors";

const roles = ["Normal", "Vendor"];

const SignupScreen = () => {
  const [userInfo, setUserInfo] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    image: "",
  });

  const { mutate, isPending } = useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      Alert.alert("Success", "Account created successfully!");
      console.log("Signup success:", data);
    },
    onError: (err: any) => {
      const message = err.response?.data?.message || "Something went wrong";
      Alert.alert("Error", message);
      console.error(err);
    },
  });

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission denied", "Cannot access gallery.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setUserInfo({ ...userInfo, image: asset.uri });
    }
  };

  const validateForm = () => {
    const { username, email, password, confirmPassword, role, image } =
      userInfo;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return false;
    }

    if (username.length < 4) {
      Alert.alert("Invalid Username", "Username must be at least 4 letters.");
      return false;
    }

    if (!role) {
      Alert.alert("Role required", "Please select a role.");
      return false;
    }

    if (!image) {
      Alert.alert("Image required", "Please select a profile image.");
      return false;
    }

    if (password.length < 8) {
      Alert.alert("Weak Password", "Password must be at least 8 characters.");
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append("username", userInfo.username);
    formData.append("email", userInfo.email);
    formData.append("password", userInfo.password);
    formData.append("role", userInfo.role);
    formData.append("image", {
      uri: userInfo.image,
      name: "profile.jpg",
      type: "image/jpeg",
    } as any);

    mutate(formData);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <TextInput
        placeholder="Username"
        placeholderTextColor={COLORS.Text}
        style={styles.input}
        value={userInfo.username}
        onChangeText={(text) => setUserInfo({ ...userInfo, username: text })}
      />

      <TextInput
        placeholder="Email "
        placeholderTextColor={COLORS.Text}
        style={styles.input}
        value={userInfo.email}
        onChangeText={(text) => setUserInfo({ ...userInfo, email: text })}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor={COLORS.Text}
        style={styles.input}
        value={userInfo.password}
        onChangeText={(text) => setUserInfo({ ...userInfo, password: text })}
        secureTextEntry
      />
      <TextInput
        placeholder="Confirm Password"
        placeholderTextColor={COLORS.Text}
        style={styles.input}
        value={userInfo.confirmPassword}
        onChangeText={(text) =>
          setUserInfo({ ...userInfo, confirmPassword: text })
        }
        secureTextEntry
      />

      <Text style={styles.label}>Select Role:</Text>
      <View style={styles.roleContainer}>
        {roles.map((r) => (
          <TouchableOpacity
            key={r}
            style={[
              styles.roleButton,
              userInfo.role === r && { backgroundColor: COLORS.Primary },
            ]}
            onPress={() => setUserInfo({ ...userInfo, role: r })}
          >
            <Text
              style={[
                styles.roleText,
                userInfo.role === r && { color: "#fff" },
              ]}
            >
              {r}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {userInfo.image ? (
          <Image source={{ uri: userInfo.image }} style={styles.imagePreview} />
        ) : (
          <Text style={styles.imageText}>Pick Profile Image</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={isPending}
      >
        <Text style={styles.submitButtonText}>
          {isPending ? "Signing Up..." : "Sign Up"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.Background,
    alignItems: "center",
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.Text,
    marginBottom: 20,
  },
  input: {
    width: "100%",
    backgroundColor: COLORS.Accent,
    padding: 12,
    borderRadius: 10,
    marginVertical: 8,
    color: COLORS.Text,
  },
  label: {
    fontSize: 16,
    color: COLORS.Text,
    marginTop: 15,
    marginBottom: 8,
  },
  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 15,
  },
  roleButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: COLORS.Secondary,
  },
  roleText: {
    color: COLORS.Text,
    fontWeight: "600",
  },
  imagePicker: {
    marginVertical: 15,
    padding: 10,
    backgroundColor: COLORS.Accent,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  imageText: {
    color: COLORS.Text,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  submitButton: {
    width: "100%",
    backgroundColor: COLORS.Buttons,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
