import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import NewStyles from '../../styles/NewStyles'
import BankInfoComponent from '../../components/BankInfoComponent'
import RecieptFormComponent from '../../components/RecieptFormComponent'
import { formatPrice } from '../../helpers/Common'

const ShippingDeliveryPaymentSilver = ({ route }) => {
    const params = route?.params; 
    return (
        <SafeAreaView style={NewStyles.container} edges={{ top: 'off', bottom: 'additive' }}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior='padding'>

                <ScrollView contentContainerStyle={{ paddingHorizontal: '5%', paddingVertical: 15, gap: 10 }} showsVerticalScrollIndicator={false}>
                    <BankInfoComponent />
                    <RecieptFormComponent
                        title={`پرداخت هزینه ارسال تحویل فیزیکی نقره به مبلغ ${formatPrice(params?.shipping_cost)} تومان`}
                        request_type={'delivery_shipping'}
                        physical_delivery_silver_request_id={params?.physical_delivery_silver_request_id}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default ShippingDeliveryPaymentSilver

const styles = StyleSheet.create({})