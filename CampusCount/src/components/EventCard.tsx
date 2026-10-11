import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { type EventItem } from "@/data/events";

type EventCardProps = {
  item: EventItem;
  onPress: () => void;
  button?: string;
  isBookmarked?: boolean;
  onBookmark?: () => void;
};

export default function EventCard({
  item,
  onPress,
  button = "Register",
  isBookmarked = false,
  onBookmark,
}: EventCardProps) {
  return (
    <View style={styles.card}>
      {/* Top Header Row with Date Badge & Bookmark Star */}
      <View style={styles.cardHeader}>
        <View style={styles.dateBadge}>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>

        <TouchableOpacity
          onPress={onBookmark}
          style={styles.bookmarkButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <Text style={[styles.starIcon, isBookmarked && styles.bookmarkedStar]}>
            {isBookmarked ? "★" : "☆"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Event Details */}
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.place}>{item.place}</Text>

      {/* Action Button */}
      <TouchableOpacity style={styles.actionButton} onPress={onPress}>
        <Text style={styles.actionButtonText}>{button}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  dateBadge: {
    backgroundColor: "#E6F4EA",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dateText: {
    color: "#137333",
    fontSize: 12,
    fontWeight: "600",
  },
  bookmarkButton: {
    padding: 4,
  },
  starIcon: {
    fontSize: 22,
    color: "#77827C",
  },
  bookmarkedStar: {
    color: "#F59E0B",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#202124",
    marginBottom: 4,
  },
  place: {
    fontSize: 14,
    color: "#5F6368",
    marginBottom: 12,
  },
  actionButton: {
    backgroundColor: "#1A73E8",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
});