import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image,
  useWindowDimensions,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io } from "socket.io-client";
import { api } from "../../api/api";
import CustomAlert from "../../components/CustomAlert";

const { width, height } = Dimensions.get("window");
const scale = (size) => (width / 375) * size;
const verticalScale = (size) => (height / 812) * size;

export default function ChatScreen({ route, navigation }) {
  const { userId, userName } = route.params || {};
  const { width, height } = useWindowDimensions();

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [token, setToken] = useState("");
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: "", message: "" });
  const intervalRef = useRef(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    const loadToken = async () => {
      const t = await AsyncStorage.getItem("userToken");
      if (!t) return;
      setToken(t);
    };
    loadToken();
  }, []);

  // ... Inside ChatScreen component ...

  useEffect(() => {
    if (!token || !userId) return;

    // Fetch initial history
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chat/conversation/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(res.data);
        setTimeout(() => flatListRef.current?.scrollToEnd(), 200);
      } catch (err) {
        console.error("Fetch messages error:", err);
      }
    };
    fetchMessages();

    // Setup Socket
    const socketUrl = api.defaults.baseURL.replace("/api", "");
    const socket = io(socketUrl);

    socket.on("connect", () => {
      console.log("Admin connected to socket");
      socket.emit("joinRoom", "admin");
    });

    socket.on("receiveMessage", (newMessage) => {
      // Only append if it belongs to the current user's thread 
      // i.e., I sent it to them, or they sent it to me
      if (newMessage.sender === userId || newMessage.receiver === userId) {
        setMessages((prev) => [...prev, newMessage]);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [token, userId]);

  const sendMessage = async () => {
    if (!messageText.trim()) return;

    try {
      const res = await api.post(
        "/chat",
        { receiverId: userId, message: messageText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Removed setMessages optimistic update here because the socket will trigger receiveMessage almost instantly
      setMessageText("");
      setTimeout(() => flatListRef.current?.scrollToEnd(), 200);
    } catch (err) {
      console.error("Send message error:", err);
      setAlertConfig({ visible: true, title: "Error", message: err.response?.data?.error || "Failed to send message" });
    }
  };

  const renderMessage = ({ item }) => {
    const isAdmin = item.role === "admin";
    return (
      <View style={[styles.messageWrapper, isAdmin ? styles.adminWrapper : styles.userWrapper, { marginVertical: verticalScale(8) }]}>
        <View style={[styles.messageBubble, isAdmin ? styles.adminBubble : styles.userBubble, { paddingVertical: verticalScale(10), paddingHorizontal: scale(16), borderRadius: scale(15) }]}>
          <Text style={[styles.messageText, isAdmin ? styles.adminText : styles.userText, { fontSize: scale(14), lineHeight: scale(20) }]}>
            {item.message}
          </Text>
        </View>
        <Text style={[styles.timestamp, isAdmin ? styles.adminTimestamp : styles.userTimestamp, { fontSize: scale(11), marginTop: verticalScale(4) }]}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1B5EAF" />

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
      />

      {/* Header */}
      <View style={[styles.header, { height: verticalScale(70), paddingHorizontal: scale(16), borderBottomLeftRadius: scale(12), borderBottomRightRadius: scale(12) }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={scale(24)} color="#FFF" />
          </TouchableOpacity>

          <View style={[styles.headerInfo, { marginLeft: scale(8) }]}>
            <View style={[styles.avatarContainer, { width: scale(40), height: scale(40), borderRadius: scale(20), borderWidth: scale(1.5) }]}>
              <Image
                source={{ uri: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80" }}
                style={[styles.avatar, { borderRadius: scale(20) }]}
              />
            </View>
            <Text style={[styles.headerName, { fontSize: scale(18), marginLeft: scale(10), letterSpacing: scale(0.2) }]} numberOfLines={1}>{userName || "John Smith"}</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? verticalScale(10) : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) => item._id || index.toString()}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: scale(20), paddingBottom: verticalScale(20) }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          showsVerticalScrollIndicator={false}
        />

        {/* Input Area */}
        <View style={[styles.inputWrapper, { paddingHorizontal: scale(15), paddingVertical: verticalScale(15), borderTopWidth: scale(1) }]}>
          <View style={[styles.inputContainer, { height: verticalScale(45), borderRadius: scale(25), marginRight: scale(12) }]}>
            <TextInput
              style={[styles.input, { fontSize: scale(14), paddingHorizontal: scale(15) }]}
              placeholder="Type a message..."
              placeholderTextColor="#94A3B8"
              value={messageText}
              onChangeText={setMessageText}
              multiline={false}
            />
          </View>
          <TouchableOpacity
            style={[styles.sendButton, { width: scale(45), height: scale(45), borderRadius: scale(12) }]}
            onPress={sendMessage}
          >
            <Feather name="send" size={scale(18)} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    backgroundColor: "#1B5EAF",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    paddingTop: Platform.OS === 'android' ? verticalScale(10) : verticalScale(5),
    justifyContent: 'center',
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 5,
  },
  headerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    backgroundColor: "#E2E8F0",
    borderColor: "rgba(255,255,255,0.4)",
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  headerName: {
    fontWeight: "700",
    color: "#FFF",
  },
  messageWrapper: {
    maxWidth: "85%",
  },
  userWrapper: {
    alignSelf: "flex-start",
  },
  adminWrapper: {
    alignSelf: "flex-end",
  },
  messageBubble: {
    // borderRadius and padding scaled inline
  },
  userBubble: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 2,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  adminBubble: {
    backgroundColor: "#2062B2",
    borderBottomRightRadius: 2,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  messageText: {
    // lineHeight scaled inline
  },
  userText: {
    color: "#334155",
    fontWeight: "400",
  },
  adminText: {
    color: "#FFFFFF",
    fontWeight: "400",
  },
  timestamp: {
    color: "#94A3B8",
  },
  userTimestamp: {
    alignSelf: 'flex-start',
    marginLeft: 4,
  },
  adminTimestamp: {
    alignSelf: 'flex-end',
    marginRight: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderTopColor: "#F1F5F9",
  },
  inputContainer: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
  },
  input: {
    color: "#1E293B",
    height: '100%',
  },
  sendButton: {
    backgroundColor: "#95B5E4",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#95B5E4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});


