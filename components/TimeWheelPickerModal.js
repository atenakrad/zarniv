import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
    themeColor0,
    themeColor1,
    themeColor3,
    themeColor4,
    themeColor5,
    themeColor10,
    themeColor12,
} from '../theme/Color';

const ITEM_HEIGHT = 48;
const VISIBLE_ITEMS = 5;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const pad = (value) => String(value).padStart(2, '0');

function WheelColumn({ data, value, onChange, label }) {
    const listRef = useRef(null);
    const selectedIndex = Math.max(0, data.findIndex((item) => item === value));

    useEffect(() => {
        const timer = setTimeout(() => {
            listRef.current?.scrollToOffset?.({
                offset: selectedIndex * ITEM_HEIGHT,
                animated: false,
            });
        }, 30);
        return () => clearTimeout(timer);
    }, [selectedIndex]);

    const updateFromOffset = (offsetY) => {
        const index = Math.max(0, Math.min(data.length - 1, Math.round(offsetY / ITEM_HEIGHT)));
        onChange(data[index]);
    };

    return (
        <View style={styles.wheelColumn}>
            <Text style={styles.wheelLabel}>{label}</Text>
            <View style={styles.wheelViewport}>
                <View pointerEvents="none" style={styles.selectionBand} />
                <FlatList
                    ref={listRef}
                    data={data}
                    keyExtractor={(item) => item}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                    snapToInterval={ITEM_HEIGHT}
                    decelerationRate="fast"
                    contentContainerStyle={styles.wheelContent}
                    getItemLayout={(_, index) => ({
                        length: ITEM_HEIGHT,
                        offset: ITEM_HEIGHT * index,
                        index,
                    })}
                    onMomentumScrollEnd={(event) => updateFromOffset(event.nativeEvent.contentOffset.y)}
                    onScrollEndDrag={(event) => updateFromOffset(event.nativeEvent.contentOffset.y)}
                    renderItem={({ item }) => {
                        const selected = item === value;
                        return (
                            <TouchableOpacity
                                activeOpacity={0.75}
                                style={styles.wheelItem}
                                onPress={() => {
                                    onChange(item);
                                    const index = data.indexOf(item);
                                    listRef.current?.scrollToOffset?.({
                                        offset: index * ITEM_HEIGHT,
                                        animated: true,
                                    });
                                }}
                            >
                                <Text style={[styles.wheelItemText, selected && styles.wheelItemTextSelected]}>
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>
        </View>
    );
}

export default function TimeWheelPickerModal({
    visible,
    hour,
    minute,
    onClose,
    onConfirm,
}) {
    const insets = useSafeAreaInsets();
    const hours = useMemo(() => Array.from({ length: 24 }, (_, index) => pad(index)), []);
    const minutes = useMemo(() => Array.from({ length: 60 }, (_, index) => pad(index)), []);
    const [draftHour, setDraftHour] = useState('12');
    const [draftMinute, setDraftMinute] = useState('00');

    useEffect(() => {
        if (!visible) return;
        const now = new Date();
        setDraftHour(/^\d{1,2}$/.test(String(hour || '')) ? pad(Number(hour)) : pad(now.getHours()));
        setDraftMinute(/^\d{1,2}$/.test(String(minute || '')) ? pad(Number(minute)) : pad(now.getMinutes()));
    }, [visible, hour, minute]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <View style={styles.modalRoot}>
                <Pressable style={styles.backdrop} onPress={onClose} />
                <View style={[styles.sheet, { paddingBottom: 16 + insets.bottom }]}>
                    <View style={styles.handle} />
                    <View style={styles.headerRow}>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Ionicons name="close" size={20} color={themeColor1.bgColor(0.72)} />
                        </TouchableOpacity>
                        <View style={styles.headerCopy}>
                            <Text style={styles.title}>انتخاب ساعت تحویل</Text>
                            <Text style={styles.subtitle}>ساعت و دقیقه را با چرخاندن انتخاب کنید</Text>
                        </View>
                    </View>

                    <View style={styles.timePreview}>
                        <Text style={styles.previewValue}>{draftHour}:{draftMinute}</Text>
                    </View>

                    <View style={styles.wheelsRow}>
                        <WheelColumn data={hours} value={draftHour} onChange={setDraftHour} label="ساعت" />
                        <Text style={styles.separator}>:</Text>
                        <WheelColumn data={minutes} value={draftMinute} onChange={setDraftMinute} label="دقیقه" />
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.88}
                        style={styles.confirmButton}
                        onPress={() => onConfirm?.(draftHour, draftMinute)}
                    >
                        <Text style={styles.confirmText}>تأیید زمان</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalRoot: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: themeColor10.bgColor(0.28),
    },
    sheet: {
        backgroundColor: themeColor5.bgColor(1),
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    handle: {
        width: 42,
        height: 4,
        borderRadius: 10,
        backgroundColor: themeColor3.bgColor(0.32),
        alignSelf: 'center',
        marginBottom: 14,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerCopy: {
        flex: 1,
        alignItems: 'flex-end',
        paddingLeft: 14,
    },
    closeButton: {
        width: 38,
        height: 38,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: themeColor12.bgColor(0.72),
    },
    title: {
        fontFamily: 'VazirBold',
        color: themeColor1.bgColor(1),
        textAlign: 'right',
        fontSize: 17,
    },
    subtitle: {
        fontFamily: 'VazirLight',
        color: themeColor3.bgColor(1),
        textAlign: 'right',
        marginTop: 3,
    },
    timePreview: {
        alignSelf: 'center',
        marginTop: 18,
        paddingHorizontal: 18,
        paddingVertical: 7,
        borderRadius: 14,
        backgroundColor: themeColor0.bgColor(0.09),
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: themeColor0.bgColor(0.28),
    },
    previewValue: {
        fontFamily: 'VazirBold',
        fontSize: 22,
        color: themeColor1.bgColor(1),
        textAlign: 'center',
        minWidth: 72,
    },
    wheelsRow: {
        flexDirection: 'row',
        direction: 'ltr',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    wheelColumn: {
        width: 112,
        alignItems: 'center',
    },
    wheelLabel: {
        fontFamily: 'VazirLight',
        color: themeColor3.bgColor(1),
        textAlign: 'center',
        marginBottom: 4,
    },
    wheelViewport: {
        width: '100%',
        height: WHEEL_HEIGHT,
        overflow: 'hidden',
        position: 'relative',
    },
    wheelContent: {
        paddingVertical: ITEM_HEIGHT * 2,
    },
    selectionBand: {
        position: 'absolute',
        zIndex: 2,
        left: 7,
        right: 7,
        top: ITEM_HEIGHT * 2,
        height: ITEM_HEIGHT,
        borderRadius: 12,
        backgroundColor: themeColor0.bgColor(0.08),
        borderTopWidth: StyleSheet.hairlineWidth,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: themeColor0.bgColor(0.34),
    },
    wheelItem: {
        height: ITEM_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
    },
    wheelItemText: {
        fontFamily: 'VazirLight',
        fontSize: 17,
        color: themeColor3.bgColor(0.72),
        textAlign: 'center',
    },
    wheelItemTextSelected: {
        fontFamily: 'VazirBold',
        fontSize: 20,
        color: themeColor1.bgColor(1),
    },
    separator: {
        fontFamily: 'VazirBold',
        fontSize: 23,
        color: themeColor0.bgColor(1),
        marginHorizontal: 3,
        marginTop: 20,
    },
    confirmButton: {
        height: 50,
        marginTop: 8,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: themeColor1.bgColor(1),
    },
    confirmText: {
        fontFamily: 'VazirBold',
        color: themeColor4.bgColor(1),
        textAlign: 'center',
        fontSize: 15,
    },
});
