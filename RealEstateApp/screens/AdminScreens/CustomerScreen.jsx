import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Dimensions,
    useWindowDimensions,
    ActivityIndicator,
    Image,
    StatusBar,
} from "react-native";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import ActionModal from "../../components/ActionModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE } from "../../api/api";
import CustomAlert from "../../components/CustomAlert";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function CustomerScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { userId } = route.params || {};
    const { width, height } = useWindowDimensions();

    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        title: "",
        message: "",
        action: null
    });
    const [alertConfig, setAlertConfig] = useState({ visible: false, title: "", message: "" });

    // Responsive scaling helpers
    const scale = (size) => (width / 375) * size;
    const verticalScale = (size) => (height / 812) * size;

    const fetchCustomerDetail = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("userToken");
            const res = await axios.get(`${API_BASE}/admin/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserData(res.data);
        } catch (err) {
            console.error("Error fetching customer detail:", err);
            setAlertConfig({ visible: true, title: "Error", message: "Failed to load customer details." });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) fetchCustomerDetail();
    }, [userId]);

    const handleBlock = async () => {
        try {
            const token = await AsyncStorage.getItem("userToken");
            const res = await axios.put(`${API_BASE}/admin/users/${userId}/block`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserData({ ...userData, isBlocked: res.data.isBlocked });
            setAlertConfig({ visible: true, title: "Success", message: res.data.message });
        } catch (err) {
            setAlertConfig({ visible: true, title: "Error", message: "Failed to update block status." });
        }
    };

    const handleRemove = async () => {
        try {
            const token = await AsyncStorage.getItem("userToken");
            await axios.delete(`${API_BASE}/admin/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigation.goBack();
        } catch (err) {
            setAlertConfig({ visible: true, title: "Error", message: "Failed to remove customer." });
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    if (!userData) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text>Customer not found.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                    <Text style={{ color: '#2563EB' }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const avatarUrl = userData.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=1D5FAD&color=fff&size=200`;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
            />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header Background */}
                <View style={[styles.headerBackground, { height: verticalScale(140) }]}>
                    <TouchableOpacity
                        style={[styles.backButton, { top: verticalScale(20), left: scale(20) }]}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={scale(24)} color="#FFF" />
                    </TouchableOpacity>
                </View>

                {/* Profile Card */}
                <View style={[styles.profileCard, { marginTop: -verticalScale(60) }]}>
                    <View style={styles.profileHeader}>
                        <Image 
                            source={{ uri: avatarUrl }} 
                            style={[styles.avatar, { width: scale(100), height: scale(100), borderRadius: scale(50) }]} 
                        />
                        <View style={styles.profileInfo}>
                            <Text style={[styles.userName, { fontSize: scale(22) }]}>{userData.name}</Text>
                            <View style={[styles.badge, { 
                                paddingHorizontal: scale(12), 
                                paddingVertical: verticalScale(4),
                                backgroundColor: userData.isBlocked ? '#FEE2E2' : '#EFF6FF'
                             }]}>
                                <Text style={[styles.badgeText, { 
                                    fontSize: scale(12),
                                    color: userData.isBlocked ? '#EF4444' : '#3B82F6'
                                 }]}>{userData.isBlocked ? "blocked" : userData.role}</Text>
                            </View>
                            <Text style={[styles.joinedText, { fontSize: scale(14) }]}>
                                {userData.createdAt ? `Joined ${new Date(userData.createdAt).toLocaleDateString()}` : 'Joined recently'}
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.divider, { marginVertical: verticalScale(20) }]} />

                    <View style={styles.contactDetails}>
                        <View style={[styles.contactRow, { marginBottom: verticalScale(16) }]}>
                            <Feather name="mail" size={scale(18)} color="#64748B" />
                            <Text style={[styles.contactText, { fontSize: scale(16), marginLeft: scale(12) }]}>{userData.email}</Text>
                        </View>
                        <View style={[styles.contactRow, { marginBottom: verticalScale(16) }]}>
                            <Feather name="phone" size={scale(18)} color="#64748B" />
                            <Text style={[styles.contactText, { fontSize: scale(16), marginLeft: scale(12) }]}>{userData.phone || "No phone added"}</Text>
                        </View>
                        <View style={styles.contactRow}>
                            <Ionicons name="location-outline" size={scale(20)} color="#64748B" />
                            <Text style={[styles.contactText, { fontSize: scale(16), marginLeft: scale(10) }]}>{userData.location || "Location not set"}</Text>
                        </View>
                    </View>
                </View>

                {/* Statistics Card */}
                <View style={[styles.statsCard, { marginTop: verticalScale(20) }]}>
                    <Text style={[styles.sectionTitle, { fontSize: scale(18), marginBottom: verticalScale(20) }]}>Statistics</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { fontSize: scale(24) }]}>0</Text>
                            <Text style={[styles.statLabel, { fontSize: scale(12) }]}>Listings</Text>
                        </View>
                        <View style={[styles.verticalDivider, { height: verticalScale(40) }]} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { fontSize: scale(24) }]}>0</Text>
                            <Text style={[styles.statLabel, { fontSize: scale(12) }]}>Views</Text>
                        </View>
                        <View style={[styles.verticalDivider, { height: verticalScale(40) }]} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { fontSize: scale(24) }]}>0</Text>
                            <Text style={[styles.statLabel, { fontSize: scale(12) }]}>Inquiries</Text>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={[styles.actionsContainer, { marginTop: verticalScale(30) }]}>
                    <TouchableOpacity
                        style={[
                            styles.blockButton, 
                            { paddingVertical: verticalScale(12), borderRadius: scale(10) },
                            userData.isBlocked && { backgroundColor: '#BBF7D0' }
                        ]}
                        onPress={() => {
                            setModalConfig({
                                title: userData.isBlocked ? "Unblock" : "Block",
                                message: `Are you sure you want to ${userData.isBlocked ? "unblock" : "block"} this customer?`,
                                action: handleBlock
                            });
                            setModalVisible(true);
                        }}
                    >
                        <Text style={[styles.blockButtonText, { fontSize: scale(16) }]}>
                            {userData.isBlocked ? "Unblock Customer" : "Block Customer"}
                        </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={[styles.removeButton, { paddingVertical: verticalScale(12), borderRadius: scale(10), marginTop: verticalScale(12) }]}
                        onPress={() => {
                            setModalConfig({
                                title: "Remove Customer",
                                message: "Are you sure you want to remove this customer permanently? This will also remove their properties.",
                                action: handleRemove
                            });
                            setModalVisible(true);
                        }}
                    >
                        <Text style={[styles.removeButtonText, { fontSize: scale(16) }]}>Remove Customer</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.chatButton, { paddingVertical: verticalScale(12), borderRadius: scale(10), marginTop: verticalScale(12) }]}
                        onPress={() => navigation.navigate("AdminChatScreen", { userId: userData._id, userName: userData.name })}
                    >
                         <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <Ionicons name="chatbubble-outline" size={scale(20)} color="#FFF" />
                            <Text style={[styles.chatButtonText, { fontSize: scale(16), marginLeft: 10 }]}>Message Customer</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <ActionModal
                visible={modalVisible}
                title={modalConfig.title}
                message={modalConfig.message}
                onClose={() => setModalVisible(false)}
                onConfirm={() => {
                    modalConfig.action?.();
                    setModalVisible(false);
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    scrollContent: {
        paddingBottom: 40,
    },
    headerBackground: {
        backgroundColor: "#1D5FAD",
        width: "100%",
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
    },
    backButton: {
        position: "absolute",
        zIndex: 10,
    },
    profileCard: {
        backgroundColor: "#FFF",
        marginHorizontal: 20,
        borderRadius: 20,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    profileHeader: {
        flexDirection: "row",
        alignItems: "center",
    },
    avatar: {
        backgroundColor: "#F1F5F9",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    profileInfo: {
        marginLeft: 20,
        flex: 1,
    },
    userName: {
        fontWeight: "bold",
        color: "#1E293B",
    },
    badge: {
        borderRadius: 8,
        alignSelf: "flex-start",
        marginTop: 6,
    },
    badgeText: {
        fontWeight: "600",
    },
    joinedText: {
        color: "#64748B",
        marginTop: 8,
    },
    divider: {
        height: 1,
        backgroundColor: "#F1F5F9",
    },
    contactDetails: {
        marginTop: 5,
    },
    contactRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    contactText: {
        color: "#475569",
        fontWeight: "400",
    },
    statsCard: {
        backgroundColor: "#FFF",
        marginHorizontal: 20,
        borderRadius: 20,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    sectionTitle: {
        fontWeight: "bold",
        color: "#1E293B",
    },
    statsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    statItem: {
        alignItems: "center",
        flex: 1,
    },
    statValue: {
        fontWeight: "bold",
        color: "#1D5FAD",
    },
    statLabel: {
        color: "#64748B",
        marginTop: 4,
        fontWeight: "500",
    },
    verticalDivider: {
        width: 1,
        backgroundColor: "#F1F5F9",
    },
    actionsContainer: {
        paddingHorizontal: 20,
    },
    blockButton: {
        backgroundColor: "#FECACA",
        alignItems: "center",
        justifyContent: "center",
    },
    blockButtonText: {
        color: "#1E293B",
        fontWeight: "600",
    },
    removeButton: {
        backgroundColor: "#FFF",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    removeButtonText: {
        color: "#1E293B",
        fontWeight: "600",
    },
    chatButton: {
        backgroundColor: "#1D5FAD",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    chatButtonText: {
        color: "#FFF",
        fontWeight: "700",
    },
});
