"use client";
import React, { useState, useEffect } from 'react';
import './dashboard_css.css';
import Image from 'next/image';
import ConnectWalletButton from '../../components/Manage_dashboard';
import TransferTanacoinForm from '../../components/Transfer_tanacoins'; // Import TransferTanacoinForm

interface UserData {
  username: string;
  email: string;
  profile_picture: string | null;
  tnc_wallet_id: string;
  user_id: number;
  created_at: string;
}

interface WalletData {
  balance: string;
  tnc_wallet_unique_id: string;
  wallet_created_at: string;
  wallet_id: string | null;
}

const Dashboard = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const handleTabSwitch = (tabId: string) => {
    document.querySelectorAll('.tab').forEach((tab) => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach((content) => content.classList.remove('active'));

    document.getElementById(tabId)?.classList.add('active');
  };

  // Function to retrieve the session token (from localStorage or cookies)
  const getSessionToken = () => {
    return localStorage.getItem('token');
  };

  // Fetch user and wallet data when the component mounts
  useEffect(() => {
    const token = getSessionToken();
    setLoading(true);

    fetch(`${apiUrl}/dashboard/data`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const user = data.user_data[0];
        const wallet = data.wallet_data[0];
        setUserData(user);
        setWalletData(wallet);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        alert('There was an error fetching the data. Please try again later.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!userData || !walletData) {
    return <div>No user or wallet data found. Please log in.</div>;
  }

  return (
    <div className="container-dashboard">
      <header className="header">
        <h1>Welcome, <span id="username">{userData.username}</span></h1>
      </header>

      <main className="main-content">
        <section className="profile">
          <div className="profile-header">
            <Image
              id="profile-picture"
              className="profile-image"
              src={userData.profile_picture ? `data:image/jpeg;base64,${userData.profile_picture}` : '/default-profile.png'}
              alt="Profile Picture"
              width={150}
              height={150}
            />
            <div className="profile-info">
              <p><strong>Email:</strong> <span id="email">{userData.email}</span></p>
              <p><strong>Wallet ID:</strong> <span id="wallet-id"><ConnectWalletButton /></span></p>
              <p><strong>TNC Wallet ID:</strong> <span id="tnc-wallet-id">{userData.tnc_wallet_id}</span></p>
              <p><strong>Tanacoin Balance:</strong> <span id="tanacoin-balance">{walletData.balance}</span></p>
              <p><strong>Account Created On:</strong> <span id="created-at">{new Date(userData.created_at).toLocaleDateString()}</span></p>
            </div>
          </div>
        </section>

        <section className="tabs">
          <div className="tab active" onClick={() => handleTabSwitch('tab-overview')}>Overview</div>
          <div className="tab" onClick={() => handleTabSwitch('tab-send')}>Send Tanacoin</div>
          <div className="tab" onClick={() => handleTabSwitch('tab-purchase')}>Purchase Tanacoin</div>
        </section>

        <section id="tab-overview" className="tab-content">
          <h2>Overview</h2>
          {/* Overview content */}
        </section>

        <section id="tab-send" className="tab-content">
          <h2>Send Tanacoin</h2>
          <TransferTanacoinForm /> {/* Render the transfer form here */}
        </section>

      </main>
    </div>
  );
};

export default Dashboard;
