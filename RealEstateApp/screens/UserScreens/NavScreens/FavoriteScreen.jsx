import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    Dimensions,
} from "react-native";
import { scale, verticalScale } from "../../../utils/responsive";
import { StatusBar } from "expo-status-bar";


import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE } from "../../../api/api";

export default function FavoriteScreen({ navigation }) {

    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(false);

    useFocusEffect(
        useCallback(() => {
            fetchFavorites();
        }, [])
    );


    const fetchFavorites = async () => {
        setLoading(true);
        try {
            const storedFavs = await AsyncStorage.getItem("favoriteProperties");
            const favsArray = storedFavs ? JSON.parse(storedFavs) : [];

            const token = await AsyncStorage.getItem("userToken");
            const res = await axios.get(`${API_BASE}/properties`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const propsWithImage = res.data.map((p) => ({
                ...p,
                images:
                    p.images && p.images.length > 0
                        ? p.images.filter((img) => img && typeof img === "string" && img.startsWith("http"))
                        : [],
            }));

            // Filter by favorited items
            const favoriteProps = propsWithImage.filter((p) => favsArray.includes(p._id));
            setFavorites(favoriteProps);
        } catch (err) {
            console.error("Failed to fetch favorites:", err);
        } finally {
            setLoading(false);
        }
    };


    const removeFavorite = async (id) => {
        try {
            const storedFavs = await AsyncStorage.getItem("favoriteProperties");
            let favsArray = storedFavs ? JSON.parse(storedFavs) : [];
            favsArray = favsArray.filter(favId => favId !== id);
            await AsyncStorage.setItem("favoriteProperties", JSON.stringify(favsArray));

            setFavorites(favorites.filter((item) => item._id !== id));
        } catch (error) {
            console.error("Error removing favorite:", error);
        }
    };

    const renderFavoriteItem = ({ item: prop }) => {
        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => navigation.navigate("PropertyDetailsScreen", { property: prop })}
                style={[
                    styles.propertyCard,
                    { borderRadius: scale(15), marginBottom: verticalScale(20) },
                ]}
            >
                <View style={[styles.imageContainer, { height: verticalScale(220) }]}>
                    {prop.images && prop.images.length > 0 ? (
                        <Image
                            source={{ uri: prop.images[0] }}
                            style={styles.propertyImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={[styles.propertyImage, styles.noImagePlaceholder]}>
                            <Text style={{ color: "#9CA3AF", fontSize: scale(14) }}>No Image</Text>
                        </View>
                    )}

                    <TouchableOpacity
                        style={[
                            styles.removeIconContainer,
                            {
                                top: scale(12),
                                right: scale(12),
                                width: scale(36),
                                height: scale(36),
                                borderRadius: scale(18),
                            },
                        ]}
                        onPress={() => removeFavorite(prop._id)}
                    >
                        <Ionicons name="close" size={scale(20)} color="#FFF" />
                    </TouchableOpacity>
                </View>

                <View style={[styles.cardContent, { padding: scale(15) }]}>
                    <Text style={[styles.propertyTitle, { fontSize: scale(18) }]} numberOfLines={1}>
                        {prop.title || "Luxury Penthouse Downtown"}
                    </Text>

                    <Text style={[styles.locationText, { fontSize: scale(14), marginTop: verticalScale(4) }]}>
                        {prop.location || "Manhattan, NY"}
                    </Text>

                    <View style={[styles.specsRow, { marginTop: verticalScale(12) }]}>
                        <Text style={[styles.specText, { fontSize: scale(14) }]}>
                            {prop.bedrooms || "4"} Beds
                        </Text>
                        <Text style={[styles.specDot, { fontSize: scale(14) }]}> • </Text>
                        <Text style={[styles.specText, { fontSize: scale(14) }]}>
                            {prop.bathrooms || "3"} Baths
                        </Text>
                        <Text style={[styles.specDot, { fontSize: scale(14) }]}> • </Text>
                        <Text style={[styles.specText, { fontSize: scale(14) }]}>
                            {prop.area || "3,200"} sqft
                        </Text>
                    </View>

                    <Text style={[styles.priceText, { fontSize: scale(20), marginTop: verticalScale(12) }]}>
                        {prop.price && typeof prop.price === "string" ? (prop.price.startsWith("$ ") ? prop.price : `$ ${prop.price}`) : `$ ${prop.price || "0"}`}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />


            <SafeAreaView style={{ flex: 1 }}>
                <View style={[styles.topBar, { paddingHorizontal: scale(10), paddingVertical: verticalScale(5) }]}>
                    <View style={{ width: scale(24) }} />
                    <Text style={[styles.headerTitle, { fontSize: scale(20) }]}>Favorites</Text>
                    <Ionicons name="heart" size={scale(24)} color="#E11D48" />
                </View>

                <FlatList
                    data={favorites}
                    renderItem={renderFavoriteItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{
                        paddingHorizontal: scale(10),
                        paddingTop: verticalScale(10),
                        paddingBottom: verticalScale(30),
                    }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="heart-dislike-outline" size={scale(60)} color="#E2E8F0" />
                            <Text style={[styles.emptyText, { fontSize: scale(16), marginTop: verticalScale(10) }]}>
                                No favorite properties yet
                            </Text>
                        </View>
                    }
                    refreshing={loading}
                    onRefresh={fetchFavorites}
                />
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FDFDFD",
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
        color: "#0F172A",
    },
    propertyCard: {
        backgroundColor: "#FFF",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        overflow: "hidden",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    imageContainer: {
        width: "100%",
    },
    propertyImage: {
        width: "100%",
        height: "100%",
    },
    noImagePlaceholder: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F1F5F9",
    },
    removeIconContainer: {
        position: "absolute",
        backgroundColor: "#EF4444",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 5,
    },
    cardContent: {
        backgroundColor: "#FFF",
    },
    propertyTitle: {
        fontWeight: "bold",
        color: "#0F172A",
    },
    locationText: {
        color: "#64748B",
    },
    specsRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    specText: {
        color: "#475569",
        fontWeight: "500",
    },
    specDot: {
        color: "#94A3B8",
    },
    priceText: {
        fontWeight: "bold",
        color: "#2563EB",
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: verticalScale(100),
    },
    emptyText: {
        color: "#94A3B8",
        fontWeight: "500",
    },
});
