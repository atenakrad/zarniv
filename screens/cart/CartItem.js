import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { Image } from 'expo-image';

import { mainUri, uri } from '../../services/URL';
import { fetchCart } from '../../slices/cartSlice';

import NewStyles, { deviceWidth } from '../../styles/NewStyles';
import { themeColor0, themeColor5, themeColor4, themeColor12 } from '../../theme/Color';
import ImageThumbnail from '../../components/ImageThumbnail';
import { useTranslation } from 'react-i18next';
import { formatPrice, handleError, showToastOrAlert } from '../../helpers/Common';

export default function CartItem({ item, navigation }) {

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const accessToken = useSelector((state) => state?.token?.accessToken);
    const [pending, setPending] = useState(false);
    const [pending1, setPending1] = useState(false); 
    const handleIncrease = async () => {
        setPending(true);
        try {
            const response = await axios.post(item?.product_variety_id ? `${uri}/addToCart/` : `${uri}/silver/cart/add/`, item?.product_variety_id ? { productVarietyId: item?.product_variety_id } : { SilverVarietyId: item?.silver_variety_id, SilverProductId: item?.silver_product_id }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${accessToken}` } })
            if (response.status == 200) {
                dispatch(fetchCart(accessToken))
            }
        } catch (error) {  
            handleError(error, t)
        } finally {
            setPending(false);
        }
    }

    const handleDecrease = async () => {
        setPending1(true);
        try {
            const response = await axios.post(`${uri}/removeFromCart/`, { id: item?.id }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${accessToken}` } })
            if (response.status == 200) { dispatch(fetchCart(accessToken)); }
        } catch (error) {
            handleError(error, t)
        } finally {
            setPending1(false);
        }
    }


    return (
        <View style={[styles.itemWrapper, NewStyles.rowWrapper, NewStyles.shadow, NewStyles.border10]} >
            <Pressable style={[styles.imageItemWrapper, NewStyles.center]} onPress={() => {

                item?.silver_product_id ? navigation.navigate('Gem Detail', { gemId: item?.silver_product_id }) : navigation.navigate('Product Detail', { productId: item?.product_id })

            }}>
                {item?.last_image ? <Image style={styles.imageItem} source={{ uri: `${mainUri}${item?.last_image}` }} /> : <ImageThumbnail />}
            </Pressable>
            <View style={{ flex: 1, margin: 10, gap: 5, justifyContent: 'flex-start' }}>
                <View style={NewStyles.rowWrapper}>
                    <Text style={[NewStyles.text10, { flex: 1 }]} numberOfLines={1}>{item?.product_name}</Text>
                    {
                        item?.labels?.length > 0 &&
                        <View style={{}}>
                            {
                                item?.labels?.map(label => {
                                    return (
                                        <View key={label?.id} style={[{ backgroundColor: label?.color_code, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-end', }, NewStyles.border100]}>
                                            <Text style={[NewStyles.title4, { fontSize: 11 }]}>{label?.title}</Text>
                                        </View>
                                    )
                                })
                            }
                        </View>
                    }
                </View>
                {item?.original_price > item?.unit_price ?
                    <View>
                        <Text style={NewStyles.title10}>{formatPrice((item?.unit_price * item?.quantity).toFixed())} {t('currency unit')}</Text>
                        <View style={[NewStyles.row, { gap: 5 }]}>
                            <Text style={[NewStyles.discountText, NewStyles.text10]}>{formatPrice((item?.original_price * item?.quantity).toFixed())} {t('currency unit')}</Text>
                        </View>
                    </View>
                    :
                    <Text style={NewStyles.title10}>{formatPrice((item?.unit_price * item?.quantity).toFixed())} {t('currency unit')}</Text>
                }
                <View style={NewStyles.rowWrapper}>
                    <View style={[NewStyles.rowWrapper, { width: 90 }]}>
                        <Pressable style={[styles.add, NewStyles.border10]} onPress={handleIncrease} disabled={item?.quantity == item?.stock || pending}>
                            {!pending && <Ionicons name='add' size={20} color={themeColor5.bgColor(1)} />}
                            {pending && <ActivityIndicator color={themeColor4.bgColor(1)} size='small' />}
                        </Pressable>
                        <Text style={NewStyles.text10}>{item?.quantity}</Text>
                        <Pressable style={[styles.remove, NewStyles.border10]} onPress={handleDecrease} disabled={item?.quantity == 0 || pending1}>
                            {!pending1 && <Ionicons name='remove' size={20} color={themeColor0.bgColor(1)} />}
                            {pending1 && <ActivityIndicator color={themeColor0.bgColor(1)} size='small' />}
                        </Pressable>
                    </View>

                </View>
                {item?.product_variety && <View style={[styles.filterItem, NewStyles.border100]} >
                    <Text style={[NewStyles.text10, { fontSize: 12 }]}>{item?.product_variety} - {item?.product_gram} گرم</Text>
                </View>}

            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    itemWrapper: {
        width: deviceWidth * 0.95,
        backgroundColor: themeColor4.bgColor(1),
        padding: 10,
        marginTop: 10
    },
    imageItemWrapper: {
        height: deviceWidth * 0.25,
        width: deviceWidth * 0.25,
    },
    imageItem: {
        height: '100%',
        width: '100%',
    },
    filterItem: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        padding: 10,
        marginHorizontal: 2,
        borderWidth: 0.5,
        borderColor: themeColor0.bgColor(1),
        backgroundColor: themeColor0.bgColor(1),
        alignSelf: 'flex-end'
    },
    add: {
        padding: 5,
        backgroundColor: themeColor0.bgColor(1),
    },
    remove: {
        padding: 5,
        borderColor: themeColor0.bgColor(1),
        borderWidth: 1,
    },
});