import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scale, verticalScale } from '../../utils/responsive';

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
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Share Our App</Text>
        <Text style={styles.subtitle}>
          Help your friends and family find their perfect property by sharing this app!
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleShare}>
          <Text style={styles.buttonText}>📤 Share Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9C4',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(24),
  },
  title: {
    fontSize: scale(26),
    fontWeight: '700',
    color: '#333',
    marginBottom: verticalScale(12),
  },
  subtitle: {
    fontSize: scale(16),
    textAlign: 'center',
    color: '#555',
    marginBottom: verticalScale(28),
    lineHeight: scale(22),
  },
  button: {
    backgroundColor: '#FFD54F',
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(28),
    borderRadius: scale(10),
    elevation: 3,
  },
  buttonText: {
    color: '#333',
    fontWeight: '700',
    fontSize: scale(16),
  },
});

export default ShareAppScreen;