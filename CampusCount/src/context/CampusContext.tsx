import { initialEvents, type EventItem } from "@/data/events";
import { createContext, useContext, useState, type ReactNode } from "react";
import { Alert } from "react-native";

type Role = "Student" | "Organizer";

type EventFilter = "all" | "week" | "mine";

export type AttendanceRecord = {
  id: string;
  eventId?: string;
  eventName: string;
  venue: string;
  date: string;
  time: string;
  status: "PRESENT";
  latitude: number;
  longitude: number;
  locationName: string;
};

type NewEventData = {
  title: string;
  date: string;
  time: string;
  place: string;
  kind: string;
  color: string;
  attending: number;
  latitude: number;
  longitude: number;
  radius: number;
};

type CampusContextType = {
  signedIn: boolean;
  signIn: (name: string, role: Role) => void;
  signOut: () => void;
  role: Role;

  name: string;
  setName: (name: string) => void;

  events: EventItem[];
  setEvents: React.Dispatch<React.SetStateAction<EventItem[]>>;
  addEvent: (event: NewEventData) => void;

  joinedEvents: string[];
  registerForEvent: (event: EventItem) => void;

  eventFilter: EventFilter;
  setEventFilter: (filter: EventFilter) => void;

  scanned: boolean;
  setScanned: (scanned: boolean) => void;

  attendance: AttendanceRecord[];
  addAttendance: (record: AttendanceRecord) => void;
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

  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  const addEvent = (event: NewEventData) => {
    const newEvent: EventItem = {
      id: `event-${Date.now()}`,
      title: event.title,
      date: event.date,
      time: event.time,
      place: event.place,
      kind: event.kind,
      color: event.color,
      attending: event.attending,
      latitude: event.latitude,
      longitude: event.longitude,
      radius: event.radius,
    };
    setEvents((current) => [newEvent, ...current]);

    Alert.alert(
      "Event created",
      `${newEvent.title} has been added to the event calendar.`,
    );
  };

  const addAttendance = (record: AttendanceRecord) => {
    setAttendance((current) => [record, ...current]);
  };

  const registerForEvent = (event: EventItem) => {
    if (joinedEvents.includes(event.id)) {
      Alert.alert(
        "Already registered",
        `You are already registered for ${event.title}.`,
      );
      return;
    }

    setJoinedEvents((current) => [...current, event.id]);

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
        attendance,
        addAttendance,
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
