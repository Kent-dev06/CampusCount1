import { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Location from "expo-location";
import { useCampus } from "@/context/CampusContext";

const green = "#176B4A";
const wheelItemHeight = 42;

function formatDate(date: Date) {
  return date
    .toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
    })
    .toUpperCase();
}

function parseEventDate(value: string) {
  const parsed = new Date(`${value} ${new Date().getFullYear()}`);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function parseEventTime(value: string) {
  const match = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);

  if (!match) {
    return { hour: "10", minute: "00", period: "AM" };
  }

  return {
    hour: String(Number(match[1])),
    minute: match[2],
    period: match[3].toUpperCase(),
  };
}

function WheelColumn({
  label,
  values,
  selected,
  onChange,
}: {
  label: string;
  values: string[];
  selected: string;
  onChange: (value: string) => void;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const selectedIndex = Math.max(0, values.indexOf(selected));

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: selectedIndex * wheelItemHeight,
        animated: false,
      });
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.wheelColumn}>
      <Text style={styles.wheelLabel}>{label}</Text>

      <View style={styles.wheelWindow}>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={wheelItemHeight}
          decelerationRate="fast"
          contentContainerStyle={styles.wheelContent}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(
              event.nativeEvent.contentOffset.y / wheelItemHeight,
            );
            const value =
              values[Math.max(0, Math.min(index, values.length - 1))];
            if (value !== selected) onChange(value);
          }}
          onScrollEndDrag={(event) => {
            const index = Math.round(
              event.nativeEvent.contentOffset.y / wheelItemHeight,
            );
            const value =
              values[Math.max(0, Math.min(index, values.length - 1))];
            if (value !== selected) onChange(value);
          }}
        >
          {values.map((value) => (
            <TouchableOpacity
              key={value}
              style={[
                styles.wheelItem,
                value === selected && styles.wheelItemSelected,
              ]}
              onPress={() => {
                onChange(value);
                scrollRef.current?.scrollTo({
                  y: values.indexOf(value) * wheelItemHeight,
                  animated: true,
                });
              }}
            >
              <Text
                style={[
                  styles.wheelText,
                  value === selected && styles.wheelTextSelected,
                ]}
              >
                {value}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

export default function CreateEventScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ editId?: string | string[] }>();
  const editId = Array.isArray(params.editId)
    ? params.editId[0]
    : params.editId;

  const { addEvent, updateEvent, events } = useCampus();
  const existingEvent = events.find((event) => event.id === editId);
  const editing = Boolean(existingEvent);

  const [title, setTitle] = useState(() => existingEvent?.title ?? "");
  const [dateValue, setDateValue] = useState(() =>
    existingEvent ? parseEventDate(existingEvent.date) : new Date(),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  const initialTime = parseEventTime(existingEvent?.time ?? "10:00 AM");
  const [hour, setHour] = useState(initialTime.hour);
  const [minute, setMinute] = useState(initialTime.minute);
  const [period, setPeriod] = useState(initialTime.period);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [place, setPlace] = useState(() => existingEvent?.place ?? "");
  const [kind, setKind] = useState(() => existingEvent?.kind ?? "CAMPUS");
  const [radius, setRadius] = useState(() =>
    String(existingEvent?.radius ?? 100),
  );
  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(() =>
    existingEvent
      ? {
          latitude: existingEvent.latitude,
          longitude: existingEvent.longitude,
        }
      : null,
  );
  const [gettingLocation, setGettingLocation] = useState(false);

  const getLocation = async () => {
    try {
      setGettingLocation(true);

      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== "granted") {
        Alert.alert(
          "Location permission required",
          "Allow location access to set the event's GPS check-in location.",
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setCoordinates({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      Alert.alert("Location captured", "The current GPS location is saved.");
    } catch {
      Alert.alert(
        "Location unavailable",
        "Unable to get your GPS location. Please try again or check your device settings.",
      );
    } finally {
      setGettingLocation(false);
    }
  };

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (event.type === "set" && selectedDate) {
      setDateValue(selectedDate);
    }
  };

  const handleSaveEvent = () => {
    const attendanceRadius = Number(radius);
    const formattedTime = `${hour}:${minute} ${period}`;

    if (!title.trim() || !place.trim()) {
      Alert.alert(
        "Missing information",
        "Please enter the event title and venue.",
      );
      return;
    }

    if (!coordinates) {
      Alert.alert(
        "GPS location required",
        "Capture the event venue's GPS location before saving.",
      );
      return;
    }

    if (
      !Number.isFinite(attendanceRadius) ||
      attendanceRadius < 10 ||
      attendanceRadius > 1000
    ) {
      Alert.alert(
        "Invalid radius",
        "Enter an attendance radius between 10 and 1000 meters.",
      );
      return;
    }

    const eventData = {
      title: title.trim(),
      date: formatDate(dateValue),
      time: formattedTime,
      place: place.trim(),
      kind: kind.trim().toUpperCase() || "CAMPUS",
      color: existingEvent?.color ?? "#DDF3E8",
      attending: existingEvent?.attending ?? 0,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      radius: attendanceRadius,
    };

    if (editing && existingEvent) {
      updateEvent(existingEvent.id, eventData);
    } else {
      addEvent(eventData);
    }

    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.eyebrow}>ORGANIZER SPACE</Text>
        <Text style={styles.heading}>
          {editing ? "Edit event" : "Create an event"}
        </Text>
        <Text style={styles.subtitle}>
          {editing
            ? "Update the event details and check-in location."
            : "Add event details and set the GPS location for attendance check-in."}
        </Text>

        <Text style={styles.label}>EVENT TITLE</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Campus Clean-up Drive"
          placeholderTextColor="#89948E"
          maxLength={100}
        />

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>DATE</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.pickerValue}>{formatDate(dateValue)}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.half}>
            <Text style={styles.label}>TIME</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.pickerValue}>
                {hour}:{minute} {period}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {showDatePicker && (
          <View style={styles.datePickerContainer}>
            <DateTimePicker
              value={dateValue}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleDateChange}
            />

            {Platform.OS === "ios" && (
              <TouchableOpacity
                style={styles.smallButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.smallButtonText}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <Text style={styles.label}>VENUE</Text>
        <TextInput
          style={styles.input}
          value={place}
          onChangeText={setPlace}
          placeholder="e.g. Main Quadrangle"
          placeholderTextColor="#89948E"
          maxLength={120}
        />

        <Text style={styles.label}>EVENT CATEGORY</Text>
        <TextInput
          style={styles.input}
          value={kind}
          onChangeText={setKind}
          placeholder="CAMPUS, ACADEMIC, COMMUNITY..."
          placeholderTextColor="#89948E"
          maxLength={30}
          autoCapitalize="characters"
        />

        <Text style={styles.label}>ATTENDANCE GPS LOCATION</Text>
        <View style={styles.locationCard}>
          <Text style={styles.locationText}>
            {coordinates
              ? `Latitude: ${coordinates.latitude.toFixed(6)}\nLongitude: ${coordinates.longitude.toFixed(6)}`
              : "No GPS location captured yet."}
          </Text>

          <TouchableOpacity
            style={styles.locationButton}
            onPress={getLocation}
            disabled={gettingLocation}
          >
            <Text style={styles.locationButtonText}>
              {gettingLocation
                ? "Getting location..."
                : coordinates
                  ? "Refresh GPS Location"
                  : "Capture Current GPS Location"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.hint}>
            Capture this while at the actual event venue.
          </Text>
        </View>

        <Text style={styles.label}>CHECK-IN RADIUS (METERS)</Text>
        <TextInput
          style={styles.input}
          value={radius}
          onChangeText={setRadius}
          keyboardType="numeric"
          placeholder="100"
          placeholderTextColor="#89948E"
        />
        <Text style={styles.hint}>
          Students must be within this distance to pass the GPS check.
        </Text>

        <TouchableOpacity style={styles.createButton} onPress={handleSaveEvent}>
          <Text style={styles.createButtonText}>
            {editing ? "Save Changes" : "Create Event"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showTimePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.timeModal}>
            <Text style={styles.timeModalTitle}>Select event time</Text>

            <View style={styles.wheelsRow}>
              <WheelColumn
                label="HOUR"
                values={Array.from({ length: 12 }, (_, i) => String(i + 1))}
                selected={hour}
                onChange={setHour}
              />
              <WheelColumn
                label="MINUTE"
                values={Array.from({ length: 60 }, (_, i) =>
                  String(i).padStart(2, "0"),
                )}
                selected={minute}
                onChange={setMinute}
              />
              <WheelColumn
                label="PERIOD"
                values={["AM", "PM"]}
                selected={period}
                onChange={setPeriod}
              />
            </View>

            <Text style={styles.timePreview}>
              Selected: {hour}:{minute} {period}
            </Text>

            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setShowTimePicker(false)}
            >
              <Text style={styles.createButtonText}>Confirm Time</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowTimePicker(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F6F8F6",
  },
  content: {
    padding: 22,
    paddingTop: 55,
    paddingBottom: 40,
  },
  back: {
    color: green,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 26,
  },
  eyebrow: {
    color: green,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  heading: {
    color: "#18251F",
    fontSize: 29,
    fontWeight: "800",
    marginTop: 8,
  },
  subtitle: {
    color: "#77827C",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 26,
  },
  label: {
    color: "#526159",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 17,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DCE4DE",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: "#18251F",
    justifyContent: "center",
  },
  pickerValue: {
    color: "#18251F",
    fontSize: 15,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  half: {
    flex: 1,
  },
  datePickerContainer: {
    marginTop: 12,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE4DE",
  },
  smallButton: {
    backgroundColor: "#E4F2E9",
    padding: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  smallButtonText: {
    color: green,
    fontWeight: "800",
  },
  locationCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DCE4DE",
    borderWidth: 1,
    borderRadius: 14,
    padding: 15,
  },
  locationText: {
    color: "#18251F",
    fontSize: 14,
    lineHeight: 23,
  },
  locationButton: {
    backgroundColor: "#E4F2E9",
    borderRadius: 10,
    padding: 13,
    alignItems: "center",
    marginTop: 14,
  },
  locationButtonText: {
    color: green,
    fontWeight: "800",
    textAlign: "center",
  },
  hint: {
    color: "#77827C",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  createButton: {
    backgroundColor: green,
    borderRadius: 13,
    alignItems: "center",
    paddingVertical: 16,
    marginTop: 28,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: "#176B4A",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 20,
  },
  timeModal: {
    backgroundColor: "#F6F8F6",
    borderRadius: 20,
    padding: 20,
  },
  timeModalTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#18251F",
    textAlign: "center",
    marginBottom: 18,
  },
  wheelsRow: {
    flexDirection: "row",
    gap: 8,
  },
  wheelColumn: {
    flex: 1,
    minWidth: 0,
  },
  wheelLabel: {
    textAlign: "center",
    color: "#77827C",
    fontSize: 10,
    fontWeight: "800",
    marginBottom: 8,
  },
  wheelWindow: {
    height: wheelItemHeight * 5,
    overflow: "hidden",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE4DE",
  },
  wheelContent: {
    paddingVertical: wheelItemHeight * 2,
  },
  wheelItem: {
    height: wheelItemHeight,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  wheelItemSelected: {
    backgroundColor: "#E4F2E9",
    borderRadius: 8,
  },
  wheelText: {
    color: "#77827C",
    fontSize: 17,
  },
  wheelTextSelected: {
    color: green,
    fontWeight: "800",
  },
  timePreview: {
    color: "#18251F",
    fontWeight: "700",
    textAlign: "center",
    marginTop: 16,
  },
  cancelButton: {
    alignItems: "center",
    padding: 12,
    marginTop: 4,
  },
  cancelButtonText: {
    color: "#526159",
    fontWeight: "700",
  },
});
