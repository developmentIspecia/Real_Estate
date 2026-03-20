import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { scale, verticalScale } from "../utils/responsive";
import { api, API_BASE } from "../api/api";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";


export default function AdminDashboardScreen() {

  const navigation = useNavigation();
  const [adminInfo, setAdminInfo] = useState({
    name: "",
    email: "",
    users: 0,
    properties: 0,
  });
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState("Select Property Type");

  const slideAnim = useRef(new Animated.Value(-width * 0.85)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const [renderMenu, setRenderMenu] = useState(false);
  const intervalRef = useRef(null);

  const propertyOptions = ["Lands", "Houses", "Flats", "Others"];

  // ---------------- FETCH ADMIN INFO ----------------
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const t = await AsyncStorage.getItem("userToken");
        if (!t) return navigation.replace("Login");
        setToken(t);

        const res = await api.get("/admin/info", {
          headers: { Authorization: `Bearer ${t}` },
        });

        setAdminInfo({
          name: res.data.name,
          email: res.data.email,
          users: res.data.users,
          properties: res.data.properties,
        });
      } catch (err) {
        console.error("Error fetching admin data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  // ---------------- FETCH MESSAGES ----------------
  useEffect(() => {
    if (!token) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get("/chat", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(res.data);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();
    intervalRef.current = setInterval(fetchMessages, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [token]);

  const groupedMessages = messages.reduce((acc, msg) => {
    if (!acc[msg.userId]) acc[msg.userId] = [];
    acc[msg.userId].push(msg);
    return acc;
  }, {});

  const toggleMenu = (open) => {
    if (open) setRenderMenu(true);
    Animated.timing(slideAnim, {
      toValue: open ? 0 : -width,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      if (!open) setRenderMenu(false);
    });
    Animated.timing(overlayAnim, {
      toValue: open ? 0.5 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setMenuOpen(open);
  };

  if (loading)
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );

  return (
    <View style={{ flex: 1 }}>
      {/* Overlay */}
      {menuOpen && (
        <Animated.View style={[styles.overlay, { opacity: overlayAnim }]}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => toggleMenu(false)} />
        </Animated.View>
      )}

      {/* Side Menu */}
      {(menuOpen || renderMenu) && (
        <Animated.View style={[styles.sideMenu, { left: slideAnim, width: width * 0.85 }]}>
          <View style={styles.menuHeader}>
            <View style={[styles.profileSection, { paddingTop: verticalScale(20), paddingHorizontal: scale(16) }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={[styles.profileCircle, { width: scale(60), height: scale(60), borderRadius: scale(30) }]} />
                  <View style={{ marginLeft: scale(12) }}>
                    <Text style={[styles.menuGreeting, { fontSize: scale(18) }]}>{adminInfo.name || "Admin"}</Text>
                    <Text style={[styles.menuEmailText, { fontSize: scale(12) }]}>{adminInfo.email || "admin@gmail.com"}</Text>
                  </View>
                </View>
                <TouchableOpacity>
                  <Feather name="edit-2" size={scale(20)} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <ScrollView style={{ flex: 1, marginTop: verticalScale(10) }} showsVerticalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.menuItem, { paddingVertical: verticalScale(12), paddingHorizontal: scale(20) }]}
              onPress={() => {
                toggleMenu(false);
                navigation.navigate("UploadProperty");
              }}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name="cloud-upload-outline" size={scale(22)} color="#374151" />
                <Text style={[styles.menuText, { fontSize: scale(14), marginLeft: scale(15) }]}>Upload Property</Text>
              </View>
              <Feather name="chevron-right" size={scale(18)} color="#374151" />
            </TouchableOpacity>
          </ScrollView>

          <View style={[styles.menuFooter, { paddingHorizontal: scale(20), paddingBottom: verticalScale(20) }]}>
            <TouchableOpacity
              style={[styles.menuLogoutAction, { borderRadius: scale(8), paddingVertical: verticalScale(12) }]}
              onPress={async () => {
                await AsyncStorage.removeItem("userToken");
                navigation.replace("Login");
              }}
            >
              <Text style={[styles.logoutBtnText, { fontSize: scale(16) }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Main Content */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.mainHeader}>
          <TouchableOpacity onPress={() => toggleMenu(true)}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <Text style={styles.dashboardTitle}>Welcome to RealEstate App</Text>
        </View>

        <ScrollView style={styles.container}>
          {/* Dropdown */}
          <View style={styles.dropdownContainer}>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setDropdownOpen(!dropdownOpen)}
            >
              <Text style={styles.dropdownText}>{selectedProperty}</Text>
            </TouchableOpacity>

            {dropdownOpen && (
              <View style={styles.dropdownOptions}>
                {propertyOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={styles.dropdownOption}
                    onPress={() => {
                      setSelectedProperty(option);
                      setDropdownOpen(false);

                      // Navigate to respective property type screen
                      if (option === "Lands") {
                        navigation.navigate("LandsScreen");
                      } else if (option === "Flats") {
                        navigation.navigate("FlatsScreen");
                      } else if (option === "Houses") {
                        navigation.navigate("HousesScreen");
                      } else if (option === "Others") {
                        navigation.navigate("OthersScreen");
                      }
                    }}
                  >
                    <Text>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <TouchableOpacity
              style={[styles.card, { backgroundColor: "#E0F2F1" }]}
              onPress={() => navigation.navigate("UserListScreen")}
            >
              <Text style={styles.cardCount}>{adminInfo.users}</Text>
              <Text style={styles.cardTitle}>Registered Users</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.card, { backgroundColor: "#FFF3E0" }]}
              onPress={() => navigation.navigate("UserListScreen")}
            >
              <Text style={styles.cardCount}>{adminInfo.properties}</Text>
              <Text style={styles.cardTitle}>Properties</Text>
            </TouchableOpacity>
          </View>

          {/* Chat Section */}
          <View style={styles.chatContainer}>
            <Text style={styles.chatHeader}>Chat</Text>
            {Object.keys(groupedMessages).length === 0 ? (
              <Text>No messages yet</Text>
            ) : (
              Object.entries(groupedMessages).map(([userId, msgs]) => {
                const lastMsg = msgs[msgs.length - 1];
                return (
                  <TouchableOpacity
                    key={userId}
                    style={styles.previewItem}
                    onPress={() =>
                      navigation.navigate("AdminChatScreen", {
                        userId,
                        userName: lastMsg.userName,
                      })
                    }
                  >
                    <Text style={styles.previewName}>{lastMsg.userName}</Text>
                    <Text numberOfLines={1} style={styles.previewMsg}>
                      {lastMsg.message}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F8FAFC" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  mainHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD54F",
    padding: scale(16),
    paddingTop: verticalScale(35),
  },
  menuIcon: { fontSize: scale(22), fontWeight: "bold", marginRight: scale(10) },
  dashboardTitle: { fontSize: scale(18), fontWeight: "bold" },
  dropdownContainer: { marginVertical: -2 },
  dropdownButton: {
    padding: scale(12),
    backgroundColor: "#FFF",
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: "#CCC",
  },
  dropdownText: { fontSize: scale(16) },
  dropdownOptions: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: scale(8),
    marginTop: verticalScale(2),
  },
  dropdownOption: { padding: scale(12), borderBottomWidth: 1, borderBottomColor: "#EEE" },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  card: { flex: 0.48, padding: scale(20), borderRadius: scale(12), alignItems: "center" },
  cardCount: { fontSize: scale(22), fontWeight: "bold", color: "#1F2937" },
  cardTitle: { fontSize: scale(14), color: "#4B5563", marginTop: verticalScale(4), textAlign: "center" },
  chatContainer: { marginTop: 10 },
  chatHeader: { fontSize: scale(18), fontWeight: "bold", marginBottom: verticalScale(10) },
  previewItem: {
    paddingVertical: verticalScale(10),
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  previewName: { fontWeight: "bold", fontSize: scale(16) },
  previewMsg: { color: "gray", marginTop: verticalScale(2) },
  sideMenu: {
    position: "absolute",
    top: 0,
    bottom: 0,
    backgroundColor: "#FFF",
    zIndex: 10,
  },
  menuHeader: {
    backgroundColor: "#0047FF",
    paddingBottom: verticalScale(20),
  },
  profileSection: {
    flexDirection: 'column',
  },
  profileCircle: {
    backgroundColor: "#E5E7EB",
  },
  menuGreeting: {
    fontWeight: "bold",
    color: "#FFF",
  },
  menuEmailText: {
    color: "#BFDBFE",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuText: {
    color: "#374151",
    fontWeight: "500",
  },
  menuFooter: {
    marginTop: 'auto',
  },
  menuLogoutAction: {
    backgroundColor: "#FF8C33",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutBtnText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 9,
  },
});
