import { baseURL } from "@/api";
import { useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import {
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { getAllEvents } from "../api/event";
import { createInvite } from "../api/invite";
import colors from "./Colors";

interface Event {
  _id: string;
  user: string | { _id: string };
  location?: string;
  date?: string;
}

const CustomizeInvitationScreen = () => {
  const { templateId, background, title, subtitle, eventId } =
    useLocalSearchParams<{
      templateId?: string;
      background?: string;
      title?: string;
      subtitle?: string;
      eventId?: string;
    }>();

  const [events, setEvents] = useState<Event[]>([]);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [hostName, setHostName] = useState<string>("");

  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const loadUserFromToken = async () => {
      const token = await SecureStore.getItemAsync("token");
      if (token) {
        const decoded: any = jwtDecode(token);
        setUserId(decoded._id);
        setHostName(decoded.username);
      }
    };
    loadUserFromToken();
  }, []);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        if (userId) {
          const allEvents: Event[] = await getAllEvents();
          let selectedEvent: Event | null = null;

          if (eventId) {
            selectedEvent =
              allEvents.find((e: Event) => e._id === eventId) || null;
          }

          if (!selectedEvent) {
            selectedEvent =
              allEvents.find(
                (e: Event) =>
                  (typeof e.user === "string" ? e.user : e.user._id) === userId
              ) || null;
          }

          if (selectedEvent) {
            setEvent(selectedEvent);
          }
        }
      } catch (err) {
        console.log("Error fetching events:", err);
      }
    };
    fetchEvent();
  }, [userId, eventId]);

  const generateQrPreview = async () => {
    try {
      const res = await createInvite({
        event: event?._id,
        guestName,
        guestEmail,
        inviteTemplate: templateId,
      });
      setQrCodeImage(res.qrCodeImage);
      setInviteLink(res.inviteLink);
      setModalVisible(true);
    } catch (err) {
      console.log("Error generating QR preview:", err);
    }
  };

  const handleCreateInvite = async () => {
    try {
      await createInvite({
        event: event?._id,
        guestName,
        guestEmail,
        inviteTemplate: templateId,
      });
      alert("Guest saved successfully");
    } catch (err) {
      console.log("Error saving invite:", err);
      alert("Failed to save invite");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Customize Invitation</Text>

      {/* Invitation Preview */}
      <Text style={styles.sectionTitle}>Invitation Preview</Text>
      <View
        style={[
          styles.previewCard,
          background ? { backgroundColor: "transparent" } : {},
        ]}
      >
        {background ? (
          <>
            <Image
              source={{ uri: `${baseURL}${background}` }}
              style={styles.previewBackground}
              resizeMode="cover"
            />
            <View style={styles.previewOverlay} />
          </>
        ) : null}

        <Text style={styles.inviteTitle}>
          {title || "You're Cordially Invited"}
        </Text>

        <Text style={styles.inviteName}>{hostName || "Host Name"}</Text>

        <Text style={styles.inviteSubtitle}>
          {event?.location || "Event Location"} •{" "}
          {event?.date
            ? new Date(event.date).toLocaleDateString()
            : "Event Date"}
        </Text>

        {qrCodeImage ? (
          <Image source={{ uri: qrCodeImage }} style={styles.qrImage} />
        ) : (
          <View style={styles.qrPlaceholder}>
            <Text>QR Code Here</Text>
          </View>
        )}
      </View>

      {/* Guest Input */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Guest Info</Text>
        <TextInput
          placeholder="Guest Name"
          style={styles.input}
          value={guestName}
          onChangeText={setGuestName}
          placeholderTextColor="#959393ff"
        />
        <TextInput
          placeholder="Guest Email"
          style={styles.input}
          value={guestEmail}
          onChangeText={setGuestEmail}
          placeholderTextColor="#959393ff"
        />
      </View>

      {/* Event Details */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Event Details</Text>
        <Text>Host: {hostName || "Unknown"}</Text>
        <Text>Location: {event?.location || "Unknown"}</Text>
        <Text>
          Date:{" "}
          {event?.date ? new Date(event.date).toLocaleDateString() : "Unknown"}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.previewButton}
        onPress={generateQrPreview}
      >
        <Text style={styles.previewButtonText}>Save & Generate QR</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.sectionTitle}>Invitation Preview</Text>

            {/* Modal template card*/}
            <View style={styles.previewCard}>
              {background ? (
                <>
                  <Image
                    source={{ uri: `${baseURL}${background}` }}
                    style={styles.previewBackground}
                    resizeMode="cover"
                  />
                  <View style={styles.previewOverlay} />
                </>
              ) : null}

              <Text style={styles.inviteTitle}>
                {title || "You're Cordially Invited"}
              </Text>

              <Text style={styles.inviteName}>{guestName || "Guest Name"}</Text>

              <Text style={styles.inviteSubtitle}>
                {event?.location || "Event Location"} •{" "}
                {event?.date
                  ? new Date(event.date).toLocaleDateString()
                  : "Event Date"}
              </Text>

              {qrCodeImage ? (
                <Image source={{ uri: qrCodeImage }} style={styles.qrImage} />
              ) : (
                <View style={styles.qrPlaceholder}>
                  <Text>QR Code Here</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[styles.button, { marginTop: 20 }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                { marginTop: 10, backgroundColor: "#25D366" },
              ]}
              onPress={() => {
                if (qrCodeImage && inviteLink) {
                  const message = `You're invited!\n\nEvent: ${
                    title || "My Event"
                  }\nLocation: ${event?.location || "Unknown"}\nDate: ${
                    event?.date
                      ? new Date(event.date).toLocaleDateString()
                      : "Unknown"
                  }\n\nClick here for your invitation: ${inviteLink}`;

                  Linking.openURL(
                    `whatsapp://send?text=${encodeURIComponent(message)}`
                  );
                } else {
                  alert("Generate QR first!");
                }
              }}
            >
              <Text style={styles.buttonText}>Share to WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};
export default CustomizeInvitationScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: colors.backgroundMuted },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#7a1c1c",
  },
  card: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: { fontWeight: "bold", marginBottom: 8, fontSize: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#000000ff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  previewCard: {
    backgroundColor: "#b23a48",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
  },
  inviteTitle: { color: "#fff", fontSize: 16, marginBottom: 6 },
  inviteName: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  inviteSubtitle: { color: "#eee", fontSize: 14, marginBottom: 16 },
  qrImage: { width: 120, height: 120, marginTop: 10 },
  qrPlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  button: {
    backgroundColor: "#f28b82",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  previewButton: {
    backgroundColor: "#f28b82",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  previewButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  previewBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },

  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 16,
  },
});
