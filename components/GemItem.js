import { Text, Pressable, View, StyleSheet, Image } from 'react-native';
import { useTranslation } from 'react-i18next';

import { mainUri } from '../services/URL';

import NewStyles, { deviceWidth } from '../styles/NewStyles';
import { themeColor0, themeColor4 } from '../theme/Color';
import ImageThumbnail from './ImageThumbnail';
import { formatPrice } from '../helpers/Common';

export default function GemItem({ item, index, columns, navigation, width }) {

    const { t } = useTranslation();
    const isLastInRow = () => {
        return (index + 1) % columns === 0;
    }

    const image = item?.gallery?.[0];
    const price = Number(item?.old_price)?.toFixed(0);
    const discountedPrice = Number(item?.old_price)?.toFixed(0) - Number(item?.old_price)?.toFixed(0) * item?.discount_percent / 100;
    const discountedPercent = item?.discount_percent; 
    return (
        <Pressable style={[styles.contentWrapper, NewStyles.border5]} onPress={() => navigation.navigate('Gem Detail', { gemId: item?.id })}>
            <View style={{ height: 170, width: '100%' }}>
                {image ? <Image style={styles.content} source={{ uri: `${mainUri}${image?.file_name || image?.image}` }} /> : <ImageThumbnail height={200} />}
            </View>
            <View style={{ justifyContent: 'space-evenly', paddingHorizontal: 15, paddingVertical: 20 }}>
                <Text style={NewStyles.title10} numberOfLines={1}>{item?.name}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                    {discountedPrice < price ?
                        <View>
                            <Text style={NewStyles.title10}>{formatPrice(Number(discountedPrice)?.toFixed(0))} {t('currency unit')}</Text>
                            <View style={[NewStyles.row, { gap: 5, flexWrap: 'nowrap' }]}>
                                <Text style={[NewStyles.discountText, NewStyles.text10]}>{formatPrice(price)}</Text>
                                <Text style={NewStyles.title}>{Number(discountedPercent)?.toFixed()} %</Text>
                            </View>
                        </View>
                        :
                        <Text style={NewStyles.text10}>{formatPrice(price)} {t('currency unit')}</Text>
                    }
                </View>
            </View>
            {
                item?.labels?.length > 0 &&
                <View style={{paddingHorizontal:10, paddingBottom:10, gap:5}}>
                    {
                        item?.labels?.map(label => {
                            return (
                                <View key={label?.id} style={[{ backgroundColor: label?.color_code, paddingHorizontal: 8, paddingVertical: 4 , alignSelf:'flex-end', }, NewStyles.border100]}>
                                    <Text style={[NewStyles.title4, { fontSize: 11 }]}>{label?.title}</Text>
                                </View>
                            )
                        })
                    }
                </View>
            }
        </Pressable>
    )
}

const styles = StyleSheet.create({
    contentWrapper: {
        width: deviceWidth * 0.45,
        backgroundColor: themeColor0.bgColor(0.05),
    },
    content: {
        height: deviceWidth * 0.45,
        width: '100%',
        resizeMode: 'cover'
    },
})