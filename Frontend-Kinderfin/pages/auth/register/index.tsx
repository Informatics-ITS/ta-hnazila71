import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from './register.module.css';
import { Stepper, Button, Group, TextInput, Box, Container, Title, Paper, Text } from '@mantine/core';
import Head from 'next/head';
import Link from 'next/link';
import Utils from '../../../utils';
import Cookies from 'js-cookie';

export default function RegisterView() {
  const router = useRouter();
  const [active, setActive] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    alamat: '',
    no_telepon: '',
    ayah: '',
    pekerjaan_ayah: '',
    ibu: '',
    pekerjaan_ibu: '',
    role: 'Orang Tua'
  });
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


  const nextStep = () => setActive((current) => (current < 3 ? current + 1 : current));
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleSubmit = async () => {
    console.log('Form data:', formData);
    try {
      const response = await fetch(Utils.register_url, {
        method: 'POST',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/auth/login');
      } else {
        // Handle registration error
        alert(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <>
      <Head>
        <title>Register - Kinderfin</title>
      </Head>
      <div className={styles.register_container}>
        <div className={styles.register_image}>
          <img src="/icons/register-illustration.png" alt="Ilustrasi Register" />
        </div>

        <div className={styles.register_form}>
          <h2 className={styles.welcome_text}>Halo, Selamat Datang di KINDERFIN!</h2>
          <p>Silakan registrasi akun Anda</p>

          <Paper shadow="xs" p="md" radius="md" withBorder className={styles.form_paper}>
            <Title order={3} className={styles.form_title}>
              Registrasi Akun Orang Tua Siswa
            </Title>

            <Stepper active={active} onStepClick={setActive}>
              <Stepper.Step label="First step" description="Data Akun">
                <Box mt="md">
                  <TextInput
                    label="Email"
                    placeholder="Masukkan email"
                    required
                    value={formData.email}
                    onChange={handleInputChange('email')}
                  />
                  <TextInput
                    label="Password"
                    type="password"
                    placeholder="Masukkan password"
                    required
                    mt="md"
                    value={formData.password}
                    onChange={handleInputChange('password')}
                  />
                  <TextInput
                    label="Alamat"
                    placeholder="Masukkan alamat"
                    required
                    mt="md"
                    value={formData.alamat}
                    onChange={handleInputChange('alamat')}
                  />
                  <TextInput
                    label="Nomor Telepon"
                    placeholder="Masukkan nomor telepon"
                    required
                    mt="md"
                    value={formData.no_telepon}
                    onChange={handleInputChange('no_telepon')}
                  />
                </Box>
              </Stepper.Step>

              <Stepper.Step label="Second step" description="Data Ayah">
                <Box mt="md">
                  <TextInput
                    label="Nama Ayah"
                    placeholder="Masukkan nama ayah"
                    required
                    value={formData.ayah}
                    onChange={handleInputChange('ayah')}
                  />
                  <TextInput
                    label="Pekerjaan Ayah"
                    placeholder="Masukkan pekerjaan ayah"
                    required
                    mt="md"
                    value={formData.pekerjaan_ayah}
                    onChange={handleInputChange('pekerjaan_ayah')}
                  />
                </Box>
              </Stepper.Step>

              <Stepper.Step label="Final step" description="Data Ibu">
                <Box mt="md">
                  <TextInput
                    label="Nama Ibu"
                    placeholder="Masukkan nama ibu"
                    required
                    value={formData.ibu}
                    onChange={handleInputChange('ibu')}
                  />
                  <TextInput
                    label="Pekerjaan Ibu"
                    placeholder="Masukkan pekerjaan ibu"
                    required
                    mt="md"
                    value={formData.pekerjaan_ibu}
                    onChange={handleInputChange('pekerjaan_ibu')}
                  />
                </Box>
              </Stepper.Step>

              <Stepper.Completed>
              <Text style={{ textAlign: "center" }}>
  Teliti kembali data Anda lalu tekan &quot;Selesai&quot;.
</Text>

                <Button mt="md" onClick={handleSubmit}>
                  Selesai
                </Button>
              </Stepper.Completed>
            </Stepper>

            <Group mt="xl" className={styles.navigation_buttons}>
              <div className={styles.left_buttons}>
                <Button
                  variant="default"
                  className={styles.back_button}
                  onClick={prevStep}
                  disabled={active === 0}
                >
                  Back
                </Button>
                <Text mt="sm" size="sm" color="#667085">
                  Sudah Punya Akun (Orang Tua Siswa)?
                </Text>
              </div>

              <div className={styles.right_buttons}>
                <Button
                  onClick={nextStep}
                  className={styles.next_button}
                >
                  {active === 2 ? 'Finish' : 'Next step'}
                </Button>
                <Text mt="sm" size="sm" className={styles.login_text}>
                  <Link href="/auth/login" passHref>
                    Masuk.
                  </Link>
                </Text>
              </div>
            </Group>
          </Paper>
        </div>
      </div>
    </>
  );
}
