import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function Header() {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.contentWrapper}>
        
        <View style={styles.brandContainer}>
          <View style={styles.titleRow}>
            {/* <MaterialCommunityIcons name="order-bool-ascending" size={18} color="#f59e0b" style={styles.sparkleIcon} /> */}
            <Text style={styles.brandTitle}>ZARNIV</Text>
          </View>
          <Text style={styles.brandSubtitle}>
            BESPOKE GOLD & FINE JEWELRY
          </Text>
        </View>

        <View style={styles.indicatorsContainer}>
          <View style={styles.indicatorItem}>
            <Feather name="award" size={12} color="#f59e0b" style={styles.indicatorIcon} />
            <Text style={styles.indicatorText}>Certified Diamonds (GIA)</Text>
          </View>
          
          <Text style={styles.separator}>|</Text>
          
          <View style={styles.indicatorItem}>
            <MaterialCommunityIcons name="shield-check" size={13} color="#f59e0b" style={styles.indicatorIcon} />
            <Text style={styles.indicatorText}>18K & 22K Hallmarked Gold</Text>
          </View>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(254, 243, 199, 0.5)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: '#78350f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
  },
  contentWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleIcon: {
    marginRight: 6,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 4,
    color: '#171717',
    fontFamily: 'System',
  },
  brandSubtitle: {
    fontSize: 8,
    letterSpacing: 2,
    color: '#b45309',
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  indicatorsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  indicatorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  indicatorIcon: {
    marginRight: 4,
  },
  indicatorText: {
    fontSize: 9,
    color: '#737373',
    fontFamily: 'System',
  },
  separator: {
    color: '#e5e5e5',
    marginHorizontal: 6,
    fontSize: 10,
  },
});