import { View, FlatList, StyleSheet, RefreshControl, Text, ScrollView, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

import { uri } from '../../services/URL';
import { showToastOrAlert } from '../../helpers/Common';
import NewStyles from '../../styles/NewStyles';
import { themeColor0, themeColor12, themeColor4 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import Loader from '../../components/Loader';
import GemItem2 from '../../components/GemItem2';
import GemCategoryItem from '../../components/GemCategoryItem';
import BlankScreen from '../../components/BlankScreen';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function Gems({ route, navigation }) {

    const { t } = useTranslation();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const categoryId = route?.params?.categoryId;

    const [filters, setFilters] = useState([]);
    const [data, setData] = useState([]);
    const fetchData = async () => {
        try {
            const [response, response1] = await Promise.all([
                axios.post(`${uri}/silver/categories/`, { categoryId: categoryId }),
                axios.post(`${uri}/silver/categories/products/`, { categoryId: categoryId }),
            ]);
            setFilters(response.data);
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
    }, [refreshing])
    if (loading) {
        return (
            <Loader />
        )
    }
    return (
        <SafeAreaView style={NewStyles.container}>
            <CustomStatusBar />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollViewContainer} refreshControl={<RefreshControl colors={[themeColor0.bgColor(1)]} refreshing={refreshing} onRefresh={() => { setRefreshing(true); }} />}>
                <View style={{ gap: 10 }}>
                    <Pressable style={[styles.searchBar, NewStyles.row, NewStyles.border100]} onPress={() => navigation.navigate('SearchGem')}>
                        <Ionicons name={'search'} size={20} color={themeColor0.bgColor(1)} />
                        <Text style={NewStyles.text10}>جستجو در<Text style={NewStyles.text}> محصولات نقره </Text></Text>
                    </Pressable>

                </View>
                <View>
                    <FlatList
                        contentContainerStyle={styles.flatListContainer}
                        showsHorizontalScrollIndicator={false}
                        horizontal inverted
                        data={filters}
                        keyExtractor={(item) => item?.id?.toString()}
                        renderItem={({ item }) => <GemCategoryItem item={item} navigation={navigation} />}
                    />
                </View>
                <View>

                    <FlatList
                        scrollEnabled={false}
                        contentContainerStyle={styles.contentContainerStyle}
                        ListHeaderComponent={() => (
                            <View style={[styles.wrapper, NewStyles.rowWrapper, NewStyles.shadow, { paddingHorizontal: '5%' }]}>
                                <Text style={NewStyles.text1}>{data?.length} محصول</Text>
                            </View>
                        )}
                        ListEmptyComponent={() => <BlankScreen />}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(item) => item?.id?.toString()}
                        data={data}
                        renderItem={({ item }) => (
                            <GemItem2 item={item} navigation={navigation} />
                        )}
                    />
                </View>
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
    searchBar: {
        height: 40,
        backgroundColor: themeColor4.bgColor(1),
        marginHorizontal: '5%',
        paddingHorizontal: '5%',
        gap: 5
    },
})