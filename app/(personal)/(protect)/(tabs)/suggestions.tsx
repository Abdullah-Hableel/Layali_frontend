import { getAllCategory } from "@/api/category";
import { getMyEvents, getSuggestions } from "@/api/event";
import colors from "@/components/Colors";
import CustomButton from "@/components/customButton";
import EventDropdown from "@/components/DropdownEvent";
import { Category } from "@/data/category";
import { EventLite } from "@/data/events";
import { SuggestionsResponse } from "@/data/gemini";
import { capitalizeWords } from "@/Utils/capitalize";
import { fmtKWD } from "@/Utils/currencyFormatter";
import { toGBDate } from "@/Utils/date";
import { findEvent, getUpcomingEvents, makeEventOptions } from "@/Utils/events";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const Suggestions = () => {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestionsResponse | null>(
    null
  );
  const [refreshing, setRefreshing] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const {
    data: events = [],
    isFetching: isFetchingEvents,
    isError: isErrorEvents,
    refetch: refetchEvents,
  } = useQuery<EventLite[]>({ queryKey: ["Myevents"], queryFn: getMyEvents });

  const {
    data: allCategories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
    refetch: refetchCategories,
  } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: getAllCategory,
  });

  const upcomingEvents: EventLite[] = getUpcomingEvents(events);
  const eventOptions = makeEventOptions(upcomingEvents);
  const selectedEvent = findEvent(upcomingEvents, selectedEventId);

  const selectedCategoryNames = selectedCategoryIds.map(
    (id) => allCategories.find((category) => category._id === id)!.name
  );

  const chipsDisabled = categoriesLoading || isFetchingEvents;

  const toggleCategory = (id: string) => {
    if (chipsDisabled) return;
    setSelectedCategoryIds((previousCategories) =>
      previousCategories.includes(id)
        ? previousCategories.filter(
            (existingCategoryId) => existingCategoryId !== id
          )
        : [...previousCategories, id]
    );
    setSuggestions(null);
  };

  const canSuggest = !!selectedEventId && selectedCategoryIds.length > 0;

  const suggestMutation = useMutation({
    mutationFn: async () => {
      const body: any = { requiredCategories: selectedCategoryIds };

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setSuggestions(null);
      return getSuggestions(selectedEventId!, body, {
        signal: abortRef.current.signal,
      });
    },
    onSuccess: (data) => {
      setSuggestions(data);
      Toast.show({
        type: "success",
        text1: "Suggestions Ready",
        text2: "Your event suggestions have been created.",
      });
    },
    onError: (err: any) => {
      const msg = err?.message || "Failed to fetch suggestions";
      Toast.show({
        type: "error",
        text1: "Suggestions Error",
        text2: msg,
      });
    },
  });

  const totalPriceOfSuggestions =
    suggestions?.totalPrice != null
      ? Number(suggestions.totalPrice)
      : (suggestions?.items || []).reduce(
          (accumulatedPrice, currentItem) =>
            accumulatedPrice + Number(currentItem.price || 0),
          0
        );

  const budget = Number(selectedEvent?.budget ?? 0) || null;
  const remaining =
    budget != null
      ? Math.max(budget - (totalPriceOfSuggestions || 0), 0)
      : null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} tintColor={colors.secondary} />
      }
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Get Event Suggestions</Text>
      <Text style={styles.subtitle}>
        Choose your event and let Layali find the perfect fit for your budget.
      </Text>

      <View style={{ marginTop: 12 }}>
        <Text style={styles.label}>Event</Text>
        <EventDropdown
          data={eventOptions}
          isLoading={isFetchingEvents}
          isError={isErrorEvents}
          onSelect={(eventId) => {
            setSelectedEventId(eventId);
            setSuggestions(null);
          }}
          selectedKey={selectedEventId}
          placeholder="Choose an event"
        />
        {!upcomingEvents.length && !isFetchingEvents && (
          <Text style={{ marginTop: 8, color: colors.text }}>
            You don’t have any upcoming events. Create one to get suggestions.
          </Text>
        )}
      </View>

      <View style={{ marginTop: 16 }}>
        <Text style={styles.label}>Categories</Text>
        {categoriesLoading ? (
          <ActivityIndicator color={colors.secondary} />
        ) : categoriesError ? (
          <Text
            /* inline error color kept simple */ style={{
              color: colors.danger,
              fontSize: 12,
              marginVertical: 10,
            }}
          >
            Failed to load categories
          </Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {allCategories.map((category) => {
              const isSelected = selectedCategoryIds.includes(category._id);
              return (
                <TouchableOpacity
                  key={category._id}
                  disabled={chipsDisabled || suggestMutation.isPending}
                  style={[
                    styles.chip,
                    isSelected && styles.chipSelected,
                    (chipsDisabled || suggestMutation.isPending) && {
                      opacity: 0.5,
                    },
                  ]}
                  onPress={() => toggleCategory(category._id)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={{
                      color: isSelected ? colors.white : colors.secondary,
                      fontWeight: "bold",
                    }}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      <View style={styles.preview}>
        <Text style={styles.previewHeading}>Your selection</Text>

        <View style={styles.previewRow}>
          <Text style={styles.previewLabel}>Event</Text>
          {selectedEventId ? (
            <TouchableOpacity
              onPress={() => {
                setSelectedEventId(null);
                setSuggestions(null);
              }}
            >
              <Text style={styles.clearLink}>Change</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <Text style={styles.previewValue}>
          {selectedEvent
            ? ` ${selectedEvent.location || "_"} ·  ${toGBDate(
                selectedEvent.date
              )} ·  ${
                selectedEvent.budget != null
                  ? fmtKWD(selectedEvent.budget)
                  : "—"
              }`
            : "Select an event to preview details here"}
        </Text>

        <View style={[styles.previewRow, { marginTop: 10 }]}>
          <Text style={styles.previewLabel}>
            Categories ({selectedCategoryIds.length})
          </Text>
          {selectedCategoryIds.length > 0 ? (
            <TouchableOpacity onPress={() => setSelectedCategoryIds([])}>
              <Text style={styles.clearLink}>Clear all</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.selectedWrap}>
          {selectedCategoryNames.length === 0 ? (
            <Text style={{ color: colors.text }}>—</Text>
          ) : (
            selectedCategoryNames.map((categoryName) => (
              <View key={categoryName} style={styles.selectedPill}>
                <Text style={styles.selectedPillText}>{categoryName}</Text>
              </View>
            ))
          )}
        </View>
      </View>

      <View style={{ marginTop: 20, alignItems: "center" }}>
        <CustomButton
          text={
            suggestMutation.isPending
              ? "Picking the best…"
              : "Get Suggestions 🪄"
          }
          onPress={() => suggestMutation.mutate()}
          variant="primary"
          disabled={!canSuggest || suggestMutation.isPending}
        />
      </View>

      {!!suggestions && (
        <View style={{ marginTop: 20 }}>
          <Text style={styles.resultsHeading}>
            Suggestions ({capitalizeWords(suggestions.strategy)})
          </Text>

          {Array.isArray((suggestions as any).items) &&
          (suggestions as any).items.length > 0 ? (
            <View>
              {(suggestions as any).items.map(
                (
                  suggestionItem: {
                    _id: string;
                    name?: string;
                    price?: number;
                    reason?: string;
                  },
                  index: number
                ) => (
                  <View key={index} style={styles.resultItem}>
                    <View style={styles.resultRow}>
                      <Text style={styles.resultName}>
                        {suggestionItem.name || `Service ${index + 1}`}
                      </Text>
                      <Text style={styles.resultPrice}>
                        {suggestionItem.price != null
                          ? fmtKWD(suggestionItem.price)
                          : "—"}
                      </Text>
                    </View>
                    {!!suggestionItem.reason && (
                      <Text style={styles.resultReason}>
                        {suggestionItem.reason}
                      </Text>
                    )}
                  </View>
                )
              )}
            </View>
          ) : (
            <Text style={{ color: colors.text }}>No items</Text>
          )}

          <View style={styles.totalsBox}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Total</Text>
              <Text style={styles.totalsValue}>
                {totalPriceOfSuggestions
                  ? fmtKWD(totalPriceOfSuggestions)
                  : "—"}
              </Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Budget</Text>
              <Text style={styles.totalsValue}>
                {budget != null ? fmtKWD(budget) : "—"}
              </Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Remaining</Text>
              <Text style={styles.totalsValue}>
                {budget != null ? fmtKWD(remaining || 0) : "—"}
              </Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default Suggestions;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundMuted,
    paddingHorizontal: 20,
    paddingTop: 12,
    flex: 1,
  },
  title: {
    color: colors.secondary,
    fontWeight: "800",
    fontSize: 18,
  },
  subtitle: {
    color: colors.text,
    marginTop: 4,
    opacity: 0.8,
  },
  label: {
    color: colors.secondary,
    fontWeight: "bold",
    marginBottom: 6,
  },

  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 100,
    backgroundColor: colors.accent,
    marginRight: 10,
    marginBottom: 9,
  },
  chipSelected: {
    backgroundColor: colors.primary,
  },

  preview: {
    marginTop: 20,
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.neutral,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 8,
  },
  previewHeading: {
    color: colors.secondary,
    fontWeight: "700",
    marginBottom: 6,
  },
  previewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  previewLabel: {
    color: colors.text,
    opacity: 0.8,
    fontWeight: "600",
  },
  previewValue: {
    color: colors.text,
    marginTop: 4,
  },
  clearLink: {
    color: colors.secondary,
    textDecorationLine: "underline",
  },
  selectedWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
  },
  selectedPill: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedPillText: { color: colors.secondary, fontWeight: "bold" },

  resultsHeading: {
    color: colors.secondary,
    fontWeight: "700",
    marginBottom: 8,
  },
  resultItem: {
    paddingVertical: 8,
    borderBottomColor: colors.neutral,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  resultName: { color: colors.text, fontWeight: "600" },
  resultPrice: { color: colors.text },
  resultReason: { color: colors.text, opacity: 0.7, marginTop: 2 },
  totalsBox: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.neutral,
    paddingTop: 8,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  totalsLabel: { color: colors.secondary, fontWeight: "bold" },
  totalsValue: { color: colors.text, fontWeight: "bold" },
});
