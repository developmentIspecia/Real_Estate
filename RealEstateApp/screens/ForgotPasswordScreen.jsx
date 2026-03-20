import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  ImageBackground,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { scale, verticalScale } from "../utils/responsive";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { forgotPassword, setAuthToken } from "../api/api";
import CustomAlert from "../components/CustomAlert";

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
  });


  const showAlert = (title, message) => {
    setAlertConfig({ visible: true, title, message });
  };

  const handleForgotPassword = async () => {
    if (!email) {
      showAlert("Error", "Enter your registered email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showAlert("Invalid Email", "Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      showAlert("Success", "OTP sent to your email");
      // Assuming navigation to OTPVerificationScreen or a Reset password screen
      navigation.navigate("OTPVerificationScreen", {
        email: email,
        isForgotPassword: true, // Flag to indicate this is for password reset
      });
    } catch (err) {
      console.error("Forgot password error:", err.response?.data || err);
      showAlert(
        "Error",
        err.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : null}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: scale(20), paddingBottom: verticalScale(20), paddingTop: verticalScale(35) }
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            style={[styles.backButton, { width: scale(30), height: scale(30) }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={scale(24)} color="#1F2937" />
          </TouchableOpacity>
          <View style={{ marginTop: verticalScale(30), marginBottom: verticalScale(30) }}>
            <Text style={[styles.title, { fontSize: scale(25), marginBottom: verticalScale(10) }]}>Forget Password</Text>
            <Text style={[styles.subtitle, { fontSize: scale(15), color: "#777", lineHeight: verticalScale(22) }]}>
              Enable your registered Email ID to reset your password
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={[styles.label, { fontSize: scale(16), marginBottom: verticalScale(8) }]}>Email</Text>
            <View style={[styles.inputContainer, { height: verticalScale(45), borderRadius: scale(10), paddingHorizontal: scale(12) }]}>
              <TextInput
                style={[styles.input, { fontSize: scale(15) }]}
                placeholder="Enter Email"
                placeholderTextColor="#C7C7CD"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={styles.spacer} />

          {/* Middle Section */}
          <View style={styles.middleContent}>
            <ImageBackground
              source={require("../assets/main_image.png")}
              style={{
                width: scale(365),
                height: verticalScale(230),
              }}
              resizeMode="cover"
            />
          </View>

          <TouchableOpacity
            style={[styles.resetPasswordButton, { paddingVertical: verticalScale(12), marginBottom: verticalScale(20), borderRadius: scale(10) }]}
            onPress={handleForgotPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[styles.resetPasswordButtonText, { fontSize: scale(16) }]}>Reset Password</Text>
            )}
          </TouchableOpacity>
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
  scrollContent: {
    flexGrow: 1,
  },
  backButton: {
    justifyContent: "center",
  },
  title: {
    fontWeight: "bold",
    color: "#000",
  },
  subtitle: {
    fontWeight: "400",
  },
  formContainer: {
    // form grouping
  },
  spacer: {
    flex: 1,
    // minHeight: 200, // Ensuring button stays lower
  },
  middleContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  label: {
    fontWeight: "bold",
    color: "#000",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1D5FAD",
  },
  input: {
    flex: 1,
    color: "#000",
  },
  resetPasswordButton: {
    backgroundColor: "#1D5FAD",
    justifyContent: "center",
    alignItems: "center",
  },
  resetPasswordButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});