import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    useWindowDimensions,
    StatusBar,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function AdminActionsScreen({ navigation }) {
    const { width, height } = useWindowDimensions();
    const scale = (size) => (width / 375) * size;
    const verticalScale = (size) => (height / 812) * size;

    const adminOptions = [
        {
            id: "users",
            title: "Manage Users",
            onPress: () => {
                // Since Users tab is in UserDashboard, we might need different logic
                // or navigate to a dedicated screen if it's not a tab here.
                // For now, assuming we navigate to the Users management view
                navigation.navigate("UserDashboard", { screen: "Users" });
            },
        },
        {
            id: "properties",
            title: "Manage Properties",
            onPress: () => {
                navigation.navigate("UserDashboard", { screen: "Home" });
            },
        },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                {/* Header */}
                <View style={[styles.header, { paddingHorizontal: scale(20), paddingVertical: verticalScale(15) }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={scale(24)} color="#1E293B" />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { fontSize: scale(18) }]}>Admin Actions</Text>
                    <View style={{ width: scale(24) }} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: verticalScale(10) }}>
                    {adminOptions.map((option) => (
                        <TouchableOpacity
                            key={option.id}
                            style={[styles.actionItem, { paddingVertical: verticalScale(20), paddingHorizontal: scale(20) }]}
                            onPress={option.onPress}
                        >
                            <Text style={[styles.actionText, { fontSize: scale(16) }]}>{option.title}</Text>
                            <Ionicons name="chevron-forward" size={scale(20)} color="#CBD5E1" />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </SafeAreaView>
        </View>
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
        padding: 5,
    },
    headerTitle: {
        fontWeight: "bold",
        color: "#1E293B",
        textAlign: "center",
        flex: 1,
    },
    actionItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderBottomColor: "#F8FAFC",
    },
    actionText: {
        color: "#1E293B",
        fontWeight: "500",
    },
});
