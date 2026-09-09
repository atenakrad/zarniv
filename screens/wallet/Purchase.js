import { AppState, KeyboardAvoidingView, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useCallback, useEffect, useState, useRef } from 'react'
import * as Linking from 'expo-linking';
import Ionicons from '@expo/vector-icons/Ionicons';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import WalletPieceBalance from '../../components/WalletPieceBalance';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor10, themeColor12, themeColor3, themeColor4, themeColor5 } from '../../theme/Color';
import Button from '../../components/Button';
import TradeLimitNotice from '../../components/TradeLimitNotice';
import { formatPrice, handleError, showToastOrAlert } from '../../helpers/Common';
import { uri } from '../../services/URL';
import { fetchUser } from '../../slices/userSlice';
import { fetchRate } from '../../slices/rateSlice';
import { fetchGoldPrice } from '../../slices/goldPriceSlice';
import { useTranslation } from 'react-i18next';
import { fetchInfoPrice } from '../../slices/goldInfoSlice';
import Loader from './../../components/Loader';
import VoteTimerDisplay from '../../components/VoteTimerDisplay';
import { fetchTradingAllowed } from '../../slices/tradingAllowed';
import { getBuyBalanceLimitError, getMaximumTradeAmount, getTradeLimits, getTradeWeightError, hasReachedBuyBalanceLimit, TRADE_CALCULATION_DEBOUNCE_MS } from '../../helpers/tradeLimits';

export default function Purchase({ navigation }) {

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const accessToken = useSelector((state) => state?.token?.accessToken);
    const goldInfo = useSelector(state => state.goldInfo?.data);
    const trading = useSelector((state) => state?.trading)
    const tradingData = trading?.data
    const goldPrice = goldInfo?.gold_price_per_gram;
    const tradeLimits = getTradeLimits(tradingData, 'buy', 'gold', goldInfo);
    const editingField = useRef(null);
    const calculationRequestRef = useRef(0);
    useFocusEffect(
        useCallback(() => {
            if (accessToken) {
                dispatch(fetchUser(accessToken));
            }
            dispatch(fetchInfoPrice({ params: null }));
            dispatch(fetchTradingAllowed());
        }, [accessToken, dispatch]),
    );

    const user = useSelector((state) => state.user?.data);
    const currentMetalBalance = Number(user?.wallet?.gold_balance || 0);
    const isBalanceAtBuyLimit = hasReachedBuyBalanceLimit(currentMetalBalance, tradeLimits);
    const [loading, setLoading] = useState(false)
    const [gatewayLoading, setGatewayLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false);

    const [weight, setWeight] = useState("")
    const [price, setPrice] = useState("")
    const [priceWord, setPriceWord] = useState("")
    const [inputMode, setInputMode] = useState("weight")

    const weightTimeoutRef = useRef(null);
    const priceTimeoutRef = useRef(null);
    const gatewayPendingRef = useRef(false);
    const gatewayFallbackTimerRef = useRef(null);
    const lastGatewayUrlRef = useRef('');
    const appStateRef = useRef(AppState.currentState);
    const redirectUrl = Linking.createURL('/?');

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
        ? getTradeWeightError(currentWeight, tradeLimits, 'خرید طلا')
        : "") || getBuyBalanceLimitError(currentWeight, currentMetalBalance, tradeLimits, 'طلا');

    const calculatePriceFromWeight = async (numericWeight) => {
        if (!numericWeight || !goldPrice) return { price: "", priceWords: "" };

        const payload = {
            mode: 'price',
            weight: numericWeight,
            way: 'buy'
        };

        try {
            const payloadData = await dispatch(fetchInfoPrice({ params: payload })).unwrap();

            if (!payloadData || payloadData?.error) {
                throw new Error(payloadData?.message || 'invalid response');
            }

            return {
                price: formatNumber(Math.round(Number(payloadData.price))),
                priceWords: payloadData?.price_words || "",
            };
        } catch (error) {
            showToastOrAlert('خطا در محاسبه قیمت طلا');
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
            const payloadData = await dispatch(fetchInfoPrice({ params: payload })).unwrap();

            if (!payloadData || payloadData?.error) {
                throw new Error(payloadData?.message || 'invalid response');
            }

            return {
                weight: String(payloadData.weight),
                // بک‌اند وزن را تا 3 رقم اعشار نهایی کرده و قیمت واقعی همان وزن را برمی‌گرداند.
                price: formatNumber(Math.round(Number(payloadData.price))),
                priceWords: payloadData?.price_words || "",
            };
        } catch (error) {
            showToastOrAlert('خطا در محاسبه قیمت طلا');
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
        const localWeightError = getTradeWeightError(numericWeight, tradeLimits, 'خرید طلا')
            || getBuyBalanceLimitError(numericWeight, currentMetalBalance, tradeLimits, 'طلا');
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
            if (gatewayFallbackTimerRef.current) {
                clearTimeout(gatewayFallbackTimerRef.current);
            }
        };
    }, []);


    const resetTradeForm = useCallback(() => {
        setPrice("");
        setWeight("");
        setPriceWord("");
    }, []);

    const refreshTradeState = useCallback(() => {
        if (accessToken) dispatch(fetchUser(accessToken));
        dispatch(fetchTradingAllowed());
    }, [accessToken, dispatch]);

    const handleGatewayDeepLink = useCallback(({ url }) => {
        if (!url || lastGatewayUrlRef.current === url) return;

        const { queryParams } = Linking.parse(url);
        const param = (value) => Array.isArray(value) ? value[0] : value;
        const type = String(param(queryParams?.type) || '');
        const resultMetal = String(param(queryParams?.metal) || '');

        if (type !== 'metal_purchase' || (resultMetal && resultMetal !== 'gold')) return;

        lastGatewayUrlRef.current = url;
        gatewayPendingRef.current = false;
        if (gatewayFallbackTimerRef.current) {
            clearTimeout(gatewayFallbackTimerRef.current);
            gatewayFallbackTimerRef.current = null;
        }
        setGatewayLoading(false);
        refreshTradeState();

        const statusValue = String(param(queryParams?.Status) || '').toUpperCase();
        const result = String(param(queryParams?.result) || '');
        const message = String(param(queryParams?.message) || '');

        if (statusValue === 'OK' && result === 'completed') {
            showToastOrAlert(message || 'خرید طلا با موفقیت انجام شد.');
            resetTradeForm();
            return;
        }
        if (statusValue === 'OK' && result === 'awaiting_approval') {
            showToastOrAlert(message || 'پرداخت موفق بود و درخواست خرید در انتظار تأیید مدیر است.');
            resetTradeForm();
            return;
        }
        if (statusValue === 'OK' && result === 'balance_cap_refunded') {
            showToastOrAlert(message || 'پرداخت تأیید شد اما به دلیل تکمیل سقف موجودی، مبلغ به کیف پول ریالی برگشت داده شد.');
            resetTradeForm();
            return;
        }
        if (result === 'approval_rejected') {
            showToastOrAlert(message || 'درخواست خرید توسط مدیر رد شده است.');
            return;
        }

        showToastOrAlert(message || 'پرداخت ناموفق بود یا نتیجه آن تأیید نشد.');
    }, [refreshTradeState, resetTradeForm]);

    useEffect(() => {
        const subscription = Linking.addEventListener('url', handleGatewayDeepLink);
        Linking.getInitialURL()
            .then((initialUrl) => {
                if (initialUrl) handleGatewayDeepLink({ url: initialUrl });
            })
            .catch(() => {});
        return () => subscription.remove();
    }, [handleGatewayDeepLink]);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextState) => {
            const returnedFromBackground = /inactive|background/.test(appStateRef.current) && nextState === 'active';
            appStateRef.current = nextState;
            if (!returnedFromBackground || !gatewayPendingRef.current) return;

            // برگشت دستی از مرورگر/درگاه نباید دکمه را روی لودینگ نگه دارد.
            // نتیجه قطعی پرداخت، در صورت وجود، همچنان توسط deep-link هندل می‌شود.
            setGatewayLoading(false);

            if (gatewayFallbackTimerRef.current) clearTimeout(gatewayFallbackTimerRef.current);
            gatewayFallbackTimerRef.current = setTimeout(() => {
                if (!gatewayPendingRef.current) return;
                gatewayPendingRef.current = false;
                setGatewayLoading(false);
                refreshTradeState();
                showToastOrAlert('به اپ برگشتید اما نتیجه قطعی پرداخت از درگاه دریافت نشد. وضعیت موجودی و تراکنش را بررسی کنید.');
            }, 1800);
        });
        return () => subscription.remove();
    }, [refreshTradeState]);

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

        const balanceCapError = getBuyBalanceLimitError(null, currentMetalBalance, tradeLimits, 'طلا');
        if (balanceCapError) {
            showToastOrAlert(balanceCapError);
            return;
        }

        const maxTradeAmount = getMaximumTradeAmount(tradeLimits, goldInfo?.gold_buy_price_per_gram, currentMetalBalance);
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


    const purchase = async (paymentMethod = 'wallet') => {
        const cleanWeight = parseWeight(weight);
        const cleanPrice = parseMoney(price);

        const tradeError = getTradeWeightError(cleanWeight, tradeLimits, 'خرید طلا')
            || getBuyBalanceLimitError(cleanWeight, currentMetalBalance, tradeLimits, 'طلا');
        if (tradeError) {
            showToastOrAlert(tradeError);
            return;
        }
        if (!Number.isFinite(cleanPrice) || cleanPrice <= 0) {
            showToastOrAlert("لطفاً مبلغ معتبری وارد کنید");
            return;
        }

        if (paymentMethod === 'gateway') {
            const gatewayLimit = Number(tradingData?.gateway_payment_limit || 0);
            if (gatewayLimit > 0 && cleanPrice > gatewayLimit) {
                showToastOrAlert('مبلغ خرید از سقف مجاز پرداخت درگاه بیشتر است.');
                return;
            }
            setGatewayLoading(true);
            gatewayPendingRef.current = true;
            lastGatewayUrlRef.current = '';
        } else {
            setLoading(true);
        }

        try {
            const response = await axios.post(
                `${uri}/chargeGoldWallet/`,
                {
                    weight: cleanWeight,
                    price: cleanPrice,
                    mode: inputMode,
                    payment_method: paymentMethod,
                    ...(paymentMethod === 'gateway' ? { linkingUri: redirectUrl } : {}),
                },
                {
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (paymentMethod === 'gateway') {
                const paymentUrl = response?.data?.payment_url;
                if (!paymentUrl) throw new Error(response?.data?.message || 'آدرس درگاه دریافت نشد.');
                await Linking.openURL(paymentUrl);
                return;
            }

            refreshTradeState();
            showToastOrAlert(
                response?.data?.message
                || (response?.data?.requires_admin_approval
                    ? 'درخواست خرید ثبت شد و در انتظار تأیید مدیر است.'
                    : 'خرید طلا با موفقیت انجام شد.')
            );
            resetTradeForm();
        } catch (error) {
            if (paymentMethod === 'gateway') {
                gatewayPendingRef.current = false;
                setGatewayLoading(false);
            }
            handleError(error, t);
        } finally {
            if (paymentMethod === 'wallet') {
                setLoading(false);
            } else {
                // Linking.openURL فقط hand-off به مرورگر را انجام می‌دهد.
                // لودر فقط تا گرفتن URL و باز شدن مرورگر لازم است؛ نتیجه پرداخت
                // بعداً از deep-link می‌آید. این کار برگشت دستی با Back را هم پوشش می‌دهد.
                setGatewayLoading(false);
            }
        }
    };



    return (
        <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'additive' }}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={'padding'}>
                {
                    tradingData?.allowed ?
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainerStyle} refreshControl={<RefreshControl colors={[themeColor1.bgColor(1)]} refreshing={refreshing} onRefresh={() => {
                            dispatch(fetchRate(accessToken));
                            dispatch(fetchUser(accessToken));
                            dispatch(fetchInfoPrice({ params: null }))
                            dispatch(fetchTradingAllowed())
                        }} />}>
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
                                <Text style={NewStyles.text10}>نرخ هر گرم طلای 18 عیار</Text>
                                <Text style={NewStyles.text10}>{formatPrice((Number(goldPrice))?.toFixed())} تومان</Text>
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
                                operationLabel="خرید طلا"
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
                            {priceWord?.trim() && <Text style={[NewStyles.text1,{fontSize:13}]}>{priceWord}</Text>}

                            <View style={{ gap: 0 }}>
                                <View style={{ flexDirection: 'row-reverse', gap: 10 }}>
                                    <View style={{ flex: 1 }}>
                                        <Button
                                            title={'خرید با کیف پول'}
                                            loading={loading}
                                            disabled={gatewayLoading || Boolean(tradeWeightError)}
                                            onPress={() => purchase('wallet')}
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Button
                                            title={'خرید از درگاه'}
                                            shadow={false}
                                            loading={gatewayLoading}
                                            disabled={loading || Boolean(tradeWeightError)}
                                            onPress={() => purchase('gateway')}
                                            style={{ backgroundColor: themeColor0.bgColor(0.12), borderColor: themeColor0.bgColor(1), borderWidth: 1 }}
                                            color={themeColor1.bgColor(1)}
                                            loadingColor={themeColor1.bgColor(1)}
                                        />
                                    </View>
                                </View>
                                <TouchableOpacity
                                    disabled={loading || gatewayLoading}
                                    onPress={() => navigation.navigate('Increase')}
                                    style={{ alignSelf: 'center', paddingVertical: 4, paddingHorizontal: 8 }}
                                >
                                    <Text style={[NewStyles.text1, { fontSize: 13 }]}>شارژ کیف پول ریالی</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={[{ padding: '5%', gap: 10, backgroundColor: themeColor12.bgColor(1) }, NewStyles.border10, NewStyles.shadow]}>
                                <WalletPieceBalance wallet={user?.wallet} metal="gold" label="دارایی طلا" />
                                <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor3.bgColor(0.2) }} />
                                <View style={NewStyles.rowWrapper}>
                                    <Text style={NewStyles.text10}>موجودی کیف پول</Text>
                                    <Text style={NewStyles.text10}>{formatPrice(user?.wallet?.balance) || '0'} تومان</Text>
                                </View>
                                <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor3.bgColor(0.2) }} />
                                <View style={NewStyles.rowWrapper}>
                                    <Text style={NewStyles.text10}>کارمزد خرید</Text>
                                    <Text style={NewStyles.text10}>{goldInfo?.gold_buy_percent} درصد</Text>
                                </View>
                                <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor3.bgColor(0.2) }} />
                                <View style={NewStyles.rowWrapper}>
                                    <Text style={[NewStyles.text10, { flex: 1, paddingLeft: 10 }]}>قیمت خرید هر گرم طلا براساس طلای 18 عیار</Text>
                                    <Text style={NewStyles.text10}>{formatPrice(Number((1 + Number(goldInfo?.gold_buy_percent) / 100) * goldPrice)?.toFixed(0))} تومان</Text>
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
                                title={'تا باز شدن خرید'}
                                onTimeExpired={() => {
                                    dispatch(fetchTradingAllowed())
                                }}
                            />
                        </View>
                }
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