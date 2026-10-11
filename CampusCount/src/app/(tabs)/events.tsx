import React from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { useCampus, type EventFilter } from "@/context/CampusContext";
import EventCard from "@/components/EventCard";

export default function EventsScreen() {
  const {
    events,
    joinedEvents,
    registerForEvent,
    eventFilter,
    setEventFilter,
    bookmarkedEvents,
    toggleBookmark,
  } = useCampus();

  // Filter events based on active tab
  const filteredEvents = events.filter((event) => {
    if (eventFilter === "mine") {
      return joinedEvents.includes(event.id);
    }
    if (eventFilter === "bookmarks") {
      return bookmarkedEvents.includes(event.id);
    }
    if (eventFilter === "week") {
      // Show events happening this week (if flag exists) or fallback
      return (event as any).isThisWeek;
    }
    return true; // "all"
  });

  const filterTabs: { label: string; key: EventFilter }[] = [
    { label: "All Events", key: "all" },
    { label: "This Week", key: "week" },
    { label: "Registered", key: "mine" },
    { label: "Bookmarks", key: "bookmarks" },
  ];

  return (
    <View style={styles.container}>
      {/* Filter Tabs Header */}
      <View style={styles.tabBar}>
        {filterTabs.map((tab) => {
          const isActive = eventFilter === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, isActive && styles.activeTabButton]}
              onPress={() => setEventFilter(tab.key)}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Events List */}
      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <EventCard
            item={item}
            onPress={() => registerForEvent(item)}
            button={joinedEvents.includes(item.id) ? "Registered" : "Register"}
            isBookmarked={bookmarkedEvents.includes(item.id)}
            onBookmark={() => toggleBookmark(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {eventFilter === "bookmarks"
                ? "No bookmarked events yet. Tap the ☆ on any event to save it here!"
                : "No events found."}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  tabButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  activeTabButton: {
    backgroundColor: "#E8F0FE",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#5F6368",
  },
  activeTabText: {
    color: "#1A73E8",
    fontWeight: "600",
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: "#70757A",
    textAlign: "center",
  },
});