// UserDashboardScreen.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Image,
  useWindowDimensions,
  ActivityIndicator,
  BackHandler,
  Alert,
  Keyboard,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE } from "../api/api";
import { SafeAreaView } from "react-native-safe-area-context";
import LogoutModal from "../components/LogoutModal";
import ExitAppModal from "../components/ExitAppModal";

import HomeScreen from "./UserScreens/NavScreens/HomeScreen";
import FavoriteScreen from "./UserScreens/NavScreens/FavoriteScreen";
import MessagesScreen from "./UserScreens/NavScreens/MessagesScreen";
import ProfileScreen from "./UserScreens/NavScreens/ProfileScreen";

// Admin Screens
import UsersScreen from "./UserScreens/NavScreens/UsersScreen";

export default function UserDashboardScreen({ navigation, route }) {
  const { width, height } = useWindowDimensions();
  const scale = (size) => (width / 375) * size;
  const verticalScale = (size) => (height / 812) * size;

  const [activeTab, setActiveTab] = useState("Home");
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("user");
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [exitModalVisible, setExitModalVisible] = useState(false);

  useEffect(() => {
    fetchUserData();

    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (activeTab !== "Home") {
          setActiveTab("Home");
          return true; // Prevent default behavior (going back to Auth stack)
        } else {
          setExitModalVisible(true);
          return true; // Prevent default behavior
        }
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription.remove();
    }, [activeTab])
  );

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return navigation.replace("Login");

      const res = await axios.get(`${API_BASE}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUserName(res.data?.name || "User");
      setUserEmail(res.data?.email || "");
      setUserRole(res.data?.role || "user");
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

  const handleLogout = async () => {
    setLogoutModalVisible(false);
    await AsyncStorage.removeItem("userToken");
    navigation.replace("Login");
  };

  const renderFavorites = () => (
    <View style={styles.centerPlaceholder}>
      <Ionicons name="heart-outline" size={scale(60)} color="#ccc" />
      <Text style={[styles.placeholderText, { fontSize: scale(16) }]}>No Favorites Yet</Text>
    </View>
  );

  const renderMessages = () => (
    <View style={styles.centerPlaceholder}>
      <Ionicons name="chatbubble-outline" size={scale(60)} color="#ccc" />
      <Text style={[styles.placeholderText, { fontSize: scale(16) }]}>No Messages Yet</Text>
      <TouchableOpacity
        style={[styles.actionButton, { marginTop: 20 }]}
        onPress={() => navigation.navigate("ChatScreen")}
      >
        <Text style={styles.actionButtonText}>Start Chatting</Text>
      </TouchableOpacity>
    </View>
  );


  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      <View style={{ flex: 1 }}>
        {activeTab === "Home" && <HomeScreen navigation={navigation} route={route} />}

        {/* User Specific Tabs */}
        {userRole === "user" && (
          <>
            {activeTab === "Favorites" && <FavoriteScreen navigation={navigation} />}
            {activeTab === "Messages" && <MessagesScreen navigation={navigation} />}
            {activeTab === "Profile" && <ProfileScreen navigation={navigation} />}
          </>
        )}

        {/* Admin Specific Tabs */}
        {userRole === "admin" && (
          <>
            {activeTab === "Messages" && <MessagesScreen navigation={navigation} />}
            {activeTab === "Users" && <UsersScreen navigation={navigation} />}
          </>
        )}
      </View>


        <View style={[styles.bottomNav, { height: verticalScale(70), paddingBottom: verticalScale(10) }]}>
          {userRole === "user" ? (
            <>
              <TabItem
                label="Home"
                icon={activeTab === "Home" ? "home" : "home-outline"}
                active={activeTab === "Home"}
                onPress={() => setActiveTab("Home")}
                scale={scale}
              />
              <TabItem
                label="Favorites"
                icon={activeTab === "Favorites" ? "heart" : "heart-outline"}
                active={activeTab === "Favorites"}
                onPress={() => setActiveTab("Favorites")}
                scale={scale}
              />
              <TabItem
                label="Messages"
                icon={activeTab === "Messages" ? "chatbubble" : "chatbubble-outline"}
                active={activeTab === "Messages"}
                onPress={() => setActiveTab("Messages")}
                scale={scale}
              />
              <TabItem
                label="Profile"
                icon={activeTab === "Profile" ? "person" : "person-outline"}
                active={activeTab === "Profile"}
                onPress={() => setActiveTab("Profile")}
                scale={scale}
              />
            </>
          ) : (
            <>
              <TabItem
                label="Home"
                icon={activeTab === "Home" ? "home" : "home-outline"}
                active={activeTab === "Home"}
                onPress={() => setActiveTab("Home")}
                scale={scale}
              />
              <TabItem
                label="Messages"
                icon={activeTab === "Messages" ? "chatbubble" : "chatbubble-outline"}
                active={activeTab === "Messages"}
                onPress={() => setActiveTab("Messages")}
                scale={scale}
              />
              <TabItem
                label="Users"
                icon={activeTab === "Users" ? "people" : "people-outline"}
                active={activeTab === "Users"}
                onPress={() => setActiveTab("Users")}
                scale={scale}
              />
            </>
          )}
        </View>

      <LogoutModal
        visible={logoutModalVisible}
        onClose={() => setLogoutModalVisible(false)}
        onConfirm={handleLogout}
      />

      <ExitAppModal
        visible={exitModalVisible}
        onClose={() => setExitModalVisible(false)}
        onConfirm={() => BackHandler.exitApp()}
      />
    </View>
  );
}

const TabItem = ({ label, icon, active, onPress, scale }) => (
  <TouchableOpacity style={styles.tabItem} onPress={onPress}>
    <Ionicons name={icon} size={scale(24)} color={active ? "#1D5FAD" : "#94A3B8"} />
    <Text style={[styles.tabLabel, { fontSize: scale(12), color: active ? "#1D5FAD" : "#94A3B8" }]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  greeting: { color: "#64748B" },
  userName: { fontWeight: "bold", color: "#1E293B" },
  sectionTitle: { fontWeight: "bold", color: "#1E293B" },
  propertyCard: { backgroundColor: "#FFF", borderRadius: 12, overflow: "hidden", elevation: 2, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  propertyImage: { width: "100%" },
  propertyInfo: { padding: 12 },
  propTitle: { fontWeight: "bold", color: "#1E293B" },
  propPrice: { color: "#1D5FAD", fontWeight: "bold", marginTop: 4 },
  propLoc: { color: "#64748B", marginTop: 4 },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    justifyContent: "space-around",
    alignItems: "center",
  },
  tabItem: { alignItems: "center", justifyContent: "center" },
  tabLabel: { marginTop: 4, fontWeight: "500" },
  centerPlaceholder: { flex: 1, justifyContent: "center", alignItems: "center" },
  placeholderText: { color: "#94A3B8", marginTop: 10 },
  actionButton: { backgroundColor: "#1D5FAD", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  actionButtonText: { color: "#FFF", fontWeight: "bold" },
  profileHeader: { alignItems: "center", marginTop: 20 },
  profilePic: { backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center" },
  profileName: { fontWeight: "bold", color: "#1E293B", marginTop: 15 },
  profileEmail: { color: "#64748B", marginTop: 4 },
  profileItem: { flexDirection: "row", alignItems: "center", paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  profileItemText: { flex: 1, marginLeft: 15, fontSize: 16, color: "#1E293B" },
});
