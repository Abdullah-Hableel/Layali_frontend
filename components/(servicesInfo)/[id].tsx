import { baseURL } from "@/api";
import { deleteService, getServiceById, updateService } from "@/api/service";
import colors from "@/components/Colors";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { Formik } from "formik";
import LottieView from "lottie-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
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

const SERVER_URL = `${baseURL}/uploads/`;
const buildImageUrl = (img?: string) =>
  img ? `${SERVER_URL}${img}` : undefined;

const ServiceInfo = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [loadingImage, setLoadingImage] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);

  const {
    data: service,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["service", id],
    queryFn: () => getServiceById(id),
    enabled: !!id,
  });

  const { mutate: saveAll, isPending: saving } = useMutation({
    mutationFn: (formData: FormData) => updateService(id!, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service", id] });
      Toast.show({ type: "success", text1: "Service updated ✅" });
      setIsEditing(false);
      setPreview(null);
    },
    onError: () =>
      Toast.show({ type: "error", text1: "Failed to update service" }),
  });

  const { mutate: handleDelete, isPending: deleting } = useMutation({
    mutationFn: () => deleteService(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      Toast.show({ type: "success", text1: "Service deleted 🎉" });
      router.back();
    },
    onError: () =>
      Toast.show({ type: "error", text1: "Failed to delete service" }),
  });

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

  if (isError || !service) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Service not found ❌</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView style={styles.container}>
        {/* 🖼 Current service image */}
        <View style={styles.imageWrapper}>
          <Image
            source={{
              uri:
                preview ||
                (typeof service.image === "string"
                  ? buildImageUrl(service.image)
                  : undefined) ||
                "https://via.placeholder.com/300x200",
            }}
            style={styles.serviceImage}
            resizeMode="cover"
            onLoadStart={() => setLoadingImage(true)}
            onLoadEnd={() => setLoadingImage(false)}
          />
          {loadingImage && (
            <View style={styles.imageOverlay}>
              <ActivityIndicator color={colors.primary} size="large" />
            </View>
          )}
        </View>

        {/*  Service Info Form */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.title}>Service Info</Text>
            {!isEditing && (
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Text style={styles.editBtn}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>

          <Formik
            enableReinitialize
            initialValues={{
              name: service.name ?? "",
              price: String(service.price ?? ""),
              description: service.description ?? "",
              image: service.image ?? "",
            }}
            onSubmit={(vals) => {
              const formData = new FormData();
              formData.append("name", vals.name);
              formData.append("price", vals.price.toString());
              formData.append("description", vals.description);

              // Append image
              if (vals.image && typeof vals.image === "object") {
                formData.append("image", vals.image as any);
              } else if (typeof vals.image === "string") {
                formData.append("image", vals.image);
              }

              saveAll(formData);
            }}
          >
            {({ values, handleChange, handleSubmit, setFieldValue }) => (
              <>
                {/* 🖼 Image Picker */}
                {isEditing && (
                  <View style={{ alignItems: "center", marginVertical: 10 }}>
                    <TouchableOpacity
                      onPress={async () => {
                        const result =
                          await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            allowsEditing: true,
                            quality: 0.7,
                          });

                        if (!result.canceled && result.assets.length > 0) {
                          const asset = result.assets[0];
                          const pickedImage = {
                            uri: asset.uri,
                            name:
                              asset.fileName ||
                              `photo.${asset.uri.split(".").pop()}`,
                            type:
                              asset.type +
                              "/" +
                              (asset.uri.split(".").pop() || "jpeg"),
                          };
                          setFieldValue("image", pickedImage); // Formik
                          setPreview(asset.uri); // show picked image in top
                        }
                      }}
                    >
                      <Text
                        style={{ color: colors.primary, fontWeight: "600" }}
                      >
                        Upload Image
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Name */}
                <Text style={styles.label}>Name</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={values.name}
                    onChangeText={handleChange("name")}
                    placeholder="Enter name"
                  />
                ) : (
                  <Text style={styles.value}>{service.name}</Text>
                )}

                {/* Price */}
                <Text style={styles.label}>Price (KD)</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={values.price}
                    onChangeText={handleChange("price")}
                    keyboardType="numeric"
                  />
                ) : (
                  <Text style={styles.value}>{service.price} KD</Text>
                )}

                {/* Description */}
                <Text style={styles.label}>Description</Text>
                {isEditing ? (
                  <TextInput
                    style={[styles.input, { height: 100 }]}
                    value={values.description}
                    multiline
                    onChangeText={handleChange("description")}
                    placeholder="Enter description"
                  />
                ) : (
                  <Text style={styles.value}>{service.description}</Text>
                )}

                {/* Save / Cancel */}
                {isEditing && (
                  <View style={styles.editRow}>
                    <TouchableOpacity onPress={() => handleSubmit()}>
                      <Text style={styles.saveBtn}>
                        {saving ? "Saving..." : "Save"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setIsEditing(false);
                        setPreview(null);
                      }}
                    >
                      <Text style={styles.cancelBtn}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </Formik>
        </View>

        {/* 👤 Vendor Info */}
        {service.vendor && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Vendor Info</Text>
            <View style={styles.vendorRow}>
              <Image
                source={{
                  uri:
                    buildImageUrl(service.vendor.logo) ||
                    "https://via.placeholder.com/60",
                }}
                style={styles.vendorLogo}
              />
              <View>
                <Text style={styles.vendorName}>
                  {service.vendor.business_name}
                </Text>
                {service.vendor.bio && (
                  <Text style={styles.vendorBio}>{service.vendor.bio}</Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* 🗑 Delete */}
        <View style={{ alignItems: "center", marginVertical: 20 }}>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() =>
              Alert.alert("Delete Service", "Are you sure?", [
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
              {deleting ? "Deleting..." : "Delete Service"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default ServiceInfo;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.backgroundMuted },
  container: { padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  imageWrapper: { position: "relative", alignItems: "center" },
  serviceImage: { width: "100%", height: 220, borderRadius: 14 },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 20, fontWeight: "700", color: colors.text },
  editBtn: { color: colors.primary, fontWeight: "600" },
  label: { fontWeight: "600", color: colors.secondary, marginTop: 10 },
  value: { fontSize: 15, marginTop: 4, color: colors.text },
  input: {
    backgroundColor: "#f8f8f8",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    marginTop: 5,
  },
  editRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 16 },
  saveBtn: { color: colors.primary, fontWeight: "600", marginRight: 20 },
  cancelBtn: { color: colors.danger, fontWeight: "600" },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
  vendorRow: { flexDirection: "row", alignItems: "center" },
  vendorLogo: { width: 60, height: 60, borderRadius: 30, marginRight: 12 },
  vendorName: { fontSize: 16, fontWeight: "700", color: colors.text },
  vendorBio: { color: "#666", marginTop: 4 },
  deleteBtn: {
    backgroundColor: colors.danger,
    paddingVertical: 14,
    borderRadius: 30,
    width: "90%",
    alignItems: "center",
  },
  deleteText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  error: { color: colors.danger, fontSize: 16 },
});
