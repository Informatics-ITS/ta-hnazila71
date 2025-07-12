import React from "react";
import styles from './landing_page.module.css';

export default function LandingPage() {
  return (
      <div className={styles.landing_container}>
          <h1>KINDERFIN</h1>
          <h2>“Sistem Pengelolaan Keuangan Terpadu untuk Guru dan Orang Tua di Taman Kanak-Kanak”</h2>

          <div className={styles.button_container}>
              <div className={styles.card}>
                <p>Orang Tua /<br/>Wali Murid</p>
              </div>
              <div className={styles.card}>
                <p>Guru<br/>Sekolah</p>
              </div>
              <div className={styles.card}>
                <p>Sekretaris<br/>Sekolah</p>
              </div>
              <div className={styles.card}>
                <p>Bendahara<br/>Sekolah</p>
              </div>
          </div>
      </div>
  )
}