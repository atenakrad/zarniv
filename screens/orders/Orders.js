import { FlatList, Platform, RefreshControl, StyleSheet, ToastAndroid, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { uri } from '../../services/URL';

import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor5 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import Loader from '../../components/Loader';
import BlankScreen from '../../components/BlankScreen';
import OrdersItem from '../../components/OrderItem';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Orders({ navigation }) {

    const { t } = useTranslation();
    const accessToken = useSelector((state) => state?.token?.accessToken);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch()

    const [data, setData] = useState(null);
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${uri}/orders`, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${accessToken}` } });
            setData(response.data);
        } catch (error) {
            Platform.OS === 'android' ? ToastAndroid.show(`${t('Something went wrong!')}`, ToastAndroid.SHORT) : alert(`${t('Something went wrong!')}`)
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, []);

    return (
        <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={NewStyles.container}>
            <CustomStatusBar />
            {loading && <Loader />}
            <FlatList
                contentContainerStyle={[styles.contentContainerStyle, data?.length == 0 && NewStyles.center]}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl colors={[themeColor0.bgColor(1)]} progressBackgroundColor={themeColor5.bgColor(1)} refreshing={refreshing} onRefresh={() => { fetchData() }} />}
                ListEmptyComponent={<BlankScreen />}
                data={data}
                keyExtractor={(item) => item?.id?.toString()}
                renderItem={({ item }) =>
                    <OrdersItem navigation={navigation} item={item} />
                }
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    contentContainerStyle: {
        gap: 10,
        paddingHorizontal: '5%',
        paddingBottom:20
    },
})