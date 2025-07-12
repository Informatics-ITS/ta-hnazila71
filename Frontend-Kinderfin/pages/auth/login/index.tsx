import React, { useEffect, useState } from "react";
import styles from './login.module.css';
import { TextInput, Notification } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useRouter } from 'next/router';
import Utils from "../../../utils";
import Cookies from 'js-cookie';

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  interface User {
    access_token: string;
    role: string;
    username: string;
  }

  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userCookie = Cookies.get('user');
    if(userCookie === null) {
      window.location.href = '/auth/login';
    }
    if(userCookie) {
      console.log("User cookie: ", userCookie);
      router.push('/');
    }
  }, []);


  const formLogin = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (value.includes('@') ? null : 'Email tidak valid'),
      password: (value) => (value.length > 5 ? null : 'Password minimal 6 karakter'),
    },
  });

  const redirectToRegister = () => {
    router.push('/auth/register');
  };

  const handleSubmit = async (values: { email: string; password: string }) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(Utils.login_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        const { access_token, role, username } = data.data;
        Cookies.set('user', JSON.stringify({ access_token, role, username }), { expires: 1 });
        setSuccess("Login berhasil");
        setError('');
        router.push('/');
      } else {
        setError(data.message || 'Login gagal');
        setSuccess('');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login gagal, mohon coba lagi beberapa saat lagi');
      setSuccess('');
    }
    setIsSubmitting(false);
  };

  return (
    <div className={styles.login_container}>
      <div className={styles.login_image}>
        <img src="/icons/login-illustration.png" alt="Ilustrasi Login" />
      </div>

      <div className={styles.login_form}>
        {success && (
          <Notification color="teal" onClose={() => setSuccess('')}>
            {success}
          </Notification>
        )}
        {error && (
          <Notification color="red" onClose={() => setError('')}>
            {error}
          </Notification>
        )}
        <h2>Halo, Selamat Datang di KINDERFIN!</h2>
        <p>Silakan masuk ke akun Anda</p>

        <form onSubmit={formLogin.onSubmit(handleSubmit)}>
          <TextInput
            label="Email"
            placeholder="Masukkan email Anda"
            {...formLogin.getInputProps('email')}
          />

          <TextInput
            label="Password"
            placeholder="Masukkan password Anda"
            type="password"
            {...formLogin.getInputProps('password')}
          />

          <button disabled={isSubmitting} style={{ marginTop: "1rem" }} type="submit">Masuk</button>
        </form>
        <p>Belum terdaftar ? <span style={{color: 'blue', cursor: 'pointer'}} onClick={redirectToRegister}>Daftar sebagai orang tua</span> </p>
      </div>
    </div>
  );
}
