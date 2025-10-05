import { createGiftCard } from "@/api/giftCards";
import colors from "@/components/Colors";
import * as Contacts from "expo-contacts";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type ContactWithEmails = {
  id: string;
  name?: string;
  emails?: Contacts.Email[];
};

const CreateGiftCardScreen = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [contacts, setContacts] = useState<ContactWithEmails[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const [fromEmail, setFromEmail] = useState("");
  const [toEmail, setToEmail] = useState("");
  const [amount, setAmount] = useState("100");
  const [expirationDate, setExpirationDate] = useState("2025-12-31");

  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const openContactsPicker = async () => {
    if (!hasPermission) return;

    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.Emails],
      pageSize: 5000,
      sort: Contacts.SortTypes.FirstName,
    });

    const withEmails = (data as ContactWithEmails[]).filter(
      (c) => Array.isArray(c.emails) && c.emails.length > 0
    );
    setContacts(withEmails);
    setPickerOpen(true);
  };

  const pickEmail = (contact: ContactWithEmails, emailIndex = 0) => {
    const email = contact.emails?.[emailIndex]?.email ?? "";
    if (email) setToEmail(email.trim());
    setPickerOpen(false);
  };

  const sendGiftCard = async () => {
    try {
      await createGiftCard({
        senderEmail: fromEmail,
        coupleEmail: toEmail,
        amount: Number(amount),
        expirationDate,
      });
      alert("🎁 Gift card created successfully!");
      router.back();
    } catch (e: any) {
      alert(e?.response?.data?.message || "Failed to create gift card");
    }
  };

  return (
    <View style={styles.container}>
      {/* <Text style={styles.header}>🎁 Create Gift Card</Text> */}

      <Text style={styles.label}>From (your email)</Text>
      <TextInput
        value={fromEmail}
        onChangeText={setFromEmail}
        placeholder="you@example.com"
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
        placeholderTextColor={colors.placeholder}
      />

      <Text style={styles.label}>To (pick from Contacts or type)</Text>
      <View style={styles.row}>
        <TextInput
          value={toEmail}
          onChangeText={setToEmail}
          placeholder="friend@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          style={[styles.input, { flex: 1 }]}
          placeholderTextColor={colors.placeholder}
        />
        <TouchableOpacity
          onPress={openContactsPicker}
          style={styles.contactBtn}
        >
          <Text style={{ color: colors.white }}>Contacts</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Amount (KWD)</Text>
      <TextInput
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={styles.input}
        placeholderTextColor={colors.placeholder}
      />

      <Text style={styles.label}>Expiration Date (optional)</Text>
      <TextInput
        value={expirationDate}
        onChangeText={setExpirationDate}
        placeholder="YYYY-MM-DD"
        style={styles.input}
        placeholderTextColor={colors.placeholder}
      />

      <TouchableOpacity onPress={sendGiftCard} style={styles.sendBtn}>
        <Text style={styles.sendText}>Send Gift Card</Text>
      </TouchableOpacity>

      {/* Contacts Picker Modal */}
      <Modal visible={pickerOpen} animationType="slide">
        <View
          style={{
            flex: 1,
            padding: 16,
            backgroundColor: colors.backgroundMuted,
          }}
        >
          <Text style={styles.modalTitle}>Select a Contact</Text>
          <FlatList
            data={contacts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.contactCard}>
                <Text style={styles.contactName}>
                  {item.name || "(No name)"}
                </Text>
                {item.emails?.map((em, idx) => (
                  <TouchableOpacity
                    key={`${item.id}-${idx}`}
                    onPress={() => pickEmail(item, idx)}
                    style={styles.emailOption}
                  >
                    <Text>{em.email}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />

          <TouchableOpacity
            onPress={() => setPickerOpen(false)}
            style={styles.closeBtn}
          >
            <Text style={{ color: colors.white, fontWeight: "bold" }}>
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default CreateGiftCardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.backgroundMuted,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.primary,
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    color: colors.secondary,
    marginBottom: 6,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.neutral,
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    backgroundColor: colors.white,
    color: colors.text,
  },
  row: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  contactBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  sendBtn: {
    backgroundColor: colors.secondary,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
  },
  sendText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 10,
  },
  contactCard: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: colors.neutral,
  },
  contactName: {
    fontWeight: "bold",
    color: colors.text,
    fontSize: 16,
  },
  emailOption: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: colors.backgroundMuted,
    borderRadius: 8,
    marginTop: 6,
    alignSelf: "flex-start",
  },
  closeBtn: {
    backgroundColor: colors.danger,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
});
