import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  useWindowDimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE } from "../../../api/api";
import CustomAlert from "../../../components/CustomAlert";

export default function ChangePassword({ navigation }) {
  const { width, height } = useWindowDimensions();
  const scale = (size) => (width / 375) * size;
  const verticalScale = (size) => (height / 812) * size;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: "", message: "", onClose: null });

  const showAlert = (title, message, onClose) =>
    setAlertConfig({ visible: true, title, message, onClose: onClose || null });

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showAlert("Error", "Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert("Error", "New passwords do not match");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      await axios.put(
        `${API_BASE}/user/change-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showAlert("Success", "Password changed successfully.", () => navigation.goBack());
    } catch (err) {
      console.error(err);
      showAlert("Error", "Failed to change password. Please check your current password.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => {
          setAlertConfig({ ...alertConfig, visible: false });
          if (alertConfig.onClose) alertConfig.onClose();
        }}
      />

      {/* Header */}
      <View style={[styles.header, { height: verticalScale(60), paddingHorizontal: scale(20) }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={scale(24)} color="#1E293B" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: scale(20) }]}>Change Password</Text>
        <View style={{ width: scale(24) }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: scale(20), paddingTop: verticalScale(20) }}
        >
          {/* Info Badge */}
          <View style={[styles.infoCard, { padding: scale(15), marginBottom: verticalScale(25), borderRadius: scale(10) }]}>
            <Text style={[styles.infoText, { fontSize: scale(14) }]}>
              Please enter your current password and choose a new secure password.
            </Text>
          </View>

          {/* Form Fields */}
          <PasswordInput
            label="Current Password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            showPassword={showCurrent}
            setShowPassword={setShowCurrent}
            placeholder="••••••••"
            scale={scale}
            verticalScale={verticalScale}
          />
          <PasswordInput
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            showPassword={showNew}
            setShowPassword={setShowNew}
            placeholder="••••••••"
            scale={scale}
            verticalScale={verticalScale}
          />
          <PasswordInput
            label="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            showPassword={showConfirm}
            setShowPassword={setShowConfirm}
            placeholder="••••••••"
            scale={scale}
            verticalScale={verticalScale}
          />

          {/* Change Button */}
          {(() => {
            const isFormFilled = currentPassword.trim() && newPassword.trim() && confirmPassword.trim();
            return (
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    paddingVertical: verticalScale(12),
                    borderRadius: scale(10),
                    marginTop: verticalScale(10),
                    backgroundColor: isFormFilled ? "#1D5FAD" : "#94B3D8",
                  },
                ]}
                onPress={handleChangePassword}
              >
                <Text style={[styles.buttonText, { fontSize: scale(16) }]}>Change Password</Text>
              </TouchableOpacity>
            );
          })()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Defined outside ChangePassword so it has a stable reference and doesn't remount on every keystroke
const PasswordInput = ({ label, value, onChangeText, showPassword, setShowPassword, placeholder, scale, verticalScale }) => (
  <View style={[styles.inputContainer, { marginBottom: verticalScale(20) }]}>
    <Text style={[styles.label, { fontSize: scale(14), marginBottom: verticalScale(8) }]}>{label}</Text>
    <View style={[styles.inputWrapper, { height: verticalScale(48), borderRadius: scale(10) }]}>
      <Feather name="lock" size={scale(18)} color="#94A3B8" />
      <TextInput
        style={[styles.input, { fontSize: scale(16), marginLeft: scale(10) }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#CBD5E1"
        secureTextEntry={!showPassword}
      />
      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
        <MaterialCommunityIcons
          name={showPassword ? "eye-lock-open-outline" : "eye-lock-outline"}
          size={scale(18)}
          color="#94A3B8"
        />
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerTitle: {
    fontWeight: "bold",
    color: "#1E293B",
  },
  infoCard: {
    backgroundColor: "#EFF6FF",
  },
  infoText: {
    color: "#1E40AF",
    lineHeight: 20,
  },
  inputContainer: {
    width: "100%",
  },
  label: {
    fontWeight: "bold",
    color: "#64748B",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    color: "#1E293B",
  },
  button: {
    backgroundColor: "#94B3D8", // Matching the light blue-gray tone from the image
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});
