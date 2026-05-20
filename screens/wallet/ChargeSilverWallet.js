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
import Loader from './../../components/Loader';
import { fetchSilverInfoPrice } from '../../slices/silverInfoSlice';
import VoteTimerDisplay from '../../components/VoteTimerDisplay';
import { fetchTradingAllowed } from '../../slices/tradingAllowed';

export default function ChargeSilverWallet({ navigation }) {

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const accessToken = useSelector((state) => state?.token?.accessToken);
    const silverInfo = useSelector(state => state.silverInfo?.data);
    const silverInfoLoading = useSelector(state => state.silverInfo?.loading);
    const goldPrice = silverInfo?.silver_price_per_gram;
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

    const weightTimeoutRef = useRef(null);
    const priceTimeoutRef = useRef(null);

    const formatNumber = (num) => {
        if (!num && num !== 0) return "";
        return num.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const parseNumber = (str) => {
        if (!str) return 0;
        return Number(str?.replace(/,/g, "")?.replace(/[^0-9]/g, ""));
    };

    const calculatePriceFromWeight = async (numericWeight) => {
        if (!numericWeight || !goldPrice) return "";
        const payload = {
            mode: 'price',
            weight: numericWeight,
            way: 'buy'

        }
        try {
            const response = await dispatch(fetchSilverInfoPrice({ params: payload }))
            return formatNumber(Math.round(response?.payload?.price));
        } catch (error) {
            showToastOrAlert('خطا در محاسبه قیمت نقره‌')
            return '0';
        }


    };

    const calculateWeightFromPrice = async (numericPrice) => {
        if (!numericPrice || !goldPrice) return { weight: "", price: "" };
        const goldPricePerMg = Number(goldPrice) / 1000;
        if (goldPricePerMg === 0) return { weight: "", price: "" };

        const payload = {
            mode: 'weight',
            price: numericPrice,
            way: 'buy'

        }
        try {
            const response = await dispatch(fetchSilverInfoPrice({ params: payload }))
            const price =
                response.payload.weight *
                (response.payload.silver_price_per_mg *
                    (1 + response.payload.silver_buy_percent / 100));

            return {
                weight: response.payload.weight.toString(),
                price: formatNumber(Math.round(price)),
            };

        } catch (error) {
            showToastOrAlert('خطا در محاسبه قیمت نقره‌')
            return { weight: "", price: "" };
        }

    };

    const handleWeightChange = (text) => {
        editingField.current = "weight";

        const onlyNumbers = text.replace(/[^0-9]/g, "");
        setWeight(onlyNumbers);

        if (weightTimeoutRef.current) {
            clearTimeout(weightTimeoutRef.current);
        }

        if (!onlyNumbers) {
            setPrice("");
            return;
        }

        weightTimeoutRef.current = setTimeout(async () => {

            if (editingField.current !== "weight") return;

            const numericWeight = parseInt(onlyNumbers, 10);

            const calculatedPrice = await calculatePriceFromWeight(numericWeight);

            setPrice(calculatedPrice);

        }, 1000);
    };

    const handlePriceChange = (text) => {
        editingField.current = "price";

        const cleaned = text.replace(/[^0-9]/g, "");
        const formatted = formatNumber(cleaned);

        setPrice(formatted);

        if (priceTimeoutRef.current) {
            clearTimeout(priceTimeoutRef.current);
        }

        if (!cleaned) {
            setWeight("");
            return;
        }

        priceTimeoutRef.current = setTimeout(async () => {

            if (editingField.current !== "price") return;

            const numericPrice = parseInt(cleaned, 10);

            const result = await calculateWeightFromPrice(numericPrice);

            setWeight(result.weight);
            setPrice(result.price);

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

    const purchase = async () => {
        if (!weight || parseInt(weight, 10) < 1) {
            showToastOrAlert("لطفاً مقدار معتبری برای خرید وارد کنید");
            return;
        }
        if (!Number.isInteger(parseFloat(weight))) {
            showToastOrAlert("مقدار میلی‌گرم باید عدد صحیح باشد.");
            return;
        }
        setLoading(true);
        const cleanWeight = parseNumber(weight);
        const cleanPrice = parseNumber(price);
        try {
            const response = await axios.post(`${uri}/chargeSilverWallet/`, { weight: cleanWeight, price: cleanPrice, }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${accessToken}` } });

            dispatch(fetchUser(accessToken));
            showToastOrAlert('خرید نقره با موفقیت انجام شد.');
            setPrice("")
            setWeight("")
        } catch (error) {
            handleError(error, t)
        } finally {
            dispatch(fetchTradingAllowed())
            setLoading(false);
        }
    };


    return (
        <SafeAreaView style={NewStyles.container} edges={{ top: 'additive', bottom: 'additive' }}>
            {
                tradingData?.allowed ? <KeyboardAvoidingView style={{ flex: 1 }} behavior={'padding'}>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainerStyle} refreshControl={<RefreshControl colors={[themeColor1.bgColor(1)]} refreshing={refreshing} onRefresh={() => { dispatch(fetchRate(accessToken)); dispatch(fetchUser(accessToken)); }} />}>
                        <View style={NewStyles.center}>
                            <Text style={NewStyles.heading10}>خرید نقره‌ی آب شده</Text>
                        </View>
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
                            <Text style={NewStyles.text10}>نرخ هر میلی گرم نقره‌</Text>
                            <Text style={NewStyles.text10}>{formatPrice((Number(goldPrice) / 1000)?.toFixed())} تومان</Text>
                        </View>

                        <TextInput
                            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
                            placeholderTextColor={themeColor10.bgColor(0.5)}
                            keyboardType={'number-pad'}
                            placeholder='مقدار بر حسب میلی گرم'
                            value={weight}
                            maxLength={5}
                            onChangeText={handleWeightChange}
                        />

                        <TextInput
                            style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
                            placeholderTextColor={themeColor10.bgColor(0.5)}
                            keyboardType={'number-pad'}
                            placeholder='مقدار بر حسب تومان'
                            value={price}
                            onChangeText={handlePriceChange}
                            onBlur={handlePriceBlur}
                        />

                        <View style={[NewStyles.rowWrapper, { gap: 10 }]}>
                            <View style={{ flex: 1 }}>
                                <Button
                                    title={'خرید'}
                                    loading={loading}
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
                                <Text style={NewStyles.text10}>{formatPrice(user?.wallet?.silver_balance * 1000) || '0'} میلی گرم</Text>
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
        paddingVertical: '5%',
        gap: 10,
    },
});