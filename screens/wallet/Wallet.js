import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native'
import { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';

import NewStyles from '../../styles/NewStyles';
import WalletCarousal from './WalletCarousal'
import Chart from '../../components/Chart';
import LoginModal from '../auth/LoginModal';
import { themeColor0, themeColor1, themeColor10, themeColor4 } from '../../theme/Color';
import { fetchUser } from '../../slices/userSlice';
import { useFocusEffect } from '@react-navigation/native';
import { fetchTradingAllowed } from '../../slices/tradingAllowed';
import VoteTimerDisplay from '../../components/VoteTimerDisplay';

export default function Wallet({ navigation }) {

    const dispatch = useDispatch();
    const [refreshing, setRefreshing] = useState(false);

    const accessToken = useSelector((state) => state?.token?.accessToken)

    const wallets = [
        {
            id: '1',
            title: 'کیف پول طلا',
            file_path: require('../../assets/images/card/1.png'),
            text1: 'خرید طلا',
            action1: () => accessToken ? navigation.navigate('Purchase') : navigation.navigate('MainLayout', { screen: 'Account' }),
            color: themeColor4.bgColor(1),
            text3: 'تحویل فیزیکی',
            action3: () => accessToken ? navigation.navigate('DeliveryRequest') : navigation.navigate('MainLayout', { screen: 'Account' }),
            text4: "فروش طلا",
            action4: () => accessToken ? navigation.navigate('GoldSellRequest') : navigation.navigate('MainLayout', { screen: 'Account' }),
        },
        {
            id: '3',
            title: 'کیف پول نقره',
            file_path: require('../../assets/images/card/3.png'),
            text1: 'خرید نقره',
            action1: () => accessToken ? navigation.navigate('ChargeSilverWallet') : navigation.navigate('MainLayout', { screen: 'Account' }),
            color: themeColor10.bgColor(1),
            text3: 'تحویل فیزیکی',
            action3: () => accessToken ? navigation.navigate('SilverDeliveryRequest') : navigation.navigate('MainLayout', { screen: 'Account' }),
            text4: "فروش نقره",
            action4: () => accessToken ? navigation.navigate('SilverSellRequest') : navigation.navigate('MainLayout', { screen: 'Account' }),
        },
        {
            id: '2',
            title: 'کیف پول ریالی',
            file_path: require('../../assets/images/card/2.png'),
            edit: () => accessToken ? navigation.navigate('EditCard') : navigation.navigate('MainLayout', { screen: 'Account' }),
            text1: 'افزایش موجودی',
            action1: () => accessToken ? navigation.navigate('Increase') : navigation.navigate('MainLayout', { screen: 'Account' }),
            text2: 'درخواست برداشت',
            action2: () => accessToken ? navigation.navigate('Decrease') : navigation.navigate('MainLayout', { screen: 'Account' }),
            color: themeColor4.bgColor(1),
        },
    ]

    useFocusEffect(
        useCallback(() => {
            dispatch(fetchTradingAllowed())
        }, []),
    );

    return (
        <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'off' }}>
            <ScrollView contentContainerStyle={styles.contentContainerStyle} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl colors={[themeColor0.bgColor(1)]} progressBackgroundColor={themeColor1.bgColor(1)} refreshing={refreshing} onRefresh={() => { dispatch(fetchUser(accessToken)) }} />}>
                <WalletCarousal data={wallets} />
                <Chart slug={'YekGram18'} title={'طلای 18 عیار / 750'} />
            </ScrollView>
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    contentContainerStyle: {
        gap: 20,
        paddingBottom: 70
    },
})