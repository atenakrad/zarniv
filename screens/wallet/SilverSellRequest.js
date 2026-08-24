import { KeyboardAvoidingView, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useCallback, useEffect, useState, useRef } from 'react'
import * as Linking from 'expo-linking';
import Ionicons from '@expo/vector-icons/Ionicons';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';

import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor10, themeColor12, themeColor3, themeColor4, themeColor5 } from '../../theme/Color';
import Button from '../../components/Button';
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

export default function SilverSellRequest({ navigation }) {

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const accessToken = useSelector((state) => state?.token?.accessToken);
    const silverInfo = useSelector(state => state.silverInfo?.data);
    const silverInfoLoading = useSelector(state => state.silverInfo?.loading);
    const silverPrice = silverInfo?.silver_price_per_gram;
    const editingField = useRef(null);
    const trading = useSelector((state) => state?.trading)
    const tradingData = trading?.data
    
    useEffect(() => {
        dispatch(fetchSilverInfoPrice({ params: null }))
        dispatch(fetchTradingAllowed())
    }, []);

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

    const calculatePriceFromWeight = async (numericWeight) => {
        if (!numericWeight || !silverPrice) return { price: "", priceWords: "" };

        const payload = {
            mode: 'price',
            weight: numericWeight,
            way: 'sell'
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
            const response = await dispatch(fetchSilverInfoPrice({ params: payload }));
            const payloadData = response?.payload;

            if (!payloadData || payloadData?.error) {
                throw new Error(payloadData?.message || 'invalid response');
            }

            return {
                weight: String(payloadData.weight),
                // مبلغ واقعی وزن سه‌رقمی برگشتی از بک‌اند جای مبلغ اولیه می‌نشیند.
                price: formatNumber(Math.round(Number(payloadData.price))),
                priceWords: payloadData?.price_words || "",
            };
        } catch (error) {
            showToastOrAlert('خطا در محاسبه قیمت نقره')
            return { weight: "", price: "", priceWords: "" };
        }
    };

    const handleWeightChange = (text) => {
        editingField.current = "weight";

        const sanitized = sanitizeWeightInput(text);
        setWeight(sanitized);
        setPriceWord("");

        if (weightTimeoutRef.current) {
            clearTimeout(weightTimeoutRef.current);
        }

        if (!sanitized) {
            setPrice("");
            return;
        }

        weightTimeoutRef.current = setTimeout(async () => {
            if (editingField.current !== "weight") return;

            const numericWeight = parseWeight(sanitized);
            if (!Number.isFinite(numericWeight) || numericWeight < 0.001) {
                setPrice("");
                setPriceWord("");
                return;
            }

            const result = await calculatePriceFromWeight(numericWeight);
            setPrice(result.price);
            setPriceWord(result.priceWords);
        }, 1000);
    };

    const handlePriceChange = (text) => {
        editingField.current = "price";

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

        priceTimeoutRef.current = setTimeout(async () => {
            if (editingField.current !== "price") return;

            const result = await calculateWeightFromPrice(numericPrice);

            setWeight(result.weight);
            setPrice(result.price);
            setPriceWord(result.priceWords);
        }, 1000);
    };

    const handlePriceBlur = () => {
        if (priceTimeoutRef.current) {
            clearTimeout(priceTimeoutRef.current);
        }

        editingField.current = null;
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

    const submirRequest = async () => {
        const cleanWeight = parseWeight(weight);

        if (!Number.isFinite(cleanWeight) || cleanWeight < 0.001) {
            showToastOrAlert("حداقل مقدار قابل فروش 0.001 گرم است");
            return;
        }

        if (cleanWeight > 50) {
            showToastOrAlert("حداکثر مقدار قابل فروش 50 گرم است");
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
            showToastOrAlert(response?.data?.message);
            setPrice("");
            setWeight("");
            setPriceWord("");
        } catch (error) {
            handleError(error, t)
        } finally {
            dispatch(fetchTradingAllowed())
            setLoading(false);
        }
    };


    return (
        <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'additive' }}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={'padding'}>

                {
                    tradingData?.allowed ? <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainerStyle} refreshControl={<RefreshControl colors={[themeColor1.bgColor(1)]} refreshing={refreshing} onRefresh={() => { dispatch(fetchRate(accessToken)); dispatch(fetchUser(accessToken)); }} />}>
                        
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
                            <Text style={NewStyles.text10}>نرخ هر گرم نقره</Text>
                            <Text style={NewStyles.text10}>{formatPrice(Number(silverPrice)?.toFixed())} تومان</Text>
                        </View>

                        <TextInput
                            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
                            placeholderTextColor={themeColor10.bgColor(0.5)}
                            keyboardType={'decimal-pad'}
                            placeholder='مقدار بر حسب گرم (تا ۳ رقم اعشار)'
                            value={weight}
                            maxLength={8}
                            onChangeText={handleWeightChange}
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
                        {priceWord?.trim() && (
                            <Text style={[NewStyles.text1, { fontSize: 13 }]}>
                                {priceWord}
                            </Text>
                        )}


                        <Button
                            title={'ثبت درخواست فروش'}
                            loading={loading}
                            onPress={submirRequest}
                        />

                        <View style={[{ padding: '5%', gap: 10, backgroundColor: themeColor12.bgColor(1) }, NewStyles.border10, NewStyles.shadow]}>
                            <View style={NewStyles.rowWrapper}>
                                <Text style={NewStyles.text10}>دارایی نقره‌</Text>
                                <Text style={NewStyles.text10}>{formatPrice(user?.wallet?.silver_balance) || '0'} گرم</Text>
                            </View>
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