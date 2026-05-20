import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, ImageBackground, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, ToastAndroid, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useVideoPlayer, VideoView } from 'expo-video';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';

import { imageUri, mainUri, uri } from '../../services/URL';
import { fetchCart, selectCartItemById } from '../../slices/cartSlice';
import { themeColor0, themeColor1, themeColor10, themeColor12, themeColor3, themeColor4, themeColor6 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import Loader from '../../components/Loader';
import Button from '../../components/Button';
import Varieties from '../../components/Varieties';
import LoginModal from '../auth/LoginModal';
import NewStyles, { deviceWidth } from '../../styles/NewStyles';
import { cleanText, formatPrice, handleError, showToastOrAlert } from '../../helpers/Common';
import { setLastScreen, setParams } from '../../slices/lastScreenSlice';

export default function ProductDetail({ route, navigation }) {
    const { t } = useTranslation();

    const dispatch = useDispatch();
    const accessToken = useSelector((state) => state?.token?.accessToken);
    const [productId, setProductId] = useState(route?.params?.productId);

    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const fetchData = async () => {
        try {
            const response = await axios.post(`${uri}/product/detail/`, { productId: productId }) 
            setData(response.data);
        } catch (error) {
            handleError(error, t)
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const videoItem = data?.gallery?.find(item => item?.type == 'video');
    const videoPath = videoItem ? { uri: `${imageUri}/${videoItem?.file_path}` } : null;
    const player = useVideoPlayer(videoPath);

    const [loginModal, setLoginModal] = useState(false);

    const isUserLoggedIn = () => {
        if (accessToken) {
            return true;
        } else {
            setLoginModal(true);
            return false;
        }
    }

    const [activeVariety, setActiveVariety] = useState(0);
    const [currentImage, setCurrentImage] = useState(0);

    const productVarietyId = data?.product_varieties?.[activeVariety]?.id;

    const cartItem = useSelector(state => selectCartItemById(state, data?.seller_id, productVarietyId));
    const quantity = cartItem ? cartItem?.quantity : 0;

    const price = data?.product_varieties?.[activeVariety]?.get_old_price?.toFixed();
    const discountedPrice = data?.product_varieties?.[activeVariety]?.get_final_price?.toFixed();
    const discountedPercent = data?.product_varieties?.[activeVariety]?.discount_percent;

    const [pending, setPending] = useState(false);
    const handleIncrease = async () => {
        setPending(true);

        try {
            const response = await axios.post(`${uri}/addToCart/`, { productVarietyId: productVarietyId }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${accessToken}` } })
            if (response.status == 200) {
                dispatch(fetchCart(accessToken));
            }
        } catch (error) { 
            const message = error?.response ? (error?.response?.status ? error?.response?.data?.message : t('An unexpected error occurred!')) : t('Network error!');
            showToastOrAlert(message);
        } finally {
            setPending(false);
        }
    }

    const [pending1, setPending1] = useState(false);
    const handleDecrease = async () => {
        setPending1(true);
        try {
            const response = await axios.post(`${uri}/removeFromCart/`, { id: cartItem?.id }, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${accessToken}` } })
            if (response.status == 200) { dispatch(fetchCart(accessToken)); }
        } catch (error) {
            const message = error?.response ? (error?.response?.status ? error?.response?.data?.message : t('An unexpected error occurred!')) : t('Network error!');
            showToastOrAlert(message);
        } finally {
            setPending1(false);
        }
    } 

    return (
        <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={NewStyles.container}>
            <CustomStatusBar />
            {loading && <Loader />}
            <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl colors={[themeColor1.bgColor(1)]} refreshing={refreshing} onRefresh={() => { fetchData() }} />}>
                <ImageBackground style={{ width: '100%', aspectRatio: 1, justifyContent:'flex-end'}} source={{ uri: `${mainUri}${data?.product_galleries?.[currentImage]?.file_name}` }} >
                    {
                        data?.labels?.length > 0 &&
                        <View style={[{padding:20, gap:10, flexWrap:'wrap'}, NewStyles.row]}>
                            {
                                data?.labels?.map(label => {
                                    return (
                                        <View key={label?.id} style={[{ backgroundColor: label?.color_code, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-end', }, NewStyles.border100, NewStyles.shadow]}>
                                            <Text style={[NewStyles.title4,]}>{label?.title}</Text>
                                        </View>
                                    )
                                })
                            }
                        </View>
                    }
                </ImageBackground>
                <FlatList
                    contentContainerStyle={styles.contentContainerStyle}
                    horizontal inverted
                    showsHorizontalScrollIndicator={false}
                    data={data?.product_galleries}
                    keyExtractor={(item) => item?.id?.toString()}
                    renderItem={({ item, index }) =>
                        <Pressable onPress={() => setCurrentImage(index)}>
                            <Image style={{ width: deviceWidth * 0.2, height: deviceWidth * 0.2 }} source={{ uri: `${mainUri}${item?.file_name}` }} />
                        </Pressable>
                    }
                />
                {data?.product_varieties?.[activeVariety]?.stock == 0 &&
                    <View style={[NewStyles.border10, styles.unavailable]}>
                        <Text style={NewStyles.text10}>{t('َUnavailable')}</Text>
                    </View>}
                <View style={styles.wrapper}>
                    <Text style={NewStyles.text10}>{data?.brand?.name} - {data?.collection?.name}</Text>
                    <Text style={NewStyles.title10}>{data?.name} - {data?.code}</Text>
                    <View style={[NewStyles.row, { gap: 10 }]}>
                        <Ionicons name="menu-outline" size={18} color={themeColor10.bgColor(1)} />
                        <Text style={NewStyles.text10}>{data?.category?.name} - {data?.karat} عیار</Text>
                    </View>
                    <Varieties data={data?.product_varieties} activeVariety={activeVariety} setActiveVariety={setActiveVariety} />
                    <View style={[NewStyles.row, { gap: 10 }]}>
                        <Ionicons name="ellipse" size={10} color={themeColor10.bgColor(1)} />
                        <Text style={NewStyles.text10}>مناسب برای {data?.usage} / {data?.gender}</Text>
                    </View>
                    {data?.category?.show_wage && <View style={[NewStyles.row, { gap: 10 }]}>
                        <Ionicons name="ellipse" size={10} color={themeColor10.bgColor(1)} />
                        <Text style={NewStyles.text10}>اجرت: {data?.product_varieties?.[activeVariety]?.wage}%</Text>
                    </View>}
                    {data?.category?.show_tax && <View style={[NewStyles.row, { gap: 10 }]}>
                        <Ionicons name="ellipse" size={10} color={themeColor10.bgColor(1)} />
                        <Text style={NewStyles.text10}>مالیات: {data?.tax?.percent}%</Text>
                    </View>}
                    {data?.category?.show_profit && <View style={[NewStyles.row, { gap: 10 }]}>
                        <Ionicons name="ellipse" size={10} color={themeColor10.bgColor(1)} />
                        <Text style={NewStyles.text10}>سود: {data?.product_varieties?.[activeVariety]?.profit}%</Text>
                    </View>}
                    <Text style={NewStyles.text10}>{cleanText(data?.short_description)}</Text>
                    {videoPath && <VideoView style={{ aspectRatio: 1 }} player={player} contentFit='cover' allowsFullscreen allowsPictureInPicture />}
                    <Text style={NewStyles.text10}>{cleanText(data?.description)}</Text>
                </View>
            </ScrollView>
            <View style={[NewStyles.row, styles.box2]}>
                <View style={{ flex: 2 }}>
                    {discountedPrice < price ?
                        <>
                            <View style={NewStyles.row}>
                                <Text style={[NewStyles.discountText, NewStyles.text10]}>{formatPrice(price)} {t('currency unit')}</Text>
                                <Text style={[NewStyles.title, NewStyles.border10, styles.percentage]}>{discountedPercent} %</Text>
                            </View>
                            <Text style={NewStyles.text10}>{t('Price')}: {formatPrice(discountedPrice)} {t('currency unit')}</Text>
                        </>
                        :
                        <Text style={NewStyles.text10}>{t('Price')}: {formatPrice(price)} {t('currency unit')}</Text>
                    }
                </View>
                <View style={{ flex: 2 }}>
                    {quantity == 0 ?
                        <Button title={t('Add To Cart')} loading={pending} disabled={pending} onPress={() => { if (isUserLoggedIn()) { handleIncrease() } else { navigation.navigate('MainLayout', { screen: 'Account' }); dispatch(setLastScreen('Product Detail')); dispatch(setParams(route?.params)) } }} />
                        :
                        <View style={NewStyles.rowWrapper}>
                            <Pressable style={[styles.remove, NewStyles.border5]} onPress={() => { navigation.navigate('MainLayout', { screen: 'Cart' }) }} >
                                {<Ionicons name={"cart"} size={20} color={themeColor0.bgColor(1)} />}
                            </Pressable>
                            <Pressable style={[styles.add, NewStyles.border5]} onPress={handleIncrease} disabled={quantity == data?.stock || pending}>
                                {!pending && <Ionicons name='add' size={20} color={themeColor10.bgColor(1)} />}
                                {pending && <ActivityIndicator color={themeColor10.bgColor(1)} size={20} />}
                            </Pressable>
                            <Text style={NewStyles.title10}>{quantity}</Text>
                            <Pressable style={[styles.remove, NewStyles.border5]} onPress={handleDecrease} disabled={quantity == 0 || pending1}>
                                {!pending1 && <Ionicons name='remove' size={20} color={themeColor10.bgColor(1)} />}
                                {pending1 && <ActivityIndicator color={themeColor10.bgColor(1)} size={20} />}
                            </Pressable>
                        </View>
                    }
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        paddingVertical: 20,
        paddingHorizontal: '5%',
        gap: 20,
    },
    unavailable: {
        backgroundColor: themeColor6.bgColor(1),
        position: 'absolute',
        padding: 5,
        top: 35,
        left: 20
    },
    percentage: {
        backgroundColor: themeColor3.bgColor(0.2),
        padding: 5,
        marginHorizontal: 10,
    },
    box: {
        backgroundColor: themeColor3.bgColor(0.5),
        paddingHorizontal: '5%'
    },
    box2: {
        height: 100,
        paddingHorizontal: '5%',
        backgroundColor: themeColor12.bgColor(1)
    },
    add: {
        padding: 5,
        backgroundColor: themeColor0.bgColor(1),
    },
    remove: {
        padding: 5,
        borderWidth: StyleSheet.hairlineWidth * 3,
        borderColor: themeColor0.bgColor(1),
    },
})