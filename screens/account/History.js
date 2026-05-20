import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { useCallback, useState } from 'react'
import { useSelector } from 'react-redux';
import axios from 'axios';

import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor3, themeColor5 } from '../../theme/Color';
import { uri } from '../../services/URL';
import HistoryItem from '../../components/HistoryItem';
import { useFocusEffect } from '@react-navigation/native';
import { showToastOrAlert } from '../../helpers/Common';
import { useTranslation } from 'react-i18next';

export default function History({ navigation }) {

    const { t } = useTranslation();
    const accessToken = useSelector((state) => state?.token?.accessToken)
    const [refreshing, setRefreshing] = useState(true)

    const [data, setData] = useState([]);
    const fetchData = async () => {
        try {
            const response = await axios.get(`${uri}/bullions/history`, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${accessToken}` } })
            setData(response?.data);
        } catch (error) {
            const message = error?.response ? t('An unexpected error occurred!') : t('Network error!');
            showToastOrAlert(message);
        } finally {
            setRefreshing(false);
        }
    };
    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [refreshing]),
    );

    return (
        <View style={NewStyles.container}>
            <View style={[NewStyles.center, { paddingVertical: '5%' }]}>
                <Text style={NewStyles.heading10}>تاریخچه‌ی خرید و فروش‌ها</Text>
            </View>
            <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor3.bgColor(0.2) }} />
            <FlatList
                contentContainerStyle={[styles.contentContainerStyle, NewStyles.center]}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl colors={[themeColor0.bgColor(1)]} progressBackgroundColor={themeColor5.bgColor(1)} refreshing={refreshing} onRefresh={() => { setRefreshing(true) }} />}
                data={data}
                keyExtractor={(item) => item?.id?.toString()}
                renderItem={({ item }) => {
                    return (
                        <HistoryItem item={item} />
                    )
                }}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    contentContainerStyle: {
        gap: 2,
    },
});