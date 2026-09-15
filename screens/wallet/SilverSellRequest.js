import { KeyboardAvoidingView, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useCallback, useEffect, useState, useRef } from 'react'
import Ionicons from '@expo/vector-icons/Ionicons';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';

import WalletPieceBalance from '../../components/WalletPieceBalance';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor10, themeColor12, themeColor3, themeColor4, themeColor5 } from '../../theme/Color';
import Button from '../../components/Button';
import TradeLimitNotice from '../../components/TradeLimitNotice';
import { formatPrice, handleError, showToastOrAlert } from '../../helpers/Common';
import { uri } from '../../services/URL';
import { fetchUser } from '../../slices/userSlice';
import { fetchRate } from '../../slices/rateSlice';
import { useTranslation } from 'react-i18next';
import { fetchSilverInfoPrice } from '../../slices/silverInfoSlice';
import Loader from './../../components/Loader';
import { useFocusEffect } from '@react-navigation/native';
import { fetchTradingAllowed } from '../../slices/tradingAllowed';
import VoteTimerDisplay from '../../components/VoteTimerDisplay';
import { getTradableBalance, getTradeLimits, getTradeWeightError, TRADE_CALCULATION_DEBOUNCE_MS } from '../../helpers/tradeLimits';

export default function SilverSellRequest({ navigation }) {

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const accessToken = useSelector((state) => state?.token?.accessToken);
    const silverInfo = useSelector(state => state.silverInfo?.data);
    const silverInfoLoading = useSelector(state => state.silverInfo?.loading);
    const trading = useSelector((state) => state?.trading)
    const tradingData = trading?.data
    const silverPrice = silverInfo?.silver_price_per_gram;
    const tradeLimits = getTradeLimits(tradingData, 'sell', 'silver', silverInfo);
    const editingField = useRef(null);
    const calculationRequestRef = useRef(0);
    
    useFocusEffect(
        useCallback(() => {
            if (accessToken) {
                dispatch(fetchUser(accessToken));
            }
            dispatch(fetchSilverInfoPrice({ params: null }));
            dispatch(fetchTradingAllowed());
        }, [accessToken, dispatch]),
    );

    const user = useSelector((state) => state.user?.data);
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false);

    const [weight, setWeight] = useState("")
    const [price, setPrice] = useState("")
    const [priceWord, setPriceWord] = useState("")

    const weightTimeoutRef = useRef(null);
    const priceTimeoutRef = useRef(null);

    const formatNumber = (num) => {
        if (!num && num !== 0) return "";
        return num.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const parseMoney = (str) => {
        if (!str) return 0;
        return Number(
            String(str)
                .replace(/,/g, "")
                .replace("٫", ".")
        );
    };

    const sanitizeMoneyInput = (text) => {
        const normalized = String(text ?? "")
            .replace(/,/g, "")
            .replace(/٫/g, ".")
            .replace(/[^0-9.]/g, "");

        const dotIndex = normalized.indexOf(".");
        const hasDecimalPoint = dotIndex !== -1;

        const integerRaw = (hasDecimalPoint ? normalized.slice(0, dotIndex) : normalized)
            .replace(/\./g, "");
        const integerPart = integerRaw || "0";

        if (!hasDecimalPoint) {
            return formatNumber(integerPart);
        }

        const decimalPart = normalized
            .slice(dotIndex + 1)
            .replace(/\./g, "")
            .slice(0, 3);

        return `${formatNumber(integerPart)}.${decimalPart}`;
    };

    const parseWeight = (str) => {
        if (!str) return 0;
        return Number(String(str).replace(",", "."));
    };

    const sanitizeWeightInput = (text) => {
        const normalized = String(text ?? "")
            .replace(/,/g, ".")
            .replace(/[^0-9.]/g, "");

        const dotIndex = normalized.indexOf(".");
        if (dotIndex === -1) {
            return normalized;
        }

        const integerPart = normalized.slice(0, dotIndex).replace(/\./g, "") || "0";
        const decimalPart = normalized
            .slice(dotIndex + 1)
            .replace(/\./g, "")
            .slice(0, 3);

        return `${integerPart}.${decimalPart}`;
    };

    const tradeWeightError = weight
        ? getTradeWeightError(parseWeight(weight), tradeLimits, 'فروش نقره')
        : "";

    const calculatePriceFromWeight = async (numericWeight) => {
        if (!numericWeight || !silverPrice) return { price: "", priceWords: "" };

        const payload = {
            mode: 'price',
            weight: numericWeight,
            way: 'sell'
        };

        try {
            const payloadData = await dispatch(fetchSilverInfoPrice({ params: payload })).unwrap();

            if (!payloadData || payloadData?.error) {
                throw new Error(payloadData?.message || 'invalid response');
            }

            return {
                price: formatNumber(Math.round(Number(payloadData.price))),
                priceWords: payloadData?.price_words || "",
            };
        } catch (error) {
            showToastOrAlert('خطا در محاسبه قیمت نقره')
            return { price: "", priceWords: "" };
        }
    };

    const calculateWeightFromPrice = async (numericPrice) => {
        if (!numericPrice || !silverPrice) {
            return { weight: "", price: "", priceWords: "" };
        }

        const payload = {
            mode: 'weight',
            price: numericPrice,
            way: 'sell'
        };

        try {
            const payloadData = await dispatch(fetchSilverInfoPrice({ params: payload })).unwrap();

            if (!payloadData || payloadData?.error) {
                throw new Error(payloadData?.message || 'invalid response');
            }

            const calculatedWeight = Number(payloadData.weight);
            const calculatedTradeError = getTradeWeightError(
                calculatedWeight,
                tradeLimits,
                'فروش نقره'
            );

            return {
                weight: String(payloadData.weight),
                // مبلغ واقعی وزن سه‌رقمی برگشتی از بک‌اند جای مبلغ اولیه می‌نشیند.
                price: formatNumber(Math.round(Number(payloadData.price))),
                priceWords: payloadData?.price_words || "",
                tradeError: calculatedTradeError,
            };
        } catch (error) {
            showToastOrAlert('خطا در محاسبه قیمت نقره')
            return { weight: "", price: "", priceWords: "" };
        }
    };

    const handleWeightChange = (text) => {
        editingField.current = "weight";
        const requestId = ++calculationRequestRef.current;

        const sanitized = sanitizeWeightInput(text);
        setWeight(sanitized);
        setPriceWord("");

        if (weightTimeoutRef.current) clearTimeout(weightTimeoutRef.current);

        if (!sanitized) {
            setPrice("");
            return;
        }

        const numericWeight = parseWeight(sanitized);
        if (getTradeWeightError(numericWeight, tradeLimits, 'فروش نقره')) {
            setPrice("");
            return;
        }

        weightTimeoutRef.current = setTimeout(async () => {
            if (editingField.current !== "weight" || requestId !== calculationRequestRef.current) return;

            const result = await calculatePriceFromWeight(numericWeight);
            if (requestId !== calculationRequestRef.current) return;

            setPrice(result.price);
            setPriceWord(result.priceWords);
        }, TRADE_CALCULATION_DEBOUNCE_MS);
    };

    const handlePriceChange = (text) => {
        editingField.current = "price";
        const requestId = ++calculationRequestRef.current;

        const formatted = sanitizeMoneyInput(text);
        const numericPrice = parseMoney(formatted);

        setPrice(formatted);
        setPriceWord("");

        if (priceTimeoutRef.current) clearTimeout(priceTimeoutRef.current);

        if (!formatted || !Number.isFinite(numericPrice) || numericPrice <= 0) {
            setWeight("");
            return;
        }

        priceTimeoutRef.current = setTimeout(async () => {
            if (editingField.current !== "price" || requestId !== calculationRequestRef.current) return;

            const result = await calculateWeightFromPrice(numericPrice);
            if (requestId !== calculationRequestRef.current) return;

            setWeight(result.weight);
            setPrice(result.price);
            setPriceWord(result.priceWords);

            if (result.tradeError) {
                showToastOrAlert(result.tradeError);
            }
        }, TRADE_CALCULATION_DEBOUNCE_MS);
    };

    const handlePriceBlur = () => {
        if (priceTimeoutRef.current) {
            clearTimeout(priceTimeoutRef.current);
        }

        editingField.current = null;
        calculationRequestRef.current += 1;
    };

    useEffect(() => {
        return () => {
            if (weightTimeoutRef.current) {
                clearTimeout(weightTimeoutRef.current);
            }
            if (priceTimeoutRef.current) {
                clearTimeout(priceTimeoutRef.current);
            }
        };
    }, []);
    const useAllMetalBalance = async () => {
        const walletBalance = Number(user?.wallet?.silver_balance || 0);

        if (!Number.isFinite(walletBalance) || walletBalance < tradeLimits.min) {
            showToastOrAlert("موجودی نقره شما برای فروش کافی نیست");
            return;
        }

        if (priceTimeoutRef.current) clearTimeout(priceTimeoutRef.current);
        if (weightTimeoutRef.current) clearTimeout(weightTimeoutRef.current);

        // هم موجودی واقعی و هم سقف پویا از بک‌اند رعایت می‌شوند.
        const tradableBalance = getTradableBalance(walletBalance, tradeLimits);
        const tradeError = getTradeWeightError(tradableBalance, tradeLimits, 'فروش نقره');
        if (tradeError) {
            showToastOrAlert(tradeError);
            return;
        }

        editingField.current = "weight";
        const requestId = ++calculationRequestRef.current;

        const weightText = tradableBalance
            .toFixed(3)
            .replace(/\.0+$/, "")
            .replace(/(\.\d*?)0+$/, "$1");

        setWeight(weightText);
        setPriceWord("");

        const result = await calculatePriceFromWeight(tradableBalance);
        if (requestId !== calculationRequestRef.current) return;
        setPrice(result.price);
        setPriceWord(result.priceWords || "");
    };


    const submirRequest = async () => {
        const cleanWeight = parseWeight(weight);

        const tradeError = getTradeWeightError(cleanWeight, tradeLimits, 'فروش نقره');
        if (tradeError) {
            showToastOrAlert(tradeError);
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(
                `${uri}/sell/silver/order/`,
                { weight: cleanWeight },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );

            dispatch(fetchUser(accessToken));
            dispatch(fetchTradingAllowed());
            showToastOrAlert(
                response?.data?.message
                || (response?.data?.requires_admin_approval
                    ? 'درخواست فروش ثبت شد و در انتظار تأیید مدیر است.'
                    : 'فروش نقره با موفقیت انجام شد.')
            );
            setPrice("");
            setWeight("");
            setPriceWord("");
        } catch (error) {
            handleError(error, t)
        } finally {
            setLoading(false);
        }
    };


    return (
        <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'additive' }}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={'padding'}>

                {
                    tradingData?.allowed ? <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainerStyle} refreshControl={<RefreshControl colors={[themeColor1.bgColor(1)]} refreshing={refreshing} onRefresh={() => { dispatch(fetchRate(accessToken)); dispatch(fetchUser(accessToken)); dispatch(fetchSilverInfoPrice({ params: null })); dispatch(fetchTradingAllowed()); }} />}>
                        
                        <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor3.bgColor(0.2) }} />

                        {user && (!user?.is_national_birth_verified || !user?.is_phone_national_verified) && <View style={[{ padding: '5%', gap: 10, backgroundColor: themeColor12.bgColor(1) }, NewStyles.border10, NewStyles.shadow]}>
                            <View style={[NewStyles.row, { gap: 10 }]}>
                                <Ionicons name="alert-circle-outline" size={24} color={themeColor0.bgColor(1)} />
                                <Text style={[NewStyles.text, { flex: 1 }]}>حساب کاربری شما در حال حاضر احراز هویت نشده است، برای شروع خرید و فروش ابتدا بایستی حساب کاربری خود را احراز هویت کنید.</Text>
                            </View>
                            <Button title={'احراز هویت'}
                                onPress={() => {
                                    navigation.navigate('Verify')
                                }}
                            />
                        </View>}

                        <View style={NewStyles.rowWrapper}>
                            <Text style={NewStyles.text10}>نرخ هر گرم نقره</Text>
                            <Text style={NewStyles.text10}>{formatPrice(Number(silverPrice)?.toFixed())} تومان</Text>
                        </View>

                        <TextInput
                            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
                            placeholderTextColor={themeColor10.bgColor(0.5)}
                            keyboardType={'decimal-pad'}
                            placeholder='مقدار بر حسب گرم (تا ۳ رقم اعشار)'
                            value={weight}
                            maxLength={13}
                            onChangeText={handleWeightChange}
                        />
                        <TradeLimitNotice
                            limits={tradeLimits}
                            operationLabel="فروش نقره"
                            error={tradeWeightError}
                        />
                        <TouchableOpacity
                            onPress={useAllMetalBalance}
                            style={{
                                    alignSelf: 'flex-start',
                                    paddingVertical: 5,
                                    paddingHorizontal: 2,
                                }}>
                            <Text style={[NewStyles.text1, { fontSize: 13 }]}>
                                فروش کل موجودی نقره
                            </Text>
                        </TouchableOpacity>

                        <TextInput
                            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
                            placeholderTextColor={themeColor10.bgColor(0.5)}
                            keyboardType={'decimal-pad'}
                            placeholder='مبلغ به تومان (تا ۳ رقم اعشار)'
                            value={price}
                            onChangeText={handlePriceChange}
                            onBlur={handlePriceBlur}
                        />
                        {priceWord?.trim() && (
                            <Text style={[NewStyles.text1, { fontSize: 13 }]}>
                                {priceWord}
                            </Text>
                        )}


                        <Button
                            title={'ثبت درخواست فروش'}
                            loading={loading}
                            disabled={!weight || !price || Boolean(tradeWeightError)}
                            onPress={submirRequest}
                        />

                        <View style={[{ padding: '5%', gap: 10, backgroundColor: themeColor12.bgColor(1) }, NewStyles.border10, NewStyles.shadow]}>
                            <WalletPieceBalance wallet={user?.wallet} metal="silver" label="دارایی نقره‌" />
                            <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor3.bgColor(0.2) }} />
                            <View style={NewStyles.rowWrapper}>
                                <Text style={NewStyles.text10}>کارمزد فروش</Text>
                                <Text style={NewStyles.text10}>{silverInfo?.silver_sell_percent} درصد</Text>
                            </View>
                        </View>

                    </ScrollView>
                        :
                        <View style={[{ flex: 1 }, NewStyles.center]} >
                            <VoteTimerDisplay
                                competitionStartAt={tradingData?.start}
                                durationMinutes={null}
                                nowDate={tradingData?.now}
                                initialRemainingSeconds={tradingData?.remaining_seconds}
                                title={'تا باز شدن فروش'}
                                onTimeExpired={() => {
                                    dispatch(fetchTradingAllowed())
                                }}
                            />
                        </View>
                }
                <View style={{ marginHorizontal: '5%' }}>
                    <Button title={'تاریخچه‌ی درخواست‌ها'} onPress={() => { navigation.navigate('SellSilverRequestHistory') }} />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    contentContainerStyle: {
        paddingHorizontal: '5%',
        paddingBottom: '5%',
        gap: 10,
    },
});