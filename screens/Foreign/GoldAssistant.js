/**
 * @license
 * Zarnive - Gold Assistant Screen
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ActivityIndicator
} from "react-native";
import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

// Mobile note: If you want to connect to your own live chat server, set the URL here (e.g. http://192.168.1.50:3000)
const BASE_URL = ""; 

export default function GoldAssistant() {
  const [messages, setMessages] = useState([
    {
      id: "msg-welcome-1",
      sender: "ai",
      text: "Welcome to Aura Gold London. I am your Private AI Advisor. How may I assist you with your hallmark jewellery acquisitions, physical bullion investments, or scrap gold valuations today?",
      timestamp: "Now"
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState(null);
  
  const scrollViewRef = useRef();

  // Auto-scroll to the latest message when the chat list or loading state updates
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, loading]);

  const quickQuestions = [
    "Is 22K gold better than 18K?",
    "How is showroom price calculated?",
    "Where in Hatton Garden is Aura?",
    "Can I sell antique sovereign coins?"
  ];

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim() || loading) return;

    const userMsg = {
      id: "msg-" + Date.now(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);
    setErrorStatus(null);

    try {
      if (!BASE_URL) {
        throw new Error("No backend URL configured");
      }

      const chatHistoryForServer = [...messages, userMsg].map((m) => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await fetch(`${BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatHistoryForServer })
      });

      if (!res.ok) {
        throw new Error("Advisory room temporarily offline.");
      }

      const data = await res.json();
      
      const aiMsg = {
        id: "msg-" + Date.now() + "-ai",
        sender: "ai",
        text: data.text || "I am processing your Hatton Garden jewelry inquiry.",
        timestamp: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      console.error(e);
      setErrorStatus("Connection timeout. Please retry.");
      
      // Offline fallback response (similar to web behavior)
      const aiMsgFallback = {
        id: "msg-err-fallback-" + Date.now(),
        sender: "ai",
        text: "[Offline Aura Adviser] I represent our Hatton Garden vault. In offline preview mode, we recommend 22-karat gold for majestic density and 18-karat gold for daily diamond jewelry stability. Our boutique staff are available on +44 (0) 20 7946 0852 to take your questions!",
        timestamp: "Offline Fix"
      };
      
      // Add a short delay to simulate a live conversation feel
      setTimeout(() => {
        setMessages((prev) => [...prev, aiMsgFallback]);
        setLoading(false);
      }, 1000);
    } finally {
      // Update loading state on successful server response
      if (BASE_URL) {
        setLoading(false);
      }
    }
  };

  const onQuestionChipClick = (question) => {
    handleSendMessage(question);
  };

  const handleInputSubmit = () => {
    handleSendMessage(inputText);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      
      {/* Gold concierge header section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.tagText}>Gold Concierge</Text>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Aura-AI Advisor</Text>
            <Ionicons name="sparkles" size={14} color="#f59e0b" style={styles.sparkle} />
          </View>
        </View>
        <View style={styles.headerBadge}>
          <MaterialCommunityIcons name="robot-outline" size={16} color="#fbbf24" />
        </View>
      </View>

      {/* Chat messages list */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatScroll}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((m) => {
          const isAi = m.sender === "ai";
          return (
            <View
              key={m.id}
              style={[
                styles.bubbleContainer,
                isAi ? styles.bubbleLeft : styles.bubbleRight
              ]}
            >
              {/* Message author name and timestamp */}
              <Text style={[styles.bubbleTag, !isAi && styles.textRight]}>
                {isAi ? "✦ AURA-AI ADVISOR" : "MY INQUIRY"} · {m.timestamp}
              </Text>
              
              {/* Chat message body */}
              <View style={[
                styles.bubbleBody,
                isAi ? styles.bubbleBodyAi : styles.bubbleBodyUser
              ]}>
                <Text style={[
                  styles.bubbleText,
                  isAi ? styles.bubbleTextAi : styles.bubbleTextUser
                ]}>
                  {m.text}
                </Text>
              </View>
            </View>
          );
        })}

        {/* AI thinking status bubble */}
        {loading && (
          <View style={[styles.bubbleContainer, styles.bubbleLeft]}>
            <Text style={styles.thinkingText}>✦ AURA-AI THINKING...</Text>
            <View style={styles.thinkingBubble}>
              <ActivityIndicator size="small" color="#fbbf24" />
            </View>
          </View>
        )}

        {/* Error message displayed when there is a connection issue */}
        {errorStatus && (
          <View style={styles.errorBox}>
            <Feather name="alert-circle" size={14} color="#fbbf24" />
            <Text style={styles.errorText}>{errorStatus}</Text>
          </View>
        )}
      </ScrollView>

      {/* Quick suggestion chips (only shown when input is empty) */}
      {inputText.trim() === "" && (
        <View style={styles.chipsContainer}>
          <View style={styles.chipsHeader}>
            <Feather name="help-circle" size={14} color="#737373" />
            <Text style={styles.chipsTitle}>Quick Consulting Scenarios</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScroll}
            style={styles.chipsWrapper}
          >
            {quickQuestions.map((q, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => onQuestionChipClick(q)}
                style={styles.chipBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.chipText}>{q}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Bottom chat input section */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.chatInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Consult Aura-AI about bullion or jewellery..."
          placeholderTextColor="#525252"
          disabled={loading}
          returnKeyType="send"
          onSubmitEditing={handleInputSubmit}
        />
        <TouchableOpacity
          onPress={handleInputSubmit}
          disabled={!inputText.trim() || loading}
          style={[
            styles.sendBtn,
            inputText.trim() ? styles.sendBtnActive : styles.sendBtnDisabled
          ]}
          activeOpacity={0.8}
        >
          <Feather 
            name="send" 
            size={16} 
            color={inputText.trim() ? "#0a0a0a" : "#404040"} 
          />
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#171717",
    backgroundColor: "#0a0a0a",
  },
  tagText: {
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1.2,
    color: "#f59e0b",
    textTransform: "uppercase",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#f5f5f5",
  },
  sparkle: {
    marginLeft: 6,
  },
  headerBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#171717",
    borderWidth: 1,
    borderColor: "#262626",
    alignItems: "center",
    justifyContent: "center",
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  bubbleContainer: {
    maxWidth: "85%",
    gap: 4,
  },
  bubbleLeft: {
    alignSelf: "flex-start",
  },
  bubbleRight: {
    alignSelf: "flex-end",
  },
  bubbleTag: {
    fontSize: 9,
    color: "#525252",
    letterSpacing: 0.5,
  },
  textRight: {
    textAlign: "right",
  },
  bubbleBody: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  bubbleBodyAi: {
    backgroundColor: "#171717",
    borderColor: "#1f1f1f",
    borderWidth: 1,
    borderTopLeftRadius: 0,
  },
  bubbleBodyUser: {
    backgroundColor: "#fbbf24",
    borderTopRightRadius: 0,
  },
  bubbleText: {
    fontSize: 12,
    lineHeight: 18,
  },
  bubbleTextAi: {
    color: "#d4d4d4",
  },
  bubbleTextUser: {
    color: "#0a0a0a",
    fontWeight: "500",
  },
  thinkingText: {
    fontSize: 9,
    color: "#fbbf24",
    letterSpacing: 0.5,
  },
  thinkingBubble: {
    backgroundColor: "#171717",
    borderColor: "#1f1f1f",
    borderWidth: 1,
    borderRadius: 16,
    borderTopLeftRadius: 0,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: "flex-start",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(245, 158, 11, 0.05)",
    borderColor: "rgba(245, 158, 11, 0.15)",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    gap: 6,
  },
  errorText: {
    fontSize: 10,
    color: "#fbbf24",
  },
  chipsContainer: {
    backgroundColor: "#0a0a0a",
    borderTopWidth: 1,
    borderColor: "rgba(23, 23, 23, 0.4)",
    paddingVertical: 10,
  },
  chipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 6,
  },
  chipsTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#737373",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  chipsWrapper: {
    marginHorizontal: -16,
  },
  chipsScroll: {
    paddingHorizontal: 16,
    gap: 6,
  },
  chipBtn: {
    backgroundColor: "#171717",
    borderColor: "#1f1f1f",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  chipText: {
    fontSize: 10.5,
    color: "#a3a3a3",
    fontWeight: "500",
  },
  inputBar: {
    flexDirection: "row",
    backgroundColor: "#0a0a0a",
    borderTopWidth: 1,
    borderColor: "#171717",
    padding: 12,
    gap: 8,
    alignItems: "center",
    paddingBottom: 24, // Safe area bottom padding for modern displays
  },
  chatInput: {
    flex: 1,
    backgroundColor: "#171717",
    borderColor: "#1f1f1f",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#f5f5f5",
    fontSize: 12,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  sendBtnActive: {
    backgroundColor: "#fbbf24",
    borderColor: "#fbbf24",
  },
  sendBtnDisabled: {
    backgroundColor: "#171717",
    borderColor: "#1f1f1f",
  },
});
