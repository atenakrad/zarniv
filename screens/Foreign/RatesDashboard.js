/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Animated,
} from "react-native";
import { Feather, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";
import { HISTORIC_DATA } from "./portfolioData";
import { SafeAreaView } from "react-native-safe-area-context";

// تلاش برای ایمپورت کردن AsyncStorage در صورت نصب بودن
let AsyncStorage;
try {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch (e) {
  AsyncStorage = null;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function RatesDashboard({
  goldRate24K,
  setGoldRate24K,
  goldRates,
}) {
  const [activeTab, setActiveTab] = useState("1D");
  const [priceFlash, setPriceFlash] = useState({
    spot: null,
    "rate-24k": null,
  });

  // سیستم آلارم قیمت
  const [alerts, setAlerts] = useState([
    {
      id: "alert-1",
      targetPrice: 1835.0,
      karat: "Spot",
      condition: "Above",
      isActive: true,
      createdAt: "2026-06-19",
    },
    {
      id: "alert-2",
      targetPrice: 1820.0,
      karat: "Spot",
      condition: "Below",
      isActive: true,
      createdAt: "2026-06-19",
    },
  ]);

  const [newTargetPrice, setNewTargetPrice] = useState("");
  const [newKaratSelection, setNewKaratSelection] = useState("Spot"); // Spot | 24K | 18K
  const [newCondition, setNewCondition] = useState("Above"); // Above | Below
  const [alertSuccess, setAlertSuccess] = useState(null);

  // لود کردن آلارم‌های ذخیره شده در حافظه دستگاه
  useEffect(() => {
    const loadAlerts = async () => {
      if (AsyncStorage) {
        try {
          const saved = await AsyncStorage.getItem("aura_gold_alerts");
          if (saved) {
            setAlerts(JSON.parse(saved));
          }
        } catch (e) {
          // خطا در لود نادیده گرفته می‌شود
        }
      }
    };
    loadAlerts();
  }, []);

  // اونس طلا بر اساس ۲۴ عیار
  const spotGoldPrice = useMemo(() => {
    return goldRate24K * 31.1035;
  }, [goldRate24K]);

  // بررسی فعال شدن آلارم‌ها
  useEffect(() => {
    const checkAlerts = async () => {
      const triggerIndex = alerts.findIndex((a) => {
        if (!a.isActive) return false;
        const checkVal = a.karat === "Spot" ? spotGoldPrice : goldRate24K;
        if (a.condition === "Above" && checkVal >= a.targetPrice) return true;
        if (a.condition === "Below" && checkVal <= a.targetPrice) return true;
        return false;
      });

      if (triggerIndex !== -1) {
        const triggered = alerts[triggerIndex];
        setAlertSuccess(
          `🔔 MARKET ALERT: Gold rate moved ${triggered.condition.toLowerCase()} your £${
            triggered.targetPrice
          } target!`
        );

        const updated = [...alerts];
        updated[triggerIndex] = { ...triggered, isActive: false };
        setAlerts(updated);

        if (AsyncStorage) {
          try {
            await AsyncStorage.setItem(
              "aura_gold_alerts",
              JSON.stringify(updated)
            );
          } catch (e) {}
        }
      }
    };

    checkAlerts();
  }, [goldRate24K, spotGoldPrice, alerts]);

  // شبیه‌ساز نوسان زنده قیمت بازار
  useEffect(() => {
    const timer = setInterval(() => {
      const deltaPercent = (Math.random() * 0.1 - 0.05) / 100;
      const adjustment = goldRate24K * deltaPercent;

      const nextVal = Number((goldRate24K + adjustment).toFixed(2));
      const direction = nextVal > goldRate24K ? "up" : "down";

      setPriceFlash({ spot: direction, "rate-24k": direction });
      setGoldRate24K(nextVal);

      setTimeout(() => {
        setPriceFlash({ spot: null, "rate-24k": null });
      }, 800);
    }, 4500);

    return () => clearInterval(timer);
  }, [goldRate24K, setGoldRate24K]);

  // پردازش داده‌های چارت تاریخی طلا برای همخوانی با نرخ لحظه‌ای
  const activeChartData = useMemo(() => {
    const dataset = HISTORIC_DATA[activeTab] || [];
    if (dataset.length === 0) return [];
    const currentChartVal = dataset[dataset.length - 1].price;
    const ratio = spotGoldPrice / currentChartVal;

    return dataset.map((d) => ({
      ...d,
      price: Number((d.price * ratio).toFixed(2)),
    }));
  }, [activeTab, spotGoldPrice]);

  // تولید مسیر SVG (Path) برای چارت بدون نیاز به پکیج‌های سنگین وب
  const chartPathData = useMemo(() => {
    const data = activeChartData;
    if (data.length < 2) return { areaPath: "", strokePath: "" };

    const chartWidth = SCREEN_WIDTH - 64; // حاشیه کل صفحه
    const chartHeight = 110;

    const prices = data.map((d) => d.price);
    const minPrice = Math.min(...prices) * 0.999;
    const maxPrice = Math.max(...prices) * 1.001;
    const priceRange = maxPrice - minPrice || 1;

    const points = data.map((d, index) => {
      const x = (index / (data.length - 1)) * chartWidth;
      const y = chartHeight - ((d.price - minPrice) / priceRange) * chartHeight;
      return { x, y };
    });

    // ساخت خط اصلی نمودار
    let strokePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      strokePath += ` L ${points[i].x} ${points[i].y}`;
    }

    // ساخت ناحیه رنگی زیر نمودار (Area Fill)
    const areaPath = `${strokePath} L ${
      points[points.length - 1].x
    } ${chartHeight} L ${points[0].x} ${chartHeight} Z`;

    return { areaPath, strokePath };
  }, [activeChartData]);

  // افزودن آلارم جدید
  const addAlert = async () => {
    if (!newTargetPrice) return;
    const numPrice = parseFloat(newTargetPrice);
    if (isNaN(numPrice) || numPrice <= 0) return;

    const newAlert = {
      id: "alert-" + Date.now(),
      targetPrice: numPrice,
      karat: newKaratSelection,
      condition: newCondition,
      isActive: true,
      createdAt: new Date().toISOString().split("T")[0],
    };

    const updated = [newAlert, ...alerts];
    setAlerts(updated);

    if (AsyncStorage) {
      try {
        await AsyncStorage.setItem("aura_gold_alerts", JSON.stringify(updated));
      } catch (e) {}
    }

    setNewTargetPrice("");
    setAlertSuccess("Price alert programmed successfully.");
    setTimeout(() => setAlertSuccess(null), 3000);
  };

  // حذف آلارم
  const deleteAlert = async (id) => {
    const updated = alerts.filter((a) => a.id !== id);
    setAlerts(updated);
    if (AsyncStorage) {
      try {
        await AsyncStorage.setItem("aura_gold_alerts", JSON.stringify(updated));
      } catch (e) {}
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* هدر داینامیک */}
        <View style={styles.header}>
          <View>
            <Text style={styles.lbmaText}>LBMA Market Fix</Text>
            <View style={styles.titleRow}>
              <Text style={styles.title}>Live London Rates</Text>
              <View style={styles.pulseDot} />
            </View>
          </View>
          <View style={styles.currencyBadge}>
            <Text style={styles.currencyLabel}>Currency</Text>
            <Text style={styles.currencyValue}>GBP (£)</Text>
          </View>
        </View>

        {/* کارت بزرگ نمایش قیمت زنده لحظه‌ای */}
        <View
          style={[
            styles.spotCard,
            priceFlash.spot === "up" && styles.flashCardUp,
            priceFlash.spot === "down" && styles.flashCardDown,
          ]}
        >
          <View style={styles.spotHeader}>
            <View style={styles.spotLeft}>
              <Text style={styles.spotSub}>London Spot Gold (1 oz)</Text>
              <Ionicons
                name="order-bool-ascending"
                size={12}
                color="#f59e0b"
                style={styles.sparkle}
              />
            </View>
            <View style={styles.liveIndicator}>
              <Text style={styles.liveIndicatorText}>LIVE</Text>
            </View>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.bigPrice}>
              £
              {spotGoldPrice.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
            <View style={styles.trendRow}>
              <Feather
                name={spotGoldPrice > 1820 ? "trending-up" : "trending-down"}
                size={14}
                color="#10b981"
              />
              <Text style={styles.trendText}>+0.42%</Text>
            </View>
          </View>

          {/* آمارهای جانبی فروشگاه */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>BOUTIQUE BUY PRICE</Text>
              <Text style={styles.statValue}>
                £
                {(spotGoldPrice * 1.02).toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>WE CASH IN SCRAP AT</Text>
              <Text style={styles.statValue}>
                £
                {(spotGoldPrice * 0.96).toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* بخش چارت و محدوده زمانی */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Market History (GBP)</Text>
            <View style={styles.periodSwitcher}>
              {["1D", "1W", "1M", "1Y", "5Y"].map((period) => (
                <TouchableOpacity
                  key={period}
                  onPress={() => setActiveTab(period)}
                  style={[
                    styles.periodBtn,
                    activeTab === period && styles.periodBtnActive,
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.periodBtnText,
                      activeTab === period && styles.periodBtnTextActive,
                    ]}
                  >
                    {period}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* پیاده‌سازی نمودار به وسیله SVG بومی */}
          <View style={styles.canvasContainer}>
            {chartPathData.strokePath ? (
              <Svg height="110" width={SCREEN_WIDTH - 64}>
                <Defs>
                  <LinearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                    <Stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                  </LinearGradient>
                </Defs>
                {/* پر کردن زیر چارت */}
                <Path d={chartPathData.areaPath} fill="url(#goldGrad)" />
                {/* خط اصلی نمودار */}
                <Path
                  d={chartPathData.strokePath}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                />
              </Svg>
            ) : (
              <Text style={styles.loadingChartText}>
                Loading history chart...
              </Text>
            )}
          </View>
        </View>

        {/* لیست عیارها بر اساس گرم */}
        <View style={styles.puritySection}>
          <View style={styles.sectionHeaderRow}>
            <Feather name="layers" size={14} color="#f59e0b" />
            <Text style={styles.sectionTitle}>
              Precious Metal Purity Prices (per gram)
            </Text>
          </View>

          <View style={styles.ratesList}>
            {goldRates.map((rate) => {
              const isFlashing =
                rate.id === "rate-24k" && priceFlash["rate-24k"];
              return (
                <View
                  key={rate.id}
                  style={[
                    styles.rateRow,
                    isFlashing === "up" && styles.flashRateUp,
                    isFlashing === "down" && styles.flashRateDown,
                  ]}
                >
                  <View style={styles.rateRowLeft}>
                    <View style={styles.rateSymbolBox}>
                      <Text style={styles.rateSymbolText}>
                        {rate.id === "rate-silver" ? "Ag" : "Au"}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.rateName}>{rate.name}</Text>
                      <Text style={styles.ratePurity}>
                        Purity: {(rate.purity * 100).toFixed(1)}%
                      </Text>
                    </View>
                  </View>

                  <View style={styles.rateRowRight}>
                    <Text style={styles.ratePrice}>
                      £{rate.pricePerGram.toFixed(2)} /g
                    </Text>
                    <Text
                      style={[
                        styles.rateChange,
                        rate.change24h >= 0
                          ? styles.textGreen
                          : styles.textAmber,
                      ]}
                    >
                      {rate.change24h >= 0 ? "+" : ""}
                      {rate.change24h.toFixed(2)}%
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* بخش نوتیفیکیشن‌ها و سیستم تعریف آلارم قیمت */}
        <View style={styles.alertContainer}>
          <View style={styles.alertHeader}>
            <Feather name="bell" size={14} color="#f59e0b" />
            <Text style={styles.alertTitle}>Boutique Price Alerts</Text>
          </View>

          {alertSuccess && (
            <View style={styles.alertToast}>
              <Text style={styles.alertToastText}>{alertSuccess}</Text>
            </View>
          )}

          {/* فرم ثبت آلارم جدید بهینه‌شده برای موبایل */}
          <View style={styles.alertForm}>
            {/* انتخاب نوع عیار */}
            <View style={styles.formCol}>
              <Text style={styles.formLabel}>KARAT</Text>
              <View style={styles.selectorRow}>
                {["Spot", "24K", "18K"].map((k) => (
                  <TouchableOpacity
                    key={k}
                    onPress={() => setNewKaratSelection(k)}
                    style={[
                      styles.selectorBtn,
                      newKaratSelection === k && styles.selectorBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.selectorBtnText,
                        newKaratSelection === k && styles.selectorBtnTextActive,
                      ]}
                    >
                      {k}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* انتخاب جهت تریگر */}
            <View style={styles.formCol}>
              <Text style={styles.formLabel}>TRIGGER CONDITION</Text>
              <View style={styles.selectorRow}>
                {["Above", "Below"].map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setNewCondition(c)}
                    style={[
                      styles.selectorBtn,
                      newCondition === c && styles.selectorBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.selectorBtnText,
                        newCondition === c && styles.selectorBtnTextActive,
                      ]}
                    >
                      {c === "Above" ? "Goes Above" : "Goes Below"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* فیلد عددی تارگت */}
            <View style={styles.formCol}>
              <Text style={styles.formLabel}>TARGET PRICE (£)</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.numericInput}
                  keyboardType="numeric"
                  placeholder={newKaratSelection === "Spot" ? "1835" : "59.0"}
                  placeholderTextColor="#444"
                  value={newTargetPrice}
                  onChangeText={setNewTargetPrice}
                />
                <TouchableOpacity style={styles.addBtn} onPress={addAlert}>
                  <Feather name="plus" size={16} color="#0a0a0a" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* لیست آلارم‌های ثبت شده */}
          <View style={styles.alertsList}>
            {alerts.length === 0 ? (
              <Text style={styles.noAlertsText}>
                No active price alert custom rules configured.
              </Text>
            ) : (
              alerts.map((alert) => (
                <View key={alert.id} style={styles.alertItem}>
                  <View style={styles.alertItemLeft}>
                    <View style={styles.alertDot} />
                    <Text style={styles.alertItemText}>
                      {alert.karat} Gold {alert.condition.toLowerCase()}{" "}
                      <Text style={styles.alertItemPrice}>
                        £{alert.targetPrice.toFixed(2)}
                      </Text>
                    </Text>
                  </View>
                  <View style={styles.alertItemRight}>
                    <View
                      style={[
                        styles.statusBadge,
                        alert.isActive
                          ? styles.statusActive
                          : styles.statusTriggered,
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {alert.isActive ? "Armed" : "Triggered"}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => deleteAlert(alert.id)}
                      style={styles.deleteBtn}
                    >
                      <Feather name="trash-2" size={12} color="#737373" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  lbmaText: {
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
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10b981",
    marginLeft: 8,
  },
  currencyBadge: {
    alignItems: "flex-end",
  },
  currencyLabel: {
    fontSize: 9,
    color: "#737373",
  },
  currencyValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#fef3c7",
    backgroundColor: "#171717",
    borderColor: "#262626",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  spotCard: {
    backgroundColor: "#171717",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#262626",
    padding: 20,
    marginBottom: 20,
  },
  flashCardUp: {
    borderColor: "rgba(16, 185, 129, 0.4)",
    backgroundColor: "rgba(16, 185, 129, 0.05)",
  },
  flashCardDown: {
    borderColor: "rgba(239, 68, 68, 0.4)",
    backgroundColor: "rgba(239, 68, 68, 0.05)",
  },
  spotHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  spotLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  spotSub: {
    fontSize: 12,
    color: "#a3a3a3",
  },
  sparkle: {
    marginLeft: 4,
  },
  liveIndicator: {
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    borderColor: "rgba(245, 158, 11, 0.3)",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  liveIndicatorText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#fbbf24",
    letterSpacing: 0.5,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 8,
  },
  bigPrice: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#f5f5f5",
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  trendText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#10b981",
    marginLeft: 2,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderColor: "#262626",
    marginTop: 16,
    pt: 16,
    paddingTop: 14,
  },
  statBox: {
    flex: 1,
  },
  statLabel: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: "#525252",
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#d4d4d4",
    marginTop: 2,
  },
  chartContainer: {
    backgroundColor: "rgba(23, 23, 23, 0.6)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1f1f1f",
    padding: 16,
    marginBottom: 20,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#d4d4d4",
  },
  periodSwitcher: {
    flexDirection: "row",
    backgroundColor: "#0a0a0a",
    borderColor: "#1f1f1f",
    borderWidth: 1,
    borderRadius: 8,
    padding: 2,
  },
  periodBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  periodBtnActive: {
    backgroundColor: "rgba(245, 158, 11, 0.15)",
  },
  periodBtnText: {
    fontSize: 9.5,
    fontWeight: "600",
    color: "#737373",
  },
  periodBtnTextActive: {
    color: "#fbbf24",
    fontWeight: "bold",
  },
  canvasContainer: {
    height: 110,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingChartText: {
    color: "#525252",
    fontSize: 10,
  },
  puritySection: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingLeft: 4,
  },
  sectionTitle: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#d4d4d4",
    marginLeft: 6,
  },
  ratesList: {
    gap: 8,
  },
  rateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(23, 23, 23, 0.45)",
    borderColor: "#1f1f1f",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  flashRateUp: {
    borderColor: "rgba(16, 185, 129, 0.4)",
    backgroundColor: "rgba(16, 185, 129, 0.05)",
  },
  flashRateDown: {
    borderColor: "rgba(239, 68, 68, 0.4)",
    backgroundColor: "rgba(239, 68, 68, 0.05)",
  },
  rateRowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  rateSymbolBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#262626",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  rateSymbolText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#fef3c7",
  },
  rateName: {
    fontSize: 12,
    fontWeight: "500",
    color: "#f5f5f5",
  },
  ratePurity: {
    fontSize: 9,
    color: "#525252",
    marginTop: 1,
  },
  rateRowRight: {
    alignItems: "flex-end",
  },
  ratePrice: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#f5f5f5",
  },
  rateChange: {
    fontSize: 9,
    fontWeight: "bold",
    marginTop: 1,
  },
  textGreen: {
    color: "#10b981",
  },
  textAmber: {
    color: "#f59e0b",
  },
  alertContainer: {
    backgroundColor: "rgba(23, 23, 23, 0.5)",
    borderColor: "#1f1f1f",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  alertTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#d4d4d4",
    marginLeft: 6,
  },
  alertToast: {
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderColor: "rgba(245, 158, 11, 0.3)",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  alertToastText: {
    fontSize: 10.5,
    fontWeight: "600",
    color: "#f59e0b",
    lineHeight: 16,
  },
  alertForm: {
    gap: 12,
    marginBottom: 16,
  },
  formCol: {
    gap: 6,
  },
  formLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#525252",
    letterSpacing: 0.5,
  },
  selectorRow: {
    flexDirection: "row",
    backgroundColor: "#0a0a0a",
    borderColor: "#1f1f1f",
    borderWidth: 1,
    borderRadius: 8,
    padding: 2,
    gap: 4,
  },
  selectorBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: "center",
    borderRadius: 6,
  },
  selectorBtnActive: {
    backgroundColor: "rgba(245, 158, 11, 0.15)",
  },
  selectorBtnText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#737373",
  },
  selectorBtnTextActive: {
    color: "#fbbf24",
    fontWeight: "bold",
  },
  inputContainer: {
    flexDirection: "row",
    backgroundColor: "#0a0a0a",
    borderColor: "#1f1f1f",
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 12,
    alignItems: "center",
  },
  numericInput: {
    flex: 1,
    color: "#f5f5f5",
    fontSize: 12,
    paddingVertical: 8,
  },
  addBtn: {
    backgroundColor: "#fbbf24",
    width: 36,
    height: 36,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    margin: 2,
  },
  alertsList: {
    borderTopWidth: 1,
    borderColor: "#1f1f1f",
    paddingTop: 12,
    gap: 6,
  },
  noAlertsText: {
    fontSize: 10,
    color: "#525252",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 8,
  },
  alertItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0a0a0a",
    borderColor: "rgba(31, 31, 31, 0.4)",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  alertItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  alertDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#fbbf24",
    marginRight: 8,
  },
  alertItemText: {
    fontSize: 11,
    color: "#a3a3a3",
  },
  alertItemPrice: {
    fontWeight: "bold",
    color: "#fbbf24",
  },
  alertItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusActive: {
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderColor: "rgba(245, 158, 11, 0.15)",
    borderWidth: 1,
  },
  statusTriggered: {
    backgroundColor: "#262626",
  },
  statusText: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#fbbf24",
  },
  deleteBtn: {
    padding: 4,
  },
});
