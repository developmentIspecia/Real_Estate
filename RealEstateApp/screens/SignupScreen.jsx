import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  Image,
  Alert,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { signup, setAuthToken } from "../api/api";
import CustomAlert from "../components/CustomAlert";

export default function SignupScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
  });

  // Responsive scaling helpers
  const scale = (size) => (width / 375) * size;
  const verticalScale = (size) => (height / 812) * size;

  const showAlert = (title, message) => {
    setAlertConfig({ visible: true, title, message });
  };

  const handleSignup = async () => {
    if (!fullName || !email || !password || !phoneNumber || !confirmPassword) {
      showAlert("Error", "Please fill all required fields");
      return;
    }

    if (fullName.trim().length < 2) {
      showAlert("Invalid Name", "Please enter your full name");
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      showAlert("Invalid Phone", "Please enter a valid 10-digit phone number");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showAlert("Invalid Email", "Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      showAlert("Invalid Password", "Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      showAlert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await signup({ name: fullName, email, password, phone: phoneNumber });

      if (res.otpRequired) {
        navigation.navigate("OTPVerificationScreen", {
          email: res.email,
          role: res.role,
          isNewUser: true,
          name: fullName,
        });
      } else {
        await AsyncStorage.setItem("userToken", res.token);
        await AsyncStorage.setItem("userRole", res.role);
        // Clear any local favorites from previous sessions
        await AsyncStorage.removeItem("favoriteProperties");
        setAuthToken(res.token);
        navigation.replace(res.role === "admin" ? "AdminStack" : "UserStack", {
          screen: res.role === "admin" ? "AdminDashboard" : "UserDashboard"
        });
      }
    } catch (err) {
      console.error("Signup error:", err.response?.data || err);
      showAlert(
        "Signup failed",
        err.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#1D5FAD", paddingHorizontal: scale(20), paddingVertical: verticalScale(10) }]}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, justifyContent: "center" }}
      >
        <TouchableOpacity
          style={[styles.backButton, { position: "absolute", top: 0, left: 0, width: scale(40), height: scale(40), zIndex: 1 }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={scale(24)} color="#FFFFFF" />
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingVertical: verticalScale(20) }}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={[
              styles.contentBox,
              {
                width: "92%",
                paddingHorizontal: scale(25),
                paddingVertical: verticalScale(25),
                borderRadius: scale(28),
                alignSelf: "center",
                // Removed fixed height: "70%" to prevent squishing when keyboard appears
              }
            ]}
          >
            <View style={[styles.logoContainer, { marginTop: verticalScale(5), marginBottom: verticalScale(5) }]}>
              <Image
                source={require("../assets/logo.png")}
                style={[styles.logo, { width: scale(50), height: scale(50) }]}
                resizeMode="contain"
              />
            </View>

            <View style={{ alignItems: "center", marginBottom: verticalScale(8) }}>
              <Text style={{ color: "#1D5FAD", fontSize: scale(23), fontWeight: "bold", textAlign: "center" }}>
                Create Your New Account
              </Text>
              <Text style={{ color: "#777", fontSize: scale(15), marginTop: verticalScale(5) }}>
                Create a new account
              </Text>
            </View>

            <View style={styles.formContainer}>
              <View style={[styles.inputContainer, { height: verticalScale(50), borderRadius: scale(12), paddingHorizontal: scale(15), marginBottom: verticalScale(10), marginTop: verticalScale(10) }]}>
                <TextInput
                  style={[styles.input, { fontSize: scale(15) }]}
                  placeholder="Full Name"
                  placeholderTextColor="#C7C7CD"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

              <View style={[styles.inputContainer, { height: verticalScale(50), borderRadius: scale(12), paddingHorizontal: scale(15), marginBottom: verticalScale(10) }]}>
                <TextInput
                  style={[styles.input, { fontSize: scale(15) }]}
                  placeholder="Phone Number"
                  placeholderTextColor="#C7C7CD"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={[styles.inputContainer, { height: verticalScale(50), borderRadius: scale(12), paddingHorizontal: scale(15), marginBottom: verticalScale(10) }]}>
                <TextInput
                  style={[styles.input, { fontSize: scale(15) }]}
                  placeholder="Email Address"
                  placeholderTextColor="#C7C7CD"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />

                <MaterialCommunityIcons
                  name={"email-outline"}
                  size={scale(18)}
                  color="#C7C7CD"
                />
              </View>

              <View style={[styles.inputContainer, { height: verticalScale(50), borderRadius: scale(12), paddingHorizontal: scale(15), marginBottom: verticalScale(10) }]}>
                <TextInput
                  style={[styles.input, { fontSize: scale(15) }]}
                  placeholder="Password"
                  placeholderTextColor="#C7C7CD"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <MaterialCommunityIcons
                    name={showPassword ? "eye-lock-open-outline" : "eye-lock-outline"}
                    size={scale(18)}
                    color="#C7C7CD"
                  />
                </TouchableOpacity>
              </View>

              <View style={[styles.inputContainer, { height: verticalScale(50), borderRadius: scale(12), paddingHorizontal: scale(15), marginBottom: verticalScale(10) }]}>
                <TextInput
                  style={[styles.input, { fontSize: scale(15) }]}
                  placeholder="ConfirmPassword"
                  placeholderTextColor="#C7C7CD"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <MaterialCommunityIcons
                    name={showPassword ? "eye-lock-open-outline" : "eye-lock-outline"}
                    size={scale(18)}
                    color="#C7C7CD"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.signupButton, { paddingVertical: verticalScale(12), marginTop: verticalScale(20), marginBottom: verticalScale(10), borderRadius: scale(12) }]}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={[styles.signupButtonText, { fontSize: scale(16) }]}>Register</Text>
              )}
            </TouchableOpacity>

            <View style={{ alignItems: "center", marginBottom: verticalScale(10) }}>
              <Text style={{
                color: "#777", fontSize: scale(14)
                , textAlign: "center",
              }}>
                By Creating an account you agree to the Privacy Policy and to the <Text style={{ color: "#1D5FAD", fontWeight: "bold" }}>terms of use</Text>
              </Text>
            </View>
          </View>
        </ScrollView>
        <CustomAlert
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
        />
      </KeyboardAvoidingView>
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  contentBox: {
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
  },
  logo: {
    // scale via inline styles
  },
  formContainer: {
    // form grouping
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  input: {
    flex: 1,
    color: "#000",
  },
  signupButton: {
    backgroundColor: "#1D5FAD",
    justifyContent: "center",
    alignItems: "center",
  },
  signupButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  socialIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
});
