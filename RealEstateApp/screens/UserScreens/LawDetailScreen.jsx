// screens/UserScreens/LawDetailScreen.jsx
import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

const lawContents = {
  rera: {
    title: "RERA (Real Estate Regulatory Authority)",
    content: `The Real Estate (Regulation and Development) Act, 2016 (RERA) was enacted to protect home buyers and boost investment in the real estate sector. 
It establishes regulatory authorities for each state and aims to increase transparency, regulate transactions, and ensure timely completion of projects. Developers are required to register projects and disclose project plans, approvals, and completion schedules. Homebuyers have rights to seek refunds or compensation for delays.`
  },
  pra: {
    title: "Property Registration Act",
    content: `The Property Registration Act governs the process of registering immovable property in India. 
It ensures legal recognition of ownership and protects property transactions. Registration of property acts as evidence of ownership in courts. The act mandates stamp duty payment and proper documentation for property transfers, sales, gifts, or inheritance.`
  },
  rca: {
    title: "Rent Control Act",
    content: `The Rent Control Act regulates rental agreements and tenancy relationships. 
It sets rules for rent fixation, eviction, tenant and landlord rights, and lease renewal procedures. The aim is to protect tenants from arbitrary eviction and control excessive rent hikes while balancing landlords’ rights.`
  },
  landaa: {
    title: "Land Acquisition Act",
    content: `The Land Acquisition Act, 2013 (LAA) governs acquisition of land by government or private entities for public purposes. 
It provides a framework for fair compensation, rehabilitation, and resettlement of affected landowners. The act ensures transparency, consent of affected parties, and defines procedures for acquiring land for infrastructure projects.`
  },
  rea: {
    title: "Real Estate (Prohibition and Development) Act",
    content: `The Real Estate (Prohibition and Development) Act, 2016 (REDA) is aimed at prohibiting fraudulent real estate practices and promoting transparency. 
It regulates the sale, marketing, and development of real estate projects. Builders must register projects, provide project details online, and adhere to timelines. Violations attract penalties and allow buyers to seek legal recourse.`
  },
};

export default function LawDetailScreen({ route }) {
  const { lawKey } = route.params;
  const law = lawContents[lawKey];

  if (!law) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Law details not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      {/* Act Name Heading */}
      <Text style={styles.title}>{law.title}</Text>

      {/* Law Content */}
      <Text style={styles.content}>{law.content}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF3E0" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 16,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: "#1F2937",
    marginTop: 12,
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
});