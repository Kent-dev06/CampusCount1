import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type LoginScreenProps = {
  onLogin: (name: string, role: "Student" | "Organizer") => void;
};

const green = "#176B4A";
const darkGreen = "#123D2D";
const ink = "#18251F";
const muted = "#77827C";
const border = "#DDE4DF";

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!username.trim()) {
      Alert.alert("School email required", "Please enter your school email");
      return;
    }

    if (!password.trim()) {
      Alert.alert("Password required", "Please enter your password.");
      return;
    }

    try {
      const response = await fetch(
        "https://meanwhile-shall-com-testing.trycloudflare.com/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: username.trim(),
            password: password.trim(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          "Login failed",
          data.message || "Invalid email or password.",
        );
        return;
      }

      onLogin(data.user.name, data.user.role);
    } catch (error) {
      console.error(error);

      Alert.alert(
        "Connection error",
        "Unable to connect to the CampusCount server.",
      );
    }
  };

  const handleFacebookLogin = () => {
    Alert.alert(
      "Facebook Login",
      "Facebook authentication will be connected in a later version.",
    );
  };

  const handleGoogleLogin = () => {
    Alert.alert(
      "Google Login",
      "Google authentication will be connected in a later version.",
    );
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Forgot Password?",
      "Password recovery will be connected in a later version. Please contact your school administrator for assistance.",
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>CampusCount</Text>

            <Text style={styles.subtitle}>
              Sign in to your CampusCount account to access your attendance and
              campus events.
            </Text>
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity
              style={styles.facebookButton}
              activeOpacity={0.8}
              onPress={handleFacebookLogin}
            >
              <Image
                source={require("../../../assets/facebook.png")}
                style={styles.facebookIcon}
                resizeMode="contain"
              />

              <Text style={styles.facebookText}>
                Login with Facebook Account
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.googleButton}
              activeOpacity={0.8}
              onPress={handleGoogleLogin}
            >
              <Image
                source={require("../../../assets/google.png")}
                style={styles.googleIcon}
                resizeMode="contain"
              />

              <Text style={styles.googleText}>Login with Google Account</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />

            <Text style={styles.dividerText}>OR</Text>

            <View style={styles.divider} />
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>School Email</Text>

            <TextInput
              style={styles.input}
              placeholder="username@campus.edu"
              placeholderTextColor="#9AA59F"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />

            <Text style={styles.label}>Password</Text>

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password"
                placeholderTextColor="#9AA59F"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />

              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                <Text style={styles.eyeText}>
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.forgotButton}
              onPress={handleForgotPassword}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              activeOpacity={0.85}
            >
              <Text style={styles.loginButtonText}>Log in</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.helpText}>
            Don't have an account? Please contact your school administrator for
            assistance.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#c7c7c7",
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 22,
    paddingBottom: 60,
  },

  card: {
    width: "100%",
    maxWidth: 460,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#E7ECE9",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },

  header: {
    alignItems: "center",
    marginBottom: 28,
  },

  title: {
    color: darkGreen,
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
  },

  subtitle: {
    color: muted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 10,
    maxWidth: 340,
  },

  socialContainer: {
    gap: 12,
  },

  facebookButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#747775",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  facebookIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },

  facebookText: {
    color: "#18251F",
    fontSize: 14,
    fontWeight: "600",
  },

  googleButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#747775",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },

  googleText: {
    color: "#1F1F1F",
    fontSize: 14,
    fontWeight: "500",
  },

  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#E3E8E5",
  },

  dividerText: {
    color: "#9AA59F",
    fontSize: 12,
    fontWeight: "700",
    marginHorizontal: 12,
  },

  form: {
    gap: 9,
  },

  label: {
    color: ink,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: border,
    borderRadius: 12,
    paddingHorizontal: 15,
    color: ink,
    fontSize: 14,
    backgroundColor: "#FBFCFB",
  },

  passwordContainer: {
    height: 52,
    borderWidth: 1,
    borderColor: border,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FBFCFB",
  },

  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 15,
    color: ink,
    fontSize: 14,
  },

  eyeButton: {
    paddingHorizontal: 14,
    height: "100%",
    justifyContent: "center",
  },

  eyeText: {
    color: green,
    fontSize: 12,
    fontWeight: "800",
  },

  forgotButton: {
    alignSelf: "flex-start",
    marginTop: 2,
    paddingVertical: 4,
  },

  forgotText: {
    color: green,
    fontSize: 13,
    fontWeight: "700",
  },

  loginButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: green,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  helpText: {
    color: muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 22,
  },
});
