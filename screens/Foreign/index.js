/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Animated,
} from "react-native";
import { registerRootComponent } from "expo";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

// استفاده از آیکون‌های نیتیو متناظر با نسخه وب
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

// وارد کردن کامپوننت‌های جدید به صورت جاوااسکریپت ساده
import Header from "../../components/Header";
import PortfolioView from "../../components/PortfolioView";
import CustomOrderView from "../../components/CustomOrderView";
import FAQView from "../../components/FAQView";
import AboutContactView from "../../components/AboutContactView";

export default function ForeignLayout() {
  const [activeTab, setActiveTab] = useState("portfolio");
  
  // متغیرهای وضعیت برای مقداردهی اولیه فرم سفارش اختصاصی
  const [prefilledType, setPrefilledType] = useState("");
  const [prefilledDesc, setPrefilledDesc] = useState("");

  // انیمیشن برای انتقال نرم بین صفحات هنگام تغییر تب‌ها
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [activeTab]);

  // مدیریت سفارش نمونه‌های مشابه از بخش گالری
  const handleOrderSimilar = (productType, description) => {
    setPrefilledType(productType);
    setPrefilledDesc(description);
    setActiveTab("custom_order");
  };

  // پاکسازی مقادیر پیش‌فرض بعد از ثبت یا بازنشانی
  const handleOrderSubmitted = () => {
    setPrefilledType("");
    setPrefilledDesc("");
    setActiveTab("portfolio");
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case "portfolio":
        return <PortfolioView onOrderSimilar={handleOrderSimilar} />;
      case "custom_order":
        return (
          <CustomOrderView
            initialProductType={prefilledType}
            initialDescription={prefilledDesc}
            onOrderSubmitted={handleOrderSubmitted}
          />
        );
      case "faq":
        return <FAQView />;
      case "about_contact":
        return <AboutContactView />;
      default:
        return <PortfolioView onOrderSimilar={handleOrderSimilar} />;
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView edges={['top']} style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fafafa" />
        
        <Header />

        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          bounces={true}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
            {renderActiveView()}
          </Animated.View>

        </ScrollView>

        <View style={styles.tabBarContainer}>
          <View style={styles.tabBar}>
            
            <TouchableOpacity
              onPress={() => setActiveTab("portfolio")}
              style={[
                styles.tabItem,
                activeTab === "portfolio" && styles.tabItemActive
              ]}
              activeOpacity={0.8}
            >
              <Feather
                name="award"
                size={18}
                color={activeTab === "portfolio" ? "#b45309" : "#a3a3a3"}
              />
              <Text style={[
                styles.tabLabel,
                activeTab === "portfolio" ? styles.tabLabelActive : styles.tabLabelInactive
              ]}>
                Showcase
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setPrefilledType("");
                setPrefilledDesc("");
                setActiveTab("custom_order");
              }}
              style={[
                styles.tabItem,
                activeTab === "custom_order" && styles.tabItemActive
              ]}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="order-bool-ascending"
                size={18}
                color={activeTab === "custom_order" ? "#b45309" : "#a3a3a3"}
              />
              <Text style={[
                styles.tabLabel,
                activeTab === "custom_order" ? styles.tabLabelActive : styles.tabLabelInactive
              ]}>
                Custom Order
              </Text>
            </TouchableOpacity>

            {/* تب سوم: سوالات متداول (FAQ) */}
            <TouchableOpacity
              onPress={() => setActiveTab("faq")}
              style={[
                styles.tabItem,
                activeTab === "faq" && styles.tabItemActive
              ]}
              activeOpacity={0.8}
            >
              <Feather
                name="help-circle"
                size={18}
                color={activeTab === "faq" ? "#b45309" : "#a3a3a3"}
              />
              <Text style={[
                styles.tabLabel,
                activeTab === "faq" ? styles.tabLabelActive : styles.tabLabelInactive
              ]}>
                FAQ
              </Text>
            </TouchableOpacity>

            {/* تب چهارم: درباره ما (About Us) */}
            <TouchableOpacity
              onPress={() => setActiveTab("about_contact")}
              style={[
                styles.tabItem,
                activeTab === "about_contact" && styles.tabItemActive
              ]}
              activeOpacity={0.8}
            >
              <Feather
                name="info"
                size={18}
                color={activeTab === "about_contact" ? "#b45309" : "#a3a3a3"}
              />
              <Text style={[
                styles.tabLabel,
                activeTab === "about_contact" ? styles.tabLabelActive : styles.tabLabelInactive
              ]}>
                About Us
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  scrollContent: {
    paddingBottom: 120, // ایجاد فضای خالی لازم برای تب‌بار شناور انتهای صفحه
    paddingHorizontal: 16,
  },
  footer: {
    borderTopWidth: 1,
    borderColor: "rgba(254, 243, 199, 0.3)",
    paddingVertical: 32,
    backgroundColor: "#171717",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    marginHorizontal: -16,
    paddingHorizontal: 24,
  },
  footerBrand: {
    fontSize: 10,
    color: "#f59e0b",
    letterSpacing: 3,
    textTransform: "uppercase",
    fontWeight: "bold",
    marginBottom: 8,
  },
  footerCopyright: {
    color: "#737373",
    fontSize: 11,
    textAlign: "center",
    lineHeight: 16,
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  footerSubtext: {
    color: "#525252",
    fontSize: 11,
  },
  heartIcon: {
    marginHorizontal: 4,
  },
  tabBarContainer: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 40,
  },
  tabBar: {
    flexDirection: "row",
    width: "100%",
    maxWidth: 420,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(254, 243, 199, 0.8)",
    padding: 8,
    justifyContent: "space-around",
    alignItems: "center",
    // استایل دهی سایه ملایم
    shadowColor: "#78350f",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
  tabItem: {
    flexDirection: "column",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  tabItemActive: {
    backgroundColor: "#fef3c7", // تغییر پس‌زمینه تب انتخاب شده به زرد/طلایی ملایم
  },
  tabLabel: {
    fontSize: 9,
    textTransform: "uppercase",
    fontWeight: "600",
    letterSpacing: 0.5,
    marginTop: 4,
  },
  tabLabelActive: {
    color: "#78350f",
    fontWeight: "bold",
  },
  tabLabelInactive: {
    color: "#a3a3a3",
  },
});

// ثبت روت کامپوننت با نام ForeignLayout
registerRootComponent(ForeignLayout);