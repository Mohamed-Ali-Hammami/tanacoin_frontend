import React, { useState } from 'react';
import { useAuth } from '../app/context/AuthContext';

const ConnectWalletButton: React.FC = () => {
  const { connectWalletWithoutApi, walletAddress } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConnectWallet = async () => {
    try {
      setErrorMessage(null);
      setIsConnecting(true);
      await connectWalletWithoutApi();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
      console.error(message);
      setErrorMessage(message);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleConnectWallet}
        disabled={isConnecting || !!walletAddress}
      >
        {isConnecting ? 'Connecting...' : walletAddress ? 'Wallet Connected' : 'Connect Wallet'}
      </button>
      {errorMessage && <span style={{ color: 'red' }}>{errorMessage}</span>}
    </div>
  );
};

export default ConnectWalletButton;
