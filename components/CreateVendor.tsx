import { createVendor } from "@/api/vendor";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { getUserById } from "../api/users";
import colors from "../components/Colors";
import CustomButton from "./customButton";

export default function CreateVendor() {
  const [businessName, setBusinessName] = useState("");
  const [bio, setBio] = useState("");
  const [logo, setLogo] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Fetch current user ID
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getUserById();
        setUserId(user._id);
      } catch (err: any) {
        console.error("Error fetching user:", err);
        Alert.alert("Error", err.message || "Failed to load user");
      }
    };
    fetchUser();
  }, []);

  const mutation = useMutation({
    mutationFn: createVendor,
    onSuccess: () => {
      Alert.alert("Success", "Vendor created successfully!");
      queryClient.invalidateQueries({ queryKey: ["user", "vendor"] });
      router.back();
    },
    onError: (err: any) => {
      console.error("createVendor error:", err);
      Alert.alert("Error", err.message || "Something went wrong");
    },
  });

  const pickLogo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "We need access to your photos!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setLogo(result.assets[0]);
    }
  };

  const handleSubmit = () => {
    if (!businessName || !bio || !logo) {
      Alert.alert("Missing fields", "Please fill all fields and select a logo");
      return;
    }

    if (!userId) {
      Alert.alert("Error", "User ID not loaded yet. Try again in a moment.");
      return;
    }

    const formData = new FormData();
    formData.append("business_name", businessName);
    formData.append("bio", bio);
    formData.append("user", userId); // <-- required by backend
    formData.append("logo", {
      uri: logo.uri,
      name: logo.fileName || "logo.jpg",
      type: logo.type || "image/jpeg",
    } as any);

    mutation.mutate(formData);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <Text>Business Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Business Name"
          value={businessName}
          onChangeText={setBusinessName}
        />

        <Text> Bio </Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          placeholder="Bio"
          value={bio}
          onChangeText={setBio}
          multiline
        />

        {/* Logo picker */}
        <TouchableOpacity style={styles.logoPicker} onPress={pickLogo}>
          {logo ? (
            <Image source={{ uri: logo.uri }} style={styles.logoPreview} />
          ) : (
            <Text>Select Logo</Text>
          )}
        </TouchableOpacity>

        <View style={{ alignItems: "center", marginTop: 20 }}>
          <CustomButton
            text="Create Vendor"
            onPress={handleSubmit}
            variant="primary"
            disabled={mutation.isPending}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.backgroundMuted },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  logoPicker: {
    backgroundColor: "#eee",
    height: 180,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  logoPreview: { width: "100%", height: "100%", borderRadius: 10 },
});
