import { FlatList, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';

import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor10, themeColor3, themeColor4, themeColor6 } from '../../theme/Color';
import Button from '../../components/Button';
import { setAddress, setCity, setDescription, setFullName, setNumber, setPackage, setPackagePrice, setPhone, setPostalcode, setShippingMethod, setUnit } from '../../slices/addressSlice';
import { formatPrice, showToastOrAlert } from '../../helpers/Common';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchShippingMethods } from '../../slices/shippingSlice';
import { Ionicons } from '@expo/vector-icons';
import PaymentModal from '../../components/PaymentModal';
import Loader from '../../components/Loader';
import { fetchInfoPrice } from '../../slices/goldInfoSlice';
import { fetchInformation } from '../../slices/informationSlice';
import InformationModal from '../../components/InformationModal';
import { fetchPackaging } from '../../slices/packagingSlice';

export default function Address({ navigation }) {

    const { t } = useTranslation();
    const shippingMethods = useSelector(state => state?.shipping?.data);
    const packaging = useSelector(state => state?.packaging?.data);
    const cartItems = useSelector(state => state?.cart?.items);
    const allFreeDelivery = cartItems?.every(cart =>
        cart.labels?.some(label => label.label_type === "free_delivery")
    );

    const infoModal = useSelector(state => state?.info?.data);

    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const [visible, setVisible] = useState(false)
    const [paymentModal, setPaymentModal] = useState(false);
    const address = useSelector(state => state?.address);
    useEffect(() => {
        dispatch(fetchShippingMethods());
        dispatch(fetchPackaging());
        dispatch(fetchInfoPrice({}))
    }, [])
    const validatePhone = (phone) => {
        if (phone.match(/^09\d{9}$/)) {
            return true;
        } else {
            return false;
        }
    };
    useEffect(() => {
        dispatch(fetchInformation())
    }, [])
    useEffect(() => {
        if (infoModal) {
            setVisible(true)
        }
    }, [infoModal])

    if (loading) {
        return (
            <Loader />
        )
    }

    return (
        <SafeAreaView style={NewStyles.container}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={'padding'}>
                <ScrollView showsVerticalScrollIndicator={false}>

                    <View style={styles.contentContainerStyle}>
                        <View style={NewStyles.rowWrapper}>
                            <View style={{ flex: 1, alignItems: 'flex-end' }} >
                                <TouchableOpacity style={[NewStyles.rowWrapper, { paddingHorizontal: 10, backgroundColor: themeColor6.bgColor(0.1), gap: 5 }, NewStyles.border100, NewStyles.center]} onPress={() => {
                                    setVisible(true)
                                }}>
                                    <Ionicons
                                        name={'information-circle-outline'}
                                        size={20}
                                        color={themeColor6.bgColor(1)}
                                    />
                                    <Text style={NewStyles.title6}>راهنما</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={[{ flex: 1 }, NewStyles.center]}>
                                <Text style={NewStyles.heading10}>ثبت آدرس</Text>
                            </View>
                            <View style={[{ flex: 1, alignItems: 'flex-start' },]}>
                                <TouchableOpacity style={{ padding: 10 }} onPress={() => { navigation.navigate('MainLayout', { screen: 'Shop' }) }}>
                                    <Ionicons name={'storefront'} size={20} color={themeColor0.bgColor(1)} />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor3.bgColor(0.2) }} />

                        <View style={[NewStyles.rowWrapper, { gap: 5 }]}>
                            <View style={{ flex: 1, gap: 5 }}>
                                <Text style={NewStyles.text}>تحویل گیرنده <Text style={NewStyles.title6}>*</Text></Text>
                                <TextInput style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]} maxLength={20} keyboardType='default' placeholderTextColor={themeColor10.bgColor(1)} placeholder={'تحویل گیرنده'} value={address?.full_name} onChangeText={(text) => { dispatch(setFullName(text)) }} />
                            </View>
                            <View style={{ flex: 1, gap: 5 }}>
                                <Text style={NewStyles.text}>شماره موبایل <Text style={NewStyles.title6}>*</Text></Text>
                                <TextInput style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]} maxLength={11} keyboardType={Platform?.OS == 'ios' ? 'numbers-and-punctuation' : 'number-pad'} placeholderTextColor={themeColor10.bgColor(1)} placeholder={'شماره موبایل'} value={address?.phone} onChangeText={(text) => { dispatch(setPhone(text)) }} />
                            </View>
                        </View>
                        <View style={[NewStyles.rowWrapper, { gap: 5 }]}>
                            <View style={{ flex: 1, gap: 5 }}>
                                <Text style={NewStyles.text}>شهر <Text style={NewStyles.title6}>*</Text></Text>
                                <TextInput style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]} maxLength={15} keyboardType='default' placeholderTextColor={themeColor10.bgColor(1)} placeholder={'شهر'} value={address?.city} onChangeText={(text) => { dispatch(setCity(text)) }} />
                            </View>
                            <View style={{ flex: 1, gap: 5 }}>
                                <Text style={NewStyles.text}>کد پستی <Text style={NewStyles.title6}>*</Text></Text>
                                <TextInput style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]} maxLength={10} keyboardType={Platform?.OS == 'ios' ? 'numbers-and-punctuation' : 'number-pad'} placeholderTextColor={themeColor10.bgColor(1)} placeholder={'کد پستی'} value={address?.postalcode} onChangeText={(text) => { dispatch(setPostalcode(text)) }} />
                            </View>
                        </View>
                        <View style={[NewStyles.rowWrapper, { gap: 5 }]}>
                            <View style={{ flex: 1, gap: 5 }}>
                                <Text style={NewStyles.text}>آدرس پستی <Text style={NewStyles.title6}>*</Text></Text>
                                <TextInput style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]} maxLength={70} multiline keyboardType='default' placeholderTextColor={themeColor10.bgColor(1)} placeholder={'آدرس پستی'} value={address?.address} onChangeText={(text) => { dispatch(setAddress(text)) }} />
                            </View>
                        </View>
                        <View style={[NewStyles.rowWrapper, { gap: 5 }]}>
                            <View style={{ flex: 1, gap: 5 }}>
                                <Text style={NewStyles.text}>پلاک <Text style={NewStyles.title6}>*</Text></Text>
                                <TextInput style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]} maxLength={15} keyboardType={Platform?.OS == 'ios' ? 'numbers-and-punctuation' : 'number-pad'} placeholderTextColor={themeColor10.bgColor(1)} placeholder={'پلاک'} value={address?.number} onChangeText={(text) => { dispatch(setNumber(text)) }} />
                            </View>
                            <View style={{ flex: 1, gap: 5 }}>
                                <Text style={NewStyles.text}>واحد <Text style={NewStyles.title6}>*</Text></Text>
                                <TextInput style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]} maxLength={15} keyboardType={Platform?.OS == 'ios' ? 'numbers-and-punctuation' : 'number-pad'} placeholderTextColor={themeColor10.bgColor(1)} placeholder={'واحد'} value={address?.unit} onChangeText={(text) => { dispatch(setUnit(text)) }} />
                            </View>
                        </View>
                        <View style={[NewStyles.rowWrapper, { gap: 5 }]}>
                            <View style={{ flex: 1, gap: 5 }}>
                                <Text style={NewStyles.text}>توضیحات</Text>
                                <TextInput style={[NewStyles.textInput, NewStyles.text10, NewStyles.border10]} maxLength={100} multiline keyboardType='default' placeholderTextColor={themeColor10.bgColor(1)} placeholder={'توضیحات'} value={address?.description} onChangeText={(text) => { dispatch(setDescription(text)) }} />
                            </View>
                        </View>

                        <View>
                            <FlatList
                                data={shippingMethods}
                                scrollEnabled={false}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ gap: 10, paddingTop: 15 }}
                                ListHeaderComponent={() => {
                                    return (
                                        <Text style={NewStyles.text}>روش ارسال</Text>
                                    )
                                }}
                                renderItem={({ item }) => {

                                    return (
                                        <TouchableOpacity style={NewStyles.rowWrapper} onPress={() => {
                                            dispatch(setShippingMethod({ seller_id: 1, send_method_id: item?.id, price: item?.price }))
                                        }}>
                                            <Text style={NewStyles.text10}>{item?.name} - {allFreeDelivery ? 'رایگان' : `${formatPrice(item?.price)} تومان`} </Text>
                                            {
                                                address?.shippingMethods?.[1]?.methodId == item?.id ? { backgroundColor: themeColor0.bgColor(1) } &&
                                                    <Ionicons
                                                        name={'checkbox'}
                                                        color={themeColor0.bgColor(1)}
                                                        size={30}
                                                    />
                                                    :

                                                    <Ionicons
                                                        name={'square-outline'}
                                                        color={themeColor0.bgColor(1)}
                                                        size={30}
                                                    />
                                            }
                                        </TouchableOpacity>
                                    )
                                }}
                            />
                        </View>
                        <View>
                            <FlatList
                                data={packaging}
                                scrollEnabled={false}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ gap: 10, paddingTop: 15 }}
                                ListHeaderComponent={() => {
                                    return (
                                        <Text style={NewStyles.text}>بسته بندی</Text>
                                    )
                                }}
                                renderItem={({ item }) => {
                                    return (
                                        <TouchableOpacity style={NewStyles.rowWrapper} onPress={() => {
                                            dispatch(setPackage(item?.id))
                                            dispatch(setPackagePrice(item?.price))
                                        }}>
                                            <View style={{ flex: 1, paddingLeft: 10 }}>
                                                <Text style={NewStyles.text10}>{item?.title} - {formatPrice(item?.price)} تومان</Text>
                                                {
                                                    item?.description && <Text style={[NewStyles.text3, { textAlign: 'justify', direction: 'rtl' }]}>{item?.description}</Text>
                                                }
                                            </View>
                                            {
                                                address?.package == item?.id ? { backgroundColor: themeColor0.bgColor(1) } &&
                                                    <Ionicons
                                                        name={'checkbox'}
                                                        color={themeColor0.bgColor(1)}
                                                        size={30}
                                                    />
                                                    :

                                                    <Ionicons
                                                        name={'square-outline'}
                                                        color={themeColor0.bgColor(1)}
                                                        size={30}
                                                    />
                                            }
                                        </TouchableOpacity>
                                    )
                                }}
                            />
                        </View>


                        <PaymentModal paymentModal={paymentModal} setPaymentModal={setPaymentModal} title={'روش پرداخت'} message={'روش پرداخت خود را انتخاب کنید.'} setLoading={setLoading} navigation={navigation} />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
            <View>
                <InformationModal
                    visible={visible}
                    setVisible={setVisible}
                    title={infoModal?.title}
                    text={infoModal?.text}
                    important_note={infoModal?.important_note}
                />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    contentContainerStyle: {
        paddingHorizontal: '5%',
        paddingVertical: '5%',
        gap: 10,
    },
    field: {
        flexDirection: 'row-reverse',
        alignItems: 'center'
    }
});