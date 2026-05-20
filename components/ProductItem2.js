import { Text, Pressable, View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Image } from 'expo-image';

import { mainUri } from '../services/URL';

import NewStyles, { deviceWidth } from '../styles/NewStyles';
import { themeColor5 } from '../theme/Color';
import ImageThumbnail from './ImageThumbnail';
import { formatPrice } from '../helpers/Common';

export default function ProductItem2({ item, navigation }) {

    const { t } = useTranslation();
    const image = item?.product_galleries?.[0];
    const price = item?.product_varieties?.[0]?.get_old_price?.toFixed();
    const discountedPrice = item?.product_varieties?.[0]?.get_final_price?.toFixed();
    const discountedPercent = item?.product_varieties?.[0]?.discount_percent;


    return (
        <Pressable style={[styles.contentWrapper, NewStyles.row, NewStyles.shadow, NewStyles.border5]} onPress={() => navigation.navigate('Product Detail', { productId: item?.id })}>
            {image ? <Image style={styles.content} source={{ uri: `${mainUri}${image?.file_name}` }} contentFit='cover' /> : <ImageThumbnail height={200} />}
            <View style={{ justifyContent: 'space-evenly', paddingHorizontal: 15, paddingVertical: 20, flex: 1 }}>
                <Text style={NewStyles.title10} numberOfLines={1}>{item?.name}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                    {discountedPrice < price ?
                        <View>
                            <Text style={NewStyles.text10}>{formatPrice(discountedPrice)} {t('currency unit')}</Text>
                            <View style={[NewStyles.row, { gap: 5 }]}>
                                <Text style={[NewStyles.discountText, NewStyles.text10]}>{formatPrice(price)} {t('currency unit')}</Text>
                                <Text style={NewStyles.title}>{Number(discountedPercent)?.toFixed(0)} %</Text>
                            </View>
                        </View>
                        :
                        <Text style={NewStyles.text10}>{formatPrice(discountedPrice)} {t('currency unit')}</Text>
                    }
                </View>
                {
                    item?.labels?.length > 0 &&
                    <View style={{ gap:5 }}>
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
        </Pressable>
    )
}

const styles = StyleSheet.create({
    contentWrapper: {
        marginBottom: 2,
        backgroundColor: themeColor5.bgColor(1),
    },
    content: {
        height: deviceWidth * 0.3,
        aspectRatio: 1
    },
})