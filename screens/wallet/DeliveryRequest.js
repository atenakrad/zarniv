import { KeyboardAvoidingView, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useEffect, useState, useRef } from 'react'
import Ionicons from '@expo/vector-icons/Ionicons';

import WalletPieceBalance from '../../components/WalletPieceBalance';
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
import { fetchGoldPrice } from '../../slices/goldPriceSlice';
import { useTranslation } from 'react-i18next';
import { fetchInfoPrice } from '../../slices/goldInfoSlice';
import VoteTimerDisplay from '../../components/VoteTimerDisplay';
import { fetchTradingAllowed } from '../../slices/tradingAllowed';
import Loader from '../../components/Loader';
import SelectedComponent from '../../components/SelectedComponent';
import BackHeader from '../../components/BackHeader';

export default function DeliveryRequest({ navigation }) {

    const dispatch = useDispatch();
    const { t } = useTranslation();
    const accessToken = useSelector((state) => state?.token?.accessToken);
    const goldInfo = useSelector(state => state.goldInfo?.data);
    const goldInfoLoading = useSelector(state => state.goldInfo?.loading);
    const goldPrice = goldInfo?.gold_price_per_gram;
    const editingField = useRef(null);
    const trading = useSelector((state) => state?.trading)
    const [stores, setStores] = useState([])
    const tradingData = trading?.data
    useEffect(() => {
        dispatch(fetchInfoPrice({ params: null }))
        dispatch(fetchTradingAllowed())
    }, []);

    const user = useSelector((state) => state.user?.data);
    const [loading, setLoading] = useState(false);
    const [loader, setLoader] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [shippingAddress, setShippingAddress] = useState('');
    const [postCode, setPostCode] = useState('');

    const [weight, setWeight] = useState("");
    const [price, setPrice] = useState("");
    const [priceWord, setPriceWord] = useState("");
    const [name, setName] = useState("");
    const [way, setWay] = useState('pickup');
    const [pickupStore, setpickupStore] = useState('');

    const weightTimeoutRef = useRef(null);
    const priceTimeoutRef = useRef(null);

    const formatNumber = (num) => {
        if (!num && num !== 0) return "";
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
        if (!numericWeight || !goldPrice) return { price: "", priceWords: "" };

        const payload = {
            mode: 'price',
            weight: numericWeight,
            way: 'delivery'
        };

        try {
            const response = await dispatch(fetchInfoPrice({ params: payload }));
            const payloadData = response?.payload;

            if (!payloadData || payloadData?.error) {
                throw new Error(payloadData?.message || 'invalid response');
            }

            return {
                price: formatNumber(Math.round(Number(payloadData.price))),
                priceWords: payloadData?.price_words || "",
            };
        } catch (error) {
            showToastOrAlert('خطا در محاسبه قیمت طلا')
            return { price: "", priceWords: "" };
        }
    };

    const calculateWeightFromPrice = async (numericPrice) => {
        if (!numericPrice || !goldPrice) return { weight: "", price: "", priceWords: "" };

        const payload = {
            mode: 'weight',
            price: numericPrice,
            way: 'delivery'
        };

        try {
            const response = await dispatch(fetchInfoPrice({ params: payload }));
            const payloadData = response?.payload;

            if (!payloadData || payloadData?.error) {
                throw new Error(payloadData?.message || 'invalid response');
            }

            return {
                weight: String(payloadData.weight),
                price: formatNumber(Math.round(Number(payloadData.price))),
                priceWords: payloadData?.price_words || "",
            };
        } catch (error) {
            showToastOrAlert('خطا در محاسبه قیمت طلا')
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
            if (!Number.isFinite(numericWeight) || numericWeight <= 0) {
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

    const request = async () => {
        const cleanWeight = parseWeight(weight);
        const currentBalance = Number(user?.wallet?.gold_balance || 0);

        if (!Number.isFinite(cleanWeight) || cleanWeight < 5) {
            showToastOrAlert("حداقل مقدار درخواست تحویل 5 گرم است");
            return;
        }

        if (Number.isFinite(currentBalance) && cleanWeight > currentBalance) {
            showToastOrAlert("مقدار واردشده بیشتر از موجودی طلا شما است");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                `${uri}/delivery/request/`,
                {
                    weight: cleanWeight,
                    receiver_name: name,
                    pickup_store_id: pickupStore,
                    delivery_method: way,
                    shipping_address: shippingAddress,
                    shipping_postal_code: postCode
                },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );

            dispatch(fetchUser(accessToken));
            showToastOrAlert(response?.data?.message);
            setWeight("");
            setPrice("");
            setPriceWord("");
            setName("");
            setShippingAddress("");
            setPostCode("");
            setWay("pickup");
            setpickupStore("");
        } catch (error) {
            handleError(error, t)
        } finally {
            dispatch(fetchTradingAllowed())
            setLoading(false);
        }
    }


    const fetchPickUpStore = () => {
        axios.get(`${uri}/pick-up-store/`)
            .then((res) => {
                setStores(res?.data)
            })
            .catch((err) => {
                handleError(err, t)
            })
            .finally(() => {
                setLoader(false)
            })
    }
    useEffect(() => {
        fetchPickUpStore()
    }, [])

    if (loader) {
        return (
            <Loader />
        )
    }

    return (
        <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={NewStyles.container}>
            
            <BackHeader
                title={'تحویل فیزیکی طلا'}
                rightIcon={true}
                iconName={'list'}
                rightIconPress={() => {
                    navigation.navigate('DeliveryRequestHistory')
                }}
            />
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={'padding'}>
                {
                    tradingData?.allowed ?
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainerStyle} refreshControl={<RefreshControl colors={[themeColor1.bgColor(1)]} refreshing={refreshing} onRefresh={() => { dispatch(fetchRate(accessToken)); dispatch(fetchUser(accessToken)); }} />}>
                            <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor3.bgColor(0.2) }} />
                            <View style={[{ padding: '5%', gap: 10, backgroundColor: themeColor12.bgColor(1) }, NewStyles.border10, NewStyles.shadow]}>
                                <View style={NewStyles.rowWrapper}>
                                    <Text style={NewStyles.text10}>نرخ هر گرم طلای 18 عیار</Text>
                                    <Text style={NewStyles.text10}>{formatPrice(Number(goldPrice)?.toFixed())} تومان</Text>
                                </View>
                                <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor3.bgColor(0.2) }} />
                                <WalletPieceBalance wallet={user?.wallet} metal="gold" label="دارایی طلا" />
                                <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor3.bgColor(0.2) }} />
                                <View style={NewStyles.rowWrapper}>
                                    <Text style={NewStyles.text10}>حداقل درخواست</Text>
                                    <Text style={NewStyles.text10}>5 گرم</Text>
                                </View>
                            </View>
                            {(!user?.is_national_birth_verified || !user?.is_phone_national_verified) &&
                                <View style={[{ padding: '5%', gap: 10, backgroundColor: themeColor12.bgColor(1) }, NewStyles.border10, NewStyles.shadow]}>
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
                            {(user?.is_national_birth_verified && user?.is_phone_national_verified && !user?.is_bank_info_verified) &&
                                <View style={[{ padding: '5%', gap: 10, backgroundColor: themeColor12.bgColor(1) }, NewStyles.border10, NewStyles.shadow]}>
                                    <View style={[NewStyles.row, { gap: 10 }]}>
                                        <Ionicons name="alert-circle-outline" size={24} color={themeColor10.bgColor(1)} />
                                        <Text style={[NewStyles.text10, { flex: 1 }]}>برای ثبت درخواست فروش باید ابتدا حساب بانکی خود را احراز کنید.</Text>
                                    </View>
                                    <Button title={'تکمیل اطلاعات حساب'}
                                        onPress={() => {
                                            navigation.navigate('EditCard')
                                        }}
                                    />
                                </View>}
                            <Text style={[NewStyles.text10]}>مقدار بر حسب گرم</Text>
                            <TextInput
                                style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
                                placeholderTextColor={themeColor10.bgColor(0.5)}
                                keyboardType={'decimal-pad'}
                                placeholder='مقدار بر حسب گرم (تا ۳ رقم اعشار)'
                                value={weight}
                                maxLength={10}
                                onChangeText={handleWeightChange}
                            />
                            <Text style={[NewStyles.text10]}>مقدار بر حسب تومان</Text>
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
                            <Text style={[NewStyles.text10]}>نام تحویل گیرنده</Text>
                            <TextInput
                                style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
                                placeholderTextColor={themeColor10.bgColor(0.5)}
                                placeholder='نام تحویل گیرنده'
                                value={name}
                                onChangeText={(p) => {
                                    setName(p)
                                }}
                            />
                            <View style={[NewStyles.row, { gap: 10, marginTop: 15 }]}>
                                <TouchableOpacity style={[NewStyles.row, { gap: 5 }]} onPress={() => {
                                    setWay('pickup')
                                }}>
                                    <SelectedComponent selected={way == 'pickup'} />
                                    <Text style={NewStyles.text10}>تحویل از مغازه</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[NewStyles.row, { gap: 5 }]} onPress={() => {
                                    setWay('shipping')
                                }}>
                                    <SelectedComponent selected={way == 'shipping'} />
                                    <Text style={NewStyles.text10}>ارسال به آدرس</Text>
                                </TouchableOpacity>

                            </View>
                            {
                                way == 'pickup' &&
                                <View style={{ gap: 10 }}>
                                    {
                                        stores?.map(item => {
                                            return (
                                                <TouchableOpacity key={item?.id} style={[NewStyles.border10, NewStyles.shadow, NewStyles.row, { backgroundColor: themeColor4.bgColor(1), padding: 10, alignItems: 'flex-start', }]} onPress={() => {
                                                    setpickupStore(item?.id)
                                                }}>
                                                    <SelectedComponent selected={pickupStore == item?.id} />

                                                    <View style={{ flex: 1, paddingHorizontal: 15 }}>
                                                        <Text style={NewStyles.title10}>{item?.shop_name}</Text>
                                                        <View style={[NewStyles.row, { gap: 5, marginVertical: 5 }]}>
                                                            <Ionicons name={'location'} size={18} color={themeColor0.bgColor(1)} />
                                                            <Text style={NewStyles.text10}>{item?.address}</Text>
                                                        </View>
                                                        <TouchableOpacity style={[NewStyles.row, { gap: 5, marginVertical: 5 }]}>
                                                            <Ionicons name={'call'} size={18} color={themeColor0.bgColor(1)} />
                                                            <Text style={NewStyles.text10}>{item?.phone_number}</Text>
                                                        </TouchableOpacity>
                                                    </View>

                                                </TouchableOpacity>
                                            )
                                        })
                                    }
                                </View>
                            }
                            {
                                way == 'shipping' &&
                                <View style={{ gap: 10 }}>
                                    <Text style={[NewStyles.text10]}>آدرس کامل ارسال</Text>
                                    <TextInput
                                        style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10, { height: 70 }]}
                                        placeholderTextColor={themeColor10.bgColor(0.5)}
                                        placeholder='آدرس کامل ارسال'
                                        verticalAlign='top'
                                        textAlignVertical='top'
                                        value={shippingAddress}
                                        onChangeText={(p) => {
                                            setShippingAddress(p)
                                        }}
                                    />
                                    <Text style={[NewStyles.text10]}>کدپستی</Text>
                                    <TextInput
                                        style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
                                        placeholderTextColor={themeColor10.bgColor(0.5)}
                                        placeholder='کدپستی'
                                        maxLength={10}
                                        keyboardType='number-pad'
                                        value={postCode}
                                        onChangeText={(p) => {
                                            setPostCode(p)
                                        }}

                                    />
                                </View>
                            }
                            <Button
                                title={'ثبت'}
                                loading={loading}
                                onPress={request}
                            />



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