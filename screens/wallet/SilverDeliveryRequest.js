import { KeyboardAvoidingView, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useEffect, useState, useRef } from 'react'
import Ionicons from '@expo/vector-icons/Ionicons';

import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor10, themeColor12, themeColor3, themeColor4 } from '../../theme/Color';
import Button from '../../components/Button';
import { useDispatch, useSelector } from 'react-redux';
import { formatPrice, handleError, showToastOrAlert } from '../../helpers/Common';
import { uri } from '../../services/URL';
import { fetchUser } from '../../slices/userSlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchRate } from '../../slices/rateSlice';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { fetchSilverInfoPrice } from '../../slices/silverInfoSlice';
import VoteTimerDisplay from '../../components/VoteTimerDisplay';
import { fetchTradingAllowed } from '../../slices/tradingAllowed';

export default function SilverDeliveryRequest({ navigation }) {

    const dispatch = useDispatch();
    const { t } = useTranslation();
    const accessToken = useSelector((state) => state?.token?.accessToken);
    const silverInfo = useSelector(state => state.silverInfo?.data);
    const silverInfoLoading = useSelector(state => state.silverInfo?.loading);
    const silverPrice = silverInfo?.silver_price_per_gram;
    const trading = useSelector((state) => state?.trading)
    const tradingData = trading?.data
    const editingField = useRef(null);
    useEffect(() => {
        dispatch(fetchSilverInfoPrice({ params: null }))
        dispatch(fetchTradingAllowed())
    }, []);

    const user = useSelector((state) => state.user?.data);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const [weight, setWeight] = useState("");
    const [price, setPrice] = useState("");

    const weightTimeoutRef = useRef(null);
    const priceTimeoutRef = useRef(null);

    const formatNumber = (num) => {
        if (!num && num !== 0) return "";
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    const parseNumber = (str) => {
        if (!str) return 0;
        return Number(str.replace(/,/g, "").replace(/[^0-9]/g, ""));
    };

    const calculatePriceFromWeight = async (numericWeight) => {
        if (!numericWeight || !silverPrice) return "";
        const payload = {
            mode: 'price',
            weight: numericWeight,
            way: 'delivery'

        }
        try {
            const response = await dispatch(fetchSilverInfoPrice({ params: payload }))
            return formatNumber(Math.round(response?.payload?.price));
        } catch (error) {
            showToastOrAlert('خطا در محاسبه قیمت نقره')
            return '0';
        }


    };

    const calculateWeightFromPrice = async (numericPrice) => {
        if (!numericPrice || !silverPrice) return { weight: "", price: "" };
        const silverPricePerMg = Number(silverPrice) / 1000;
        if (silverPricePerMg === 0) return { weight: "", price: "" };

        const payload = {
            mode: 'weight',
            price: numericPrice,
            way: 'delivery'

        }
        
        try {
            const response = await dispatch(fetchSilverInfoPrice({ params: payload }))
            const price =
                response.payload.weight *
                (response.payload.silver_price_per_mg);

            return {
                weight: response.payload.weight.toString(),
                price: formatNumber(Math.round(price)),
            };

        } catch (error) {
            showToastOrAlert('خطا در محاسبه قیمت نقره')
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

    const request = async () => {
        if (!weight || parseInt(weight, 10) < 1) {
            showToastOrAlert("لطفاً مقدار معتبری برای درخواست وارد کنید");
            return;
        }
        setLoading(true);
        try {
            const response = await axios.post(`${uri}/silver/delivery/request/`, { weight }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${accessToken}` } })

            dispatch(fetchUser(accessToken));
            showToastOrAlert(response?.data?.message);
            setWeight("");
            setPrice("");

        } catch (error) {
            handleError(error, t)
        } finally {
            dispatch(fetchTradingAllowed())
            setLoading(false);
        }
    }

    return (
        <SafeAreaView edges={{ top: 'additive', bottom: 'additive' }} style={NewStyles.container}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={'padding'}>
                {
                    tradingData?.allowed ?

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainerStyle} refreshControl={<RefreshControl colors={[themeColor1.bgColor(1)]} refreshing={refreshing} onRefresh={() => { dispatch(fetchRate(accessToken)); dispatch(fetchUser(accessToken)); }} />}>
                            <View style={NewStyles.center}>
                                <Text style={NewStyles.heading10}>درخواست تحویل فیزیکی</Text>
                            </View>
                            <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor3.bgColor(0.2) }} />

                            {(!user?.is_national_birth_verified || !user?.is_phone_national_verified) && <View style={[{ padding: '5%', gap: 10, backgroundColor: themeColor12.bgColor(1) }, NewStyles.border10, NewStyles.shadow]}>
                                <View style={[NewStyles.row, { gap: 10 }]}>
                                    <Ionicons name="alert-circle-outline" size={24} color={themeColor10.bgColor(1)} />
                                    <Text style={[NewStyles.text10, { flex: 1 }]}>حساب کاربری شما در حال حاضر احراز هویت نشده است، برای شروع خرید و فروش ابتدا بایستی حساب کاربری خود را احراز هویت کنید.</Text>
                                </View>
                                <Button title={'احراز هویت'}
                                    onPress={() => {
                                        navigation.navigate('Verify')
                                    }}
                                />
                            </View>}
                            {(user?.is_national_birth_verified && user?.is_phone_national_verified && !user?.is_bank_info_verified) && <View style={[{ padding: '5%', gap: 10, backgroundColor: themeColor12.bgColor(1) }, NewStyles.border10, NewStyles.shadow]}>
                                <View style={[NewStyles.row, { gap: 10 }]}>
                                    <Ionicons name="alert-circle-outline" size={24} color={themeColor10.bgColor(1)} />
                                    <Text style={[NewStyles.text10, { flex: 1 }]}>برای ثبت درخواست فروش باید ابتدا حساب بانکی خود را احراز کنید.</Text>
                                </View>
                                <Button title={'تکمیل انقرهعات حساب'}
                                    onPress={() => {
                                        navigation.navigate('EditCard')
                                    }}
                                />
                            </View>}

                            <View style={NewStyles.rowWrapper}>
                                <Text style={NewStyles.text10}>نرخ هر میلی گرم نقره</Text>
                                <Text style={NewStyles.text10}>{formatPrice((Number(silverPrice) / 1000).toFixed())} تومان</Text>
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

                            <Button
                                title={'ثبت'}
                                loading={loading}
                                onPress={request}
                            />

                            <View style={[{ padding: '5%', gap: 10, backgroundColor: themeColor12.bgColor(1) }, NewStyles.border10, NewStyles.shadow]}>
                                <View style={NewStyles.rowWrapper}>
                                    <Text style={NewStyles.text10}>دارایی نقره</Text>
                                    <Text style={NewStyles.text10}>{formatPrice(user?.wallet?.silver_balance * 1000) || '0'} میلی گرم</Text>
                                </View>
                                <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor3.bgColor(0.2) }} />
                                <View style={NewStyles.rowWrapper}>
                                    <Text style={NewStyles.text10}>حداقل درخواست</Text>
                                    <Text style={NewStyles.text10}>5,000 میلی گرم</Text>
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
                                title={'تا باز شدن درخواست تحویل'}
                                onTimeExpired={() => {
                                    dispatch(fetchTradingAllowed())
                                }}
                            />
                        </View>
                }
                <View style={{ marginHorizontal: '5%' }}>
                    <Button title={'تاریخچه‌ی درخواست‌ها'} onPress={() => { navigation.navigate('SilverDeliveryRequestHistory') }} />
                </View>
            </KeyboardAvoidingView>

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