import { deleteVendor, getVendorById, updateVendor } from "@/api/vendor";
import colors from "@/components/Colors";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { Formik } from "formik";
import LottieView from "lottie-react-native";
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
import Toast from "react-native-toast-message";

const VendorDetail = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // ✅ Fetch vendor details
  const {
    data: vendor,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["vendor", id],
    queryFn: () => getVendorById(id),
    enabled: !!id,
  });

  // 🗑 Delete mutation
  const { mutate: handleDelete, isPending: deleting } = useMutation({
    mutationFn: () => deleteVendor(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      Toast.show({ type: "success", text1: "Vendor deleted 🎉" });
      router.back();
    },
    onError: () => {
      Toast.show({ type: "error", text1: "Failed to delete vendor" });
    },
  });

  // ✏️ Update mutation (multipart)
  const { mutate: saveAll, isPending: saving } = useMutation({
    mutationFn: (formData: FormData) => updateVendor(id!, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor", id] });
      Toast.show({ type: "success", text1: "Changes saved ✅" });
      setIsEditing(false);
      setSelectedImage(null);
    },
    onError: (err: any) => {
      console.error("❌ Update failed:", err.response?.data || err.message);
      Toast.show({ type: "error", text1: "Failed to update vendor" });
    },
  });

  // 📸 Pick Image
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <LottieView
          source={require("../../assets/lottie/fUotSZvXcr.json")}
          autoPlay
          loop
          style={{ width: 140, height: 140 }}
        />
      </View>
    );
  }

  if (isError || !vendor) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Vendor not found ❌</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView style={styles.container}>
        {/* 📄 Vendor Info Card */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.title}>Business Details</Text>
            {!isEditing && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.editButtonText}>Edit ✏️</Text>
              </TouchableOpacity>
            )}
          </View>

          <Formik
            enableReinitialize
            initialValues={{
              business_name: vendor.business_name ?? "",
              bio: vendor.bio ?? "",
              logo: vendor.logo ?? "",
            }}
            onSubmit={async (vals) => {
              const formData = new FormData();
              formData.append("business_name", vals.business_name);
              formData.append("bio", vals.bio);

              if (selectedImage) {
                const filename = selectedImage.split("/").pop();
                const match = /\.(\w+)$/.exec(filename || "");
                const type = match ? `image/${match[1]}` : `image`;
                formData.append("logo", {
                  uri: selectedImage.startsWith("file://")
                    ? selectedImage
                    : `file://${selectedImage}`,
                  name: filename || `photo.${match?.[1] || "jpg"}`,
                  type,
                } as any);
              }

              saveAll(formData);
            }}
          >
            {({ values, handleChange, handleBlur, handleSubmit }) => (
              <>
                {/* 🏢 Business Name */}
                <Text style={styles.label}>Business Name</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={values.business_name}
                    onChangeText={handleChange("business_name")}
                    onBlur={handleBlur("business_name")}
                    placeholder="Enter business name"
                  />
                ) : (
                  <Text style={styles.value}>{vendor.business_name}</Text>
                )}

                {/* 📝 Bio */}
                <Text style={styles.label}>Bio</Text>
                {isEditing ? (
                  <TextInput
                    style={[styles.input, { height: 100 }]}
                    multiline
                    value={values.bio}
                    onChangeText={handleChange("bio")}
                    onBlur={handleBlur("bio")}
                    placeholder="Short business bio"
                  />
                ) : (
                  <Text style={styles.value}>{vendor.bio}</Text>
                )}

                {/* 🖼️ Logo */}
                <Text style={styles.label}>Logo</Text>
                {isEditing ? (
                  <>
                    {selectedImage || vendor.logo ? (
                      <Image
                        source={{ uri: selectedImage || vendor.logo }}
                        style={styles.logoPreview}
                      />
                    ) : null}
                    <TouchableOpacity
                      style={styles.uploadBtn}
                      onPress={pickImage}
                    >
                      <Text style={styles.uploadText}>
                        📤 Choose Logo Image
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <Image
                    source={{ uri: vendor.logo }}
                    style={styles.logoPreview}
                  />
                )}

                {isEditing && (
                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={() => handleSubmit()}
                      disabled={saving}
                    >
                      <Text style={styles.buttonText}>
                        {saving ? "Saving…" : "Save"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => setIsEditing(false)}
                    >
                      <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </Formik>
        </View>

        {/* 🗂️ Categories */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Categories</Text>
          {(vendor.categories || []).length > 0 ? (
            vendor.categories.map((c: any) => (
              <Text key={c._id} style={styles.listItem}>
                • {c.name}
              </Text>
            ))
          ) : (
            <Text style={styles.placeholder}>No categories available</Text>
          )}
        </View>

        {/* 🛎️ Services */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Services</Text>
          {(vendor.services || []).length > 0 ? (
            vendor.services.map((s: any) => (
              <Text key={s._id} style={styles.listItem}>
                • {s.name} — {s.price} KD
              </Text>
            ))
          ) : (
            <Text style={styles.placeholder}>No services available</Text>
          )}
        </View>

        {/* 📅 Events */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Events</Text>
          {(vendor.events || []).length > 0 ? (
            vendor.events.map((e: any) => (
              <Text key={e._id} style={styles.listItem}>
                • {e.title} — {new Date(e.date).toLocaleDateString()}
              </Text>
            ))
          ) : (
            <Text style={styles.placeholder}>No events available</Text>
          )}
        </View>

        {/* 🗑 Delete */}
        <View style={{ alignItems: "center", marginVertical: 20 }}>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() =>
              Alert.alert("Delete Vendor", "Are you sure?", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => handleDelete(),
                },
              ])
            }
            disabled={deleting}
          >
            <Text style={styles.deleteText}>
              {deleting ? "Deleting..." : "Delete Vendor"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default VendorDetail;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.backgroundMuted },
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 10,
    color: colors.secondary,
  },
  value: { fontSize: 15, marginTop: 6, color: colors.text },

  input: {
    width: "100%",
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    marginTop: 6,
  },

  logoPreview: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  uploadBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  uploadText: { color: "#fff", textAlign: "center", fontWeight: "600" },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    color: colors.text,
  },
  listItem: { fontSize: 15, color: colors.text, marginVertical: 3 },
  placeholder: { fontSize: 14, color: "#999", marginVertical: 4 },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  editButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  editButtonText: { color: "#fff", fontWeight: "600" },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 10,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.secondary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  deleteBtn: {
    backgroundColor: colors.danger,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    width: "90%",
  },
  deleteText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  error: { color: colors.danger, marginTop: 4 },
});
