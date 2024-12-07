// walletConnect.js --- add the purchase functionality here

// Handle WalletConnect login (signup if not registered)
async function handleWalletConnectLogin() {
    try {
        const provider = new WalletConnectProvider.default({
            infuraId: 'YOUR_INFURA_PROJECT_ID',  // Replace with your Infura Project ID
        });

        await provider.enable();
        const web3 = new Web3(provider);
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];

        console.log('WalletConnect connected:', account);

        // Check if the wallet is already registered with the backend
        const isWalletRegistered = await checkWalletRegistration(account);

        if (isWalletRegistered) {
            // Wallet is already registered, log the user in
            loginWalletUser(account);
        } else {
            // Wallet is not registered, create a new user
            createWalletUser(account);
        }
    } catch (error) {
        console.error('Error connecting wallet:', error);
        alert('Error connecting wallet: ' + error.message);
    }
}

// Check if the wallet is registered in the backend
async function checkWalletRegistration(walletAddress) {
    try {
        const response = await fetch('/check_wallet_registration', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                wallet_address: walletAddress,
            }),
        });
        const data = await response.json();
        return data.is_registered; // Expecting response: { is_registered: true/false }
    } catch (error) {
        console.error('Error checking wallet registration:', error);
        return false;
    }
}

// Create a new user in the backend using the wallet address
async function createWalletUser(walletAddress) {
    try {
        const response = await fetch('/register_wallet_user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                wallet_address: walletAddress,
            }),
        });
        const data = await response.json();
        if (data.success) {
            console.log('New wallet user created successfully!');
            alert('New wallet user created! Redirecting to login...');
            window.location.href = "/login"; // Redirect to login page after wallet registration
        } else {
            console.error('Error creating new user:', data.message);
        }
    } catch (error) {
        console.error('Error registering new wallet user:', error);
    }
}

// Log the user in using the wallet address
async function loginWalletUser(walletAddress) {
    try {
        const response = await fetch('/login_wallet_user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                wallet_address: walletAddress,
            }),
        });
        const data = await response.json();
        if (data.success) {
            console.log('Wallet user logged in successfully!');
            alert('Wallet login successful!');
            window.location.href = "/dashboard"; // Redirect to dashboard after successful login
        } else {
            console.error('Login failed:', data.message);
        }
    } catch (error) {
        console.error('Error logging in wallet user:', error);
    }
}

// Purchase functionality
async function handlePurchase(amount, recipientAddress) {
    try {
        const provider = new WalletConnectProvider.default({
            infuraId: 'YOUR_INFURA_PROJECT_ID',  // Replace with your Infura Project ID
        });

        await provider.enable();
        const web3 = new Web3(provider);
        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];

        // Create a transaction to send the specified amount to the recipient address
        const tx = {
            from: account,
            to: recipientAddress,  // Recipient wallet address (can be a merchant or contract address)
            value: web3.utils.toHex(web3.utils.toWei(amount, 'ether')),  // Convert amount to Wei (for ETH)
            gas: 21000,  // Basic gas limit for a standard ETH transfer
            gasPrice: web3.utils.toHex(web3.utils.toWei('20', 'gwei')), // Gas price (can be adjusted)
        };

        // Send the transaction
        const result = await web3.eth.sendTransaction(tx);
        console.log('Transaction Result:', result);

        // Optionally, send the transaction result to your backend for further processing
        await sendTransactionToBackend(result.transactionHash, account, amount);

        alert('Purchase successful! Transaction hash: ' + result.transactionHash);
    } catch (error) {
        console.error('Error during purchase:', error);
        alert('Error during purchase: ' + error.message);
    }
}

// Send transaction details to the backend (e.g., store the transaction record)
async function sendTransactionToBackend(txHash, walletAddress, amount) {
    try {
        const response = await fetch('/store_transaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                transaction_hash: txHash,
                wallet_address: walletAddress,
                amount: amount,
            }),
        });

        const data = await response.json();
        if (data.success) {
            console.log('Transaction saved to the backend.');
        } else {
            console.error('Error saving transaction to backend:', data.message);
        }
    } catch (error) {
        console.error('Error sending transaction to backend:', error);
    }
}

