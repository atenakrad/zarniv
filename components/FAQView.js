/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
// استفاده از آیکون‌های استاندارد اکسپو به جای lucide-react
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { faqItems } from '../screens/Foreign/portfolioData';

// فعال‌سازی LayoutAnimation برای روان بودن انیمیشن‌ها روی سیستم‌عامل اندروید
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function FAQView() {
  const [openFaqId, setOpenFaqId] = useState('faq1');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleFaq = (id) => {
    // ایجاد افکت بومی روان کشویی هنگام باز و بسته شدن سوالات
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenFaqId(openFaqId === id ? null : id);
  };

  const filteredFaqs = faqItems.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      
      {/* هدر بالایی بخش FAQ */}
      <View style={styles.bannerHeader}>
        <View style={styles.badgeWrapper}>
          <Text style={styles.badgeText}>Knowledge Base</Text>
        </View>
        <View style={styles.titleRow}>
          <Feather name="help-circle" size={22} color="#b45309" style={styles.helpIcon} />
          <Text style={styles.bannerTitle}>Frequently Asked Questions</Text>
        </View>
        <Text style={styles.bannerDesc}>
          Everything you need to know about our custom gold-casting techniques, raw sketches, GIA diamonds, and boutique handmade procedures.
        </Text>
      </View>

      {/* باکس جستجو */}
      <View style={styles.searchCard}>
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color="#a3a3a3" style={styles.searchIcon} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search FAQs (e.g. materials, shipping...)"
            placeholderTextColor="#a3a3a3"
            style={styles.searchInput}
          />
        </View>
      </View>

      {/* آکاردئون لیست سوالات */}
      <View style={styles.faqListCard}>
        <View style={styles.faqCardHeader}>
          <Feather name="book-open" size={15} color="#b45309" style={styles.bookIcon} />
          <Text style={styles.faqCardHeaderTitle}>
            Gold Handcrafting & Customization FAQs
          </Text>
        </View>

        {filteredFaqs.length === 0 ? (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>
              No matching questions found. Try search keywords like 'gold', 'recycled', 'shipping'.
            </Text>
          </View>
        ) : (
          <View style={styles.accordionContainer}>
            {filteredFaqs.map(faq => {
              const isOpen = openFaqId === faq.id;
              return (
                <View
                  key={faq.id}
                  style={styles.faqItemBorder}
                >
                  <TouchableOpacity
                    onPress={() => toggleFaq(faq.id)}
                    style={styles.faqQuestionButton}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.faqQuestionText}>
                      {faq.question}
                    </Text>
                    <Feather
                      name={isOpen ? "chevron-up" : "chevron-down"}
                      size={16}
                      color="#a3a3a3"
                    />
                  </TouchableOpacity>

                  {isOpen && (
                    <View style={styles.faqAnswerWrapper}>
                      <Text style={styles.faqAnswerText}>
                        {faq.answer}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* بنر یادآوری تعهد و ضمانت ساخت در انتها */}
      <View style={styles.guaranteeBanner}>
        <View style={styles.guaranteeIconWrapper}>
          <MaterialCommunityIcons name="order-bool-ascending" size={16} color="#b45309" />
        </View>
        <View style={styles.guaranteeTextContainer}>
          <Text style={styles.guaranteeTitle}>
            Our Customization Guarantee
          </Text>
          <Text style={styles.guaranteeDesc}>
            Every Zarniv ornament is custom-cast specifically for the ordering client. We do not mass-produce, nor do we stock pre-made jewelry. This guarantees that your piece is 100% unique, certified, and designed to your exact proportions and specifications.
          </Text>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bannerHeader: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 16,
  },
  badgeWrapper: {
    backgroundColor: '#fffbeb',
    borderColor: '#fef3c7',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 9,
    color: '#b45309',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  helpIcon: {
    marginRight: 8,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#171717',
    textAlign: 'center',
  },
  bannerDesc: {
    fontSize: 12,
    color: '#737373',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  searchCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(254, 243, 199, 0.5)',
    padding: 10,
    marginBottom: 16,
    shadowColor: '#78350f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#262626',
    padding: 0,
  },
  faqListCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(254, 243, 199, 0.6)',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#78350f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 3,
  },
  faqCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    paddingBottom: 12,
    marginBottom: 14,
  },
  bookIcon: {
    marginRight: 6,
  },
  faqCardHeaderTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#404040',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  noResultsContainer: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    fontSize: 12,
    color: '#a3a3a3',
    textAlign: 'center',
    lineHeight: 16,
  },
  accordionContainer: {
    width: '100%',
  },
  faqItemBorder: {
    borderWidth: 1,
    borderColor: '#f5f5f5',
    borderRadius: 12,
    backgroundColor: 'rgba(250, 250, 250, 0.4)',
    marginBottom: 10,
    overflow: 'hidden',
  },
  faqQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
  },
  faqQuestionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#262626',
    flex: 1,
    marginRight: 16,
    lineHeight: 18,
  },
  faqAnswerWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 10,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  faqAnswerText: {
    fontSize: 12,
    color: '#737373',
    lineHeight: 18,
  },
  guaranteeBanner: {
    backgroundColor: 'rgba(254, 243, 199, 0.15)',
    borderColor: 'rgba(254, 243, 199, 0.4)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'start',
    marginBottom: 20,
  },
  guaranteeIconWrapper: {
    padding: 6,
    backgroundColor: '#ffffff',
    borderColor: '#fef3c7',
    borderWidth: 1,
    borderRadius: 8,
    marginRight: 12,
    shadowColor: '#171717',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  guaranteeTextContainer: {
    flex: 1,
  },
  guaranteeTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#262626',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  guaranteeDesc: {
    fontSize: 10,
    color: '#737373',
    lineHeight: 14,
  },
});