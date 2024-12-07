import React, { useState } from 'react';
import Web3 from 'web3';
import WalletConnectProvider from '@walletconnect/web3-provider';

function RegistrationForm() {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        password: '',
        confirm_password: '',
        wallet_connect: false,
        wallet_address: '',
    });

    const [errors, setErrors] = useState([]);
    const [walletInfo, setWalletInfo] = useState(null);

    const infuraApiKey = process.env.REACT_APP_INFURA_API_KEY; // Use your Infura API key from .env

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm(formData);
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }

        await registerUser(formData);
    };

    const handleWalletConnect = async () => {
        try {
            let web3;
            let walletAddress;
            let formattedBalance = '0';

            if (window.ethereum) {
                web3 = new Web3(window.ethereum);
                await window.ethereum.request({ method: 'eth_requestAccounts' });
            } else {
                const provider = new WalletConnectProvider({
                    infuraId: infuraApiKey,
                });
                await provider.enable();
                web3 = new Web3(provider);
            }

            const accounts = await web3.eth.getAccounts();
            walletAddress = accounts[0];
            const networkId = await web3.eth.net.getId();
            const chainId = await web3.eth.getChainId();
            const balance = await web3.eth.getBalance(walletAddress);
            formattedBalance = web3.utils.fromWei(balance, 'ether');

            const sessionId = generateSessionId();
            const uniqueIdentifier = `${walletAddress}-${sessionId}`;

            setWalletInfo({
                walletAddress,
                formattedBalance,
                networkId,
                chainId,
                uniqueIdentifier,
            });

            setFormData((prevState) => ({
                ...prevState,
                wallet_connect: true,
                wallet_address: walletAddress,
            }));

        } catch (error) {
            console.error('WalletConnect or MetaMask connection failed:', error);
            alert('Une erreur est survenue lors de la connexion du portefeuille.');
        }
    };

    const generateSessionId = () => {
        const randomValues = new Uint8Array(16);
        window.crypto.getRandomValues(randomValues);

        randomValues[6] = (randomValues[6] & 0x0f) | 0x40;
        randomValues[8] = (randomValues[8] & 0x3f) | 0x80;

        const sessionId = [...randomValues].map((byte) => {
            return (byte + 0x100).toString(16).substr(1);
        }).join('');

        return `${sessionId.substr(0, 8)}-${sessionId.substr(8, 4)}-${sessionId.substr(12, 4)}-${sessionId.substr(16, 4)}-${sessionId.substr(20, 12)}`;
    };

    const validateForm = (data) => {
        const errors = [];
        const fieldNames = {
            first_name: 'Prénom',
            last_name: 'Nom',
            username: 'Nom d\'utilisateur',
            email: 'Adresse e-mail',
            password: 'Mot de passe',
            confirm_password: 'Confirmer le mot de passe',
        };

        const requiredFields = ['first_name', 'last_name', 'username', 'email', 'password', 'confirm_password'];
        requiredFields.forEach((field) => {
            if (!data[field]) {
                errors.push(`${fieldNames[field]} est requis.`);
            }
        });

        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(data.email)) {
            errors.push('L\'adresse e-mail n\'est pas valide.');
        }

        if (data.password !== data.confirm_password) {
            errors.push('Les mots de passe ne correspondent pas.');
        }

        return errors;
    };

    const registerUser = async (data) => {
        try {
            const response = await fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const responseData = await response.json();
            if (response.ok) {
                window.location.href = `/success/${responseData.username}`;
            } else {
                setErrors([responseData.message || 'Une erreur est survenue lors de l\'inscription.']);
            }
        } catch (error) {
            console.error('Error during registration:', error);
            setErrors([`Une erreur est survenue : ${error.message}`]);
        }
    };

    return (
        <div className="container">
            <div className="form-container">
                <h1>Inscription</h1>
                {errors.length > 0 && (
                    <div id="error-messages" style={{ display: 'block' }}>
                        {errors.map((error, index) => (
                            <div key={index} className="error-message">{error}</div>
                        ))}
                    </div>
                )}

                <form id="signup-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="username">Nom d'utilisateur :</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="first_name">Prénom :</label>
                        <input
                            type="text"
                            id="first_name"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="last_name">Nom :</label>
                        <input
                            type="text"
                            id="last_name"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="email">Adresse email :</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Mot de passe :</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="confirm_password">Confirmer le mot de passe :</label>
                        <input
                            type="password"
                            id="confirm_password"
                            name="confirm_password"
                            value={formData.confirm_password}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <input
                        type="hidden"
                        id="wallet_connect"
                        name="wallet_connect"
                        value={formData.wallet_connect}
                    />
                    <input
                        type="hidden"
                        id="wallet_address"
                        name="wallet_address"
                        value={formData.wallet_address}
                    />

                    <button type="submit" className="submit-btn">S'inscrire</button>
                </form>

                <p className="login-link">
                    Déjà inscrit ? <a href="/login">Se connecter</a>
                </p>

                <button
                    id="connect-wallet-button"
                    className="wallet-connect-btn"
                    onClick={handleWalletConnect}
                >
                    Ou connectez votre portefeuille pour créer un compte
                </button>

                {walletInfo && (
                    <div className="wallet-info">
                        <p><strong>Wallet Address:</strong> {walletInfo.walletAddress}</p>
                        <p><strong>Balance:</strong> {walletInfo.formattedBalance} ETH</p>
                        <p><strong>Network ID:</strong> {walletInfo.networkId}</p>
                        <p><strong>Chain ID:</strong> {walletInfo.chainId}</p>
                        <p><strong>Unique Identifier:</strong> {walletInfo.uniqueIdentifier}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default RegistrationForm;
