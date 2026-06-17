import { KeyboardAvoidingView, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
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
import { fetchGoldPrice } from '../../slices/goldPriceSlice';
import { useTranslation } from 'react-i18next';
import { fetchInfoPrice } from '../../slices/goldInfoSlice';
import VoteTimerDisplay from '../../components/VoteTimerDisplay';
import { fetchTradingAllowed } from '../../slices/tradingAllowed';
import Loader from '../../components/Loader';
import SelectedComponent from '../../components/SelectedComponent';

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
    const [name, setName] = useState("");
    const [way, setWay] = useState('pickup');
    const [pickupStore, setpickupStore] = useState('');

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
        if (!numericWeight || !goldPrice) return "";
        const payload = {
            mode: 'price',
            weight: numericWeight,
            way: 'delivery'

        }
        try {
            const response = await dispatch(fetchInfoPrice({ params: payload }))
            return formatNumber(Math.round(response?.payload?.price));
        } catch (error) {
            showToastOrAlert('خطا در محاسبه قیمت طلا')
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
            way: 'delivery'

        }
        try {
            const response = await dispatch(fetchInfoPrice({ params: payload }))
            const price =
                response.payload.weight *
                (response.payload.gold_price_per_mg);

            return {
                weight: response.payload.weight.toString(),
                price: formatNumber(Math.round(price)),
            };

        } catch (error) {
            showToastOrAlert('خطا در محاسبه قیمت طلا')
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
            const response = await axios.post(`${uri}/delivery/request/`, { weight, receiver_name: name, pickup_store_id: pickupStore, delivery_method: way, shipping_address: shippingAddress, shipping_postal_code: postCode }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${accessToken}` } })

            dispatch(fetchUser(accessToken));
            showToastOrAlert(response?.data?.message);
            setWeight("");
            setPrice("");
            setName("");
            setShippingAddress("")
            setPostCode("")
            setWay("pickup")
            setpickupStore("")

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
        <SafeAreaView edges={{ top: 'additive', bottom: 'additive' }} style={NewStyles.container}>
            <View style={[NewStyles.row, { paddingTop: 15, width: '100%' }]}>
                <View style={[{ flex: 1 }, NewStyles.center]}>
                    <TouchableOpacity style={{ padding: 10 }} onPress={() => {
                        navigation.navigate('DeliveryRequestHistory')
                    }}>
                        <Ionicons name={'list'} color={themeColor0.bgColor(1)} size={24} />
                    </TouchableOpacity>
                </View>
                <View style={[NewStyles.center, { flex: 1 }]}>
                    <Text style={NewStyles.title10}>تحویل فیزیکی طلا</Text>
                </View>
                <View style={{ flex: 1 }}>

                </View>
            </View>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={'padding'}>
                {
                    tradingData?.allowed ?
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainerStyle} refreshControl={<RefreshControl colors={[themeColor1.bgColor(1)]} refreshing={refreshing} onRefresh={() => { dispatch(fetchRate(accessToken)); dispatch(fetchUser(accessToken)); }} />}>
                            <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor3.bgColor(0.2) }} />
                            <View style={[{ padding: '5%', gap: 10, backgroundColor: themeColor12.bgColor(1) }, NewStyles.border10, NewStyles.shadow]}>
                                <View style={NewStyles.rowWrapper}>
                                    <Text style={NewStyles.text10}>نرخ هر میلی گرم طلای 18 عیار</Text>
                                    <Text style={NewStyles.text10}>{formatPrice((Number(goldPrice) / 1000)?.toFixed())} تومان</Text>
                                </View>
                                <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor3.bgColor(0.2) }} />
                                <View style={NewStyles.rowWrapper}>
                                    <Text style={NewStyles.text10}>دارایی طلا</Text>
                                    <Text style={NewStyles.text10}>{formatPrice(user?.wallet?.gold_balance * 1000) || '0'} میلی گرم</Text>
                                </View>
                                <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor3.bgColor(0.2) }} />
                                <View style={NewStyles.rowWrapper}>
                                    <Text style={NewStyles.text10}>حداقل درخواست</Text>
                                    <Text style={NewStyles.text10}>5,000 میلی گرم</Text>
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
                            <Text style={[NewStyles.text10]}>مقدار بر حسب میلی گرم</Text>
                            <TextInput
                                style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
                                placeholderTextColor={themeColor10.bgColor(0.5)}
                                keyboardType={'number-pad'}
                                placeholder='مقدار بر حسب میلی گرم'
                                value={weight}
                                maxLength={5}
                                onChangeText={handleWeightChange}
                            />
                            <Text style={[NewStyles.text10]}>مقدار بر حسب تومان</Text>
                            <TextInput
                                style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]}
                                placeholderTextColor={themeColor10.bgColor(0.5)}
                                keyboardType={'number-pad'}
                                placeholder='مقدار بر حسب تومان'
                                value={price}
                                onChangeText={handlePriceChange}
                                onBlur={handlePriceBlur}
                            />
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
                                                <TouchableOpacity key={item?.id} style={[NewStyles.border10, NewStyles.shadow, NewStyles.row, { backgroundColor: themeColor4.bgColor(1), padding: 10, alignItems: 'flex-start',   }]} onPress={() => {
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