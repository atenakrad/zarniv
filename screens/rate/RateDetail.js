import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSelector } from 'react-redux';

import NewStyles from '../../styles/NewStyles';
import Chart from '../../components/Chart';
import { themeColor3 } from '../../theme/Color';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackHeader from '../../components/BackHeader';

export default function Wallet({ route }) {
    const slug = route?.params?.slug

    const item = useSelector(state => state.rate?.data)?.find(item => item?.key == slug)
    return (
        <SafeAreaView style={NewStyles.container} edges={{top:'off', bottom:'additive'}}>
            <BackHeader title={`نمودار تغییرات قیمت ${item?.title}`} />
            <View style={styles.contentContainerStyle}> 
                <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: themeColor3.bgColor(0.2) }} />
                <ScrollView contentContainerStyle={styles.contentContainerStyle} showsVerticalScrollIndicator={false}>
                    <Chart slug={slug} title={item?.title} />
                </ScrollView>
            </View>
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    contentContainerStyle: {
        // paddingVertical: '5%',
        gap: 10,
    },
})