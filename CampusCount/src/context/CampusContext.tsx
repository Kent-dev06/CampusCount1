import { createContext, useContext, useState, type ReactNode } from "react";
import { Alert } from "react-native";
import { initialEvents, type EventItem } from "@/data/events";

type Role = "Student" | "Organizer";

type EventFilter = "all" | "week" | "mine";

type CampusContextType = {
  signedIn: boolean;
  signIn: (name: string, role: Role) => void;
  signOut: () => void;
  role: Role;

  name: string;
  setName: (name: string) => void;

  events: EventItem[];
  setEvents: React.Dispatch<React.SetStateAction<EventItem[]>>;
  addEvent: () => void;

  joinedEvents: string[];
  registerForEvent: (event: EventItem) => void;

  eventFilter: EventFilter;
  setEventFilter: (filter: EventFilter) => void;

  scanned: boolean;
  setScanned: (scanned: boolean) => void;
};

const CampusContext = createContext<CampusContextType | undefined>(undefined);

export function CampusProvider({ children }: { children: ReactNode }) {
  const [signedIn, setSignedIn] = useState(false);
  const [role, setRole] = useState<Role>("Student");
  const [name, setName] = useState("Alex Rivera");
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [joinedEvents, setJoinedEvents] = useState<string[]>([]);
  const [eventFilter, setEventFilter] = useState<EventFilter>("all");
  const [scanned, setScanned] = useState(false);

  const addEvent = () => {
    const newEvent: EventItem = {
      title: "New campus gathering",
      date: "OCT 18",
      time: "10:00 AM",
      place: "Student Center",
      kind: "CAMPUS",
      color: "#E7E8FF",
      attending: 0,
    };

    setEvents((current) => [newEvent, ...current]);

    Alert.alert("Event created", "Your new event is now on the event list.");
  };

  const registerForEvent = (event: EventItem) => {
    if (joinedEvents.includes(event.title)) {
      Alert.alert(
        "Already registered",
        `You are already registered for ${event.title}.`,
      );
      return;
    }

    setJoinedEvents((current) => [...current, event.title]);

    Alert.alert(
      "Registration successful",
      `You are now registered for ${event.title}.`,
    );
  };

  const signIn = (loggedInName: string, loggedInRole: Role) => {
    setName(loggedInName);
    setRole(loggedInRole);
    setSignedIn(true);
  };

  const signOut = () => {
    setSignedIn(false);
    setName("Alex Rivera");
    setRole("Student");
  };

  return (
    <CampusContext.Provider
      value={{
        signedIn,
        signIn,
        signOut,
        role,
        name,
        setName,
        events,
        setEvents,
        addEvent,
        joinedEvents,
        registerForEvent,
        eventFilter,
        setEventFilter,
        scanned,
        setScanned,
      }}
    >
      {children}
    </CampusContext.Provider>
  );
}

export function useCampus() {
  const context = useContext(CampusContext);

  if (!context) {
    throw new Error("useCampus must be used inside CampusProvider");
  }

  return context;
}
