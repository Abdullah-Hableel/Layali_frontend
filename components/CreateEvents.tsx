import { createEvent } from "@/api/event";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Formik } from "formik";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Yup from "yup";
import colors from "./Colors";
import CustomButton from "./customButton";

const EventSchema = Yup.object({
  budget: Yup.number()
    .typeError("Budget must be a number")
    .min(1, "Budget must be at least 1")
    .required("Budget is required"),
  date: Yup.string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, "Use format YYYY-MM-DD")
    .required("Date is required"),
  location: Yup.string()
    .min(2, "Location is too short")
    .required("Location is required"),
});

const CreateEvents = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ["Myevents"],
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Myevents"] });
      router.dismissTo("/Events");
    },
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.backgroundMuted }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Formik
        initialValues={{ budget: "", date: "", location: "" }}
        validationSchema={EventSchema}
        onSubmit={(vals) =>
          mutate({
            budget: Number(vals.budget),
            date: vals.date,
            location: vals.location.trim(),
          })
        }
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
        }) => (
          <View style={styles.container}>
            <Text style={styles.title}>Create Event</Text>

            <Text style={styles.label}>Budget (KD)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 500"
              keyboardType="numeric"
              value={values.budget}
              onChangeText={handleChange("budget")}
              onBlur={handleBlur("budget")}
            />
            {touched.budget && errors.budget && (
              <Text style={styles.error}>{errors.budget}</Text>
            )}

            <Text style={styles.label}>Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={values.date}
              onChangeText={handleChange("date")}
              onBlur={handleBlur("date")}
            />
            {touched.date && errors.date && (
              <Text style={styles.error}>{errors.date}</Text>
            )}

            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Kuwait City"
              value={values.location}
              onChangeText={handleChange("location")}
              onBlur={handleBlur("location")}
              autoCapitalize="words"
            />
            {touched.location && errors.location && (
              <Text style={styles.error}>{errors.location}</Text>
            )}
            <View style={{ alignItems: "center", padding: 30 }}>
              <CustomButton
                text={isPending ? "Saving..." : "Save"}
                onPress={() => handleSubmit()}
                disabled={isPending}
              />
            </View>
          </View>
        )}
      </Formik>
    </KeyboardAvoidingView>
  );
};

export default CreateEvents;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 10 },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
  },
  label: { fontSize: 14, fontWeight: "600", color: colors.text },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.secondary,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
    color: colors.secondary,
  },
  error: { color: colors.danger, fontSize: 12, fontWeight: "600" },
});
