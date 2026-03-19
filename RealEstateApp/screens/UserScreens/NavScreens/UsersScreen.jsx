import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    Dimensions,
    useWindowDimensions,
    StatusBar,
    TextInput,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchAllUsers } from "../../../api/api";
import { ActivityIndicator } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const scale = (size) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size) => (SCREEN_HEIGHT / 812) * size;

export default function UsersScreen({ navigation }) {
    const { width, height } = useWindowDimensions();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const token = await AsyncStorage.getItem("userToken");
                const data = await fetchAllUsers(token);
                
                // Map real users to the format expected by the UI
                const mappedUsers = data.map(u => ({
                    id: u._id,
                    name: u.name,
                    email: u.email,
                    listings: 0, // Listing counts could be added to backend aggregation later
                    role: u.role === "user" ? "customer" : u.role,
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random&color=fff&size=128`,
                    isBlocked: u.isBlocked,
                }));
                
                setUsers(mappedUsers);
            } catch (err) {
                console.error("Error fetching users:", err);
            } finally {
                setLoading(false);
            }
        };

        loadUsers();
    }, []);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("All");

    const filteredUsers = users.filter((user) => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === "All" ||
            (activeTab === "Customers" && user.role === "customer") ||
            (activeTab === "Agents" && user.role === "agent");
        return matchesSearch && matchesTab;
    });

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.headerTop}>
                <View>
                    <Text style={[styles.headerTitle, { fontSize: scale(24) }]}>Users</Text>
                    <Text style={[styles.headerSubtitle, { fontSize: scale(14) }]}>{users.length} total</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate("ProfileScreen")}>
                    <Feather name="user" size={scale(24)} color="#FFF" />
                </TouchableOpacity>
            </View>
            <View style={[styles.searchContainer, { marginTop: verticalScale(20), height: verticalScale(45), paddingHorizontal: scale(15) }]}>
                <Ionicons name="search-outline" size={scale(18)} color="#94A3B8" />
                <TextInput
                    style={[styles.searchInput, { fontSize: scale(15), marginLeft: scale(10) }]}
                    placeholder="Search users..."
                    placeholderTextColor="#94A3B8"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>
        </View>
    );

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.userCard}
            onPress={() => {
                const screenName = item.role === "agent" ? "AgentScreen" : "CustomerScreen";
                navigation.navigate(screenName, { userId: item.id });
            }}
        >
            <View style={styles.avatarContainer}>
                <Image source={{ uri: item.avatar }} style={[styles.avatar, { width: scale(60), height: scale(60), borderRadius: scale(30) }]} />
            </View>
            <View style={styles.userInfo}>
                <View style={styles.nameRow}>
                    <Text style={[styles.nameText, { fontSize: scale(17) }]}>{item.name}</Text>
                    {item.role === "agent" && (
                        <MaterialCommunityIcons name="shield-check-outline" size={scale(16)} color="#1D5FAD" style={{ marginLeft: scale(4) }} />
                    )}
                </View>
                <Text style={[styles.emailText, { fontSize: scale(13) }]}>{item.email}</Text>
                <Text style={[styles.listingsText, { fontSize: scale(13) }]}>{item.listings} listings</Text>
            </View>
            <View style={[
                styles.roleBadge,
                item.isBlocked ? styles.blockedBadge : (item.role === "agent" ? styles.agentBadge : styles.customerBadge),
                { paddingHorizontal: scale(10), paddingVertical: verticalScale(4), borderRadius: scale(12) }
            ]}>
                <Text style={[
                    styles.roleText,
                    item.isBlocked ? styles.blockedBadgeText : (item.role === "agent" ? styles.agentBadgeText : styles.customerBadgeText),
                    { fontSize: scale(12) }
                ]}>
                    {item.isBlocked ? "blocked" : item.role}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1D5FAD" />
            {renderHeader()}

            <View style={[styles.tabsRow, { paddingHorizontal: scale(20), marginVertical: verticalScale(15) }]}>
                {["All", "Customers", "Agents"].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => setActiveTab(tab)}
                        style={[
                            styles.tabItem,
                            activeTab === tab ? styles.activeTab : styles.inactiveTab,
                            { paddingHorizontal: scale(20), paddingVertical: verticalScale(8), borderRadius: scale(20), marginRight: scale(10) }
                        ]}
                    >
                        <Text style={[
                            styles.tabText,
                            activeTab === tab ? styles.activeTabText : styles.inactiveTabText,
                            { fontSize: scale(14) }
                        ]}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity
                style={[styles.addBtn, { marginHorizontal: scale(20), paddingVertical: verticalScale(12), borderRadius: scale(12), marginBottom: verticalScale(10) }]}
                onPress={() => {/* Add Agent Account logic */ }}
            >
                <View style={styles.addBtnContent}>
                    <Ionicons name="add" size={scale(20)} color="#FFF" />
                    <Text style={[styles.addBtnText, { fontSize: scale(16), marginLeft: scale(5) }]}>Add Agent Account</Text>
                </View>
            </TouchableOpacity>

            {loading ? (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator size="large" color="#1D5FAD" />
                </View>
            ) : (
                <FlatList
                    data={filteredUsers}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingHorizontal: scale(20), paddingBottom: verticalScale(100) }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    header: {
        backgroundColor: "#1D5FAD",
        borderBottomLeftRadius: scale(25),
        borderBottomRightRadius: scale(25),
        paddingHorizontal: scale(20),
        paddingTop: verticalScale(20),
        paddingBottom: verticalScale(25),
    },
    headerTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    headerTitle: {
        color: "#FFF",
        fontWeight: "bold",
    },
    headerSubtitle: {
        color: "rgba(255,255,255,0.7)",
        marginTop: verticalScale(2),
    },
    searchContainer: {
        backgroundColor: "#FFF",
        borderRadius: scale(12),
        flexDirection: "row",
        alignItems: "center",
    },
    searchInput: {
        flex: 1,
        color: "#1E293B",
    },
    tabsRow: {
        flexDirection: "row",
    },
    tabItem: {
        justifyContent: "center",
        alignItems: "center",
    },
    activeTab: {
        backgroundColor: "#1D5FAD",
    },
    inactiveTab: {
        backgroundColor: "#F1F5F9",
    },
    tabText: {
        fontWeight: "600",
    },
    activeTabText: {
        color: "#FFF",
    },
    inactiveTabText: {
        color: "#64748B",
    },
    addBtn: {
        backgroundColor: "#1D5FAD",
        shadowColor: "#1D5FAD",
        shadowOffset: { width: 0, height: verticalScale(4) },
        shadowOpacity: 0.2,
        shadowRadius: scale(8),
        elevation: 5,
    },
    addBtnContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    addBtnText: {
        color: "#FFF",
        fontWeight: "bold",
    },
    userCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF",
        padding: scale(15),
        borderRadius: scale(16),
        marginBottom: verticalScale(15),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: verticalScale(2) },
        shadowOpacity: 0.05,
        shadowRadius: scale(10),
        elevation: 2,
        borderWidth: 1,
        borderColor: "#F1F5F9",
    },
    avatarContainer: {
        marginRight: scale(15),
    },
    avatar: {
        backgroundColor: "#F1F5F9",
    },
    userInfo: {
        flex: 1,
    },
    nameRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    nameText: {
        fontWeight: "bold",
        color: "#1E293B",
    },
    emailText: {
        color: "#64748B",
        marginTop: verticalScale(2),
    },
    listingsText: {
        color: "#94A3B8",
        marginTop: verticalScale(2),
    },
    roleBadge: {
        alignItems: "center",
        justifyContent: "center",
    },
    roleText: {
        fontWeight: "600",
        textTransform: "capitalize",
    },
    customerBadge: {
        backgroundColor: "#E0F2FE",
    },
    customerBadgeText: {
        color: "#0284C7",
    },
    agentBadge: {
        backgroundColor: "#DCFCE7",
    },
    agentBadgeText: {
        color: "#16A34A",
    },
    blockedBadge: {
        backgroundColor: "#FEE2E2",
    },
    blockedBadgeText: {
        color: "#EF4444",
    },
});
