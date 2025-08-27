import { Tabs, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';
import { Feather } from '@expo/vector-icons';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function check() {
      try {
        const sessionResp = await supabase.auth.getSession();
        const session = sessionResp?.data?.session ?? null;
        if (!session) {
          // router.replace accepts typed paths; cast to any to avoid TS noise
          router.replace('/signin' as any);
        }
      } catch (e) {
        console.warn('Auth check failed:', e);
      } finally {
        if (mounted) setChecking(false);
      }
    }

    check();

    // Listen to auth changes (sign-out) and redirect to signin when no session
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) router.replace('/signin' as any);
    });

    return () => {
      mounted = false;
      try {
        // unsubscribe if possible
        listener?.subscription?.unsubscribe?.();
      } catch (e) {
        console.warn('Failed to unsubscribe auth listener:', e);
      }
    };
  }, []);

  // If still checking auth, render nothing (or consider a loading screen)
  if (checking) return null;

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
          tabBarIcon: HomeIcon,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ProfileIcon,
        }}
      />
    </Tabs>
  );
}

function HomeIcon() {
  return <Feather name="home" size={24} color="#fff" />;
}

function ProfileIcon() {
  return <Feather name="user" size={24} color="#fff" />;
}
