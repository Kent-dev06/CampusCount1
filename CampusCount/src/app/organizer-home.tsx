import EventCard from "@/components/EventCard";
import { useCampus } from "@/context/CampusContext";
import { useRouter } from "expo-router";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ink = "#18251F";
const green = "#176B4A";
const muted = "#77827C";

function Label({ children }: { children: React.ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

export default function OrganizerHomeScreen() {
  const router = useRouter();
  const { events, name } = useCampus();

  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topline}>
        <View>
          <Text style={styles.eyebrow}>ORGANIZER SPACE</Text>

          <Text style={styles.greeting}>Manage events</Text>

          <Text style={styles.subtitle}>
            Bring your campus community together.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.avatar}
          onPress={() => router.replace("/profile")}
        >
          <Text style={styles.avatarText}>{initials}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.organizerBanner}>
        <View>
          <Text style={styles.orgEyebrow}>YOUR EVENTS</Text>

          <Text style={styles.orgCount}>
            {events.length.toString().padStart(2, "0")}
          </Text>

          <Text style={styles.orgCaption}>events on the calendar</Text>
        </View>

        <Text style={styles.orgDecoration}>✳</Text>
      </View>

      <TouchableOpacity
        style={styles.action}
        onPress={() => router.push("/create-event" as any)}
      >
        <Text style={styles.actionText}>＋ Create a new event</Text>
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
          onPress={() =>
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
            )
          }
          button="Manage"
        />
      ))}

      <TouchableOpacity
        style={styles.reportShortcut}
        onPress={() => router.push("/reports")}
      >
        <Text style={styles.reportShortcutIcon}>◤</Text>

        <View style={{ flex: 1 }}>
          <Text style={styles.settingName}>Attendance reports</Text>

          <Text style={styles.historyVenue}>Turnout analytics and exports</Text>
        </View>

        <Text style={styles.link}>Open →</Text>
      </TouchableOpacity>
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
    paddingBottom: 110,
  },

  topline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  eyebrow: {
    color: green,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },

  greeting: {
    color: ink,
    fontSize: 30,
    fontWeight: "800",
    marginTop: 6,
  },

  subtitle: {
    color: muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 5,
    maxWidth: 260,
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#DDF3E8",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: green,
    fontSize: 14,
    fontWeight: "800",
  },

  organizerBanner: {
    backgroundColor: green,
    borderRadius: 20,
    padding: 22,
    marginBottom: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  orgEyebrow: {
    color: "#9ED8B8",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },

  orgCount: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "800",
    marginTop: 5,
  },

  orgCaption: {
    color: "#C8D2CC",
    fontSize: 13,
    marginTop: 2,
  },

  orgDecoration: {
    color: "#9ED8B8",
    fontSize: 48,
  },

  action: {
    backgroundColor: green,
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 18,
    marginBottom: 28,
  },

  actionText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  label: {
    color: green,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.1,
  },

  countPill: {
    color: green,
    backgroundColor: "#DDF3E8",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 11,
    fontWeight: "800",
  },

  reportShortcut: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginTop: 18,
  },

  reportShortcutIcon: {
    color: green,
    fontSize: 20,
    marginRight: 12,
  },

  settingName: {
    color: ink,
    fontSize: 14,
    fontWeight: "800",
  },

  historyVenue: {
    color: muted,
    fontSize: 12,
    marginTop: 3,
  },

  link: {
    color: green,
    fontSize: 13,
    fontWeight: "800",
  },
});
