import { KeyboardAvoidingView, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useCallback, useEffect, useState, useRef } from 'react'
import * as Linking from 'expo-linking';
import Ionicons from '@expo/vector-icons/Ionicons';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';

import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor10, themeColor12, themeColor3, themeColor4, themeColor5 } from '../../theme/Color';
import Button from '../../components/Button';
import TradeLimitNotice from '../../components/TradeLimitNotice';
import { formatPrice, handleError, showToastOrAlert } from '../../helpers/Common';
import { uri } from '../../services/URL';
import { fetchUser } from '../../slices/userSlice';
import { fetchRate } from '../../slices/rateSlice';
import { useTranslation } from 'react-i18next';
import Loader from './../../components/Loader';
import { fetchSilverInfoPrice } from '../../slices/silverInfoSlice';
import VoteTimerDisplay from '../../components/VoteTimerDisplay';
import { fetchTradingAllowed } from '../../slices/tradingAllowed';
import { getBuyBalanceLimitError, getMaximumTradeAmount, getTradeLimits, getTradeWeightError, hasReachedBuyBalanceLimit, TRADE_CALCULATION_DEBOUNCE_MS } from '../../helpers/tradeLimits';

export default function ChargeSilverWallet({ navigation }) {

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const accessToken = useSelector((state) => state?.token?.accessToken);
    const silverInfo = useSelector(state => state.silverInfo?.data);
    const silverInfoLoading = useSelector(state => state.silverInfo?.loading);
    const trading = useSelector((state) => state?.trading)
    const tradingData = trading?.data
    const goldPrice = silverInfo?.silver_price_per_gram;
    const tradeLimits = getTradeLimits(tradingData, 'buy', 'silver', silverInfo);
    const editingField = useRef(null);
    const calculationRequestRef = useRef(0);
    useEffect(() => {
        dispatch(fetchSilverInfoPrice({ params: null }))
        dispatch(fetchTradingAllowed())
    }, []);

    const user = useSelector((state) => state.user?.data);
    const currentMetalBalance = Number(user?.wallet?.silver_balance || 0);
    const isBalanceAtBuyLimit = hasReachedBuyBalanceLimit(currentMetalBalance, tradeLimits);
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false);

    const [weight, setWeight] = useState("")
    const [price, setPrice] = useState("")
    const [priceWord, setPriceWord] = useState("")
    const [inputMode, setInputMode] = useState("weight")

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
        const normalized = String(text ?? "").replace(/,/g, ".").replace(/[^0-9.]/g, "");
        const dotIndex = normalized.indexOf(".");

        if (dotIndex === -1) {
            return normalized;
        }

        const integerPart = normalized.slice(0, dotIndex).replace(/\./g, "") || "0";
        const decimalPart = normalized.slice(dotIndex + 1).replace(/\./g, "").slice(0, 3);
        return `${integerPart}.${decimalPart}`;
    };

    const currentWeight = weight ? parseWeight(weight) : null;
    const tradeWeightError = (weight
        ? getTradeWeightError(currentWeight, tradeLimits, 'خرید نقره')
        : "") || getBuyBalanceLimitError(currentWeight, currentMetalBalance, tradeLimits, 'نقره');

    const calculatePriceFromWeight = async (numericWeight) => {
        if (!numericWeight || !goldPrice) return { price: "", priceWords: "" };

        const payload = {
            mode: 'price',
            weight: numericWeight,
            way: 'buy'
        };

        try {
            const response = await dispatch(fetchSilverInfoPrice({ params: payload }));
            const payloadData = response?.payload;

            if (!payloadData || payloadData?.error) {
                throw new Error(payloadData?.message || 'invalid response');
            }

            return {
                price: formatNumber(Math.round(Number(payloadData.price))),
                priceWords: payloadData?.price_words || "",
            };
        } catch (error) {
            showToastOrAlert('خطا در محاسبه قیمت نقره‌');
            return { price: "", priceWords: "" };
        }
    };


    const calculateWeightFromPrice = async (numericPrice) => {
        if (!numericPrice || !goldPrice) return { weight: "", price: "", priceWords: "" };

        const payload = {
            mode: 'weight',
            price: numericPrice,
            way: 'buy'
        };

        try {
            const response = await dispatch(fetchSilverInfoPrice({ params: payload }));
            const payloadData = response?.payload;

            if (!payloadData || payloadData?.error) {
                throw new Error(payloadData?.message || 'invalid response');
            }

            return {
                weight: String(payloadData.weight),
                // مبلغ نمایش‌داده‌شده باید قیمت واقعی وزن سه‌رقمی برگشتی از بک‌اند باشد.
                price: formatNumber(Math.round(Number(payloadData.price))),
                priceWords: payloadData?.price_words || "",
            };
        } catch (error) {
            showToastOrAlert('خطا در محاسبه قیمت نقره‌')
            return { weight: "", price: "", priceWords: "" };
        }
    };

    const handleWeightChange = (text) => {
        editingField.current = "weight";
        setInputMode("weight");
        const requestId = ++calculationRequestRef.current;

        const onlyNumbers = sanitizeWeightInput(text);
        setWeight(onlyNumbers);
        setPriceWord("");

        if (weightTimeoutRef.current) {
            clearTimeout(weightTimeoutRef.current);
        }

        if (!onlyNumbers) {
            setPrice("");
            return;
        }

        const numericWeight = parseWeight(onlyNumbers);
        const localWeightError = getTradeWeightError(numericWeight, tradeLimits, 'خرید نقره')
            || getBuyBalanceLimitError(numericWeight, currentMetalBalance, tradeLimits, 'نقره');
        if (localWeightError) {
            setPrice("");
            return;
        }

        weightTimeoutRef.current = setTimeout(async () => {
            if (editingField.current !== "weight" || requestId !== calculationRequestRef.current) return;

            const result = await calculatePriceFromWeight(numericWeight);
            if (requestId !== calculationRequestRef.current) return;

            setPrice(result.price);
            setPriceWord(result.priceWords || "");
        }, TRADE_CALCULATION_DEBOUNCE_MS);
    };

    const handlePriceChange = (text) => {
        editingField.current = "price";
        setInputMode("price");
        const requestId = ++calculationRequestRef.current;

        const formatted = sanitizeMoneyInput(text);
        const numericPrice = parseMoney(formatted);

        setPrice(formatted);
        setPriceWord("");

        if (priceTimeoutRef.current) {
            clearTimeout(priceTimeoutRef.current);
        }

        if (!formatted || !Number.isFinite(numericPrice) || numericPrice <= 0) {
            setWeight("");
            return;
        }

        if (isBalanceAtBuyLimit) {
            setWeight("");
            return;
        }

        priceTimeoutRef.current = setTimeout(async () => {
            if (editingField.current !== "price" || requestId !== calculationRequestRef.current) return;

            const result = await calculateWeightFromPrice(numericPrice);
            if (requestId !== calculationRequestRef.current) return;

            setWeight(result.weight);
            setPrice(result.price);
            setPriceWord(result.priceWords || "");
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
    const redirectUrl = Linking.createURL("/?");

    const handleDeepLink = useCallback(({ url }) => {
        const { queryParams } = Linking.parse(url);
        if (queryParams?.Status == 'OK' && queryParams?.type == 'purchase') {
            dispatch(fetchUser(accessToken));
            showToastOrAlert('پرداخت موفق');
            setLoading(false);
        } else if (queryParams?.Status == 'NOK' && queryParams?.type == 'purchase') {
            showToastOrAlert('پرداخت با خطا مواجه شد.')
            setLoading(false);
        }
    }, [accessToken, navigation]);

    useEffect(() => {
        const subscription = Linking.addEventListener("url", handleDeepLink);
        return () => {
            subscription.remove();
        };
    }, [handleDeepLink]);

    const useAllCashBalance = async () => {
        const walletBalance = Number(user?.wallet?.balance || 0);

        if (!Number.isFinite(walletBalance) || walletBalance <= 0) {
            showToastOrAlert("موجودی کیف پول شما صفر است");
            return;
        }

        if (priceTimeoutRef.current) clearTimeout(priceTimeoutRef.current);
        if (weightTimeoutRef.current) clearTimeout(weightTimeoutRef.current);

        editingField.current = "price";
        setInputMode("price");
        const requestId = ++calculationRequestRef.current;

        const balanceCapError = getBuyBalanceLimitError(null, currentMetalBalance, tradeLimits, 'نقره');
        if (balanceCapError) {
            showToastOrAlert(balanceCapError);
            return;
        }

        const maxTradeAmount = getMaximumTradeAmount(tradeLimits, silverInfo?.silver_buy_price_per_gram, currentMetalBalance);
        const usableBalance = maxTradeAmount !== null ? Math.min(walletBalance, maxTradeAmount) : walletBalance;
        const formattedBalance = sanitizeMoneyInput(String(usableBalance));
        setPrice(formattedBalance);
        setPriceWord("");

        const result = await calculateWeightFromPrice(usableBalance);
        if (requestId !== calculationRequestRef.current) return;
        setWeight(result.weight);
        setPrice(result.price);
        setPriceWord(result.priceWords || "");
    };


    const purchase = async () => {
        const cleanWeight = parseWeight(weight);
        const cleanPrice = parseMoney(price);

        const tradeError = getTradeWeightError(cleanWeight, tradeLimits, 'خرید نقره')
            || getBuyBalanceLimitError(cleanWeight, currentMetalBalance, tradeLimits, 'نقره');
        if (tradeError) {
            showToastOrAlert(tradeError);
            return;
        }

        if (!Number.isFinite(cleanPrice) || cleanPrice <= 0) {
            showToastOrAlert("لطفاً مبلغ معتبری وارد کنید");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                `${uri}/chargeSilverWallet/`,
                { weight: cleanWeight, price: cleanPrice, mode: inputMode },
                { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${accessToken}` } }
            );

            dispatch(fetchUser(accessToken));
            showToastOrAlert('خرید نقره با موفقیت انجام شد.');
            setPrice("")
            setWeight("")
            setPriceWord("")
        } catch (error) {
            handleError(error, t)
        } finally {
            dispatch(fetchTradingAllowed())
            setLoading(false);
        }
    };


    return (
        <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'additive' }}>
            {
                tradingData?.allowed ? <KeyboardAvoidingView style={{ flex: 1 }} behavior={'padding'}>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainerStyle} refreshControl={<RefreshControl colors={[themeColor1.bgColor(1)]} refreshing={refreshing} onRefresh={() => { dispatch(fetchRate(accessToken)); dispatch(fetchUser(accessToken)); dispatch(fetchSilverInfoPrice({ params: null })); dispatch(fetchTradingAllowed()); }} />}>
                         
                        <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor3.bgColor(0.2) }} />

                        {(!user?.is_national_birth_verified || !user?.is_phone_national_verified) && <View style={[{ padding: '5%', gap: 10, backgroundColor: themeColor12.bgColor(1) }, NewStyles.border10, NewStyles.shadow]}>
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
                            <Text style={NewStyles.text10}>نرخ هر گرم نقره‌</Text>
                            <Text style={NewStyles.text10}>{formatPrice(Number(goldPrice)?.toFixed())} تومان</Text>
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
                            operationLabel="خرید نقره"
                            error={tradeWeightError}
                            currentBalance={currentMetalBalance}
                        />

                        <TextInput
                            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
                            placeholderTextColor={themeColor10.bgColor(0.5)}
                            keyboardType={'decimal-pad'}
                            placeholder='مبلغ به تومان (تا ۳ رقم اعشار)'
                            value={price}
                            onChangeText={handlePriceChange}
                            onBlur={handlePriceBlur}
                        />
                        <TouchableOpacity
                            onPress={useAllCashBalance}
                            style={{
                                    alignSelf: 'flex-start',
                                    paddingVertical: 5,
                                    paddingHorizontal: 2,
                                }}>
                            <Text style={[NewStyles.text1, { fontSize: 13 }]}>
                                استفاده از کل موجودی کیف پول
                            </Text>
                        </TouchableOpacity>
                        {priceWord?.trim() && (
                            <Text style={[NewStyles.text1, { fontSize: 13 }]}>
                                {priceWord}
                            </Text>
                        )}

                        <View style={[NewStyles.rowWrapper, { gap: 10 }]}>
                            <View style={{ flex: 1 }}>
                                <Button
                                    title={'خرید'}
                                    loading={loading}
                                    disabled={Boolean(tradeWeightError)}
                                    onPress={purchase}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Button
                                    title={'شارژ کیف پول'}
                                    onPress={() => {
                                        navigation.navigate('Increase')
                                    }}
                                    color={themeColor1.bgColor(1)}
                                    style={{ backgroundColor: themeColor5.bgColor(1), borderColor: themeColor1.bgColor(1), borderWidth: 1 }}
                                />
                            </View>
                        </View>

                        <View style={[{ padding: '5%', gap: 10, backgroundColor: themeColor12.bgColor(1) }, NewStyles.border10, NewStyles.shadow]}>
                            <View style={NewStyles.rowWrapper}>
                                <Text style={NewStyles.text10}>دارایی نقره‌</Text>
                                <Text style={NewStyles.text10}>{formatPrice(user?.wallet?.silver_balance) || '0'} گرم</Text>
                            </View>
                            <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor3.bgColor(0.2) }} />
                            <View style={NewStyles.rowWrapper}>
                                <Text style={NewStyles.text10}>موجودی کیف پول</Text>
                                <Text style={NewStyles.text10}>{formatPrice(user?.wallet?.balance) || '0'} تومان</Text>
                            </View>
                            <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor3.bgColor(0.2) }} />
                            <View style={NewStyles.rowWrapper}>
                                <Text style={NewStyles.text10}>کارمزد خرید</Text>
                                <Text style={NewStyles.text10}>{silverInfo?.silver_buy_percent} درصد</Text>
                            </View>
                        </View>

                    </ScrollView>
                </KeyboardAvoidingView>
                    :

                    <View style={[{ flex: 1 }, NewStyles.center]} >
                        <VoteTimerDisplay
                            competitionStartAt={tradingData?.start}
                            durationMinutes={null}
                            nowDate={tradingData?.now}
                            title={'تا باز شدن خرید'}
                            initialRemainingSeconds={tradingData?.remaining_seconds}
                            onTimeExpired={() => {
                                dispatch(fetchTradingAllowed())
                            }}
                        />
                    </View>
            }
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