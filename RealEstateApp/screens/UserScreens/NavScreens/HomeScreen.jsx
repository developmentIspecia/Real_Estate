import React, { useEffect, useRef, useState, useCallback } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions,
    ScrollView,
    Image,
    TextInput,
    Modal,
} from "react-native";
import { scale, verticalScale, SCREEN_WIDTH as width } from "../../../utils/responsive";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE } from "../../../api/api"; // Corrected path
import LogoutModal from "../../../components/LogoutModal";
import socket from "../../../socket/socket";

const headerNavItems = [
    { title: "All" },
    { title: "House" },
    { title: "Flat" },
    { title: "Land" },
];

export default function HomeScreen({ navigation, route }) {

    const [userName, setUserName] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const [displayMode, setDisplayMode] = useState("light");
    const [properties, setProperties] = useState([]);
    const [activeNav, setActiveNav] = useState("All");
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [propertyToDelete, setPropertyToDelete] = useState(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [savedProperties, setSavedProperties] = useState([]);
    const [likedProperties, setLikedProperties] = useState([]);
    const [logoutModalVisible, setLogoutModalVisible] = useState(false);

    const slideAnim = useRef(new Animated.Value(-width * 0.7)).current;
    const overlayAnim = useRef(new Animated.Value(0)).current;

    const [userEmail, setUserEmail] = useState("");
    const [userRole, setUserRole] = useState("user");
    const [renderMenu, setRenderMenu] = useState(false);

    const sideMenuItems = [
        ...(userRole === "admin" ? [{ title: "Admin Actions", screen: "AdminActionsScreen", icon: "settings", type: "Feather" }] : []),
        { title: "Services", screen: "ServicesScreen", icon: "briefcase", type: "Feather" },
        { title: "Contact Us", screen: "ContactScreen", icon: "mail", type: "Feather" },
        { title: "Help / FAQ", screen: "HelpScreen", icon: "help-circle", type: "Feather" },
    ];

    useFocusEffect(
        useCallback(() => {
            loadLikedProperties();
        }, [])
    );

    const loadLikedProperties = async () => {
        try {
            const storedFavs = await AsyncStorage.getItem("favoriteProperties");
            if (storedFavs) {
                setLikedProperties(JSON.parse(storedFavs));
            } else {
                setLikedProperties([]);
            }
        } catch (error) {
            console.error("Error loading liked properties:", error);
        }
    };

    const toggleLikeProperty = async (id) => {
        try {
            const storedFavs = await AsyncStorage.getItem("favoriteProperties");
            let favsArray = storedFavs ? JSON.parse(storedFavs) : [];

            if (favsArray.includes(id)) {
                favsArray = favsArray.filter((propId) => propId !== id);
            } else {
                favsArray.push(id);
            }

            await AsyncStorage.setItem("favoriteProperties", JSON.stringify(favsArray));
            setLikedProperties(favsArray);
        } catch (error) {
            console.error("Error toggling like property:", error);
        }
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = await AsyncStorage.getItem("userToken");
                if (!token) return navigation.replace("Login");

                const res = await axios.get(`${API_BASE}/user/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const name = res.data?.name || "";
                const email = res.data?.email || "";
                const role = res.data?.role || "user";
                setUserName(name || "User");
                setUserEmail(email || "user@gmail.com");
                setUserRole(role);
            } catch (err) {
                console.error("Error fetching user:", err);
            }
        };

        fetchUser();
        fetchProperties();

        const loadMode = async () => {
            const savedMode = await AsyncStorage.getItem("displayMode");
            if (savedMode === "dark" || savedMode === "light") setDisplayMode(savedMode);
        };
        loadMode();
    }, []);

    useEffect(() => {
        // Update menu position if closed and screen width changes (e.g., rotation)
        if (!menuOpen) {
            slideAnim.setValue(-width * 0.7);
        }
    }, [width]);
    useEffect(() => {
        const filters = route?.params?.filters;
        if (filters?.propertyType) {
            // Check if it's one of our standard tabs
            const matchedTab = headerNavItems.find(
                item => item.title.toLowerCase() === filters.propertyType.toLowerCase()
            );
            if (matchedTab) {
                setActiveNav(matchedTab.title);
            }
        }
    }, [route?.params?.filters]);

    const handleLogout = async () => {
        setLogoutModalVisible(false);
        await AsyncStorage.removeItem("userToken");
        navigation.replace("Login");
    };

    useEffect(() => {
        // 🎧 Socket Listeners for Real-time Updates
        socket.on("propertyAdded", (newProp) => {
            const processedProp = {
                ...newProp,
                images: newProp.images && newProp.images.length > 0
                    ? newProp.images.filter(img => img && typeof img === "string" && img.startsWith("http"))
                    : []
            };
            setProperties((prev) => [processedProp, ...prev]);
        });

        socket.on("propertyUpdated", (updatedProp) => {
            const processedProp = {
                ...updatedProp,
                images: updatedProp.images && updatedProp.images.length > 0
                    ? updatedProp.images.filter(img => img && typeof img === "string" && img.startsWith("http"))
                    : []
            };
            setProperties((prev) =>
                prev.map((p) => (p._id === updatedProp._id ? processedProp : p))
            );
        });

        socket.on("propertyDeleted", (propertyId) => {
            setProperties((prev) => prev.filter((p) => p._id !== propertyId));
        });

        return () => {
            socket.off("propertyAdded");
            socket.off("propertyUpdated");
            socket.off("propertyDeleted");
        };
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

    const fetchProperties = async () => {
        try {
            const token = await AsyncStorage.getItem("userToken");
            if (!token) return;

            const res = await axios.get(`${API_BASE}/properties`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const propsWithImage = res.data.map((p) => ({
                ...p,
                images:
                    p.images && p.images.length > 0
                        ? p.images
                            .filter((img) => img && typeof img === "string" && img.startsWith("http"))
                        : [],
            }));

            setProperties(propsWithImage);
        } catch (err) {
            console.error("Failed to fetch properties:", err);
        }
    };

    const filteredProperties = properties.filter((prop) => {
        // Filter by category tab
        if (activeNav !== "All") {
            const propCat = (prop.category || "").toLowerCase();
            const navCat = activeNav.toLowerCase();
            if (!propCat.includes(navCat) && propCat !== navCat) {
                return false;
            }
        }

        // Filter by search query
        const query = searchQuery ? searchQuery.toLowerCase() : "";
        if (query) {
            const titleMatch = prop.title && prop.title.toLowerCase().includes(query);
            const catMatch = prop.category && prop.category.toLowerCase().includes(query);
            const locMatch = prop.location && prop.location.toLowerCase().includes(query);
            if (!(titleMatch || catMatch || locMatch)) return false;
        }

        // Filter by advanced search filters
        const filters = route?.params?.filters;
        if (filters) {
            const { propertyType, minPrice, maxPrice, location } = filters;

            // Property Type check
            const pCat = (prop.category || "").toLowerCase();
            const fType = propertyType ? propertyType.toLowerCase() : "";
            if (fType && fType !== "all" && !pCat.includes(fType) && pCat !== fType) {
                return false;
            }

            // Price check
            let pPrice = prop.price;
            if (typeof pPrice === 'string') {
                pPrice = parseFloat(pPrice.replace(/[$,\s]/g, ''));
            }
            const minMatch = minPrice === undefined || pPrice >= minPrice;
            const maxMatch = maxPrice === undefined || pPrice <= maxPrice;
            if (!minMatch || !maxMatch) return false;

            // Location check
            const searchLoc = (location || "").trim().toLowerCase();
            if (searchLoc && !(prop.location && prop.location.toLowerCase().includes(searchLoc))) {
                return false;
            }
        }

        return true;
    });

    const renderUserUI = () => (
        <>
            {/* Top Bar */}
            <View style={[styles.topBar, { paddingHorizontal: scale(10), paddingTop: 0, paddingBottom: verticalScale(5) }]}>
                <TouchableOpacity onPress={() => animateMenu(true)}>
                    <Feather name="menu" size={scale(24)} color="#000" />
                </TouchableOpacity>

                <View style={[styles.searchRow, { flex: 1, marginHorizontal: scale(10) }]}>
                    <View style={[styles.searchContainer, { height: verticalScale(38), borderRadius: scale(12), paddingHorizontal: scale(15) }]}>
                        <View>
                            <Feather name="search" size={scale(20)} color="#1D5FAD" style={{ marginRight: scale(5) }} />
                        </View>
                        <TextInput
                            style={[styles.searchInput, { fontSize: scale(15) }]}
                            placeholder="Search Properties..."
                            placeholderTextColor="#94A3B8"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                    <TouchableOpacity
                        style={[
                            styles.filterButton,
                            {
                                width: verticalScale(38),
                                height: verticalScale(38),
                                marginLeft: scale(10),
                                borderRadius: scale(12),
                            },
                        ]}
                        onPress={() => navigation.navigate("SearchFilterScreen", { returnTo: "UserDashboard" })}
                    >
                        <Ionicons
                            name="options-outline"
                            size={scale(22)}
                            color="#FFF"
                        />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => navigation.navigate("NotificationScreen")}>
                    <Feather name="bell" size={scale(24)} color="#1D5FAD" />
                </TouchableOpacity>
            </View>

            {/* Header Navigation */}
            <View style={[styles.headerNav, { paddingVertical: verticalScale(5) }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: scale(15) }}>
                    {headerNavItems.map((item) => (
                        <TouchableOpacity
                            key={item.title}
                            style={[
                                styles.navItem,
                                { borderRadius: scale(20), paddingHorizontal: scale(20), paddingVertical: verticalScale(8), marginRight: scale(10) },
                                activeNav === item.title && styles.navItemActive,
                            ]}
                            onPress={() => setActiveNav(item.title)}
                        >
                            <Text style={[styles.navText, { fontSize: scale(14) }, activeNav === item.title && styles.navTextActive]}>{item.title}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: scale(20), paddingBottom: verticalScale(120) }} showsVerticalScrollIndicator={false}>
                <Text style={[styles.sectionTitle, { fontSize: scale(18), marginBottom: verticalScale(15), marginTop: verticalScale(10) }]}>Top Property</Text>

                {filteredProperties.length === 0 ? (
                    <Text style={[styles.welcomeText, { fontSize: scale(14), marginTop: verticalScale(40) }]}>No properties found.</Text>
                ) : (
                    filteredProperties.map((prop) => (
                        <View key={prop._id} style={[styles.propertyCard, { borderRadius: scale(12), marginBottom: verticalScale(20) }]}>
                            <View style={[styles.imageContainer, { height: verticalScale(200) }]}>
                                {prop.images && prop.images.length > 0 ? (
                                    <Image source={{ uri: prop.images[0] }} style={styles.propertyImage} resizeMode="cover" />
                                ) : (
                                    <View style={[styles.propertyImage, { justifyContent: "center", alignItems: "center", backgroundColor: '#e5e7eb' }]}>
                                        <Text style={{ color: "#888", fontSize: scale(14) }}>No Image</Text>
                                    </View>
                                )}

                                {/* Floating Like Icon */}
                                <TouchableOpacity
                                    style={[
                                        styles.heartIconContainer,
                                        {
                                            top: scale(12),
                                            right: scale(12),
                                            width: scale(36),
                                            height: scale(36),
                                            borderRadius: scale(18),
                                        },
                                    ]}
                                    onPress={() => toggleLikeProperty(prop._id)}
                                >
                                    <Ionicons
                                        name={likedProperties.includes(prop._id) ? "heart" : "heart-outline"}
                                        size={scale(20)}
                                        color={likedProperties.includes(prop._id) ? "#EF4444" : "#4B5563"}
                                    />
                                </TouchableOpacity>
                            </View>

                            <View style={[styles.cardContent, { padding: scale(15) }]}>
                                <View style={styles.cardHeaderRow}>
                                    <Text style={[styles.categoryText, { fontSize: scale(12) }]}>{prop.category || "Residential"}</Text>
                                    <Text style={[styles.subtitleText, { fontSize: scale(12) }]}>Modern Living</Text>
                                </View>
                                <View style={[styles.cardHeaderRow, { marginTop: verticalScale(8) }]}>
                                    <Text style={[styles.propertyTitle, { fontSize: scale(16), flex: 1 }]}>{prop.title || "Demo House"}</Text>
                                    <Text style={[styles.priceText, { fontSize: scale(16) }]}>{prop.price || "$0"}</Text>
                                </View>
                                <View style={[styles.cardDivider, { marginVertical: verticalScale(12) }]} />
                                <View style={styles.cardFooterRow}>
                                    <Text style={[styles.propLoc, { fontSize: scale(12), flex: 1 }]}>
                                        <Ionicons name="location-outline" size={scale(14)} /> {prop.location || "Unknown"}
                                    </Text>
                                    <TouchableOpacity onPress={() => navigation.navigate("PropertyDetailsScreen", { property: prop })}>
                                        <Text style={[styles.seeMoreText, { fontSize: scale(14) }]}>Details</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </>
    );

    const renderAdminUI = () => (
        <>
            {/* Admin Header */}
            <View style={[styles.adminHeader, { paddingHorizontal: scale(20), paddingTop: verticalScale(10), paddingBottom: verticalScale(25), borderBottomLeftRadius: scale(20), borderBottomRightRadius: scale(20) }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.adminTitle, { fontSize: scale(22) }]}>Admin Dashboard</Text>
                        <Text style={[styles.adminSubTitle, { fontSize: scale(14) }]}>{properties.length} Properties</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate("ProfileScreen")}>
                        <Feather name="user" size={scale(24)} color="#FFF" />
                    </TouchableOpacity>
                </View>

                <View style={[styles.adminSearchContainer, { marginTop: verticalScale(20), height: verticalScale(45), borderRadius: scale(12), paddingHorizontal: scale(15) }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <Feather name="search" size={scale(20)} color="#94A3B8" />
                        <TextInput
                            style={[styles.adminSearchInput, { flex: 1, paddingVertical: 0, fontSize: scale(15), marginLeft: scale(10) }]}
                            placeholder="Search Properties..."
                            placeholderTextColor="#94A3B8"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                    <TouchableOpacity
                        style={[styles.adminFilterBtn, { marginLeft: scale(10) }]}
                        onPress={() => navigation.navigate("SearchFilterScreen", { returnTo: "UserDashboard" })}
                    >
                        <Ionicons name="options-outline" size={scale(22)} color="#1D5FAD" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Admin Tabs */}
            <View style={[styles.adminTabs, { paddingVertical: verticalScale(15) }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: scale(15) }}>
                    {headerNavItems.map((item) => (
                        <TouchableOpacity
                            key={item.title}
                            style={[
                                styles.adminTabItem,
                                { borderRadius: scale(20), paddingHorizontal: scale(20), paddingVertical: verticalScale(8), marginRight: scale(10) },
                                activeNav === item.title && styles.adminTabActive,
                            ]}
                            onPress={() => setActiveNav(item.title)}
                        >
                            <Text style={[styles.adminTabText, { fontSize: scale(14) }, activeNav === item.title && styles.adminTabTextActive]}>{item.title}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: scale(20), paddingBottom: verticalScale(120) }} showsVerticalScrollIndicator={false}>
                <TouchableOpacity
                    style={[styles.uploadBtn, { paddingVertical: verticalScale(10), borderRadius: scale(12), marginBottom: verticalScale(20) }]}
                    onPress={() => navigation.navigate("UploadProperty")}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="add" size={scale(24)} color="#FFF" />
                        <Text style={[styles.uploadBtnText, { fontSize: scale(16), marginLeft: scale(8) }]}>Upload New Property</Text>
                    </View>
                </TouchableOpacity>

                {filteredProperties.length === 0 ? (
                    <Text style={[styles.welcomeText, { fontSize: scale(14), marginTop: verticalScale(40) }]}>No properties found.</Text>
                ) : (
                    filteredProperties.map((prop) => (
                        <View key={prop._id} style={[styles.adminPropertyCard, { borderRadius: scale(12), marginBottom: verticalScale(20) }]}>
                            <View style={[styles.adminImageContainer, { height: verticalScale(200) }]}>
                                {prop.images && prop.images.length > 0 ? (
                                    <Image source={{ uri: prop.images[0] }} style={styles.adminPropertyImage} resizeMode="cover" />
                                ) : (
                                    <View style={[styles.adminPropertyImage, { justifyContent: "center", alignItems: "center", backgroundColor: '#e5e7eb' }]}>
                                        <Text style={{ color: "#888", fontSize: scale(14) }}>No Image</Text>
                                    </View>
                                )}
                            </View>

                            <View style={[styles.adminCardContent, { padding: scale(15) }]}>
                                <Text style={[styles.adminPropTitle, { fontSize: scale(18) }]}>{prop.title || "Modern Villa in Beverly Hills"}</Text>
                                <Text style={[styles.adminPropLoc, { fontSize: scale(14), marginTop: verticalScale(4) }]}>{prop.location || "Beverly Hills, CA"}</Text>

                                <View style={{ flexDirection: 'row', marginTop: verticalScale(8), alignItems: 'center' }}>
                                    <Text style={[styles.adminPropDetail, { fontSize: scale(14) }]}>{prop.beds || 5} Beds</Text>
                                    <View style={styles.detailDot} />
                                    <Text style={[styles.adminPropDetail, { fontSize: scale(14) }]}>{prop.baths || 4} Baths</Text>
                                    <View style={styles.detailDot} />
                                    <Text style={[styles.adminPropDetail, { fontSize: scale(14) }]}>{prop.sqft || "4,500"} sqft</Text>
                                </View>

                                <View style={[styles.adminCardFooter, { marginTop: verticalScale(15) }]}>
                                    <Text style={[styles.adminPrice, { fontSize: scale(18) }]}>{prop.price || "$4,250,000"}</Text>
                                    <View style={{ flexDirection: 'row' }}>
                                        <TouchableOpacity style={[styles.adminEditBtn, { paddingHorizontal: scale(12), paddingVertical: verticalScale(6), borderRadius: scale(8) }]} onPress={() => navigation.navigate("EditProperty", { property: prop })}>
                                            <MaterialCommunityIcons name="pencil-outline" size={scale(18)} color="#1D5FAD" />
                                            <Text style={[styles.adminEditBtnText, { fontSize: scale(14), marginLeft: scale(4) }]}>Edit</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.adminDeleteBtn, { paddingHorizontal: scale(12), paddingVertical: verticalScale(6), borderRadius: scale(8), marginLeft: scale(10) }]}
                                            onPress={() => {
                                                setPropertyToDelete(prop);
                                                setDeleteModalVisible(true);
                                            }}
                                        >
                                            <Ionicons name="trash-outline" size={scale(18)} color="#EF4444" />
                                            <Text style={[styles.adminDeleteBtnText, { fontSize: scale(14), marginLeft: scale(4) }]}>Delete</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </>
    );

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: userRole === 'admin' ? "#1D5FAD" : "#FFFFFF" }]}
            edges={userRole === 'admin' ? ['top', 'left', 'right'] : undefined}
        >
            <StatusBar barStyle={userRole === 'admin' ? "light-content" : "dark-content"} backgroundColor={userRole === 'admin' ? "#1D5FAD" : "#FFFFFF"} />
            <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>

                {/* Overlay */}
                {renderMenu && (
                    <Animated.View style={[styles.overlay, { opacity: overlayAnim }]}>
                        <TouchableOpacity style={{ flex: 1 }} onPress={() => animateMenu(false)} />
                    </Animated.View>
                )}

                {/* Delete Confirmation Modal */}
                <Modal
                    transparent={true}
                    visible={deleteModalVisible}
                    animationType="fade"
                    onRequestClose={() => setDeleteModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.deleteModalContent}>
                            <Text style={styles.deleteModalTitle}>Delete Property?</Text>
                            <Text style={styles.deleteModalMessage}>
                                Are you sure you want to delete this property? This action cannot be undone and will permanently remove the property from your listings.
                            </Text>
                            <View style={styles.deleteModalButtons}>
                                <TouchableOpacity
                                    style={styles.cancelBtn}
                                    onPress={() => setDeleteModalVisible(false)}
                                >
                                    <Text style={styles.cancelBtnText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.confirmDeleteBtn}
                                    onPress={async () => {
                                        if (propertyToDelete) {
                                            try {
                                                const token = await AsyncStorage.getItem("userToken");
                                                await axios.delete(`${API_BASE}/properties/${propertyToDelete._id}`, { headers: { Authorization: `Bearer ${token}` } });
                                                setDeleteModalVisible(false);
                                                fetchProperties();
                                            } catch (err) {
                                                console.error("Delete failed", err);
                                                Alert.alert("Error", "Failed to delete property.");
                                            }
                                        }
                                    }}
                                >
                                    <Text style={styles.confirmDeleteBtnText}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Side Menu */}
                {(menuOpen || renderMenu) && (
                    <Animated.View
                        style={[styles.sideMenu, { left: slideAnim, width: width * 0.7 }]}
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
                                        if (item.screen === "HomeScreen") {
                                            setActiveNav("All");
                                        } else if (item.screen !== "ServicesScreen" && item.screen !== "ContactScreen") {
                                            // Use setTimeout to ensure navigation happens after the menu state starts updating
                                            setTimeout(() => {
                                                navigation.navigate(item.screen);
                                            }, 100);
                                        }
                                    }}
                                >
                                    <View style={styles.menuItemLeft}>
                                        <View style={[styles.itemIconCircle, { width: scale(52), height: scale(52), borderRadius: scale(26) }]}>
                                            {item.type === "Ionicons" ? (
                                                <Ionicons name={item.icon} size={scale(24)} color="#FFF" />
                                            ) : item.type === "Feather" ? (
                                                <Feather name={item.icon} size={scale(24)} color="#FFF" />
                                            ) : (
                                                <MaterialCommunityIcons name={item.icon} size={scale(24)} color="#FFF" />
                                            )}
                                        </View>
                                        <Text style={[styles.menuText, { fontSize: scale(18), marginLeft: scale(18) }]}>{item.title}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}

                            {/* Space for Logout */}
                            <View style={{ height: verticalScale(40) }} />
                        </ScrollView>

                        <View style={[styles.menuFooter, { paddingHorizontal: scale(20), paddingBottom: verticalScale(30) }]}>
                            <TouchableOpacity style={[styles.menuLogoutAction, { borderRadius: scale(10), paddingVertical: verticalScale(12) }]} onPress={() => setLogoutModalVisible(true)}>
                                <Text style={[styles.logoutText, { fontSize: scale(16) }]}>Logout</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                )}

                {userRole === 'admin' ? renderAdminUI() : renderUserUI()}

                <LogoutModal
                    visible={logoutModalVisible}
                    onClose={() => setLogoutModalVisible(false)}
                    onConfirm={handleLogout}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FFF" },
    topBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#FFFFFF",
    },
    headerNav: {
        flexDirection: "row",
    },
    navItem: {
        backgroundColor: "#F3F4F6",
    },
    navItemActive: {
        backgroundColor: "#1D5FAD",
    },
    navText: {
        fontWeight: "500",
        color: "#6B7280",
    },
    navTextActive: {
        color: "#FFFFFF",
        fontWeight: "bold",
    },
    searchContainer: {
        flex: 1,
        flexDirection: "row-reverse",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    filterButton: {
        backgroundColor: "#1D5FAD",
        justifyContent: "center",
        alignItems: "center",
    },
    searchRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    searchInput: {
        flex: 1,
        color: "#1E293B",
        paddingVertical: 0,
    },
    sectionTitle: {
        fontWeight: "bold",
        color: "#1F2937",
    },
    propertyCard: {
        backgroundColor: "#FFF",
        borderWidth: 1,
        borderColor: "#F3F4F6",
        overflow: "hidden",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: verticalScale(2) },
        shadowOpacity: 0.1,
        shadowRadius: scale(4),
    },
    imageContainer: {
        width: "100%",
    },
    propertyImage: {
        width: "100%",
        height: "100%",
    },
    heartIconContainer: {
        position: "absolute",
        backgroundColor: "#FFF",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
    },
    cardContent: {
        backgroundColor: "#FFF",
    },
    cardHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    categoryText: {
        color: "#1D5FAD",
        fontWeight: "600",
    },
    subtitleText: {
        color: "#9CA3AF",
    },
    propertyTitle: {
        fontWeight: "bold",
        color: "#1F2937",
    },
    priceText: {
        fontWeight: "bold",
        color: "#1D5FAD",
    },
    cardDivider: {
        height: 1,
        backgroundColor: "#F3F4F6",
    },
    cardFooterRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    propLoc: {
        color: "#6B7280",
    },
    seeMoreText: {
        color: "#1D5FAD",
        fontWeight: "700",
    },
    sideMenu: {
        position: "absolute",
        top: 0,
        bottom: 0,
        elevation: 10,
        zIndex: 100,
        backgroundColor: "#FFF",
    },
    menuHeader: {
        backgroundColor: "#FFF",
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
        shadowOffset: { width: 0, height: verticalScale(4) },
        shadowOpacity: 0.2,
        shadowRadius: scale(5),
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
        backgroundColor: "#1D5FAD",
        alignItems: "center",
        justifyContent: "center",
    },
    logoutText: {
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
        zIndex: 50,
    },
    welcomeText: { textAlign: "center", color: "#6B7280" },
    // Admin Styles
    adminHeader: {
        backgroundColor: "#1D5FAD",
    },
    adminTitle: {
        color: "#FFF",
        fontWeight: "bold",
    },
    adminSubTitle: {
        color: "rgba(255,255,255,0.8)",
        marginTop: verticalScale(4),
    },
    adminSearchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF",
    },
    adminSearchInput: {
        flex: 1,
        color: "#1E293B",
    },
    adminFilterBtn: {
        padding: scale(4),
    },
    adminTabs: {},
    adminTabItem: {
        backgroundColor: "#F3F4F6",
    },
    adminTabActive: {
        backgroundColor: "#1D5FAD",
    },
    adminTabText: {
        color: "#6B7280",
        fontWeight: "500",
    },
    adminTabTextActive: {
        color: "#FFF",
        fontWeight: "bold",
    },
    uploadBtn: {
        backgroundColor: "#1D5FAD",
        alignItems: "center",
        justifyContent: "center",
    },
    uploadBtnText: {
        color: "#FFF",
        fontWeight: "bold",
    },
    adminPropertyCard: {
        backgroundColor: "#FFF",
        borderWidth: 1,
        borderColor: "#F3F4F6",
        overflow: "hidden",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: verticalScale(1) },
        shadowOpacity: 0.1,
        shadowRadius: scale(2),
    },
    adminImageContainer: {
        width: "100%",
    },
    adminPropertyImage: {
        width: "100%",
        height: "100%",
    },
    adminCardContent: {},
    adminPropTitle: {
        fontWeight: "bold",
        color: "#1F2937",
    },
    adminPropLoc: {
        color: "#6B7280",
    },
    adminPropDetail: {
        color: "#4B5563",
    },
    detailDot: {
        width: scale(4),
        height: scale(4),
        borderRadius: scale(2),
        backgroundColor: "#D1D5DB",
        marginHorizontal: scale(8),
    },
    adminCardFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: "#F3F4F6",
        paddingTop: verticalScale(12),
    },
    adminPrice: {
        fontWeight: "bold",
        color: "#1D5FAD",
    },
    adminEditBtn: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#1D5FAD",
    },
    adminEditBtnText: {
        color: "#1D5FAD",
        fontWeight: "600",
    },
    adminDeleteBtn: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#EF4444",
    },
    adminDeleteBtnText: {
        color: "#EF4444",
        fontWeight: "600",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: scale(20),
    },
    deleteModalContent: {
        backgroundColor: "#FFF",
        width: "100%",
        borderRadius: scale(20),
        padding: scale(25),
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: verticalScale(10) },
        shadowOpacity: 0.25,
        shadowRadius: scale(15),
        elevation: 10,
    },
    deleteModalTitle: {
        fontSize: scale(22),
        fontWeight: "bold",
        color: "#1F2937",
        marginBottom: verticalScale(12),
        textAlign: "center",
    },
    deleteModalMessage: {
        fontSize: scale(16),
        color: "#4B5563",
        lineHeight: scale(24),
        textAlign: "center",
        marginBottom: verticalScale(25),
    },
    deleteModalButtons: {
        flexDirection: "row",
        width: "100%",
        justifyContent: "space-between",
    },
    cancelBtn: {
        flex: 1,
        height: verticalScale(48),
        borderRadius: scale(12),
        borderWidth: 1,
        borderColor: "#E5E7EB",
        justifyContent: "center",
        alignItems: "center",
        marginRight: scale(10),
    },
    cancelBtnText: {
        fontSize: scale(16),
        fontWeight: "600",
        color: "#4B5563",
    },
    confirmDeleteBtn: {
        flex: 1,
        height: verticalScale(48),
        borderRadius: scale(12),
        backgroundColor: "#EF4444",
        justifyContent: "center",
        alignItems: "center",
        marginLeft: scale(10),
    },
    confirmDeleteBtnText: {
        fontSize: scale(16),
        fontWeight: "600",
        color: "#FFF",
    },
});
