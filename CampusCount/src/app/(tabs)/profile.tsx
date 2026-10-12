import { useState } from "react";
import { useCampus } from "@/context/CampusContext";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const ink = "#18251F";
const green = "#176B4A";
const muted = "#77827C";

function Label({ children }: { children: React.ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { name, setName, email, role, signOut } = useCampus();
  const [displayName, setDisplayName] = useState(name);

  const handleNameChange = (value: string) => {
    setDisplayName(value);
    setName(value);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Label>ACCOUNT</Label>

        <Text style={styles.title}>PROFILE</Text>

        <Text style={styles.subtitle}>Manage your CampusCount account.</Text>
      </View>

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

        <Text style={styles.profileEmail}>{email}</Text>

        <Text style={styles.profileRole}>
          {role.toUpperCase()} · COMPUTER SCIENCE
        </Text>
      </View>

      <Label>PERSONAL INFORMATION</Label>

      <Text style={styles.inputLabel}>Display name</Text>

      <TextInput
        value={displayName}
        onChangeText={handleNameChange}
        style={styles.input}
        placeholder="Your name"
        placeholderTextColor="#89938E"
      />

      <Text style={styles.inputLabel}>Email address</Text>

      <TextInput
        value={email}
        editable={false}
        style={[styles.input, styles.inputDisabled]}
      />

      <Label>APP PREFERENCES</Label>

      <TouchableOpacity
        style={styles.settingRow}
        onPress={() =>
          Alert.alert("Notifications", "Event reminders are turned on.")
        }
        activeOpacity={0.8}
      >
        <Text style={styles.settingIcon}>♧</Text>

        <Text style={styles.settingName}>Event notifications</Text>

        <Text style={styles.settingValue}>On ›</Text>
      </TouchableOpacity>

      {role === "Organizer" && (
        <TouchableOpacity
          style={styles.registerRow}
          onPress={() => router.push("/register-student")}
          activeOpacity={0.8}
        >
          <View style={styles.registerIcon}>
            <Text style={styles.registerIconText}>+</Text>
          </View>

          <View style={styles.registerInfo}>
            <Text style={styles.registerTitle}>Register Student</Text>
            <Text style={styles.registerDescription}>
              Create a student campus account
            </Text>
          </View>

          <Text style={styles.registerChevron}>›</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.action, styles.actionLight]}
        onPress={() => {
          signOut();
          router.replace("/");
        }}
        activeOpacity={0.85}
      >
        <Text style={[styles.actionText, styles.actionTextLight]}>
          Sign out
        </Text>
      </TouchableOpacity>
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

  profileCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 21,
    marginBottom: 23,
    borderWidth: 1,
    borderColor: "#ECEFEB",
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#DDF3E8",
    alignItems: "center",
    justifyContent: "center",
  },

  profileAvatar: {
    width: 67,
    height: 67,
    borderRadius: 23,
    marginBottom: 11,
  },

  avatarText: {
    color: green,
    fontSize: 18,
    fontWeight: "800",
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

  registerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: "#E9EDE8",
    gap: 12,
  },

  registerIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#DDF3E8",
    alignItems: "center",
    justifyContent: "center",
  },

  registerIconText: {
    color: green,
    fontSize: 25,
    fontWeight: "600",
  },

  registerInfo: {
    flex: 1,
  },

  registerTitle: {
    color: ink,
    fontSize: 13,
    fontWeight: "800",
  },

  registerDescription: {
    color: muted,
    fontSize: 11,
    marginTop: 4,
  },

  registerChevron: {
    color: green,
    fontSize: 25,
  },

  action: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
    marginTop: 18,
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
});
