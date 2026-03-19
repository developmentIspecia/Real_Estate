import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    useWindowDimensions,
    StatusBar,
    Image,
    Platform,
    ActivityIndicator,
    KeyboardAvoidingView,
    Vibration,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE, fetchProfile, updateProfile } from "../../../api/api";
import CustomAlert from "../../../components/CustomAlert";

export default function EditProfileScreen({ navigation }) {
    const { width, height } = useWindowDimensions();
    const scale = (size) => (width / 375) * size;
    const verticalScale = (size) => (height / 812) * size;

    const [userRole, setUserRole] = useState("user");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        location: "New York, NY",
        bio: "",
        profilePhoto: "",
    });

    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [alertConfig, setAlertConfig] = useState({
        visible: false,
        title: "",
        message: "",
        onConfirm: null,
    });

    const showAlert = (title, message, onConfirm = null) => {
        setAlertConfig({ visible: true, title, message, onConfirm });
    };

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const token = await AsyncStorage.getItem("userToken");
            if (!token) return;

            const res = await fetchProfile(token);

            setFormData({
                name: res.name || "",
                email: res.email || "",
                phone: res.phone || "",
                location: res.location || "",
                bio: res.bio || "",
                profilePhoto: res.profilePhoto || "",
            });

            const role = await AsyncStorage.getItem("userRole");
            if (role) setUserRole(role);
        } catch (err) {
            console.error("Error loading user data:", err);
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            showAlert("Permission Denied", "Sorry, we need camera roll permissions to make this work!");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0]);
        }
    };

    const handleUpdateProfile = async () => {
        if (loading) return;

        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("userToken");
            if (!token) {
                alert("Session expired. Please login again.");
                return;
            }

            const formDataPayload = new FormData();
            formDataPayload.append("name", String(formData.name || ""));
            formDataPayload.append("email", String(formData.email || ""));
            formDataPayload.append("phone", String(formData.phone || ""));
            formDataPayload.append("location", String(formData.location || ""));
            formDataPayload.append("bio", String(formData.bio || ""));

            if (selectedImage) {
                const uri = selectedImage.uri;
                const uriParts = uri.split(".");
                const fileType = uriParts[uriParts.length - 1];
                const fileName = `profile_${Date.now()}.${fileType}`;
                
                formDataPayload.append("profilePhoto", {
                    uri: uri,
                    name: fileName,
                    type: `image/${fileType}`,
                });
            } else if (formData.profilePhoto) {
                formDataPayload.append("profilePhoto", formData.profilePhoto);
            }

            console.log("Sending profile update via fetch to:", `${API_BASE}/user/profile-update`);
            const response = await fetch(`${API_BASE}/user/profile-update`, {
                method: "POST",
                body: formDataPayload,
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json",
                },
            });

            const res = await response.json();

            if (response.ok) {
                if (Platform.OS !== "web") Vibration.vibrate(50);
                showAlert("Success", "Profile updated successfully!", () => {
                    navigation.goBack();
                });
            } else {
                throw new Error(res.message || "Failed to update profile.");
            }
        } catch (err) {
            console.error("Update profile error:", err);
            showAlert("Error", err.message || "Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Header */}
            <View style={[styles.header, { paddingHorizontal: scale(20), height: verticalScale(60) }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="arrow-left" size={scale(24)} color="#1E293B" />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { fontSize: scale(18) }]}>Edit Profile</Text>
                <View style={{ width: scale(24) }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: scale(20), paddingBottom: verticalScale(110) }}
                >
                    {/* Photo Section */}
                    <View style={[styles.photoSection, { marginTop: verticalScale(20), marginBottom: verticalScale(30) }]}>
                        <TouchableOpacity 
                            onPress={pickImage}
                            disabled={loading}
                            style={[styles.avatarContainer, { width: scale(110), height: scale(110), borderRadius: scale(55) }]}
                        >
                            {selectedImage ? (
                                <Image 
                                    source={{ uri: selectedImage.uri }} 
                                    style={{ width: "100%", height: "100%", borderRadius: scale(55) }} 
                                />
                            ) : formData.profilePhoto ? (
                                <Image 
                                    source={{ uri: formData.profilePhoto }} 
                                    style={{ width: "100%", height: "100%", borderRadius: scale(55) }} 
                                />
                            ) : (
                                <Ionicons name="person" size={scale(60)} color="#CBD5E1" />
                            )}
                            <View style={[styles.cameraBadge, { width: scale(32), height: scale(32), borderRadius: scale(16) }]}>
                                <Ionicons name="camera" size={scale(18)} color="#FFF" />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={{ marginTop: verticalScale(10) }}
                            onPress={pickImage}
                            disabled={loading}
                        >
                            <Text style={[styles.changePhotoText, { fontSize: scale(14) }]}>
                                Change profile photo
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Form Fields */}
                    <InputField
                        label="Full Name"
                        value={formData.name}
                        onChangeText={(text) => setFormData({ ...formData, name: text })}
                        icon="person-outline"
                        placeholder="John Doe"
                        scale={scale}
                        verticalScale={verticalScale}
                    />
                    <InputField
                        label="Email"
                        value={formData.email}
                        onChangeText={(text) => setFormData({ ...formData, email: text })}
                        icon="mail-outline"
                        placeholder="john.doe@example.com"
                        keyboardType="email-address"
                        scale={scale}
                        verticalScale={verticalScale}
                    />
                    <InputField
                        label="Phone Number"
                        value={formData.phone}
                        onChangeText={(text) => setFormData({ ...formData, phone: text })}
                        icon="call-outline"
                        placeholder="+1 (555) 123-4567"
                        keyboardType="phone-pad"
                        scale={scale}
                        verticalScale={verticalScale}
                    />
                    <InputField
                        label="Location"
                        value={formData.location}
                        onChangeText={(text) => setFormData({ ...formData, location: text })}
                        icon="location-outline"
                        placeholder="New York, NY"
                        scale={scale}
                        verticalScale={verticalScale}
                    />
                    <InputField
                        label="Bio"
                        value={formData.bio}
                        onChangeText={(text) => setFormData({ ...formData, bio: text })}
                        icon="information-circle-outline"
                        placeholder="Tell us about yourself..."
                        multiline
                        scale={scale}
                        verticalScale={verticalScale}
                    />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Save Button */}
            <View style={[styles.footer, { padding: scale(20) }]}>
                <TouchableOpacity
                    style={[styles.saveButton, { paddingVertical: verticalScale(12), borderRadius: scale(10), opacity: loading ? 0.7 : 1 }]}
                    onPress={handleUpdateProfile}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                        <>
                            <MaterialCommunityIcons name="content-save-outline" size={scale(22)} color="#FFF" style={{ marginRight: 8 }} />
                            <Text style={[styles.saveButtonText, { fontSize: scale(16) }]}>Save Changes</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                onClose={() => {
                    setAlertConfig({ ...alertConfig, visible: false });
                    if (alertConfig.onConfirm) alertConfig.onConfirm();
                }}
            />
        </SafeAreaView>
    );
}

const InputField = ({ label, value, onChangeText, icon, placeholder, keyboardType, multiline, scale, verticalScale }) => (
    <View style={[styles.inputContainer, { marginBottom: verticalScale(20) }]}>
        <Text style={[styles.label, { fontSize: scale(14), marginBottom: verticalScale(8) }]}>{label}</Text>
        <View style={[
            styles.inputWrapper,
            { height: verticalScale(48), borderRadius: scale(10) },
            multiline && [styles.multilineInput, { height: verticalScale(100), paddingVertical: verticalScale(12) }]
        ]}>
            <View style={[styles.iconBox, { width: scale(24), alignment: 'center' }]}>
                <Ionicons name={icon} size={scale(20)} color="#94A3B8" />
            </View>
            <TextInput
                style={[styles.input, { fontSize: scale(16), marginLeft: scale(10) }]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#CBD5E1"
                keyboardType={keyboardType}
                multiline={multiline}
                textAlignVertical={multiline ? "top" : "center"}
            />
        </View>
    </View>
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
    photoSection: {
        alignItems: "center",
    },
    avatarContainer: {
        backgroundColor: "#F1F5F9",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
    },
    cameraBadge: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: "#1D5FAD",
        borderWidth: 3,
        borderColor: "#FFF",
        justifyContent: "center",
        alignItems: "center",
    },
    changePhotoText: {
        color: "#64748B",
        fontWeight: "500",
    },
    inputContainer: {
        width: "100%",
    },
    label: {
        fontWeight: "bold",
        color: "#64748B",
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: "#F1F5F9",
        paddingHorizontal: 15,
    },
    multilineInput: {
        alignItems: 'flex-start',
    },
    iconBox: {
        alignItems: "center",
        justifyContent: "center",
    },
    input: {
        flex: 1,
        color: "#1E293B",
    },
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
    },
    saveButton: {
        backgroundColor: "#1D5FAD",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    saveButtonText: {
        color: "#FFF",
        fontWeight: "bold",
    },
});
