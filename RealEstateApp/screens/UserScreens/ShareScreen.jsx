import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Alert } from 'react-native';

const ShareAppScreen = () => {
  const handleShare = async () => {
    try {
      const result = await Share.share({
        message:
          '🏠 Check out the RealState App — find your dream home easily! Download now and explore amazing properties. 🔗 https://yourappdownloadlink.com',
      });

      if (result.action === Share.sharedAction) {
        Alert.alert('Thanks for sharing!', 'We appreciate your support 🤝');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while sharing the app.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Share Our App</Text>
      <Text style={styles.subtitle}>
        Help your friends and family find their perfect property by sharing this app!
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleShare}>
        <Text style={styles.buttonText}>📤 Share Now</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9C4',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    marginBottom: 28,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#FFD54F',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
    elevation: 3,
  },
  buttonText: {
    color: '#333',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default ShareAppScreen;