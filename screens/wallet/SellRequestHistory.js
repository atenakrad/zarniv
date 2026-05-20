import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useCallback, useState } from 'react'
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor3 } from '../../theme/Color';
import { uri } from '../../services/URL';
import { handleError, showToastOrAlert } from '../../helpers/Common';
import DeliveryRequestHistoryItem from '../../components/DeliveryRequestHistoryItem';
import BlankScreen from '../../components/BlankScreen';
import SellGoldRequestItem from '../../components/SellGoldRequestItem';

export default function SellRequestHistory({ navigation }) {

    const { t } = useTranslation();
    const accessToken = useSelector((state) => state?.token?.accessToken)
    const [refreshing, setRefreshing] = useState(true)

    const [data, setData] = useState([]);
    const fetchData = async () => {
        try {
            const response = await axios.get(`${uri}/sell/gold/history/`, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${accessToken}` } })
            setData(response?.data);
        } catch (error) {
           handleError(error, t)
        } finally {
            setRefreshing(false);
        }
    };
    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, []),
    );

    return (
        <SafeAreaView edges={{ top: 'additive', bottom: 'additive' }} style={NewStyles.container}>
            <ScrollView contentContainerStyle={styles.contentContainerStyle} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                    setRefreshing(true)
                    fetchData()
                }}
            />}>
                <View style={NewStyles.center}>
                    <Text style={NewStyles.heading10}>درخواست‌های فروش طلا</Text>
                </View>
                <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor3.bgColor(0.2) }} />
                <FlatList
                    ListEmptyComponent={() => {
                        return(
                            <BlankScreen/>
                        )
                    }}
                    contentContainerStyle={[styles.contentContainerStyle]}
                    showsVerticalScrollIndicator={false} scrollEnabled={false}
                    refreshControl={<RefreshControl colors={[themeColor0.bgColor(1)]} progressBackgroundColor={themeColor1.bgColor(1)} refreshing={refreshing} onRefresh={() => { setRefreshing(true) }} />}
                    data={data}
                    keyExtractor={(item) => item?.id?.toString()}
                    renderItem={({ item }) => {
                        return (
                            <SellGoldRequestItem item={item} />
                        )
                    }}
                />
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    contentContainerStyle: {
        paddingHorizontal: 10,
        paddingVertical: '5%',
        gap: 10,
    },
});