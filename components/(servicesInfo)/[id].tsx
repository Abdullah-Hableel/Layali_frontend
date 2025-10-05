import { baseURL } from "@/api";
import { deleteService, getServiceById, updateService } from "@/api/service";
import colors from "@/components/Colors";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { Formik } from "formik";
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
    mutationFn: (body: any) => updateService(id!, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service", id] });
      Toast.show({ type: "success", text1: "Service updated ✅" });
      setIsEditing(false);
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
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10, color: colors.text }}>
          Loading service...
        </Text>
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
        {/* 🖼 Service Image */}
        <View style={styles.imageWrapper}>
          <Image
            source={{
              uri:
                buildImageUrl(service.image) ||
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

        {/* ✏️ Info */}
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
              const changes: any = {};
              if (vals.name !== service.name) changes.name = vals.name;
              if (vals.price !== String(service.price))
                changes.price = Number(vals.price);
              if (vals.description !== service.description)
                changes.description = vals.description;
              if (vals.image !== service.image) changes.image = vals.image;

              if (Object.keys(changes).length === 0)
                return Toast.show({
                  type: "info",
                  text1: "No changes to save",
                });

              saveAll(changes);
            }}
          >
            {({ values, handleChange, handleSubmit }) => (
              <>
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

                {isEditing && (
                  <View style={styles.editRow}>
                    <TouchableOpacity onPress={() => handleSubmit()}>
                      <Text style={styles.saveBtn}>
                        {saving ? "Saving..." : "Save"}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setIsEditing(false)}>
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
  serviceImage: {
    width: "100%",
    height: 220,
    borderRadius: 14,
  },
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
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
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
  editRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
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
