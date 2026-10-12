import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { useCampus } from "@/context/CampusContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const API_URL = "https://campuscountapi.onrender.com";

const PROGRAMS = [
  "Information Technology",
  "Computer Science",
  "Information Systems",
  "Computer Engineering",
  "Electronics Engineering",
  "Data Science",
  "Cybersecurity",
  "Information Technology Education",
  "Other technology-related program",
];

function normalizeName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export default function RegisterStudentScreen() {
  const router = useRouter();
  const { authToken, role } = useCampus();
  const insets = useSafeAreaInsets();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [program, setProgram] = useState(PROGRAMS[0]);
  const [programModalVisible, setProgramModalVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const firstInitial = normalizeName(firstName).charAt(0);
  const surname = normalizeName(lastName);
  const campusEmail =
    firstInitial && surname ? `${firstInitial}.${surname}.[ID]@campus.edu` : "";

  async function handleRegister() {
    if (role !== "Organizer") {
      Alert.alert(
        "Access denied",
        "Only an Organizer can register student accounts.",
      );
      return;
    }

    if (!authToken) {
      Alert.alert("Session expired", "Please sign in again.");
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert(
        "Missing information",
        "Enter the student's first and last name.",
      );
      return;
    }

    if (!normalizeName(firstName) || !normalizeName(lastName)) {
      Alert.alert(
        "Invalid name",
        "Enter names containing valid letters or numbers.",
      );
      return;
    }

    if (password.length < 8) {
      Alert.alert("Password too short", "Use at least 8 characters.");
      return;
    }

    if (password.length > 128) {
      Alert.alert("Password too long", "Use no more than 128 characters.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Passwords don't match", "Please confirm the same password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/register-student`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          password,
          program,
        }),
      });

      const data = await response.json();
      console.log("Registration API response:", JSON.stringify(data, null, 2));

      if (!response.ok) {
        Alert.alert(
          "Registration failed",
          data.message || "Unable to create the student account.",
        );
        return;
      }

      Alert.alert(
        "Student registered",
        `Student ID: ${data.student.id}\nName: ${data.student.name}\nCampus email: ${data.student.email}\nPassword: ${password}\nProgram: ${data.student.program}`,
        [
          {
            text: "Done",
            onPress: () => router.back(),
          },
        ],
      );
    } catch {
      Alert.alert(
        "Connection error",
        "Could not reach the CampusCount API. Check your internet connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Register Student",
          headerBackTitle: "Profile",
          headerTintColor: "#176B4A",
        }}
      />

      <KeyboardAvoidingView
        style={[styles.screen, { paddingTop: insets.top }]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.heading}>
            <Text style={styles.eyebrow}>STUDENT MANAGEMENT</Text>

            <Text style={styles.title}>Register a student</Text>

            <Text style={styles.subtitle}>
              Create a campus account and choose the student's program and
              password.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>First name</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter first name"
              placeholderTextColor="#94A3B8"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              editable={!loading}
            />

            <Text style={styles.label}>Last name</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter last name"
              placeholderTextColor="#94A3B8"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
              editable={!loading}
            />

            <Text style={styles.label}>Generated campus email</Text>

            <View style={styles.emailBox}>
              <Text style={styles.emailText}>
                {campusEmail || "firstinitial.lastname.[ID]@campus.edu"}
              </Text>
            </View>

            <Text style={styles.helper}>
              The student's actual ID is added automatically when the account is
              created.
            </Text>

            <Text style={styles.label}>Program</Text>

            <TouchableOpacity
              style={styles.programButton}
              disabled={loading}
              onPress={() => setProgramModalVisible(true)}
              activeOpacity={0.8}
            >
              <View style={styles.programTextContainer}>
                <Text style={styles.programText}>{program}</Text>

                <Text style={styles.programHint}>Tap to choose a program</Text>
              </View>

              <Text style={styles.chevron}>⌄</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Password</Text>

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Create a password (8+ characters)"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />

              <TouchableOpacity
                onPress={() => setShowPassword((previous) => !previous)}
                disabled={loading}
                style={styles.showPasswordButton}
              >
                <Text style={styles.showPasswordText}>
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Confirm password</Text>

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter the password again"
                placeholderTextColor="#94A3B8"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />

              <TouchableOpacity
                onPress={() => setShowConfirmPassword((previous) => !previous)}
                disabled={loading}
                style={styles.showPasswordButton}
              >
                <Text style={styles.showPasswordText}>
                  {showConfirmPassword ? "Hide" : "Show"}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.disabledButton]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitText}>Create Student Account</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
              disabled={loading}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>
            Keep the student's password private and share it directly with the
            student.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={programModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setProgramModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Program</Text>

            <Text style={styles.modalSubtitle}>
              Choose the student's academic program.
            </Text>

            <ScrollView
              style={styles.programList}
              keyboardShouldPersistTaps="handled"
            >
              {PROGRAMS.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.programOption,
                    program === item && styles.selectedProgramOption,
                  ]}
                  onPress={() => {
                    setProgram(item);
                    setProgramModalVisible(false);
                  }}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.programOptionText,
                      program === item && styles.selectedProgramText,
                    ]}
                  >
                    {item}
                  </Text>

                  {program === item && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setProgramModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F8F6",
  },
  passwordContainer: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CBD5D1",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
  passwordInput: {
    flex: 1,
    minWidth: 0,
    minHeight: 46,
    paddingHorizontal: 13,
    color: "#153C2B",
    fontSize: 14,
  },
  showPasswordButton: {
    paddingHorizontal: 13,
    paddingVertical: 12,
  },
  showPasswordText: {
    color: "#176B4A",
    fontSize: 13,
    fontWeight: "700",
  },
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  heading: {
    marginBottom: 22,
  },
  eyebrow: {
    color: "#176B4A",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.3,
    marginBottom: 8,
  },
  title: {
    color: "#153C2B",
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    color: "#64748B",
    fontSize: 14,
    lineHeight: 21,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#DCE8E0",
  },
  label: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 15,
    marginBottom: 8,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#CBD5D1",
    borderRadius: 10,
    paddingHorizontal: 13,
    color: "#153C2B",
    fontSize: 14,
    backgroundColor: "#FFFFFF",
  },
  emailBox: {
    minHeight: 46,
    justifyContent: "center",
    paddingHorizontal: 13,
    borderRadius: 10,
    backgroundColor: "#EAF5EF",
    borderWidth: 1,
    borderColor: "#B8DCC8",
  },
  emailText: {
    color: "#176B4A",
    fontSize: 14,
    fontWeight: "700",
  },
  helper: {
    color: "#64748B",
    fontSize: 11,
    marginTop: 6,
  },
  programButton: {
    minHeight: 58,
    borderWidth: 1,
    borderColor: "#CBD5D1",
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
  },
  programTextContainer: {
    flex: 1,
    paddingRight: 8,
  },
  programText: {
    color: "#153C2B",
    fontSize: 14,
    fontWeight: "600",
  },
  programHint: {
    color: "#64748B",
    fontSize: 11,
    marginTop: 4,
  },
  chevron: {
    color: "#176B4A",
    fontSize: 24,
  },
  submitButton: {
    minHeight: 50,
    backgroundColor: "#176B4A",
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  disabledButton: {
    opacity: 0.65,
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  cancelButton: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  cancelText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  footer: {
    color: "#64748B",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    padding: 22,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    color: "#176B4A",
    fontSize: 20,
    fontWeight: "800",
  },
  modalSubtitle: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 6,
    marginBottom: 14,
  },
  programList: {
    flexGrow: 0,
  },
  programOption: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5EDE8",
  },
  selectedProgramOption: {
    backgroundColor: "#EAF5EF",
    borderRadius: 8,
  },
  programOptionText: {
    flex: 1,
    color: "#334155",
    fontSize: 14,
    paddingRight: 8,
  },
  selectedProgramText: {
    color: "#176B4A",
    fontWeight: "700",
  },
  checkmark: {
    color: "#176B4A",
    fontSize: 18,
    fontWeight: "800",
  },
  modalCancelButton: {
    alignItems: "center",
    paddingVertical: 13,
    marginTop: 8,
  },
  modalCancelText: {
    color: "#176B4A",
    fontSize: 14,
    fontWeight: "700",
  },
});
