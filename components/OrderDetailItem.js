import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Image } from 'expo-image';

import { mainUri } from '../services/URL';

import NewStyles, { deviceWidth } from '../styles/NewStyles';
import { themeColor0, themeColor6, themeColor7, themeColor5, themeColor11 } from '../theme/Color';
import ImageThumbnail from '../components/ImageThumbnail';
import { formatPrice } from '../helpers/Common';

export default function OrderDetailItem({ item }) {

    const handleColor = (status, opacity) => {
        if (status == 0) { return themeColor11.bgColor(opacity) }
        else if (status == 1) { return themeColor7.bgColor(opacity) }
        else if (status == 2) { return themeColor7.bgColor(opacity) }
        else if (status == 3) { return themeColor6.bgColor(opacity) }
        else if (status == 4) { return themeColor7.bgColor(opacity) }
    }

    const handleStatus = (status) => {
        if (status == 0) { return 'در دست بررسی' }
        else if (status == 1) { return 'ارسال شده' }
        else if (status == 2) { return 'تحویل داده شده' }
        else if (status == 3) { return 'لغو شده' }
        else if (status == 4) { return 'تکمیل شده' }
    }

    const { t } = useTranslation();
    const image = item?.last_image;

    return (
        <View style={[styles.wrapper, NewStyles.shadow]}>
            <View style={[NewStyles.rowWrapper,]} >
                <View style={[styles.imageItemWrapper]}>
                    {image ? <Image style={styles.imageItem} source={{ uri: `${mainUri}${image}` }} /> : <ImageThumbnail />}
                </View>
                <View style={{ flex: 1, marginVertical: 10, gap: 5, justifyContent: 'flex-end', marginRight: 10 }}>
                    <View style={[NewStyles.rowWrapper, {}]}>
                        <Text style={[NewStyles.title10, { flex: 1, marginLeft:10 }]} numberOfLines={1}>{item?.product_name}</Text>
                        <View style={[{ backgroundColor: handleColor(item?.status, 0.1), paddingVertical: 5, paddingHorizontal:10 }, NewStyles.border100]}>
                            <Text style={[NewStyles.text4, {color: handleColor(item?.status, 1), fontSize:12}]}>{handleStatus(item?.status)}</Text>
                        </View>
                    </View> 
                    <Text style={NewStyles.text10} numberOfLines={1}>تعداد: {item?.quantity} عدد</Text>
                    <Text style={NewStyles.text10}>{formatPrice((Number(item?.price) * Number(item?.quantity)).toFixed())} {t('currency unit')}</Text>
                    {item?.product_variety_id && <View style={[styles.filterItem, NewStyles.center, NewStyles.border100, item?.variety_detail?.color_code && { backgroundColor: item?.variety_detail?.color_code, borderColor: item?.variety_detail?.color_code }]} >
                        <Text style={NewStyles.text4}>{item?.product_variety?.variety_detail?.name}</Text>
                    </View>}
                    {item?.silver_variety_id && <View style={[styles.filterItem, NewStyles.center, NewStyles.border100, item?.variety_detail?.color_code && { backgroundColor: item?.variety_detail?.color_code, borderColor: item?.variety_detail?.color_code }]} >
                        <Text style={NewStyles.text4}>{item?.silver_product_variety?.title} - {item?.silver_product_variety?.gram} گرم</Text>
                    </View>}
                </View>
            </View>
            {item?.cancel_reason &&
                <View>
                    <Text style={[NewStyles.text10, { marginTop: 5 }]}>علت رد:</Text>
                    <Text style={[NewStyles.text10, { marginTop: 5 }]}>{item?.cancel_reason}</Text>
                </View>
            }
            
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        width: deviceWidth,
        backgroundColor: themeColor5.bgColor(1),
        padding: '5%'
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
        paddingHorizontal: 10,
        padding: 5,
        borderWidth: 0.5,
        borderColor: themeColor0.bgColor(1),
        backgroundColor: themeColor0.bgColor(1),
    },
});