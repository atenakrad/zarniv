import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native';
import { useTranslation } from 'react-i18next';

import NewStyles from '../../styles/NewStyles';
import { themeColor1 } from '../../theme/Color';
import RateItem from '../../components/RateItem';
import { fetchRate } from '../../slices/rateSlice';
import CustomStatusBar from '../../components/CustomStatusBar';

export default function Rates({ route, navigation }) {

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const rates = useSelector(state => state.rate?.data);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        dispatch(fetchRate());
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [refreshing]),
    );

    return (
        <SafeAreaView style={NewStyles.container}   edges={{ top: 'off', bottom: 'off' }}>
            <CustomStatusBar />
            <FlatList
                contentContainerStyle={styles.contentContainerStyle}
                columnWrapperStyle={{ marginBottom: 5 }} numColumns={2}
                showsVerticalScrollIndicator={false}
                // ListFooterComponent={() => <View style={{ padding: 10 }}><Text style={NewStyles.text3}>{t("Source: Persian API")}</Text></View>}
                refreshControl={<RefreshControl colors={[themeColor1.bgColor(1)]} refreshing={refreshing} onRefresh={() => { fetchData() }} />}
                data={rates}
                keyExtractor={(item) => item?.id?.toString()}
                renderItem={({ item }) =>
                    <RateItem item={item} navigation={navigation} />
                }
            />
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    contentContainerStyle: { 
        marginHorizontal: '2.5%',
        paddingBottom: 100
    },
});