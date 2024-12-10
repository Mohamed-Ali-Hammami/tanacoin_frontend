"use client";

import React, { useState, useRef } from "react";
import { TfiAlignJustify } from "react-icons/tfi";
import styles from "../styles/DashboardSidebar.module.css";
import Link from "next/link";
import UserAvatarDropdown from "../components/loggs";
import Image from "next/image";
import ContactUsForm from "./ContactUsForm";

const DashboardSidebar: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isContactFormOpen, setIsContactFormOpen] = useState<boolean>(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Toggle sidebar visibility
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  // Toggle contact form visibility
  const toggleContactForm = () => setIsContactFormOpen((prev) => !prev);


  return (
    <>
      {/* Sidebar toggle button */}
      <button
        onClick={toggleSidebar}
        className={styles.toggleButton}
        aria-label={isSidebarOpen ? "Hide menu" : "Show menu"}
      >
        <TfiAlignJustify size={24} />
      </button>

      {/* Sidebar content */}
      {isSidebarOpen && (
        <>
          {/* Overlay to close sidebar */}
          <div
            className={styles.sidebarOverlay}
            onClick={() => setIsSidebarOpen(false)}
          />

          {/* Sidebar */}
          <div ref={sidebarRef} className={styles.sidebarOpen}>
            <nav className={styles.menu}>
              {/* User Avatar Section */}
              <div className={styles.userAvatarContainer}>
                <UserAvatarDropdown />
              </div>

              <h2 className={styles.menuTitle}>Navigation</h2>

              {/* Navigation Links */}
              <Link href="/" onClick={toggleSidebar} className={styles.menuItem}>
                Home
              </Link>
              <Link href="/dashboard" onClick={toggleSidebar} className={styles.menuItem}>
                Dashboard
              </Link>
              <Link href="/products" onClick={toggleSidebar} className={styles.menuItem}>
                Products
              </Link>
              <Link href="/about_us" onClick={toggleSidebar} className={styles.menuItem}>
                About Us
              </Link>
            </nav>

            {/* Contact Us Button */}
            <div className={styles.contactUsContainer}>
              <button
                onClick={toggleContactForm}
                className={styles.contactus}
              >
                <Image
                  src="/images/mail_icon.svg"
                  alt="Mail Icon"
                  width={20}
                  height={20}
                />
                <span>Contact</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Contact Us form modal */}
      {isContactFormOpen && (
        <div
          className={styles.modalOverlay}
          onClick={toggleContactForm}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <ContactUsForm onClose={toggleContactForm} />
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardSidebar;
