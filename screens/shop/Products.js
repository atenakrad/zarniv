import { View, FlatList, StyleSheet, RefreshControl, Text, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

import { uri } from '../../services/URL';
import { showToastOrAlert } from '../../helpers/Common';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor12 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import Loader from '../../components/Loader';
import ProductItem2 from '../../components/ProductItem2';
import CategoryItem from '../../components/CategoryItem';
import BlankScreen from '../../components/BlankScreen';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Products({ route, navigation }) {

    const { t } = useTranslation();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const categoryId = route?.params?.categoryId;

    const [filters, setFilters] = useState([]);
    const [data, setData] = useState([]);
    const fetchData = async () => {
        try {
            const [response, response1] = await Promise.all([
                axios.post(`${uri}/categories/`, { categoryId: categoryId }),
                axios.post(`${uri}/categories/products/`, { categoryId: categoryId }),
            ]);
            setFilters(response?.data);
            setData(response1.data);
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
    }, [refreshing]);

    return (
        <SafeAreaView style={NewStyles.container}>
            <CustomStatusBar />
            {loading && <Loader />}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollViewContainer} refreshControl={<RefreshControl colors={[themeColor0.bgColor(1)]} refreshing={refreshing} onRefresh={() => { setRefreshing(true); }} />}>
                <FlatList
                    contentContainerStyle={styles.flatListContainer}
                    showsHorizontalScrollIndicator={false}
                    horizontal inverted
                    data={filters}
                    keyExtractor={(item) => item?.id?.toString()}
                    renderItem={({ item }) => <CategoryItem item={item} navigation={navigation} />}
                />
                <FlatList
                    scrollEnabled={false}
                    contentContainerStyle={styles.contentContainerStyle}
                    ListHeaderComponent={() => (
                        <View style={[styles.wrapper, NewStyles.rowWrapper, NewStyles.shadow, { paddingHorizontal: '5%' }]}>
                            <Text style={NewStyles.title}>{data?.length} محصول</Text>
                        </View>
                    )}
                    ListEmptyComponent={() => <BlankScreen />}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item) => item?.id?.toString()}
                    data={data}
                    renderItem={({ item }) => (
                        <ProductItem2 item={item} navigation={navigation} />
                    )}
                />
            </ScrollView>
        </SafeAreaView>
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