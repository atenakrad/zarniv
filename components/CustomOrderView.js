/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  ActivityIndicator,
  Modal,
  Dimensions
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function CustomOrderView({ initialProductType = '', initialDescription = '', onOrderSubmitted }) {
  const [productType, setProductType] = useState('Ring');
  const [description, setDescription] = useState('');
  
  // وضعیت فایل‌ها (عکس و ویدیو)
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  
  // مقادیر ورودی
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  // وضعیت‌های تعاملی UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  // اعمال مقادیر ارسالی از سمت گالری کالاها (Portfolio)
  useEffect(() => {
    if (initialProductType) setProductType(initialProductType);
    if (initialDescription) setDescription(initialDescription);
  }, [initialProductType, initialDescription]);

  // --- انتخاب بومی تصاویر و ویدیوها از گالری تلفن همراه ---
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setImageFile({
        name: asset.fileName || 'sketch_upload.jpg',
        uri: asset.uri,
        base64: asset.base64
      });
    }
  };

  const pickVideo = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required to select video mockup!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setVideoFile({
        name: asset.fileName || 'video_mockup.mp4',
        uri: asset.uri
      });
    }
  };

  // --- ثبت نهایی اطلاعات سفارش ---
  const handleSubmit = async () => {
    if (!description.trim() || !phone.trim() || !email.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(async () => {
      const randNum = Math.floor(10000 + Math.random() * 90000);
      const newOrder = {
        id: `ord_${Date.now()}`,
        orderNumber: `ZRN-${randNum}`,
        productType,
        description,
        imageFileName: imageFile?.name || null,
        imageUri: imageFile?.uri || null,
        videoFileName: videoFile?.name || null,
        videoUri: videoFile?.uri || null,
        approxBudget: budget || 'Not specified',
        currency,
        contactPhone: phone,
        contactEmail: email,
        submittedAt: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        status: 'reviewing'
      };

      try {
        const existingOrdersStr = await AsyncStorage.getItem('zarniv_custom_orders');
        const existingOrders = existingOrdersStr ? JSON.parse(existingOrdersStr) : [];
        existingOrders.unshift(newOrder);
        await AsyncStorage.setItem('zarniv_custom_orders', JSON.stringify(existingOrders));

        setSuccessOrder(newOrder);
      } catch (err) {
        console.error('Failed to save order to local storage', err);
      }
      setIsSubmitting(false);
    }, 1200);
  };

  const resetForm = () => {
    setDescription('');
    setImageFile(null);
    setVideoFile(null);
    setBudget('');
    setPhone('');
    setEmail('');
    setSuccessOrder(null);
  };

  const productsList = [
    { label: "Solitaire & Wedding Ring", value: "Ring" },
    { label: "Artisanal Necklace", value: "Necklace" },
    { label: "Hand-Carved Bracelet or Cuff", value: "Bracelet" },
    { label: "Chandelier & Stud Earrings", value: "Earrings" },
    { label: "Vibrant Gemstone Pendant", value: "Pendant" },
    { label: "Royal Tiara / Crown", value: "Tiara" },
    { label: "Comprehensive Matching Jewelry Set", value: "Custom Set" },
    { label: "Other Custom Solid Gold Piece", value: "Other" },
  ];

  if (successOrder) {
    return (
      <View style={styles.successCard}>
        <View style={styles.successIconWrapper}>
          <Feather name="check-circle" size={36} color="#10b981" />
        </View>

        <View style={styles.successHeader}>
          <Text style={styles.successLabel}>Successfully Logged</Text>
          <Text style={styles.successTitle}>Custom Order Registered!</Text>
          <View style={styles.orderRefBadge}>
            <Text style={styles.orderRefText}>Order Reference: {successOrder.orderNumber}</Text>
          </View>
        </View>

        <Text style={styles.successDescription}>
          We have received your custom jewelry design inquiry. Our master jewelry design specialists will carefully review your sketches, descriptions, and media attachments. We will reach out to you within 24 business hours.
        </Text>

        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Product Type:</Text>
            <Text style={styles.summaryValue}>{successOrder.productType}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Budget Limit:</Text>
            <Text style={[styles.summaryValue, { fontFamily: 'System' }]}>
              {successOrder.approxBudget !== 'Not specified' ? `${successOrder.approxBudget} ${successOrder.currency}` : 'Flexible'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Contact Mobile:</Text>
            <Text style={[styles.summaryValue, { fontFamily: 'System' }]}>{successOrder.contactPhone}</Text>
          </View>
        </View>

        <View style={styles.successActionRow}>
          <TouchableOpacity
            onPress={resetForm}
            style={styles.resetBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.resetBtnText}>Submit Another</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onOrderSubmitted}
            style={styles.backBtn}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="order-bool-ascending" size={14} color="#ffffff" style={{ marginRight: 4 }} />
            <Text style={styles.backBtnText}>Back to Showcase</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.infoBanner}>
        <View style={styles.infoIconWrapper}>
          <MaterialCommunityIcons name="order-bool-ascending" size={20} color="#b45309" />
        </View>
        <View style={styles.infoTextContainer}>
          <Text style={styles.infoTitle}>The Bespoke Atelier Experience</Text>
          <Text style={styles.infoDesc}>
            Unleash your imagination. Share your dream designs, raw hand sketches, or reference videos with us. Our master gold artisans turn your bespoke dreams into physical solid-gold masterpieces.
          </Text>
        </View>
      </View>

      <View style={styles.formCard}>
        
        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>What jewelry should we design? <Text style={styles.required}>*</Text></Text>
          <TouchableOpacity
            style={styles.selectorDropdown}
            onPress={() => setShowProductModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.selectorText}>
              {productsList.find(p => p.value === productType)?.label || "Select Product"}
            </Text>
            <Feather name="chevron-down" size={16} color="#737373" />
          </TouchableOpacity>
        </View>

        {/* فیلد بودجه تقریبی */}
        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>Approximate Budget (Optional)</Text>
          <View style={styles.budgetRow}>
            <View style={styles.dollarIconWrapper}>
              <Feather name="dollar-sign" size={15} color="#737373" />
            </View>
            <TextInput
              value={budget}
              onChangeText={setBudget}
              placeholder="Flexible"
              placeholderTextColor="#a3a3a3"
              keyboardType="numeric"
              style={styles.budgetInput}
            />
            <TouchableOpacity
              style={styles.currencySelector}
              onPress={() => setShowCurrencyModal(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.currencyText}>{currency}</Text>
              <Feather name="chevron-down" size={12} color="#525252" style={{ marginLeft: 3 }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* توضیح طرح مورد نظر */}
        <View style={styles.inputGroup}>
          <Text style={styles.fieldLabel}>Describe your dream piece <Text style={styles.required}>*</Text></Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            multiline={true}
            numberOfLines={4}
            placeholder="Tell us about the metal purity (e.g. 18K Yellow Gold or Platinum), ring size, chosen center gemstones, custom laser engravings, or design references you want..."
            placeholderTextColor="#a3a3a3"
            style={styles.textArea}
          />
        </View>

        {/* پیوست چندرسانه‌ای */}
        <View style={styles.attachmentsSection}>
          <Text style={styles.attachmentSectionHeader}>Multi-Media Attachments & Inspiration</Text>
          
          <View style={styles.uploadButtonsGrid}>
            {/* دکمه آپلود عکس */}
            <TouchableOpacity
              onPress={pickImage}
              style={[styles.uploadCard, imageFile && styles.uploadCardActive]}
              activeOpacity={0.8}
            >
              {imageFile ? (
                <View style={styles.uploadedContainer}>
                  <Feather name="check-circle" size={20} color="#10b981" />
                  <Text style={styles.uploadFileName} numberOfLines={1}>{imageFile.name}</Text>
                  <TouchableOpacity onPress={() => setImageFile(null)}>
                    <Text style={styles.removeText}>Remove sketch</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Feather name="upload" size={18} color="#b45309" style={styles.uploadIcon} />
                  <Text style={styles.uploadTitle}>Inspiration Sketch / Photo</Text>
                  <Text style={styles.uploadSubtitle}>Select from your gallery</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* دکمه آپلود ویدیو */}
            <TouchableOpacity
              onPress={pickVideo}
              style={[styles.uploadCard, videoFile && styles.uploadCardActive]}
              activeOpacity={0.8}
            >
              {videoFile ? (
                <View style={styles.uploadedContainer}>
                  <Feather name="check-circle" size={20} color="#10b981" />
                  <Text style={styles.uploadFileName} numberOfLines={1}>{videoFile.name}</Text>
                  <TouchableOpacity onPress={() => setVideoFile(null)}>
                    <Text style={styles.removeText}>Remove video</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Feather name="video" size={18} color="#b45309" style={styles.uploadIcon} />
                  <Text style={styles.uploadTitle}>3D Cad Mock / Video file</Text>
                  <Text style={styles.uploadSubtitle}>Select from your gallery</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* کانال‌های تماس ایمن */}
        <View style={styles.contactSection}>
          <Text style={styles.contactSectionHeader}>Secure Contact Channels</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Phone / Mobile <Text style={styles.required}>*</Text></Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="+1 (555) 019-2834"
              placeholderTextColor="#a3a3a3"
              style={styles.plainInput}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Email Address <Text style={styles.required}>*</Text></Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholder="yourname@gmail.com"
              placeholderTextColor="#a3a3a3"
              style={styles.plainInput}
            />
          </View>
        </View>

        {/* بخش ثبت نهایی */}
        <View style={styles.submitSection}>
          <View style={styles.guaranteeNote}>
            <Feather name="info" size={14} color="#b45309" style={{ marginRight: 6, marginTop: 1 }} />
            <Text style={styles.guaranteeNoteText}>
              <Text style={{ fontWeight: 'bold', color: '#404040' }}>Zarniv Guarantee:</Text> Submit your custom order specifications. Our certified designers and master jewelers will inspect all files immediately. We will initiate a consult call to begin creating your masterpiece.
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={styles.submitBtnText}>Registering Order...</Text>
              </View>
            ) : (
              <View style={styles.loadingRow}>
                <MaterialCommunityIcons name="order-bool-ascending" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.submitBtnText}>Submit Custom Design Request</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

      </View>

      {/* مودال انتخاب نوع کالا (Product Category Selection) */}
      <Modal
        visible={showProductModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowProductModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Jewelry Type</Text>
              <TouchableOpacity onPress={() => setShowProductModal(false)}>
                <Feather name="x" size={20} color="#262626" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {productsList.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  onPress={() => {
                    setProductType(item.value);
                    setShowProductModal(false);
                  }}
                  style={[styles.modalItem, productType === item.value && styles.modalItemActive]}
                >
                  <Text style={[styles.modalItemText, productType === item.value && styles.modalItemTextActive]}>
                    {item.label}
                  </Text>
                  {productType === item.value && <Feather name="check" size={16} color="#b45309" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* مودال انتخاب واحد پول */}
      <Modal
        visible={showCurrencyModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { maxHeight: 220 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Currency</Text>
              <TouchableOpacity onPress={() => setShowCurrencyModal(false)}>
                <Feather name="x" size={18} color="#262626" />
              </TouchableOpacity>
            </View>
            {['USD', 'EUR', 'AED'].map((cur) => (
              <TouchableOpacity
                key={cur}
                onPress={() => {
                  setCurrency(cur);
                  setShowCurrencyModal(false);
                }}
                style={[styles.modalItem, currency === cur && styles.modalItemActive]}
              >
                <Text style={[styles.modalItemText, currency === cur && styles.modalItemTextActive]}>
                  {cur}
                </Text>
                {currency === cur && <Feather name="check" size={14} color="#b45309" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  infoBanner: {
    backgroundColor: 'rgba(254, 243, 199, 0.15)',
    borderColor: 'rgba(254, 243, 199, 0.5)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'start',
    marginBottom: 16,
  },
  infoIconWrapper: {
    padding: 8,
    backgroundColor: '#ffffff',
    borderColor: '#fef3c7',
    borderWidth: 1,
    borderRadius: 10,
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#171717',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 11,
    color: '#737373',
    lineHeight: 15,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(254, 243, 199, 0.6)',
    padding: 16,
    shadowColor: '#78350f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#737373',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  required: {
    color: '#b45309',
  },
  selectorDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
  },
  selectorText: {
    fontSize: 13,
    color: '#262626',
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    height: 44,
    overflow: 'hidden',
  },
  dollarIconWrapper: {
    width: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#f5f5f5',
    backgroundColor: '#fafafa',
  },
  budgetInput: {
    flex: 1,
    fontSize: 13,
    color: '#262626',
    paddingHorizontal: 12,
    paddingVertical: 0,
    fontFamily: 'System',
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#f5f5f5',
    backgroundColor: '#fafafa',
    height: '100%',
    paddingHorizontal: 10,
  },
  currencyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#525252',
    fontFamily: 'System',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: '#262626',
    textAlignVertical: 'top',
    height: 100,
  },
  attachmentsSection: {
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
    paddingTop: 16,
    marginBottom: 16,
  },
  attachmentSectionHeader: {
    fontSize: 10,
    fontWeight: '700',
    color: '#a3a3a3',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  uploadButtonsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  uploadCard: {
    width: (width - 76) / 2,
    height: 110,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#e5e5e5',
    borderRadius: 16,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  uploadCardActive: {
    borderColor: '#a7f3d0',
    backgroundColor: 'rgba(240, 253, 250, 0.5)',
  },
  uploadPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIcon: {
    marginBottom: 6,
  },
  uploadTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#404040',
    textAlign: 'center',
    marginBottom: 2,
  },
  uploadSubtitle: {
    fontSize: 8,
    color: '#a3a3a3',
    textAlign: 'center',
  },
  uploadedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadFileName: {
    fontSize: 9,
    fontWeight: '600',
    color: '#262626',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 2,
    maxWidth: 100,
  },
  removeText: {
    fontSize: 8,
    color: '#ef4444',
    textDecorationLine: 'underline',
  },
  contactSection: {
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
    paddingTop: 16,
    marginBottom: 16,
  },
  contactSectionHeader: {
    fontSize: 10,
    fontWeight: '700',
    color: '#a3a3a3',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  plainInput: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#262626',
    fontFamily: 'System',
  },
  submitSection: {
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
    paddingTop: 16,
  },
  guaranteeNote: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    alignItems: 'start',
  },
  guaranteeNoteText: {
    fontSize: 10,
    color: '#737373',
    lineHeight: 14,
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#b45309',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#b45309',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.5,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#262626',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#fafafa',
  },
  modalItemActive: {
    backgroundColor: '#fffbeb',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  modalItemText: {
    fontSize: 13,
    color: '#525252',
  },
  modalItemTextActive: {
    color: '#b45309',
    fontWeight: '700',
  },

  successCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  successIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  successLabel: {
    fontSize: 9,
    color: '#10b981',
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#171717',
    marginBottom: 8,
  },
  orderRefBadge: {
    backgroundColor: '#fffbeb',
    borderColor: 'rgba(254, 243, 199, 0.8)',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  orderRefText: {
    fontSize: 11,
    color: '#b45309',
    fontWeight: '700',
  },
  successDescription: {
    fontSize: 12,
    color: '#737373',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  summaryContainer: {
    width: '100%',
    backgroundColor: 'rgba(254, 243, 199, 0.1)',
    borderColor: 'rgba(254, 243, 199, 0.3)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#737373',
  },
  summaryValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#262626',
  },
  successActionRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  resetBtn: {
    width: (width - 76) / 2,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#525252',
  },
  backBtn: {
    width: (width - 76) / 2,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#b45309',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
});