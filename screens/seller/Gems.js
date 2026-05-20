import { View, FlatList, StyleSheet, RefreshControl } from 'react-native'
import React, { useEffect, useState } from 'react'
import NewStyles from '../../styles/NewStyles'
import { themeColor0, themeColor12, themeColor5 } from '../../theme/Color'
import { uri } from '../../services/URL';
import ProductItem2 from '../../components/ProductItem2';
import axios from 'axios';
import { showToastOrAlert } from '../../helpers/Common';
import GemItem2 from '../../components/GemItem2';
import BlankScreen from '../../components/BlankScreen';
import { useTranslation } from 'react-i18next';

export default function Gems({ route, navigation }) {

    const { t } = useTranslation();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const sellerId = route?.params?.sellerId;
    const [data, setData] = useState([]);
    const fetchData = async () => {
        try {
            const response = await axios.post(`${uri}/shop/gems`, { sellerId })
            setData(response.data);
        } catch (error) {
            const errorMessage = error.response ? t('An unexpected error occurred!') : t('Network error!');
            showToastOrAlert(errorMessage);
        } finally {
            setRefreshing(false);
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, [refreshing])

    return (
        <View style={NewStyles.container}>
            <FlatList
                contentContainerStyle={styles.contentContainerStyle}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl colors={[themeColor0.bgColor(1)]} progressBackgroundColor={themeColor5.bgColor(1)} refreshing={refreshing} onRefresh={() => { setRefreshing(true) }} />}
                keyExtractor={(item) => item?.id?.toString()}
                data={data}
                renderItem={({ item }) => (
                    <GemItem2 item={item} navigation={navigation} />
                )}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    scrollViewContainer: {
        paddingTop: 20,
        gap: 20
    },
    contentContainerStyle: {
        gap: 0.5,
    },
    wrapper: {
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        backgroundColor: themeColor12.bgColor(1),
        paddingVertical: 20,
    },
    flatListContainer: {
        gap: 5,
        paddingHorizontal: '5%',
    },
})