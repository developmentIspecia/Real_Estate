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
    Modal,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE } from "../../../api/api";
import socket from "../../../socket/socket";
import CustomAlert from "../../../components/CustomAlert";

const { width, height } = Dimensions.get("window");
const scale = (size) => (width / 375) * size;
const verticalScale = (size) => (height / 812) * size;

export default function MessagesScreen({ navigation }) {
    const { width: windowWidth, height: windowHeight } = useWindowDimensions();
    const scale = (size) => (windowWidth / 375) * size;
    const verticalScale = (size) => (windowHeight / 812) * size;

    const [userRole, setUserRole] = useState("user");
    const [searchQuery, setSearchQuery] = useState("");
    const [conversations, setConversations] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingContacts, setLoadingContacts] = useState(false);
    const [showContactsModal, setShowContactsModal] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ visible: false, title: "", message: "" });

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

    const fetchConversations = async (showLoading = true) => {
        if (showLoading) setLoading(true);
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
                unreadCount: 0,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.name)}&background=1D5FAD&color=fff&size=128`,
                role: conv.role,
                timestamp: conv.timestamp,
                agent: conv.role === "agent" ? "Direct Chat" : "User",
                ref: "Message"
            }));

            setConversations(mapped);
        } catch (err) {
            console.error("Error fetching conversations:", err);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    const fetchContacts = async () => {
        setLoadingContacts(true);
        try {
            const token = await AsyncStorage.getItem("userToken");
            const res = await axios.get(`${API_BASE}/user/contacts`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const mapped = res.data.map((u) => ({
                id: u._id,
                name: u.name,
                role: u.role,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=1D5FAD&color=fff&size=128`,
            }));
            setContacts(mapped);
        } catch (err) {
            console.error("Error fetching contacts:", err);
        } finally {
            setLoadingContacts(false);
        }
    };

    useEffect(() => {
        fetchConversations();
        fetchContacts();

        // 🎧 Socket: join room
        const setupSocket = async () => {
             try {
                const token = await AsyncStorage.getItem("userToken");
                const res = await axios.get(`${API_BASE}/user/profile`, { 
                    headers: { Authorization: `Bearer ${token}` } 
                });
                if (res.data._id) {
                    socket.emit("joinRoom", res.data._id);
                    if (res.data.role === 'admin') socket.emit("joinRoom", "admin");
                }
             } catch (e) {
                 console.error("Socket join room error:", e);
             }
        }
        setupSocket();

        socket.on("receiveMessage", (message) => {
            fetchConversations(false); // Silent refresh
        });

        return () => {
            socket.off("receiveMessage");
        };
    }, []);

    const filteredConversations = conversations.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );




    const renderChatItem = ({ item }) => (
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
                            <Text style={[styles.adminHeaderTitle, { fontSize: scale(24) }]}>Admin Chat</Text>
                            <Text style={[styles.adminUnreadStatus, { fontSize: scale(14), marginTop: verticalScale(2) }]}>{conversations.length} Active Threads</Text>
                        </View>
                        <TouchableOpacity onPress={() => navigation.navigate("ProfileScreen")}>
                            <Feather name="user" size={scale(24)} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.adminSearchContainer, { marginTop: verticalScale(20), height: verticalScale(45), paddingHorizontal: scale(15) }]}>
                        <Ionicons name="search-outline" size={scale(18)} color="#94A3B8" />
                        <TextInput
                            style={[styles.adminSearchInput, { fontSize: scale(15), marginLeft: scale(10) }]}
                            placeholder="Search conversations..."
                            placeholderTextColor="#94A3B8"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>
            );
        }
        return (
            <SafeAreaView edges={['top']} style={{ backgroundColor: '#FFF' }}>
                <View style={[styles.topBar, { paddingHorizontal: scale(20), paddingTop: verticalScale(10), paddingBottom: verticalScale(10) }]}>
                    <TouchableOpacity onPress={() => setShowContactsModal(true)}>
                        <Feather name="plus-circle" size={scale(24)} color="#1D5FAD" />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { fontSize: scale(20) }]}>Messages</Text>
                    <TouchableOpacity onPress={() => navigation.navigate("ProfileScreen")}>
                        <Feather name="user" size={scale(24)} color="#1D5FAD" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle={userRole === "admin" ? "light-content" : "dark-content"} backgroundColor={userRole === "admin" ? "#1D5FAD" : "#FFF"} />

            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
            />

            {renderHeader()}

            {loading ? (
                <View style={[styles.centerContainer, { paddingTop: 100 }]}>
                    <ActivityIndicator size="large" color="#1D5FAD" />
                </View>
            ) : filteredConversations.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="chatbubbles-outline" size={scale(60)} color="#CBD5E1" />
                    <Text style={[styles.emptyText, { marginTop: 10 }]}>No conversations found</Text>
                    {userRole === 'user' && (
                        <TouchableOpacity 
                            style={[styles.newChatBtn, { marginTop: 20, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 }]}
                            onPress={() => setShowContactsModal(true)}
                        >
                            <Text style={styles.newChatBtnText}>Start New Chat</Text>
                        </TouchableOpacity>
                    )}
                </View>
            ) : (
                <FlatList
                    data={filteredConversations}
                    renderItem={userRole === "admin" ? renderAdminChatItem : renderChatItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingHorizontal: scale(20), paddingBottom: 100 }}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Contacts Modal */}
            <Modal
                visible={showContactsModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowContactsModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { height: height * 0.7 }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Choose Contact</Text>
                            <TouchableOpacity onPress={() => setShowContactsModal(false)}>
                                <Ionicons name="close" size={28} color="#000" />
                            </TouchableOpacity>
                        </View>
                        
                        {loadingContacts ? (
                            <ActivityIndicator size="large" color="#1D5FAD" style={{ marginTop: 50 }} />
                        ) : (
                            <FlatList
                                data={contacts}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity 
                                        style={styles.contactItem}
                                        onPress={() => {
                                            setShowContactsModal(false);
                                            navigation.navigate("ChatScreen", { person: item });
                                        }}
                                    >
                                        <Image source={{ uri: item.avatar }} style={styles.contactAvatar} />
                                        <View>
                                            <Text style={styles.contactName}>{item.name}</Text>
                                            <Text style={styles.contactRole}>{item.role === 'admin' ? 'Support Admin' : 'Property Agent'}</Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                                contentContainerStyle={{ paddingBottom: 30 }}
                            />
                        )}
                    </View>
                </View>
            </Modal>
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
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 100,
    },
    emptyText: {
        color: "#94A3B8",
        fontSize: 16,
    },
    newChatBtn: {
        backgroundColor: "#1D5FAD",
    },
    newChatBtnText: {
        color: "#FFF",
        fontWeight: "bold",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    contactAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
        backgroundColor: '#F1F5F9',
    },
    contactName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    contactRole: {
        fontSize: 13,
        color: '#64748B',
    },
});
