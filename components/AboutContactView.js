/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
// استفاده از پکیج‌های آیکون بومی اکسپو
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function AboutContactView() {
  return (
    <View style={styles.container}>
      
      {/* هدر بالایی درباره ما */}
      <View style={styles.heroHeader}>
        <View style={styles.badgeWrapper}>
          <Text style={styles.badgeText}>Elite Bespoke Goldsmiths</Text>
        </View>
        <Text style={styles.heroTitle}>About Zarniv Atelier</Text>
        <Text style={styles.heroDesc}>
          Crafting memories into tangible, hand-finished masterpieces. Discover our design heritage, contact details, and client protections.
        </Text>
      </View>

      {/* بخش اول: داستان برند */}
      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <View style={styles.titleIndicator} />
          <Text style={styles.cardTitle}>Our Golden Heritage</Text>
        </View>
        <Text style={styles.cardText}>
          Founded on the pillars of absolute exclusivity and raw artisan craftsmanship, Zarniv is a luxury bespoke jewelry brand. We reject generic mass-production to create singular, highly-specialized jewelry tailored for you.
        </Text>
        <Text style={styles.cardText}>
          Every single ring, bracelet, and pendant begins as a unique concept. Hand-forged by veteran gold-carvers, we maintain micro-tolerance precision down to the micron. We marry centuries-old Italian goldsmith techniques with modern 3D CAD modeling.
        </Text>

        <View style={styles.guaranteeBanner}>
          <Feather name="award" size={18} color="#f59e0b" style={{ marginRight: 8 }} />
          <Text style={styles.guaranteeBannerText}>
            Only authentic, certified precious materials used.
          </Text>
        </View>
      </View>

      {/* بخش دوم: کانال‌های ارتباطی */}
      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <View style={styles.titleIndicator} />
          <Text style={styles.cardTitle}>Connect With Us</Text>
        </View>

        <View style={styles.channelsList}>
          {/* پشتیبانی تلفنی */}
          <View style={styles.channelItem}>
            <Feather name="phone" size={18} color="#b45309" style={styles.channelIcon} />
            <View style={styles.channelContent}>
              <Text style={styles.channelTitle}>Phone & Mobile Support</Text>
              <Text style={styles.channelValue}>+971 4 482 1934</Text>
              <Text style={styles.channelSubtitle}>Available Mon-Sat, 9AM to 6PM (GMT+4)</Text>
            </View>
          </View>

          {/* ایمیل */}
          <View style={styles.channelItem}>
            <Feather name="mail" size={18} color="#b45309" style={styles.channelIcon} />
            <View style={styles.channelContent}>
              <Text style={styles.channelTitle}>Inquiry Email</Text>
              <Text style={styles.channelValue}>bespoke@zarniv.com</Text>
              <Text style={styles.channelSubtitle}>Response guaranteed inside 24 hours</Text>
            </View>
          </View>

          {/* اینستاگرام */}
          <View style={styles.channelItem}>
            <Feather name="instagram" size={18} color="#b45309" style={styles.channelIcon} />
            <View style={styles.channelContent}>
              <Text style={styles.channelTitle}>Instagram DM Catalog</Text>
              <Text style={styles.channelValue}>@zarniv_atelier</Text>
              <Text style={styles.channelSubtitle}>Browse live behind-the-scenes metalwork</Text>
            </View>
          </View>
        </View>
      </View>

      {/* بخش سوم: زمان پاسخگویی و موقعیت دفاتر */}
      <View style={styles.boxGrid}>
        <View style={styles.infoBox}>
          <Feather name="clock" size={18} color="#b45309" style={{ marginBottom: 6 }} />
          <Text style={styles.infoBoxTitle}>Response Windows</Text>
          <Text style={styles.infoBoxDesc}>
            Our atelier support operators operate Monday through Saturday. Custom order blueprints submitted through the custom portal are evaluated immediately, with consultation proposals sent via phone or email within 1 business day.
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Feather name="map-pin" size={18} color="#b45309" style={{ marginBottom: 6 }} />
          <Text style={styles.infoBoxTitle}>Global Shipping Offices</Text>
          <Text style={styles.infoBoxDesc}>
            We hold private showrooms in Dubai, London, and Geneva. Custom requests can be drafted in-person or fully dispatched worldwide via secured FedEx / DHL armored couriers.
          </Text>
        </View>
      </View>

      {/* بخش چهارم: حریم خصوصی و قوانین */}
      <View style={styles.securityHeaderContainer}>
        <Text style={styles.securityHeader}>Client Security, Privacy & Terms of Service</Text>
      </View>

      {/* حریم خصوصی */}
      <View style={[styles.card, { padding: 16 }]}>
        <View style={styles.securityTitleRow}>
          <MaterialCommunityIcons name="shield-check" size={18} color="#b45309" style={{ marginRight: 6 }} />
          <Text style={styles.securityTitle}>Privacy & Blueprint Security</Text>
        </View>
        <Text style={styles.securityText}>
          At Zarniv, we value client confidentiality. We guarantee that your unique sketches, customized ring diameters, spoken audio specs, and contact details are strictly secure.
        </Text>
        <View style={styles.bulletList}>
          <View style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Blueprints are never resold or reproduced for third parties.</Text>
          </View>
          <View style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Personal identifiers (Email, Mobile) are solely used for direct consultation.</Text>
          </View>
          <View style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Uploaded reference media is deleted automatically after project fulfillment.</Text>
          </View>
        </View>
      </View>

      {/* قوانین ساخت */}
      <View style={[styles.card, { padding: 16, marginBottom: 32 }]}>
        <View style={styles.securityTitleRow}>
          <Feather name="file-text" size={18} color="#b45309" style={{ marginRight: 6 }} />
          <Text style={styles.securityTitle}>Bespoke Terms & Casting Regulations</Text>
        </View>
        <Text style={styles.securityText}>
          Because custom jewelry is crafted specifically for you, all custom jewelry agreements adhere to strictly regulated industry standards.
        </Text>
        <View style={styles.bulletList}>
          <View style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Casting and gemstone settings will only proceed upon your formal sign-off on 3D CAD design blueprints.</Text>
          </View>
          <View style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Minor variations in natural stone hues are expected, although we match the exact GIA certified properties.</Text>
          </View>
          <View style={styles.bulletRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Every item comes with standard GIA certificates and an official gold hallmark stamp (750 / 916 / 950 PT).</Text>
          </View>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroHeader: {
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
  heroTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#171717',
    marginBottom: 6,
  },
  heroDesc: {
    fontSize: 12,
    color: '#737373',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(254, 243, 199, 0.6)',
    padding: 18,
    marginBottom: 16,
    shadowColor: '#78350f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleIndicator: {
    width: 3,
    height: 18,
    backgroundColor: '#f59e0b',
    borderRadius: 2,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#171717',
  },
  cardText: {
    fontSize: 12,
    color: '#525252',
    lineHeight: 18,
    marginBottom: 10,
  },
  guaranteeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(254, 243, 199, 0.15)',
    borderColor: 'rgba(254, 243, 199, 0.5)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  guaranteeBannerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#78350f',
  },
  channelsList: {
    marginTop: 4,
  },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#f5f5f5',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  channelIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  channelContent: {
    flex: 1,
  },
  channelTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#262626',
    marginBottom: 2,
  },
  channelValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#525252',
    fontFamily: 'System',
    marginBottom: 2,
  },
  channelSubtitle: {
    fontSize: 9,
    color: '#a3a3a3',
  },
  boxGrid: {
    marginBottom: 16,
  },
  infoBox: {
    backgroundColor: '#fafafa',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    padding: 16,
    marginBottom: 12,
  },
  infoBoxTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#262626',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoBoxDesc: {
    fontSize: 10.5,
    color: '#737373',
    lineHeight: 15,
  },
  securityHeaderContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    paddingBottom: 6,
    marginBottom: 12,
    paddingLeft: 4,
  },
  securityHeader: {
    fontSize: 10,
    fontWeight: '700',
    color: '#a3a3a3',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  securityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  securityTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#78350f',
  },
  securityText: {
    fontSize: 11,
    color: '#737373',
    lineHeight: 16,
    marginBottom: 12,
  },
  bulletList: {
    marginTop: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  bullet: {
    fontSize: 12,
    color: '#b45309',
    marginRight: 6,
    lineHeight: 14,
  },
  bulletText: {
    fontSize: 10.5,
    color: '#737373',
    flex: 1,
    lineHeight: 15,
  },
});