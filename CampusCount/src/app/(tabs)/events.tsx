import { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import EventCard from "@/components/EventCard";
import { type EventItem } from "@/data/events";
import { useCampus } from "@/context/CampusContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ink = "#18251F";
const green = "#176B4A";
const muted = "#77827C";

function Label({ children }: { children: React.ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}
function parseEventDate(value: string): Date | null {
  const match = value
    .trim()
    .match(/^([A-Za-z]{3,9})\s+(\d{1,2})(?:,?\s+(\d{4}))?$/);

  if (!match) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const months: Record<string, number> = {
    JAN: 0,
    FEB: 1,
    MAR: 2,
    APR: 3,
    MAY: 4,
    JUN: 5,
    JUL: 6,
    AUG: 7,
    SEP: 8,
    OCT: 9,
    NOV: 10,
    DEC: 11,
  };

  const month = months[match[1].slice(0, 3).toUpperCase()];
  const day = Number(match[2]);
  const year = Number(match[3] ?? new Date().getFullYear());

  if (month === undefined || day < 1 || day > 31) {
    return null;
  }

  const date = new Date(year, month, day);

  if (date.getMonth() !== month || date.getDate() !== day) {
    return null;
  }

  return date;
}

export default function EventsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const {
    events,
    joinedEvents,
    registerForEvent,
    deleteEvent,
    eventFilter,
    setEventFilter,
    role,
  } = useCampus();

  const [query, setQuery] = useState("");

  const filteredEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Monday is the first day of the current calendar week.
    const startOfWeek = new Date(today);
    const daysSinceMonday = (today.getDay() + 6) % 7;
    startOfWeek.setDate(today.getDate() - daysSinceMonday);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    return events
      .filter((event) =>
        event.title.toLowerCase().includes(query.trim().toLowerCase()),
      )
      .filter((event) => {
        if (eventFilter === "all") {
          return true;
        }

        if (eventFilter === "mine") {
          return joinedEvents.includes(event.title);
        }

        const eventDate = parseEventDate(event.date);

        if (!eventDate) {
          return false;
        }

        eventDate.setHours(0, 0, 0, 0);

        return eventDate >= startOfWeek && eventDate < endOfWeek;
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
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 12 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Label>ORGANIZER SPACE</Label>
          <Text style={styles.title}>Events</Text>
          <Text style={styles.subtitle}>Manage your campus events.</Text>
        </View>

        <View style={styles.organizerSummary}>
          <Text style={styles.summaryLabel}>YOUR EVENTS</Text>
          <Text style={styles.summaryNumber}>{events.length}</Text>
          <Text style={styles.summaryCaption}>events on the calendar</Text>
        </View>

        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push("/create-event")}
        >
          <Text style={styles.createButtonText}>+ Create a new event</Text>
        </TouchableOpacity>

        <View style={styles.sectionRow}>
          <Label>EVENT CALENDAR</Label>
          <Text style={styles.countPill}>
            {events.length} {events.length === 1 ? "event" : "events"}
          </Text>
        </View>

        {events.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No events yet</Text>
            <Text style={styles.emptyText}>
              Create your first campus event to get started.
            </Text>
          </View>
        ) : (
          events.map((event, i) => (
            <View key={`${event.id}-${i}`} style={styles.organizerEvent}>
              <EventCard
                item={event}
                button="Manage"
                onPress={() =>
                  router.push({
                    pathname: "/create-event",
                    params: { editId: event.id },
                  })
                }
                onDelete={() =>
                  Alert.alert(
                    "Delete event?",
                    `Delete "${event.title}"? This will also remove its student registrations.`,
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: () => {
                          void deleteEvent(event);
                        },
                      },
                    ],
                  )
                }
              />
            </View>
          ))
        )}
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}
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
        placeholder="Search events"
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
          <Text style={styles.emptyIcon}>◇</Text>
          <Text style={styles.emptyTitle}>No events found</Text>
          <Text style={styles.emptyText}>
            Try another filter or search for a different event.
          </Text>
        </View>
      ) : (
        filteredEvents.map((event, i) => (
          <EventCard
            key={`${event.id}-${i}`}
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
  organizerEvent: {
    marginBottom: 12,
  },
  deleteButton: {
    alignSelf: "flex-end",
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 6,
    borderRadius: 8,
    backgroundColor: "#FEE2E2",
  },
  deleteButtonText: {
    color: "#B91C1C",
    fontWeight: "600",
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
  organizerSummary: {
    backgroundColor: green,
    borderRadius: 18,
    padding: 22,
    marginBottom: 24,
  },
  summaryLabel: {
    color: "#9ED8B8",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  summaryNumber: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "800",
    marginTop: 8,
  },
  summaryCaption: {
    color: "#C8D2CC",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
  },
  createButton: {
    backgroundColor: green,
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 18,
    marginBottom: 28,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
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
