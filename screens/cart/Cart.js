import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import BouncyCheckbox from "react-native-bouncy-checkbox";

import NewStyles, { deviceHeight, deviceWidth } from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor12, themeColor3, themeColor5 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import Loader from '../../components/Loader';
import BlankScreen from '../../components/BlankScreen';
import CartItem from './CartItem';
import Button from '../../components/Button';
import LoginModal from '../auth/LoginModal';
import { formatPrice } from '../../helpers/Common';
import { fetchCart } from '../../slices/cartSlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchTradingAllowed } from '../../slices/tradingAllowed';
import VoteTimerDisplay from '../../components/VoteTimerDisplay';
import { fetchInformation } from '../../slices/informationSlice';

export default function Cart({ navigation }) {

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const accessToken = useSelector((state) => state?.token?.accessToken);
    const trading = useSelector((state) => state?.trading)
    const tradingData = trading?.data
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        dispatch(fetchCart(accessToken));
        dispatch(fetchTradingAllowed())
    };

    useFocusEffect(
        useCallback(() => {
            if (accessToken) {
                fetchData();
            }
        }, [accessToken]),
    );




    const cart = useSelector(state => state?.cart);
    const totalPrice = useSelector(state => state.cart?.totalPrice);
    const totalDiscountedPrice = useSelector(state => state.cart?.totalDiscountedPrice);

    return (
        <SafeAreaView style={NewStyles.container} mode='padding' edges={{ top: 'off', bottom: 'off' }}>
            <CustomStatusBar />
            {loading && <Loader />}
            {
                tradingData?.allowed ?

                    <FlatList
                        contentContainerStyle={[styles.contentContainerStyle, NewStyles.center]}
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl colors={[themeColor0.bgColor(1)]} refreshing={refreshing} onRefresh={() => { fetchData() }} />}
                        ListEmptyComponent={<BlankScreen />}
                        data={cart?.items}
                        keyExtractor={(item) => item?.id?.toString()}
                        renderItem={({ item }) => { 
                            return (
                                // <>
                                //     <View style={{ paddingBottom: 10 }}>
                                //         <Text style={NewStyles.title10}>فروشگاه {item?.seller?.shop_name}</Text>
                                //     </View>
                                //     <FlatList
                                //     contentContainerStyle={[styles.contentContainerStyle, NewStyles.center]}
                                //     showsVerticalScrollIndicator={false}
                                //     refreshControl={<RefreshControl colors={[themeColor0.bgColor(1)]} refreshing={refreshing} onRefresh={() => { fetchData() }} />}
                                //     ListEmptyComponent={<BlankScreen />}
                                //     data={item?.items}
                                //     keyExtractor={(item) => item?.id?.toString()}
                                //     renderItem={({ item }) =>
                                //         <CartItem item={item} navigation={navigation} />
                                //     }
                                // />

                                // </>
                                <CartItem item={item} navigation={navigation} />
                            )
                        }
                        }
                    />
                    :
                    <ScrollView
                        style={{ flex: 1 }}
                        contentContainerStyle={[{ flex: 1, paddingBottom: 100 }, NewStyles.center]}
                        refreshControl={<RefreshControl colors={[themeColor0.bgColor(1)]} refreshing={trading?.loading} onRefresh={() => { dispatch(fetchTradingAllowed()) }} />}
                    >
                        <VoteTimerDisplay
                            competitionStartAt={tradingData?.start}
                            durationMinutes={null}
                            nowDate={tradingData?.now}
                            title={'تا باز شدن خرید'}
                            initialRemainingSeconds={tradingData?.remaining_seconds}
                            onTimeExpired={() => {
                                dispatch(fetchTradingAllowed())
                                if (accessToken) {
                                    dispatch(fetchCart(accessToken))
                                }
                            }}
                        />
                    </ScrollView>
            }
            {(tradingData?.allowed && cart?.items?.length > 0) &&
                <View style={[styles.footerWrapper, NewStyles.shadow]} >
                    <View style={[NewStyles.rowWrapper, { marginVertical: 5 }]}>
                        <Text style={NewStyles.text10}>{t('Order Total')}</Text>
                        <View style={{ flexDirection: 'row' }}>
                            {totalDiscountedPrice < totalPrice ?
                                <>
                                    <Text style={NewStyles.discountText}>{formatPrice(totalPrice.toFixed())} {t('currency unit')}</Text>
                                    <Text style={NewStyles.text10}> - </Text>
                                    <Text style={NewStyles.text10}>{formatPrice(totalDiscountedPrice.toFixed())} {t('currency unit')}</Text>
                                </>
                                :
                                <Text style={NewStyles.text10}>{formatPrice(totalPrice.toFixed())} {t('currency unit')}</Text>
                            }
                        </View>
                    </View>
                    <View style={[NewStyles.rowWrapper, { marginVertical: 5 }]}>
                        <Text style={NewStyles.text10}>{t('Discount Price')}</Text>
                        <Text style={NewStyles.text10}>{formatPrice((totalPrice - totalDiscountedPrice).toFixed())} {t('currency unit')}</Text>
                    </View>
                    <View style={[NewStyles.rowWrapper, { marginVertical: 5 }]}>
                        <Text style={NewStyles.text10}>{t('Total')}</Text>
                        <Text style={NewStyles.text10}>{totalDiscountedPrice < totalPrice ? formatPrice(totalDiscountedPrice.toFixed()) : formatPrice(totalPrice.toFixed())} {t('currency unit')}</Text>
                    </View>

                    <View style={[{ gap: 10 }]}>

                        <Button title={`${t('Complete Order')}`}
                            onPress={() => {
                                if (!accessToken) {
                                    navigation.navigate('MainLayout', { screen: 'Account' })
                                } else {
                                    navigation.navigate('Address')
                                }

                            }}
                        />
                    </View>
                </View>
            }
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    contentContainerStyle: {
        gap: 10,
        paddingBottom: 70
    },
    footerWrapper: {
        width: deviceWidth,
        backgroundColor: themeColor12.bgColor(1),
        paddingTop: 20,
        paddingHorizontal: '5%',
        paddingBottom: 100
    },
})