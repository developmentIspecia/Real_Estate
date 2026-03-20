import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    Image,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { scale, verticalScale } from "../utils/responsive";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { loginUser, setAuthToken } from "../api/api";
import CustomAlert from "../components/CustomAlert";

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        visible: false,
        title: "",
        message: "",
    });


    const showAlert = (title, message) => {
        setAlertConfig({ visible: true, title, message });
    };

    const handleLogin = async () => {
        if (!email || !password) {
            showAlert("Error", "Enter email and password");
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showAlert("Invalid Email", "Please enter a valid email address");
            return;
        }

        // Password validation
        if (password.length < 6) {
            showAlert("Invalid Password", "Password must be at least 6 characters long");
            return;
        }

        setLoading(true);
        try {
            const res = await loginUser({ email, password });

            if (res.otpRequired) {
                // Unverified user or admin — show OTP screen
                navigation.navigate("OTPVerificationScreen", {
                    email: res.email,
                    role: res.role,
                });
            } else {
                // Verified user — store token and go straight to dashboard
                await AsyncStorage.setItem("userToken", res.token);
                await AsyncStorage.setItem("userRole", res.role);
                // Clear any local favorites from previous sessions
                await AsyncStorage.removeItem("favoriteProperties");
                setAuthToken(res.token);
                navigation.replace("UserStack", {
                    screen: "UserDashboard",
                });
            }
        } catch (err) {
            console.error("Login error:", err.response?.data || err);
            showAlert(
                "Login failed",
                err.response?.data?.message || "Invalid credentials"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: "#1D5FAD", paddingHorizontal: scale(20), paddingVertical: verticalScale(10), }]}>
            <StatusBar barStyle="dark-content" />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1, justifyContent: "center" }}
            >
                <TouchableOpacity
                    style={[styles.backButton, { position: "absolute", top: 0, left: 0, width: scale(40), height: scale(40), zIndex: 1 }]}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={scale(24)} color="#FFFFFF" />
                </TouchableOpacity>

                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingVertical: verticalScale(20) }}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                >
                    <View
                        style={[
                            styles.contentBox,
                            {
                                width: "92%",
                                paddingHorizontal: scale(25),
                                paddingVertical: verticalScale(25),
                                borderRadius: scale(28),
                                alignSelf: "center",
                                // Removed fixed height: "70%" to prevent squishing when keyboard appears
                            }
                        ]}
                    >
                        <View style={[styles.logoContainer, { marginTop: verticalScale(5), marginBottom: verticalScale(5) }]}>
                            <Image
                                source={require("../assets/logo.png")}
                                style={[styles.logo, { width: scale(50), height: scale(50) }]}
                                resizeMode="contain"
                            />
                        </View>

                        <View style={{ alignItems: "center", marginBottom: verticalScale(8) }}>
                            <Text style={{ color: "#1D5FAD", fontSize: scale(23), fontWeight: "bold" }}>
                                Login to your account.
                            </Text>
                            <Text style={{ color: "#777", fontSize: scale(15), marginTop: verticalScale(5) }}>
                                Please sign in to your account
                            </Text>
                        </View>

                        <View style={styles.formContainer}>
                            <View style={[styles.inputContainer, { height: verticalScale(50), borderRadius: scale(12), paddingHorizontal: scale(15), marginBottom: verticalScale(10), marginTop: verticalScale(10) }]}>
                                <TextInput
                                    style={[styles.input, { fontSize: scale(15) }]}
                                    placeholder="Email Address"
                                    placeholderTextColor="#C7C7CD"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                                <MaterialCommunityIcons
                                    name={"email-outline"}
                                    size={scale(18)}
                                    color="#C7C7CD"
                                />
                            </View>

                            <View style={[styles.inputContainer, { height: verticalScale(50), borderRadius: scale(12), paddingHorizontal: scale(15) }]}>
                                <TextInput
                                    style={[styles.input, { fontSize: scale(15) }]}
                                    placeholder="Password"
                                    placeholderTextColor="#C7C7CD"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <MaterialCommunityIcons
                                        name={showPassword ? "eye-lock-open-outline" : "eye-lock-outline"}
                                        size={scale(18)}
                                        color="#C7C7CD"
                                    />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                onPress={() => navigation.navigate("ForgotPasswordScreen")}
                                style={{ alignSelf: "flex-end", marginTop: verticalScale(8) }}
                            >
                                <Text style={[styles.forgotPasswordText, { fontSize: scale(14) }]}>Forgot password?</Text>
                            </TouchableOpacity>
                        </View>

                        {/* <View style={[styles.spacer, { minHeight: verticalScale(20) }]} /> */}

                        <TouchableOpacity
                            style={[styles.loginButton, { paddingVertical: verticalScale(12), marginTop: verticalScale(20), marginBottom: verticalScale(10), borderRadius: scale(12) }]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={[styles.loginButtonText, { fontSize: scale(16) }]}>Login</Text>
                            )}
                        </TouchableOpacity>

                        <View style={{ flexDirection: "row", alignItems: "center", marginVertical: verticalScale(15) }}>
                            <View style={{ flex: 1, height: 1, backgroundColor: "#E5E5E5" }} />
                            <Text style={{ marginHorizontal: scale(10), color: "#777", fontSize: scale(12) }}>Or sign in with</Text>
                            <View style={{ flex: 1, height: 1, backgroundColor: "#E5E5E5" }} />
                        </View>

                        <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: verticalScale(20) }}>
                            <TouchableOpacity style={styles.socialIcon}>
                                <Image source={require("../assets/google.png")} style={{ width: scale(20), height: scale(20) }} resizeMode="contain" />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.socialIcon, { marginHorizontal: scale(15) }]}>
                                <Image source={require("../assets/facebook.png")} style={{ width: scale(25), height: scale(25) }} resizeMode="contain" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.socialIcon}>
                                <Image source={require("../assets/apple.png")} style={{ width: scale(25), height: scale(25) }} resizeMode="contain" />
                            </TouchableOpacity>
                        </View>

                        <View style={{
                            alignItems: "center"
                        }}>
                            <Text style={{ color: "#777", fontSize: scale(14) }}>
                                Don't have an account? <Text style={{ color: "#1D5FAD", fontWeight: "bold" }} onPress={() => navigation.navigate("Signup")}>Register</Text>
                            </Text>
                        </View>
                    </View>
                </ScrollView>
                <CustomAlert
                    visible={alertConfig.visible}
                    title={alertConfig.title}
                    message={alertConfig.message}
                    onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
                />
            </KeyboardAvoidingView>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    contentBox: {
        backgroundColor: "#FFFFFF",
    },
    backButton: {
        justifyContent: "center",
    },
    logoContainer: {
        alignItems: "center",
    },
    logo: {
        // scale via inline styles
    },
    formContainer: {
        // form grouping
    },
    spacer: {
        flex: 1,
    },
    label: {
        fontWeight: "bold",
        color: "#000",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E5E5E5",
    },
    input: {
        flex: 1,
        color: "#000",
    },
    loginButton: {
        backgroundColor: "#1D5FAD",
        justifyContent: "center",
        alignItems: "center",
    },
    loginButtonText: {
        color: "#FFF",
        fontWeight: "bold",
    },
    forgotPasswordText: {
        color: "#1D5FAD",
        fontWeight: "500",
    },
    socialIcon: {
        width: 45,
        height: 45,
        borderRadius: 23,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E5E5E5",
    },
});
