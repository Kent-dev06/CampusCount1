import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initialEvents, type EventItem } from "@/data/events";

type Role = "Student" | "Organizer";
type EventFilter = "all" | "week" | "mine";

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

type SavedCampusData = {
  events: EventItem[];
  joinedEvents: string[];
};

type CampusContextType = {
  signedIn: boolean;
  signIn: (name: string, role: Role, email: string) => void;
  signOut: () => void;
  role: Role;
  name: string;
  setName: (name: string) => void;
  email: string;
  events: EventItem[];
  setEvents: React.Dispatch<React.SetStateAction<EventItem[]>>;
  addEvent: (event: NewEventData) => void;
  updateEvent: (id: string, event: NewEventData) => void;
  joinedEvents: string[];
  registerForEvent: (event: EventItem) => void;
  cancelRegistration: (event: EventItem) => void;
  eventFilter: EventFilter;
  setEventFilter: (filter: EventFilter) => void;
  scanned: boolean;
  setScanned: (scanned: boolean) => void;
};

const CampusContext = createContext<CampusContextType | undefined>(undefined);

const STORAGE_KEY = "@campuscount/campus-data";

export function CampusProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [role, setRole] = useState<Role>("Student");
  const [name, setName] = useState("Alex Rivera");
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [joinedEvents, setJoinedEvents] = useState<string[]>([]);
  const [eventFilter, setEventFilter] = useState<EventFilter>("all");
  const [scanned, setScanned] = useState(false);
  const [storageLoaded, setStorageLoaded] = useState(false);

  // Load saved events and registrations when the app starts.
  useEffect(() => {
    let cancelled = false;

    const loadCampusData = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);

        if (cancelled) return;

        if (saved) {
          const data: unknown = JSON.parse(saved);

          if (
            typeof data === "object" &&
            data !== null &&
            "events" in data &&
            Array.isArray(data.events) &&
            "joinedEvents" in data &&
            Array.isArray(data.joinedEvents)
          ) {
            const savedData = data as SavedCampusData;
            setEvents(savedData.events);
            setJoinedEvents(savedData.joinedEvents);
          }
        }
      } catch (error) {
        console.error("Failed to load CampusCount data:", error);
      } finally {
        if (!cancelled) {
          setStorageLoaded(true);
        }
      }
    };

    void loadCampusData();

    return () => {
      cancelled = true;
    };
  }, []);

  // Save changes after the initial load finishes.
  useEffect(() => {
    if (!storageLoaded) return;

    const saveCampusData = async () => {
      try {
        const data: SavedCampusData = { events, joinedEvents };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error("Failed to save CampusCount data:", error);
      }
    };

    void saveCampusData();
  }, [events, joinedEvents, storageLoaded]);

  const addEvent = (event: NewEventData) => {
    const newEvent: EventItem = {
      id: `event-${Date.now()}`,
      title: event.title.trim(),
      date: event.date.trim(),
      time: event.time.trim(),
      place: event.place.trim(),
      kind: event.kind,
      color: event.color,
      attending: 0,
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

  const updateEvent = (id: string, event: NewEventData) => {
    setEvents((current) =>
      current.map((existing) =>
        existing.id === id
          ? {
              ...existing,
              title: event.title.trim(),
              date: event.date.trim(),
              time: event.time.trim(),
              place: event.place.trim(),
              kind: event.kind,
              color: event.color,
              latitude: event.latitude,
              longitude: event.longitude,
              radius: event.radius,
            }
          : existing,
      ),
    );

    Alert.alert(
      "Event updated",
      `${event.title.trim()} has been updated successfully.`,
    );
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

    setEvents((current) =>
      current.map((item) =>
        item.id === event.id
          ? { ...item, attending: item.attending + 1 }
          : item,
      ),
    );

    Alert.alert(
      "Registration successful",
      `You are now registered for ${event.title}.`,
    );
  };

  const cancelRegistration = (event: EventItem) => {
    if (!joinedEvents.includes(event.title)) {
      Alert.alert(
        "Not registered",
        `You are not registered for ${event.title}.`,
      );
      return;
    }

    setJoinedEvents((current) =>
      current.filter((title) => title !== event.title),
    );

    setEvents((current) =>
      current.map((item) =>
        item.id === event.id
          ? { ...item, attending: Math.max(0, item.attending - 1) }
          : item,
      ),
    );

    Alert.alert(
      "Registration cancelled",
      `Your registration for ${event.title} has been cancelled.`,
    );
  };

  const signIn = (
    loggedInName: string,
    loggedInRole: Role,
    loggedInEmail: string,
  ) => {
    setName(loggedInName);
    setRole(loggedInRole);
    setEmail(loggedInEmail);
    setSignedIn(true);
  };

  const signOut = () => {
    setSignedIn(false);
    setName("Alex Rivera");
    setRole("Student");
    setEmail("");
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
        email,
        events,
        setEvents,
        addEvent,
        updateEvent,
        joinedEvents,
        registerForEvent,
        cancelRegistration,
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
