import { deleteVendor, getVendorById, updateVendor } from "@/api/vendor";
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

const VendorDetail = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

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
      router.replace("/Vendor");
    },
    onError: () => {
      Toast.show({ type: "error", text1: "Failed to delete vendor" });
    },
  });

  // ✏️ Update mutation
  const { mutate: saveAll, isPending: saving } = useMutation({
    mutationFn: (body: any) => updateVendor(id!, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor", id] });
      Toast.show({ type: "success", text1: "Changes saved ✅" });
      setIsEditing(false);
    },
    onError: () =>
      Toast.show({ type: "error", text1: "Failed to update vendor" }),
  });

  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.secondary} size="large" />
        <Text style={{ marginTop: 10, color: colors.text }}>
          Loading vendor...
        </Text>
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
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Text style={styles.addBtn}>Edit</Text>
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
            onSubmit={(vals) => {
              const changes: any = {};
              if (vals.business_name !== vendor.business_name)
                changes.business_name = vals.business_name;
              if (vals.bio !== vendor.bio) changes.bio = vals.bio;
              if (vals.logo !== vendor.logo) changes.logo = vals.logo;

              if (Object.keys(changes).length === 0) {
                return Toast.show({
                  type: "info",
                  text1: "No changes to save",
                });
              }
              saveAll(changes);
            }}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              isSubmitting,
            }) => (
              <>
                {/* 🏢 Business Name */}
                <Text style={styles.label}>Business Name</Text>
                {isEditing ? (
                  <>
                    <TextInput
                      style={styles.input}
                      value={values.business_name}
                      onChangeText={handleChange("business_name")}
                      onBlur={handleBlur("business_name")}
                      placeholder="Enter business name"
                    />
                    {touched.business_name && errors.business_name && (
                      <Text style={styles.error}>
                        {errors.business_name as string}
                      </Text>
                    )}
                  </>
                ) : (
                  <Text style={styles.value}>{vendor.business_name}</Text>
                )}

                {/* 📝 Bio */}
                <Text style={styles.label}>Bio</Text>
                {isEditing ? (
                  <>
                    <TextInput
                      style={[styles.input, { height: 100 }]}
                      multiline
                      value={values.bio}
                      onChangeText={handleChange("bio")}
                      onBlur={handleBlur("bio")}
                      placeholder="Short business bio"
                    />
                    {touched.bio && errors.bio && (
                      <Text style={styles.error}>{errors.bio as string}</Text>
                    )}
                  </>
                ) : (
                  <Text style={styles.value}>{vendor.bio}</Text>
                )}

                {/* 🖼️ Logo */}
                <Text style={styles.label}>Logo URL</Text>
                {isEditing ? (
                  <>
                    <TextInput
                      style={styles.input}
                      value={values.logo}
                      onChangeText={handleChange("logo")}
                      onBlur={handleBlur("logo")}
                      placeholder="Logo image URL"
                    />
                    {touched.logo && errors.logo && (
                      <Text style={styles.error}>{errors.logo as string}</Text>
                    )}
                  </>
                ) : (
                  <Image
                    source={{ uri: vendor.logo }}
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 10,
                      marginTop: 10,
                    }}
                  />
                )}

                {isEditing && (
                  <View style={styles.rowRight}>
                    <TouchableOpacity
                      onPress={() => handleSubmit()}
                      disabled={saving || isSubmitting}
                    >
                      <Text
                        style={[
                          styles.saveBtn,
                          { opacity: saving || isSubmitting ? 0.5 : 1 },
                        ]}
                      >
                        {saving || isSubmitting ? "Saving…" : "Save"}
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
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },

  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  listItem: { fontSize: 15, color: colors.text, marginVertical: 3 },
  placeholder: { fontSize: 14, color: "#999", marginVertical: 4 },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowRight: { flexDirection: "row", justifyContent: "flex-end", marginTop: 16 },

  addBtn: { color: colors.primary, fontWeight: "600" },
  saveBtn: { color: colors.primary, fontWeight: "600", marginRight: 16 },
  cancelBtn: { color: colors.danger, fontWeight: "600" },
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
