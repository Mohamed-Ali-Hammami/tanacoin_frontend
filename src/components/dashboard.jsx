import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import WalletConnectProvider from '@walletconnect/web3-provider';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [tanacoinPrice, setTanacoinPrice] = useState(null);

  // Load sensitive keys from environment variables
  const INFURA_API_KEY = process.env.INFURA_API_KEY;
  const RECEIVER_ADDRESS = process.env.RECEIVER_ADDRESS;

  // Fetch user data when the component mounts
  useEffect(() => {
    fetch('/dashboard/data')
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
          return;
        }
        setUserData(data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        alert('There was an error fetching the data. Please try again later.');
      });
  }, []);

  const handleSendTanacoin = (event) => {
    event.preventDefault();
    const recipientId = event.target.recipientId.value;
    const amount = parseFloat(event.target.amount.value);

    fetch('/send_tanacoin', {
      method: 'POST',
      body: JSON.stringify({ recipient_id: recipientId, amount }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert('Tanacoin sent successfully!');
        } else {
          alert('Error sending Tanacoin');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('There was an error sending Tanacoin. Please try again later.');
      });
  };

  const handlePurchaseTanacoin = (event) => {
    event.preventDefault();
    const amountToPurchase = parseFloat(paymentAmount);
    const paymentMethodSelected = paymentMethod;

    fetch(`/get_tanacoin_price?payment_method=${paymentMethodSelected}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          const price = data.price;
          const paymentAmountInUSD = amountToPurchase * price;
          setTanacoinPrice(paymentAmountInUSD);

          initiateTransaction(amountToPurchase, paymentMethodSelected, paymentAmountInUSD, RECEIVER_ADDRESS);
        } else {
          alert('Error fetching Tanacoin price.');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('There was an error fetching the Tanacoin price. Please try again later.');
      });
  };

  const initiateTransaction = (amount, paymentMethod, paymentAmount, receiverAddress) => {
    let provider;

    if (window.ethereum && window.ethereum.isMetaMask) {
      provider = window.ethereum; // Use MetaMask
    } else {
      provider = new WalletConnectProvider({
        infuraId: INFURA_API_KEY,
      });
    }

    if (provider.request) {  // MetaMask and WalletConnect both use 'request' method
      provider.request({ method: 'eth_requestAccounts' })
        .then(async () => {
          const web3 = new Web3(provider);
          const accounts = await web3.eth.getAccounts();
          const senderAddress = accounts[0];

          const valueInWei = web3.utils.toWei(paymentAmount.toString(), 'ether'); // Convert to Wei

          const txData = {
            from: senderAddress,
            to: receiverAddress,
            value: valueInWei,
            gasLimit: 21000,
            gasPrice: '20000000000', // Adjust if necessary
          };

          try {
            const txHash = await web3.eth.sendTransaction(txData);
            alert('Transaction successful: ' + txHash);
          } catch (error) {
            console.error(error);
            alert('Transaction failed: ' + error.message);
          }
        }).catch((error) => {
          alert('Error with WalletConnect/MetaMask: ' + error.message);
        });
    }
  };

  const handleTabSwitch = (tabId) => {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    document.getElementById(tabId).classList.add('active');
  };

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container-dashboard">
      <header className="header">
        <h1>Welcome, <span id="username">{userData.username}</span></h1>
        <nav className="nav">
          <a href="#">Dashboard</a>
          <a href="#">Settings</a>
          <a href="#">Logout</a>
        </nav>
      </header>

      <main className="main-content">
        <section className="profile">
          <div className="profile-header">
            <img id="profile-picture" className="profile-image" src={userData.profile_picture ? `data:image/png;base64,${userData.profile_picture}` : '/static/images/default-profile.png'} alt="Profile Picture" />
            <div className="profile-info">
              <p><strong>Email:</strong> <span id="email">{userData.email}</span></p>
              <p><strong>Wallet ID:</strong> <span id="wallet-id">{userData.wallet_id}</span></p>
              <p><strong>TNC Wallet ID:</strong> <span id="tnc-wallet-id">{userData.tnc_wallet_id}</span></p>
              <p><strong>Tanacoin Balance:</strong> <span id="tanacoin-balance">{userData.total_balance}</span></p>
              <p><strong>Account Created On:</strong> <span id="created-at">{new Date(userData.created_at).toLocaleDateString()}</span></p>
            </div>
          </div>
        </section>

        <section className="tabs">
          <div className="tab active" onClick={() => handleTabSwitch('tab-overview')}>Overview</div>
          <div className="tab" onClick={() => handleTabSwitch('tab-transactions')}>Transactions</div>
          <div className="tab" onClick={() => handleTabSwitch('tab-leaderboard')}>Leaderboard</div>
        </section>

        <div className="tab-content" id="tab-overview">
          <h2>Overview</h2>
          <p>Your dashboard overview goes here.</p>
        </div>

        <div className="tab-content" id="tab-transactions">
          <h2>Transactions</h2>
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Transaction ID</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {/* Transaction data will be populated here */}
            </tbody>
          </table>

          <h3>Send Tanacoin</h3>
          <form id="send-tanacoin-form" onSubmit={handleSendTanacoin}>
            <label htmlFor="recipient-id">Recipient Wallet ID:</label>
            <input type="text" id="recipient-id" name="recipientId" required />
            <label htmlFor="send-amount">Amount:</label>
            <input type="number" id="send-amount" name="amount" required min="0.01" step="0.01" />
            <button type="submit">Send Tanacoin</button>
          </form>

          <div className="purchase-tanacoin-section">
            <h2>Purchase Tanacoin</h2>
            <form id="purchase-tanacoin-form" onSubmit={handlePurchaseTanacoin}>
              <label htmlFor="purchase-amount">Amount of Tanacoin to Purchase:</label>
              <input
                type="number"
                id="purchase-amount"
                name="purchase-amount"
                min="0"
                step="any"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                required
              />

              <label htmlFor="payment-method">Payment Method:</label>
              <select
                id="payment-method"
                name="payment-method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="ETH">Ethereum (ETH)</option>
                <option value="USDT">Tether (USDT)</option>
              </select>

              <label htmlFor="payment-amount">Payment Amount (in selected method):</label>
              <input
                type="number"
                id="payment-amount"
                name="payment-amount"
                min="0"
                step="any"
                value={tanacoinPrice || ''}
                readOnly
              />

              <button type="submit">Confirm Purchase</button>
            </form>
          </div>
        </div>

        <div className="tab-content" id="tab-leaderboard">
          <h2>Leaderboard</h2>
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Tanacoin Balance</th>
              </tr>
            </thead>
            <tbody>
              {/* Leaderboard data will be populated here */}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
