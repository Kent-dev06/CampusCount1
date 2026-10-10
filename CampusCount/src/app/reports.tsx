import { useCampus } from "@/context/CampusContext";
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

export default function ReportsScreen() {
  const { events, attendance } = useCampus();

  const now = new Date();

  const thisMonthAttendance = attendance.filter((record) => {
    const recordDate = new Date(record.date);

    return (
      record.status === "PRESENT" &&
      recordDate.getMonth() === now.getMonth() &&
      recordDate.getFullYear() === now.getFullYear()
    );
  });

  const totalCheckIns = thisMonthAttendance.length;

  const totalAttendance = attendance.filter(
    (record) => record.status === "PRESENT",
  ).length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Label>ORGANIZER TOOLS</Label>

        <Text style={styles.title}>Attendance report</Text>

        <Text style={styles.subtitle}>
          A clear picture of campus participation.
        </Text>
      </View>

      <View style={styles.reportBanner}>
        <Text style={styles.reportLabel}>TOTAL CHECK-INS · THIS MONTH</Text>

        <Text style={styles.reportNumber}>{totalCheckIns}</Text>

        <Text style={styles.reportUp}>
          Actual check-ins recorded this month
        </Text>
      </View>

      <View style={styles.reportStats}>
        <View style={styles.reportStat}>
          <Text style={styles.reportStatNum}>{totalAttendance}</Text>

          <Text style={styles.reportStatLabel}>TOTAL PRESENT</Text>
        </View>

        <View style={styles.reportStat}>
          <Text style={styles.reportStatNum}>{events.length}</Text>

          <Text style={styles.reportStatLabel}>EVENTS HELD</Text>
        </View>
      </View>

      <Label>TOP ATTENDED EVENTS</Label>

      {events.slice(0, 3).map((event, i) => (
        <View key={`${event.title}-${i}`} style={styles.reportRow}>
          <View style={styles.reportRank}>
            <Text style={styles.reportRankText}>0{i + 1}</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.historyTitle}>{event.title}</Text>

            <Text style={styles.historyVenue}>
              {event.date} · {event.kind}
            </Text>
          </View>

          <Text style={styles.reportAttendance}>
            {event.attending} <Text style={styles.historyVenue}>people</Text>
          </Text>
        </View>
      ))}

      <TouchableOpacity
        style={styles.exportButton}
        onPress={() =>
          Alert.alert(
            "Report ready",
            "Your attendance report is ready to export.",
          )
        }
      >
        <Text style={styles.exportButtonText}>Export attendance CSV</Text>
      </TouchableOpacity>
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
  reportBanner: {
    backgroundColor: green,
    borderRadius: 18,
    padding: 22,
    marginBottom: 18,
  },
  reportLabel: {
    color: "#C8D2CC",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  reportNumber: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "800",
    marginTop: 8,
  },
  reportUp: {
    color: "#9ED8B8",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
  },
  reportStats: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 28,
  },
  reportStat: {
    flex: 1,
    backgroundColor: "#F4F6F4",
    borderRadius: 16,
    padding: 18,
  },
  reportStatNum: {
    color: ink,
    fontSize: 26,
    fontWeight: "800",
  },
  reportStatLabel: {
    color: muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginTop: 5,
  },
  reportRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9F7",
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
  },
  reportRank: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#DDF3E8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  reportRankText: {
    color: green,
    fontSize: 12,
    fontWeight: "800",
  },
  historyTitle: {
    color: ink,
    fontSize: 14,
    fontWeight: "800",
  },
  historyVenue: {
    color: muted,
    fontSize: 12,
    marginTop: 3,
  },
  reportAttendance: {
    color: ink,
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 10,
  },
  exportButton: {
    backgroundColor: green,
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 18,
    marginTop: 24,
  },
  exportButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },
});
