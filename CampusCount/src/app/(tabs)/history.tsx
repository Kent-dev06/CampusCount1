import { useCampus } from "@/context/CampusContext";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ink = "#172019";
const muted = "#6D756F";
const green = "#2F7D4A";

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { attendance } = useCampus();

  // Number of successful check-ins
  const totalEvents = attendance.length;

  // Since every saved attendance record is a successful check-in,
  // the current attendance rate is 100% when there is at least one record.
  const attendanceRate = totalEvents > 0 ? 100 : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 30,
        },
      ]}
    >
      <Text style={styles.title}>Attendance History</Text>

      <Text style={styles.subtitle}>View your previous event check-ins.</Text>

      {/* SUMMARY */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{attendanceRate}%</Text>

          <Text style={styles.summaryLabel}>Attendance</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{totalEvents}</Text>

          <Text style={styles.summaryLabel}>Events</Text>
        </View>
      </View>

      {/* HISTORY */}
      <Text style={styles.sectionTitle}>Recent Attendance</Text>

      {attendance.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>No attendance yet</Text>

          <Text style={styles.emptyText}>
            Your successful event check-ins will appear here.
          </Text>
        </View>
      ) : (
        attendance.map((record) => {
          const recordDate = new Date(record.date);

          return (
            <View key={record.id} style={styles.historyItem}>
              {/* DATE */}
              <View style={styles.historyDate}>
                <Text style={styles.historyDay}>{recordDate.getDate()}</Text>

                <Text style={styles.historyMonth}>
                  {recordDate
                    .toLocaleString("en-US", {
                      month: "short",
                    })
                    .toUpperCase()}
                </Text>
              </View>

              {/* EVENT DETAILS */}
              <View style={styles.eventDetails}>
                <Text style={styles.historyTitle}>{record.eventName}</Text>

                <Text style={styles.historyVenue}>
                  {record.venue} · {record.time}
                </Text>
              </View>

              {/* STATUS */}
              <Text style={styles.status}>{record.status}</Text>
            </View>
          );
        })
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
    paddingHorizontal: 20,
  },

  title: {
    color: ink,
    fontSize: 28,
    fontWeight: "800",
  },

  subtitle: {
    color: muted,
    fontSize: 14,
    marginTop: 6,
    marginBottom: 20,
  },

  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 28,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: "#F4F6F4",
    borderRadius: 16,
    padding: 20,
  },

  summaryNumber: {
    color: green,
    fontSize: 26,
    fontWeight: "800",
  },

  summaryLabel: {
    color: muted,
    fontSize: 13,
    marginTop: 4,
  },

  sectionTitle: {
    color: ink,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },

  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7EBE8",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },

  historyDate: {
    width: 52,
    height: 58,
    borderRadius: 12,
    backgroundColor: "#DDF3E8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  historyDay: {
    color: ink,
    fontSize: 20,
    fontWeight: "800",
  },

  historyMonth: {
    color: green,
    fontSize: 10,
    fontWeight: "800",
    marginTop: 2,
  },

  eventDetails: {
    flex: 1,
  },

  historyTitle: {
    color: ink,
    fontSize: 15,
    fontWeight: "700",
  },

  historyVenue: {
    color: muted,
    fontSize: 12,
    marginTop: 5,
  },

  status: {
    color: green,
    fontSize: 11,
    fontWeight: "800",
    marginLeft: 8,
  },

  emptyBox: {
    backgroundColor: "#F4F6F4",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginTop: 10,
  },

  emptyTitle: {
    color: ink,
    fontSize: 16,
    fontWeight: "800",
  },

  emptyText: {
    color: muted,
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
  },
});
