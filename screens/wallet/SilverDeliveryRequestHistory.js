import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor1, themeColor3 } from '../../theme/Color';
import { uri } from '../../services/URL';
import { showToastOrAlert } from '../../helpers/Common';
import DeliveryRequestHistoryItem from '../../components/DeliveryRequestHistoryItem';
import BlankScreen from '../../components/BlankScreen';
import { fetchUser } from '../../slices/userSlice';

export default function SilverDeliveryRequestHistory({ navigation }) {

    const { t } = useTranslation();
    const accessToken = useSelector((state) => state?.token?.accessToken)
    const [refreshing, setRefreshing] = useState(true)
    const dispatch = useDispatch()
    const [data, setData] = useState([]);
    const fetchData = async () => {
        try {
            const response = await axios.get(`${uri}/silver/delivery/history/`, { headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${accessToken}` } })
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
        }, []),
    );

    return (
        <SafeAreaView edges={{ top: 'additive', bottom: 'additive' }} style={NewStyles.container}>
            <ScrollView contentContainerStyle={styles.contentContainerStyle} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                    setRefreshing(true)
                    fetchData()
                    dispatch(fetchUser(accessToken))
                }}
            />}>
                <View style={NewStyles.center}>
                    <Text style={NewStyles.heading10}>درخواست های تحویل حضوری</Text>
                </View>
                <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor3.bgColor(0.2) }} />
                <FlatList
                    ListEmptyComponent={() => {
                        return(
                            <BlankScreen/>
                        )
                    }}
                    contentContainerStyle={[styles.contentContainerStyle, NewStyles.center]}
                    showsVerticalScrollIndicator={false} scrollEnabled={false}
                    data={data}
                    keyExtractor={(item) => item?.id?.toString()}
                    renderItem={({ item }) => {
                        return (
                            <DeliveryRequestHistoryItem item={item} />
                        )
                    }}
                />
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    contentContainerStyle: {
        paddingHorizontal: '5%',
        paddingVertical: '5%',
        gap: 10,
    },
});