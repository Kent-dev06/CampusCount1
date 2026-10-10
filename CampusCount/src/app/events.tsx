import EventCard from "@/components/EventCard";
import { useCampus } from "@/context/CampusContext";
import { type EventItem } from "@/data/events";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
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

function Label({ children }: { children: React.ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

export default function EventsScreen() {
  const router = useRouter();
  const {
    events,
    joinedEvents,
    registerForEvent,
    eventFilter,
    setEventFilter,
    role,
  } = useCampus();

  const [query, setQuery] = useState("");

  const filteredEvents = useMemo(() => {
    return events
      .filter((event) =>
        event.title.toLowerCase().includes(query.toLowerCase()),
      )
      .filter((event) => {
        if (eventFilter === "all") {
          return true;
        }

        if (eventFilter === "mine") {
          return joinedEvents.includes(event.title);
        }

        const currentYear = new Date().getFullYear();
        const eventDate = new Date(`${event.date} ${currentYear}`);

        const today = new Date();

        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);

        return eventDate >= today && eventDate <= nextWeek;
      });
  }, [events, query, eventFilter, joinedEvents]);

  const handleRegister = (event: EventItem) => {
    if (joinedEvents.includes(event.title)) {
      Alert.alert(
        "Already registered",
        `You are already registered for ${event.title}.`,
      );
      return;
    }

    registerForEvent(event);
  };

  if (role === "Organizer") {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Label>ORGANIZER SPACE</Label>

          <Text style={styles.title}>Events</Text>

          <Text style={styles.subtitle}>Manage your campus events.</Text>
        </View>

        <View
          style={{
            backgroundColor: "#F4F6F4",
            borderRadius: 16,
            padding: 18,
            marginBottom: 24,
          }}
        >
          <Text style={styles.label}>YOUR EVENTS</Text>

          <Text
            style={{
              color: ink,
              fontSize: 32,
              fontWeight: "800",
              marginTop: 6,
            }}
          >
            {events.length}
          </Text>

          <Text style={styles.subtitle}>events on the calendar</Text>
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: green,
            borderRadius: 14,
            paddingVertical: 15,
            paddingHorizontal: 18,
            marginBottom: 28,
          }}
          onPress={() => router.push("/create-event" as any)}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 15,
              fontWeight: "800",
            }}
          >
            + Create a new event
          </Text>
        </TouchableOpacity>

        <View style={styles.sectionRow}>
          <Label>EVENT CALENDAR</Label>

          <Text style={styles.countPill}>
            {events.length} {events.length === 1 ? "event" : "events"}
          </Text>
        </View>

        {events.map((event, i) => (
          <EventCard
            key={`${event.title}-${i}`}
            item={event}
            button="Manage"
            onPress={() => {
              Alert.alert(
                event.title,
                `${event.attending} attendees · ${event.place}`,
                [
                  { text: "Close" },
                  {
                    text: "View report",
                    onPress: () => router.push("/reports"),
                  },
                ],
              );
            }}
          />
        ))}
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Label>CAMPUS LIFE</Label>

        <Text style={styles.title}>Events</Text>

        <Text style={styles.subtitle}>
          Find your people.{"\n"}Make your mark.
        </Text>
      </View>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="⌕   Search events"
        placeholderTextColor="#87918B"
        style={styles.search}
      />

      <View style={styles.filterRow}>
        <TouchableOpacity onPress={() => setEventFilter("all")}>
          <Text
            style={eventFilter === "all" ? styles.filterActive : styles.filter}
          >
            All events
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setEventFilter("week")}>
          <Text
            style={eventFilter === "week" ? styles.filterActive : styles.filter}
          >
            This week
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setEventFilter("mine")}>
          <Text
            style={eventFilter === "mine" ? styles.filterActive : styles.filter}
          >
            My events
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionRow}>
        <Label>UPCOMING</Label>

        <Text style={styles.countPill}>
          {filteredEvents.length}{" "}
          {filteredEvents.length === 1 ? "event" : "events"}
        </Text>
      </View>

      {filteredEvents.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>‹</Text>

          <Text style={styles.emptyTitle}>No events found</Text>

          <Text style={styles.emptyText}>
            Try another filter or search for a different event.
          </Text>
        </View>
      ) : (
        filteredEvents.map((event, i) => (
          <EventCard
            key={`${event.title}-${i}`}
            item={event}
            onPress={() => handleRegister(event)}
            button={joinedEvents.includes(event.title) ? "Joined" : "Register"}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  label: {
    color: green,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  title: {
    color: ink,
    fontSize: 32,
    fontWeight: "800",
    marginTop: 6,
  },
  subtitle: {
    color: muted,
    fontSize: 16,
    lineHeight: 23,
    marginTop: 6,
  },
  search: {
    backgroundColor: "#F4F6F4",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: ink,
    fontSize: 15,
    marginBottom: 18,
  },
  filterRow: {
    flexDirection: "row",
    gap: 22,
    marginBottom: 24,
  },
  filter: {
    color: muted,
    fontSize: 14,
    fontWeight: "600",
  },
  filterActive: {
    color: green,
    fontSize: 14,
    fontWeight: "800",
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  countPill: {
    color: green,
    backgroundColor: "#DDF3E8",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    color: muted,
    fontSize: 36,
    marginBottom: 10,
  },
  emptyTitle: {
    color: ink,
    fontSize: 18,
    fontWeight: "800",
  },
  emptyText: {
    color: muted,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 20,
  },
});
