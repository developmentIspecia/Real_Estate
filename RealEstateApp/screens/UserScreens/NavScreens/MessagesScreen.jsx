import React, { useState, useEffect, useRef } from "react";
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
    Animated,
    ScrollView,
    TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE } from "../../../api/api";
import socket from "../../../socket/socket";

const { width, height } = Dimensions.get("window");
const scale = (size) => (width / 375) * size;
const verticalScale = (size) => (height / 812) * size;

export default function MessagesScreen({ navigation }) {
    const { width: windowWidth, height: windowHeight } = useWindowDimensions();
    const scale = (size) => (windowWidth / 375) * size;
    const verticalScale = (size) => (windowHeight / 812) * size;

    const [userRole, setUserRole] = useState("user");
    const [searchQuery, setSearchQuery] = useState("");
    const [userContacts, setUserContacts] = useState([]);
    const [adminMessages, setAdminMessages] = useState([]);
    const [loadingContacts, setLoadingContacts] = useState(false);
    const [loadingAdminMessages, setLoadingAdminMessages] = useState(false);

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return "Just now";
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    useEffect(() => {
        const fetchRole = async () => {
            const role = await AsyncStorage.getItem("userRole");
            if (role) setUserRole(role);
        };
        fetchRole();
    }, []);

    // Fetch real admin/agent contacts for users to chat with
    useEffect(() => {
        if (userRole !== "user") return;
        const fetchContacts = async () => {
            setLoadingContacts(true);
            try {
                const token = await AsyncStorage.getItem("userToken");
                if (!token) return;
                const res = await axios.get(`${API_BASE}/user/contacts`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                // Map to the shape expected by renderUserChatItem
                const mapped = res.data.map((u) => ({
                    id: u._id,
                    name: u.name,
                    lastMessage: u.role === "admin" ? "Admin · Tap to chat" : "Agent · Tap to chat",
                    time: "",
                    unreadCount: 0,
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=1D5FAD&color=fff&size=128`,
                }));
                setUserContacts(mapped);
            } catch (err) {
                console.error("Error fetching contacts:", err);
            } finally {
                setLoadingContacts(false);
            }
        };
        fetchContacts();
    }, [userRole]);

    // Fetch real active conversations for admins/agents
    useEffect(() => {
        if (userRole === "user") return;
        
        const fetchActiveConversations = async () => {
            setLoadingAdminMessages(true);
            try {
                const token = await AsyncStorage.getItem("userToken");
                if (!token) return;
                const res = await axios.get(`${API_BASE}/chat/active-conversations`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                
                const mapped = res.data.map(conv => ({
                    id: conv.id,
                    name: conv.name,
                    lastMessage: conv.lastMessage,
                    time: formatDate(conv.timestamp),
                    unreadCount: 0, // Backend could be updated later to provide actual unread counts
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.name)}&background=1D5FAD&color=fff&size=128`,
                    agent: conv.role === "agent" ? "Direct Chat" : "User",
                    ref: "Message"
                }));
                
                setAdminMessages(mapped);
            } catch (err) {
                console.error("Error fetching active conversations:", err);
            } finally {
                setLoadingAdminMessages(false);
            }
        };

        fetchActiveConversations();

        // 🎧 Listen for new messages to refresh the list
        socket.on("receiveMessage", (message) => {
            fetchActiveConversations();
        });

        return () => {
            socket.off("receiveMessage");
        };
    }, [userRole]);



    const currentMessages = userRole === "admin" ? adminMessages : userContacts;


    const renderUserChatItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.chatItem, { paddingVertical: verticalScale(15) }]}
            onPress={() =>
                userRole === "admin"
                    ? navigation.navigate("AdminChatScreen", { userId: item.id, userName: item.name })
                    : navigation.navigate("ChatScreen", { person: item })
            }
        >
            <View style={styles.avatarContainer}>
                <Image source={{ uri: item.avatar }} style={[styles.avatar, { width: scale(60), height: scale(60), borderRadius: scale(30) }]} />
                {item.unreadCount > 0 && (
                    <View style={[styles.unreadBadge, { width: scale(20), height: scale(20), borderRadius: scale(10), top: -scale(2), right: -scale(2) }]}>
                        <Text style={[styles.unreadText, { fontSize: scale(11) }]}>{item.unreadCount}</Text>
                    </View>
                )}
            </View>
            <View style={styles.chatInfo}>
                <View style={styles.nameRow}>
                    <Text style={[styles.nameText, { fontSize: scale(17) }]}>{item.name}</Text>
                    <Text style={[styles.timeText, { fontSize: scale(13) }]}>{item.time}</Text>
                </View>
                <Text style={[styles.messagePreview, { fontSize: scale(14), marginTop: verticalScale(4) }]} numberOfLines={1}>
                    {item.lastMessage}
                </Text>
            </View>
        </TouchableOpacity>
    );

    const renderAdminChatItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.adminChatItem, { paddingVertical: verticalScale(16) }]}
            onPress={() =>
                userRole === "admin"
                    ? navigation.navigate("AdminChatScreen", { userId: item.id, userName: item.name })
                    : navigation.navigate("ChatScreen", { person: item })
            }
        >
            <View style={styles.adminAvatarContainer}>
                <Image source={{ uri: item.avatar }} style={[styles.adminAvatar, { width: scale(54), height: scale(54), borderRadius: scale(27) }]} />
                {item.unreadCount > 0 && (
                    <View style={[styles.adminUnreadBadge, { width: scale(18), height: scale(18), borderRadius: scale(9) }]}>
                        <Text style={[styles.adminUnreadText, { fontSize: scale(10) }]}>{item.unreadCount}</Text>
                    </View>
                )}
            </View>
            <View style={styles.adminChatInfo}>
                <View style={styles.adminNameRow}>
                    <Text style={[styles.adminNameText, { fontSize: scale(16) }]}>{item.name}</Text>
                    <Text style={[styles.adminTimeText, { fontSize: scale(12) }]}>{item.time}</Text>
                </View>
                <Text style={[styles.adminAgentText, { fontSize: scale(14), marginTop: verticalScale(2) }]}>Agent: {item.agent}</Text>
                <Text style={[styles.adminRefText, { fontSize: scale(13), marginTop: verticalScale(2) }]}>Re: {item.ref}</Text>
                <Text style={[styles.adminMessagePreview, { fontSize: scale(14), marginTop: verticalScale(6) }]} numberOfLines={1}>
                    {item.lastMessage}
                </Text>
            </View>
        </TouchableOpacity>
    );

    const renderHeader = () => {
        if (userRole === "admin") {
            return (
                <View style={[styles.adminHeader, { paddingHorizontal: scale(20), paddingTop: verticalScale(20), paddingBottom: verticalScale(25) }]}>
                    <View style={styles.adminHeaderTop}>
                        <View>
                            <Text style={[styles.adminHeaderTitle, { fontSize: scale(24) }]}>Chat</Text>
                            <Text style={[styles.adminUnreadStatus, { fontSize: scale(14), marginTop: verticalScale(2) }]}>3 unread messages</Text>
                        </View>
                        <TouchableOpacity onPress={() => navigation.navigate("ProfileScreen")}>
                            <Feather name="user" size={scale(24)} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.adminSearchContainer, { marginTop: verticalScale(20), height: verticalScale(45), paddingHorizontal: scale(15) }]}>
                        <Ionicons name="search-outline" size={scale(18)} color="#94A3B8" />
                        <TextInput
                            style={[styles.adminSearchInput, { fontSize: scale(15), marginLeft: scale(10) }]}
                            placeholder="Search conversations"
                            placeholderTextColor="#94A3B8"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>
            );
        }
        return (
            <SafeAreaView edges={['top']}>
                <View style={[styles.topBar, { paddingHorizontal: scale(20), paddingTop: verticalScale(10), paddingBottom: verticalScale(10) }]}>
                    <View style={{ width: scale(24) }} />
                    <Text style={[styles.headerTitle, { fontSize: scale(20) }]}>Messages</Text>
                    <View style={{ width: scale(24) }} />
                </View>
            </SafeAreaView>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle={userRole === "admin" ? "light-content" : "dark-content"} backgroundColor={userRole === "admin" ? "#1D5FAD" : "#FFF"} />

            {renderHeader()}

            <FlatList
                data={currentMessages}
                renderItem={userRole === "admin" ? renderAdminChatItem : renderUserChatItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: scale(20) }}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    // User Styles
    topBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#FFFFFF",
    },
    headerTitle: {
        fontWeight: "bold",
        color: "#0F172A",
    },
    chatItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    avatarContainer: {
        position: "relative",
    },
    avatar: {
        backgroundColor: "#F1F5F9",
    },
    unreadBadge: {
        position: "absolute",
        backgroundColor: "#1D5FAD",
        borderWidth: 2,
        borderColor: "#FFF",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1,
    },
    unreadText: {
        color: "#FFF",
        fontWeight: "bold",
    },
    chatInfo: {
        flex: 1,
        marginLeft: scale(15),
    },
    nameRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    nameText: {
        fontWeight: "bold",
        color: "#0F172A",
    },
    timeText: {
        color: "#94A3B8",
    },
    messagePreview: {
        color: "#64748B",
    },
    separator: {
        height: 1,
        backgroundColor: "#F1F5F9",
    },
    // Admin Styles
    adminHeader: {
        backgroundColor: "#1D5FAD",
        borderBottomLeftRadius: scale(25),
        borderBottomRightRadius: scale(25),
    },
    adminHeaderTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    adminHeaderTitle: {
        color: "#FFF",
        fontWeight: "bold",
    },
    adminUnreadStatus: {
        color: "rgba(255,255,255,0.7)",
        marginTop: verticalScale(4),
    },
    adminProfileIcon: {
        padding: scale(5),
    },
    adminSearchContainer: {
        backgroundColor: "#FFF",
        borderRadius: scale(12),
        flexDirection: "row",
        alignItems: "center",
    },
    adminSearchInput: {
        flex: 1,
        color: "#1E293B",
    },
    adminChatItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    adminAvatarContainer: {
        position: "relative",
    },
    adminAvatar: {
        backgroundColor: "#F1F5F9",
    },
    adminUnreadBadge: {
        position: "absolute",
        top: -verticalScale(2),
        right: -scale(2),
        backgroundColor: "#EF4444",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "#FFF",
    },
    adminUnreadText: {
        color: "#FFF",
        fontWeight: "bold",
    },
    adminChatInfo: {
        flex: 1,
        marginLeft: scale(16),
    },
    adminNameRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    adminNameText: {
        fontWeight: "bold",
        color: "#1E293B",
    },
    adminTimeText: {
        color: "#64748B",
    },
    adminAgentText: {
        color: "#64748B",
    },
    adminRefText: {
        color: "#1D5FAD",
        fontWeight: "500",
    },
    adminMessagePreview: {
        color: "#475569",
    },
});
