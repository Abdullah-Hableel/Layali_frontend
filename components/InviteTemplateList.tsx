import { baseURL } from "@/api";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getAllInviteTemplates } from "../api/inviteTemplate";
import colors from "./Colors";

const InviteTemplateListScreen = () => {
  const router = useRouter();
  const { eventId } = useLocalSearchParams<{ eventId?: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["inviteTemplates"],
    queryFn: getAllInviteTemplates,
  });

  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);

  if (isLoading) return <Text>Loading templates...</Text>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundMuted }}>
      <FlatList
        data={data}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => {
          const isSelected = selectedTemplate?._id === item._id;
          return (
            <TouchableOpacity
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => setSelectedTemplate(item)}
            >
              <Image
                source={{ uri: `${baseURL}${item.background}` }}
                style={styles.image}
              />
              <View style={styles.info}>
                <Text style={styles.title}>Elegant Classic</Text>
                <Text style={styles.subtitle}>
                  Traditional design with gradient and typography
                </Text>

                <View style={styles.tags}>
                  <Text style={[styles.tag, { backgroundColor: "#FDECEC" }]}>
                    Premium
                  </Text>
                  <Text style={[styles.tag, { backgroundColor: "#E6F7EC" }]}>
                    Popular
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        <TouchableOpacity
          style={[
            styles.button,
            !selectedTemplate && { backgroundColor: "#f5b5b5" },
          ]}
          disabled={!selectedTemplate}
          onPress={
            () => {
              if (!selectedTemplate) return;
              router.push({
                pathname: "/",
                params: {
                  templateId: selectedTemplate._id,
                  background: selectedTemplate.background,
                  title: selectedTemplate.title,
                  subtitle: selectedTemplate.subtitle,
                  eventId: eventId,
                },
              });
            } //need to add bish work  " ,eventId: event._id ... eventId: eventId || null,"
          }
        >
          <Text style={styles.buttonText}>Select Template to Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardSelected: {
    borderColor: "#e67a7a",
    borderWidth: 2,
  },
  image: {
    width: "100%",
    height: 140,
  },
  info: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  tags: {
    flexDirection: "row",
    gap: 8,
  },
  tag: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#f28b82",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default InviteTemplateListScreen;
