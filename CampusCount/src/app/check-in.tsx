import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";

const ink = "#18251F";
const green = "#176B4A";
const muted = "#77827C";

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
  const [scanned, setScanned] = useState(false);
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
      <View style={styles.centerBox}>
        <Text style={styles.loadingText}>Checking camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
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
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Label>CHECK IN</Label>

        <Text style={styles.title}>Scan to attend</Text>

        <Text style={styles.subtitle}>
          Point your camera at the event QR code to record your attendance.
        </Text>
      </View>

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

  scanFrame: {
    width: 220,
    height: 220,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E7F5EC",
  },

  scanFrameDone: {
    borderWidth: 2,
    borderColor: green,
  },

  scanCheck: {
    color: green,
    fontSize: 64,
    fontWeight: "800",
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
