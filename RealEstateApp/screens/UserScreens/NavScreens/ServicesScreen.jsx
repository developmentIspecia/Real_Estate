import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  useWindowDimensions,
  FlatList,
  Animated,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather, MaterialCommunityIcons, FontAwesome5, FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE } from "../../../api/api";

const servicesData = [
  {
    id: "1",
    title: "Notaries",
    icon: <FontAwesome5 name="file-contract" size={40} color="#2563EB" />,
    iconType: "FontAwesome5",
  },
  {
    id: "2",
    title: "Construction Companies",
    icon: <MaterialCommunityIcons name="crane" size={40} color="#2563EB" />,
    iconType: "MaterialCommunityIcons",
  },
  {
    id: "3",
    title: "Architects",
    icon: <MaterialCommunityIcons name="math-compass" size={40} color="#2563EB" />,
    iconType: "MaterialCommunityIcons",
  },
  {
    id: "4",
    title: "Real Estate Agencies",
    icon: <MaterialCommunityIcons name="office-building" size={40} color="#2563EB" />,
    iconType: "MaterialCommunityIcons",
  },
  {
    id: "5",
    title: "Real State Promoters",
    icon: <FontAwesome5 name="users" size={35} color="#2563EB" />,
    iconType: "FontAwesome5",
  },
  {
    id: "6",
    title: "Sub Contractors",
    icon: <MaterialCommunityIcons name="account-hard-hat" size={40} color="#2563EB" />,
    iconType: "MaterialCommunityIcons",
  },
  {
    id: "7",
    title: "Banks",
    icon: <FontAwesome name="bank" size={35} color="#2563EB" />,
    iconType: "FontAwesome",
  },
  {
    id: "8",
    title: "Land Surveyors",
    icon: <MaterialCommunityIcons name="map-marker-distance" size={40} color="#2563EB" />,
    iconType: "MaterialCommunityIcons",
  },
];

const headerNavItems = [
  { title: "Home", screen: "UserDashboard" },
  { title: "Services", screen: "ServicesScreen" },
  { title: "Careers", screen: "CareersScreen" },
  { title: "Contact Us", screen: "ContactScreen" },
];

export default function ServicesScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const scale = (size) => (width / 375) * size;
  const verticalScale = (size) => (height / 812) * size;

  const [activeNav, setActiveNav] = useState("Services");
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

  const renderServiceItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.serviceCard, { width: (width - scale(60)) / 2, height: scale(150), marginBottom: scale(20), borderRadius: scale(10) }]}
      activeOpacity={0.7}
    >
      <View style={styles.iconWrapper}>
        {item.icon}
      </View>
      <Text style={[styles.serviceTitle, { fontSize: scale(13) }]}>{item.title}</Text>
    </TouchableOpacity>
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
          <Feather name="menu" size={scale(24)} color="#000000" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Feather name="bell" size={scale(24)} color="#000000" />
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
                if (item.screen !== "ServicesScreen") {
                  navigation.navigate(item.screen);
                }
              }}
            >
              <Text style={[styles.navText, { fontSize: scale(14) }, activeNav === item.title && styles.navTextActive]}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={{ flex: 1, paddingHorizontal: scale(20) }}>
        <Text style={[styles.sectionTitle, { fontSize: scale(18), marginTop: verticalScale(20), marginBottom: verticalScale(20) }]}>Our Services</Text>

        <FlatList
          data={servicesData}
          renderItem={renderServiceItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: verticalScale(40) }}
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
  sectionTitle: {
    fontWeight: "bold",
    color: "#000",
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  serviceCard: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  iconWrapper: {
    marginBottom: 15,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center'
  },
  serviceTitle: {
    fontWeight: "bold",
    color: "#374151",
    textAlign: "center",
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