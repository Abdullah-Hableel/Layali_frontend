import { deleteEvent, getEventById } from "@/api/event";
import colors from "@/components/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const EventDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const {
    data: event,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["Myevents", id],
    queryFn: () => getEventById(id),
    enabled: !!id,
  });
  const { mutate: handleDelete, isPending: deleting } = useMutation({
    mutationFn: () => deleteEvent(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Myevents"] });
      Toast.show({
        type: "success",
        text1: "Event deleted 🎉",
        position: "top",
        visibilityTime: 3000,
      });
      router.dismissTo("/(personal)/(protect)/(tabs)/events");
    },
    onError: () => {
      Toast.show({
        type: "error",
        text1: "Failed to delete ❌",
        text2: "Please try again later",
        visibilityTime: 4000,
      });
    },
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.secondary} />
      </View>
    );
  }

  if (isError || !event) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Event not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Event Details</Text>

          <Text style={styles.label}>Location</Text>
          <Text style={styles.value}>{event.location}</Text>

          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>{formatDate(event.date)}</Text>

          <Text style={styles.label}>Budget</Text>
          <Text style={styles.value}>{event.budget} KD</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Services</Text>
            <TouchableOpacity>
              <Text style={styles.addBtn}>+ Add</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.placeholder}>No services added yet</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Guests</Text>
            <TouchableOpacity>
              <Text style={styles.manageBtn}>Manage</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.placeholder}>No guest data</Text>
        </View>
        <View style={{ alignItems: "center" }}>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() =>
              Alert.alert(
                "Confirm Delete",
                "Are you sure you want to delete?",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => handleDelete(),
                  },
                ]
              )
            }
            disabled={deleting}
          >
            <Text style={styles.deleteText}>
              {deleting ? "Deleting..." : "Delete Event"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push(`/editEvent/${id}`)}
      >
        <MaterialIcons name="edit" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default EventDetails;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.backgroundMuted,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.backgroundMuted,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
    textAlign: "center",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.secondary,
    marginTop: 8,
  },
  value: {
    fontSize: 15,
    color: colors.text,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  addBtn: {
    color: colors.primary,
    fontWeight: "600",
  },
  manageBtn: {
    color: colors.secondary,
    fontWeight: "600",
  },
  placeholder: {
    fontSize: 14,
    color: "#999",
  },
  deleteBtn: {
    backgroundColor: colors.danger,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    width: 350,
  },
  deleteText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.white,
  },
  error: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.danger,
  },
  fab: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
});
