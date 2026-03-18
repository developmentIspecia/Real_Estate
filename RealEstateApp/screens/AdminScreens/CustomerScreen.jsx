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
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ActionModal from "../../components/ActionModal";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function CustomerScreen() {
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
                            <Text style={[styles.userName, { fontSize: scale(22) }]}>John Smith</Text>
                            <View style={[styles.badge, { paddingHorizontal: scale(12), paddingVertical: verticalScale(4) }]}>
                                <Text style={[styles.badgeText, { fontSize: scale(12) }]}>customer</Text>
                            </View>
                            <Text style={[styles.joinedText, { fontSize: scale(14) }]}>Joined Jan 2024</Text>
                        </View>
                    </View>

                    <View style={[styles.divider, { marginVertical: verticalScale(20) }]} />

                    <View style={styles.contactDetails}>
                        <View style={[styles.contactRow, { marginBottom: verticalScale(16) }]}>
                            <Feather name="mail" size={scale(18)} color="#64748B" />
                            <Text style={[styles.contactText, { fontSize: scale(16), marginLeft: scale(12) }]}>john@example.com</Text>
                        </View>
                        <View style={[styles.contactRow, { marginBottom: verticalScale(16) }]}>
                            <Feather name="phone" size={scale(18)} color="#64748B" />
                            <Text style={[styles.contactText, { fontSize: scale(16), marginLeft: scale(12) }]}>+1 234 567 8900</Text>
                        </View>
                        <View style={styles.contactRow}>
                            <Ionicons name="location-outline" size={scale(20)} color="#64748B" />
                            <Text style={[styles.contactText, { fontSize: scale(16), marginLeft: scale(10) }]}>Beverly Hills, CA</Text>
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

                {/* Action Buttons */}
                <View style={[styles.actionsContainer, { marginTop: verticalScale(30) }]}>
                    <TouchableOpacity
                        style={[styles.blockButton, { paddingVertical: verticalScale(12), borderRadius: scale(10) }]}
                        onPress={() => {
                            setModalConfig({
                                title: "Block Customer",
                                message: "Are you sure you want to block this customer?",
                                action: () => console.log("Blocking customer...")
                            });
                            setModalVisible(true);
                        }}
                    >
                        <Text style={[styles.blockButtonText, { fontSize: scale(16) }]}>Block Customer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.removeButton, { paddingVertical: verticalScale(12), borderRadius: scale(10), marginTop: verticalScale(12) }]}
                        onPress={() => {
                            setModalConfig({
                                title: "Remove Customer",
                                message: "Are you sure you want to remove this customer?",
                                action: () => console.log("Removing customer...")
                            });
                            setModalVisible(true);
                        }}
                    >
                        <Text style={[styles.removeButtonText, { fontSize: scale(16) }]}>Remove Customer</Text>
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
    userName: {
        fontWeight: "bold",
        color: "#1E293B",
    },
    badge: {
        backgroundColor: "#EFF6FF",
        borderRadius: 8,
        alignSelf: "flex-start",
        marginTop: 6,
    },
    badgeText: {
        color: "#3B82F6",
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
