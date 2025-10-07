import {
  addServiceToEvent,
  getEventById,
  getEventServices,
  getMyEvents,
} from "@/api/event";
import { getServiceById } from "@/api/service";
import { buildImageUrl } from "@/Utils/buildImage";
import { isTodayOrFuture } from "@/Utils/date";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import colors from "../Colors";
import CustomButton from "../customButton";
import EventDropdown from "../DropdownEvent";

const ServiceDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const {
    data: service,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["serviceById", id],
    queryFn: () => getServiceById(String(id)),
    enabled: !!id,
  });

  const {
    data: events = [],
    isFetching: isFetchingEvents,
    isError: isErrorEvents,
    error: errorEvents,
  } = useQuery({
    queryKey: ["Myevents"],
    queryFn: getMyEvents,
  });

  const { data: selectedEvent } = useQuery({
    queryKey: ["eventById", selectedEventId],
    queryFn: () => getEventById(selectedEventId!),
    enabled: !!selectedEventId,
  });

  const { data: selectedEventServices } = useQuery({
    queryKey: ["eventServices", selectedEventId],
    queryFn: () => getEventServices(selectedEventId!),
    enabled: !!selectedEventId,
  });

  const currentTotal = (selectedEventServices?.services ?? []).reduce(
    (sum, s) => sum + Number(s.price || 0),
    0
  );
  const budget = Number(selectedEvent?.budget || 0);
  const remainingBudget = Math.max(0, budget - currentTotal);
  const { mutate, isPending } = useMutation({
    mutationFn: ({
      eventId,
      serviceId,
    }: {
      eventId: string;
      serviceId: string;
    }) => addServiceToEvent(eventId, serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Myevents"] });
      queryClient.invalidateQueries({ queryKey: ["eventServices"] });
      Toast.show({
        type: "success",
        text1: "Service added",
        text2: "Service has been added successfully",
      });
      router.dismissTo("/(personal)/(protect)/(tabs)/");
    },
    onError: () => {
      Toast.show({
        type: "error",
        text1: "Failed to add service. Please try again",
      });
    },
  });

  const formatEventLabel = (e?: { location?: string; date?: string }) =>
    e
      ? `${e.location || "Unknown"} - ${
          e.date ? new Date(e.date).toLocaleDateString("en-GB") : "—"
        }`
      : "Select an event";

  const upcomingEvents = (events as any[]).filter((e) =>
    isTodayOrFuture(e?.date)
  );

  const options = upcomingEvents.map((e: any) => ({
    key: e._id,
    value: formatEventLabel(e),
  }));

  const selectedDefault =
    selectedEventId && upcomingEvents.length
      ? {
          key: selectedEventId,
          value: formatEventLabel(
            upcomingEvents.find((e: any) => e._id === selectedEventId)
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
    if (Number(service.price || 0) > remainingBudget) {
      Toast.show({
        type: "error",
        text1: "Over budget",
        text2: "This service exceeds your remaining budget.",
      });
      return;
    }
    mutate({
      eventId: selectedEventId,
      serviceId: service._id,
    });
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
              <EventDropdown
                data={options}
                isLoading={isFetchingEvents}
                isError={!!isErrorEvents}
                selectedKey={selectedEventId}
                placeholder="Choose an event"
                onSelect={(id: string) => onSelect(id)}
              />

              {!!selectedEventId && (
                <Text
                  style={{
                    marginTop: 16,
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
        <View style={{ alignItems: "center", marginTop: 120 }}>
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
  error: { color: colors.danger, fontSize: 12, fontWeight: "600" },
});
