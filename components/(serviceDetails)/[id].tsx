import { getMyEvents, updateEvent } from "@/api/event";
import { getServiceById } from "@/api/service";
import { buildImageUrl } from "@/Utils/buildImage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SelectList } from "react-native-dropdown-select-list";
import Toast from "react-native-toast-message";
import colors from "../Colors";
import CustomButton from "../customButton";

const ServiceDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    data: service,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["serviceById", id],
    queryFn: () => getServiceById(String(id)),
    enabled: !!id,
  });

  const {
    data: events,
    isFetching: isFetchingEvents,
    isError: isErrorEvents,
    error: errorEvents,
  } = useQuery({
    queryKey: ["Myevents"],
    queryFn: getMyEvents,
  });

  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Myevents"] });

      Toast.show({
        type: "success",
        text1: "Event updated",
        text2: "Your event was updated successfully.",
      });
      router.dismissTo("/(personal)/(protect)/(tabs)/vendor");
    },
    onError: (err: any) => {
      Toast.show({
        type: "error",
        text1: "Failed to update event. Please try again",
      });
    },
  });
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const formatEventLabel = (e?: { location?: string; date?: string }) =>
    e
      ? `${e.location || "Unknown"} - ${
          e.date ? new Date(e.date).toLocaleDateString("en-GB") : "—"
        }`
      : "Select an event";

  const options = (events ?? []).map((e: any) => ({
    key: e._id,
    value: formatEventLabel(e),
  }));

  const selectedDefault =
    selectedEventId && events
      ? {
          key: selectedEventId,
          value: formatEventLabel(
            (events as any[]).find((e) => e._id === selectedEventId)
          ),
        }
      : undefined;

  const onSelect = (id: string) => {
    setSelectedEventId(id);
    // TODO: fetch invites or perform any side-effect
  };

  const handleBooking = () => {
    if (!selectedEventId) {
      Toast.show({ type: "info", text1: "Please select an event first" });
      return;
    }
    mutate({
      id: selectedEventId,
      data: { services: [service._id] },
    });
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.secondary} />
      </View>
    );
  }

  if (isError || !service) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Failed to load service.</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.container}
      >
        <View style={{ marginTop: 12 }}>
          {!!events && events.length > 0 && (
            <View style={{ marginTop: 10, marginBottom: 12 }}>
              <Text style={{ color: colors.secondary, marginBottom: 6 }}>
                Select Event {isFetchingEvents ? "…" : ""}
              </Text>

              <SelectList
                setSelected={(id: string) => onSelect(id)}
                data={options}
                save="key"
                defaultOption={selectedDefault}
                placeholder="Choose an event"
                search
                maxHeight={260}
                boxStyles={{
                  borderColor: colors.neutral,
                  borderRadius: 8,
                  backgroundColor: colors.white,
                }}
                dropdownStyles={{
                  borderColor: colors.neutral,
                  borderRadius: 8,
                  backgroundColor: colors.white,
                }}
                inputStyles={{ color: colors.black }}
                dropdownTextStyles={{ color: colors.black }}
              />

              {!!selectedEventId && (
                <Text
                  style={{
                    marginTop: 6,
                    color: colors.secondary,
                    opacity: 0.9,
                  }}
                >
                  Selected:{" "}
                  {options.find((o) => o.key === selectedEventId)?.value}
                </Text>
              )}
            </View>
          )}

          {isErrorEvents && (
            <Text style={styles.error}>
              {errorEvents instanceof Error
                ? errorEvents.message
                : "Failed to load events."}
            </Text>
          )}

          {!!events && events.length === 0 && (
            <Text style={styles.muted}>No events yet.</Text>
          )}
        </View>

        {!!service.image && (
          <View style={{ marginTop: 12 }}>
            <View
              style={{
                height: 200,
                borderRadius: 16,
                backgroundColor: colors.backgroundMuted,
                overflow: "hidden",
              }}
            >
              <Image
                source={{ uri: buildImageUrl(service.image) }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            </View>
          </View>
        )}

        <Text style={styles.title}>{service.name}</Text>
        <Text style={styles.meta}>
          Price: {Number(service.price).toFixed(2)} KWD
        </Text>
        {!!service.type && (
          <Text style={styles.meta}>Type: {service.type}</Text>
        )}
        {!!service.time && (
          <Text style={styles.meta}>Duration: {service.time}</Text>
        )}
        <View style={{ marginTop: 20 }}>
          {!!service.description && (
            <Text style={styles.meta}>More Details: {service.description}</Text>
          )}
        </View>
        <View style={{ alignItems: "center", marginTop: 180 }}>
          <CustomButton
            text={isPending ? "Saving..." : "Book Now"}
            disabled={isPending}
            onPress={handleBooking}
          />
        </View>
      </ScrollView>
    </>
  );
};

export default ServiceDetails;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.backgroundMuted,
  },
  container: {
    padding: 16,
    gap: 8,
    backgroundColor: colors.backgroundMuted,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.backgroundMuted,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.secondary,
    marginTop: 10,
  },
  price: { fontSize: 15, fontWeight: "600", color: colors.accent },
  meta: { fontSize: 15, color: colors.secondary },
  desc: { fontSize: 15, color: colors.text, lineHeight: 20 },
  section: { fontSize: 15, fontWeight: "700", color: colors.secondary },
  rowCenter: { flexDirection: "row", alignItems: "center" },
  muted: { color: colors.secondary, opacity: 0.8, marginTop: 4 },
  error: { color: "#D32F2F" },
});
