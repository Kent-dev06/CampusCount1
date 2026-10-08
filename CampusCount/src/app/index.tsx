import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CameraView, useCameraPermissions } from "expo-camera";

import * as Location from "expo-location";

import EventCard from "../components/EventCard";
import { initialEvents, type EventItem } from "../data/events";
import LoginScreen from "../components/auth/LoginScreen";
import { useCampus } from "@/context/CampusContext";

type Page = "home" | "scan" | "history" | "profile" | "events" | "reports";

const ink = "#18251F";
const green = "#176B4A";
const muted = "#77827C";

function Label({ children }: { children: string }) {
  return <Text style={styles.label}>{children}</Text>;
}

function Action({
  title,
  onPress,
  light = false,
}: {
  title: string;
  onPress: () => void;
  light?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.action, light && styles.actionLight]}
    >
      <Text style={[styles.actionText, light && styles.actionTextLight]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();

  const [page, setPage] = useState<Page>("home");

  const { role, name, setName, signedIn, signIn, signOut } = useCampus();

  const [events, setEvents] = useState<EventItem[]>(initialEvents);

  const [scanned, setScanned] = useState(false);
  const [query, setQuery] = useState("");

  const [permission, requestPermission] = useCameraPermissions();

  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );

  const [locationLoading, setLocationLoading] = useState(false);

  const [eventFilter, setEventFilter] = useState<"all" | "week" | "mine" | "bookmarks">("all");

  const [joinedEvents, setJoinedEvents] = useState<string[]>([]);
  const [bookmarkedEvents, setBookmarkedEvents] = useState<string[]>([]);

  const toggleBookmark = (title: string) => {
  if (bookmarkedEvents.includes(title)) {
    setBookmarkedEvents(bookmarkedEvents.filter(t => t !== title));
  } else {
    setBookmarkedEvents([...bookmarkedEvents, title]);
    Alert.alert('Bookmarked', 'Added to your saved events.');
  }
};


  const getCurrentLocation = async () => {
    setLocationLoading(true);

    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      setLocationLoading(false);

      Alert.alert(
        "Location permission needed",
        "Please allow CampusCount to access your location.",
      );

      return;
    }

    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation(currentLocation);

      Alert.alert(
        "Location detected",
        `Latitude: ${currentLocation.coords.latitude.toFixed(6)}\nLongitude: ${currentLocation.coords.longitude.toFixed(6)}`,
      );
    } catch (error) {
      Alert.alert("Location error", "Unable to get your current location.");
    } finally {
      setLocationLoading(false);
    }
  };

  const addEvent = () => {
    setEvents([
      {
        title: "New campus gathering",
        date: "OCT 18",
        time: "10:00 AM",
        place: "Student Center",
        kind: "CAMPUS",
        color: "#E7E8FF",
        attending: 0,
      },
      ...events,
    ]);

    Alert.alert("Event created", "Your new event is now on the event list.");
  };

  const header = (eyebrow: string, title: string, subtitle?: string) => (
    <View style={styles.pageHead}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>

      <Text style={styles.pageTitle}>{title}</Text>

      {subtitle ? <Text style={styles.pageSubtitle}>{subtitle}</Text> : null}
    </View>
  );

  const dashboard = () => (
    <>
      <View style={styles.topline}>
        <View>
          <Text style={styles.eyebrow}>MONDAY, SEPTEMBER 28</Text>

          <Text style={styles.greeting}>
            Good morning, Alex <Text style={{ color: "#E5A847" }}>✦</Text>
          </Text>
        </View>

        <TouchableOpacity
          style={styles.avatar}
          onPress={() => router.replace("/profile")}
        >
          <Text style={styles.avatarText}>AR</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.hero}>
        <View style={styles.heroAccent}>
          <Text style={styles.heroKicker}>YOUR CAMPUS, IN SYNC</Text>

          <Text style={styles.heroTitle}>Show up.{"\n"}Be counted.</Text>

          <Text style={styles.heroCaption}>
            Every moment on campus matters.
          </Text>

          <TouchableOpacity
            style={styles.heroButton}
            onPress={() => {
              router.push("/check-in");
            }}
          >
            <Text style={styles.heroButtonText}>▦ Scan attendance →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.heroOrb}>
          <Text style={styles.orbGlyph}>✓</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>12</Text>

          <Text style={styles.statLabel}>EVENTS ATTENDED</Text>

          <Text style={styles.statChange}>↑ 3 this month</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.stat}>
          <Text style={styles.statNumber}>
            92
            <Text style={styles.percent}>%</Text>
          </Text>

          <Text style={styles.statLabel}>ATTENDANCE RATE</Text>

          <Text style={styles.statChange}>Looking good!</Text>
        </View>
      </View>

      <View style={styles.sectionRow}>
        <Label>UP NEXT</Label>

        <TouchableOpacity onPress={() => router.push("/events")}>
          <Text style={styles.link}>See all →</Text>
        </TouchableOpacity>
      </View>

      {events.slice(0, 2).map((event, i) => (
        <EventCard
          key={`${event.title}-${i}`}
          item={event}
          onPress={() =>
            Alert.alert(
              event.title,
              `${event.date} · ${event.time}\n${event.place}\n${event.attending} students attending`,
            )
          }
          button="Details"
        />
      ))}

      <View style={styles.tip}>
        <Text style={styles.tipIcon}>✳</Text>

        <View style={{ flex: 1 }}>
          <Text style={styles.tipTitle}>You’re on a roll!</Text>

          <Text style={styles.tipBody}>
            Attend 2 more events this month to beat your record.
          </Text>
        </View>

        <Text style={styles.tipArrow}>→</Text>
      </View>
    </>
  );

  const scanPage = () => {
    if (!permission) {
      return (
        <View style={styles.centerBox}>
          <Text style={styles.loadingText}>Checking camera permission...</Text>
        </View>
      );
    }

    if (!permission.granted) {
      return (
        <>
          {header(
            "CHECK IN",
            "Scan to attend",
            "Camera access is needed to scan the event QR code.",
          )}

          <View style={styles.permissionBox}>
            <Text style={styles.permissionIcon}>📷</Text>

            <Text style={styles.permissionTitle}>
              Camera permission required
            </Text>

            <Text style={styles.permissionText}>
              CampusCount needs access to your camera so you can scan an event
              QR code.
            </Text>

            <Action title="Allow camera access" onPress={requestPermission} />
          </View>
        </>
      );
    }

    return (
      <>
        {header(
          "CHECK IN",
          "Scan to attend",
          "Point your camera at the event QR code to record your attendance.",
        )}

        <View style={styles.scanCard}>
          {!scanned ? (
            <View style={styles.cameraContainer}>
              <CameraView
                style={styles.camera}
                facing="back"
                barcodeScannerSettings={{
                  barcodeTypes: ["qr"],
                }}
                onBarcodeScanned={({ data }) => {
                  setScanned(true);

                  Alert.alert("QR Code scanned", `QR data: ${data}`);
                }}
              />

              <View style={styles.cameraOverlay}>
                <View style={[styles.corner, styles.cornerTL]} />

                <View style={[styles.corner, styles.cornerTR]} />

                <View style={[styles.corner, styles.cornerBL]} />

                <View style={[styles.corner, styles.cornerBR]} />

                <Text style={styles.cameraText}>
                  Place the QR code inside the frame
                </Text>
              </View>
            </View>
          ) : (
            <View style={[styles.scanFrame, styles.scanFrameDone]}>
              <Text style={styles.scanCheck}>✓</Text>
            </View>
          )}

          <Text style={styles.scanHint}>
            {scanned ? "QR code scanned successfully!" : "Ready to scan"}
          </Text>

          <Text style={styles.scanSub}>
            {scanned
              ? "Attendance verification can continue."
              : "Align the QR code inside the frame"}
          </Text>
        </View>

        <View style={styles.notice}>
          <Text style={styles.noticeIcon}>⌖</Text>

          <View style={{ flex: 1 }}>
            <Text style={styles.noticeTitle}>
              {location ? "Location detected" : "Location verification"}
            </Text>

            <Text style={styles.noticeBody}>
              {location
                ? `GPS: ${location.coords.latitude.toFixed(5)}, ${location.coords.longitude.toFixed(5)}`
                : "Your location will be checked during attendance."}
            </Text>
          </View>

          <Text style={styles.greenDot} />
        </View>

        <Action
          title={
            locationLoading
              ? "Getting location..."
              : location
                ? "Refresh location"
                : "Get my location"
          }
          light={!!location}
          onPress={getCurrentLocation}
        />

        {scanned && (
          <Action
            title="Scan another code"
            light
            onPress={() => setScanned(false)}
          />
        )}
      </>
    );
  };

  const historyPage = () => (
    <>
      {header(
        "YOUR ACTIVITY",
        "Attendance history",
        "A little consistency goes a long way.",
      )}

      <View style={styles.historySummary}>
        <View>
          <Text style={styles.historyBig}>92%</Text>

          <Text style={styles.historyCaption}>Overall attendance</Text>
        </View>

        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>

        <Text style={styles.streak}>✦ 4 week streak</Text>
      </View>

      <View style={styles.sectionRow}>
        <Label>SEPTEMBER 2026</Label>

        <Text style={styles.countPill}>4 events</Text>
      </View>

      {[
        [
          "26",
          "Campus Clean-up Drive",
          "Main Quadrangle",
          "8:12 AM",
          "PRESENT",
          "#DDF3E8",
        ],
        [
          "21",
          "Design Thinking Workshop",
          "Innovation Lab",
          "1:04 PM",
          "PRESENT",
          "#E7E8FF",
        ],
        [
          "16",
          "General Assembly",
          "University Auditorium",
          "9:20 AM",
          "PRESENT",
          "#FFF0D8",
        ],
        [
          "08",
          "Freshers Welcome Night",
          "Open Grounds",
          "—",
          "ABSENT",
          "#FBE5E2",
        ],
      ].map((row, i) => (
        <View key={i} style={styles.historyItem}>
          <View
            style={[
              styles.historyDate,
              {
                backgroundColor: row[5] as string,
              },
            ]}
          >
            <Text style={styles.historyDay}>{row[0]}</Text>

            <Text style={styles.historyMonth}>SEP</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.historyTitle}>{row[1]}</Text>

            <Text style={styles.historyVenue}>
              {row[2]} · {row[3]}
            </Text>
          </View>

          <Text
            style={[styles.status, row[4] === "ABSENT" && styles.statusAbsent]}
          >
            {row[4]}
          </Text>
        </View>
      ))}
    </>
  );

  const profilePage = () => (
    <>
      {header("ACCOUNT", "Your profile", "Manage your CampusCount account.")}

      <View style={styles.profileCard}>
        <View style={[styles.avatar, styles.profileAvatar]}>
          <Text style={styles.avatarText}>
            {name
              .split(" ")
              .map((x) => x[0])
              .join("")}
          </Text>
        </View>

        <Text style={styles.profileName}>{name}</Text>

        <Text style={styles.profileEmail}>alex.rivera@campus.edu</Text>

        <Text style={styles.profileRole}>
          {role.toUpperCase()} · COMPUTER SCIENCE
        </Text>
      </View>

      <Label>PERSONAL INFORMATION</Label>

      <Text style={styles.inputLabel}>Display name</Text>

      <TextInput
        value={name}
        onChangeText={setName}
        style={styles.input}
        placeholder="Your name"
        placeholderTextColor="#89938E"
      />

      <Text style={styles.inputLabel}>Email address</Text>

      <TextInput
        value="alex.rivera@campus.edu"
        editable={false}
        style={[styles.input, styles.inputDisabled]}
      />

      <Label>APP PREFERENCES</Label>

      <TouchableOpacity
        style={styles.settingRow}
        onPress={() =>
          Alert.alert("Notifications", "Event reminders are turned on.")
        }
      >
        <Text style={styles.settingIcon}>♧</Text>

        <Text style={styles.settingName}>Event notifications</Text>

        <Text style={styles.settingValue}>On ›</Text>
      </TouchableOpacity>

      <Action title="Sign out" light onPress={signOut} />
    </>
  );

  const eventsPage = () => {
    const filteredEvents = events
      .filter((event) =>
        event.title.toLowerCase().includes(query.toLowerCase()),
      )
      .filter((event) => {
        if (eventFilter === "all") {
          return true;
        }

        if (eventFilter === "mine") {
          return joinedEvents.includes(event.title);
        }

        const currentYear = new Date().getFullYear();

        const eventDate = new Date(`${event.date} ${currentYear}`);

        const today = new Date();

        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);

        return eventDate >= today && eventDate <= nextWeek;
      });

    const registerForEvent = (event: EventItem) => {
      if (joinedEvents.includes(event.title)) {
        Alert.alert(
          "Already registered",
          `You are already registered for ${event.title}.`,
        );
        return;
      }

      setJoinedEvents([...joinedEvents, event.title]);

      Alert.alert(
        "Registration successful",
        `You are now registered for ${event.title}.`,
      );
    };

    return (
      <>
        {header("CAMPUS LIFE", "Events", "Find your people.\nMake your mark.")}

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="⌕   Search events"
          placeholderTextColor="#87918B"
          style={styles.search}
        />

        <View style={styles.filterRow}>
          <TouchableOpacity onPress={() => setEventFilter("all")}>
            <Text
              style={
                eventFilter === "all" ? styles.filterActive : styles.filter
              }
            >
              All events
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setEventFilter("week")}>
            <Text
              style={
                eventFilter === "week" ? styles.filterActive : styles.filter
              }
            >
              This week
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setEventFilter("mine")}>
            <Text
              style={
                eventFilter === "mine" ? styles.filterActive : styles.filter
              }
            >
              My events
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setEventFilter("bookmarks")}>
            <Text style={eventFilter === "bookmarks" ? styles.filterActive : styles.filter}>
              Bookmarks 
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionRow}>
          <Label>UPCOMING</Label>

          <Text style={styles.countPill}>
            {filteredEvents.length}{" "}
            {filteredEvents.length === 1 ? "event" : "events"}
          </Text>
        </View>

        {filteredEvents.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>○</Text>

            <Text style={styles.emptyTitle}>No events found</Text>

            <Text style={styles.emptyText}>
              Try another filter or search for a different event.
            </Text>
          </View>
        ) : (
          filteredEvents.map((event, i) => (
            <EventCard
              key={`${event.title}-${i}`}
              item={event}
              onPress={() => registerForEvent(event)}
              button={
                joinedEvents.includes(event.title) ? "Joined" : "Register"
              }
            />
          ))
        )}
      </>
    );
  };

  const reportsPage = () => (
    <>
      {header(
        "ORGANIZER TOOLS",
        "Attendance report",
        "A clear picture of campus participation.",
      )}

      <View style={styles.reportBanner}>
        <Text style={styles.reportLabel}>TOTAL CHECK-INS · THIS MONTH</Text>

        <Text style={styles.reportNumber}>1,284</Text>

        <Text style={styles.reportUp}>↗ 18% more than August</Text>
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
        <View key={i} style={styles.reportRow}>
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

      <Action
        title="Export attendance CSV"
        onPress={() =>
          Alert.alert(
            "Report ready",
            "Your attendance report is ready to export.",
          )
        }
      />
    </>
  );

  const organizerPage = () => (
    <>
      {header(
        "ORGANIZER SPACE",
        "Manage events",
        "Bring your campus community together.",
      )}

      <View style={styles.organizerBanner}>
        <View>
          <Text style={styles.orgEyebrow}>YOUR EVENTS</Text>

          <Text style={styles.orgCount}>
            {events.length.toString().padStart(2, "0")}
          </Text>

          <Text style={styles.orgCaption}>events on the calendar</Text>
        </View>

        <Text style={styles.orgDecoration}>✳</Text>
      </View>

      <Action title="＋   Create a new event" onPress={addEvent} />

      <View style={styles.sectionRow}>
        <Label>EVENT CALENDAR</Label>

        <Text style={styles.countPill}>OCTOBER</Text>
      </View>

      {events.map((event, i) => (
        <EventCard
          key={`${event.title}-${i}`}
          item={event}
          onPress={() =>
            Alert.alert(
              event.title,
              `${event.attending} attendees · ${event.place}`,
              [
                { text: "Close" },
                {
                  text: "View report",
                  onPress: () => setPage("reports"),
                },
              ],
            )
          }
          button="Manage"
        />
      ))}

      <TouchableOpacity
        style={styles.reportShortcut}
        onPress={() => setPage("reports")}
      >
        <Text style={styles.reportShortcutIcon}>▤</Text>

        <View style={{ flex: 1 }}>
          <Text style={styles.settingName}>Attendance reports</Text>

          <Text style={styles.historyVenue}>Turnout analytics and exports</Text>
        </View>

        <Text style={styles.link}>Open →</Text>
      </TouchableOpacity>
    </>
  );

  const navItems: {
    id: Page;
    icon: string;
    label: string;
  }[] =
    role === "Student"
      ? [
          {
            id: "home",
            icon: "⌂",
            label: "Home",
          },
          {
            id: "events",
            icon: "▦",
            label: "Events",
          },
          {
            id: "scan",
            icon: "▣",
            label: "Check in",
          },
          {
            id: "history",
            icon: "◷",
            label: "History",
          },
          {
            id: "profile",
            icon: "○",
            label: "Profile",
          },
        ]
      : [
          {
            id: "home",
            icon: "⌂",
            label: "Home",
          },
          {
            id: "events",
            icon: "▦",
            label: "Events",
          },
          {
            id: "reports",
            icon: "▤",
            label: "Reports",
          },
          {
            id: "profile",
            icon: "○",
            label: "Profile",
          },
        ];

  if (!signedIn) {
    return (
      <LoginScreen
        onLogin={(loggedInName, loggedInRole) => {
          signIn(loggedInName, loggedInRole);

          router.replace(
            loggedInRole === "Organizer"
              ? "/(tabs)/organizer-home"
              : "/(tabs)/home",
          );
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F8F5" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {role === "Organizer" && page === "home"
          ? organizerPage()
          : page === "home"
            ? dashboard()
            : page === "scan"
              ? scanPage()
              : page === "history"
                ? historyPage()
                : page === "profile"
                  ? profilePage()
                  : page === "events"
                    ? eventsPage()
                    : reportsPage()}
      </ScrollView>

      <View style={styles.bottomNav}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.navItem}
            onPress={() => {
              if (item.id === "home") {
                if (role === "Organizer") {
                  router.push("/organizer-home");
                } else {
                  router.push("/home");
                }
                return;
              }

              if (item.id === "events") {
                router.push("/events");
                return;
              }

              if (item.id === "scan") {
                router.push("/check-in");
                return;
              }

              if (item.id === "history") {
                router.push("/history");
                return;
              }

              if (item.id === "profile") {
                router.push("/profile");
                return;
              }

              if (item.id === "reports") {
                router.push("/reports");
                return;
              }

              setPage(item.id);
            }}
          >
            <Text
              style={[styles.navIcon, page === item.id && styles.navActive]}
            >
              {item.icon}
            </Text>

            <Text
              style={[styles.navLabel, page === item.id && styles.navActive]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F7F8F5",
  },

  content: {
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 28,
  },

  topline: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 21,
  },

  eyebrow: {
    color: muted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.35,
  },

  greeting: {
    color: ink,
    fontSize: 23,
    fontWeight: "800",
    marginTop: 7,
    letterSpacing: -0.6,
  },

  avatar: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: "#DCEFE3",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: green,
    fontWeight: "800",
    fontSize: 14,
  },

  hero: {
    minHeight: 204,
    borderRadius: 23,
    backgroundColor: "#155E43",
    padding: 22,
    overflow: "hidden",
    marginBottom: 14,
    flexDirection: "row",
  },

  heroAccent: {
    zIndex: 2,
  },

  heroKicker: {
    color: "#A7D1B7",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 31,
    lineHeight: 34,
    marginTop: 9,
    letterSpacing: -0.9,
  },

  heroCaption: {
    color: "#CEE3D5",
    fontSize: 12,
    marginTop: 7,
  },

  heroButton: {
    marginTop: 16,
    backgroundColor: "#F2F7F0",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 11,
    alignSelf: "flex-start",
  },

  heroButtonText: {
    color: green,
    fontSize: 11,
    fontWeight: "800",
  },

  heroOrb: {
    position: "absolute",
    width: 152,
    height: 152,
    borderRadius: 90,
    backgroundColor: "#247452",
    right: -27,
    top: 32,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-12deg" }],
  },

  orbGlyph: {
    color: "#B3DFC4",
    fontSize: 71,
    fontWeight: "200",
  },

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    paddingVertical: 16,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#ECEFEB",
  },

  stat: {
    flex: 1,
    paddingHorizontal: 18,
  },

  statDivider: {
    width: 1,
    height: 44,
    backgroundColor: "#E8ECE8",
  },

  statNumber: {
    color: ink,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.7,
  },

  percent: {
    fontSize: 15,
  },

  statLabel: {
    color: muted,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginTop: 2,
  },

  statChange: {
    color: green,
    fontSize: 10,
    fontWeight: "700",
    marginTop: 7,
  },

  label: {
    color: muted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 11,
  },

  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  link: {
    color: green,
    fontWeight: "800",
    fontSize: 11,
  },

  tip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    backgroundColor: "#FFF5DF",
    borderRadius: 15,
    padding: 14,
    marginTop: 5,
  },

  tipIcon: {
    fontSize: 21,
    color: "#D59625",
  },

  tipTitle: {
    color: ink,
    fontSize: 12,
    fontWeight: "800",
  },

  tipBody: {
    color: "#77776F",
    fontSize: 10,
    marginTop: 4,
  },

  tipArrow: {
    color: "#B78224",
    fontSize: 17,
  },

  pageHead: {
    marginTop: 12,
    marginBottom: 23,
  },

  pageTitle: {
    fontSize: 27,
    lineHeight: 32,
    color: ink,
    fontWeight: "800",
    letterSpacing: -0.7,
    marginTop: 7,
  },

  pageSubtitle: {
    color: muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
  },

  scanCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ECEFEB",
  },

  scanFrame: {
    width: 230,
    height: 230,
    backgroundColor: "#F2F5F1",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },

  scanFrameDone: {
    backgroundColor: "#E5F4EA",
  },

  scanGlyph: {
    color: "#AFBDB2",
    fontSize: 74,
  },

  scanLine: {
    position: "absolute",
    width: 178,
    height: 2,
    backgroundColor: "#38A36D",
    top: 112,
    opacity: 0.75,
  },

  scanCheck: {
    color: green,
    fontSize: 72,
    fontWeight: "700",
  },

  corner: {
    position: "absolute",
    width: 29,
    height: 29,
    borderColor: green,
  },

  cornerTL: {
    top: 16,
    left: 16,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 8,
  },

  cornerTR: {
    top: 16,
    right: 16,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 8,
  },

  cornerBL: {
    bottom: 16,
    left: 16,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 8,
  },

  cornerBR: {
    bottom: 16,
    right: 16,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 8,
  },

  scanHint: {
    color: ink,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 19,
  },

  scanSub: {
    color: muted,
    fontSize: 11,
    marginTop: 6,
    textAlign: "center",
  },

  notice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    padding: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderColor: "#ECEFEB",
    borderWidth: 1,
    marginTop: 14,
    marginBottom: 18,
  },

  noticeIcon: {
    color: green,
    fontSize: 20,
  },

  noticeTitle: {
    color: ink,
    fontWeight: "700",
    fontSize: 11,
  },

  noticeBody: {
    color: muted,
    fontSize: 10,
    marginTop: 4,
  },

  greenDot: {
    backgroundColor: "#3FA96D",
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  action: {
    minHeight: 47,
    borderRadius: 13,
    backgroundColor: green,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    marginBottom: 16,
  },

  actionText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  actionLight: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E4E9E4",
    borderWidth: 1,
  },

  actionTextLight: {
    color: green,
  },

  historySummary: {
    backgroundColor: "#165F44",
    padding: 19,
    borderRadius: 18,
    marginBottom: 24,
  },

  historyBig: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
  },

  historyCaption: {
    color: "#D1E7D7",
    fontSize: 10,
    marginTop: 1,
  },

  progressTrack: {
    height: 6,
    backgroundColor: "#467E62",
    borderRadius: 8,
    marginTop: 17,
  },

  progressFill: {
    width: "92%",
    height: 6,
    backgroundColor: "#B8E2C6",
    borderRadius: 8,
  },

  streak: {
    color: "#D8EDE0",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 11,
  },

  countPill: {
    color: "#647169",
    fontSize: 9,
    fontWeight: "700",
    backgroundColor: "#EEF1ED",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
  },

  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderColor: "#E9EDE8",
  },

  historyDate: {
    width: 42,
    height: 46,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  historyDay: {
    color: ink,
    fontSize: 17,
    fontWeight: "800",
  },

  historyMonth: {
    color: muted,
    fontSize: 8,
    fontWeight: "800",
  },

  historyTitle: {
    color: ink,
    fontSize: 11,
    fontWeight: "800",
  },

  historyVenue: {
    color: muted,
    fontSize: 9,
    marginTop: 4,
  },

  status: {
    color: green,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.4,
  },

  statusAbsent: {
    color: "#B86654",
  },

  profileCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 21,
    marginBottom: 23,
    borderWidth: 1,
    borderColor: "#ECEFEB",
  },

  profileAvatar: {
    width: 67,
    height: 67,
    borderRadius: 23,
    marginBottom: 11,
  },

  profileName: {
    color: ink,
    fontSize: 18,
    fontWeight: "800",
  },

  profileEmail: {
    color: muted,
    fontSize: 11,
    marginTop: 5,
  },

  profileRole: {
    color: green,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,
    backgroundColor: "#E9F4EC",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 7,
    marginTop: 12,
  },

  inputLabel: {
    color: muted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginTop: 13,
    marginBottom: 7,
  },

  input: {
    minHeight: 46,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#E5EAE5",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 13,
    color: ink,
    fontSize: 12,
    marginBottom: 3,
  },

  inputDisabled: {
    color: "#99A29D",
    marginBottom: 22,
  },

  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: "#E9EDE8",
    gap: 10,
  },

  settingIcon: {
    color: green,
    fontSize: 17,
    width: 25,
  },

  settingName: {
    flex: 1,
    color: ink,
    fontSize: 11,
    fontWeight: "700",
  },

  settingValue: {
    color: muted,
    fontSize: 10,
  },

  search: {
    minHeight: 45,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: "#E9EDE8",
    color: ink,
    fontSize: 12,
  },

  filterRow: {
    flexDirection: "row",
    gap: 9,
    marginVertical: 14,
  },

  filterActive: {
    overflow: "hidden",
    color: "#FFFFFF",
    backgroundColor: green,
    borderRadius: 8,
    paddingHorizontal: 11,
    paddingVertical: 8,
    fontSize: 9,
    fontWeight: "700",
  },

  filter: {
    overflow: "hidden",
    color: "#67736B",
    backgroundColor: "#ECEFEB",
    borderRadius: 8,
    paddingHorizontal: 11,
    paddingVertical: 8,
    fontSize: 9,
    fontWeight: "700",
  },

  reportBanner: {
    backgroundColor: "#165F44",
    borderRadius: 18,
    padding: 20,
    marginBottom: 12,
  },

  reportLabel: {
    color: "#C2DECC",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },

  reportNumber: {
    color: "#FFFFFF",
    fontSize: 41,
    fontWeight: "800",
    marginTop: 9,
  },

  reportUp: {
    color: "#B8E2C6",
    fontSize: 10,
    marginTop: 5,
  },

  reportStats: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#ECEFEB",
    borderRadius: 15,
    paddingVertical: 16,
    marginBottom: 23,
  },

  reportStat: {
    flex: 1,
    alignItems: "center",
  },

  reportStatNum: {
    color: ink,
    fontSize: 22,
    fontWeight: "800",
  },

  reportStatLabel: {
    color: muted,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.7,
    marginTop: 4,
    textAlign: "center",
  },

  reportRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderColor: "#E9EDE8",
  },

  reportRank: {
    height: 35,
    width: 35,
    backgroundColor: "#E9F4EC",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  reportRankText: {
    color: green,
    fontSize: 10,
    fontWeight: "800",
  },

  reportAttendance: {
    color: ink,
    fontSize: 12,
    fontWeight: "800",
  },

  organizerBanner: {
    backgroundColor: "#165F44",
    borderRadius: 18,
    padding: 19,
    marginBottom: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  orgEyebrow: {
    color: "#C2DECC",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },

  orgCount: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "800",
    marginTop: 4,
  },

  orgCaption: {
    color: "#D1E7D7",
    fontSize: 10,
  },

  orgDecoration: {
    color: "#B8E2C6",
    fontSize: 45,
  },

  reportShortcut: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    padding: 15,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#ECEFEB",
    borderRadius: 14,
    marginTop: 8,
  },

  reportShortcutIcon: {
    color: green,
    fontSize: 20,
  },

  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderColor: "#EAEEEA",
    paddingTop: 9,
    paddingBottom: 5,
    justifyContent: "space-around",
  },

  navItem: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 54,
  },

  navIcon: {
    fontSize: 20,
    color: "#98A29C",
  },

  navLabel: {
    fontSize: 8,
    color: "#98A29C",
    marginTop: 3,
    fontWeight: "600",
  },

  navActive: {
    color: green,
    fontWeight: "800",
  },

  loginScreen: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#F7F8F5",
    paddingHorizontal: 27,
  },

  loginLogo: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: green,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  logoGlyph: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "700",
  },

  brand: {
    color: ink,
    fontSize: 20,
    fontWeight: "800",
  },

  loginTitle: {
    color: ink,
    fontSize: 35,
    lineHeight: 39,
    fontWeight: "800",
    letterSpacing: -1,
    marginTop: 43,
  },

  loginSubtitle: {
    color: muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 11,
    marginBottom: 24,
  },

  loginFoot: {
    textAlign: "center",
    color: muted,
    fontSize: 10,
    marginTop: 15,
  },

  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ECEFEB",
    padding: 25,
    alignItems: "center",
    marginTop: 5,
  },

  emptyIcon: {
    color: "#A8B2AB",
    fontSize: 35,
    marginBottom: 8,
  },

  emptyTitle: {
    color: "#18251F",
    fontSize: 14,
    fontWeight: "800",
  },

  emptyText: {
    color: "#77827C",
    fontSize: 10,
    textAlign: "center",
    lineHeight: 16,
    marginTop: 6,
  },

  cameraContainer: {
    width: 230,
    height: 230,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#000000",
  },

  camera: {
    width: "100%",
    height: "100%",
  },

  cameraOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  cameraText: {
    position: "absolute",
    bottom: 13,
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 7,
  },

  permissionBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#ECEFEB",
    padding: 24,
    alignItems: "center",
  },

  permissionIcon: {
    fontSize: 42,
    marginBottom: 12,
  },

  permissionTitle: {
    color: "#18251F",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },

  permissionText: {
    color: "#77827C",
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 8,
  },

  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  loadingText: {
    color: "#77827C",
    fontSize: 12,
  },
});
