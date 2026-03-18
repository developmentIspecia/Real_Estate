import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Dimensions,
    useWindowDimensions,
} from "react-native";
import { Ionicons, Feather, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ActionModal from "../../components/ActionModal";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function AgentScreen() {
    const navigation = useNavigation();
    const { width, height } = useWindowDimensions();

    const [modalVisible, setModalVisible] = React.useState(false);
    const [modalConfig, setModalConfig] = React.useState({
        title: "",
        message: "",
        action: null
    });

    // Responsive scaling helpers
    const scale = (size) => (width / 375) * size;
    const verticalScale = (size) => (height / 812) * size;
    const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

    const activeListings = [
        { id: "1", name: "Modern Villa", price: "$1,200,000" },
        { id: "2", name: "Beach House", price: "$850,000" },
        { id: "3", name: "City Apartment", price: "$450,000" },
    ];

    return (
        <SafeAreaView style={styles.container}>
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
                        <View style={[styles.avatarPlaceholder, { width: scale(100), height: scale(100), borderRadius: scale(50) }]} />
                        <View style={styles.profileInfo}>
                            <View style={styles.nameRow}>
                                <Text style={[styles.userName, { fontSize: scale(22) }]}>Sarah Johnson</Text>
                                <MaterialCommunityIcons name="shield-check" size={scale(20)} color="#3B82F6" style={{ marginLeft: scale(6) }} />
                            </View>
                            <View style={[styles.badge, { paddingHorizontal: scale(12), paddingVertical: verticalScale(4) }]}>
                                <Text style={[styles.badgeText, { fontSize: scale(12) }]}>agent</Text>
                            </View>
                            <Text style={[styles.joinedText, { fontSize: scale(14) }]}>Joined Dec 2023</Text>
                        </View>
                    </View>

                    <View style={[styles.divider, { marginVertical: verticalScale(20) }]} />

                    <View style={styles.contactDetails}>
                        <View style={[styles.contactRow, { marginBottom: verticalScale(16) }]}>
                            <Feather name="mail" size={scale(18)} color="#64748B" />
                            <Text style={[styles.contactText, { fontSize: scale(16), marginLeft: scale(12) }]}>sarah@example.com</Text>
                        </View>
                        <View style={[styles.contactRow, { marginBottom: verticalScale(16) }]}>
                            <Feather name="phone" size={scale(18)} color="#64748B" />
                            <Text style={[styles.contactText, { fontSize: scale(16), marginLeft: scale(12) }]}>+1 234 567 8901</Text>
                        </View>
                        <View style={styles.contactRow}>
                            <Ionicons name="location-outline" size={scale(20)} color="#64748B" />
                            <Text style={[styles.contactText, { fontSize: scale(16), marginLeft: scale(10) }]}>Los Angeles, CA</Text>
                        </View>
                    </View>
                </View>

                {/* Statistics Card */}
                <View style={[styles.statsCard, { marginTop: verticalScale(20) }]}>
                    <Text style={[styles.sectionTitle, { fontSize: scale(18), marginBottom: verticalScale(20) }]}>Statistics</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { fontSize: scale(24) }]}>12</Text>
                            <Text style={[styles.statLabel, { fontSize: scale(12) }]}>Listings</Text>
                        </View>
                        <View style={[styles.verticalDivider, { height: verticalScale(40) }]} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { fontSize: scale(24) }]}>24</Text>
                            <Text style={[styles.statLabel, { fontSize: scale(12) }]}>Views</Text>
                        </View>
                        <View style={[styles.verticalDivider, { height: verticalScale(40) }]} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { fontSize: scale(24) }]}>5</Text>
                            <Text style={[styles.statLabel, { fontSize: scale(12) }]}>Inquiries</Text>
                        </View>
                    </View>
                </View>

                {/* Active Listings Section */}
                <View style={[styles.listingsCard, { marginTop: verticalScale(20) }]}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="home-outline" size={scale(20)} color="#1E293B" />
                        <Text style={[styles.sectionTitle, { fontSize: scale(18), marginLeft: scale(8) }]}>Active Listings</Text>
                    </View>
                    <View style={{ marginTop: verticalScale(15) }}>
                        {activeListings.map((listing) => (
                            <View key={listing.id} style={[styles.listingItem, { padding: scale(16), marginBottom: verticalScale(12), borderRadius: scale(12) }]}>
                                <Text style={[styles.listingName, { fontSize: scale(16) }]}>{listing.name}</Text>
                                <Text style={[styles.listingPrice, { fontSize: scale(14), marginTop: verticalScale(4) }]}>{listing.price}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={[styles.actionsContainer, { marginTop: verticalScale(30) }]}>
                    <TouchableOpacity
                        style={[styles.blockButton, { paddingVertical: verticalScale(12), borderRadius: scale(10) }]}
                        onPress={() => {
                            setModalConfig({
                                title: "Block Agent",
                                message: "Are you sure you want to block this agent?",
                                action: () => console.log("Blocking agent...")
                            });
                            setModalVisible(true);
                        }}
                    >
                        <Text style={[styles.blockButtonText, { fontSize: scale(16) }]}>Block Agent</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.removeButton, { paddingVertical: verticalScale(12), borderRadius: scale(10), marginTop: verticalScale(12) }]}
                        onPress={() => {
                            setModalConfig({
                                title: "Remove Agent",
                                message: "Are you sure you want to remove this agent?",
                                action: () => console.log("Removing agent...")
                            });
                            setModalVisible(true);
                        }}
                    >
                        <Text style={[styles.removeButtonText, { fontSize: scale(16) }]}>Remove Agent</Text>
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
        backgroundColor: "#2563EB",
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
    avatarPlaceholder: {
        backgroundColor: "#F1F5F9",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    profileInfo: {
        marginLeft: 20,
        flex: 1,
    },
    nameRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    userName: {
        fontWeight: "bold",
        color: "#1E293B",
    },
    badge: {
        backgroundColor: "#DCFCE7",
        borderRadius: 8,
        alignSelf: "flex-start",
        marginTop: 6,
    },
    badgeText: {
        color: "#16A34A",
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
    listingsCard: {
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
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
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
        color: "#2563EB",
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
    listingItem: {
        backgroundColor: "#F8FAFC",
    },
    listingName: {
        fontWeight: "600",
        color: "#1E293B",
    },
    listingPrice: {
        fontWeight: "700",
        color: "#2563EB",
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
});
