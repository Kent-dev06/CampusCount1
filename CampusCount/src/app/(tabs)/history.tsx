import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
const ink = "#18251F";
const green = "#176B4A";
const muted = "#77827C";

function Label({ children }: { children: React.ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Label>YOUR ACTIVITY</Label>

        <Text style={styles.title}>Attendance history</Text>

        <Text style={styles.subtitle}>
          A little consistency goes a long way.
        </Text>
      </View>

      <View style={styles.historySummary}>
        <View>
          <Text style={styles.historyBig}>92%</Text>

          <Text style={styles.historyCaption}>Overall attendance</Text>
        </View>

        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>

        <Text style={styles.streak}>✦ 4 week streak</Text>
      </View>

      <View style={styles.sectionRow}>
        <Label>SEPTEMBER 2026</Label>

        <Text style={styles.countPill}>4 events</Text>
      </View>

      {[
        [
          "26",
          "Campus Clean-up Drive",
          "Main Quadrangle",
          "8:12 AM",
          "PRESENT",
          "#DDF3E8",
        ],
        [
          "21",
          "Design Thinking Workshop",
          "Innovation Lab",
          "1:04 PM",
          "PRESENT",
          "#E7E8FF",
        ],
        [
          "16",
          "General Assembly",
          "University Auditorium",
          "9:20 AM",
          "PRESENT",
          "#FFF0D8",
        ],
        [
          "08",
          "Freshers Welcome Night",
          "Open Grounds",
          "—",
          "ABSENT",
          "#FBE5E2",
        ],
      ].map((row, i) => (
        <View key={i} style={styles.historyItem}>
          <View
            style={[
              styles.historyDate,
              {
                backgroundColor: row[5],
              },
            ]}
          >
            <Text style={styles.historyDay}>{row[0]}</Text>

            <Text style={styles.historyMonth}>SEP</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.historyTitle}>{row[1]}</Text>

            <Text style={styles.historyVenue}>
              {row[2]} · {row[3]}
            </Text>
          </View>

          <Text
            style={[styles.status, row[4] === "ABSENT" && styles.statusAbsent]}
          >
            {row[4]}
          </Text>
        </View>
      ))}
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

  historySummary: {
    backgroundColor: "#165F44",
    padding: 19,
    borderRadius: 18,
    marginBottom: 24,
  },

  historyBig: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
  },

  historyCaption: {
    color: "#D1E7D7",
    fontSize: 10,
    marginTop: 1,
  },

  progressTrack: {
    height: 6,
    backgroundColor: "#467E62",
    borderRadius: 8,
    marginTop: 17,
  },

  progressFill: {
    width: "92%",
    height: 6,
    backgroundColor: "#B8E2C6",
    borderRadius: 8,
  },

  streak: {
    color: "#D8EDE0",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 11,
  },

  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  countPill: {
    color: "#647169",
    fontSize: 9,
    fontWeight: "700",
    backgroundColor: "#EEF1ED",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
  },

  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderColor: "#E9EDE8",
  },

  historyDate: {
    width: 42,
    height: 46,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  historyDay: {
    color: ink,
    fontSize: 17,
    fontWeight: "800",
  },

  historyMonth: {
    color: muted,
    fontSize: 8,
    fontWeight: "800",
  },

  historyTitle: {
    color: ink,
    fontSize: 11,
    fontWeight: "800",
  },

  historyVenue: {
    color: muted,
    fontSize: 9,
    marginTop: 4,
  },

  status: {
    color: green,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.4,
  },

  statusAbsent: {
    color: "#B86654",
  },
});
