import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from "react-native";
import { scale, verticalScale } from "../../utils/responsive";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LogoutModal from "../../components/LogoutModal";

export default function SettingsScreen({ navigation }) {

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleLogout = async () => {
    setLogoutModalVisible(false);
    await AsyncStorage.removeItem("userToken");
    navigation.replace("Login");
  };

  const SettingItem = ({ icon, title, onPress, showSwitch, value, onValueChange, isLogout }) => (
    <TouchableOpacity
      style={[styles.settingItem, { paddingVertical: verticalScale(16) }]}
      onPress={onPress}
      disabled={showSwitch}
    >
      <View style={[styles.iconContainer, { width: scale(40), height: scale(40), borderRadius: scale(10), backgroundColor: isLogout ? "#FEF2F2" : "#F8FAFC" }]}>
        <Feather name={icon} size={scale(20)} color={isLogout ? "#EF4444" : "#1D5FAD"} />
      </View>
      <Text style={[styles.settingTitle, { fontSize: scale(16), marginLeft: scale(15), color: isLogout ? "#EF4444" : "#1E293B" }]}>{title}</Text>

      {showSwitch ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: "#CBD5E1", true: "#1D5FAD" }}
          thumbColor="#FFFFFF"
        />
      ) : (
        <Feather name="chevron-right" size={scale(18)} color="#CBD5E1" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={[styles.header, { height: verticalScale(60), paddingHorizontal: scale(20) }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={scale(24)} color="#1E293B" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: scale(20) }]}>Settings</Text>
        <View style={{ width: scale(24) }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: scale(20), paddingBottom: verticalScale(20) }}
      >
        <View style={{ marginTop: verticalScale(10) }}>
          <SettingItem
            icon="lock"
            title="Change Password"
            onPress={() => navigation.navigate("ChangePassword")}
          />
          <SettingItem
            icon="bell"
            title="Notifications"
            showSwitch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
          <SettingItem
            icon="help-circle"
            title="Help / FAQ"
            onPress={() => navigation.navigate("HelpScreen")}
          />
          <SettingItem
            icon="file-text"
            title="Terms & Conditions"
            onPress={() => navigation.navigate("TermsScreen")}
          />
          <SettingItem
            icon="log-out"
            title="Logout"
            onPress={() => setLogoutModalVisible(true)}
            isLogout
          />
        </View>
      </ScrollView>

      <LogoutModal
        visible={logoutModalVisible}
        onClose={() => setLogoutModalVisible(false)}
        onConfirm={handleLogout}
      />
    </SafeAreaView>
  );
}

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
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  settingTitle: {
    flex: 1,
    fontWeight: "500",
  },
});
