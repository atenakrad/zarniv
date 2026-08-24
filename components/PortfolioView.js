/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { portfolioItems } from "../screens/Foreign/portfolioData";
import ZoomModal from "./ZoomModal";

const { width } = Dimensions.get("window");
// محاسبه عرض هر کارت برای چیدمان تمیز دو ستونه روی انواع موبایل‌ها
const cardWidth = (width - 44) / 2;

export default function PortfolioView({ onOrderSimilar }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [zoomImg, setZoomImg] = useState(null);

  const categories = [
    "All",
    "Rings",
    "Necklaces",
    "Bracelets",
    "Earrings",
    "Pendants",
  ];

  const filteredItems = portfolioItems.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.materials.some((m) =>
        m.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  return (
    <View style={styles.container}>
      {selectedItem ? (
        // --- بخش ۱: نمای جزئیات محصول انتخاب شده ---
        <View style={styles.detailContainer}>
          {/* دکمه بازگشت */}
          <TouchableOpacity
            onPress={() => setSelectedItem(null)}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Feather
              name="arrow-left"
              size={16}
              color="#737373"
              style={styles.backIcon}
            />
            <Text style={styles.backButtonText}>Back to Showcase</Text>
          </TouchableOpacity>

          {/* عنوان و دسته‌بندی */}
          <View style={styles.detailHeader}>
            <View style={styles.badgeWrapper}>
              <Text style={styles.detailBadge}>
                Bespoke {selectedItem.category}
              </Text>
            </View>
            <Text style={styles.detailTitle}>{selectedItem.title}</Text>
            <Text style={styles.detailDesc}>{selectedItem.description}</Text>
          </View>

          {/* فرآیند طراحی و ساخت بصری (طرح اولیه در برابر شاهکار نهایی) */}
          <View style={styles.processSection}>
            <Text style={styles.sectionHeader}>
              <MaterialCommunityIcons
                name="sparkles"
                size={14}
                color="#f59e0b"
              />
              {"  "}Bespoke Creation Process
            </Text>

            {/* کارت مرحله اول: اتود طراحی */}
            <View style={styles.processCard}>
              <View style={styles.phaseBadge}>
                <Text style={styles.phaseBadgeText}>
                  Phase 1: Initial CAD / Artisan Sketch
                </Text>
              </View>
              <View style={styles.processImageWrapper}>
                <Image
                  source={selectedItem.sketchUrl}
                  style={styles.processImage}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() =>
                    setZoomImg({
                      source: selectedItem.sketchUrl,
                      title: `${selectedItem.title} (Artisan Sketch)`,
                    })
                  }
                  style={styles.zoomBtn}
                  activeOpacity={0.8}
                >
                  <Feather name="zoom-in" size={12} color="#b45309" />
                  <Text style={styles.zoomBtnText}>Zoom Details</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.processCaption}>
                Approved vector sketch drawing
              </Text>
            </View>

            {/* کارت مرحله دوم: جواهر نهایی ساخته شده */}
            <View style={styles.processCard}>
              <View style={[styles.phaseBadge, styles.phaseBadgeFinal]}>
                <Text style={styles.phaseBadgeTextFinal}>
                  Phase 2: Handcrafted Masterpiece
                </Text>
              </View>
              <View style={styles.processImageWrapper}>
                <Image
                  source={selectedItem.finalUrl}
                  style={styles.processImage}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() =>
                    setZoomImg({
                      source: selectedItem.finalUrl,
                      title: `${selectedItem.title} (Finished Jewelry)`,
                    })
                  }
                  style={styles.zoomBtn}
                  activeOpacity={0.8}
                >
                  <Feather name="zoom-in" size={12} color="#b45309" />
                  <Text style={styles.zoomBtnText}>Zoom Details</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.processCaptionFinal}>
                Completed solid gold jewelry masterpiece
              </Text>
            </View>

            <Text style={styles.tipText}>
              Tip: Tap "Zoom Details" to inspect precious gem facets and precise
              gold engravings.
            </Text>
          </View>

          {/* داستان هنری و مشخصات فنی کار */}
          <View style={styles.specsSection}>
            {/* داستان ساخته شدن اثر */}
            <View style={styles.storyCard}>
              <View style={styles.storyTitleRow}>
                <Feather
                  name="award"
                  size={15}
                  color="#f59e0b"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.storyTitle}>The Artisanal Story</Text>
              </View>
              <Text style={styles.storyText}>{selectedItem.story}</Text>
            </View>

            {/* مشخصات فنی بدنه جواهر */}
            <View style={styles.specsCard}>
              <Text style={styles.specsTitle}>Technical Specifications</Text>

              <View style={styles.specGroup}>
                <Text style={styles.specsSubLabel}>Precious Components:</Text>
                <View style={styles.materialsWrapper}>
                  {selectedItem.materials.map((mat, idx) => (
                    <View key={idx} style={styles.materialPill}>
                      <Text style={styles.materialText}>{mat}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.specRow}>
                <View style={styles.specLabelContainer}>
                  <MaterialCommunityIcons
                    name="ruler"
                    size={13}
                    color="#b45309"
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.specLabel}>Solid Weight:</Text>
                </View>
                <Text style={styles.specValue}>{selectedItem.weight}</Text>
              </View>

              <View style={styles.specRow}>
                <View style={styles.specLabelContainer}>
                  <Feather
                    name="calendar"
                    size={13}
                    color="#b45309"
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.specLabel}>Crafting Time:</Text>
                </View>
                <Text style={styles.specValue}>
                  {selectedItem.completionTime}
                </Text>
              </View>
            </View>
          </View>

          {/* دکمه سفارش اختصاصی بر اساس این مدل */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              onPress={() =>
                onOrderSimilar(
                  selectedItem.category,
                  `Hello Zarniv, I am fascinated by your masterpiece "${selectedItem.title}". I would love to order a similar custom jewelry custom-tailored to my specifications, using similar high-quality craft...`
                )
              }
              style={styles.inquireBtn}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="sparkles"
                size={16}
                color="#ffffff"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.inquireBtnText}>
                Inquire / Customize Similar Piece
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // --- بخش ۲: گالری اصلی و فیلترهای جستجو ---
        <View style={styles.listContainer}>
          {/* نوار فیلتر و فیلد جستجو */}
          <View style={styles.searchFilterCard}>
            {/* باکس سرچ */}
            <View style={styles.searchBox}>
              <Feather
                name="search"
                size={16}
                color="#a3a3a3"
                style={styles.searchIcon}
              />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search premium golds, gems, rings..."
                placeholderTextColor="#a3a3a3"
                style={styles.searchInput}
              />
            </View>

            {/* دسته‌بندی‌ها */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}
            >
              <Feather
                name="filter"
                size={14}
                color="#b45309"
                style={styles.filterIcon}
              />
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    style={[
                      styles.categoryBtn,
                      isActive && styles.categoryBtnActive,
                    ]}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.categoryBtnText,
                        isActive && styles.categoryBtnTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* لیست گرید محصولات */}
          {filteredItems.length === 0 ? (
            <View style={styles.noItemsContainer}>
              <Text style={styles.noItemsText}>
                No items found matching your filter criteria.
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
              >
                <Text style={styles.clearFiltersText}>Clear all filters</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.gridContainer}>
              {filteredItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setSelectedItem(item)}
                  style={styles.portfolioCard}
                  activeOpacity={0.9}
                >
                  <View style={styles.cardContent}>
                    {/* تصویر شاخص */}
                    <View style={styles.cardImageWrapper}>
                      <Image
                        source={item.finalUrl}
                        style={styles.cardImage}
                        resizeMode="cover"
                      />
                      <View style={styles.cardCategoryBadge}>
                        <Text style={styles.cardCategoryText}>
                          {item.category}
                        </Text>
                      </View>
                    </View>

                    {/* اطلاعات متنی کارت */}
                    <View style={styles.cardTextInfo}>
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.cardDesc} numberOfLines={2}>
                        {item.description}
                      </Text>
                    </View>
                  </View>

                  {/* پکیج آلیاژها و وزن کار در پایین کارت */}
                  <View style={styles.cardFooter}>
                    <View style={styles.cardMaterialsRow}>
                      {item.materials.slice(0, 2).map((mat, mIdx) => (
                        <View key={mIdx} style={styles.cardMaterialPill}>
                          <Text style={styles.cardMaterialText}>{mat}</Text>
                        </View>
                      ))}
                      {item.materials.length > 2 && (
                        <Text style={styles.cardMaterialsMore}>
                          +{item.materials.length - 2} more
                        </Text>
                      )}
                    </View>
                    <View style={styles.cardSpecsRow}>
                      <Text style={styles.cardSpecText}>
                        Weight:{" "}
                        <Text style={styles.specHighlight}>{item.weight}</Text>
                      </Text>
                      <Text style={styles.cardSpecText}>
                        Crafted:{" "}
                        <Text style={styles.specHighlight}>
                          {item.completionTime}
                        </Text>
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {/* مودال زوم برای بزرگنمایی نقشه و عکس نهایی */}
      <ZoomModal
        isOpen={!!zoomImg}
        imageSource={zoomImg?.source || null} 
        title={zoomImg?.title || ""}
        onClose={() => setZoomImg(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // استایل‌های بخش جزئیات محصول
  detailContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(254, 243, 199, 0.6)",
    padding: 16,
    marginBottom: 20,
    shadowColor: "#78350f",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 3,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  backIcon: {
    marginRight: 6,
  },
  backButtonText: {
    fontSize: 13,
    color: "#737373",
    fontWeight: "500",
  },
  detailHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
    paddingBottom: 16,
    marginBottom: 16,
  },
  badgeWrapper: {
    alignSelf: "flex-start",
    backgroundColor: "#fffbeb",
    borderColor: "#fef3c7",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
  },
  detailBadge: {
    fontSize: 10,
    color: "#d97706",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#171717",
    marginBottom: 6,
  },
  detailDesc: {
    fontSize: 13,
    color: "#737373",
    lineHeight: 18,
  },
  processSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "700",
    color: "#737373",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  processCard: {
    backgroundColor: "rgba(254, 243, 199, 0.15)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#fef3c7",
    padding: 12,
    marginBottom: 14,
  },
  phaseBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#171717",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
  },
  phaseBadgeFinal: {
    backgroundColor: "#d97706",
  },
  phaseBadgeText: {
    fontSize: 8,
    color: "#ffffff",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  phaseBadgeTextFinal: {
    fontSize: 8,
    color: "#ffffff",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  processImageWrapper: {
    height: width - 80,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#ffffff",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  processImage: {
    width: "100%",
    height: "100%",
  },
  zoomBtn: {
    position: "absolute",
    bottom: 12,
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#171717",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  zoomBtnText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#171717",
    marginLeft: 4,
  },
  processCaption: {
    fontSize: 10,
    color: "#a3a3a3",
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 8,
  },
  processCaptionFinal: {
    fontSize: 10,
    color: "#b45309",
    fontWeight: "600",
    textAlign: "center",
    marginTop: 8,
  },
  tipText: {
    fontSize: 9,
    color: "#a3a3a3",
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 4,
  },
  specsSection: {
    marginBottom: 20,
  },
  storyCard: {
    backgroundColor: "#fafafa",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f5f5f5",
    padding: 16,
    marginBottom: 14,
  },
  storyTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  storyTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#262626",
    textTransform: "uppercase",
  },
  storyText: {
    fontSize: 13,
    color: "#525252",
    lineHeight: 18,
  },
  specsCard: {
    backgroundColor: "rgba(254, 243, 199, 0.08)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(254, 243, 199, 0.4)",
    padding: 16,
  },
  specsTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#78350f",
    textTransform: "uppercase",
    marginBottom: 12,
  },
  specGroup: {
    marginBottom: 12,
  },
  specsSubLabel: {
    fontSize: 10,
    color: "#b45309",
    textTransform: "uppercase",
    fontWeight: "700",
    marginBottom: 6,
  },
  materialsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  materialPill: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#fef3c7",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
    marginBottom: 6,
  },
  materialText: {
    fontSize: 11,
    color: "#404040",
  },
  specRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "between",
    borderTopWidth: 1,
    borderTopColor: "rgba(254, 243, 199, 0.3)",
    paddingVertical: 10,
  },
  specLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  specLabel: {
    fontSize: 12,
    color: "#737373",
  },
  specValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#262626",
  },
  actionContainer: {
    marginTop: 8,
  },
  inquireBtn: {
    backgroundColor: "#b45309",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: "#b45309",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  inquireBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },

  // استایل‌های بخش نمایش لیست گالری
  listContainer: {
    marginBottom: 12,
  },
  searchFilterCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(254, 243, 199, 0.5)",
    padding: 12,
    marginBottom: 16,
    shadowColor: "#78350f",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: "#262626",
    padding: 0,
  },
  categoryScroll: {
    alignItems: "center",
    paddingVertical: 2,
  },
  filterIcon: {
    marginRight: 8,
  },
  categoryBtn: {
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
  },
  categoryBtnActive: {
    backgroundColor: "#b45309",
    borderColor: "#b45309",
  },
  categoryBtnText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#525252",
  },
  categoryBtnTextActive: {
    color: "#ffffff",
  },
  noItemsContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#f5f5f5",
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  noItemsText: {
    fontSize: 13,
    color: "#a3a3a3",
    marginBottom: 8,
  },
  clearFiltersText: {
    fontSize: 12,
    color: "#b45309",
    fontWeight: "700",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  portfolioCard: {
    width: cardWidth,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(254, 243, 199, 0.4)",
    borderBottomWidth: 3,
    borderBottomColor: "#d97706",
    marginBottom: 14,
    overflow: "hidden",
    justifyContent: "space-between",
    shadowColor: "#78350f",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  cardContent: {
    width: "100%",
  },
  cardImageWrapper: {
    position: "relative",
    height: cardWidth,
    backgroundColor: "#fafafa",
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardCategoryBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderWidth: 1,
    borderColor: "#fef3c7",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  cardCategoryText: {
    fontSize: 8,
    color: "#b45309",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  cardTextInfo: {
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#171717",
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 10,
    color: "#737373",
    lineHeight: 14,
  },
  cardFooter: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    paddingTop: 8,
  },
  cardMaterialsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  cardMaterialPill: {
    backgroundColor: "rgba(254, 243, 199, 0.3)",
    borderWidth: 1,
    borderColor: "#fef3c7",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 4,
  },
  cardMaterialText: {
    fontSize: 9,
    color: "#b45309",
    fontWeight: "600",
  },
  cardMaterialsMore: {
    fontSize: 8,
    color: "#a3a3a3",
    marginBottom: 4,
  },
  cardSpecsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#f5f5f5",
    paddingTop: 6,
  },
  cardSpecText: {
    fontSize: 8,
    color: "#a3a3a3",
  },
  specHighlight: {
    color: "#525252",
    fontWeight: "500",
  },
});
