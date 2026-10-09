import { useCampus } from "@/context/CampusContext";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import { useRef, useState } from "react";
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

function getDistanceInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadius = 6371000;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
}

function Label({ children }: { children: React.ReactNode }) {
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
      style={[styles.action, light && styles.actionLight]}
      onPress={onPress}
    >
      <Text style={[styles.actionText, light && styles.actionTextLight]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

export default function CheckInScreen() {
  const insets = useSafeAreaInsets();

  const { name, events, attendance, addAttendance } = useCampus();

  const [scanned, setScanned] = useState(false);
  const scanLocked = useRef(false);

  const [permission, requestPermission] = useCameraPermissions();

  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );

  const [locationLoading, setLocationLoading] = useState(false);

  const getCurrentLocation = async () => {
    setLocationLoading(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Location permission required",
          "Please allow location access to verify your attendance.",
        );
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});

      setLocation(currentLocation);
    } catch {
      Alert.alert(
        "Location error",
        "Unable to get your current location. Please try again.",
      );
    } finally {
      setLocationLoading(false);
    }
  };

  if (!permission) {
    return (
      <View style={[styles.centerBox, { paddingTop: insets.top }]}>
        <Text style={styles.loadingText}>Checking camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 12 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Label>CHECK IN</Label>

          <Text style={styles.title}>Scan to attend</Text>

          <Text style={styles.subtitle}>
            Camera access is needed to scan the event QR code.
          </Text>
        </View>

        <View style={styles.permissionBox}>
          <Text style={styles.permissionIcon}>📷</Text>

          <Text style={styles.permissionTitle}>Camera permission required</Text>

          <Text style={styles.permissionText}>
            CampusCount needs access to your camera so you can scan an event QR
            code.
          </Text>

          <Action title="Allow camera access" onPress={requestPermission} />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Label>CHECK IN</Label>

        <Text style={styles.title}>Scan to attend</Text>

        <Text style={styles.subtitle}>
          Point your camera at the event QR code to record your attendance.
        </Text>
      </View>

      {/* QR SCANNER */}
      <View style={styles.scanCard}>
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
            onBarcodeScanned={
              scanned
                ? undefined
                : async ({ data }) => {
                    if (scanLocked.current) return;

                    scanLocked.current = true;
                    setScanned(true);

                    const rejectScan = (title: string, message: string) => {
                      Alert.alert(title, message, [
                        {
                          text: "OK",
                          onPress: () => {
                            scanLocked.current = false;
                            setScanned(false);
                          },
                        },
                      ]);
                    };

                    try {
                      // 1. Require the student's current GPS location.
                      if (!location) {
                        rejectScan(
                          "Location required",
                          "Please get your GPS location before scanning the event QR code.",
                        );
                        return;
                      }

                      // 2. Read the QR code generated by the Organizer.
                      let qrData: {
                        app?: string;
                        eventId?: string;
                      };

                      try {
                        qrData = JSON.parse(data);
                      } catch {
                        rejectScan(
                          "Invalid QR code",
                          "This QR code is not a valid CampusCount event QR code.",
                        );
                        return;
                      }

                      if (qrData.app !== "CampusCount" || !qrData.eventId) {
                        rejectScan(
                          "Invalid QR code",
                          "Please scan the QR code generated for a CampusCount event.",
                        );
                        return;
                      }

                      // 3. Find the real event from the app's event list.
                      const event = events.find(
                        (item) => item.id === qrData.eventId,
                      );

                      if (!event) {
                        rejectScan(
                          "Event not found",
                          "This event is not available in your current CampusCount event list.",
                        );
                        return;
                      }

                      // 4. Check whether attendance was already recorded.
                      const alreadyCheckedIn = attendance.some(
                        (record) =>
                          record.eventId === event.id ||
                          (!record.eventId && record.eventName === event.title),
                      );

                      if (alreadyCheckedIn) {
                        rejectScan(
                          "Already checked in",
                          `Attendance for ${event.title} has already been recorded on this device.`,
                        );
                        return;
                      }

                      // 5. Calculate distance from the actual event coordinates.
                      const distance = getDistanceInMeters(
                        location.coords.latitude,
                        location.coords.longitude,
                        event.latitude,
                        event.longitude,
                      );

                      if (distance > event.radius) {
                        rejectScan(
                          "Outside allowed area",
                          `You are approximately ${Math.round(distance)} meters from ${event.title}. You must be within ${event.radius} meters of the event location.`,
                        );
                        return;
                      }

                      // 6. Get a readable description of the current location.
                      let locationName = "Location verified";

                      try {
                        const addresses = await Location.reverseGeocodeAsync({
                          latitude: location.coords.latitude,
                          longitude: location.coords.longitude,
                        });

                        if (addresses.length > 0) {
                          const address = addresses[0];

                          locationName =
                            [
                              address.name,
                              address.street,
                              address.city,
                              address.region,
                            ]
                              .filter(Boolean)
                              .join(", ") || locationName;
                        }
                      } catch (error) {
                        console.log("Unable to get readable location:", error);
                      }

                      // 7. Record attendance only after event and GPS checks pass.
                      const now = new Date();

                      addAttendance({
                        id: `${Date.now()}`,
                        eventId: event.id,
                        eventName: event.title,
                        venue: event.place,
                        date: now.toISOString(),
                        time: now.toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                        }),
                        status: "PRESENT",
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        locationName,
                      });

                      Alert.alert(
                        "Check-in successful",
                        `${name}, your attendance for ${event.title} has been recorded. Distance from event: ${Math.round(distance)} meters.`,
                      );
                    } catch (error) {
                      console.error("Check-in error:", error);

                      rejectScan(
                        "Check-in failed",
                        "Something went wrong. Please try scanning again.",
                      );
                    }
                  }
            }
          />

          {/* Scanner frame */}
          <View style={styles.cameraOverlay}>
            <View style={[styles.corner, styles.cornerTL]} />

            <View style={[styles.corner, styles.cornerTR]} />

            <View style={[styles.corner, styles.cornerBL]} />

            <View style={[styles.corner, styles.cornerBR]} />

            <Text style={styles.cameraText}>
              {scanned
                ? "QR code scanned successfully"
                : "Place the QR code inside the frame"}
            </Text>
          </View>
        </View>

        <Text style={styles.scanHint}>
          {scanned ? "Attendance recorded" : "Ready to scan"}
        </Text>

        <Text style={styles.scanSub}>
          {scanned
            ? "Tap Scan another code to scan again."
            : "Align the QR code inside the frame"}
        </Text>
      </View>

      {/* LOCATION */}
      <View style={styles.notice}>
        <Text style={styles.noticeIcon}>⌖</Text>

        <View style={{ flex: 1 }}>
          <Text style={styles.noticeTitle}>
            {location ? "Location detected" : "Location verification"}
          </Text>

          <Text style={styles.noticeBody}>
            {location
              ? `GPS: ${location.coords.latitude.toFixed(
                  5,
                )}, ${location.coords.longitude.toFixed(5)}`
              : "Your location will be checked during attendance."}
          </Text>
        </View>

        <Text style={styles.greenDot} />
      </View>

      {/* LOCATION BUTTON */}
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

      {/* SCAN AGAIN BUTTON */}
      {scanned && (
        <Action
          title="Scan another code"
          light
          onPress={() => {
            // Unlock scanner.
            scanLocked.current = false;

            // Show camera as ready to scan again.
            setScanned(false);
          }}
        />
      )}
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

  centerBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 20,
  },

  loadingText: {
    color: muted,
    fontSize: 15,
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

  permissionBox: {
    backgroundColor: "#F4F6F4",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },

  permissionIcon: {
    fontSize: 42,
    marginBottom: 14,
  },

  permissionTitle: {
    color: ink,
    fontSize: 19,
    fontWeight: "800",
    textAlign: "center",
  },

  permissionText: {
    color: muted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
  },

  action: {
    backgroundColor: green,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
    marginTop: 14,
  },

  actionLight: {
    backgroundColor: "#DDF3E8",
  },

  actionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  actionTextLight: {
    color: green,
  },

  scanCard: {
    backgroundColor: "#F4F6F4",
    borderRadius: 20,
    padding: 14,
    alignItems: "center",
  },

  cameraContainer: {
    width: "100%",
    height: 330,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },

  camera: {
    flex: 1,
  },

  cameraOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },

  corner: {
    position: "absolute",
    width: 42,
    height: 42,
    borderColor: "#FFFFFF",
  },

  cornerTL: {
    top: 55,
    left: 35,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },

  cornerTR: {
    top: 55,
    right: 35,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },

  cornerBL: {
    bottom: 55,
    left: 35,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },

  cornerBR: {
    bottom: 55,
    right: 35,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },

  cameraText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    position: "absolute",
    bottom: 20,
    textAlign: "center",
  },

  scanHint: {
    color: ink,
    fontSize: 17,
    fontWeight: "800",
    marginTop: 18,
  },

  scanSub: {
    color: muted,
    fontSize: 13,
    marginTop: 5,
    textAlign: "center",
  },

  notice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F6F4",
    borderRadius: 16,
    padding: 16,
    marginTop: 18,
  },

  noticeIcon: {
    color: green,
    fontSize: 25,
    marginRight: 12,
  },

  noticeTitle: {
    color: ink,
    fontSize: 14,
    fontWeight: "800",
  },

  noticeBody: {
    color: muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },

  greenDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: green,
    marginLeft: 10,
  },
});
