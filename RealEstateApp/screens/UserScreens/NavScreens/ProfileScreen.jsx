import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    useWindowDimensions,
    StatusBar,
    Animated,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchProfile } from "../../../api/api";
import { useFocusEffect } from "@react-navigation/native";
import LogoutModal from "../../../components/LogoutModal";

export default function ProfileScreen({ navigation }) {
    const { width, height } = useWindowDimensions();
    const scale = (size) => (width / 375) * size;
    const verticalScale = (size) => (height / 812) * size;

    const [userName, setUserName] = useState("User");
    const [userEmail, setUserEmail] = useState("user@gmail.com");
    const [userBio, setUserBio] = useState("");
    const [profilePhoto, setProfilePhoto] = useState("");
    const [userRole, setUserRole] = useState("user");
    const [logoutModalVisible, setLogoutModalVisible] = useState(false);


    useFocusEffect(
        React.useCallback(() => {
            fetchUser();
        }, [])
    );

    const fetchUser = async () => {
        try {
            const token = await AsyncStorage.getItem("userToken");
            if (!token) return;

            const data = await fetchProfile(token);

            setUserName(data?.name || "User");
            setUserEmail(data?.email || "user@gmail.com");
            setUserBio(data?.bio || "");
            setProfilePhoto(data?.profilePhoto || "");

            const role = await AsyncStorage.getItem("userRole");
            if (role) setUserRole(role);
        } catch (err) {
            console.error("Error fetching user:", err);
        }
    };


    const handleLogout = async () => {
        setLogoutModalVisible(false);
        await AsyncStorage.removeItem("userToken");
        navigation.replace("Login");
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />


            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <View style={[styles.topBar, { paddingHorizontal: scale(20), height: verticalScale(60) }]}>
                    {userRole === "admin" ? (
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={scale(24)} color="#1E293B" />
                        </TouchableOpacity>
                    ) : (
                        <View style={{ width: scale(24) }} />
                    )}
                    <Text style={[styles.headerTitle, { fontSize: scale(18) }]}>Profile</Text>
                    <View style={{ width: scale(24) }} />
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: verticalScale(100) }}
                >
                    {/* Header section with Avatar and Edit button */}
                    <View style={[styles.profileHeaderCard, { padding: scale(20) }]}>
                        <View style={styles.userInfoRow}>
                            <View style={[styles.avatarWrapper, { width: scale(80), height: scale(80), borderRadius: scale(40) }]}>
                                {profilePhoto ? (
                                    <Image
                                        source={{ uri: profilePhoto }}
                                        style={[styles.avatarImage, { borderRadius: scale(40) }]}
                                    />
                                ) : (
                                    <Image
                                        source={{ uri: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80" }}
                                        style={[styles.avatarImage, { borderRadius: scale(40) }]}
                                    />
                                )}
                            </View>
                            <View style={styles.userNameEmail}>
                                <Text style={[styles.profileName, { fontSize: scale(22) }]}>{userName}</Text>
                                <Text style={[styles.profileEmail, { fontSize: scale(14) }]}>{userEmail}</Text>
                            </View>
                        </View>

                        {userBio ? (
                            <View style={[styles.bioSection, { paddingVertical: verticalScale(10) }]}>
                                <Text style={[styles.sectionTitle, { fontSize: scale(16) }]}>About Me</Text>
                                <Text style={[styles.bioText, { fontSize: scale(14), marginTop: verticalScale(4) }]}>{userBio}</Text>
                            </View>
                        ) : null}

                        <TouchableOpacity style={[styles.editProfileBtn, { marginTop: verticalScale(10), paddingVertical: verticalScale(12), borderRadius: scale(10) }]} onPress={() => navigation.navigate("EditProfileScreen")}>
                            <Text style={[styles.editBtnText, { fontSize: scale(16) }]}>Edit Profile</Text>
                        </TouchableOpacity>
                    </View>


                    {/* Profile Menu Items */}
                    <View style={[styles.menuList, { marginTop: verticalScale(10) }]}>
                        {/* <ProfileMenuItem
                            icon="heart-outline"
                            title="My Favorites"
                            onPress={() => navigation.navigate("SavedScreen")}
                            scale={scale}
                            verticalScale={verticalScale}
                        /> */}
                        {userRole === "admin" && (
                            <ProfileMenuItem
                                IconComponent={MaterialCommunityIcons}
                                icon="account-cog-outline"
                                title="Admin Actions"
                                onPress={() => navigation.navigate("AdminActionsScreen")}
                                scale={scale}
                                verticalScale={verticalScale}
                            />
                        )}
                        <ProfileMenuItem
                            icon="settings-outline"
                            title="Settings"
                            onPress={() => navigation.navigate("SettingsScreen")}
                            scale={scale}
                            verticalScale={verticalScale}
                        />
                        <ProfileMenuItem
                            icon="help-circle-outline"
                            title="Help Center"
                            onPress={() => navigation.navigate("HelpScreen")}
                            scale={scale}
                            verticalScale={verticalScale}
                        />
                        <ProfileMenuItem
                            icon="log-out-outline"
                            title="Logout"
                            onPress={() => setLogoutModalVisible(true)}
                            isLogout
                            scale={scale}
                            verticalScale={verticalScale}
                        />
                    </View>
                </ScrollView>
            </SafeAreaView>

            <LogoutModal
                visible={logoutModalVisible}
                onClose={() => setLogoutModalVisible(false)}
                onConfirm={handleLogout}
            />
        </View>
    );
}


const ProfileMenuItem = ({ icon, title, onPress, isLogout, scale, verticalScale, IconComponent = Ionicons }) => (
    <TouchableOpacity
        style={[styles.profileItem, { paddingVertical: verticalScale(15) }]}
        onPress={onPress}
    >
        <View style={[styles.iconBox, { width: scale(40), height: scale(40), borderRadius: scale(20), backgroundColor: isLogout ? "#FEF2F2" : "#F8FAFC" }]}>
            <IconComponent name={icon} size={scale(20)} color={isLogout ? "#EF4444" : "#94A3B8"} />
        </View>
        <Text style={[styles.profileItemText, { fontSize: scale(16), marginLeft: scale(15), color: isLogout ? "#EF4444" : "#1E293B" }]}>{title}</Text>
        <Feather name="chevron-right" size={scale(18)} color="#CBD5E1" />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    topBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    headerTitle: {
        fontWeight: "bold",
        color: "#1E293B",
        textAlign: "center",
        flex: 1,
    },
    backButton: {
        padding: 5,
    },
    profileHeaderCard: {
        backgroundColor: "#FFF",
    },
    userInfoRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    avatarWrapper: {
        backgroundColor: "#F1F5F9",
        overflow: "hidden",
    },
    avatarImage: {
        width: "100%",
        height: "100%",
    },
    userNameEmail: {
        marginLeft: 15,
        flex: 1,
    },
    profileName: {
        fontWeight: "bold",
        color: "#1E293B",
    },
    profileEmail: {
        color: "#94A3B8",
    },
    editProfileBtn: {
        backgroundColor: "#1D5FAD",
        justifyContent: "center",
        alignItems: "center",
    },
    editBtnText: {
        color: "#FFF",
        fontWeight: "bold",
    },
    menuList: {
        paddingHorizontal: 20,
    },
    profileItem: {
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    iconBox: {
        justifyContent: "center",
        alignItems: "center",
    },
    profileItemText: {
        flex: 1,
        fontWeight: "500",
    },
    bioSection: {
        marginTop: 20,
    },
    sectionTitle: {
        fontWeight: "bold",
        color: "#1E293B",
    },
    bioText: {
        color: "#64748B",
        lineHeight: 20,
    },
});
