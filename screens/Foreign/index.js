/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Easing,
  Dimensions
} from "react-native";
import { registerRootComponent } from "expo";
import { SafeAreaProvider } from "react-native-safe-area-context";

// استفاده از آیکون‌های پیش‌فرض اکسپو
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

// وارد کردن کامپوننت‌ها (با فرض تبدیل شدن به فرمت جاوا اسکریپت js/jsx)
import HomeScreen from "./HomeScreen";
import RatesDashboard from "./RatesDashboard";
import JewelryCollection from "./JewelryCollection";
import GoldCalculator from "./GoldCalculator";
import StoreInfo from "./StoreInfo";
import GoldAssistant from "./GoldAssistant";

const { width } = Dimensions.get("window");

export default function ForeignLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const [goldRate24K, setGoldRate24K] = useState(58.82);
  const [initialBookedItem, setInitialBookedItem] = useState(null);

  // انیمیشن‌های مربوط به Splash Screen
  const spinValue = useRef(new Animated.Value(0)).current;
  const progressValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showSplash) {
      // انیمیشن چرخش لوگو مدالیون
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 6000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // انیمیشن لودینگ بار
      Animated.timing(progressValue, {
        toValue: 1,
        duration: 2500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();

      // خروج از صفحه لودینگ بعد از ۲.۸ ثانیه
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 2800);

      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const barWidth = progressValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  // محاسبه نرخ انواع عیارها
  const goldRates = useMemo(() => {
    return [
      {
        id: "rate-24k",
        name: "Solid Gold 24K",
        purity: 1.0,
        pricePerGram: goldRate24K,
        change24h: 0.42,
        buySpread: 0.02,
        sellSpread: 0.04,
      },
      {
        id: "rate-22k",
        name: "Hallmark Gold 22K",
        purity: 22 / 24,
        pricePerGram: goldRate24K * (22 / 24),
        change24h: 0.38,
        buySpread: 0.02,
        sellSpread: 0.045,
      },
      {
        id: "rate-18k",
        name: "Standard Gold 18K",
        purity: 18 / 24,
        pricePerGram: goldRate24K * (18 / 24),
        change24h: 0.35,
        buySpread: 0.02,
        sellSpread: 0.05,
      },
      {
        id: "rate-14k",
        name: "Mid-Alloy Gold 14K",
        purity: 14 / 24,
        pricePerGram: goldRate24K * (14 / 24),
        change24h: 0.28,
        buySpread: 0.02,
        sellSpread: 0.055,
      },
      {
        id: "rate-9k",
        name: "Budget Gold 9K",
        purity: 9 / 24,
        pricePerGram: goldRate24K * (9 / 24),
        change24h: 0.15,
        buySpread: 0.03,
        sellSpread: 0.06,
      },
      {
        id: "rate-silver",
        name: "Fine Silver 999",
        purity: 0.0125,
        pricePerGram: goldRate24K * 0.0125,
        change24h: -0.12,
        buySpread: 0.05,
        sellSpread: 0.08,
      },
    ];
  }, [goldRate24K]);

  const handleNavigateToBooking = (item) => {
    if (item) {
      setInitialBookedItem(item);
    }
    setActiveTab("boutique");
  };

  const handleShortcutViewProduct = (item) => {
    setInitialBookedItem(item);
    setActiveTab("collection");
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  // ساختار صفحه اسپلش رندر شونده روی موبایل
  if (showSplash) {
    return (
      <SafeAreaView style={styles.splashContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
        
        <View style={styles.splashContent}>
          {/* لوگوی در حال چرخش مدالیوم */}
          <View style={styles.medallionWrapper}>
            <Animated.View style={[styles.outerDashedRing, { transform: [{ rotate: spin }] }]} />
            <View style={styles.innerRing} />
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>A</Text>
            </View>
          </View>

          <View style={styles.titleWrapper}>
            <Text style={styles.brandTitle}>AURA GOLD</Text>
            <Text style={styles.brandSubtitle}>HATTON GARDEN • LONDON</Text>
          </View>

          {/* لودینگ بار افقی */}
          <View style={styles.progressBarBg}>
            <Animated.View style={[styles.progressBarFill, { width: barWidth }]} />
          </View>

          <View style={styles.splashFooter}>
            <View style={styles.connectionStatus}>
              <Feather name="compass" size={14} color="#f59e0b" style={styles.spinIcon} />
              <Text style={styles.connectionText}>Connecting LBMA Ticker FIX...</Text>
            </View>
            <Text style={styles.versionText}>v24.0.2 • EXPO SDK LOADED</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
        
        {/* بخش نمایش کامپوننت فعال */}
        <View style={styles.mainContent}>
          {activeTab === "home" && (
            <HomeScreen
              goldRate24K={goldRate24K}
              onSwitchTab={handleTabClick}
              onViewProduct={handleShortcutViewProduct}
            />
          )}
          {activeTab === "rates" && (
            <RatesDashboard
              goldRate24K={goldRate24K}
              setGoldRate24K={setGoldRate24K}
              goldRates={goldRates}
            />
          )}
          {activeTab === "collection" && (
            <JewelryCollection
              goldRate24K={goldRate24K}
              onNavigateToBooking={handleNavigateToBooking}
            />
          )}
          {activeTab === "calculator" && (
            <GoldCalculator goldRate24K={goldRate24K} />
          )}
          {activeTab === "boutique" && (
            <StoreInfo
              initialBookedItem={initialBookedItem}
              clearInitialBookedItem={() => setInitialBookedItem(null)}
            />
          )}
          {activeTab === "assistant" && (
            <GoldAssistant />
          )}
        </View>

        {/* نوار ناوبری پایین صفحه (Bottom Navigation) */}
        <View style={styles.tabBar}>
          
          <TouchableOpacity
            onPress={() => handleTabClick("home")}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <Feather
              name="home"
              size={20}
              color={activeTab === "home" ? "#f59e0b" : "#737373"}
            />
            <Text style={[styles.tabLabel, activeTab === "home" && styles.tabLabelActive]}>
              Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleTabClick("rates")}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <Feather
              name="trending-up"
              size={20}
              color={activeTab === "rates" ? "#f59e0b" : "#737373"}
            />
            <Text style={[styles.tabLabel, activeTab === "rates" && styles.tabLabelActive]}>
              Rates
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleTabClick("collection")}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <Feather
              name="shopping-bag"
              size={20}
              color={activeTab === "collection" ? "#f59e0b" : "#737373"}
            />
            <Text style={[styles.tabLabel, activeTab === "collection" && styles.tabLabelActive]}>
              Collection
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleTabClick("calculator")}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="scale-balance"
              size={20}
              color={activeTab === "calculator" ? "#f59e0b" : "#737373"}
            />
            <Text style={[styles.tabLabel, activeTab === "calculator" && styles.tabLabelActive]}>
              Valuer
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleTabClick("boutique")}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <Feather
              name="map-pin"
              size={19}
              color={activeTab === "boutique" ? "#f59e0b" : "#737373"}
            />
            <Text style={[styles.tabLabel, activeTab === "boutique" && styles.tabLabelActive]}>
              Boutique
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleTabClick("assistant")}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="robot-outline"
              size={20}
              color={activeTab === "assistant" ? "#f59e0b" : "#737373"}
            />
            <Text style={[styles.tabLabel, activeTab === "assistant" && styles.tabLabelActive]}>
              Concierge
            </Text>
          </TouchableOpacity>

        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  splashContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  medallionWrapper: {
    width: 96,
    height: 96,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  outerDashedRing: {
    position: "absolute",
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: "rgba(245, 158, 11, 0.4)",
    borderStyle: "dashed",
  },
  innerRing: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#d97706",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
  logoText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#0a0a0a",
  },
  titleWrapper: {
    marginTop: 32,
    alignItems: "center",
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 4,
    color: "#f5f5f5",
  },
  brandSubtitle: {
    fontSize: 9,
    letterSpacing: 3,
    color: "#f59e0b",
    marginTop: 4,
    textTransform: "uppercase",
  },
  progressBarBg: {
    width: 160,
    height: 2,
    backgroundColor: "#171717",
    borderRadius: 1,
    overflow: "hidden",
    marginTop: 48,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#f59e0b",
  },
  splashFooter: {
    position: "absolute",
    bottom: 40,
    alignItems: "center",
  },
  connectionStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  spinIcon: {
    marginRight: 6,
  },
  connectionText: {
    fontSize: 10,
    color: "#737373",
  },
  versionText: {
    fontSize: 8,
    color: "#525252",
    letterSpacing: 1,
    marginTop: 2,
  },
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  mainContent: {
    flex: 1,
  },
  tabBar: {
    height: 64,
    flexDirection: "row",
    backgroundColor: "#0a0a0a",
    borderTopWidth: 1,
    borderColor: "#171717",
    paddingHorizontal: 14,
    paddingBottom: 8,
    alignItems: "center",
    justifyContent: "space-between",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontSize: 9,
    color: "#737373",
    marginTop: 3,
  },
  tabLabelActive: {
    color: "#f59e0b",
    fontWeight: "bold",
  },
});

// این متد برای ری‌اکت نیتیو اکسپو، کامپوننت روت اصلی را ثبت می‌کند.
registerRootComponent(ForeignLayout);