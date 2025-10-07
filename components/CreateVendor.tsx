import { createVendor } from "@/api/vendor";
import { Entypo } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Formik } from "formik";
import React, { useEffect, useState } from "react";
import {
  Image,
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
import { getAllCategory } from "../api/category";
import { getUserById } from "../api/users";
import colors from "../components/Colors";
import CustomButton from "./customButton";

// Category type
type Category = { _id: string; name: string };

// Image type
type ImageType = { uri: string; fileName?: string; type?: string };

// Formik values type
interface VendorFormValues {
  business_name: string;
  bio: string;
  logo: ImageType | null;
  categories: string[];
}

// Validation schema
const VendorSchema = Yup.object().shape({
  business_name: Yup.string().trim().required("Business name cannot be empty."),
  bio: Yup.string().trim().required("Bio cannot be empty."),
  logo: Yup.object().nullable().required("Please select a logo."),
  categories: Yup.array().min(1, "Please select at least one category."),
});

export default function CreateVendor() {
  const [userId, setUserId] = useState<string | null>(null);
  const [categorySearch, setCategorySearch] = useState("");
  const queryClient = useQueryClient();

  // Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getUserById();
        setUserId(user._id);
      } catch (err: any) {
        Toast.show({
          type: "error",
          text1: err.message || "Failed to load user",
        });
      }
    };
    fetchUser();
  }, []);

  const { data: allCategories = [], isLoading: categoriesLoading } = useQuery<
    Category[]
  >({
    queryKey: ["categories"],
    queryFn: getAllCategory,
  });

  const mutation = useMutation({
    mutationFn: createVendor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "vendor"] });
      Toast.show({
        type: "success",
        text1: "Vendor created successfully🎉!",
        visibilityTime: 2000,
      });
      router.back();
    },
    onError: (err: any) => {
      Toast.show({
        type: "error",
        text1: err.message || "Something went wrong❌",
      });
    },
  });

  const pickLogo = async (
    setFieldValue: (field: string, value: any) => void
  ) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Toast.show({
        type: "error",
        text1: "Permission required to access photos",
      });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setFieldValue("logo", result.assets[0]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Formik<VendorFormValues>
        initialValues={{
          business_name: "",
          bio: "",
          logo: null,
          categories: [],
        }}
        validationSchema={VendorSchema}
        onSubmit={(values) => {
          console.log("Submitting values:", values); // debug
          console.log("userId:", userId); // debug

          if (!userId) {
            Toast.show({ type: "error", text1: "User ID not loaded yet" });
            return;
          }

          const formData = new FormData();
          formData.append("business_name", values.business_name);
          formData.append("bio", values.bio);
          formData.append("user", userId);
          formData.append("logo", {
            uri: values.logo!.uri,
            name: values.logo!.fileName || "logo.jpg",
            type: values.logo!.type || "image/jpeg",
          } as any);
          values.categories.forEach((catId) =>
            formData.append("categories", catId)
          );

          mutation.mutate(formData);
        }}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          touched,
          errors,
          setFieldValue,
        }) => (
          <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
            {/* Business Name */}
            <TextInput
              style={styles.input}
              placeholder="Business Name"
              placeholderTextColor="rgba(133,133,133,0.3)"
              value={values.business_name}
              onChangeText={handleChange("business_name")}
              onBlur={handleBlur("business_name")}
            />
            {touched.business_name && errors.business_name && (
              <Text style={styles.error}>{errors.business_name}</Text>
            )}

            {/* Bio */}
            <TextInput
              style={[styles.input, { height: 100 }]}
              placeholder="Bio"
              placeholderTextColor="rgba(133,133,133,0.3)"
              value={values.bio}
              onChangeText={handleChange("bio")}
              onBlur={handleBlur("bio")}
              multiline
            />
            {touched.bio && errors.bio && (
              <Text style={styles.error}>{errors.bio}</Text>
            )}

            {/* Logo Picker */}
            <TouchableOpacity
              style={styles.logoPicker}
              onPress={() => pickLogo(setFieldValue)}
            >
              {values.logo ? (
                <Image
                  source={{ uri: values.logo.uri }}
                  style={styles.logoPreview}
                />
              ) : (
                <Entypo name="image" size={50} color="black" />
              )}
            </TouchableOpacity>
            {touched.logo && errors.logo && (
              <Text style={styles.error}>{errors.logo}</Text>
            )}

            {/* Categories */}
            <Text
              style={[
                styles.toggleButtonText,
                { marginBottom: 8, fontSize: 16 },
              ]}
            >
              Categories:
            </Text>
            <TextInput
              style={styles.categorySearchInput}
              placeholder="Search category..."
              placeholderTextColor={colors.placeholder}
              value={categorySearch}
              onChangeText={setCategorySearch}
            />
            <View style={styles.categorySeparator} />

            {categoriesLoading ? (
              <Text>Loading categories...</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {allCategories
                  .filter((cat) =>
                    cat.name
                      .toLowerCase()
                      .includes(categorySearch.toLowerCase())
                  )
                  .map((cat) => (
                    <TouchableOpacity
                      key={cat._id}
                      style={[
                        styles.vendorButton,
                        values.categories.includes(cat._id) &&
                          styles.vendorButtonSelected,
                      ]}
                      onPress={() => {
                        const newCats = values.categories.includes(cat._id)
                          ? values.categories.filter((id) => id !== cat._id)
                          : [...values.categories, cat._id];
                        setFieldValue("categories", newCats);
                      }}
                    >
                      <Text
                        style={{
                          color: values.categories.includes(cat._id)
                            ? "#fff"
                            : colors.secondary,
                          fontWeight: "bold",
                        }}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            )}
            {touched.categories && errors.categories && (
              <Text style={styles.error}>{errors.categories}</Text>
            )}

            {/* Submit Button */}
            <View style={{ alignItems: "center", marginTop: 120 }}>
              <CustomButton
                text={mutation.isPending ? "Creating..." : "Create Business"}
                onPress={() => handleSubmit()}
                variant="primary"
                disabled={mutation.isPending}
              />
            </View>
          </ScrollView>
        )}
      </Formik>
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
  categorySearchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 5,
    backgroundColor: "#fff",
  },
  categorySeparator: { height: 1, backgroundColor: "#ccc", margin: 15 },
  vendorButton: {
    padding: 10,
    borderRadius: 100,
    backgroundColor: colors.accent,
    marginRight: 10,
    marginBottom: 9,
  },
  vendorButtonSelected: { backgroundColor: colors.primary },
  toggleButtonText: { color: colors.secondary, fontWeight: "bold" },
  error: { color: colors.danger, fontSize: 12, marginBottom: 10 },
});
