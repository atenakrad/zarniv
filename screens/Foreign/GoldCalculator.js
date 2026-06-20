/**
 * @license
 * Zarnive - Gold Calculator Screen
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GoldCalculator({ goldRate24K }) {
  const [weightStr, setWeightStr] = useState("10");
  const [karatSelection, setKaratSelection] = useState("24K");

  // Alloy technical specifications
  const alloySpecs = useMemo(() => {
    switch (karatSelection) {
      case "24K":
        return {
          name: "Fine Gold (99.9%)",
          purity: 0.999,
          description: "Pure investment bars & medallions",
        };
      case "22K":
        return {
          name: "Standard Gold (91.6%)",
          purity: 0.916,
          description: "Traditional wedding jewellery & Sovereigns",
        };
      case "18K":
        return {
          name: "Luxury Gold (75.0%)",
          purity: 0.75,
          description: "Elite Cartier, Rolex & Mayfair designs",
        };
      case "14K":
        return {
          name: "Mid-Range Gold (58.5%)",
          purity: 0.585,
          description: "Durable vintage and everyday luxury",
        };
      case "9K":
        return {
          name: "Carat Budget (37.5%)",
          purity: 0.375,
          description: "Common high-street lightweight jewellery",
        };
      case "Silver":
        return {
          name: "Fine Silver (92.5%)",
          purity: 0.015,
          description: "Sterling luxury silverware & ornaments",
        };
      default:
        return {
          name: "Fine Gold (99.9%)",
          purity: 0.999,
          description: "Pure investment bars & medallions",
        };
    }
  }, [karatSelection]);

  const weightGram = useMemo(() => {
    const val = parseFloat(weightStr);
    return isNaN(val) || val <= 0 ? 0 : val;
  }, [weightStr]);

  // Gold value calculations based on the live 24K gold rate
  const calculatedValues = useMemo(() => {
    const rawMetalValue = weightGram * goldRate24K * alloySpecs.purity;
    // Scrap or store buyback price equals 95.5% of raw metal value
    const scrapPayOut = rawMetalValue * 0.955;
    // Estimated retail purchase cost including crafting and design fee (approx raw gold value * 1.45 + base crafting cost)
    const retailCost = rawMetalValue * 1.45 + 50;

    return {
      raw: rawMetalValue,
      scrap: scrapPayOut,
      retail: weightGram === 0 ? 0 : retailCost,
    };
  }, [weightGram, goldRate24K, alloySpecs]);

  const setPresetWeight = (w) => {
    setWeightStr(w.toString());
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header section */}
        <View style={styles.header}>
          <Text style={styles.tagText}>Bespoke Tool</Text>
          <View style={styles.titleRow}>
            <MaterialCommunityIcons
              name="scale-balance"
              size={24}
              color="#f59e0b"
            />
            <Text style={styles.title}>Bullion Valuer</Text>
          </View>
          <Text style={styles.subtitle}>
            Instantly evaluate gold heirloom values or investments against live
            London Bullion Market benchmarks in real-time.
          </Text>
        </View>

        {/* Inputs section */}
        <View style={styles.formContainer}>
          {/* Weight input field with preset value buttons */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>1. Enter Metal Weight (grams)</Text>
            <View style={styles.row}>
              <View style={styles.textInputWrapper}>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={weightStr}
                  onChangeText={setWeightStr}
                  placeholder="0.00"
                  placeholderTextColor="#444"
                />
                <Text style={styles.unitText}>grams</Text>
              </View>

              <TouchableOpacity
                onPress={() => setWeightStr("")}
                style={styles.clearBtn}
                activeOpacity={0.7}
              >
                <Feather name="refresh-cw" size={16} color="#737373" />
              </TouchableOpacity>
            </View>

            {/* Quick preset values button bar */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.presetsScroll}
              style={styles.presetsWrapper}
            >
              {[
                { label: "1g Singlet", value: 1 },
                { label: "5g Ring", value: 5 },
                { label: "10g Chain", value: 10 },
                { label: "1oz Sovereign", value: 31.103 },
                { label: "50g Plate", value: 50 },
                { label: "100g Bar", value: 100 },
              ].map((p, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setPresetWeight(p.value)}
                  style={styles.presetBtn}
                  activeOpacity={0.8}
                >
                  <Text style={styles.presetBtnText}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Gold or silver alloy karat selection section */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              2. Selected Alloy Purity (Karat)
            </Text>
            <View style={styles.grid}>
              {["24K", "22K", "18K", "14K", "9K", "Silver"].map((kt) => (
                <TouchableOpacity
                  key={kt}
                  onPress={() => setKaratSelection(kt)}
                  style={[
                    styles.gridItem,
                    karatSelection === kt && styles.gridItemActive,
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.gridItemText,
                      karatSelection === kt && styles.gridItemTextActive,
                    ]}
                  >
                    {kt} {kt === "Silver" ? "" : "Gold"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Selected alloy karat information */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>{alloySpecs.name}</Text>
          <Text style={styles.infoDescription}>
            {alloySpecs.description}. Holds exactly{" "}
            {(alloySpecs.purity * 100).toFixed(1)}% pure precious metal content.
          </Text>

          {/* نوار متحرک درصد خلوص */}
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(100, alloySpecs.purity * 100)}%` },
              ]}
            />
          </View>
        </View>

        {/* نتایج برآورد ارزش مالی فلز گرانبها */}
        <View style={styles.resultsContainer}>
          {/* ارزش خرید مجدد ضایعات یا کارکرده */}
          <View style={styles.scrapCard}>
            <View style={styles.scrapHeader}>
              <View style={styles.scrapHeaderLeft}>
                <Text style={styles.scrapTag}>Hatton Garden Buy Back</Text>
                <MaterialCommunityIcons
                  name="bank-outline"
                  size={12}
                  color="#fbbf24"
                  style={styles.scrapIcon}
                />
              </View>
              <View style={styles.fixBadge}>
                <Text style={styles.fixBadgeText}>Liquidity Fix</Text>
              </View>
            </View>

            <Text style={styles.scrapSubTitle}>Est. Scrap Trade Valuation</Text>

            <View style={styles.valueRow}>
              <Text style={styles.bigPrice}>
                £
                {calculatedValues.scrap.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
              <Text style={styles.currencyCode}>GBP</Text>
            </View>

            <Text style={styles.disclaimerText}>
              * This value is calculated at{" "}
              <Text style={styles.textBold}>95.5% payout</Text> of pure gold
              content, representing competitive dealer pricing standards in
              London jewelry bazaars.
            </Text>
          </View>

          {/* کارت برآوردهای تکمیلی بازار و ویترین فروشگاه */}
          <View style={styles.retailCard}>
            <View style={styles.retailRow}>
              <Text style={styles.retailLabel}>
                Est. Replacement Jewel Retail Cost:
              </Text>
              <Text style={styles.retailVal}>
                £
                {calculatedValues.retail.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </View>

            <View style={[styles.retailRow, styles.borderTop]}>
              <Text style={styles.retailLabel}>Intrinsic Raw Metal Value:</Text>
              <Text style={styles.retailValSecondary}>
                £
                {calculatedValues.raw.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Need an official, written valuation for insurance certificate
              purposes? Present your asset in person at our Hatton Garden
              showroom.
            </Text>
          </View>
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
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    borderBottomWidth: 1,
    borderColor: "#171717",
    paddingBottom: 12,
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
    marginTop: 4,
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#f5f5f5",
  },
  subtitle: {
    fontSize: 10,
    color: "#a3a3a3",
    marginTop: 6,
    lineHeight: 15,
  },
  formContainer: {
    marginTop: 16,
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#a3a3a3",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  textInputWrapper: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#171717",
    borderColor: "#262626",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    color: "#f5f5f5",
    fontSize: 18,
    fontWeight: "bold",
    paddingVertical: 10,
  },
  unitText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#fbbf24",
    marginLeft: 8,
  },
  clearBtn: {
    width: 44,
    backgroundColor: "#171717",
    borderColor: "#262626",
    borderWidth: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  presetsWrapper: {
    marginHorizontal: -16,
  },
  presetsScroll: {
    paddingHorizontal: 16,
    gap: 6,
  },
  presetBtn: {
    backgroundColor: "rgba(23, 23, 23, 0.6)",
    borderColor: "#1f1f1f",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  presetBtnText: {
    fontSize: 9.5,
    color: "#a3a3a3",
    fontWeight: "500",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
  },
  gridItem: {
    width: "31.5%",
    backgroundColor: "#171717",
    borderColor: "rgba(38, 38, 38, 0.8)",
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  gridItemActive: {
    backgroundColor: "#fbbf24",
    borderColor: "#fbbf24",
  },
  gridItemText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#a3a3a3",
  },
  gridItemTextActive: {
    color: "#0a0a0a",
    fontWeight: "bold",
  },
  infoBox: {
    marginTop: 16,
    backgroundColor: "#171717",
    borderColor: "#1f1f1f",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#e5e5e5",
  },
  infoDescription: {
    fontSize: 10,
    color: "#737373",
    lineHeight: 14,
    marginTop: 2,
  },
  progressBarBg: {
    width: "100%",
    height: 4,
    backgroundColor: "#0a0a0a",
    borderRadius: 2,
    marginTop: 8,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#fbbf24",
    borderRadius: 2,
  },
  resultsContainer: {
    marginTop: 20,
    gap: 14,
  },
  scrapCard: {
    backgroundColor: "rgba(23, 23, 23, 0.45)",
    borderColor: "rgba(245, 158, 11, 0.1)",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  scrapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scrapHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  scrapTag: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#fbbf24",
    textTransform: "uppercase",
  },
  scrapIcon: {
    marginLeft: 4,
  },
  fixBadge: {
    backgroundColor: "rgba(251, 191, 36, 0.1)",
    borderColor: "rgba(251, 191, 36, 0.2)",
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fixBadgeText: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#fcd34d",
  },
  scrapSubTitle: {
    fontSize: 11,
    color: "#737373",
    marginTop: 4,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    backgroundColor: "#0a0a0a",
    borderColor: "#171717",
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  bigPrice: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#f5f5f5",
  },
  currencyCode: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#737373",
    marginLeft: 6,
  },
  disclaimerText: {
    fontSize: 9,
    color: "#525252",
    lineHeight: 13,
    marginTop: 10,
  },
  textBold: {
    fontWeight: "bold",
    color: "#737373",
  },
  retailCard: {
    backgroundColor: "rgba(23, 23, 23, 0.25)",
    borderColor: "#171717",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  retailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  borderTop: {
    borderTopWidth: 1,
    borderColor: "#1c1c1c",
    paddingTop: 10,
  },
  retailLabel: {
    fontSize: 10.5,
    color: "#737373",
  },
  retailVal: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#e5e5e5",
  },
  retailValSecondary: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#a3a3a3",
  },
  footer: {
    paddingVertical: 8,
    alignItems: "center",
  },
  footerText: {
    fontSize: 9,
    fontStyle: "italic",
    color: "#525252",
    textAlign: "center",
    lineHeight: 14,
  },
});
