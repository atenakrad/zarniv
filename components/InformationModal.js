import { Modal , StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { themeColor10, themeColor12, themeColor4 } from '../theme/Color'
import NewStyles from '../styles/NewStyles'
import Button from './Button'
import { SafeAreaView } from 'react-native-safe-area-context'

const InformationModal = ({ title, text, important_note, visible, setVisible }) => { 

    return (
        <Modal animationType='fade' transparent={true} visible={visible} onRequestClose={() => {
            setVisible(false)
        }}>
            <SafeAreaView style={[{ flex: 1, backgroundColor: themeColor10.bgColor(0.2) }, NewStyles.center]}>
                <View style={[{ backgroundColor: themeColor4.bgColor(1), width: '90%', padding: 10, gap: 10 }, NewStyles.border10]}>
                    <Text style={NewStyles.title}>{title}</Text>
                    <Text style={[NewStyles.text10, { textAlign: 'justify', direction: 'rtl', }]}>{text}</Text>
                    {
                        important_note &&
                        <View style={[{ backgroundColor: themeColor12.bgColor(0.5), padding: 10, gap: 10 }, NewStyles.border5]}>
                            <Text style={NewStyles.title}>نکته مهم</Text>
                            <Text style={[NewStyles.text10, { textAlign: 'justify', direction: 'rtl', }]}>{important_note}</Text>
                        </View>
                    }
                    <Button
                        onPress={() => {
                            setVisible(false)
                        }}
                        title={'متوجه شدم'}
                    />
                </View>
            </SafeAreaView>
        </Modal>
    )
}

export default InformationModal

const styles = StyleSheet.create({})