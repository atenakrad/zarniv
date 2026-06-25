/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  PanResponder,
  Dimensions,
  SafeAreaView
} from 'react-native';
// استفاده از آیکون‌های استاندارد اکسپو متناظر با lucide-react
import { Feather } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function ZoomModal({ imageSource, title, isOpen, onClose }) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // رفرنس‌هایی برای دسترسی به آخرین وضعیت در PanResponder (جلوگیری از مشکلات Closure)
  const scaleRef = useRef(scale);
  const positionRef = useRef(position);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  // ریست کردن زوم هنگام بستن مودال یا تغییر تصویر
  useEffect(() => {
    if (!isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, imageSource]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setScale(prev => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return next;
    });
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // تعریف کنترل کننده لمس و کشیدن تصویر بومی ری‌اکت نیتیو
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => scaleRef.current > 1,
      onMoveShouldSetPanResponder: () => scaleRef.current > 1,
      onPanResponderGrant: () => {
        dragStart.current = { x: positionRef.current.x, y: positionRef.current.y };
      },
      onPanResponderMove: (evt, gestureState) => {
        if (scaleRef.current <= 1) return;
        const nextX = dragStart.current.x + gestureState.dx;
        const nextY = dragStart.current.y + gestureState.dy;

        // محدود کردن محدوده کشیدن تصویر بر اساس مقدار زوم
        const limit = (scaleRef.current - 1) * 150;
        setPosition({
          x: Math.max(-limit, Math.min(limit, nextX)),
          y: Math.max(-limit, Math.min(limit, nextY)),
        });
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  return (
    <Modal
      visible={isOpen}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        {/* هدر بالایی مودال */}
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerSubtitle}>HD Close-Up Viewer</Text>
            <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            activeOpacity={0.7}
          >
            <Feather name="x" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* ناحیه بوم نمایش و تعامل لمسی با تصویر */}
        <View 
          {...panResponder.panHandlers} 
          style={styles.canvasStage}
        >
          <View
            style={[
              styles.imageContainer,
              {
                transform: [
                  { translateX: position.x },
                  { translateY: position.y },
                  { scale: scale }
                ]
              }
            ]}
          >
            <Image
              source={imageSource} 
              style={styles.image}
              resizeMode="contain"
            />
          </View>

          {scale > 1 && (
            <View style={styles.dragPill}>
              <Feather name="move" size={12} color="#f59e0b" style={styles.moveIcon} />
              <Text style={styles.dragPillText}>
                Drag to inspect ({Math.round(scale * 100)}%)
              </Text>
            </View>
          )}
        </View>

        {/* بخش پایینی کلیدهای زوم و بازنشانی */}
        <View style={styles.footer}>
          <View style={styles.controlsRow}>
            
            {/* دکمه کوچک‌نمایی */}
            <TouchableOpacity
              onPress={handleZoomOut}
              disabled={scale <= 1}
              style={[styles.controlBtn, scale <= 1 && styles.controlBtnDisabled]}
              activeOpacity={0.8}
            >
              <Feather name="zoom-out" size={18} color="#ffffff" />
            </TouchableOpacity>

            {/* دکمه ریست کردن زوم */}
            <TouchableOpacity
              onPress={handleReset}
              disabled={scale === 1 && position.x === 0 && position.y === 0}
              style={[
                styles.controlBtn, 
                (scale === 1 && position.x === 0 && position.y === 0) && styles.controlBtnDisabled
              ]}
              activeOpacity={0.8}
            >
              <Feather name="rotate-ccw" size={18} color="#ffffff" />
            </TouchableOpacity>

            {/* دکمه بزرگ‌نمایی */}
            <TouchableOpacity
              onPress={handleZoomIn}
              disabled={scale >= 4}
              style={[styles.controlBtn, scale >= 4 && styles.controlBtnDisabled]}
              activeOpacity={0.8}
            >
              <Feather name="zoom-in" size={18} color="#ffffff" />
            </TouchableOpacity>

          </View>
          
          <Text style={styles.footerInstruction}>
            Pinch or use buttons to zoom. Drag image when zoomed to inspect diamond facets and gold engravings.
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#0a0a0a',
  },
  headerTitleContainer: {
    flex: 1,
    marginRight: 16,
  },
  headerSubtitle: {
    fontSize: 9,
    color: '#f59e0b',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvasStage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0a0a0a',
  },
  imageContainer: {
    width: width - 32,
    height: height * 0.55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  dragPill: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  moveIcon: {
    marginRight: 6,
  },
  dragPillText: {
    color: '#f59e0b',
    fontSize: 10,
    fontFamily: 'System',
  },
  footer: {
    backgroundColor: '#171717',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  controlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
  },
  controlBtnDisabled: {
    opacity: 0.3,
  },
  footerInstruction: {
    fontSize: 9,
    color: '#a3a3a3',
    textAlign: 'center',
    lineHeight: 14,
    paddingHorizontal: 12,
  },
});