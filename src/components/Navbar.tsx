import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../styles/navbar.module.css';
import UserAvatarDropdown from '../components/loggs';
import ContactUsForm from './ContactUsForm';
import DashboardSidebar from './DashboardSidebar';
import { useAuth } from '@/app/context/AuthContext';

export default function Navbar() {
  const { isLoggedIn } = useAuth();
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const toggleContactForm = () => setContactFormOpen(!contactFormOpen);

  useEffect(() => {
    // Fetch user details when logged in
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        const res = await fetch(`${apiUrl}/api/user/details`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (!res.ok) throw new Error(`Failed to fetch user details: ${res.statusText}`);
      } catch (err) {
        console.error('Error fetching user details:', err);
      }
    };

    if (isLoggedIn) fetchUserDetails();
  }, [isLoggedIn]);

  return (
    <>
      <nav className={styles.navbar}>
        <DashboardSidebar />

        {/* Logo Section */}
        <div className={styles.logo}>
          <Image src="/images/your-logo.png" alt="Logo" width={100} height={100} />
          <p>TANACOIN</p>
        </div>
        
        {/* Menu Links */}
        <div className={styles.menu}>
          <Link href="/">Home</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/about_us">About</Link>

          {/* Contact Us */}
          <a onClick={(e) => { e.stopPropagation(); toggleContactForm(); }} className={styles.contactLink}>
            <div className={styles.iconWithText}>
              <Image src="/images/mail_icon.svg" alt="Mail Icon" width={20} height={20} />
              <span className={styles.mail_text}>Contact Us</span>
            </div>
          </a>

          {/* User Avatar Dropdown */}
          <UserAvatarDropdown />
        </div>
        {/* Modals and Forms */}
        {contactFormOpen && (
          <div className={styles.modalOverlay} onClick={toggleContactForm}>
            <div onClick={(e) => e.stopPropagation()}>
              <ContactUsForm onClose={() => setContactFormOpen(false)} />
            </div>
          </div>
        )}
      </nav>
    </>
  );
}