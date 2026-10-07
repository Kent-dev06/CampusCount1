import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useCampus } from "@/context/CampusContext";

export default function TabLayout() {
  const { role } = useCampus();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: "#176B4A",
        tabBarInactiveTintColor: "#77827C",

        tabBarStyle: {
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: "#18251F",
          shadowOpacity: 0.12,
          shadowRadius: 8,
          shadowOffset: {
            width: 0,
            height: -3,
          },
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          href: role === "Organizer" ? null : "/home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="organizer-home"
        options={{
          title: "Home",
          href: role === "Organizer" ? "/organizer-home" : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="events"
        options={{
          title: "Events",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="check-in"
        options={{
          title: "Check In",
          href: role === "Student" ? "/check-in" : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="checkmark-circle-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          href: role === "Student" ? "/history" : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
          href: role === "Organizer" ? "/reports" : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="bar-chart-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}