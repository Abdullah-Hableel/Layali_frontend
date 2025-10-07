import { deleteServiceFromEvent, getEventServices } from "@/api/event";
import colors from "@/components/Colors";
import { Feather } from "@expo/vector-icons"; // 👈 import Feather icons
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import LottieView from "lottie-react-native";
import React from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const MyServices = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const {
    data: eventServices,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["eventServices", id],
    queryFn: () => getEventServices(id!),
    enabled: !!id,
  });

  const { mutate: handleDelete } = useMutation({
    mutationFn: (serviceId: string) =>
      deleteServiceFromEvent({ eventId: id!, serviceId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventServices", id] });
    },
  });

  const totalPrice = eventServices?.services.reduce(
    (sum: number, s: any) => sum + Number(s.price || 0),
    0
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <LottieView
          source={require("../../../assets/lottie/fUotSZvXcr.json")}
          autoPlay
          loop
          style={{ width: 140, height: 140 }}
        />
      </View>
    );
  }

  if (isError || !eventServices) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Failed to load services.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.meta}>
        Total services:{" "}
        <Text style={styles.bold}>{eventServices.servicesCount}</Text>
      </Text>
      <Text style={styles.meta}>
        Total price:{" "}
        <Text style={styles.bold}>{totalPrice?.toFixed(2)} KWD</Text>
      </Text>

      {eventServices.servicesCount === 0 ? (
        <Text style={styles.dim}>No services added yet</Text>
      ) : (
        <FlatList
          data={eventServices.services}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingVertical: 10 }}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>
                  {Number(item.price).toFixed(2)} KWD
                </Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    "Remove Service",
                    `Are you sure you want to remove ${item.name}?`,
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: () => {
                          handleDelete(item._id);
                        },
                      },
                    ]
                  )
                }
              >
                <Feather name="trash-2" size={17} color={colors.danger} />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default MyServices;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundMuted, padding: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  meta: { fontSize: 15, color: colors.text, marginBottom: 4 },
  bold: { fontWeight: "700" },
  dim: { color: "#999", fontSize: 14 },
  error: { color: colors.danger, fontSize: 12, fontWeight: "600" },
  item: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: { fontSize: 15, color: colors.text },
  price: { fontSize: 13, color: colors.secondary },
});
