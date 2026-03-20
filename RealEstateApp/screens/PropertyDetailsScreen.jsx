import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    Dimensions,
} from "react-native";
import { scale, verticalScale } from "../utils/responsive";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";


export default function PropertyDetailsScreen({ route, navigation }) {

    const { property } = route?.params || {};

    // Default values if data is missing
    const title = property?.title || "Modern Villa in Beverly Hills";
    const price = "$ " + property?.price || "$4,250,000";
    const location = property?.location || "Beverly Hills, CA";
    const description = property?.description || "Stunning modern villa with panoramic views, featuring state-of-the-art amenities and luxurious finishes throughout. Located in one of the most prestigious neighborhoods in Beverly Hills.";
    const images = property?.images && property.images.length > 0 ? property.images : [null];

    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isSaved, setIsSaved] = useState(false);

    useFocusEffect(
        useCallback(() => {
            checkFavoriteStatus();
        }, [property])
    );

    const checkFavoriteStatus = async () => {
        if (!property?._id) return;
        try {
            const storedFavs = await AsyncStorage.getItem("favoriteProperties");
            const favsArray = storedFavs ? JSON.parse(storedFavs) : [];
            setIsSaved(favsArray.includes(property._id));
        } catch (error) {
            console.error("Error checking favorite status:", error);
        }
    };

    const toggleFavorite = async () => {
        if (!property?._id) return;
        try {
            const storedFavs = await AsyncStorage.getItem("favoriteProperties");
            let favsArray = storedFavs ? JSON.parse(storedFavs) : [];

            const isCurrentlySaved = favsArray.includes(property._id);

            if (isCurrentlySaved) {
                // Remove from favorites
                favsArray = favsArray.filter(id => id !== property._id);
                setIsSaved(false);
            } else {
                // Add to favorites
                favsArray.push(property._id);
                setIsSaved(true);
            }
            await AsyncStorage.setItem("favoriteProperties", JSON.stringify(favsArray));
        } catch (error) {
            console.error("Error toggling favorite:", error);
        }
    };

    const amenities = [
        "Swimming Pool",
        "Home Theater",
        "Smart Home",
        "Gym",
        "Wine Cellar"
    ];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Custom Header */}
            <View style={[styles.header, { height: verticalScale(50), paddingHorizontal: scale(20) }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={scale(24)} color="#000" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: verticalScale(100) }} showsVerticalScrollIndicator={false}>

                {/* Image Banner Section */}
                <View style={[styles.bannerContainer, { height: verticalScale(280) }]}>
                    {images[activeImageIndex] ? (
                        <Image
                            source={{ uri: images[activeImageIndex] }}
                            style={styles.bannerImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={[styles.imagePlaceholder, { backgroundColor: '#F3F4F6' }]}>
                            <Ionicons name="image-outline" size={scale(60)} color="#9CA3AF" />
                        </View>
                    )}

                    {/* Navigation Arrows */}
                    <View style={styles.bannerNav}>
                        <TouchableOpacity
                            style={[styles.navArrow, { left: scale(15), width: scale(36), height: scale(36) }]}
                            onPress={() => setActiveImageIndex(prev => Math.max(0, prev - 1))}
                        >
                            <Ionicons name="chevron-back" size={scale(20)} color="#000" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.navArrow, { right: scale(15), width: scale(36), height: scale(36) }]}
                            onPress={() => setActiveImageIndex(prev => Math.min(images.length - 1, prev + 1))}
                        >
                            <Ionicons name="chevron-forward" size={scale(20)} color="#000" />
                        </TouchableOpacity>
                    </View>

                    {/* Pagination Dots */}
                    <View style={[styles.pagination, { bottom: verticalScale(15) }]}>
                        {images.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    {
                                        width: index === activeImageIndex ? scale(24) : scale(8),
                                        height: scale(8),
                                        backgroundColor: index === activeImageIndex ? "#FFF" : "rgba(255,255,255,0.6)",
                                        marginHorizontal: scale(4)
                                    }
                                ]}
                            />
                        ))}
                    </View>
                </View>

                {/* Content Section */}
                <View style={{ paddingHorizontal: scale(20), marginTop: verticalScale(20) }}>
                    <Text style={[styles.priceText, { fontSize: scale(28) }]}>{price}</Text>

                    <Text style={[styles.titleText, { fontSize: scale(20), marginTop: verticalScale(15) }]}>{title}</Text>
                    <Text style={[styles.locationText, { fontSize: scale(15), marginTop: verticalScale(5) }]}>{location}</Text>

                    {/* Features Row */}
                    <View style={[styles.featuresRow, { marginTop: verticalScale(25) }]}>
                        <View style={[styles.featureBox, { padding: scale(10), borderRadius: scale(12) }]}>
                            <MaterialCommunityIcons name="bed-outline" size={scale(22)} color="#1D5FAD" />
                            <View style={{ marginLeft: scale(8) }}>
                                <Text style={[styles.featureLabel, { fontSize: scale(11) }]}>Bedrooms</Text>
                                <Text style={[styles.featureValue, { fontSize: scale(14) }]}>{property?.beds || "0"}</Text>
                            </View>
                        </View>

                        <View style={[styles.featureBox, { padding: scale(10), borderRadius: scale(12), marginHorizontal: scale(10) }]}>
                            <MaterialCommunityIcons name="bathtub-outline" size={scale(22)} color="#1D5FAD" />
                            <View style={{ marginLeft: scale(8) }}>
                                <Text style={[styles.featureLabel, { fontSize: scale(11) }]}>Bathrooms</Text>
                                <Text style={[styles.featureValue, { fontSize: scale(14) }]}>{property?.baths || "0"}</Text>
                            </View>
                        </View>

                        <View style={[styles.featureBox, { padding: scale(10), borderRadius: scale(12) }]}>
                            <MaterialCommunityIcons name="arrow-expand-all" size={scale(20)} color="#1D5FAD" />
                            <View style={{ marginLeft: scale(8) }}>
                                <Text style={[styles.featureLabel, { fontSize: scale(11) }]}>Square Ft</Text>
                                <Text style={[styles.featureValue, { fontSize: scale(14) }]}>{property?.sqft || "0"}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Description Section */}
                    <View style={{ marginTop: verticalScale(30) }}>
                        <Text style={[styles.sectionHeading, { fontSize: scale(18) }]}>Description</Text>
                        <Text style={[styles.descriptionText, { fontSize: scale(14), marginTop: verticalScale(12) }]}>
                            {description}
                        </Text>
                    </View>

                    {/* Amenities Tag Line */}
                    <View style={{ marginTop: verticalScale(25) }}>
                        <Text style={[styles.sectionHeading, { fontSize: scale(18) }]}>Amenities</Text>
                        <View style={[styles.amenitiesContainer, { marginTop: verticalScale(15) }]}>
                            {property?.amenities ? property.amenities.split(",").map((item, index) => (
                                <View key={index} style={[styles.amenityTag, { paddingHorizontal: scale(15), paddingVertical: verticalScale(10), marginRight: scale(10), marginBottom: verticalScale(10), borderRadius: scale(10) }]}>
                                    <Text style={[styles.amenityText, { fontSize: scale(14) }]}>{item.trim()}</Text>
                                </View>
                            )) : (
                                <Text style={{ color: "#9CA3AF" }}>No amenities listed</Text>
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Fixed Footer */}
            <View style={[styles.footer, { paddingHorizontal: scale(20), paddingBottom: verticalScale(25), paddingTop: verticalScale(15) }]}>
                <TouchableOpacity
                    style={[styles.secondaryAction, { width: scale(50), height: scale(50), borderRadius: scale(12) }]}
                    onPress={toggleFavorite}
                >
                    <Ionicons name={isSaved ? "heart" : "heart-outline"} size={scale(24)} color={isSaved ? "#E11D48" : "#1D5FAD"} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.primaryAction, { paddingVertical: verticalScale(12), borderRadius: scale(10), marginLeft: scale(15) }]}
                    onPress={() => navigation.navigate("ContactAdminScreen", { property })}
                >
                    <Text style={[styles.primaryActionText, { fontSize: scale(16) }]}>Contact Admin</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    bannerContainer: {
        width: "100%",
        position: "relative",
    },
    bannerImage: {
        width: "100%",
        height: "100%",
    },
    imagePlaceholder: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    bannerNav: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    navArrow: {
        backgroundColor: "rgba(255,255,255,0.8)",
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    pagination: {
        position: "absolute",
        width: "100%",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    dot: {
        borderRadius: 4,
    },
    priceText: {
        fontWeight: "bold",
        color: "#1D5FAD",
    },
    titleText: {
        fontWeight: "bold",
        color: "#1F2937",
    },
    locationText: {
        color: "#9CA3AF",
    },
    featuresRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    featureBox: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
    },
    featureLabel: {
        color: "#64748B",
    },
    featureValue: {
        fontWeight: "bold",
        color: "#1F2937",
    },
    sectionHeading: {
        fontWeight: "bold",
        color: "#1F2937",
    },
    descriptionText: {
        color: "#4B5563",
        lineHeight: 22,
    },
    footer: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        flexDirection: "row",
        backgroundColor: "#FFF",
        borderTopWidth: 1,
        borderTopColor: "#F3F4F6",
    },
    secondaryAction: {
        borderWidth: 1,
        borderColor: "#1D5FAD",
        justifyContent: "center",
        alignItems: "center",
    },
    primaryAction: {
        flex: 1,
        backgroundColor: "#1D5FAD",
        justifyContent: "center",
        alignItems: "center",
    },
    primaryActionText: {
        color: "#FFF",
        fontWeight: "bold",
    },
    amenitiesContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    amenityTag: {
        backgroundColor: "#F1F5F9",
    },
    amenityText: {
        color: "#334155",
        fontWeight: "500",
    },
});
