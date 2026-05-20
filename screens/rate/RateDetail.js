import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSelector } from 'react-redux';

import NewStyles from '../../styles/NewStyles';
import Chart from '../../components/Chart';
import { themeColor3 } from '../../theme/Color';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Wallet({ route }) {
    const slug = route?.params?.slug 
    
    const item = useSelector(state => state.rate?.data)?.find(item => item?.key == slug)
    return (
        <SafeAreaView style={NewStyles.container}>
            <View style={styles.contentContainerStyle}>
                <View style={NewStyles.center}>
                    <Text style={NewStyles.heading}>{item?.title}</Text>
                </View>
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
        paddingVertical: '5%',
        gap: 10,
    },
})