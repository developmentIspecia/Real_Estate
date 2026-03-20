import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { scale, verticalScale } from "../utils/responsive";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { verifyOtp, setAuthToken, resendOtp } from "../api/api";

export default function OTPVerificationScreen({ route, navigation }) {
  const { email, phone, role, isNewUser, name, isForgotPassword } = route?.params || {};

  const OTP_LENGTH = 6;
  const emptyOtp = Array(OTP_LENGTH).fill("");

  // 'email' | 'phone' — toggle between the two verification modes
  const [verifyMode, setVerifyMode] = useState("email");

  const [otp, setOtp] = useState(emptyOtp);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const inputs = useRef([]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Reset OTP when switching modes
  const switchMode = (mode) => {
    setVerifyMode(mode);
    setOtp(emptyOtp);
    setError("");
    setTimeLeft(600);
    inputs.current[0]?.focus();
  };

  const formatTime = (secs) => {
    const min = Math.floor(secs / 60).toString().padStart(2, "0");
    const sec = (secs % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  };

  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text.length === 1 && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
    if (text.length === 0 && index > 0) {
      inputs.current[index - 1]?.focus();
    }

    // Auto-verify when last digit is entered
    if (index === OTP_LENGTH - 1 && text.length === 1) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleVerify = async (otpValue) => {
    const otpCode = otpValue || otp.join("");
    if (otpCode.length < OTP_LENGTH) {
      setError(`Enter ${OTP_LENGTH}-digit code`);
      return;
    }

    setLoading(true);
    setError("");

    // For forgot password flow: skip verifyOtp (which consumes/deletes the OTP
    // from the backend store). Navigate directly to ResetPasswordScreen — the
    // reset-password backend endpoint will validate the OTP itself.
    if (isForgotPassword) {
      setLoading(false);
      navigation.navigate("ResetPasswordScreen", { email, otp: otpCode });
      return;
    }

    try {
      const res = await verifyOtp({ email, otp: otpCode });

      await AsyncStorage.setItem("userToken", res.token);
      await AsyncStorage.setItem("userRole", res.role);
      setAuthToken(res.token);

      // Route both users and admins to the role-aware UserDashboard which contains the updated UI
      navigation.replace("UserStack", { screen: "UserDashboard" });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setLoading(true);
      await resendOtp(email);
      Alert.alert("Success", "A new code has been sent.");
      setOtp(emptyOtp);
      setTimeLeft(600);
      setError("");
      inputs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  const isPhone = verifyMode === "phone";
  const screenTitle = isPhone ? "Phone Verification" : "Email Verification";

  const screenSubtitle = isPhone
    ? `We sent you a ${OTP_LENGTH}-digit code on your registered mobile number to verify`
    : `We sent you a ${OTP_LENGTH}-digit code on your registered email ID to verify`;

  const toggleLabel = isPhone ? "Email Verification" : "Phone Verification";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { paddingHorizontal: scale(25), paddingTop: verticalScale(35) }]}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={[styles.backButton, { width: scale(40), height: scale(40), marginLeft: scale(-10) }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={scale(24)} color="#1F2937" />
          </TouchableOpacity>

          <Text style={[styles.title, { fontSize: scale(22), marginTop: verticalScale(10) }]}>
            {screenTitle}
          </Text>
          <Text style={[styles.subtitle, { fontSize: scale(14), marginTop: verticalScale(12), lineHeight: scale(20) }]}>
            {screenSubtitle}
          </Text>

          <View style={[styles.otpContainer, { marginTop: verticalScale(20) }]}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputs.current[index] = ref)}
                style={[styles.otpInput, {
                  width: scale(46),
                  height: scale(50),
                  fontSize: scale(18),
                  borderRadius: scale(8),
                  borderColor: "#1D5FAD",
                }]}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
                    inputs.current[index - 1]?.focus();
                  }
                }}
              />
            ))}
          </View>

          {error ? (
            <Text style={[styles.error, { fontSize: scale(13), marginTop: verticalScale(10) }]}>{error}</Text>
          ) : null}

          <View style={[styles.resendContainer, { marginTop: verticalScale(15) }]}>
            {timeLeft > 0 ? (
              <>
                <Text style={[styles.resendText, { fontSize: scale(14) }]}>Resend code in </Text>
                <Text style={[styles.timerText, { fontSize: scale(14) }]}>{formatTime(timeLeft)} sec</Text>
              </>
            ) : (
              <TouchableOpacity onPress={handleResend}>
                <Text style={[styles.timerText, { fontSize: scale(14), textDecorationLine: "underline" }]}>Resend Code</Text>
              </TouchableOpacity>
            )}
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
            style={[styles.verifyButton, { paddingVertical: verticalScale(14), borderRadius: scale(8), marginBottom: verticalScale(15) }]}
            onPress={() => handleVerify()}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={[styles.verifyButtonText, { fontSize: scale(16) }]}>Verify Code</Text>
            )}
          </TouchableOpacity>

          {/* Toggle between Phone and Email verification */}
          <TouchableOpacity
            style={[styles.changeBtn, { alignItems: "center", paddingVertical: verticalScale(12), marginBottom: verticalScale(20) }]}
            onPress={() => switchMode(isPhone ? "email" : "phone")}
          >
            <Text style={[styles.changeBtnText, { fontSize: scale(14) }]}>{toggleLabel}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flexGrow: 1,
  },
  backButton: {
    justifyContent: "center",
  },
  title: {
    fontWeight: "700",
    color: "#000",
  },
  subtitle: {
    color: "#777",
    fontWeight: "400",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  otpInput: {
    borderWidth: 1,
    borderColor: "#DDD",
    textAlign: "center",
    color: "#000",
    backgroundColor: "#FFF",
  },
  resendContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  resendText: {
    color: "#777",
  },
  timerText: {
    color: "#2563EB",
    fontWeight: "600",
  },
  error: {
    color: "#EF4444",
    textAlign: "left",
  },
  spacer: {
    flex: 1,
    // minHeight: 50,
  },
  middleContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  verifyButton: {
    backgroundColor: "#1D5FAD",
    alignItems: "center",
    justifyContent: "center",
  },
  verifyButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  changeBtn: {
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#1D5FAD",
    borderWidth: 1, // Increased slightly for visibility
    borderStyle: "solid", // Explicitly set to solid
    borderRadius: 10,
  },
  changeBtnText: {
    color: "#1D5FAD",
    fontWeight: "600",
  },
});
