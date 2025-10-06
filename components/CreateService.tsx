import { Entypo } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Formik } from "formik";
import React, { useEffect, useState } from "react";
import {
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
import * as Yup from "yup";
import { getAllCategory } from "../api/category";
import { createService } from "../api/service";
import { getUserById } from "../api/users";
import colors from "../components/Colors";
import CustomButton from "./customButton";

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

// Image type
type ImageType = { uri: string; fileName?: string; type?: string };

// Formik values type
interface ServiceFormValues {
  name: string;
  description: string;
  time: string | number;
  price: string | number;
  categories: string[];
  vendor: string;
  image: ImageType | null;
}

// Validation Schema
const ServiceSchema = Yup.object().shape({
  name: Yup.string().trim().required("Service name cannot be empty."),
  description: Yup.string().trim().required("Description cannot be empty."),
  time: Yup.number()
    .typeError("Time must be a number")
    .positive("Time must be a positive number (in hours).")
    .required("Time is required"),
  price: Yup.number()
    .typeError("Price must be a number")
    .positive("Price must be greater than 0")
    .required("Price is required"),
  categories: Yup.array().min(1, "Please select at least one category."),
  vendor: Yup.string().required("Please select a vendor."),
  image: Yup.object().nullable().required("Please select an image."),
});

export default function CreateService() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedType, setSelectedType] = useState<string>("Standard");
  const [categorySearch, setCategorySearch] = useState<string>(""); // new search state
  const serviceTypes = ["Standard", "Premium", "VIP"];
  const queryClient = useQueryClient();

  // Fetch user and vendors
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getUserById();
        const vendorObjects: Vendor[] = user.vendors.map((v: any) => ({
          _id: v._id,
          business_name: v.business_name,
          services: v.services || [],
        }));
        setVendors(vendorObjects);
      } catch (err: any) {
        console.log(err.message || "Failed to load user");
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
    mutationFn: createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      router.back();
    },
    onError: (err: any) => console.log(err.message || "Something went wrong"),
  });

  const pickImage = async (
    setFieldValue: (field: string, value: any) => void
  ) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const image = result.assets[0];
      console.log("📸 Selected image:", image); // 👈 this logs the picked image object
      setFieldValue("image", image);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Formik<ServiceFormValues>
        initialValues={{
          name: "",
          description: "",
          time: "",
          price: "",
          categories: [] as string[],
          vendor: vendors[0]?._id || "",
          image: null,
        }}
        enableReinitialize
        validationSchema={ServiceSchema}
        onSubmit={(values) => {
          if (!values.image) return;
          const formData = new FormData();
          formData.append("name", values.name);
          formData.append("description", values.description);
          formData.append("time", `${values.time}Hour`);
          formData.append("type", selectedType);
          formData.append("price", values.price.toString());
          values.categories.forEach((catId) =>
            formData.append("categories", catId)
          );
          formData.append("vendor", values.vendor);
          formData.append("image", {
            uri: values.image.uri,
            name: values.image.fileName || "photo.jpg",
            type: values.image.type || "image/jpeg",
          } as any);
          mutation.mutate(formData);
        }}
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
          <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
            {/* Service Name */}
            <TextInput
              style={styles.input}
              placeholder="Service name"
              placeholderTextColor="rgba(133, 133, 133, 0.3)"
              value={values.name}
              onChangeText={handleChange("name")}
              onBlur={handleBlur("name")}
            />
            {touched.name && errors.name && (
              <Text style={styles.error}>{errors.name}</Text>
            )}

            {/* Description */}
            <TextInput
              style={styles.input}
              placeholder="Description"
              placeholderTextColor="rgba(133, 133, 133, 0.3)"
              value={values.description}
              onChangeText={handleChange("description")}
              onBlur={handleBlur("description")}
            />
            {touched.description && errors.description && (
              <Text style={styles.error}>{errors.description}</Text>
            )}

            {/* Time */}
            <TextInput
              style={styles.input}
              placeholder="Time (hours)"
              placeholderTextColor="rgba(133, 133, 133, 0.3)"
              value={values.time.toString()}
              onChangeText={handleChange("time")}
              onBlur={handleBlur("time")}
              keyboardType="numeric"
            />
            {touched.time && errors.time && (
              <Text style={styles.error}>{errors.time}</Text>
            )}

            {/* Price */}
            <TextInput
              style={styles.input}
              placeholder="Price"
              placeholderTextColor="rgba(133, 133, 133, 0.3)"
              value={values.price.toString()}
              onChangeText={handleChange("price")}
              onBlur={handleBlur("price")}
              keyboardType="numeric"
            />
            {touched.price && errors.price && (
              <Text style={styles.error}>{errors.price}</Text>
            )}

            {/* Vendors */}
            <Text
              style={[
                styles.toggleButtonText,
                { marginBottom: 8, fontSize: 16 },
              ]}
            >
              Business name:
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {vendors.map((v) => (
                <TouchableOpacity
                  key={v._id}
                  style={[
                    styles.vendorButton,
                    values.vendor === v._id && styles.vendorButtonSelected,
                  ]}
                  onPress={() => setFieldValue("vendor", v._id)}
                >
                  <Text
                    style={{
                      color:
                        values.vendor === v._id ? "#fff" : colors.secondary,
                      fontWeight: "bold",
                    }}
                  >
                    {v.business_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {touched.vendor && errors.vendor && (
              <Text style={styles.error}>{errors.vendor}</Text>
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

            {/* Category Search Input */}
            <TextInput
              style={styles.categorySearchInput}
              placeholder="Search category..."
              placeholderTextColor="rgba(133, 133, 133, 0.3)"
              value={categorySearch}
              onChangeText={setCategorySearch}
            />

            {/* Separator Line */}
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

            {/* Service Type */}
            <Text
              style={[
                styles.toggleButtonText,
                { marginBottom: 8, fontSize: 16 },
              ]}
            >
              Service Type:
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {serviceTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.vendorButton,
                    selectedType === type && styles.vendorButtonSelected,
                  ]}
                  onPress={() => setSelectedType(type)}
                >
                  <Text
                    style={{
                      color: selectedType === type ? "#fff" : colors.secondary,
                      fontWeight: "bold",
                    }}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Image Picker */}
            <TouchableOpacity
              style={styles.imagePicker}
              onPress={() => pickImage(setFieldValue)}
            >
              {values.image ? (
                <Image
                  source={{ uri: values.image.uri }}
                  style={styles.imagePreview}
                />
              ) : (
                <Entypo name="image" size={50} color="black" />
              )}
            </TouchableOpacity>
            {touched.image && errors.image && (
              <Text style={styles.error}>{errors.image}</Text>
            )}

            {/* Submit Button */}
            <View style={{ alignItems: "center", marginTop: 20 }}>
              <CustomButton
                text={mutation.isPending ? "Creating..." : "Create Service"}
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
  container: {
    flex: 1,
    backgroundColor: colors.backgroundMuted,
    paddingHorizontal: 20,
    marginTop: -20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 5,
    backgroundColor: "#fff",
  },
  categorySearchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 5,
    backgroundColor: "#fff",
  },
  categorySeparator: {
    height: 1,
    backgroundColor: "#ccc",
    marginBottom: 8,
  },
  vendorButton: {
    padding: 10,
    borderRadius: 100,
    backgroundColor: colors.accent,
    marginRight: 10,
    marginBottom: 9,
  },
  vendorButtonSelected: {
    backgroundColor: colors.primary,
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
  toggleButtonText: { color: colors.secondary, fontWeight: "bold" },
  error: { color: colors.danger, fontSize: 12, marginBottom: 10 },
});
