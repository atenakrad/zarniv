/**
 * @license
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
  Image,
  Dimensions,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { JEWELRY_INVENTORY } from "./data";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function JewelryCollection({
  goldRate24K,
  onNavigateToBooking,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);

  // محاسبه پویای قیمت نهایی قطعات بر اساس قیمت لحظه‌ای طلا
  const calculateItemPrice = (item) => {
    let purityMultiplier = 1.0;
    if (item.metalType === "Gold") {
      purityMultiplier = item.karat / 24;
    } else if (item.metalType === "Silver") {
      purityMultiplier = 0.015; // ضریب فرضی نقره نسبت به طلا
    }
    const metalWorth = item.weightGram * goldRate24K * purityMultiplier;
    return Math.round(metalWorth + item.basePremiumGBP);
  };

  const categories = [
    { id: "all", label: "Show All" },
    { id: "rings", label: "Rings" },
    { id: "necklaces", label: "Necklaces" },
    { id: "bracelets", label: "Bracelets" },
    { id: "earrings", label: "Earrings" },
    { id: "bullion", label: "Bullion & Coins" },
  ];

  // فیلتر کردن محصولات بر اساس دسته‌بندی و کوئری جستجو
  const filteredProducts = useMemo(() => {
    return JEWELRY_INVENTORY.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory =
        selectedCategory === "all" ? true : item.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* هدر جستجو و فیلترها (تنها در صورتی نمایش داده می‌شود که جزئیات یک محصول باز نشده باشد) */}
      {!selectedItem ? (
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTag}>Bespoke Showroom</Text>
              <Text style={styles.headerTitle}>Aura Collection</Text>
            </View>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>👑</Text>
            </View>
          </View>

          {/* فیلد ورودی جستجو */}
          <View style={styles.searchContainer}>
            <Feather
              name="search"
              size={16}
              color="#737373"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search yellow gold, bands, necklaces..."
              placeholderTextColor="#525252"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* اسکرولر افقی دسته‌بندی‌ها */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
            style={styles.categoriesWrapper}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                style={[
                  styles.categoryBtn,
                  selectedCategory === cat.id && styles.categoryBtnActive,
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.categoryBtnText,
                    selectedCategory === cat.id && styles.categoryBtnTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {/* نمایش لیست کلی محصولات */}
      {!selectedItem ? (
        <ScrollView
          style={styles.listScroll}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredProducts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No bespoke jewellery match found.
              </Text>
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
              >
                <Text style={styles.clearBtnText}>Clear Filters</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.gridContainer}>
              {filteredProducts.map((product) => {
                const dynamicPrice = calculateItemPrice(product);
                return (
                  <TouchableOpacity
                    key={product.id}
                    onPress={() => setSelectedItem(product)}
                    style={styles.card}
                    activeOpacity={0.9}
                  >
                    {/* برچسب محبوب بودن قطعه */}
                    {product.isPopular && (
                      <View style={styles.popularBadge}>
                        <Text style={styles.popularBadgeText}>POPULAR</Text>
                      </View>
                    )}

                    {/* تصویر محصول */}
                    <View style={styles.cardImageContainer}>
                      <Image
                        source={{ uri: product.image }}
                        style={styles.cardImage}
                        resizeMode="cover"
                      />
                    </View>

                    {/* مشخصات و قیمت قطعه */}
                    <View style={styles.cardInfo}>
                      <View style={styles.cardMeta}>
                        <Text style={styles.cardKarat}>
                          {product.karat > 0
                            ? `${product.karat}K Gold`
                            : "Fine Bullion"}
                        </Text>
                        <Text style={styles.cardWeight}>
                          {product.weightGram.toFixed(1)}g
                        </Text>
                      </View>

                      <Text style={styles.cardName} numberOfLines={1}>
                        {product.name}
                      </Text>

                      <View style={styles.cardFooter}>
                        <Text style={styles.retailLabel}>London retail</Text>
                        <Text style={styles.retailPrice}>
                          £{dynamicPrice.toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>
      ) : (
        /* صفحه جزئیات محصول انتخاب شده */
        <ScrollView
          style={styles.detailsContainer}
          contentContainerStyle={styles.detailsContent}
          showsVerticalScrollIndicator={false}
        >
          {/* بخش دکمه بازگشت */}
          <View style={styles.detailsHeader}>
            <TouchableOpacity
              onPress={() => setSelectedItem(null)}
              style={styles.backBtn}
              activeOpacity={0.7}
            >
              <Feather name="arrow-left" size={16} color="#fbbf24" />
              <Text style={styles.backBtnText}>Showroom Back</Text>
            </TouchableOpacity>
            <Text style={styles.specsTitle}>SPECS SHEET</Text>
          </View>

          {/* هیرو ایمیج اصلی جزئیات قطعه */}
          <View style={styles.detailsHero}>
            <Image
              source={{ uri: selectedItem.image }}
              style={styles.detailsHeroImage}
              resizeMode="cover"
            />
            <View style={styles.detailsHeroOverlay} />

            <View style={styles.detailsHeroText}>
              <View style={styles.detailsTag}>
                <Text style={styles.detailsTagText}>
                  {selectedItem.metalType} •{" "}
                  {selectedItem.karat > 0
                    ? `${selectedItem.karat} Carat`
                    : "99.9% Pure"}
                </Text>
              </View>
              <Text style={styles.detailsTitle}>{selectedItem.name}</Text>
            </View>
          </View>

          {/* گرید ۳ تایی مشخصات فنی */}
          <View style={styles.specsGrid}>
            <View style={styles.specBox}>
              <Text style={styles.specLabel}>CERTIFIED WEIGHT</Text>
              <Text style={styles.specValue}>
                {selectedItem.weightGram.toFixed(3)}g
              </Text>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.specLabel}>HALLMARKED</Text>
              <View style={styles.hallmarkRow}>
                <MaterialCommunityIcons
                  name="shield-check"
                  size={14}
                  color="#10b981"
                />
                <Text style={styles.specValue}> Yes</Text>
              </View>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.specLabel}>CRAFTING FEE</Text>
              <Text style={[styles.specValue, styles.textAmber]}>
                £{selectedItem.basePremiumGBP}
              </Text>
            </View>
          </View>

          {/* روایت هنری و توضیحات */}
          <View style={styles.narrativeSection}>
            <Text style={styles.sectionHeader}>Artisan's Narrative</Text>
            <Text style={styles.narrativeBody}>{selectedItem.description}</Text>
          </View>

          {/* فرمول محاسبه قیمت طلا */}
          <View style={styles.formulaCard}>
            <Text style={styles.formulaTitle}>Valuation Formula Details</Text>
            <View style={styles.formulaGrid}>
              <View style={styles.formulaRow}>
                <Text style={styles.formulaLabel}>
                  London Gold 24K per-gram rate:
                </Text>
                <Text style={styles.formulaValue}>
                  £{goldRate24K.toFixed(2)}
                </Text>
              </View>
              <View style={styles.formulaRow}>
                <Text style={styles.formulaLabel}>
                  Purity Multiplier ({selectedItem.karat}K):
                </Text>
                <Text style={styles.formulaValue}>
                  {(selectedItem.karat / 24).toFixed(3)} (
                  {Math.round((selectedItem.karat / 24) * 1000) / 10}%)
                </Text>
              </View>
              <View style={styles.formulaRow}>
                <Text style={styles.formulaLabel}>
                  Intrinsic Raw Metal Value:
                </Text>
                <Text style={styles.formulaValue}>
                  £
                  {(
                    goldRate24K *
                    (selectedItem.karat / 24) *
                    selectedItem.weightGram
                  ).toFixed(2)}
                </Text>
              </View>
              <View style={[styles.formulaRow, styles.formulaTotalRow]}>
                <Text style={styles.formulaTotalLabel}>
                  Total Live Showroom Price:
                </Text>
                <Text style={styles.formulaTotalValue}>
                  £{calculateItemPrice(selectedItem).toLocaleString()}
                </Text>
              </View>
            </View>
          </View>

          {/* دکمه رزرو و هماهنگی بازدید حضوری */}
          <View style={styles.actionSection}>
            <TouchableOpacity
              onPress={() => {
                onNavigateToBooking(selectedItem);
                setSelectedItem(null);
              }}
              style={styles.bookBtn}
              activeOpacity={0.8}
            >
              <Feather name="calendar" size={16} color="#0a0a0a" />
              <Text style={styles.bookBtnText}>
                Book Hatton Garden Private Viewing
              </Text>
            </TouchableOpacity>
            <Text style={styles.disclaimerText}>
              No deposit required. The item will be locked & polished in safe
              custody for your visual inspection.
            </Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// عرض کارت به ازای سیستم گرید دو ستونه
const CARD_WIDTH = (SCREEN_WIDTH - 44) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#171717",
    backgroundColor: "#0a0a0a",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTag: {
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1.2,
    color: "#f59e0b",
    textTransform: "uppercase",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#f5f5f5",
    marginTop: 2,
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
  headerBadgeText: {
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#171717",
    borderColor: "#1f1f1f",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: "#f5f5f5",
    fontSize: 12,
    paddingVertical: 10,
  },
  categoriesWrapper: {
    marginTop: 14,
    marginHorizontal: -16,
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#171717",
    borderWidth: 1,
    borderColor: "#1f1f1f",
  },
  categoryBtnActive: {
    backgroundColor: "#fbbf24",
    borderColor: "#fbbf24",
  },
  categoryBtnText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#a3a3a3",
  },
  categoryBtnTextActive: {
    color: "#0a0a0a",
    fontWeight: "bold",
  },
  listScroll: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 12,
    color: "#525252",
    fontStyle: "italic",
  },
  clearBtn: {
    marginTop: 12,
    backgroundColor: "#171717",
    borderColor: "#262626",
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  clearBtnText: {
    fontSize: 12,
    color: "#fbbf24",
    fontWeight: "600",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: "rgba(23, 23, 23, 0.45)",
    borderColor: "#1f1f1f",
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  popularBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    zIndex: 10,
    backgroundColor: "#fbbf24",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  popularBadgeText: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#0a0a0a",
    letterSpacing: 0.5,
  },
  cardImageContainer: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#0a0a0a",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardInfo: {
    padding: 10,
  },
  cardMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardKarat: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#fbbf24",
  },
  cardWeight: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#737373",
  },
  cardName: {
    fontSize: 11,
    fontWeight: "600",
    color: "#e5e5e5",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  retailLabel: {
    fontSize: 8.5,
    color: "#525252",
  },
  retailPrice: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#f5f5f5",
  },
  detailsContainer: {
    flex: 1,
  },
  detailsContent: {
    paddingBottom: 40,
  },
  detailsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#171717",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#a3a3a3",
  },
  specsTitle: {
    fontSize: 9,
    fontWeight: "bold",
    letterSpacing: 1.2,
    color: "#fbbf24",
  },
  detailsHero: {
    height: 240,
    position: "relative",
  },
  detailsHeroImage: {
    width: "100%",
    height: "100%",
  },
  detailsHeroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 10, 10, 0.45)",
  },
  detailsHeroText: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
  },
  detailsTag: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    borderColor: "rgba(245, 158, 11, 0.3)",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 6,
  },
  detailsTagText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#fbbf24",
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f5f5f5",
  },
  specsGrid: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 8,
  },
  specBox: {
    flex: 1,
    backgroundColor: "#171717",
    borderColor: "#1f1f1f",
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  specLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#525252",
    marginBottom: 4,
  },
  specValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#e5e5e5",
  },
  hallmarkRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  textAmber: {
    color: "#f59e0b",
  },
  narrativeSection: {
    paddingHorizontal: 16,
    marginTop: 18,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#525252",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  narrativeBody: {
    fontSize: 12,
    lineHeight: 18,
    color: "#a3a3a3",
  },
  formulaCard: {
    backgroundColor: "rgba(23, 23, 23, 0.35)",
    borderColor: "#171717",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginTop: 18,
  },
  formulaTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#e5e5e5",
    marginBottom: 8,
  },
  formulaGrid: {
    gap: 6,
  },
  formulaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  formulaLabel: {
    fontSize: 9.5,
    color: "#737373",
  },
  formulaValue: {
    fontSize: 9.5,
    color: "#d4d4d4",
    fontWeight: "500",
  },
  formulaTotalRow: {
    borderTopWidth: 1,
    borderColor: "#262626",
    paddingTop: 8,
    marginTop: 4,
  },
  formulaTotalLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#e5e5e5",
  },
  formulaTotalValue: {
    fontSize: 11.5,
    fontWeight: "bold",
    color: "#fbbf24",
  },
  actionSection: {
    paddingHorizontal: 16,
    marginTop: 20,
    alignItems: "center",
  },
  bookBtn: {
    flexDirection: "row",
    width: "100%",
    backgroundColor: "#fbbf24",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  bookBtnText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0a0a0a",
  },
  disclaimerText: {
    fontSize: 9,
    color: "#525252",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 14,
  },
});
