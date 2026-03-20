import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { scale, verticalScale } from "../utils/responsive";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { resetPassword } from "../api/api";

export default function ResetPasswordScreen({ route, navigation }) {
    const { email, otp } = route?.params || {};
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleResetPassword = async () => {
        if (!newPassword || !confirmPassword) {
            Alert.alert("Error", "All fields are required");
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            await resetPassword({ email, otp, newPassword });
            Alert.alert("Success", "Password reset successfully. Please login with your new password.", [
                { text: "OK", onPress: () => navigation.navigate("Login") }
            ]);
        } catch (err) {
            console.error("Reset password error:", err.response?.data || err);
            Alert.alert(
                "Error",
                err.response?.data?.message || "Failed to reset password"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingHorizontal: scale(25), paddingBottom: verticalScale(20), paddingTop: verticalScale(35) }
                    ]}
                    showsVerticalScrollIndicator={false}
                >
                    <TouchableOpacity
                        style={[styles.backButton, { width: scale(40), height: scale(40), marginLeft: scale(-10) }]}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={scale(24)} color="#1F2937" />
                    </TouchableOpacity>

                    <View style={{ marginTop: verticalScale(10), marginBottom: verticalScale(30) }}>
                        <Text style={[styles.title, { fontSize: scale(22) }]}>Reset Password</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <Text style={[styles.label, { fontSize: scale(16), marginBottom: verticalScale(10) }]}>Password</Text>
                        <View style={[styles.inputContainer, { height: verticalScale(45), borderRadius: scale(10), borderColor: "#1D5FAD", paddingHorizontal: scale(12) }]}>
                            <TextInput
                                style={[styles.input, { fontSize: scale(15) }]}
                                placeholder="Password"
                                placeholderTextColor="#C7C7CD"
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <MaterialCommunityIcons
                                    name={showPassword ? "eye-lock-open-outline" : "eye-lock-outline"}
                                    size={scale(22)}
                                    color="#1D5FAD"
                                />
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.label, { fontSize: scale(16), marginTop: verticalScale(20), marginBottom: verticalScale(10) }]}>Confirm Password</Text>
                        <View style={[styles.inputContainer, { height: verticalScale(45), borderRadius: scale(10), borderColor: "#1D5FAD", paddingHorizontal: scale(12) }]}>
                            <TextInput
                                style={[styles.input, { fontSize: scale(15) }]}
                                placeholder="Password"
                                placeholderTextColor="#C7C7CD"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirmPassword}
                            />
                            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                <MaterialCommunityIcons
                                    name={showConfirmPassword ? "eye-lock-open-outline" : "eye-lock-outline"}
                                    size={scale(22)}
                                    color="#1D5FAD"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={{ marginTop: verticalScale(40) }}>
                        <Text style={[styles.strengthLabel, { fontSize: scale(15) }]}>Weak</Text>
                        <Text style={[styles.strengthText, { fontSize: scale(13), marginTop: verticalScale(5), lineHeight: verticalScale(18) }]}>
                            Try a longer more unique password that's harder to get.
                        </Text>
                    </View>

                    <View style={{ marginTop: verticalScale(30) }}>
                        <Text style={[styles.requirementTitle, { fontSize: scale(15) }]}>Password must contain</Text>
                        <View style={{ marginTop: verticalScale(10) }}>
                            <Text style={[styles.requirementItem, { fontSize: scale(13) }]}>Contain atleast 8 characters</Text>
                            <Text style={[styles.requirementItem, { fontSize: scale(13), marginTop: verticalScale(10) }]}>1 upper case character</Text>
                            <Text style={[styles.requirementItem, { fontSize: scale(13), marginTop: verticalScale(10) }]}>1 lower case character</Text>
                            <Text style={[styles.requirementItem, { fontSize: scale(13), marginTop: verticalScale(10) }]}>1 special character</Text>
                        </View>
                    </View>

                    <View style={[styles.spacer, { minHeight: verticalScale(120) }]} />

                    <TouchableOpacity
                        style={[styles.resetButton, { paddingVertical: verticalScale(14), marginBottom: verticalScale(20), borderRadius: scale(10) }]}
                        onPress={handleResetPassword}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={[styles.resetButtonText, { fontSize: scale(16) }]}>Update Password</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    scrollContent: {
        flexGrow: 1,
    },
    backButton: {
        justifyContent: "center",
    },
    title: {
        fontWeight: "bold",
        color: "#000",
    },
    formContainer: {
        // form grouping
    },
    spacer: {
        flex: 1,
    },
    label: {
        fontWeight: "bold",
        color: "#111",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#DDD",
    },
    input: {
        flex: 1,
        color: "#000",
    },
    resetButton: {
        backgroundColor: "#1D5FAD",
        justifyContent: "center",
        alignItems: "center",
    },
    resetButtonText: {
        color: "#FFFFFF",
        fontWeight: "bold",
    },
    strengthLabel: {
        fontWeight: "bold",
        color: "#000",
    },
    strengthText: {
        color: "#777",
        fontWeight: "400",
    },
    requirementTitle: {
        fontWeight: "bold",
        color: "#333",
    },
    requirementItem: {
        color: "#888",
        fontWeight: "400",
    },
});
