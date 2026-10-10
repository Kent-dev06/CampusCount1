import { useCampus } from "@/context/CampusContext";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ink = "#18251F";
const green = "#176B4A";
const muted = "#77827C";

function Label({ children }: { children: React.ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const { events, attendance } = useCampus();

  async function exportAttendanceCSV() {
    try {
      const headers = [
        "Event ID",
        "Event Name",
        "Venue",
        "Date",
        "Time",
        "Status",
        "Latitude",
        "Longitude",
        "Location Name",
      ];

      const rows = attendance.map((record) => {
        const item = record as unknown as Record<string, unknown>;

        return [
          item["eventId"] ?? item["id"],
          item["eventName"] ?? item["title"],
          item["venue"] ?? item["place"],
          item["date"],
          item["time"],
          item["status"],
          item["latitude"],
          item["longitude"],
          item["locationName"],
        ]
          .map((value) => {
            const text = value == null ? "" : String(value);
            return `"${text.replace(/"/g, '""')}"`;
          })
          .join(",");
      });

      const csvContent = [headers.join(","), ...rows].join("\r\n");

      const FileSystem = await import("expo-file-system/legacy");
      const Sharing = await import("expo-sharing");

      const directory = FileSystem.cacheDirectory;

      if (!directory) {
        throw new Error("File storage is unavailable.");
      }

      const fileUri = `${directory}CampusCount_Attendance.csv`;

      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/csv",
          dialogTitle: "Export attendance CSV",
        });
      } else {
        Alert.alert("Sharing unavailable", "Unable to open the share menu.");
      }
    } catch (error) {
      console.error("CSV export error:", error);
      Alert.alert("Export failed", "Could not export the attendance CSV.");
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}
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

        <Text style={styles.reportNumber}>1,284</Text>

        <Text style={styles.reportUp}>↑ 18% more than August</Text>
      </View>

      <View style={styles.reportStats}>
        <View style={styles.reportStat}>
          <Text style={styles.reportStatNum}>86%</Text>

          <Text style={styles.reportStatLabel}>AVG.{"\n"}TURNOUT</Text>
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
        onPress={exportAttendanceCSV}
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
    color: "#9ED8B8",
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
    color: "#C8D2CC",
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
