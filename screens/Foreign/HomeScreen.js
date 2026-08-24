/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions
} from "react-native";
import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { JEWELRY_INVENTORY } from "./portfolioData";
import { SafeAreaView } from "react-native-safe-area-context";

// نکته موبایل: در صورت تمایل به ارتباط زنده با سرور خود، آدرس آن را اینجا تنظیم کنید (مثلاً http://192.168.1.50:3000)
const BASE_URL = ""; 

export default function HomeScreen({ goldRate24K, onSwitchTab, onViewProduct }) {
  const [marketBrief, setMarketBrief] = useState("");
  const [loadingBrief, setLoadingBrief] = useState(true);

  // واکشی تفسیر روزانه بازار از سرور
  useEffect(() => {
    let active = true;
    const fetchBrief = async () => {
      try {
        const spotFormatted = `£${(goldRate24K * 31.1035).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
        
        if (!BASE_URL) {
          throw new Error("No backend URL configured");
        }

        const res = await fetch(`${BASE_URL}/api/market-brief?price=${encodeURIComponent(spotFormatted)}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (active) {
          setMarketBrief(data.brief);
        }
      } catch (err) {
        if (active) {
          setMarketBrief(
            "Gold Morning Fix: Pure London bullion (99.9%) indices hold steady. " +
            "Hatton Garden suppliers cite consistent high-net-worth liquidity interest " +
            "heading into the weekend, underscoring standard 22K Sovereign coins and bespoke 18K chains as " +
            "excellent portfolio hedges. Drop into our showroom today."
          );
        }
      } finally {
        if (active) setLoadingBrief(false);
      }
    };

    fetchBrief();
    return () => {
      active = false;
    };
  }, [goldRate24K]);

  const spotGold = goldRate24K * 31.1035;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

    <ScrollView 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* هدر برند و لوکیشن */}
      <View style={styles.header}>
        <View>
          <Text style={styles.estText}>ESTABLISHED 2011</Text>
          <Text style={styles.brandTitle}>Aura Gold</Text>
          <View style={styles.locationWrapper}>
            <Feather name="compass" size={12} color="#f59e0b" style={styles.pulseIcon} />
            <Text style={styles.locationText}>Hatton Garden, London (EC1N)</Text>
          </View>
        </View>
        <View style={styles.avatarBadge}>
          <Text style={styles.avatarText}>A</Text>
        </View>
      </View>

      {/* نوار نمایش نرخ‌های لحظه‌ای */}
      <View style={styles.tickerStrip}>
        <View style={styles.tickerSection}>
          <View style={styles.dotIndicator} />
          <Text style={styles.tickerLabel}>Spot GBP: </Text>
          <Text style={styles.tickerValue}>
            £{spotGold.toLocaleString(undefined, { maximumFractionDigits: 1 })}/oz
          </Text>
        </View>

        <View style={[styles.tickerSection, styles.borderLeft]}>
          <Text style={styles.tickerLabel}>22K/g: </Text>
          <Text style={styles.tickerValue}>
            £{(goldRate24K * (22 / 24)).toFixed(1)}/g
          </Text>
        </View>

        <View style={styles.changeBadge}>
          <Feather name="trending-up" size={12} color="#10b981" />
          <Text style={styles.changeText}>+0.4%</Text>
        </View>
      </View>

      {/* بنر تصویری نمایشگاه مجلل */}
      <View style={styles.bannerContainer}>
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1515562141505-73acd27413d9?w=600&auto=format&fit=crop&q=80" }}
          style={styles.bannerImage}
          resizeMode="cover"
        />
        <View style={styles.bannerOverlay} />
        
        <View style={styles.bannerContent}>
          <View style={styles.vipTag}>
            <Text style={styles.vipTagText}>VIP SHOWROOM INVITATION</Text>
          </View>
          <Text style={styles.bannerTitle}>Handcrafted Hallmark Excellence</Text>
          <Text style={styles.bannerSubtitle}>Custom private viewings arranged within the hour.</Text>
        </View>
      </View>

      {/* کارت تفسیر روزانه بازار طلا */}
      <View style={styles.briefCard}>
        <View style={styles.briefHeader}>
          <Ionicons name="order-bool-ascending" size={14} color="#f59e0b" />
          <Text style={styles.briefHeaderTitle}>Daily Luxury Bullion Briefing</Text>
        </View>
        
        {loadingBrief ? (
          <View style={styles.loadingWrapper}>
            <Text style={styles.loadingText}>Contacting London bullion brokers...</Text>
            <View style={styles.loadingBar}>
              <View style={styles.loadingBarFill} />
            </View>
          </View>
        ) : (
          <View>
            <Text style={styles.briefBody}>
              “{marketBrief}”
            </Text>
            <Text style={styles.briefFooter}>
              Aura Research Group • GMT
            </Text>
          </View>
        )}
      </View>

      {/* بخش میانبرها */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>App Navigation Quick Links</Text>
        <View style={styles.gridContainer}>
          
          <TouchableOpacity
            onPress={() => onSwitchTab("calculator")}
            style={styles.gridItem}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="scale-balance" size={24} color="#f59e0b" />
            <Text style={styles.gridLabel}>Valuer Tool</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => onSwitchTab("boutique")}
            style={styles.gridItem}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="calendar-check-outline" size={24} color="#f59e0b" />
            <Text style={styles.gridLabel}>Book Room</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onSwitchTab("assistant")}
            style={styles.gridItem}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="robot-outline" size={24} color="#f59e0b" />
            <Text style={styles.gridLabel}>AI Consultant</Text>
          </TouchableOpacity>

        </View>
      </View>

      {/* بخش قطعات پیشنهادی */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>VIP Recommended Pieces</Text>
          <TouchableOpacity 
            onPress={() => onSwitchTab("collection")}
            style={styles.seeAllButton}
            activeOpacity={0.7}
          >
            <Text style={styles.seeAllText}>View Showroom</Text>
            <Feather name="chevron-right" size={14} color="#f59e0b" />
          </TouchableOpacity>
        </View>

        <View style={styles.listContainer}>
          {JEWELRY_INVENTORY.slice(0, 3).map((item) => {
            const purityMultiplier = item.karat > 0 ? item.karat / 24 : 1.0;
            const liveCalculatedPr = Math.round((item.weightGram * goldRate24K * purityMultiplier) + item.basePremiumGBP);
            
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => onViewProduct(item)}
                style={styles.listItem}
                activeOpacity={0.8}
              >
                <View style={styles.listItemLeft}>
                  <Image 
                    source={{ uri: item.image }} 
                    style={styles.listItemImage}
                  />
                  <View style={styles.listItemDetails}>
                    <Text style={styles.itemTag}>
                      {item.karat > 0 ? `${item.karat}K Gold` : "Fine Bullion"} ({item.weightGram}g)
                    </Text>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {item.name}
                    </Text>
                  </View>
                </View>

                <View style={styles.listItemRight}>
                  <Text style={styles.itemPrice}>£{liveCalculatedPr.toLocaleString()}</Text>
                  <Text style={styles.itemAction}>Tap to Inspect</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* پاورقی یا فوتر فوتر */}
      <View style={styles.footer}>
        <Feather name="award" size={16} color="#f59e0b" />
        <Text style={styles.footerText}>AURA GOLD LONDON PRIVATE WORKSHOPS</Text>
      </View>

    </ScrollView>
    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  estText: {
    fontSize: 9,
    fontWeight: "bold",
    letterSpacing: 1.5,
    color: "#f59e0b",
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f5f5f5",
    marginTop: 2,
  },
  locationWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  pulseIcon: {
    marginRight: 4,
  },
  locationText: {
    fontSize: 10,
    color: "#a3a3a3",
  },
  avatarBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fbbf24",
  },
  tickerStrip: {
    flexDirection: "row",
    backgroundColor: "rgba(23, 23, 23, 0.6)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1c1c1c",
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  tickerSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  dotIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10b981",
    marginRight: 6,
  },
  tickerLabel: {
    fontSize: 10,
    color: "#a3a3a3",
  },
  tickerValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#f5f5f5",
  },
  borderLeft: {
    borderLeftWidth: 1,
    borderColor: "#262626",
    paddingLeft: 12,
  },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  changeText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#10b981",
    marginLeft: 3,
  },
  bannerContainer: {
    height: 180,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#171717",
    position: "relative",
    marginBottom: 20,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 10, 10, 0.45)",
  },
  bannerContent: {
    position: "absolute",
    bottom: 14,
    left: 14,
    right: 14,
  },
  vipTag: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    borderColor: "rgba(245, 158, 11, 0.3)",
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  vipTagText: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#fde047",
    letterSpacing: 1,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#f5f5f5",
  },
  bannerSubtitle: {
    fontSize: 10,
    color: "#a3a3a3",
    marginTop: 2,
  },
  briefCard: {
    backgroundColor: "rgba(23, 23, 23, 0.4)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.1)",
    padding: 16,
    marginBottom: 20,
  },
  briefHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  briefHeaderTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#f59e0b",
    marginLeft: 6,
  },
  loadingWrapper: {
    paddingVertical: 12,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 10,
    color: "#737373",
  },
  loadingBar: {
    width: 48,
    height: 2,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderRadius: 1,
    marginTop: 6,
    overflow: "hidden",
  },
  loadingBarFill: {
    width: "50%",
    height: "100%",
    backgroundColor: "#f59e0b",
  },
  briefBody: {
    fontSize: 11.5,
    lineHeight: 18,
    color: "#d4d4d4",
    fontStyle: "italic",
  },
  briefFooter: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#525252",
    textAlign: "right",
    marginTop: 8,
    letterSpacing: 1,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#525252",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 8,
    paddingLeft: 2,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#f59e0b",
    marginRight: 2,
  },
  gridContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  gridItem: {
    flex: 1,
    backgroundColor: "#171717",
    borderWidth: 1,
    borderColor: "#262626",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },
  gridLabel: {
    fontSize: 9.5,
    fontWeight: "600",
    color: "#e5e5e5",
    marginTop: 6,
  },
  listContainer: {
    backgroundColor: "rgba(23, 23, 23, 0.3)",
    borderColor: "#171717",
    borderWidth: 1,
    borderRadius: 12,
    padding: 6,
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
    backgroundColor: "rgba(10, 10, 10, 0.4)",
    borderColor: "#171717",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 6,
  },
  listItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  listItemImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#0a0a0a",
    borderColor: "#262626",
    borderWidth: 1,
  },
  listItemDetails: {
    marginLeft: 10,
    flex: 1,
    justifyContent: "center",
  },
  itemTag: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: "#f59e0b",
    textTransform: "uppercase",
  },
  itemName: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#e5e5e5",
    marginTop: 1,
  },
  listItemRight: {
    alignItems: "flex-end",
    marginLeft: 8,
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#f5f5f5",
  },
  itemAction: {
    fontSize: 8,
    color: "#737373",
    marginTop: 1,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: "#525252",
    letterSpacing: 1.5,
    marginLeft: 6,
  },
});