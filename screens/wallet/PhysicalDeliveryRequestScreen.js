import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import axios from 'axios';
import { getFormatedDate } from 'react-native-modern-datepicker';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import BackHeader from '../../components/BackHeader';
import DatePickerModal from '../../components/DatePickerModal';
import Button from '../../components/Button';
import SelectedComponent from '../../components/SelectedComponent';
import TradeLimitNotice from '../../components/TradeLimitNotice';
import TimeWheelPickerModal from '../../components/TimeWheelPickerModal';
import VoteTimerDisplay from '../../components/VoteTimerDisplay';
import WalletPieceBalance from '../../components/WalletPieceBalance';
import { formatDate, formatPrice, handleError, showToastOrAlert } from '../../helpers/Common';
import { formatGramLimit } from '../../helpers/tradeLimits';
import { uri } from '../../services/URL';
import { fetchTradingAllowed } from '../../slices/tradingAllowed';
import { fetchUser } from '../../slices/userSlice';
import NewStyles from '../../styles/NewStyles';
import {
    themeColor0,
    themeColor1,
    themeColor3,
    themeColor4,
    themeColor5,
    themeColor6,
    themeColor7,
    themeColor10,
    themeColor12,
} from '../../theme/Color';

const METAL_CONFIG = {
    gold: {
        label: 'طلا',
        endpoint: 'delivery/request/',
        historyRoute: 'DeliveryRequestHistory',
        title: 'تحویل فیزیکی طلا',
    },
    silver: {
        label: 'نقره',
        endpoint: 'silver/delivery/request/',
        historyRoute: 'SilverDeliveryRequestHistory',
        title: 'تحویل فیزیکی نقره',
    },
};

const normalizeNaturalInput = (value) => String(value ?? '')
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/[^0-9]/g, '')
    .replace(/^0+(?=\d)/, '');

const clampNatural = (value, min, max) => {
    const numeric = Number(value);
    if (!Number.isInteger(numeric)) return null;
    return Math.min(max, Math.max(min, numeric));
};

const makeDeliveryLimits = (deliveryData) => {
    if (!deliveryData) return { min: 0.001, max: null, hasMax: false };
    const rawMax = Number(deliveryData.max_gram);
    const hasMax = deliveryData.max_gram !== undefined && deliveryData.max_gram !== null;
    return {
        min: Number(deliveryData.min_gram) > 0 ? Number(deliveryData.min_gram) : 0.001,
        max: Number.isFinite(rawMax) && rawMax > 0 ? rawMax : null,
        hasMax,
    };
};

const SectionHeader = ({ step, title, subtitle }) => (
    <View style={styles.sectionHeader}>
        <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>{step}</Text>
        </View>
        <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {!!subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
        </View>
    </View>
);

const InlineLoadingItem = ({ icon = 'sync-outline', label = 'در حال دریافت اطلاعات' }) => (
    <View style={styles.inlineLoadingItem}>
        <View style={styles.inlineLoadingIcon}>
            <ActivityIndicator size="small" color={themeColor1.bgColor(0.88)} />
        </View>
        <View style={{ flex: 1 }}>
            <Text style={styles.inlineLoadingLabel}>{label}</Text>
            <View style={styles.loadingLine} />
        </View>
        <Ionicons name={icon} size={18} color={themeColor3.bgColor(0.42)} />
    </View>
);

const PieceLoadingCard = ({ index }) => (
    <View style={styles.pieceLoadingCard}>
        <View style={styles.pieceLoadingImage}>
            <ActivityIndicator size="small" color={themeColor1.bgColor(0.82)} />
        </View>
        <View style={{ flex: 1, gap: 7 }}>
            <View style={[styles.loadingLine, { width: `${72 - index * 8}%` }]} />
            <View style={[styles.loadingLine, styles.loadingLineMuted, { width: '58%' }]} />
            <View style={[styles.loadingLine, styles.loadingLineMuted, { width: '44%' }]} />
        </View>
    </View>
);

const MetricValue = ({ loading, children, success = false }) => (
    <View style={styles.metricValueWrap}>
        {loading ? (
            <ActivityIndicator size="small" color={themeColor1.bgColor(0.82)} />
        ) : (
            <Text style={success ? NewStyles.title7 : NewStyles.title1}>{children}</Text>
        )}
    </View>
);

export default function PhysicalDeliveryRequestScreen({ navigation, metal }) {
    const config = METAL_CONFIG[metal] || METAL_CONFIG.gold;
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const accessToken = useSelector((state) => state?.token?.accessToken);
    const user = useSelector((state) => state?.user?.data);
    const trading = useSelector((state) => state?.trading);
    const tradingData = trading?.data;

    const [deliveryData, setDeliveryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [selectedPieceId, setSelectedPieceId] = useState(null);
    const [quantityText, setQuantityText] = useState('');
    const [quote, setQuote] = useState(null);
    const [quoteLoading, setQuoteLoading] = useState(false);
    const [quoteError, setQuoteError] = useState('');

    const [receiverName, setReceiverName] = useState('');
    const [receiverPhone, setReceiverPhone] = useState('');
    const [receiverNationalCode, setReceiverNationalCode] = useState('');
    const [way, setWay] = useState('pickup');
    const [pickupStore, setPickupStore] = useState('');
    const [pickupTimeSlot, setPickupTimeSlot] = useState('');
    const [pickupDate, setPickupDate] = useState('');
    const [pickupHour, setPickupHour] = useState('');
    const [pickupMinute, setPickupMinute] = useState('');
    const [datePickerModal, setDatePickerModal] = useState(false);
    const [timePickerModal, setTimePickerModal] = useState(false);
    const [shippingPostId, setShippingPostId] = useState('');
    const [shippingQuote, setShippingQuote] = useState(null);
    const [shippingAddress, setShippingAddress] = useState('');
    const [postCode, setPostCode] = useState('');

    const loadRequestId = useRef(0);
    const quoteRequestId = useRef(0);
    const selectedPieceIdRef = useRef(null);
    const quantityTextRef = useRef('');

    const headers = useMemo(() => ({
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
    }), [accessToken]);

    useEffect(() => {
        selectedPieceIdRef.current = selectedPieceId;
    }, [selectedPieceId]);

    useEffect(() => {
        quantityTextRef.current = quantityText;
    }, [quantityText]);

    const selectedPiece = useMemo(
        () => deliveryData?.pieces?.find((item) => Number(item.id) === Number(selectedPieceId)) || null,
        [deliveryData, selectedPieceId],
    );

    const quantity = Number(quantityText);
    const quantityIsValid = Boolean(
        selectedPiece
        && Number.isInteger(quantity)
        && quantity >= Number(selectedPiece.min_quantity)
        && quantity <= Number(selectedPiece.max_quantity)
    );
    const pickupHourNumber = Number(pickupHour);
    const pickupMinuteNumber = Number(pickupMinute);
    const customPickupTimeValid = Boolean(
        pickupDate
        && pickupHour !== ''
        && pickupMinute !== ''
        && Number.isInteger(pickupHourNumber)
        && pickupHourNumber >= 0
        && pickupHourNumber <= 23
        && Number.isInteger(pickupMinuteNumber)
        && pickupMinuteNumber >= 0
        && pickupMinuteNumber <= 59
    );

    const deliveryLimits = useMemo(() => makeDeliveryLimits(deliveryData), [deliveryData]);
    const stores = useMemo(() => Array.isArray(deliveryData?.pickup_stores) ? deliveryData.pickup_stores : [], [deliveryData?.pickup_stores]);
    const pickupSlots = useMemo(() => Array.isArray(deliveryData?.pickup_slots) ? deliveryData.pickup_slots : [], [deliveryData?.pickup_slots]);
    const shippingPosts = useMemo(() => Array.isArray(deliveryData?.shipping_posts) ? deliveryData.shipping_posts : [], [deliveryData?.shipping_posts]);
    const selectedShippingPost = useMemo(
        () => shippingPosts.find((item) => Number(item.id) === Number(shippingPostId)) || null,
        [shippingPosts, shippingPostId],
    );
    useEffect(() => {
        if (pickupStore && !stores.some((item) => Number(item.id) === Number(pickupStore))) {
            setPickupStore('');
        }
    }, [pickupStore, stores]);
    useEffect(() => {
        if (pickupTimeSlot && !pickupSlots.some((item) => Number(item.id) === Number(pickupTimeSlot))) {
            setPickupTimeSlot('');
        }
    }, [pickupTimeSlot, pickupSlots]);
    useEffect(() => {
        if (shippingPostId && !shippingPosts.some((item) => Number(item.id) === Number(shippingPostId))) {
            setShippingPostId('');
            setShippingQuote(null);
        }
    }, [shippingPostId, shippingPosts]);

    const pickupScheduleRestricted = Boolean(deliveryData?.pickup_schedule_restricted);
    const todayJalali = useMemo(() => getFormatedDate(new Date(), 'jYYYY/jMM/jDD'), []);
    const maxPickupDate = useMemo(() => {
        const value = new Date();
        value.setFullYear(value.getFullYear() + 1);
        return getFormatedDate(value, 'jYYYY/jMM/jDD');
    }, []);

    useEffect(() => {
        if (!user) return;
        if (!receiverName) {
            setReceiverName(`${user?.first_name || ''} ${user?.last_name || ''}`.trim());
        }
        if (!receiverPhone) {
            setReceiverPhone(String(user?.local_phone || user?.phone_number || ''));
        }
        if (!receiverNationalCode) {
            setReceiverNationalCode(String(user?.national_code || ''));
        }
    }, [user]);

    const applyDeliveryData = useCallback((data) => {
        setDeliveryData(data);

        if (!data?.pickup_available && data?.shipping_available) {
            setWay('shipping');
        } else if (data?.pickup_available && !data?.shipping_available) {
            setWay('pickup');
        }

        const pieces = Array.isArray(data?.pieces) ? data.pieces : [];
        if (!pieces.length) {
            selectedPieceIdRef.current = null;
            quantityTextRef.current = '';
            setSelectedPieceId(null);
            setQuantityText('');
            setQuote(null);
            return;
        }

        const current = pieces.find(
            (item) => Number(item.id) === Number(selectedPieceIdRef.current),
        );
        const piece = current || pieces[0];
        const currentQuantity = Number(quantityTextRef.current);
        const canKeepQuantity = current
            && Number.isInteger(currentQuantity)
            && currentQuantity >= Number(piece.min_quantity)
            && currentQuantity <= Number(piece.max_quantity);
        const nextQuantity = canKeepQuantity
            ? currentQuantity
            : Number(piece.min_quantity || 1);

        selectedPieceIdRef.current = piece.id;
        quantityTextRef.current = String(nextQuantity);
        setSelectedPieceId(piece.id);
        setQuantityText(String(nextQuantity));
        setQuote(nextQuantity === Number(piece.min_quantity) ? (piece.default_quote || null) : null);
        setQuoteError('');
    }, []);

    const loadData = useCallback(async ({ silent = false } = {}) => {
        if (!accessToken) {
            setLoading(false);
            return;
        }
        const requestId = ++loadRequestId.current;
        if (!silent) setLoading(true);
        try {
            const deliveryResponse = await axios.get(`${uri}/${config.endpoint}`, { headers });
            if (requestId !== loadRequestId.current) return;
            applyDeliveryData(deliveryResponse?.data || {});
        } catch (error) {
            if (requestId !== loadRequestId.current) return;
            handleError(error, t);
        } finally {
            if (requestId === loadRequestId.current) {
                setLoading(false);
                setRefreshing(false);
            }
        }
    }, [accessToken, config.endpoint, headers, applyDeliveryData, t]);

    useFocusEffect(
        useCallback(() => {
            if (!accessToken) return undefined;
            dispatch(fetchUser(accessToken));
            dispatch(fetchTradingAllowed());
            loadData();
            return () => {
                loadRequestId.current += 1;
                quoteRequestId.current += 1;
            };
        }, [accessToken, dispatch, loadData]),
    );

    useEffect(() => {
        if (!selectedPiece || !quantityIsValid || !accessToken) {
            if (selectedPiece && quantityText) {
                setQuoteError(`تعداد این قطعه باید بین ${selectedPiece.min_quantity} و ${selectedPiece.max_quantity} عدد باشد.`);
            }
            setQuote(null);
            setShippingQuote(null);
            setQuoteLoading(false);
            return undefined;
        }

        if (quantity === Number(selectedPiece.min_quantity) && selectedPiece.default_quote) {
            setQuote(selectedPiece.default_quote);
            setQuoteError('');
        }

        const timer = setTimeout(async () => {
            const requestId = ++quoteRequestId.current;
            setQuoteLoading(true);
            try {
                const response = await axios.get(`${uri}/${config.endpoint}`, {
                    headers,
                    params: {
                        piece_id: selectedPiece.id,
                        quantity,
                        ...(way === 'shipping' && shippingPostId ? { shipping_post_id: shippingPostId } : {}),
                    },
                });
                if (requestId !== quoteRequestId.current) return;
                setQuote(response?.data?.quote || null);
                setShippingQuote(response?.data?.shipping_quote || null);
                setQuoteError('');
            } catch (error) {
                if (requestId !== quoteRequestId.current) return;
                setQuote(null);
                setShippingQuote(null);
                setQuoteError(error?.response?.data?.message || 'امکان محاسبه این تعداد قطعه وجود ندارد.');
            } finally {
                if (requestId === quoteRequestId.current) setQuoteLoading(false);
            }
        }, 160);

        return () => clearTimeout(timer);
    }, [accessToken, config.endpoint, headers, quantity, quantityIsValid, selectedPiece, shippingPostId, way]);

    const selectPiece = (piece) => {
        setSelectedPieceId(piece.id);
        const nextQuantity = Number(piece.min_quantity || 1);
        setQuantityText(String(nextQuantity));
        setQuote(piece.default_quote || null);
        setQuoteError('');
    };

    const changeQuantityBy = (delta) => {
        if (!selectedPiece) return;
        const min = Number(selectedPiece.min_quantity || 1);
        const max = Number(selectedPiece.max_quantity || min);
        const current = clampNatural(quantityText, min, max) ?? min;
        setQuantityText(String(Math.min(max, Math.max(min, current + delta))));
    };

    const handleQuantityInput = (text) => {
        setQuantityText(normalizeNaturalInput(text));
    };

    const normalizeQuantityOnBlur = () => {
        if (!selectedPiece) return;
        const min = Number(selectedPiece.min_quantity || 1);
        const max = Number(selectedPiece.max_quantity || min);
        const clamped = clampNatural(quantityText, min, max);
        setQuantityText(String(clamped ?? min));
    };

    const pickupRequestedAt = customPickupTimeValid
        ? `${pickupDate} ${String(pickupHourNumber).padStart(2, '0')}:${String(pickupMinuteNumber).padStart(2, '0')}`
        : '';

    const pickupSelectionValid = Boolean(
        deliveryData?.pickup_available
        && pickupStore
        && (pickupScheduleRestricted ? pickupTimeSlot : customPickupTimeValid)
    );
    const shippingSelectionValid = Boolean(
        deliveryData?.shipping_available
        && shippingPostId
        && shippingAddress.trim()
        && shippingQuote
    );

    const submit = async () => {
        if (!deliveryData?.can_submit) {
            showToastOrAlert(deliveryData?.block_reason || 'در حال حاضر امکان ثبت درخواست تحویل وجود ندارد.');
            return;
        }
        if (!selectedPiece || !quantityIsValid || !quote) {
            showToastOrAlert('قطعه و تعداد معتبر را انتخاب کنید.');
            return;
        }
        if (way === 'pickup' && !pickupSelectionValid) {
            if (!pickupStore) {
                showToastOrAlert('برای تحویل حضوری، فروشگاه را انتخاب کنید.');
            } else if (pickupScheduleRestricted) {
                showToastOrAlert('بازه زمانی مجاز تحویل را انتخاب کنید.');
            } else {
                showToastOrAlert('تاریخ و ساعت آینده برای تحویل حضوری را کامل انتخاب کنید.');
            }
            return;
        }
        if (way === 'shipping' && !shippingSelectionValid) {
            if (!shippingPostId) {
                showToastOrAlert('روش ارسال را انتخاب کنید.');
            } else if (!shippingAddress.trim()) {
                showToastOrAlert('آدرس کامل ارسال را وارد کنید.');
            } else {
                showToastOrAlert('محاسبه هزینه ارسال کامل نشده است.');
            }
            return;
        }

        setSubmitting(true);
        try {
            const response = await axios.post(
                `${uri}/${config.endpoint}`,
                {
                    piece_id: selectedPiece.id,
                    quantity,
                    receiver_name: receiverName,
                    receiver_phone: receiverPhone,
                    receiver_national_code: receiverNationalCode,
                    pickup_store_id: way === 'pickup' ? pickupStore : null,
                    pickup_time_slot_id: way === 'pickup' && pickupScheduleRestricted ? pickupTimeSlot : null,
                    pickup_requested_at: way === 'pickup' && !pickupScheduleRestricted ? pickupRequestedAt : null,
                    delivery_method: way,
                    shipping_post_id: way === 'shipping' ? shippingPostId : null,
                    shipping_address: way === 'shipping' ? shippingAddress : '',
                    shipping_postal_code: way === 'shipping' ? postCode : '',
                },
                { headers },
            );

            showToastOrAlert(response?.data?.message || 'درخواست تحویل فیزیکی ثبت شد.');
            await Promise.all([
                dispatch(fetchUser(accessToken)),
                dispatch(fetchTradingAllowed()),
            ]);
            await loadData({ silent: true });
        } catch (error) {
            handleError(error, t);
        } finally {
            setSubmitting(false);
        }
    };

    const onRefresh = async () => {
        if (!accessToken) return;
        setRefreshing(true);
        dispatch(fetchUser(accessToken));
        dispatch(fetchTradingAllowed());
        await loadData({ silent: true });
    };

    if (!accessToken) {
        return (
            <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={NewStyles.container}>
                <BackHeader title={config.title} />
                <View style={[{ flex: 1, padding: '7%' }, NewStyles.center]}>
                    <Ionicons name="lock-closed-outline" size={34} color={themeColor1.bgColor(1)} />
                    <Text style={[NewStyles.title1, { marginTop: 12, textAlign: 'center' }]}>برای ثبت تحویل فیزیکی باید وارد حساب کاربری شوید.</Text>
                </View>
            </SafeAreaView>
        );
    }

    const initialDataLoading = loading || (!tradingData && trading?.loading);

    if (tradingData?.allowed === false) {
        return (
            <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={NewStyles.container}>
                <BackHeader title={config.title} />
                <View style={[{ flex: 1 }, NewStyles.center]}>
                    <VoteTimerDisplay
                        competitionStartAt={tradingData?.start}
                        durationMinutes={null}
                        nowDate={tradingData?.now}
                        initialRemainingSeconds={tradingData?.remaining_seconds}
                        title={'تا باز شدن درخواست تحویل'}
                        onTimeExpired={() => dispatch(fetchTradingAllowed())}
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={NewStyles.container}>
            <BackHeader
                title={config.title}
                rightIcon
                iconName="list"
                rightIconPress={() => navigation.navigate(config.historyRoute)}
            />

            <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.contentContainerStyle}
                    refreshControl={(
                        <RefreshControl
                            colors={[themeColor1.bgColor(1)]}
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    )}
                >
                    <View style={styles.summaryCard}>
                        {user ? (
                            <WalletPieceBalance wallet={user?.wallet} metal={metal} label={`دارایی ${config.label}`} />
                        ) : (
                            <InlineLoadingItem icon="wallet-outline" label={`در حال دریافت دارایی ${config.label}`} />
                        )}
                        <View style={styles.summaryDivider} />
                        {deliveryData ? (
                            <TradeLimitNotice
                                limits={deliveryLimits}
                                operationLabel={`تحویل فیزیکی ${config.label}`}
                            />
                        ) : (
                            <InlineLoadingItem icon="options-outline" label="در حال دریافت محدودیت تحویل" />
                        )}
                    </View>

                    {!!deliveryData?.block_reason && (
                        <View style={styles.errorCard}>
                            <Ionicons name="alert-circle-outline" size={20} color={themeColor6.bgColor(1)} />
                            <Text style={[NewStyles.text6, { flex: 1 }]}>{deliveryData.block_reason}</Text>
                        </View>
                    )}

                    <View style={styles.section}>
                        <SectionHeader
                            step="۱"
                            title="انتخاب قطعه"
                            subtitle="قطعه‌ای را انتخاب کنید که می‌خواهید تحویل بگیرید"
                        />
                        {initialDataLoading ? (
                            <View style={styles.piecesList}>
                                {[0, 1, 2].map((item) => <PieceLoadingCard key={item} index={item} />)}
                            </View>
                        ) : !deliveryData?.pieces?.length ? (
                            <View style={styles.emptyCard}>
                                <Ionicons name="cube-outline" size={22} color={themeColor3.bgColor(0.62)} />
                                <Text style={[NewStyles.text3, { flex: 1 }]}>با موجودی و محدودیت فعلی، قطعه‌ای برای تحویل قابل انتخاب نیست.</Text>
                            </View>
                        ) : (
                            <View style={styles.piecesList}>
                                {deliveryData.pieces.map((piece) => {
                                    const selected = Number(piece.id) === Number(selectedPieceId);
                                    return (
                                        <TouchableOpacity
                                            key={piece.id}
                                            activeOpacity={0.88}
                                            onPress={() => selectPiece(piece)}
                                            style={[styles.pieceCard, selected && styles.pieceCardSelected]}
                                        >
                                            <View style={styles.pieceCardContent}>
                                                <View style={styles.pieceVisual}>
                                                    {piece.image ? (
                                                        <Image
                                                            source={{ uri: piece.image }}
                                                            style={styles.pieceImage}
                                                            resizeMode="contain"
                                                        />
                                                    ) : (
                                                        <View style={[styles.pieceImage, NewStyles.center]}>
                                                            <Ionicons name="cube-outline" size={30} color={themeColor3.bgColor(0.74)} />
                                                        </View>
                                                    )}
                                                </View>

                                                <View style={styles.pieceInfo}>
                                                    <Text style={styles.pieceTitle} numberOfLines={2}>{piece.title}</Text>
                                                    <Text style={styles.pieceWeight}>
                                                        {formatGramLimit(Number(piece.weight_mg || 0) / 1000)} گرم
                                                    </Text>
                                                    <Text style={styles.pieceMetaText} numberOfLines={1}>
                                                        تعداد مجاز {piece.min_quantity} تا {piece.max_quantity} عدد
                                                    </Text>
                                                    <Text style={styles.pieceMetaText} numberOfLines={1}>
                                                        کارمزد {piece.fee_percent}%{metal === 'gold' ? `  •  عیار ${piece.karat_ppt}‰` : ''}
                                                    </Text>
                                                </View>
                                            </View>

                                            <View style={styles.pieceSelectedIndicator}>
                                                <SelectedComponent selected={selected} />
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}
                    </View>

                    {!!selectedPiece && (
                        <View style={styles.section}>
                            <SectionHeader
                                step="۲"
                                title="تعداد قطعه"
                                subtitle="فقط تعداد صحیح و در بازه مجاز قابل ثبت است"
                            />
                            <View style={styles.softSurface}>
                            <View style={styles.quantityRow}>
                                <TouchableOpacity
                                    style={styles.quantityButton}
                                    onPress={() => changeQuantityBy(-1)}
                                    disabled={quantity <= Number(selectedPiece.min_quantity)}
                                >
                                    <Ionicons name="remove" size={22} color={themeColor1.bgColor(1)} />
                                </TouchableOpacity>
                                <TextInput
                                    value={quantityText}
                                    onChangeText={handleQuantityInput}
                                    onBlur={normalizeQuantityOnBlur}
                                    keyboardType="number-pad"
                                    style={[NewStyles.textInput, NewStyles.title1, styles.quantityInput]}
                                    textAlign="center"
                                    maxLength={7}
                                />
                                <TouchableOpacity
                                    style={styles.quantityButton}
                                    onPress={() => changeQuantityBy(1)}
                                    disabled={quantity >= Number(selectedPiece.max_quantity)}
                                >
                                    <Ionicons name="add" size={22} color={themeColor1.bgColor(1)} />
                                </TouchableOpacity>
                            </View>
                            <Text style={NewStyles.text3}>حداقل {selectedPiece.min_quantity} • حداکثر {selectedPiece.max_quantity} عدد</Text>

                            {!!quoteError && <Text style={NewStyles.text6}>{quoteError}</Text>}
                            {(quoteLoading || quote) && (
                                <View style={styles.quoteCard}>
                                    <View style={styles.metricRow}>
                                        <Text style={styles.metricLabel}>وزن اسمی قطعات</Text>
                                        <MetricValue loading={quoteLoading}>{quote ? `${formatGramLimit(quote.piece_weight_gram)} گرم` : ''}</MetricValue>
                                    </View>
                                    <View style={styles.metricDivider} />
                                    <View style={styles.metricRow}>
                                        <Text style={styles.metricLabel}>کسر از کیف پول</Text>
                                        <MetricValue loading={quoteLoading}>{quote ? `${formatGramLimit(quote.required_wallet_gram)} گرم` : ''}</MetricValue>
                                    </View>
                                    <View style={styles.metricDivider} />
                                    <View style={styles.metricRow}>
                                        <Text style={styles.metricLabel}>باقی‌مانده پس از کسر</Text>
                                        <MetricValue loading={quoteLoading} success>{quote ? `${formatGramLimit(quote.remaining_wallet_gram)} گرم` : ''}</MetricValue>
                                    </View>
                                    <View style={styles.metricDivider} />
                                    <View style={styles.metricRow}>
                                        <Text style={styles.metricLabel}>ارزش قطعه انتخابی</Text>
                                        <MetricValue loading={quoteLoading}>{quote ? `${formatPrice(quote.piece_final_price)} تومان` : ''}</MetricValue>
                                    </View>
                                </View>
                            )}
                                <Text style={styles.helperText}>مبنای محدودیت و کسر کیف پول، مقدار «کسر از کیف پول» است. خرده‌ی باقی‌مانده در کیف پول شما حفظ می‌شود.</Text>
                            </View>
                        </View>
                    )}

                    <View style={styles.section}>
                        <SectionHeader
                            step="۳"
                            title="مشخصات تحویل‌گیرنده"
                            subtitle="اطلاعات را بررسی کنید؛ در صورت نیاز قابل ویرایش است"
                        />
                        <View style={styles.softSurface}>
                            {!user && initialDataLoading ? (
                                <View style={{ gap: 8 }}>
                                    <InlineLoadingItem icon="person-outline" label="نام تحویل‌گیرنده" />
                                    <InlineLoadingItem icon="call-outline" label="شماره تماس" />
                                    <InlineLoadingItem icon="card-outline" label="کد ملی" />
                                </View>
                            ) : (
                                <>
                                    <Text style={styles.fieldLabel}>نام تحویل‌گیرنده</Text>
                                    <TextInput
                                        style={[NewStyles.textInput, NewStyles.text10, styles.cleanInput]}
                                        value={receiverName}
                                        onChangeText={setReceiverName}
                                        placeholder="نام تحویل‌گیرنده"
                                        placeholderTextColor={themeColor10.bgColor(0.38)}
                                    />
                                    <Text style={styles.fieldLabel}>شماره تماس</Text>
                                    <TextInput
                                        style={[NewStyles.textInput, NewStyles.text10, styles.cleanInput]}
                                        value={receiverPhone}
                                        onChangeText={setReceiverPhone}
                                        keyboardType="phone-pad"
                                        placeholder="شماره تماس"
                                        placeholderTextColor={themeColor10.bgColor(0.38)}
                                    />
                                    <Text style={styles.fieldLabel}>کد ملی</Text>
                                    <TextInput
                                        style={[NewStyles.textInput, NewStyles.text10, styles.cleanInput]}
                                        value={receiverNationalCode}
                                        onChangeText={(text) => setReceiverNationalCode(normalizeNaturalInput(text).slice(0, 10))}
                                        keyboardType="number-pad"
                                        maxLength={10}
                                        placeholder="کد ملی"
                                        placeholderTextColor={themeColor10.bgColor(0.38)}
                                    />
                                </>
                            )}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <SectionHeader
                            step="۴"
                            title="روش و زمان تحویل"
                            subtitle="روش دریافت را انتخاب کنید و جزئیات را کامل کنید"
                        />
                        {initialDataLoading ? (
                            <View style={styles.methodLoadingRow}>
                                <InlineLoadingItem icon="storefront-outline" label="تحویل حضوری" />
                                <InlineLoadingItem icon="cube-outline" label="ارسال به آدرس" />
                            </View>
                        ) : (
                            <View style={styles.segmentedControl}>
                                <TouchableOpacity
                                    disabled={!deliveryData?.pickup_available}
                                    style={[
                                        styles.segmentButton,
                                        way === 'pickup' && styles.segmentButtonSelected,
                                        !deliveryData?.pickup_available && styles.disabledCard,
                                    ]}
                                    onPress={() => { setWay('pickup'); setShippingQuote(null); }}
                                >
                                    <Ionicons
                                        name="storefront-outline"
                                        size={19}
                                        color={way === 'pickup' ? themeColor1.bgColor(1) : themeColor3.bgColor(0.9)}
                                    />
                                    <Text style={[styles.segmentText, way === 'pickup' && styles.segmentTextSelected]}>تحویل حضوری</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    disabled={!deliveryData?.shipping_available}
                                    style={[
                                        styles.segmentButton,
                                        way === 'shipping' && styles.segmentButtonSelected,
                                        !deliveryData?.shipping_available && styles.disabledCard,
                                    ]}
                                    onPress={() => setWay('shipping')}
                                >
                                    <Ionicons
                                        name="cube-outline"
                                        size={19}
                                        color={way === 'shipping' ? themeColor1.bgColor(1) : themeColor3.bgColor(0.9)}
                                    />
                                    <Text style={[styles.segmentText, way === 'shipping' && styles.segmentTextSelected]}>ارسال به آدرس</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {!initialDataLoading && way === 'pickup' && (
                            <View style={{ gap: 12, marginTop: 6 }}>
                                {!deliveryData?.pickup_available && (
                                    <Text style={NewStyles.text6}>در حال حاضر محل/زمان معتبر برای تحویل حضوری وجود ندارد.</Text>
                                )}
                                {!!deliveryData?.pickup_available && (
                                    <>
                                        <Text style={NewStyles.title10}>فروشگاه تحویل</Text>
                                        {stores.map((item) => (
                                            <TouchableOpacity
                                                key={item?.id}
                                                style={[styles.storeCard, Number(pickupStore) === Number(item?.id) && styles.storeCardSelected]}
                                                onPress={() => setPickupStore(item?.id)}
                                            >
                                                <SelectedComponent selected={Number(pickupStore) === Number(item?.id)} />
                                                <View style={{ flex: 1, paddingHorizontal: 10 }}>
                                                    <Text style={NewStyles.title10}>{item?.shop_name}</Text>
                                                    {!!item?.address && (
                                                        <View style={[NewStyles.row, { gap: 5, marginTop: 5 }]}>
                                                            <Ionicons name="location" size={17} color={themeColor0.bgColor(1)} />
                                                            <Text style={[NewStyles.text10, { flex: 1 }]}>{item.address}</Text>
                                                        </View>
                                                    )}
                                                    {!!item?.phone_number && <Text style={NewStyles.text3}>{item.phone_number}</Text>}
                                                </View>
                                            </TouchableOpacity>
                                        ))}

                                        <View style={styles.divider} />
                                        <Text style={NewStyles.title10}>زمان تحویل</Text>
                                        {pickupScheduleRestricted ? (
                                            <>
                                                {!pickupSlots.length ? (
                                                    <Text style={NewStyles.text6}>ادمین محدودیت زمانی فعال کرده، اما در حال حاضر بازه آینده‌ای موجود نیست.</Text>
                                                ) : (
                                                    <View style={{ gap: 8 }}>
                                                        {pickupSlots.map((slot) => {
                                                            const selected = Number(pickupTimeSlot) === Number(slot.id);
                                                            return (
                                                                <TouchableOpacity
                                                                    key={slot.id}
                                                                    style={[styles.slotCard, selected && styles.slotCardSelected]}
                                                                    onPress={() => setPickupTimeSlot(slot.id)}
                                                                >
                                                                    <SelectedComponent selected={selected} />
                                                                    <View style={{ flex: 1 }}>
                                                                        {!!slot.title && <Text style={NewStyles.title10}>{slot.title}</Text>}
                                                                        <Text style={NewStyles.text3}>از {formatDate(slot.start_at)} تا {formatDate(slot.end_at)}</Text>
                                                                    </View>
                                                                </TouchableOpacity>
                                                            );
                                                        })}
                                                    </View>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <Text style={styles.helperText}>تاریخ و ساعت تحویل را انتخاب کنید؛ ساعت نیازی به تایپ دستی ندارد.</Text>
                                                <View style={styles.dateTimeRow}>
                                                    <TouchableOpacity
                                                        activeOpacity={0.82}
                                                        style={styles.selectionField}
                                                        onPress={() => setDatePickerModal(true)}
                                                    >
                                                        <View style={styles.selectionFieldIcon}>
                                                            <Ionicons name="calendar-outline" size={19} color={themeColor1.bgColor(0.9)} />
                                                        </View>
                                                        <View style={{ flex: 1 }}>
                                                            <Text style={styles.selectionFieldLabel}>تاریخ</Text>
                                                            <Text style={styles.selectionFieldValue}>{pickupDate || 'انتخاب تاریخ'}</Text>
                                                        </View>
                                                        <Ionicons name="chevron-back" size={17} color={themeColor3.bgColor(0.7)} />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        activeOpacity={0.82}
                                                        style={styles.selectionField}
                                                        onPress={() => setTimePickerModal(true)}
                                                    >
                                                        <View style={styles.selectionFieldIcon}>
                                                            <Ionicons name="time-outline" size={19} color={themeColor1.bgColor(0.9)} />
                                                        </View>
                                                        <View style={{ flex: 1 }}>
                                                            <Text style={styles.selectionFieldLabel}>ساعت</Text>
                                                            <Text style={styles.selectionFieldValue}>
                                                                {pickupHour !== '' && pickupMinute !== ''
                                                                    ? `${String(pickupHour).padStart(2, '0')}:${String(pickupMinute).padStart(2, '0')}`
                                                                    : 'انتخاب ساعت'}
                                                            </Text>
                                                        </View>
                                                        <Ionicons name="chevron-back" size={17} color={themeColor3.bgColor(0.7)} />
                                                    </TouchableOpacity>
                                                </View>
                                                {!!pickupRequestedAt && (
                                                    <View style={styles.selectedTimeNote}>
                                                        <Ionicons name="checkmark-circle-outline" size={18} color={themeColor7.bgColor(1)} />
                                                        <Text style={[NewStyles.text7, { flex: 1 }]}>زمان انتخابی: {pickupRequestedAt}</Text>
                                                    </View>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}
                            </View>
                        )}

                        {!initialDataLoading && way === 'shipping' && (
                            <View style={{ gap: 12, marginTop: 6 }}>
                                {!deliveryData?.shipping_available ? (
                                    <Text style={NewStyles.text6}>در حال حاضر روش ارسالی برای تحویل فیزیکی تعریف نشده است.</Text>
                                ) : (
                                    <>
                                        <Text style={NewStyles.title10}>روش ارسال</Text>
                                        <View style={{ gap: 8 }}>
                                            {shippingPosts.map((post) => {
                                                const selected = Number(shippingPostId) === Number(post.id);
                                                return (
                                                    <TouchableOpacity
                                                        key={post.id}
                                                        style={[styles.shippingPostCard, selected && styles.shippingPostCardSelected]}
                                                        onPress={() => { if (Number(shippingPostId) !== Number(post.id)) { setShippingPostId(post.id); setShippingQuote(null); } }}
                                                    >
                                                        <SelectedComponent selected={selected} />
                                                        <View style={{ flex: 1 }}>
                                                            <Text style={NewStyles.title10}>{post.name}</Text>
                                                            <Text style={NewStyles.text3}>هزینه پایه: {formatPrice(post.base_cost)} تومان</Text>
                                                            <Text style={NewStyles.text3}>بیمه به ازای هر ۱,۰۰۰,۰۰۰ تومان: {formatPrice(post.insurance_per_million_toman)} تومان</Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>

                                        {!!selectedShippingPost && (
                                            <View style={styles.shippingCostCard}>
                                                <View style={styles.metricRow}>
                                                    <Text style={styles.metricLabel}>ارزش مرسوله</Text>
                                                    <MetricValue loading={quoteLoading && !shippingQuote}>
                                                        {`${formatPrice(shippingQuote?.piece_value_toman ?? quote?.piece_final_price ?? 0)} تومان`}
                                                    </MetricValue>
                                                </View>
                                                <View style={styles.metricDivider} />
                                                <View style={styles.metricRow}>
                                                    <Text style={styles.metricLabel}>هزینه پایه ارسال</Text>
                                                    <MetricValue loading={quoteLoading && !shippingQuote}>
                                                        {`${formatPrice(shippingQuote?.base_cost ?? selectedShippingPost.base_cost ?? 0)} تومان`}
                                                    </MetricValue>
                                                </View>
                                                <View style={styles.metricDivider} />
                                                <View style={styles.metricRow}>
                                                    <Text style={styles.metricLabel}>هزینه بیمه</Text>
                                                    <MetricValue loading={!shippingQuote}>
                                                        {shippingQuote ? `${formatPrice(shippingQuote.insurance_cost)} تومان` : ''}
                                                    </MetricValue>
                                                </View>
                                                <View style={styles.metricDivider} />
                                                <View style={styles.metricRow}>
                                                    <Text style={styles.metricTotalLabel}>جمع ارسال و بیمه</Text>
                                                    <MetricValue loading={!shippingQuote} success>
                                                        {shippingQuote ? `${formatPrice(shippingQuote.total_cost)} تومان` : ''}
                                                    </MetricValue>
                                                </View>
                                                <Text style={styles.helperText}>بیمه بر اساس ارزش واقعی قطعات و نرخ روش ارسال، توسط سرور محاسبه می‌شود.</Text>
                                            </View>
                                        )}

                                        <Text style={NewStyles.text10}>آدرس کامل ارسال</Text>
                                        <TextInput
                                            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, { height: 80 }]}
                                            placeholderTextColor={themeColor10.bgColor(0.45)}
                                            placeholder="استان، شهر، خیابان، پلاک و واحد"
                                            multiline
                                            textAlignVertical="top"
                                            value={shippingAddress}
                                            onChangeText={setShippingAddress}
                                        />
                                        <Text style={NewStyles.text10}>کدپستی</Text>
                                        <TextInput
                                            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
                                            placeholderTextColor={themeColor10.bgColor(0.45)}
                                            placeholder="کدپستی"
                                            maxLength={10}
                                            keyboardType="number-pad"
                                            value={postCode}
                                            onChangeText={(text) => setPostCode(normalizeNaturalInput(text).slice(0, 10))}
                                        />
                                        <View style={styles.infoCard}>
                                            <Ionicons name="information-circle-outline" size={20} color={themeColor1.bgColor(1)} />
                                            <Text style={[NewStyles.text3, { flex: 1 }]}>اگر هزینه ارسال وجود داشته باشد، پرداخت آن بعد از تأیید درخواست فعال می‌شود و از بخش تاریخچه می‌توانید فیش هزینه ارسال را ثبت کنید.</Text>
                                        </View>
                                    </>
                                )}
                            </View>
                        )}
                    </View>

                    {initialDataLoading ? (
                        <InlineLoadingItem icon="shield-checkmark-outline" label="در حال بررسی وضعیت تأیید درخواست" />
                    ) : (
                        <View style={[styles.approvalCard, deliveryData?.auto_approve ? styles.autoApproval : styles.manualApproval]}>
                            <Ionicons
                                name={deliveryData?.auto_approve ? 'checkmark-circle-outline' : 'time-outline'}
                                size={20}
                                color={deliveryData?.auto_approve ? themeColor7.bgColor(1) : themeColor0.bgColor(1)}
                            />
                            <Text style={[NewStyles.text10, { flex: 1 }]}>
                                {deliveryData?.auto_approve
                                    ? 'این نوع تحویل در تنظیمات روی تأیید خودکار است.'
                                    : 'این درخواست نیازمند تأیید مدیر است و تا قبل از تأیید، موجودی کیف پول کسر نمی‌شود.'}
                            </Text>
                        </View>
                    )}

                    <Button
                        title="ثبت درخواست تحویل فیزیکی"
                        loading={submitting}
                        disabled={
                            !deliveryData?.can_submit
                            || !selectedPiece
                            || !quantityIsValid
                            || !quote
                            || quoteLoading
                            || (way === 'pickup' && !pickupSelectionValid)
                            || (way === 'shipping' && !shippingSelectionValid)
                        }
                        onPress={submit}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
            <DatePickerModal
                datePickerModal={datePickerModal}
                setDatePickerModal={setDatePickerModal}
                birthDate={pickupDate || todayJalali}
                setBirthDate={setPickupDate}
                isCurrentDate={pickupDate || todayJalali}
                minimumDate={todayJalali}
                maximumDate={maxPickupDate}
            />
            <TimeWheelPickerModal
                visible={timePickerModal}
                hour={pickupHour}
                minute={pickupMinute}
                onClose={() => setTimePickerModal(false)}
                onConfirm={(hour, minute) => {
                    setPickupHour(String(hour));
                    setPickupMinute(String(minute));
                    setTimePickerModal(false);
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    contentContainerStyle: {
        paddingHorizontal: '5%',
        paddingTop: 6,
        paddingBottom: '10%',
        gap: 20,
    },
    summaryCard: {
        padding: 14,
        gap: 10,
        backgroundColor: themeColor12.bgColor(0.72),
        borderRadius: 16,
    },
    summaryDivider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: themeColor3.bgColor(0.18),
    },
    divider: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: themeColor3.bgColor(0.18),
    },
    section: {
        gap: 10,
    },
    sectionHeader: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 10,
    },
    stepBadge: {
        width: 30,
        height: 30,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: themeColor1.bgColor(0.07),
    },
    stepBadgeText: {
        fontFamily: 'VazirBold',
        fontSize: 13,
        color: themeColor1.bgColor(0.9),
        textAlign: 'center',
    },
    sectionTitle: {
        fontFamily: 'VazirBold',
        fontSize: 15,
        color: themeColor1.bgColor(1),
        textAlign: 'right',
    },
    sectionSubtitle: {
        fontFamily: 'VazirLight',
        fontSize: 12,
        color: themeColor3.bgColor(0.95),
        textAlign: 'right',
        marginTop: 2,
    },
    softSurface: {
        backgroundColor: themeColor4.bgColor(0.76),
        borderRadius: 16,
        padding: 13,
        gap: 9,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: themeColor3.bgColor(0.16),
    },
    helperText: {
        fontFamily: 'VazirLight',
        color: themeColor3.bgColor(1),
        textAlign: 'right',
        fontSize: 12,
        lineHeight: 20,
    },
    fieldLabel: {
        fontFamily: 'VazirLight',
        color: themeColor3.bgColor(1),
        textAlign: 'right',
        fontSize: 12,
        marginBottom: -3,
        marginTop: 2,
    },
    cleanInput: {
        marginVertical: 0,
        minHeight: 46,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: themeColor3.bgColor(0.22),
        borderRadius: 12,
        backgroundColor: themeColor5.bgColor(0.75),
    },
    errorCard: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 9,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: themeColor6.bgColor(0.055),
    },
    emptyCard: {
        minHeight: 62,
        paddingHorizontal: 14,
        borderRadius: 14,
        backgroundColor: themeColor4.bgColor(0.72),
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 10,
    },
    piecesList: {
        gap: 9,
        paddingVertical: 2,
    },
    pieceCard: {
        width: '100%',
        minHeight: 122,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: themeColor3.bgColor(0.18),
        backgroundColor: themeColor4.bgColor(0.9),
        borderRadius: 17,
        padding: 12,
        position: 'relative',
    },
    pieceCardSelected: {
        borderColor: themeColor0.bgColor(0.72),
        backgroundColor: themeColor0.bgColor(0.055),
    },
    pieceCardContent: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 14,
    },
    pieceVisual: {
        width: 96,
        height: 96,
        borderRadius: 15,
        backgroundColor: themeColor5.bgColor(1),
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
    },
    pieceImage: {
        width: 88,
        height: 88,
        borderRadius: 12,
        backgroundColor: themeColor5.bgColor(1),
    },
    pieceInfo: {
        flex: 1,
        minHeight: 92,
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingLeft: 30,
    },
    pieceTitle: {
        fontFamily: 'VazirBold',
        fontSize: 14,
        lineHeight: 22,
        color: themeColor1.bgColor(1),
        textAlign: 'right',
        width: '100%',
    },
    pieceWeight: {
        fontFamily: 'VazirBold',
        fontSize: 17,
        lineHeight: 25,
        color: themeColor0.bgColor(1),
        textAlign: 'right',
        width: '100%',
        marginTop: 3,
        marginBottom: 4,
    },
    pieceMetaText: {
        fontFamily: 'VazirLight',
        fontSize: 11.5,
        lineHeight: 19,
        color: themeColor3.bgColor(0.96),
        textAlign: 'right',
        width: '100%',
    },
    pieceSelectedIndicator: {
        position: 'absolute',
        left: 12,
        top: 12,
    },
    pieceLoadingCard: {
        width: '100%',
        minHeight: 122,
        padding: 12,
        borderRadius: 17,
        backgroundColor: themeColor4.bgColor(0.78),
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 14,
    },
    pieceLoadingImage: {
        width: 96,
        height: 96,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: themeColor12.bgColor(0.8),
    },
    inlineLoadingItem: {
        minHeight: 48,
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 9,
        paddingHorizontal: 10,
        borderRadius: 12,
        backgroundColor: themeColor4.bgColor(0.62),
    },
    inlineLoadingIcon: {
        width: 28,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
    },
    inlineLoadingLabel: {
        fontFamily: 'VazirLight',
        color: themeColor3.bgColor(1),
        textAlign: 'right',
        fontSize: 11,
        marginBottom: 5,
    },
    loadingLine: {
        height: 7,
        width: '72%',
        borderRadius: 10,
        backgroundColor: themeColor3.bgColor(0.18),
    },
    loadingLineMuted: {
        backgroundColor: themeColor3.bgColor(0.11),
    },
    quantityRow: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginTop: 2,
    },
    quantityButton: {
        width: 42,
        height: 42,
        borderRadius: 13,
        backgroundColor: themeColor1.bgColor(0.055),
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityInput: {
        width: 92,
        minHeight: 42,
        marginVertical: 0,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: themeColor3.bgColor(0.2),
        borderRadius: 13,
        backgroundColor: themeColor5.bgColor(0.8),
    },
    quoteCard: {
        marginTop: 2,
        borderRadius: 14,
        paddingHorizontal: 11,
        paddingVertical: 4,
        backgroundColor: themeColor12.bgColor(0.5),
    },
    metricRow: {
        minHeight: 44,
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    metricDivider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: themeColor3.bgColor(0.16),
    },
    metricLabel: {
        fontFamily: 'VazirLight',
        color: themeColor10.bgColor(1),
        textAlign: 'right',
        fontSize: 12,
    },
    metricTotalLabel: {
        fontFamily: 'VazirBold',
        color: themeColor10.bgColor(1),
        textAlign: 'right',
        fontSize: 13,
    },
    metricValueWrap: {
        minWidth: 86,
        minHeight: 24,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    methodLoadingRow: {
        gap: 8,
    },
    segmentedControl: {
        flexDirection: 'row-reverse',
        gap: 4,
        padding: 4,
        borderRadius: 15,
        backgroundColor: themeColor1.bgColor(0.055),
    },
    segmentButton: {
        flex: 1,
        minHeight: 48,
        borderRadius: 12,
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingHorizontal: 8,
    },
    segmentButtonSelected: {
        backgroundColor: themeColor4.bgColor(0.98),
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: themeColor0.bgColor(0.3),
    },
    segmentText: {
        fontFamily: 'VazirLight',
        fontSize: 13,
        color: themeColor3.bgColor(0.95),
        textAlign: 'center',
    },
    segmentTextSelected: {
        fontFamily: 'VazirBold',
        color: themeColor1.bgColor(1),
    },
    disabledCard: {
        opacity: 0.38,
    },
    storeCard: {
        backgroundColor: themeColor4.bgColor(0.7),
        padding: 11,
        borderRadius: 14,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: themeColor3.bgColor(0.2),
        flexDirection: 'row-reverse',
        alignItems: 'flex-start',
    },
    storeCardSelected: {
        borderColor: themeColor0.bgColor(0.62),
        backgroundColor: themeColor0.bgColor(0.055),
    },
    slotCard: {
        padding: 11,
        borderRadius: 14,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: themeColor3.bgColor(0.2),
        backgroundColor: themeColor4.bgColor(0.72),
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 9,
    },
    slotCardSelected: {
        borderColor: themeColor0.bgColor(0.62),
        backgroundColor: themeColor0.bgColor(0.055),
    },
    dateTimeRow: {
        gap: 8,
    },
    selectionField: {
        minHeight: 58,
        paddingHorizontal: 10,
        borderRadius: 14,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: themeColor3.bgColor(0.2),
        backgroundColor: themeColor4.bgColor(0.76),
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 9,
    },
    selectionFieldIcon: {
        width: 34,
        height: 34,
        borderRadius: 11,
        backgroundColor: themeColor1.bgColor(0.055),
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectionFieldLabel: {
        fontFamily: 'VazirLight',
        color: themeColor3.bgColor(1),
        textAlign: 'right',
        fontSize: 11,
    },
    selectionFieldValue: {
        fontFamily: 'VazirBold',
        color: themeColor1.bgColor(1),
        textAlign: 'right',
        fontSize: 13,
        marginTop: 1,
    },
    selectedTimeNote: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 7,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 11,
        backgroundColor: themeColor7.bgColor(0.055),
    },
    shippingPostCard: {
        padding: 11,
        borderRadius: 14,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: themeColor3.bgColor(0.2),
        backgroundColor: themeColor4.bgColor(0.72),
        flexDirection: 'row-reverse',
        alignItems: 'flex-start',
        gap: 9,
    },
    shippingPostCardSelected: {
        borderColor: themeColor0.bgColor(0.62),
        backgroundColor: themeColor0.bgColor(0.055),
    },
    shippingCostCard: {
        borderRadius: 14,
        paddingHorizontal: 11,
        paddingVertical: 5,
        backgroundColor: themeColor12.bgColor(0.52),
    },
    infoCard: {
        flexDirection: 'row-reverse',
        alignItems: 'flex-start',
        gap: 8,
        paddingHorizontal: 10,
        paddingVertical: 9,
        borderRadius: 12,
        backgroundColor: themeColor1.bgColor(0.035),
    },
    approvalCard: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 8,
        borderRadius: 13,
        paddingHorizontal: 11,
        paddingVertical: 10,
    },
    autoApproval: {
        backgroundColor: themeColor7.bgColor(0.05),
    },
    manualApproval: {
        backgroundColor: themeColor0.bgColor(0.055),
    },
});
