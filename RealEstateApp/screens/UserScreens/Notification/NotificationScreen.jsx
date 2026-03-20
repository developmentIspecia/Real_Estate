import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
} from "react-native";
import { scale, verticalScale } from "../../../utils/responsive";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const notificationsData = [
    {
        id: "1",
        title: "Property Saved",
        description: 'You saved "Modern Villa in Beverly Hills" to your favorites.',
        time: "2 hours ago",
        isUnread: true,
    },
    {
        id: "2",
        title: "New Message",
        description: "Sarah Johnson sent you a message about the viewing.",
        time: "5 hours ago",
        isUnread: true,
    },
    {
        id: "3",
        title: "Price Drop",
        description: 'The price of "Luxury Penthouse Downtown" has been reduced.',
        time: "Yesterday",
        isUnread: false,
    },
    {
        id: "4",
        title: "New Property",
        description: "A new property matching your search criteria is available.",
        time: "2 days ago",
        isUnread: false,
    },
];

export default function NotificationScreen({ navigation }) {

    const renderNotificationItem = ({ item }) => (
        <View style={[styles.notificationItem, { paddingVertical: verticalScale(16), paddingHorizontal: scale(20) }]}>
            <View style={styles.contentHeader}>
                <Text style={[styles.title, { fontSize: scale(16) }]}>{item.title}</Text>
                {item.isUnread && <View style={[styles.unreadDot, { width: scale(8), height: scale(8), borderRadius: scale(4) }]} />}
            </View>
            <Text style={[styles.description, { fontSize: scale(14), marginTop: verticalScale(4) }]} numberOfLines={2}>
                {item.description}
            </Text>
            <Text style={[styles.time, { fontSize: scale(12), marginTop: verticalScale(8) }]}>
                {item.time}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Header */}
            <View style={[styles.header, { height: verticalScale(60), paddingHorizontal: scale(20) }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={scale(24)} color="#1E293B" />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { fontSize: scale(20) }]}>Notifications</Text>
                <View style={{ width: scale(24) }} />
            </View>

            <FlatList
                data={notificationsData}
                renderItem={renderNotificationItem}
                keyExtractor={(item) => item.id}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: verticalScale(20) }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontWeight: "bold",
        color: "#1E293B",
    },
    notificationItem: {
        backgroundColor: "#FFFFFF",
    },
    contentHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: {
        fontWeight: "bold",
        color: "#1E293B",
    },
    unreadDot: {
        backgroundColor: "#3B82F6",
    },
    description: {
        color: "#64748B",
        lineHeight: 20,
    },
    time: {
        color: "#94A3B8",
    },
    separator: {
        height: 1,
        backgroundColor: "#F1F5F9",
    },
});
