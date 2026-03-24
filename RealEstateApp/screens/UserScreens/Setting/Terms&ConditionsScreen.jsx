import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { scale, verticalScale } from "../../../utils/responsive";

const TermsAndConditionsScreen = () => {
  const navigation = useNavigation();
  const [accepted, setAccepted] = useState(false);

  // Load from AsyncStorage on mount to stay in sync with SignupScreen checkbox
  useEffect(() => {
    AsyncStorage.getItem("termsAccepted").then((val) => {
      if (val === "true") setAccepted(true);
    });
  }, []);

  const handleAccept = async () => {
    await AsyncStorage.setItem("termsAccepted", "true");
    setAccepted(true);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={scale(24)} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Condition</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.clauseContainer}>
          <Text style={styles.clauseTitle}>Clause 1</Text>
          <Text style={styles.clauseText}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Viverra condimentum eget purus in. Consectetur eget id morbi amet amet, in. Ipsum viverra pretium tellus neque. Ullamcorper suspendisse aenean leo pharetra in sit semper et. Amet quam placerat sem.
          </Text>
        </View>

        <View style={styles.clauseContainer}>
          <Text style={styles.clauseTitle}>Clause 2</Text>
          <Text style={styles.clauseText}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Viverra condimentum eget purus in. Consectetur eget id morbi amet amet, in. Ipsum viverra pretium tellus neque. Ullamcorper suspendisse aenean leo pharetra in sit semper et. Amet quam placerat sem.
          </Text>
          <Text style={[styles.clauseText, { marginTop: verticalScale(10) }]}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Viverra condimentum eget purus in. Consectetur eget id morbi amet amet, in. Ipsum viverra pretium tellus neque. Ullamcorper suspendisse aenean leo pharetra in sit semper et. Amet quam placerat sem.
          </Text>
        </View>

        <View style={styles.clauseContainer}>
          <Text style={styles.clauseTitle}>3. Clause 3</Text>
          <Text style={styles.clauseText}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Viverra condimentum eget purus in. Consectetur eget id morbi amet amet, in. Ipsum viverra pretium tellus neque. Ullamcorper suspendisse aenean leo pharetra in sit semper et. Amet quam placerat sem.
          </Text>
          <Text style={[styles.clauseText, { marginTop: verticalScale(10) }]}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Viverra condimentum eget purus in. Consectetur eget id morbi amet amet, in. Ipsum viverra pretium tellus neque. Ullamcorper suspendisse aenean leo pharetra in sit semper et. Amet quam placerat sem.
          </Text>
        </View>
        <View style={{ height: verticalScale(40) }} />
      </ScrollView>

      {/* Footer / Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.acceptButton, accepted && styles.acceptButtonDisabled]} 
          onPress={handleAccept}
          disabled={accepted}
        >
          <Text style={styles.acceptButtonText}>Accept & Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default TermsAndConditionsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(16),
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: scale(16),
    padding: scale(4),
    zIndex: 1,
  },
  headerTitle: {
    fontSize: scale(18),
    fontWeight: "bold",
    color: "#333",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: scale(20),
  },
  clauseContainer: {
    marginBottom: verticalScale(20),
  },
  clauseTitle: {
    fontSize: scale(16),
    fontWeight: "bold",
    color: "#333",
    marginBottom: verticalScale(8),
  },
  clauseText: {
    fontSize: scale(14),
    color: "#666",
    lineHeight: verticalScale(22),
  },
  footer: {
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(16),
    backgroundColor: "#fff",
  },
  acceptButton: {
    backgroundColor: "#1D5FAD",
    paddingVertical: verticalScale(14),
    borderRadius: scale(25),
    alignItems: "center",
    justifyContent: "center",
    width: "60%",
    alignSelf: "center",
  },
  acceptButtonDisabled: {
    opacity: 0.5,
  },
  acceptButtonText: {
    color: "#fff",
    fontSize: scale(14),
    fontWeight: "bold",
  },
});
