import { Feather } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createService } from "../api/service";
import { getUserById } from "../api/users";
import colors from "../components/Colors";
import CustomButton from "./customButton";
// ✅ import your button

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Type for Vendor
type Vendor = {
  _id: string;
  business_name: string;
  services: any[];
};

export default function CreateService() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [image, setImage] = useState<any>(null);

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [vendorListOpen, setVendorListOpen] = useState(false);

  const queryClient = useQueryClient();

  // Fetch user and vendors
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getUserById();
        console.log("Logged-in user:", user);

        if (!user.vendors || user.vendors.length === 0) {
          Alert.alert("Error", "You must be a vendor to create services.");
          return;
        }

        // Map vendors to include empty services if missing
        const vendorObjects: Vendor[] = user.vendors.map((v: any) => ({
          _id: v._id,
          business_name: v.business_name,
          services: v.services || [],
        }));

        setVendors(vendorObjects);

        // Auto-select first vendor by default
        setSelectedVendorId(vendorObjects[0]._id);
        console.log("Vendors loaded:", vendorObjects);
      } catch (err: any) {
        console.error("Error fetching user:", err);
        Alert.alert("Error", err.message || "Failed to load user");
      }
    };

    fetchUser();
  }, []);

  const mutation = useMutation({
    mutationFn: createService,
    onSuccess: () => {
      console.log("Service created successfully");
      queryClient.invalidateQueries({ queryKey: ["user"] });
      router.back();
    },
    onError: (err: any) => {
      console.error("createService error:", err);
      Alert.alert("Error", err.message || "Something went wrong");
    },
  });

  const pickImage = async () => {
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
      setImage(result.assets[0]);
      console.log("Image selected:", result.assets[0]);
    }
  };

  const toggleVendorList = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setVendorListOpen(!vendorListOpen);
  };

  const handleSubmit = () => {
    if (!selectedVendorId) {
      Alert.alert(
        "Vendor not selected",
        "Please select a vendor before creating a service."
      );
      return;
    }

    if (!name || !price || !image) {
      Alert.alert(
        "Missing fields",
        "Please fill all fields and select an image"
      );
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price.toString());
    categories.forEach((cat) => formData.append("categories", cat));
    formData.append("vendor", selectedVendorId);

    formData.append("image", {
      uri: image.uri,
      name: image.fileName || "photo.jpg",
      type: image.type || "image/jpeg",
    } as any);

    console.log("Submitting formData:", {
      name,
      price,
      categories,
      selectedVendorId,
      image,
    });
    mutation.mutate(formData);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <TextInput
          style={styles.input}
          placeholder="Service name"
          placeholderTextColor="rgba(133, 133, 133, 0.3)"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Price"
          placeholderTextColor="rgba(133, 133, 133, 0.3)"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />

        {/* Vendor selector */}
        <View style={{ alignItems: "center", marginBottom: 4 }}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              styles.base, // 👈 reuse the CustomButton style
              {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }, // center content
            ]}
            onPress={toggleVendorList}
          >
            <Text style={styles.toggleButtonText}>Buisness name</Text>
            <Feather
              name={vendorListOpen ? "chevron-up" : "chevron-down"} // arrow direction
              size={20}
              color={colors.secondary} // from your Colors.tsx
              style={{ marginLeft: 8 }} // spacing between text and icon
            />
          </TouchableOpacity>
        </View>

        {vendorListOpen && (
          <View style={styles.vendorList}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {vendors.map((v) => (
                <TouchableOpacity
                  key={v._id}
                  style={[
                    styles.vendorButton,
                    selectedVendorId === v._id && styles.vendorButtonSelected,
                  ]}
                  onPress={() => setSelectedVendorId(v._id)}
                >
                  <Text
                    style={{
                      color: selectedVendorId === v._id ? "#fff" : "#000",
                      fontWeight: "bold",
                    }}
                  >
                    {v.business_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Image picker */}
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image.uri }} style={styles.imagePreview} />
          ) : (
            <Text>Select Image</Text>
          )}
        </TouchableOpacity>

        {/* ✅ Use CustomButton instead of TouchableOpacity */}
        <View style={{ alignItems: "center", marginTop: 20 }}>
          <CustomButton
            text="Create Service"
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
  container: { flex: 1, padding: 20, backgroundColor: colors.backgroundLight },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  imagePicker: {
    backgroundColor: "#eee",
    height: 180,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  imagePreview: { width: "100%", height: "100%", borderRadius: 10 },
  toggleButton: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: "center",
    marginBottom: 5,
  },
  toggleButtonText: { color: "#fff", fontWeight: "bold" },
  vendorList: {
    paddingVertical: 10,
  },
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
  vendorButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#ddd",
    marginRight: 10,
  },
  vendorButtonSelected: {
    backgroundColor: colors.primary,
  },
});
