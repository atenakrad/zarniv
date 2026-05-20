import { View, Text, FlatList, StyleSheet, RefreshControl, Pressable } from 'react-native'
import { useEffect, useState } from 'react'

import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor6, themeColor7 } from '../../theme/Color';
import { useTranslation } from 'react-i18next';
import { formatPrice, showToastOrAlert } from '../../helpers/Common';
import Filters from '../../components/Filters';
import axios from 'axios';
import { uri } from '../../services/URL';
import Button from '../../components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Colleague({ navigation }) {

    const { t } = useTranslation();
    const [refreshing, setRefreshing] = useState(true);
    const [activeFilter, setActiveFilter] = useState(0);

    const [categories, setCategories] = useState([]);
    const [data, setData] = useState([]);
    const fetchData = async () => {
        try {
            const [response, response1] = await Promise.all([
                axios.get(`${uri}/bullions/categories/`),
                axios.get(`${uri}/bullions/products/`),
            ]);
            setCategories(response.data);
            setData(response1.data);
        } catch (error) {
            const message = error.response ? t('An unexpected error occurred!') : t('Network error!');
            showToastOrAlert(message);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [refreshing])

    return (
        <SafeAreaView edges={{top:'off', bottom:'additive'}} style={NewStyles.container}>
            <View>
                <Filters data={categories} activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
            </View>
            <FlatList
                contentContainerStyle={[styles.contentContainerStyle, NewStyles.center]}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl colors={[themeColor0.bgColor(1)]} progressBackgroundColor={themeColor1.bgColor(1)} refreshing={refreshing} onRefresh={() => { setRefreshing(true) }} />}
                data={data?.filter((item) => item?.category_id == categories?.[activeFilter]?.id)}
                keyExtractor={(item) => item?.id?.toString()}
                ListHeaderComponent={
                    <View style={[NewStyles.rowWrapper, { width: '100%' }]}>
                        <View style={[{ height: 40, width: '30%' }, NewStyles.center]}>
                            <Text style={NewStyles.title10}>خرید</Text>
                        </View>
                        <View style={[{ height: 40, width: '30%' }, NewStyles.center]}>
                            <Text style={NewStyles.title10}>فروش</Text>
                        </View>
                    </View>
                }
                renderItem={({ item }) => {
                    return (
                        <View style={[NewStyles.rowWrapper, { width: '100%' }]}>
                            <Pressable style={[{ backgroundColor: themeColor6.bgColor(0.1), height: 40, width: '30%' }, NewStyles.border10, NewStyles.center]} onPress={() => { navigation.navigate('Buy', { item: item }) }}>
                                <Text style={NewStyles.text6}>{formatPrice(item?.product_prices[0]?.buy_price)}</Text>
                            </Pressable>
                            <Text style={[NewStyles.text10,{flex:1, textAlign: 'center'}]}>{item?.name}</Text>
                            <Pressable style={[{ backgroundColor: themeColor7.bgColor(0.1), height: 40, width: '30%' }, NewStyles.border10, NewStyles.center]} onPress={() => { navigation.navigate('Sell', { item: item }) }}>
                                <Text style={NewStyles.text7}>{formatPrice(item?.product_prices[0]?.sell_price)}</Text>
                            </Pressable>
                        </View>
                    )
                }}
            />
            <View style={{ marginHorizontal: '5%' }}>
                <Button title={'تاریخچه‌ی خرید و فروش‌ها'} onPress={() => { navigation.navigate('History') }} />
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
})