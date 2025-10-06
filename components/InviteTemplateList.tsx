import { baseURL } from "@/api";
import { capitalizeWords } from "@/Utils/capitalize";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAllInviteTemplates } from "../api/inviteTemplate";
import colors from "./Colors";
import CustomButton from "./customButton";

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
    <SafeAreaView
      edges={["left", "right", "bottom"]}
      style={{ flex: 1, backgroundColor: colors.backgroundMuted }}
    >
      <FlatList
        data={data}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => {
          const isSelected = selectedTemplate?._id === item._id;
          return (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSelectedTemplate(item)}
              style={[styles.card, isSelected && styles.cardSelected]}
            >
              <Image
                source={{ uri: `${baseURL}${item.background}` }}
                style={styles.image}
              />
              <View style={styles.info}>
                <Text style={styles.title}>
                  {item.title || "Elegant Classic"}
                </Text>
                <Text style={styles.subtitle}>
                  {item.subtitle ||
                    "Traditional design with gradient and typography"}
                </Text>

                <View style={styles.tags}>
                  {(item.tags || []).map((tag: string, index: number) => (
                    <Text key={index} style={styles.tag}>
                      {capitalizeWords(tag)}
                    </Text>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: 55,
          left: 0,
          right: 0,
          alignItems: "center",
          zIndex: 10,
        }}
      >
        <CustomButton
          text="Continue"
          disabled={!selectedTemplate}
          onPress={() => {
            if (!selectedTemplate) return;
            router.push({
              pathname: "/customizeinvitation",
              params: {
                templateId: selectedTemplate._id,
                background: selectedTemplate.background,
                title: selectedTemplate.title,
                subtitle: selectedTemplate.subtitle,
                eventId: eventId || null,
              },
            });
          }}
          variant="primary"
        />
      </View>
    </SafeAreaView>
  );
};

export default InviteTemplateListScreen;

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
    width: "100%",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: colors.secondary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
  },
  tags: {
    flexDirection: "row",
    gap: 8,
  },
  tag: {
    fontSize: 12,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 0.5,
    color: colors.placeholder,
    backgroundColor: colors.backgroundLight,
  },
});
