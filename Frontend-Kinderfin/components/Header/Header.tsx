import React from 'react';
import { useState, useEffect } from 'react';
import { Avatar } from '@mantine/core';
import { Menu, rem } from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';
import styles from './header.module.css';
import Utils from '../../utils';
import Cookies from 'js-cookie';

export default function Header() {
  const [user, setUser] = useState({ username: '' });
  
  const handleLogout = () => {
    Cookies.remove('user');
    window.location.href = '/auth/login';
  }

  useEffect(() => {
    const userCookie = Cookies.get('user');
    setUser(userCookie ? JSON.parse(userCookie) : null);
  }, []);


  return(
    <header className={styles.header}>
      <img src='/logo.png' alt='logo' />
      <Menu>
        <Menu.Target>
          <div className={styles.user__avatar}>
            <span>{user.username}</span>
            <Avatar color="cyan" radius="xl">
              {Utils.getInitials(user.username)}
            </Avatar>
          </div>
        </Menu.Target>
        
        <Menu.Dropdown>
          <Menu.Item onClick={handleLogout} leftSection={<IconLogout style={{ width: rem(14), height: rem(14) }} />}>
            Logout
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </header>
  );
}