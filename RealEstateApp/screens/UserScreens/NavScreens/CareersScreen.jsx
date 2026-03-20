import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Image,
} from "react-native";
import { scale, verticalScale, width } from "../../../utils/responsive";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE } from "../../../api/api";

const careersData = [
  {
    id: "1",
    title: "Real Estate Manager",
    date: "03-12-2025,08:58:37",
    jobType: "Full Time",
    experience: "4-5 years",
    description: "Real estate manager required for full time position",
  },
  {
    id: "2",
    title: "Real Estate Manager",
    date: "03-12-2025,08:58:37",
    jobType: "Full Time",
    experience: "4-5 years",
    description: "Real estate manager required for full time position",
  },
];

const headerNavItems = [
  { title: "Home", screen: "UserDashboard" },
  { title: "Services", screen: "ServicesScreen" },
  { title: "Careers", screen: "CareersScreen" },
  { title: "Contact Us", screen: "ContactScreen" },
];

export default function CareersScreen({ navigation }) {

  const [activeNav, setActiveNav] = useState("Careers");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [renderMenu, setRenderMenu] = useState(false);

  const slideAnim = useRef(new Animated.Value(-width * 0.7)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  const sideMenuItems = [
    { title: "Home", screen: "HomeScreen", icon: "home-outline", type: "Ionicons" },
    { title: "Message", screen: "ChatScreen", icon: "chatbubble-ellipses-outline", type: "Ionicons" },
    { title: "Properties For Buy", screen: "BuyScreen", icon: "table", type: "MaterialCommunityIcons" },
    { title: "Properties For Rent", screen: "RentScreen", icon: "table", type: "MaterialCommunityIcons" },
    { title: "Property Saved", icon: "package-variant-closed", type: "MaterialCommunityIcons", screen: "SavedScreen" },
    { title: "Contact Admin", screen: "ContactAdminScreen", icon: "chatbubble-outline", type: "Ionicons" },
    { title: "Help", screen: "HelpScreen", icon: "help-circle-outline", type: "Ionicons" },
    { title: "Settings", screen: "SettingsScreen", icon: "settings-outline", type: "Ionicons" },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) return;

        const res = await axios.get(`${API_BASE}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const name = res.data?.name || "";
        const email = res.data?.email || "";
        setUserName(name);
        setUserEmail(email);
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };
    fetchUser();
  }, []);

  const animateMenu = (open) => {
    if (open) setRenderMenu(true);
    Animated.timing(slideAnim, {
      toValue: open ? 0 : -width * 0.7,
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

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      navigation.replace("Login");
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  const renderJobItem = ({ item }) => (
    <View style={[styles.jobCard, { padding: scale(15), marginBottom: verticalScale(15), borderRadius: scale(10) }]}>
      <Text style={[styles.jobTitle, { fontSize: scale(15) }]}>{item.title}</Text>
      <Text style={[styles.jobDate, { fontSize: scale(13), marginVertical: verticalScale(4) }]}>{item.date}</Text>

      <View style={[styles.jobMeta, { marginTop: verticalScale(8) }]}>
        <Text style={[styles.metaText, { fontSize: scale(13) }]}>
          <Text style={styles.metaLabel}>{item.jobType}</Text> | <Text style={styles.metaLabel}>EXP: {item.experience}</Text>
        </Text>
      </View>

      <Text style={[styles.jobDescription, { fontSize: scale(12), marginTop: verticalScale(6) }]}>{item.description}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* Overlay */}
      {renderMenu && (
        <Animated.View
          style={[styles.overlay, { opacity: overlayAnim }]}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => animateMenu(false)}
          />
        </Animated.View>
      )}

      {/* Side Menu */}
      {(menuOpen || renderMenu) && (
        <Animated.View
          style={[styles.sideMenu, { left: slideAnim, width: width * 0.7, backgroundColor: "#FFF" }]}
        >
          <View style={[styles.menuHeader, { paddingVertical: verticalScale(20), paddingHorizontal: scale(20) }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={[styles.menuTitle, { fontSize: scale(26) }]}>Menu</Text>
              <TouchableOpacity style={[styles.closeBtn, { width: scale(40), height: scale(40), borderRadius: scale(20) }]} onPress={() => animateMenu(false)}>
                <Ionicons name="close" size={scale(24)} color="#475569" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: verticalScale(20) }}>
            {sideMenuItems.map((item) => (
              <TouchableOpacity
                key={item.title}
                style={[styles.menuItem, { paddingVertical: verticalScale(14), paddingHorizontal: scale(20) }]}
                onPress={() => {
                  animateMenu(false);
                  setTimeout(() => {
                    navigation.navigate(item.screen);
                  }, 100);
                }}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.itemIconCircle, { width: scale(52), height: scale(52), borderRadius: scale(26) }]}>
                    {item.type === "Ionicons" ? (
                      <Ionicons name={item.icon} size={scale(24)} color="#FFF" />
                    ) : (
                      <MaterialCommunityIcons name={item.icon} size={scale(24)} color="#FFF" />
                    )}
                  </View>
                  <Text style={[styles.menuText, { fontSize: scale(18), marginLeft: scale(18) }]}>{item.title}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={[styles.menuFooter, { paddingHorizontal: scale(20), paddingBottom: verticalScale(30) }]}>
            <TouchableOpacity style={[styles.menuLogoutAction, { borderRadius: scale(12), paddingVertical: verticalScale(14) }]} onPress={handleLogout}>
              <Text style={[styles.logoutText, { fontSize: scale(18) }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Top Bar */}
      <View style={[styles.topBar, { paddingHorizontal: scale(20), paddingTop: verticalScale(10), paddingBottom: verticalScale(10) }]}>
        <TouchableOpacity onPress={() => animateMenu(true)}>
          <Feather name="menu" size={scale(24)} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Feather name="bell" size={scale(24)} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Header Navigation */}
      <View style={styles.headerNav}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: scale(10) }}>
          {headerNavItems.map((item) => (
            <TouchableOpacity
              key={item.title}
              style={[
                styles.navItem,
                activeNav === item.title && styles.navItemActive,
              ]}
              onPress={() => {
                setActiveNav(item.title);
                if (item.screen !== "CareersScreen") {
                  navigation.navigate(item.screen);
                }
              }}
            >
              <Text style={[styles.navText, { fontSize: scale(14) }, activeNav === item.title && styles.navTextActive]}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={{ flex: 1, paddingHorizontal: scale(20), paddingTop: verticalScale(10) }}>
        <FlatList
          data={careersData}
          renderItem={renderJobItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: verticalScale(20) }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerNav: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  navItem: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
  },
  navItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#F28C3D", // Using the brand orange
  },
  navText: {
    fontWeight: "500",
    color: "#4B5563",
  },
  navTextActive: {
    color: "#000",
    fontWeight: "bold",
  },
  jobCard: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  jobTitle: {
    fontWeight: "bold",
    color: "#000",
  },
  jobDate: {
    color: "#2563EB", // Blue color as per design
    fontWeight: "500",
  },
  jobMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    color: "#000",
  },
  metaLabel: {
    fontWeight: "bold",
  },
  jobDescription: {
    color: "#4B5563",
    lineHeight: 18,
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
  sideMenu: {
    position: "absolute",
    top: 0,
    bottom: 0,
    elevation: 10,
    zIndex: 100,
    backgroundColor: "#FFF",
    borderRightWidth: 1.5,
    borderRightColor: "#3B82F6",
    borderStyle: "dashed",
  },
  menuHeader: {
    backgroundColor: "#FFF",
    borderBottomWidth: 1.5,
    borderBottomColor: "#3B82F6",
    borderStyle: "dashed",
  },
  menuTitle: {
    fontWeight: "900",
    color: "#1E293B",
  },
  closeBtn: {
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    width: '100%',
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemIconCircle: {
    backgroundColor: "#1D5FAD",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#1D5FAD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  menuText: {
    color: "#1E293B",
    fontWeight: "600",
  },
  menuFooter: {
    marginTop: 'auto',
  },
  menuLogoutAction: {
    backgroundColor: "#F87171",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});