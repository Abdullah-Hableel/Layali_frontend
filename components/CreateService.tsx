import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
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
import { getAllCategory } from "../api/category";
import { createService } from "../api/service";
import { getUserById } from "../api/users";
import colors from "../components/Colors";
import CustomButton from "./customButton";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Vendor type
type Vendor = {
  _id: string;
  business_name: string;
  services: any[];
};

// Category type
type Category = {
  _id: string;
  name: string;
};

export default function CreateService() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [image, setImage] = useState<any>(null);

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);

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

        const vendorObjects: Vendor[] = user.vendors.map((v: any) => ({
          _id: v._id,
          business_name: v.business_name,
          services: v.services || [],
        }));

        setVendors(vendorObjects);
        setSelectedVendorId(vendorObjects[0]._id);
      } catch (err: any) {
        console.error("Error fetching user:", err);
        Alert.alert("Error", err.message || "Failed to load user");
      }
    };

    fetchUser();
  }, []);

  // Fetch categories via Axios + react-query
  const { data: allCategories = [], isLoading: categoriesLoading } = useQuery<
    Category[]
  >({
    queryKey: ["categories"],
    queryFn: getAllCategory,
  });

  // Mutation to create service
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

  // Pick image
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

  // Submit form
  const handleSubmit = () => {
    if (!selectedVendorId) {
      Alert.alert("Vendor not selected", "Please select a vendor.");
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
    categories.forEach((catId) => formData.append("categories", catId));
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
        {/* Service name */}
        <TextInput
          style={styles.input}
          placeholder="Service name"
          placeholderTextColor="rgba(133, 133, 133, 0.3)"
          value={name}
          onChangeText={setName}
        />

        {/* Price */}
        <TextInput
          style={styles.input}
          placeholder="Price"
          placeholderTextColor="rgba(133, 133, 133, 0.3)"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />

        {/* Vendor selector */}
        <View style={{ marginBottom: 15 }}>
          <Text
            style={[styles.toggleButtonText, { marginBottom: 8, fontSize: 16 }]}
          >
            Business name:
          </Text>
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

        {/* Category selector */}
        <View style={{ marginBottom: 15 }}>
          <Text
            style={[styles.toggleButtonText, { marginBottom: 8, fontSize: 16 }]}
          >
            Categories:
          </Text>
          {categoriesLoading ? (
            <Text>Loading categories...</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {allCategories.map((cat) => (
                <TouchableOpacity
                  key={cat._id}
                  style={[
                    styles.vendorButton,
                    categories.includes(cat._id) && styles.vendorButtonSelected,
                  ]}
                  onPress={() => {
                    if (categories.includes(cat._id)) {
                      setCategories(categories.filter((id) => id !== cat._id));
                    } else {
                      setCategories([...categories, cat._id]);
                    }
                  }}
                >
                  <Text
                    style={{
                      color: categories.includes(cat._id) ? "#fff" : "#000",
                      fontWeight: "bold",
                    }}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Image picker */}
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image.uri }} style={styles.imagePreview} />
          ) : (
            <Text>Select Image</Text>
          )}
        </TouchableOpacity>

        {/* Submit button */}
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
  vendorButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#ddd",
    marginRight: 10,
  },
  vendorButtonSelected: {
    backgroundColor: colors.primary,
  },
  toggleButtonText: { color: "#000", fontWeight: "bold" },
});
