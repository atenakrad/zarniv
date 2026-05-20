import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import NewStyles from '../../styles/NewStyles'
import BankInfoComponent from '../../components/BankInfoComponent'
import RecieptFormComponent from '../../components/RecieptFormComponent'
import { formatPrice } from '../../helpers/Common'

const PayReserve = ({ route }) => {
    const params = route?.params 
    return (
        <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'additive' }}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior='padding'>
                <ScrollView contentContainerStyle={{ paddingHorizontal: '5%', paddingVertical: 15, gap:15 }}>
                    <BankInfoComponent />
                    <RecieptFormComponent
                        title={`تسویه باقی‌مانده سفارش مبلغ ${formatPrice(params?.price)} تومان`}
                        order_id={params?.orderId}
                        request_type={'order'}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default PayReserve

const styles = StyleSheet.create({})