import React from "react";
import { Platform, View } from "react-native";
import { SelectList } from "react-native-dropdown-select-list";
import colors from "./Colors";

type EventDropdownProps = {
  data: { key: string; value: string }[];
  isLoading?: boolean;
  isError?: boolean;
  onSelect: (id: string) => void;
  placeholder?: string;
  selectedKey?: string | null;
};

const EventDropdown = ({
  data,
  isLoading,
  isError,
  onSelect,
  placeholder,
  selectedKey,
}: EventDropdownProps) => {
  const computedPlaceholder = isLoading
    ? "Loading events..."
    : isError
    ? "Failed to load events"
    : data.length
    ? placeholder || "Choose an event"
    : "No upcoming events";

  const defaultOption = selectedKey
    ? data.find((item) => item.key === selectedKey)
    : undefined;

  return (
    <View
      style={{
        position: "relative",
        zIndex: 999,
        elevation: 10,
        marginBottom: 40,
      }}
    >
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
        }}
        pointerEvents="box-none"
      >
        <SelectList
          key={`event-dd-${selectedKey ?? "none"}`}
          setSelected={onSelect}
          data={data}
          save="key"
          placeholder={computedPlaceholder}
          search
          maxHeight={260}
          defaultOption={defaultOption}
          boxStyles={{
            borderColor: colors.neutral,
            borderRadius: 16,
            backgroundColor: colors.white,
          }}
          dropdownStyles={{
            borderColor: colors.neutral,
            borderRadius: 16,
            backgroundColor: colors.white,
            ...Platform.select({
              android: { elevation: 12 },
              ios: { shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 8 },
            }),
          }}
          inputStyles={{ color: colors.black }}
          dropdownTextStyles={{ color: colors.black }}
        />
      </View>
    </View>
  );
};

export default EventDropdown;
