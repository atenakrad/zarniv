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
  TextInput,
  Alert,
  Dimensions,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

// تلاش برای ایمپورت کردن AsyncStorage در صورت نصب بودن
let AsyncStorage;
try {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch (e) {
  AsyncStorage = null;
}

const services = [
  { id: "View Jewelry", label: "VIP Showcase" },
  { id: "Sell Scrap Gold", label: "Sell Scrap" },
  { id: "Bespoke Design", label: "Custom Design" },
  { id: "Valuation Service", label: "Valuation" },
];

export default function StoreInfo({
  initialBookedItem,
  clearInitialBookedItem,
}) {
  const [bookings, setBookings] = useState([]);

  // فیلدهای فرم ثبت رزرو
  const [fName, setFName] = useState("");
  const [fEmail, setFEmail] = useState("");
  const [fPhone, setFPhone] = useState("");
  const [fDate, setFDate] = useState("");
  const [fTime, setFTime] = useState("");
  const [fService, setFService] = useState("View Jewelry");
  const [fNotes, setFNotes] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  // لود کردن رزروهای ذخیره شده
  useEffect(() => {
    const loadBookings = async () => {
      if (AsyncStorage) {
        try {
          const saved = await AsyncStorage.getItem("aura_shop_bookings");
          if (saved) {
            setBookings(JSON.parse(saved));
          }
        } catch (e) {}
      }
    };
    loadBookings();
  }, []);

  // تکمیل خودکار فرم در صورت دریافت محصول پیشنهادی از بخش شو‌روم
  useEffect(() => {
    if (initialBookedItem) {
      setFService("View Jewelry");
      setFNotes(
        `Interested in private viewing of: ${initialBookedItem.name} (${initialBookedItem.karat}k, approx weight: ${initialBookedItem.weightGram}g)`
      );
      setShowForm(true);
    }
  }, [initialBookedItem]);

  // ثبت نهایی قرار ملاقات حضوری
  const saveBooking = async () => {
    if (!fName || !fEmail || !fPhone || !fDate || !fTime) {
      Alert.alert(
        "Missing Details",
        "Please fill out complete appointment details."
      );
      return;
    }

    const uniqueCode = "AUR-" + Math.floor(100000 + Math.random() * 900000);
    const newBooking = {
      id: uniqueCode,
      name: fName,
      email: fEmail,
      phone: fPhone,
      date: fDate,
      time: fTime,
      serviceType: fService,
      notes: fNotes,
      status: "Confirmed",
    };

    const updated = [newBooking, ...bookings];
    setBookings(updated);

    if (AsyncStorage) {
      try {
        await AsyncStorage.setItem(
          "aura_shop_bookings",
          JSON.stringify(updated)
        );
      } catch (e) {}
    }

    // بازنشانی فرم به حالت پیش‌فرض
    setFName("");
    setFEmail("");
    setFPhone("");
    setFDate("");
    setFTime("");
    setFNotes("");
    setShowForm(false);
    if (clearInitialBookedItem) clearInitialBookedItem();

    setSuccessMsg(
      `Boutique Reservation Confirmed! Your VIP Booking code is: ${uniqueCode}`
    );
  };

  // لغو نوبت قرار ملاقات
  const removeBooking = async (id) => {
    const updated = bookings.filter((b) => b.id !== id);
    setBookings(updated);
    if (AsyncStorage) {
      try {
        await AsyncStorage.setItem(
          "aura_shop_bookings",
          JSON.stringify(updated)
        );
      } catch (e) {}
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* هدر صفحه */}
        <View style={styles.header}>
          <View>
            <Text style={styles.tagText}>Boutique & Head Office</Text>
            <Text style={styles.title}>Physical Showroom</Text>
          </View>
          <View style={styles.headerBadge}>
            <Text style={styles.badgeText}>🇬🇧</Text>
          </View>
        </View>

        {/* کارت مشخصات آدرس لندن هتن گاردن */}
        <View style={styles.storeCard}>
          <Text style={styles.storeTitle}>Aura London Boutique</Text>
          <Text style={styles.storeDescription}>
            Situated inside the historic gold and bullion district of central
            London, Hatton Garden.
          </Text>

          <View style={styles.detailsList}>
            <View style={styles.detailRow}>
              <Feather
                name="map-pin"
                size={14}
                color="#f59e0b"
                style={styles.detailIcon}
              />
              <View>
                <Text style={styles.detailTextBold}>32 Hatton Garden</Text>
                <Text style={styles.detailTextMono}>
                  Holborn, London EC1N 8DH
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Feather
                name="clock"
                size={14}
                color="#f59e0b"
                style={styles.detailIcon}
              />
              <View>
                <Text style={styles.detailTextBold}>Opening Hours</Text>
                <Text style={styles.detailTextSub}>
                  Monday – Saturday: 09:30 – 18:00
                </Text>
                <Text style={styles.detailTextMuted}>
                  Sunday: Closed (Private Vaulting Only)
                </Text>
              </View>
            </View>

            <View style={[styles.detailRow, styles.borderTop]}>
              <Feather
                name="phone"
                size={14}
                color="#fbbf24"
                style={styles.detailIcon}
              />
              <Text style={styles.detailLinkText}>+44 (0) 20 7946 0852</Text>
            </View>

            <View style={styles.detailRow}>
              <Feather
                name="mail"
                size={14}
                color="#fbbf24"
                style={styles.detailIcon}
              />
              <Text style={styles.detailLinkText}>
                reservations@auragold.london
              </Text>
            </View>
          </View>
        </View>

        {/* اعلان‌های مربوط به تایید نوبت رزرو نهایی */}
        {successMsg && (
          <View style={styles.toastContainer}>
            <Text style={styles.toastText}>{successMsg}</Text>
            <TouchableOpacity
              onPress={() => setSuccessMsg(null)}
              activeOpacity={0.7}
            >
              <Text style={styles.toastAckText}>Acknowledge Receipt</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* قرارهای ملاقات رزرو شده توسط کاربر */}
        {bookings.length > 0 && (
          <View style={styles.bookingsSection}>
            <View style={styles.sectionHeaderRow}>
              <Feather name="calendar" size={14} color="#f59e0b" />
              <Text style={styles.sectionTitle}>
                My London VIP Appointment Slots
              </Text>
            </View>

            {bookings.map((booking) => (
              <View key={booking.id} style={styles.bookingCard}>
                <TouchableOpacity
                  onPress={() => removeBooking(booking.id)}
                  style={styles.cancelBtn}
                  activeOpacity={0.7}
                >
                  <Feather name="trash-2" size={14} color="#737373" />
                </TouchableOpacity>

                <View style={styles.bookingCardHeader}>
                  <View style={styles.bookingCodeBadge}>
                    <Text style={styles.bookingCodeText}>{booking.id}</Text>
                  </View>
                  <Text style={styles.bookingServiceText}>
                    {booking.serviceType}
                  </Text>
                </View>

                <View style={styles.bookingCardMeta}>
                  <Text style={styles.bookingMetaText}>
                    Date: {booking.date}
                  </Text>
                  <Text style={styles.bookingMetaText}>
                    Time: {booking.time} BST
                  </Text>
                </View>
                {booking.notes && (
                  <Text style={styles.bookingNotes} numberOfLines={1}>
                    {booking.notes}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* فرم ثبت یا دکمه فعالسازی رزرو */}
        <View style={styles.actionContainer}>
          {!showForm ? (
            <TouchableOpacity
              onPress={() => setShowForm(true)}
              style={styles.triggerBtn}
              activeOpacity={0.8}
            >
              <Feather name="calendar" size={14} color="#0a0a0a" />
              <Text style={styles.triggerBtnText}>
                Schedule Valuation or Showcase Viewing
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Boutique Appointment Form</Text>

              {/* کامپوننت انتخاب خدمت بهینه موبایل */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Select Service Type</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.servicesScroll}
                  style={styles.servicesWrapper}
                >
                  {services.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => setFService(item.id)}
                      style={[
                        styles.serviceSelectBtn,
                        fService === item.id && styles.serviceSelectBtnActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.serviceSelectText,
                          fService === item.id &&
                            styles.serviceSelectTextActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* نام و ایمیل */}
              <View style={styles.gridRow}>
                <View style={styles.gridCol}>
                  <Text style={styles.formLabel}>Contact Name</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Lady Spencer"
                    placeholderTextColor="#444"
                    value={fName}
                    onChangeText={setFName}
                  />
                </View>
                <View style={styles.gridCol}>
                  <Text style={styles.formLabel}>Email Code</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="client@london.co.uk"
                    placeholderTextColor="#444"
                    keyboardType="email-address"
                    value={fEmail}
                    onChangeText={setFEmail}
                  />
                </View>
              </View>

              {/* تلفن و نوبت */}
              <View style={styles.gridRow}>
                <View style={styles.gridCol}>
                  <Text style={styles.formLabel}>Telephone</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="+44 7911 123456"
                    placeholderTextColor="#444"
                    keyboardType="phone-pad"
                    value={fPhone}
                    onChangeText={setFPhone}
                  />
                </View>
                <View style={styles.gridColDouble}>
                  <View style={styles.gridRow}>
                    <View style={styles.gridCol}>
                      <Text style={styles.formLabel}>Date</Text>
                      <TextInput
                        style={[styles.formInput, styles.fontMono]}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#444"
                        value={fDate}
                        onChangeText={setFDate}
                      />
                    </View>
                    <View style={styles.gridCol}>
                      <Text style={styles.formLabel}>BST Time</Text>
                      <TextInput
                        style={[styles.formInput, styles.fontMono]}
                        placeholder="HH:MM"
                        placeholderTextColor="#444"
                        value={fTime}
                        onChangeText={setFTime}
                      />
                    </View>
                  </View>
                </View>
              </View>

              {/* توضیحات ویژه فرم رزرو */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Special requests (Optional)
                </Text>
                <TextInput
                  style={[styles.formInput, styles.textAreaInput]}
                  multiline
                  numberOfLines={3}
                  placeholder="Details of bullion weights or diamond-purity interests..."
                  placeholderTextColor="#444"
                  value={fNotes}
                  onChangeText={setFNotes}
                />
              </View>

              {/* اطلاعات محصول ارجاع داده شده از شو‌روم در صورت انتخاب */}
              {initialBookedItem && (
                <View style={styles.itemRefBadge}>
                  <Feather name="tag" size={12} color="#f59e0b" />
                  <Text style={styles.itemRefBadgeText} numberOfLines={1}>
                    Reserved locked viewing for: {initialBookedItem.name} (
                    {initialBookedItem.weightGram}g)
                  </Text>
                </View>
              )}

              {/* دکمه‌های کنترل فرم ملاقات */}
              <View style={styles.formActions}>
                <TouchableOpacity
                  onPress={saveBooking}
                  style={styles.submitBtn}
                  activeOpacity={0.8}
                >
                  <Text style={styles.submitBtnText}>Register Booking</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setShowForm(false);
                    if (clearInitialBookedItem) clearInitialBookedItem();
                  }}
                  style={styles.cancelFormBtn}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelFormText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* اطلاعات امنیتی مربوط به معامله طلا با فروشگاه */}
        <View style={styles.guidelineBox}>
          <View style={styles.guidelineHeader}>
            <MaterialCommunityIcons
              name="shield-alert-outline"
              size={16}
              color="#fbbf24"
            />
            <Text style={styles.guidelineTitle}>
              Selling Your Gold Guideline
            </Text>
          </View>
          <Text style={styles.guidelineBody}>
            Aura Gold pays immediate high sterling rates for verified gold
            weights. For standard security compliance, we require:
          </Text>
          <View style={styles.guidelineList}>
            <Text style={styles.guidelineItem}>
              • A valid government-issued ID (Passport / UK Driver License)
            </Text>
            <Text style={styles.guidelineItem}>
              • Accompanying hallmark certification (if available)
            </Text>
            <Text style={styles.guidelineItem}>
              • Instant Direct Faster Payment bank transfer or secure escrow
              options
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  title: {
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
  badgeText: {
    fontSize: 14,
  },
  storeCard: {
    backgroundColor: "rgba(23, 23, 23, 0.45)",
    borderColor: "#1f1f1f",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  storeTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#f5f5f5",
  },
  storeDescription: {
    fontSize: 10.5,
    color: "#a3a3a3",
    marginTop: 4,
    lineHeight: 15,
  },
  detailsList: {
    marginTop: 14,
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  detailIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  detailTextBold: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#e5e5e5",
  },
  detailTextMono: {
    fontSize: 10,
    color: "#737373",
    marginTop: 1,
  },
  detailTextSub: {
    fontSize: 10,
    color: "#a3a3a3",
    marginTop: 1,
  },
  detailTextMuted: {
    fontSize: 9.5,
    color: "#525252",
    marginTop: 1,
  },
  borderTop: {
    borderTopWidth: 1,
    borderColor: "#1c1c1c",
    paddingTop: 10,
  },
  detailLinkText: {
    fontSize: 11.5,
    color: "#d4d4d4",
  },
  toastContainer: {
    backgroundColor: "rgba(16, 185, 129, 0.08)",
    borderColor: "rgba(16, 185, 129, 0.3)",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginTop: 16,
  },
  toastText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#10b981",
    lineHeight: 16,
  },
  toastAckText: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#fbbf24",
    textDecorationLine: "underline",
    textAlign: "center",
    marginTop: 10,
    textTransform: "uppercase",
  },
  bookingsSection: {
    marginTop: 20,
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 4,
  },
  sectionTitle: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#d4d4d4",
    marginLeft: 6,
  },
  bookingCard: {
    backgroundColor: "#171717",
    borderColor: "#1f1f1f",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    position: "relative",
  },
  cancelBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    padding: 4,
    zIndex: 10,
  },
  bookingCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bookingCodeBadge: {
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    borderColor: "rgba(245, 158, 11, 0.25)",
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bookingCodeText: {
    fontSize: 8.5,
    fontWeight: "bold",
    color: "#fbbf24",
  },
  bookingServiceText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#e5e5e5",
  },
  bookingCardMeta: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  bookingMetaText: {
    fontSize: 10,
    color: "#737373",
  },
  bookingNotes: {
    fontSize: 9.5,
    color: "#525252",
    fontStyle: "italic",
    borderTopWidth: 1,
    borderColor: "#1c1c1c",
    marginTop: 8,
    paddingTop: 6,
  },
  actionContainer: {
    marginTop: 16,
  },
  triggerBtn: {
    flexDirection: "row",
    width: "100%",
    backgroundColor: "#fbbf24",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  triggerBtnText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0a0a0a",
  },
  formCard: {
    backgroundColor: "rgba(23, 23, 23, 0.35)",
    borderColor: "#1c1c1c",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  formTitle: {
    fontSize: 11.5,
    fontWeight: "bold",
    color: "#fbbf24",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  formGroup: {
    gap: 6,
  },
  formLabel: {
    fontSize: 9,
    color: "#737373",
    textTransform: "uppercase",
  },
  servicesWrapper: {
    marginHorizontal: -16,
  },
  servicesScroll: {
    paddingHorizontal: 16,
    gap: 6,
  },
  serviceSelectBtn: {
    backgroundColor: "#0a0a0a",
    borderColor: "#1c1c1c",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  serviceSelectBtnActive: {
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    borderColor: "#fbbf24",
  },
  serviceSelectText: {
    fontSize: 9.5,
    color: "#525252",
  },
  serviceSelectTextActive: {
    color: "#fbbf24",
    fontWeight: "bold",
  },
  gridRow: {
    flexDirection: "row",
    gap: 8,
  },
  gridCol: {
    flex: 1,
    gap: 6,
  },
  gridColDouble: {
    flex: 1,
  },
  formInput: {
    backgroundColor: "#0a0a0a",
    borderColor: "#1c1c1c",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: "#f5f5f5",
    fontSize: 11.5,
  },
  textAreaInput: {
    height: 60,
    textAlignVertical: "top",
  },
  fontMono: {
    fontSize: 10,
  },
  itemRefBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 158, 11, 0.1)",
    borderColor: "rgba(245, 158, 11, 0.15)",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  itemRefBadgeText: {
    fontSize: 9.5,
    color: "#fbbf24",
    flex: 1,
  },
  formActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  submitBtn: {
    flex: 1,
    backgroundColor: "#fbbf24",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0a0a0a",
  },
  cancelFormBtn: {
    backgroundColor: "#171717",
    borderColor: "#262626",
    borderWidth: 1,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelFormText: {
    fontSize: 12,
    color: "#a3a3a3",
    fontWeight: "500",
  },
  guidelineBox: {
    backgroundColor: "rgba(23, 23, 23, 0.2)",
    borderColor: "#171717",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginTop: 20,
  },
  guidelineHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  guidelineTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#fbbf24",
    textTransform: "uppercase",
  },
  guidelineBody: {
    fontSize: 10,
    color: "#737373",
    lineHeight: 14,
  },
  guidelineList: {
    marginTop: 8,
    gap: 4,
  },
  guidelineItem: {
    fontSize: 9,
    color: "#525252",
    lineHeight: 13,
  },
});
