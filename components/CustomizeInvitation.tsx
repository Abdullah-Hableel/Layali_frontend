import { baseURL } from "@/api";
import { useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { getAllEvents } from "../api/event";
import { createInvite } from "../api/invite";

const CustomizeInvitationScreen = () => {
  const { templateId, background, title, subtitle } = useLocalSearchParams<{
    templateId?: string;
    background?: string;
    title?: string;
    subtitle?: string;
  }>();

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);

  const [event, setEvent] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [hostName, setHostName] = useState<string>("");

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
          const events = await getAllEvents();
          const userEvents = events.filter(
            (e: any) => String(e.user?._id || e.user) === userId
          );

          if (userEvents.length > 0) {
            setEvent(userEvents[0]);
          }
        }
      } catch (err) {
        console.log("Error fetching events:", err);
      }
    };

    fetchEvent();
  }, [userId]);

  const generateQrPreview = async () => {
    try {
      const res = await createInvite({
        event: event?._id,
        guestName,
        guestEmail,
        inviteTemplate: templateId,
      });
      setQrCodeImage(res.qrCodeImage);
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

      {/* Event Details */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Event Details</Text>
        <Text>Event ID: {event?._id || "Unknown"}</Text>
        <Text>Host: {hostName || "Unknown"}</Text>
        <Text>Location: {event?.location || "Unknown"}</Text>
        <Text>
          Date:{" "}
          {event?.date ? new Date(event.date).toLocaleDateString() : "Unknown"}
        </Text>
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

      <TouchableOpacity
        style={styles.previewButton}
        onPress={generateQrPreview}
      >
        <Text style={styles.previewButtonText}>Preview QR</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleCreateInvite}>
        <Text style={styles.buttonText}>Save & Generate QR</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
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
  previewBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 16,
  },
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
});

export default CustomizeInvitationScreen;

// import { baseURL } from "@/api";
// import { useLocalSearchParams } from "expo-router";
// import React, { useEffect, useState } from "react";
// import {
//   Image,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { createInvite } from "../api/invite";

// const CustomizeInvitationScreen = () => {
//   const { templateId, eventId, background, title, subtitle } =
//     useLocalSearchParams<{
//       templateId?: string;
//       eventId?: string;
//       background?: string;
//       title?: string;
//       subtitle?: string;
//     }>();

//   useEffect(() => {
//     console.log("Selected Template:", templateId);
//     console.log("eventId =>", eventId);
//   }, []);

//   const [guestName, setGuestName] = useState("");
//   const [guestEmail, setGuestEmail] = useState("");
//   const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);

//   const generateQrPreview = async () => {
//     try {
//       const res = await createInvite({
//         event: eventId,
//         guestName,
//         guestEmail,
//         inviteTemplate: templateId,
//       });
//       setQrCodeImage(res.qrCodeImage);
//     } catch (err) {
//       console.log("Error generating QR preview:", err);
//     }
//   };

//   const handleCreateInvite = async () => {
//     try {
//       await createInvite({
//         event: eventId,
//         guestName,
//         guestEmail,
//         inviteTemplate: templateId,
//       });
//       // setQrCodeImage(res.qrCodeImage);
//       alert("Guest saved successfully");
//     } catch (err) {
//       console.log("Error saving invite:", err);
//       alert("Failed to save invite");
//     }
//   };

//   return (
//     <ScrollView style={styles.container}>
//       <Text style={styles.header}>Customize Invitation</Text>

//       {/* Event Details Section */}
//       <View style={styles.card}>
//         <Text style={styles.sectionTitle}>Event Details</Text>
//         <Text> Event ID: {eventId}</Text>
//         {/* <Text> Template: {title || "background theme" || templateId}</Text> */}
//       </View>

//       {/* Guest Input */}
//       <View style={styles.card}>
//         <Text style={styles.sectionTitle}>Guest Info</Text>
//         <TextInput
//           placeholder="Guest Name"
//           style={styles.input}
//           value={guestName}
//           onChangeText={setGuestName}
//           placeholderTextColor="#959393ff"
//         />
//         <TextInput
//           placeholder="Guest Email"
//           style={styles.input}
//           value={guestEmail}
//           onChangeText={setGuestEmail}
//           placeholderTextColor="#959393ff"
//         />
//       </View>

//       {/* Preview */}
//       <Text style={styles.sectionTitle}>Invitation Preview</Text>
//       <View
//         style={[
//           styles.previewCard,
//           background ? { backgroundColor: "transparent" } : {},
//         ]}
//       >
//         {/* background template */}
//         {background ? (
//           <>
//             <Image
//               source={{ uri: `${baseURL}${background}` }}
//               style={styles.previewBackground}
//               resizeMode="cover"
//             />
//             <View style={styles.previewOverlay} />
//           </>
//         ) : null}

//         <Text style={styles.inviteTitle}>
//           {title || "You're Cordially Invited"}
//         </Text>
//         <Text style={styles.inviteName}>{guestName || "Guest Name"}</Text>
//         <Text style={styles.inviteSubtitle}>
//           {subtitle || "Wedding Celebration"}
//         </Text>

//         {/* QR Preview */}
//         {qrCodeImage ? (
//           <Image source={{ uri: qrCodeImage }} style={styles.qrImage} />
//         ) : (
//           <View style={styles.qrPlaceholder}>
//             <Text>QR Code Here</Text>
//           </View>
//         )}
//       </View>

//       {/* preview QR */}
//       <TouchableOpacity
//         style={styles.previewButton}
//         onPress={generateQrPreview}
//       >
//         <Text style={styles.previewButtonText}>Preview QR</Text>
//       </TouchableOpacity>

//       {/* preview Button */}
//       <TouchableOpacity style={styles.button} onPress={handleCreateInvite}>
//         <Text style={styles.buttonText}>Save & Generate QR</Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 16, backgroundColor: "#fff" },
//   header: {
//     fontSize: 22,
//     fontWeight: "bold",
//     marginBottom: 16,
//     color: "#7a1c1c",
//   },
//   card: {
//     backgroundColor: "#f9f9f9",
//     padding: 16,
//     borderRadius: 12,
//     marginBottom: 16,
//   },
//   sectionTitle: { fontWeight: "bold", marginBottom: 8, fontSize: 16 },
//   input: {
//     borderWidth: 1,
//     borderColor: "#000000ff",
//     borderRadius: 8,
//     padding: 10,
//     marginBottom: 12,
//   },
//   previewCard: {
//     backgroundColor: "#b23a48",
//     borderRadius: 16,
//     padding: 24,
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   inviteTitle: { color: "#fff", fontSize: 16, marginBottom: 6 },
//   inviteName: { color: "#fff", fontSize: 20, fontWeight: "bold" },
//   inviteSubtitle: { color: "#eee", fontSize: 14, marginBottom: 16 },
//   qrImage: { width: 120, height: 120, marginTop: 10 },
//   qrPlaceholder: {
//     width: 120,
//     height: 120,
//     backgroundColor: "#fff",
//     alignItems: "center",
//     justifyContent: "center",
//     borderRadius: 8,
//   },
//   button: {
//     backgroundColor: "#f28b82",
//     padding: 16,
//     borderRadius: 12,
//     alignItems: "center",
//     marginTop: 10,
//   },
//   buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
//   previewBackground: {
//     ...StyleSheet.absoluteFillObject,
//     borderRadius: 16,
//   },
//   previewOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "rgba(0,0,0,0.3)",
//     borderRadius: 16,
//   },
//   previewButton: {
//     backgroundColor: "#f28b82",
//     padding: 12,
//     borderRadius: 10,
//     alignItems: "center",
//     marginTop: 10,
//   },
//   previewButtonText: {
//     color: "#fff",
//     fontWeight: "bold",
//     fontSize: 16,
//   },
// });

// export default CustomizeInvitationScreen;
