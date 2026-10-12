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
  authToken: string;
  signIn: (name: string, role: Role, email: string, token: string) => void;
  signOut: () => void;
  role: Role;
  name: string;
  setName: (name: string) => void;
  email: string;
  events: EventItem[];
  setEvents: React.Dispatch<React.SetStateAction<EventItem[]>>;
  addEvent: (event: NewEventData) => Promise<boolean>;
  updateEvent: (id: string, event: NewEventData) => void;
  deleteEvent: (event: EventItem) => Promise<boolean>;
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
const API_URL = "https://campuscountapi.onrender.com";

export function CampusProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState("");
  const [authToken, setAuthToken] = useState("");
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

  // Load shared events from PostgreSQL after login.
  useEffect(() => {
    if (!signedIn || !authToken) return;

    let cancelled = false;

    const loadServerEvents = async () => {
      try {
        const response = await fetch(`${API_URL}/events`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Unable to load events (${response.status}).`);
        }

        const result = (await response.json()) as {
          events?: EventItem[];
        };

        if (cancelled || !Array.isArray(result.events)) return;

        const serverEvents = result.events;

        setEvents((current) => {
          const serverIds = new Set(serverEvents.map((event) => event.id));

          return [
            ...serverEvents,
            ...current.filter((event) => !serverIds.has(event.id)),
          ];
        });

        const registrationsResponse = await fetch(
          `${API_URL}/event-registrations`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          },
        );

        if (!registrationsResponse.ok) {
          throw new Error("Unable to load your event registrations.");
        }

        const registrationsResult = (await registrationsResponse.json()) as {
          registrations?: { event_title: string }[];
        };

        if (cancelled) return;

        setJoinedEvents(
          (registrationsResult.registrations ?? []).map(
            (registration) => registration.event_title,
          ),
        );
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load server events:", error);
        }
      }
    };

    void loadServerEvents();

    return () => {
      cancelled = true;
    };
  }, [signedIn, authToken]);

  const addEvent = async (event: NewEventData): Promise<boolean> => {
    if (!authToken || role !== "Organizer") {
      Alert.alert(
        "Unable to create event",
        "Please sign in with an Organizer account.",
      );
      return false;
    }

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

    try {
      const response = await fetch(
        "https://campuscountapi.onrender.com/events",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(newEvent),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        Alert.alert(
          "Unable to create event",
          result.message ?? "The server could not save this event.",
        );
        return false;
      }

      const savedEvent = result.event as EventItem;

      setEvents((current) => [
        savedEvent,
        ...current.filter((item) => item.id !== savedEvent.id),
      ]);

      Alert.alert(
        "Event created",
        `${savedEvent.title} has been saved successfully.`,
      );

      return true;
    } catch (error) {
      console.error("Creating event failed:", error);
      Alert.alert(
        "Connection error",
        "Could not save the event to the server. Please try again.",
      );
      return false;
    }
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

  const deleteEvent = async (event: EventItem): Promise<boolean> => {
    if (role !== "Organizer" || !authToken) {
      Alert.alert(
        "Unable to delete",
        "Please sign in with an Organizer account.",
      );
      return false;
    }

    try {
      const response = await fetch(
        `${API_URL}/events/${encodeURIComponent(event.id)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      if (!response.ok && response.status !== 404) {
        const result = await response.json().catch(() => ({}));
        Alert.alert(
          "Unable to delete",
          result.message ?? "The event could not be deleted.",
        );
        return false;
      }

      setEvents((current) => current.filter((item) => item.id !== event.id));

      setJoinedEvents((current) =>
        current.filter((title) => title !== event.title),
      );

      Alert.alert("Event deleted", `${event.title} has been removed.`);
      return true;
    } catch (error) {
      console.error("Deleting event failed:", error);
      Alert.alert(
        "Connection error",
        "Could not contact the server. Please try again.",
      );
      return false;
    }
  };

  const registerForEvent = async (event: EventItem) => {
    if (role !== "Student" || !authToken) {
      Alert.alert(
        "Unable to register",
        "Please sign in with a Student account.",
      );
      return;
    }

    if (joinedEvents.includes(event.title)) {
      Alert.alert(
        "Already registered",
        `You are already registered for ${event.title}.`,
      );
      return;
    }

    try {
      const response = await fetch(`${API_URL}/event-registrations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          eventId: event.id,
          eventTitle: event.title,
          eventDate: event.date,
          eventTime: event.time,
          eventPlace: event.place,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        Alert.alert(
          "Unable to register",
          result.message ?? "Your registration could not be saved.",
        );
        return;
      }

      setJoinedEvents((current) =>
        current.includes(event.title) ? current : [...current, event.title],
      );

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
    } catch (error) {
      console.error("Event registration failed:", error);
      Alert.alert(
        "Connection error",
        "Could not save your registration. Please try again.",
      );
    }
  };

  const cancelRegistration = async (event: EventItem) => {
    if (role !== "Student" || !authToken) {
      Alert.alert("Unable to cancel", "Please sign in with a Student account.");
      return;
    }

    if (!joinedEvents.includes(event.title)) {
      Alert.alert(
        "Not registered",
        `You are not registered for ${event.title}.`,
      );
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/event-registrations/${encodeURIComponent(event.id)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      const result = await response.json();

      if (!response.ok) {
        Alert.alert(
          "Unable to cancel",
          result.message ?? "Your registration could not be cancelled.",
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
    } catch (error) {
      console.error("Cancelling event registration failed:", error);
      Alert.alert(
        "Connection error",
        "Could not cancel your registration. Please try again.",
      );
    }
  };

  const signIn = (
    loggedInName: string,
    loggedInRole: Role,
    loggedInEmail: string,
    token: string,
  ) => {
    setName(loggedInName);
    setRole(loggedInRole);
    setEmail(loggedInEmail);
    setAuthToken(token);
    setSignedIn(true);
  };

  const signOut = () => {
    setSignedIn(false);
    setName("Alex Rivera");
    setRole("Student");
    setEmail("");
    setAuthToken("");
  };

  return (
    <CampusContext.Provider
      value={{
        signedIn,
        authToken,
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
        deleteEvent,
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
