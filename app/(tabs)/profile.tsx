import React from 'react'
import { SafeAreaView, Text } from 'react-native'

export default function profile() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: 'white', fontSize: 20 }}>Profile Screen</Text>
    </SafeAreaView>
  )
}
