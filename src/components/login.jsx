import React, { useState } from 'react';
import Web3 from 'web3';
import WalletConnectProvider from '@walletconnect/web3-provider';

const Login = () => {
  const [errorMessages, setErrorMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Function to handle the wallet connection
  const handleWalletConnect = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      let web3;
      let walletAddress;

      // Check if the browser is connected to an Ethereum-compatible extension (e.g., MetaMask)
      if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      } else {
        // Fallback to WalletConnect if no extension is found
        const provider = new WalletConnectProvider({
          infuraId: process.env.REACT_APP_INFURA_PROJECT_ID, // Loaded from .env
        });
        await provider.enable();
        web3 = new Web3(provider);
      }

      // Get the wallet accounts (addresses)
      const accounts = await web3.eth.getAccounts();
      walletAddress = accounts[0];

      // Get the current network (Mainnet, Ropsten, etc.)
      const networkId = await web3.eth.net.getId();
      const chainId = await web3.eth.getChainId();

      const formData = {
        wallet_connect: true,
        wallet_address: walletAddress,
        chain_id: chainId,
        network_id: networkId,
      };

      await loginUser(formData);
    } catch (error) {
      console.error('WalletConnect or MetaMask connection failed:', error);
      setErrorMessages(['Une erreur est survenue lors de la connexion du portefeuille.']);
    } finally {
      setLoading(false);
    }
  };
  const loginUser = async (formData) => {
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        if (data.token) {
          localStorage.setItem('token', data.token); // Store JWT token
        }
  
        if (data.user) {
          localStorage.setItem('user_details', JSON.stringify(data.user)); // Store user details
        }
  
        window.location.href = '/dashboard'; // Redirect to dashboard
      } else {
        setErrorMessages([data.message || 'An error occurred during login.']);
      }
    } catch (error) {
      console.error('Error during login:', error);
      setErrorMessages([`An error occurred: ${error.message}`]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const identifier = e.target.identifier.value;
    const password = e.target.password.value;

    const formData = {
      wallet_connect: false,
      identifier,
      password,
    };

    await loginUser(formData);
  };

  return (
    <div className="container">
      <div className="form-container">
        <h1>Connexion</h1>

        {/* Display Error Messages */}
        {errorMessages.length > 0 && (
          <div id="error-messages">
            {errorMessages.map((msg, index) => (
              <div key={index} className="error-message">{msg}</div>
            ))}
          </div>
        )}

        <form id="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="identifier">Nom d'utilisateur ou Email :</label>
            <input type="text" id="identifier" name="identifier" required />
          </div>
          <div className="input-group">
            <label htmlFor="password">Mot de passe :</label>
            <input type="password" id="password" name="password" required />
          </div>

          {/* Hidden fields for WalletConnect */}
          <input type="hidden" id="wallet_connect" name="wallet_connect" value="false" />
          <input type="hidden" id="wallet_address" name="wallet_address" value="" />

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Chargement...' : 'Se connecter'}
          </button>
        </form>

        <p className="login-link">
          Pas encore inscrit ? <a href="/signup">S'inscrire</a>
        </p>

        {/* Button for wallet connection */}
        <button
          id="connect-wallet-button"
          className="wallet-connect-btn"
          onClick={handleWalletConnect}
          disabled={loading}
        >
          {loading ? 'Chargement...' : 'Se connecter avec MetaMask ou WalletConnect'}
        </button>
      </div>
    </div>
  );
};

export default Login;
