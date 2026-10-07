import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import EventCard from "@/components/EventCard";
import { useCampus } from "@/context/CampusContext";

const ink = "#18251F";
const green = "#176B4A";
const muted = "#77827C";

function Label({ children }: { children: React.ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

export default function HomeScreen() {
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
          <Text style={styles.eyebrow}>MONDAY, SEPTEMBER 28</Text>

          <Text style={styles.greeting}>
            Good morning, {name} <Text style={{ color: "#E5A847" }}>✦</Text>
          </Text>
        </View>

        <TouchableOpacity
          style={styles.avatar}
          onPress={() => router.replace("/profile")}
        >
          <Text style={styles.avatarText}>{initials}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.hero}>
        <View style={styles.heroAccent}>
          <Text style={styles.heroKicker}>YOUR CAMPUS, IN SYNC</Text>

          <Text style={styles.heroTitle}>Show up.{"\n"}Be counted.</Text>

          <Text style={styles.heroCaption}>
            Every moment on campus matters.
          </Text>

          <TouchableOpacity
            style={styles.heroButton}
            onPress={() => router.push("/check-in")}
          >
            <Text style={styles.heroButtonText}>▪ Scan attendance →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.heroOrb}>
          <Text style={styles.orbGlyph}>✓</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>12</Text>

          <Text style={styles.statLabel}>EVENTS ATTENDED</Text>

          <Text style={styles.statChange}>↑ 3 this month</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.stat}>
          <Text style={styles.statNumber}>
            92
            <Text style={styles.percent}>%</Text>
          </Text>

          <Text style={styles.statLabel}>ATTENDANCE RATE</Text>

          <Text style={styles.statChange}>Looking good!</Text>
        </View>
      </View>

      <View style={styles.sectionRow}>
        <Label>UP NEXT</Label>

        <TouchableOpacity onPress={() => router.push("/events")}>
          <Text style={styles.link}>See all →</Text>
        </TouchableOpacity>
      </View>

      {events.slice(0, 2).map((event, i) => (
        <EventCard
          key={`${event.title}-${i}`}
          item={event}
          onPress={() =>
            Alert.alert(
              event.title,
              `${event.date} · ${event.time}\n${event.place}\n${event.attending} students attending`,
            )
          }
          button="Details"
        />
      ))}

      <View style={styles.tip}>
        <Text style={styles.tipIcon}>✳</Text>

        <View style={{ flex: 1 }}>
          <Text style={styles.tipTitle}>You’re on a roll!</Text>

          <Text style={styles.tipBody}>
            Attend 2 more events this month to beat your record.
          </Text>
        </View>

        <Text style={styles.tipArrow}>→</Text>
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
    paddingBottom: 110,
  },

  topline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  eyebrow: {
    color: green,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },

  greeting: {
    color: ink,
    fontSize: 24,
    fontWeight: "800",
    marginTop: 5,
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

  hero: {
    backgroundColor: green,
    borderRadius: 22,
    padding: 22,
    minHeight: 230,
    overflow: "hidden",
    flexDirection: "row",
    marginBottom: 20,
  },

  heroAccent: {
    flex: 1,
  },

  heroKicker: {
    color: "#9ED8B8",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "800",
    marginTop: 12,
  },

  heroCaption: {
    color: "#C8D2CC",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 10,
    maxWidth: 220,
  },

  heroButton: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginTop: 18,
  },

  heroButtonText: {
    color: ink,
    fontSize: 13,
    fontWeight: "800",
  },

  heroOrb: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#DDF3E8",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginLeft: 10,
  },

  orbGlyph: {
    color: green,
    fontSize: 30,
    fontWeight: "800",
  },

  statsRow: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 28,
  },

  stat: {
    flex: 1,
  },

  statDivider: {
    width: 1,
    backgroundColor: "#E3E7E4",
    marginHorizontal: 14,
  },

  statNumber: {
    color: ink,
    fontSize: 27,
    fontWeight: "800",
  },

  percent: {
    fontSize: 17,
  },

  statLabel: {
    color: muted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.7,
    marginTop: 4,
  },

  statChange: {
    color: green,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 7,
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

  link: {
    color: green,
    fontSize: 13,
    fontWeight: "800",
  },

  tip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF4EE",
    borderRadius: 16,
    padding: 16,
    marginTop: 18,
  },

  tipIcon: {
    color: green,
    fontSize: 22,
    marginRight: 12,
  },

  tipTitle: {
    color: ink,
    fontSize: 14,
    fontWeight: "800",
  },

  tipBody: {
    color: muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },

  tipArrow: {
    color: green,
    fontSize: 20,
    fontWeight: "800",
    marginLeft: 10,
  },
});
