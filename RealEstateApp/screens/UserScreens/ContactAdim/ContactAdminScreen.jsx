import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE } from "../../../api/api";

const { width, height } = Dimensions.get("window");
const scale = (size) => (width / 375) * size;
const verticalScale = (size) => (height / 812) * size;

export default function ContactAdminScreen({ route, navigation }) {
    const { property } = route?.params || {};

    // Dynamic property details
    const propertyTitle = property?.title || "Modern Villa in Beverly Hills";
    const propertyLocation = property?.location || "Beverly Hills, CA";
    const propertyPrice = property?.price ? `$${property.price}` : "$4,250,000";

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = await AsyncStorage.getItem("userToken");
                if (!token) return;

                const res = await axios.get(`${API_BASE}/user/profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setName(res.data?.name || "");
                setEmail(res.data?.email || "");
                setPhone(res.data?.phone || "");
            } catch (err) {
                console.error("Error fetching user data:", err);
            }
        };
        fetchUser();
    }, []);

    const handleSubmit = () => {
        if (!message.trim()) {
            alert("Please enter a message");
            return;
        }

        // We simulate starting a chat with the admin/agent for this property
        // The real ID should come from property.agentId if the backend provided one
        const mockAgentId = "60e10b10f135b91b8f15d9a0"; // Using a valid-looking ObjectId for the DB
        const person = {
            id: mockAgentId,
            name: "Sarah Johnson",
            avatar: "https://randomuser.me/api/portraits/women/44.jpg"
        };

        setMessage("");
        navigation.navigate("ChatScreen", { person });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

            {/* Header */}
            <View style={[styles.header, { paddingHorizontal: scale(20), height: verticalScale(60) }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="arrow-left" size={scale(24)} color="#1E293B" />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { fontSize: scale(18) }]}>Contact Admin</Text>
                <View style={{ width: scale(24) }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: verticalScale(40) }}>
                {/* Agent Card */}
                <View style={[styles.agentCard, { margin: scale(20), padding: scale(20), borderRadius: scale(10) }]}>
                    <View style={styles.agentInfoRow}>
                        <View style={[styles.avatarCircle, { width: scale(54), height: scale(54), borderRadius: scale(27) }]}>
                            <Ionicons name="person" size={scale(30)} color="#FFF" />
                        </View>
                        <View style={styles.agentNameDetails}>
                            <Text style={[styles.agentName, { fontSize: scale(18) }]}>Sarah Johnson</Text>
                            <Text style={[styles.agentRole, { fontSize: scale(14) }]}>Property Agent</Text>
                        </View>
                    </View>
                    <Text style={[styles.agentDesc, { fontSize: scale(13), marginTop: verticalScale(15) }]}>
                        Interested in {propertyTitle}?{"\n"}Send a message to the property agent.
                    </Text>
                </View>

                {/* Property Section */}
                <View style={[styles.section, { paddingHorizontal: scale(20) }]}>
                    <Text style={[styles.sectionLabel, { fontSize: scale(14) }]}>Property</Text>
                    <View style={[styles.propertyCard, { padding: scale(15), marginTop: verticalScale(8), borderRadius: scale(8) }]}>
                        <Text style={[styles.propertyTitle, { fontSize: scale(16) }]}>{propertyTitle}</Text>
                        <Text style={[styles.propertyLoc, { fontSize: scale(14), marginTop: verticalScale(4) }]}>{propertyLocation}</Text>
                        <Text style={[styles.propertyPrice, { fontSize: scale(18), marginTop: verticalScale(8) }]}>{propertyPrice}</Text>
                    </View>
                </View>

                {/* Quick Contact Section */}
                <View style={[styles.section, { paddingHorizontal: scale(20), marginTop: verticalScale(25) }]}>
                    <Text style={[styles.sectionLabel, { fontSize: scale(14) }]}>Quick Contact</Text>
                    <View style={[styles.quickContactRow, { marginTop: verticalScale(12) }]}>
                        <QuickContactItem icon="phone" label="Call" type="Feather" scale={scale} verticalScale={verticalScale} />
                        <QuickContactItem icon="mail" label="Email" type="Feather" scale={scale} verticalScale={verticalScale} />
                        <QuickContactItem icon="whatsapp" label="Whatsapp" type="FontAwesome5" scale={scale} verticalScale={verticalScale} />
                    </View>
                </View>

                {/* Message Form */}
                <View style={[styles.section, { paddingHorizontal: scale(20), marginTop: verticalScale(30) }]}>
                    <Text style={[styles.formHeading, { fontSize: scale(18) }]}>Send a Message</Text>

                    <View style={[styles.inputGroup, { marginTop: verticalScale(20) }]}>
                        <Text style={[styles.inputLabel, { fontSize: scale(14) }]}>Your Name</Text>
                        <TextInput
                            style={[styles.input, { height: verticalScale(50), paddingHorizontal: scale(15), borderRadius: scale(10) }]}
                            placeholder="John Doe"
                            placeholderTextColor="#94A3B8"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View style={[styles.inputGroup, { marginTop: verticalScale(15) }]}>
                        <Text style={[styles.inputLabel, { fontSize: scale(14) }]}>Phone Number</Text>
                        <TextInput
                            style={[styles.input, { height: verticalScale(50), paddingHorizontal: scale(15), borderRadius: scale(10) }]}
                            placeholder="+1 (555) 123-4567"
                            placeholderTextColor="#94A3B8"
                            keyboardType="phone-pad"
                            value={phone}
                            onChangeText={setPhone}
                        />
                    </View>

                    <View style={[styles.inputGroup, { marginTop: verticalScale(15) }]}>
                        <Text style={[styles.inputLabel, { fontSize: scale(14) }]}>Email</Text>
                        <TextInput
                            style={[styles.input, { height: verticalScale(50), paddingHorizontal: scale(15), borderRadius: scale(10) }]}
                            placeholder="john@example.com"
                            placeholderTextColor="#94A3B8"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    <View style={[styles.inputGroup, { marginTop: verticalScale(15) }]}>
                        <Text style={[styles.inputLabel, { fontSize: scale(14) }]}>Message</Text>
                        <TextInput
                            style={[styles.textArea, { height: verticalScale(120), padding: scale(15), borderRadius: scale(10) }]}
                            placeholder="I'm interested in this property..."
                            placeholderTextColor="#94A3B8"
                            multiline
                            textAlignVertical="top"
                            value={message}
                            onChangeText={setMessage}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.submitBtn, { marginTop: verticalScale(30), paddingVertical: verticalScale(12), borderRadius: scale(10) }]}
                        activeOpacity={0.8}
                        onPress={handleSubmit}
                    >
                        <Ionicons name="paper-plane-outline" size={scale(20)} color="#FFF" style={{ marginRight: 8 }} />
                        <Text style={[styles.submitBtnText, { fontSize: scale(16) }]}>Send Message & Start Chat</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const QuickContactItem = ({ icon, label, type, scale, verticalScale }) => (
    <TouchableOpacity style={[styles.quickItemCard, { paddingVertical: verticalScale(15), borderRadius: scale(12) }]}>
        <View style={[styles.quickIconCircle, { width: scale(46), height: scale(46), borderRadius: scale(23) }]}>
            {type === "Feather" ? (
                <Feather name={icon} size={scale(20)} color="#1D5FAD" />
            ) : (
                <FontAwesome5 name={icon} size={scale(20)} color="#1D5FAD" />
            )}
        </View>
        <Text style={[styles.quickLabel, { fontSize: scale(12), marginTop: verticalScale(8) }]}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#FFF",
    },
    headerTitle: {
        fontWeight: "bold",
        color: "#1E293B",
    },
    agentCard: {
        backgroundColor: "#1D5FAD",
    },
    agentInfoRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    avatarCircle: {
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    agentNameDetails: {
        marginLeft: 15,
    },
    agentName: {
        color: "#FFF",
        fontWeight: "bold",
    },
    agentRole: {
        color: "rgba(255,255,255,0.7)",
    },
    agentDesc: {
        color: "rgba(255,255,255,0.9)",
        lineHeight: 18,
    },
    sectionLabel: {
        color: "#64748B",
        fontWeight: "500",
    },
    propertyCard: {
        backgroundColor: "#FFF",
        borderWidth: 2,
        borderColor: "#3B82F6",
    },
    propertyTitle: {
        fontWeight: "bold",
        color: "#1E293B",
    },
    propertyLoc: {
        color: "#64748B",
    },
    propertyPrice: {
        color: "#1D5FAD",
        fontWeight: "900",
    },
    quickContactRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    quickItemCard: {
        backgroundColor: "#FFF",
        width: '30%',
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#F1F5F9",
    },
    quickIconCircle: {
        backgroundColor: "#EFF6FF",
        justifyContent: "center",
        alignItems: "center",
    },
    quickLabel: {
        color: "#64748B",
        fontWeight: "500",
    },
    formHeading: {
        fontWeight: "bold",
        color: "#1E293B",
    },
    inputLabel: {
        color: "#475569",
        fontWeight: "600",
        marginBottom: 8,
    },
    input: {
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: "#F1F5F9",
        color: "#1E293B",
    },
    textArea: {
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: "#F1F5F9",
        color: "#1E293B",
    },
    submitBtn: {
        backgroundColor: "#1D5FAD",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    submitBtnText: {
        color: "#FFF",
        fontWeight: "700",
    },
});
