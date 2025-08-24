import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Feather } from '@expo/vector-icons';
export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    
    <Tabs
      screenOptions={{
      tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      headerShown: false,
      tabBarButton: HapticTab,
      tabBarBackground: TabBarBackground,
      tabBarStyle: Platform.select({
        ios: {
        position: 'absolute',
        top: 'auto',
        left: 16,
        right: 16,
        bottom: 20,
        paddingTop: 12,
        // elevation: 5,
        borderRadius: 50,
        backgroundColor: 'rgba(55, 55, 55, 0.3)',
        // borderWidth: 1,
        // borderColor: 'rgba(255,255,255,0.3)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        overflow: 'hidden',
        // Glassmorphism: backdrop blur (iOS only)
        // backdropFilter: 'blur(20px)',
        },
        web: {
          maxWidth: 500,
          position: 'absolute',
          top: 'auto',
          left: '50%',
          marginLeft: -250, // half of maxWidth to center
          bottom: 25,
          // paddingTop: 12,
          // elevation: 5,
          borderRadius: 50,
          backgroundColor: 'rgba(55, 55, 55, 0.3)',
          // borderWidth: 1,
          // borderColor: 'rgba(255,255,255,0.3)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          overflow: 'hidden',
          // Glassmorphism: backdrop blur (iOS only)
          // backdropFilter: 'blur(20px)',
        }, 
        android: {
        position: 'absolute',
        top: 'auto',
        left: 16,
        right: 16,
        bottom: 20,
        paddingTop: 12,
        // elevation: 5,
        borderRadius: 50,
        backgroundColor: 'rgba(55, 55, 55, 0.3)',
        // borderWidth: 1,
        // borderColor: 'rgba(255,255,255,0.3)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        overflow: 'hidden',
        },
        default: {},
      }),
      }}>

      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) =>  <Feather name="home" size={24} color="#fff" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) =>  <Feather name="user" size={24} color="#fff" />,
        }}
      />
    </Tabs>
  );
}
