import { useCampus } from "@/context/CampusContext";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const ink = "#18251F";
const green = "#176B4A";
const muted = "#77827C";

export default function CreateEventScreen() {
  const router = useRouter();
  const { addEvent } = useCampus();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [place, setPlace] = useState("");
  const [radius, setRadius] = useState("50");

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const getEventLocation = async () => {
    setLocationLoading(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Location permission required",
          "Please allow location access to set the event location.",
        );
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});

      setLatitude(currentLocation.coords.latitude);
      setLongitude(currentLocation.coords.longitude);

      Alert.alert(
        "Location saved",
        "The current location has been set as the event location.",
      );
    } catch {
      Alert.alert(
        "Location error",
        "Unable to get the current location. Please try again.",
      );
    } finally {
      setLocationLoading(false);
    }
  };

  const handleCreateEvent = () => {
    if (!title.trim()) {
      Alert.alert("Missing event name", "Please enter an event name.");
      return;
    }

    if (!date.trim()) {
      Alert.alert("Missing date", "Please enter the event date.");
      return;
    }

    if (!time.trim()) {
      Alert.alert("Missing time", "Please enter the event time.");
      return;
    }

    if (!place.trim()) {
      Alert.alert("Missing venue", "Please enter the event venue.");
      return;
    }

    if (latitude === null || longitude === null) {
      Alert.alert(
        "Event location required",
        "Please set the event location before creating the event.",
      );
      return;
    }

    const parsedRadius = Number(radius);

    if (!Number.isFinite(parsedRadius) || parsedRadius <= 0) {
      Alert.alert(
        "Invalid radius",
        "Please enter a valid radius greater than 0 meters.",
      );
      return;
    }

    addEvent({
      title: title.trim(),
      date: date.trim(),
      time: time.trim(),
      place: place.trim(),
      kind: "CAMPUS",
      color: "#E7E8FF",
      attending: 0,
      latitude,
      longitude,
      radius: parsedRadius,
    });

    Alert.alert("Event created", "The event has been successfully created.", [
      {
        text: "OK",
        onPress: () => router.replace("/organizer-home"),
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.eyebrow}>ORGANIZER TOOLS</Text>

        <Text style={styles.title}>Create event</Text>

        <Text style={styles.subtitle}>
          Add the event details and location for your campus event.
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>EVENT NAME</Text>

        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Tech Week 2026"
          placeholderTextColor="#9AA39E"
          style={styles.input}
        />

        <Text style={styles.label}>DATE</Text>

        <TextInput
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#9AA39E"
          style={styles.input}
        />

        <Text style={styles.helper}>Example: 2026-10-15</Text>

        <Text style={styles.label}>TIME</Text>

        <TextInput
          value={time}
          onChangeText={setTime}
          placeholder="e.g. 9:00 AM"
          placeholderTextColor="#9AA39E"
          style={styles.input}
        />

        <Text style={styles.label}>VENUE</Text>

        <TextInput
          value={place}
          onChangeText={setPlace}
          placeholder="e.g. University Auditorium"
          placeholderTextColor="#9AA39E"
          style={styles.input}
        />

        <Text style={styles.label}>EVENT LOCATION</Text>

        <TouchableOpacity
          style={styles.locationButton}
          onPress={getEventLocation}
          disabled={locationLoading}
        >
          <Text style={styles.locationButtonText}>
            {locationLoading
              ? "Getting location..."
              : latitude !== null
                ? "✓ Event location saved"
                : "Use my current location"}
          </Text>
        </TouchableOpacity>

        {latitude !== null && longitude !== null && (
          <View style={styles.locationBox}>
            <Text style={styles.locationTitle}>Location set</Text>

            <Text style={styles.locationText}>
              GPS location has been saved for this event.
            </Text>
          </View>
        )}

        <Text style={styles.label}>ALLOWED RADIUS</Text>

        <TextInput
          value={radius}
          onChangeText={setRadius}
          placeholder="50"
          placeholderTextColor="#9AA39E"
          keyboardType="numeric"
          style={styles.input}
        />

        <Text style={styles.helper}>
          Students must be within this distance from the event location.
          Example: 50 meters.
        </Text>

        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateEvent}
        >
          <Text style={styles.createButtonText}>Create Event</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8F5",
  },

  content: {
    padding: 20,
    paddingBottom: 50,
  },

  backButton: {
    marginBottom: 20,
  },

  backText: {
    color: green,
    fontSize: 15,
    fontWeight: "800",
  },

  header: {
    marginBottom: 26,
  },

  eyebrow: {
    color: green,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },

  title: {
    color: ink,
    fontSize: 32,
    fontWeight: "800",
    marginTop: 6,
  },

  subtitle: {
    color: muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
  },

  form: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
  },

  label: {
    color: green,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    marginTop: 14,
    marginBottom: 8,
  },

  input: {
    backgroundColor: "#F4F6F4",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: ink,
    fontSize: 15,
  },

  helper: {
    color: muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6,
  },

  locationButton: {
    backgroundColor: "#DDF3E8",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },

  locationButtonText: {
    color: green,
    fontSize: 14,
    fontWeight: "800",
  },

  locationBox: {
    backgroundColor: "#F4F6F4",
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
  },

  locationTitle: {
    color: ink,
    fontSize: 14,
    fontWeight: "800",
  },

  locationText: {
    color: muted,
    fontSize: 12,
    marginTop: 4,
  },

  createButton: {
    backgroundColor: green,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 28,
  },

  createButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});
