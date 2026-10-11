import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { EventItem } from "@/data/events";

type EventCardProps = {
  item: EventItem;
  onPress: () => void;
  button?: string;
};

const ink = "#18251F";
const green = "#176B4A";
const muted = "#77827C";

export default function EventCard({
  item,
  onPress,
  button = "View details",
}: EventCardProps) {
  const dateParts = item.date.trim().split(/\s+/);
  const month = dateParts[0] ?? "";
  const day = dateParts[1] ?? "";

  return (
    <View style={styles.eventCard}>
      <View style={styles.eventTop}>
        <View style={[styles.dateBox, { backgroundColor: item.color }]}>
          <Text style={styles.dateText}>{month}</Text>
          <Text style={styles.dateDay}>{day.replace(",", "")}</Text>
        </View>

        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{item.title}</Text>

          <Text style={styles.eventMeta}>
            {item.time} · {item.place}
          </Text>

          <Text style={styles.attendance}>
            {item.attending} {item.attending === 1 ? "person" : "people"}{" "}
            attending
          </Text>
        </View>

        <Text style={styles.dots}>•••</Text>
      </View>

      <View style={styles.eventBottom}>
        <Text style={styles.tag}>{item.kind}</Text>

        <TouchableOpacity
          onPress={onPress}
          style={styles.detailsButton}
          activeOpacity={0.75}
        >
          <Text style={styles.link}>{button} →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  eventCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#ECEFEB",
    marginBottom: 12,
  },
  eventTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  dateBox: {
    width: 50,
    minHeight: 56,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  dateText: {
    color: ink,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.7,
  },
  dateDay: {
    color: ink,
    fontSize: 19,
    fontWeight: "800",
    marginTop: 2,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    color: ink,
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 21,
  },
  eventMeta: {
    color: muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 6,
  },
  attendance: {
    color: green,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 7,
  },
  dots: {
    color: muted,
    fontSize: 15,
    letterSpacing: 1,
  },
  eventBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: "#F0F1EF",
  },
  tag: {
    color: green,
    backgroundColor: "#E9F4EC",
    paddingVertical: 6,
    paddingHorizontal: 9,
    borderRadius: 7,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.6,
    overflow: "hidden",
  },
  detailsButton: {
    backgroundColor: "#E9F4EC",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
  },
  link: {
    color: green,
    fontWeight: "800",
    fontSize: 11,
  },
});
