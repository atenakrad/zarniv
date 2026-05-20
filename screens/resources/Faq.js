import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { uri } from '../../services/URL';
import NewStyles from '../../styles/NewStyles';
import { themeColor1 } from '../../theme/Color';
import CustomStatusBar from '../../components/CustomStatusBar';
import Loader from '../../components/Loader';
import BlankScreen from '../../components/BlankScreen';
import AccordionItem from '../../components/AccordionItem';  
import { handleError } from '../../helpers/Common';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Faq() {

    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const lang = useSelector(state => state?.lang?.lang);
    const [data, setData] = useState([]);
    const fetchData = async () => {
        try {
            const response = await axios.get(`${uri}/pages/faqs/`);
            setData(response?.data);
        } catch (error) {
            handleError(error)
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, [refreshing]);

    const [active, setActive] = useState();

    if (loading) {
        return (
            <Loader />
        )
    }
    return (
        <SafeAreaView edges={{ top: 'off', bottom: 'additive' }} style={NewStyles.container}>
            <CustomStatusBar />
            <FlatList
                contentContainerStyle={[styles.contentContainerStyle, NewStyles.center]}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl colors={[themeColor1.bgColor(1)]} refreshing={refreshing} onRefresh={() => { setRefreshing(true) }} />}
                ListEmptyComponent={<BlankScreen />}
                data={data}
                keyExtractor={(item) => item?.id?.toString()}
                renderItem={({ item, index }) => (
                    <AccordionItem item={item} index={index} active={active} setActive={setActive} />
                )}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    contentContainerStyle: {
        paddingVertical: 20,
        gap: 10,
        paddingBottom: 100
    },
})