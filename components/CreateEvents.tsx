import { createEvent } from "@/api/event";
import { formatMMDDYYYY, todayAtMidnight } from "@/Utils/date";
import { EventSchema } from "@/Utils/eventSchema";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Formik } from "formik";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import colors from "./Colors";
import CustomButton from "./customButton";

const CreateEvents = () => {
  const [show, setShow] = useState(false);
  const [date, setDate] = useState(new Date());

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ["Myevents"],
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Myevents"] });
      Toast.show({
        type: "success",
        text1: "Event saved",
        text2: "Your event was created successfully.",
      });
      router.dismissTo("/(personal)/(protect)/(tabs)/events");
    },
    onError: (err: any) => {
      Toast.show({
        type: "error",
        text1: "Failed to create event. Please try again",
      });
    },
  });
  const joinLocation = (address1: string, address2?: string) =>
    [address1?.trim(), address2?.trim()].filter(Boolean).join(", ");

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.backgroundMuted }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Formik
        initialValues={{ budget: "", date: "", address1: "", address2: "" }}
        validationSchema={EventSchema}
        onSubmit={(vals) =>
          mutate({
            budget: Number(vals.budget),
            date: vals.date,
            location: joinLocation(vals.address1, vals.address2),
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
          setFieldValue,
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
            <TouchableOpacity
              onPress={() => setShow(true)}
              activeOpacity={0.85}
            >
              <TextInput
                style={styles.input}
                placeholder="MM-DD-YYYY"
                value={values.date}
                editable={false}
                pointerEvents="none"
              />
            </TouchableOpacity>

            {show && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                minimumDate={todayAtMidnight()}
                textColor={colors.secondary}
                onChange={(_, selected) => {
                  if (Platform.OS === "android") setShow(false);
                  if (selected) {
                    setDate(selected);
                    setFieldValue("date", formatMMDDYYYY(selected));
                  }
                  setShow(false);
                }}
              />
            )}
            <Text style={styles.label}>Address 1</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Block 5, Street 12"
              value={values.address1}
              onChangeText={handleChange("address1")}
              onBlur={handleBlur("address1")}
            />
            {touched.address1 && errors.address1 && (
              <Text style={styles.error}>{errors.address1}</Text>
            )}
            <Text style={styles.label}>Address 2</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Apartment 10"
              value={values.address2}
              onChangeText={handleChange("address2")}
              onBlur={handleBlur("address2")}
            />
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
