import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { scale, verticalScale, width } from "../../utils/responsive";
import { StatusBar } from "expo-status-bar";
import { Feather, Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, setAuthToken } from "../../api/api";

const FAQ_DATA = [
  {
    category: "Getting Started",
    items: [
      { id: "1", question: "How do I create an account?" },
      { id: "2", question: "How do I reset my password?" },
      { id: "3", question: "Is the app free to use?" },
    ],
  },
  {
    category: "Account & Settings",
    items: [
      { id: "4", question: "How do I change my profile information?" },
      { id: "5", question: "Can I delete my account?" },
      { id: "6", question: "How do I enable notifications?" },
    ],
  },
  {
    category: "Billing & Subscription",
    items: [
      { id: "7", question: "How do I upgrade to a premium plan?" },
      { id: "8", question: "Can I cancel my subscription anytime?" },
      { id: "9", question: "What payment methods do you accept?" },
    ],
  },
  {
    category: "Technical Support",
    items: [
      { id: "10", question: "The app is running slowly, what should I do?" },
      { id: "11", question: "I'm not receiving notifications" },
      { id: "12", question: "How do I report a bug?" },
    ],
  },
];

const HelpScreen = ({ navigation }) => {
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [adminContact, setAdminContact] = useState(null);

  // Fetch admin contact on mount so Live Chat can start immediately
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) return;
        setAuthToken(token);
        const res = await api.get("/user/contacts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Pick the first admin from the contacts list
        const admin = res.data.find((c) => c.role === "admin") || res.data[0];
        if (admin) {
          setAdminContact({
            id: admin._id,
            name: admin.name || "Support",
            avatar:
              admin.profilePhoto ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(admin.name || "Admin")}&background=1D5FAD&color=fff&size=128`,
          });
        }
      } catch (err) {
        console.error("Failed to fetch admin contact:", err);
      }
    };
    fetchAdmin();
  }, []);

  const handleLiveChat = () => {
    if (!adminContact) {
      Alert.alert("Unavailable", "Support chat is currently unavailable. Please try again later.");
      return;
    }
    navigation.navigate("ChatScreen", { person: adminContact });
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={scale(24)} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & FAQ</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={scale(18)} color="#94A3B8" />
          <TextInput
            placeholder="Search For Answers"
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Categories and FAQs */}
        {FAQ_DATA.map((section, sectionIdx) => (
          <View key={sectionIdx} style={styles.sectionContainer}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryTitle}>{section.category}</Text>
            </View>
            {section.items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.faqItem}
                onPress={() => toggleExpand(item.id)}
              >
                <View style={styles.faqRow}>
                  <Text style={styles.faqQuestion}>{item.question}</Text>
                  <Feather
                    name={expandedId === item.id ? "chevron-up" : "chevron-down"}
                    size={scale(18)}
                    color="#94A3B8"
                  />
                </View>
                {expandedId === item.id && (
                  <View style={styles.faqAnswerContainer}>
                    <Text style={styles.faqAnswer}>
                      This is a placeholder answer for "{item.question}". You can add more detailed content here.
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Can't find what you're looking for?</Text>
          <TouchableOpacity style={styles.footerButton} onPress={handleLiveChat}>
            <Feather name="message-circle" size={scale(18)} color="#333" />
            <Text style={styles.footerButtonText}>Live Chat</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(15),
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: scale(20),
    zIndex: 1,
  },
  headerTitle: {
    fontSize: scale(18),
    fontWeight: "bold",
    color: "#333",
  },
  scrollContent: {
    paddingBottom: verticalScale(30),
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    marginHorizontal: scale(20),
    marginVertical: verticalScale(10),
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(4),
    borderRadius: scale(12),
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  searchInput: {
    flex: 1,
    marginLeft: scale(10),
    fontSize: scale(14),
    color: "#333",
  },
  sectionContainer: {
    marginBottom: verticalScale(10),
  },
  categoryHeader: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(10),
  },
  categoryTitle: {
    fontSize: scale(14),
    fontWeight: "600",
    color: "#475569",
  },
  faqItem: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: scale(20),
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  faqRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: verticalScale(16),
  },
  faqQuestion: {
    fontSize: scale(14),
    color: "#1E293B",
    flex: 1,
    marginRight: scale(10),
  },
  faqAnswerContainer: {
    paddingBottom: verticalScale(16),
  },
  faqAnswer: {
    fontSize: scale(13),
    color: "#64748B",
    lineHeight: verticalScale(18),
  },
  footer: {
    marginTop: verticalScale(30),
    alignItems: "center",
    paddingHorizontal: scale(20),
  },
  footerText: {
    fontSize: scale(14),
    color: "#64748B",
    marginBottom: verticalScale(15),
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  footerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: scale(12),
    paddingVertical: verticalScale(12),
    width: "48%",
  },
  footerButtonText: {
    marginLeft: scale(8),
    fontSize: scale(14),
    fontWeight: "600",
    color: "#333",
  },
});

export default HelpScreen;