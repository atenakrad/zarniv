import { View, Text } from 'react-native';

import { themeColor10, themeColor3 } from '../theme/Color';
import NewStyles from '../styles/NewStyles';

export default function MessegeItem({ messege }) {

    if (messege.user_id) {
        return (
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <View style={{ width: '80%', marginRight: 15, marginBottom: 5, }}>
                    <View style={{ alignSelf: 'flex-end', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: themeColor3.bgColor(0.1) }}>
                        <Text style={NewStyles.text10} selectable={true}>{messege?.text}</Text>
                    </View>
                </View>
            </View>
        )
    } else {
        return (
            <View style={{ width: '80%', marginLeft: 15, marginBottom: 5, }}>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-start' }}>
                    <View style={{ alignSelf: 'flex-end', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: themeColor10.bgColor(1) }}>
                        <Text style={NewStyles.text4} selectable={true}>{messege?.text}</Text>
                    </View>
                </View>
            </View>)
    }
}