import {
  deleteEvent,
  getEventById,
  getEventServices,
  updateEvent,
} from "@/api/event";
import colors from "@/components/Colors";
import { formatMMDDYYYY, todayAtMidnight } from "@/Utils/date";
import { UpdateEventSchema } from "@/Utils/eventSchema";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { Formik } from "formik";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

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
        visibilityTime: 3000,
      });
    },
    onError: () => {
      Toast.show({
        type: "error",
        text1: "Failed to delete, please try again later.",
        visibilityTime: 4000,
      });
    },
  });

  const { mutate: saveAll, isPending: saving } = useMutation({
    mutationFn: (body: any) => updateEvent(id!, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Myevents", id] });
      queryClient.invalidateQueries({ queryKey: ["Myevents"] });
      Toast.show({ type: "success", text1: "Saved ✅" });
      setIsEditing(false);
    },
    onError: () =>
      Toast.show({
        type: "error",
        text1: "Failed to update, please try again later.",
      }),
  });

  const {
    data: eventServices,
    isLoading: servicesLoading,
    isError: servicesError,
  } = useQuery({
    queryKey: ["eventServices", id],
    queryFn: () => getEventServices(id!),
    enabled: !!id,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

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

  const totalInvites = event.invites?.length ?? 0;
  const attending =
    event.invites?.filter((g: any) => g.rsvpStatus === "Attending").length ?? 0;
  const pending =
    event.invites?.filter((g: any) => g.rsvpStatus === "Pending").length ?? 0;
  const declined =
    event.invites?.filter((g: any) => g.rsvpStatus === "NotAttending").length ??
    0;
  const responded = attending + declined;
  const responseRate =
    totalInvites > 0 ? Math.round((responded / totalInvites) * 100) : 0;

  const servicesTotal =
    eventServices?.services?.reduce(
      (sum: number, s: any) => sum + Number(s.price || 0),
      0
    ) || 0;

  const budgetNum = Number(event.budget || 0);
  const remainingBudget = budgetNum - servicesTotal;
  const NoBudget = budgetNum >= 0 && servicesTotal >= budgetNum;
  const spendPct =
    budgetNum > 0
      ? Math.min(100, Math.round((servicesTotal / budgetNum) * 100))
      : 0;
  return (
    <View style={styles.root}>
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.title}>Event Details</Text>
            {!isEditing && (
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Text style={styles.addBtn}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>

          <Formik
            enableReinitialize
            initialValues={{
              location: event.location ?? "",
              budget: String(event.budget ?? ""),
              date: new Date(event.date),
            }}
            validationSchema={UpdateEventSchema}
            onSubmit={(vals) => {
              const newEventDetails: any = {};
              const addrNew = vals.location.trim().replace(/\s+/g, " ");
              const addrOld = (event.location ?? "").trim();
              if (addrNew && addrNew !== addrOld) {
                newEventDetails.location = addrNew;
              }
              const budgetNew = Number(vals.budget);
              if (vals.budget && budgetNew !== Number(event.budget)) {
                newEventDetails.budget = budgetNew;
              }
              const oldDay = new Date(event.date);
              oldDay.setHours(0, 0, 0, 0);
              const newDay = new Date(vals.date);
              newDay.setHours(0, 0, 0, 0);

              if (newDay.getTime() !== oldDay.getTime()) {
                newEventDetails.date = newDay.toISOString();
              }
              if (Object.keys(newEventDetails).length === 0) {
                return Toast.show({
                  type: "info",
                  text1: "No changes to save",
                });
              }

              saveAll(newEventDetails);
            }}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              setFieldValue,
              isSubmitting,
            }) => (
              <>
                <Text style={styles.label}>Address</Text>
                {isEditing ? (
                  <>
                    <TextInput
                      style={styles.input}
                      value={values.location}
                      onChangeText={handleChange("location")}
                      onBlur={handleBlur("location")}
                      placeholder="Enter address"
                    />
                    {touched.location && errors.location && (
                      <Text style={styles.error}>
                        {errors.location as string}
                      </Text>
                    )}
                  </>
                ) : (
                  <Text style={styles.value}>{event.location}</Text>
                )}
                <Text style={styles.label}>Date</Text>
                {isEditing ? (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.input,
                        { justifyContent: "center", height: 48 },
                      ]}
                      onPress={() => setShowPicker(true)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.value}>
                        {formatMMDDYYYY(values.date)}
                      </Text>
                    </TouchableOpacity>

                    {showPicker && (
                      <DateTimePicker
                        value={values.date}
                        mode="date"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        minimumDate={todayAtMidnight()}
                        textColor={colors.secondary}
                        onChange={(_, selected) => {
                          if (Platform.OS === "android") setShowPicker(false);
                          if (selected) setFieldValue("date", selected);
                        }}
                      />
                    )}

                    {touched.date && typeof errors.date === "string" && (
                      <Text style={styles.error}>{errors.date}</Text>
                    )}
                  </>
                ) : (
                  <Text style={styles.value}>
                    {formatMMDDYYYY(new Date(event.date))}
                  </Text>
                )}

                <Text style={styles.label}>Budget</Text>
                {isEditing ? (
                  <>
                    <TextInput
                      style={styles.input}
                      value={values.budget}
                      onChangeText={handleChange("budget")}
                      onBlur={handleBlur("budget")}
                      keyboardType="numeric"
                      placeholder="e.g. 500"
                    />
                    {touched.budget && errors.budget && (
                      <Text style={styles.error}>
                        {errors.budget as string}
                      </Text>
                    )}
                  </>
                ) : (
                  <Text style={styles.value}>{event.budget} KD</Text>
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
                    <TouchableOpacity
                      onPress={() => {
                        setFieldValue("address1", event.location ?? "");
                        setFieldValue("budget", String(event.budget ?? ""));
                        setFieldValue("date", new Date(event.date));
                        setIsEditing(false);
                        setShowPicker(false);
                      }}
                      style={{ marginRight: 16 }}
                    >
                      <Text style={styles.cancelBtn}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </Formik>
        </View>

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Services</Text>
            <TouchableOpacity
              onPress={() =>
                router.push(`/(personal)/(serviceDetails)/(viewDetails)/${id}`)
              }
            >
              <Text style={styles.manageBtn}>View All</Text>
            </TouchableOpacity>
          </View>

          {servicesLoading && (
            <Text style={styles.placeholder}>Loading services…</Text>
          )}
          {servicesError && (
            <Text style={styles.error}>Failed to load services.</Text>
          )}

          {!servicesLoading && !servicesError && eventServices && (
            <>
              {eventServices.servicesCount === 0 ? (
                <Text style={styles.placeholder}>No services added yet</Text>
              ) : (
                <>
                  <View style={{ marginBottom: 8 }}>
                    <Text style={styles.value}>
                      Total services:{" "}
                      <Text style={{ fontWeight: "700" }}>
                        {eventServices.servicesCount}
                      </Text>
                    </Text>

                    <Text style={styles.value}>
                      Total spent:{" "}
                      <Text style={{ fontWeight: "700" }}>
                        {servicesTotal.toFixed(2)} KWD
                      </Text>
                    </Text>

                    <Text
                      style={[
                        styles.value,
                        NoBudget ? styles.overBudget : styles.underBudget,
                      ]}
                    >
                      Remaining budget:{" "}
                      <Text style={{ fontWeight: "700" }}>
                        {remainingBudget.toFixed(2)} KWD
                      </Text>
                    </Text>
                  </View>

                  {budgetNum > 0 && (
                    <View style={{ marginTop: 8 }}>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            NoBudget && { backgroundColor: colors.danger },
                            { width: `${spendPct}%` },
                          ]}
                        />
                      </View>
                      <Text
                        style={{
                          fontSize: 14,
                          color: colors.text,
                          marginTop: 4,
                        }}
                      >
                        {spendPct}% of {budgetNum.toFixed(2)} KWD used
                      </Text>
                    </View>
                  )}
                </>
              )}
            </>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Guests</Text>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/guest",
                })
              }
            >
              <Text style={styles.manageBtn}>Manage</Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              marginVertical: 12,
            }}
          >
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "bold",
                  color: "green",
                }}
              >
                {attending}
              </Text>
              <Text style={{ fontSize: 14, color: "green" }}>Attending</Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text
                style={{ fontSize: 22, fontWeight: "bold", color: colors.text }}
              >
                {totalInvites}
              </Text>
              <Text style={{ fontSize: 14, color: "#666" }}>Invited</Text>
            </View>
          </View>

          <View style={{ marginTop: 12 }}>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${responseRate}%` }]}
              />
            </View>
            <Text style={{ fontSize: 14, color: colors.text, marginTop: 4 }}>
              {responseRate}% response rate • {pending} pending
            </Text>
          </View>
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
    </View>
  );
};

export default EventDetails;

const styles = StyleSheet.create({
  rowRight: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  root: { flex: 1, backgroundColor: colors.backgroundMuted },
  container: { flex: 1, padding: 16 },
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
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
    textAlign: "center",
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.secondary,
    marginTop: 8,
  },
  value: { fontSize: 15, color: colors.text, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.text },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  addBtn: { color: colors.primary, fontWeight: "600" },
  manageBtn: { color: colors.secondary, fontWeight: "600" },
  placeholder: { fontSize: 14, color: "#999" },
  deleteBtn: {
    backgroundColor: colors.danger,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    width: 350,
  },
  deleteText: { fontSize: 18, fontWeight: "bold", color: colors.white },
  error: { color: colors.danger, fontSize: 12, fontWeight: "600" },
  saveBtn: { color: colors.primary, fontWeight: "600" },
  cancelBtn: { color: colors.danger, fontWeight: "600", marginLeft: 8 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
    color: colors.text,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#eee",
    marginVertical: 8,
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "green",
  },
  overBudget: {
    color: colors.danger,
    fontWeight: "700",
  },
  underBudget: {
    color: "green",
    fontWeight: "700",
  },
});
