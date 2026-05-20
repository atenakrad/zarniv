import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import NewStyles from '../styles/NewStyles'

const CommingSoon = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={NewStyles.heading10}>به زودی...</Text>
    </View>
  )
}

export default CommingSoon

const styles = StyleSheet.create({})