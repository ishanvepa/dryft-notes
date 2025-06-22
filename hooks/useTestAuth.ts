import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// A .env.local with database login info is required to call this component

export function useTestAuth() {
  useEffect(() => {
    const handleAuth = async () => {
      const email = 'rohanthapliyal2020@gmail.com';
      const password = 'password123';

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      console.log('Sign up result:', signUpData, signUpError);

      let user = signUpData.user;

      if (!user && signUpError?.message?.includes('registered')) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          console.error('Sign in failed:', signInError);
          return;
        }
        user = signInData.user;
      }

      if (user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: user.id,
          user_name: 'rthap',
          full_name: 'Rohan Thapliyal',
        });

        if (profileError) {
          console.error('Profile insert error:', profileError);
        } else {
          console.log('User and profile created!');
        }
      }
    };

    handleAuth();
  }, []);
}