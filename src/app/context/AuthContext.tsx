import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import Web3 from 'web3';
import WalletConnectProvider from '@walletconnect/web3-provider';

interface DecodedToken {
  exp: number;
  user_id?: number;
  role?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  isSuperuser: boolean;
  user?: DecodedToken;
  token?: string;
  walletConnected: boolean;
  walletAddress?: string;
  formattedBalance?: string;
  networkId?: number;
  chainId?: number;
  loginWithCredentials: (formData: any) => Promise<void>;
  connectWallet: () => Promise<void>;
  connectWalletWithoutApi: () => Promise<void>; // New function
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSuperuser, setIsSuperuser] = useState(false);
  const [user, setUser ] = useState<DecodedToken | undefined>();
  const [token, setToken] = useState<string | undefined>();
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | undefined>();
  const [formattedBalance, setFormattedBalance] = useState<string | undefined>();
  const [networkId, setNetworkId] = useState<number | undefined>();
  const [chainId, setChainId] = useState<number | undefined>();
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const infuraApiKey = process.env.NEXT_PUBLIC_INFURA_API_KEY;

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedWallet = localStorage.getItem('wallet_address');

    if (storedToken) {
      try {
        const decoded = jwtDecode<DecodedToken>(storedToken);
        if (decoded.exp * 1000 > Date.now()) {
          setIsLoggedIn(true);
          setUser (decoded);
          setIsSuperuser(decoded.role === 'superuser');
          setToken(storedToken);
        } else {
          localStorage.removeItem('token');
        }
      } catch {
        localStorage.removeItem('token');
      }
    }

    if (storedWallet) {
      setWalletConnected(true);
      setWalletAddress(storedWallet);
    }
  }, []);

  const loginWithCredentials = async (formData: any) => {
    try {
      const response = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');

      const user: DecodedToken = {
        exp: data.exp,
        user_id: data.user_id,
        role: data.is_superuser ? 'superuser' : 'user',
      };

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser (user);
      setIsLoggedIn(true);
      setIsSuperuser(data.is_superuser);
      window.location.href = data.is_superuser ? '/superuser_dashboard' : '/dashboard';
    } catch (error) {
      console.error('Login failed:', error instanceof Error ? error.message : error);
    }
  };

  const connectWallet = async () => {
    try {
      let web3: Web3;
      let formattedBalance = "0";
      if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      } else if (infuraApiKey) {
        const provider = new WalletConnectProvider({ infuraId: infuraApiKey });
        await provider.enable();
        web3 = new Web3(provider);
      } else {
        throw new Error('No Ethereum wallet detected or Infura API key missing.');
      }
  
      const accounts = await web3.eth.getAccounts();
      if (accounts.length > 0) {
        const walletAddress = accounts[0];
        const balance = await web3.eth.getBalance(walletAddress);
        formattedBalance = web3.utils.fromWei(balance, "ether");
        const networkId = Number(await web3.eth.net.getId());
        const chainId = Number(await web3.eth.getChainId());
        localStorage.setItem('wallet_address', walletAddress);
        setWalletAddress(walletAddress);
        setFormattedBalance(formattedBalance);
        setNetworkId(networkId);
        setChainId(chainId);
        setWalletConnected(true);


        const response = await fetch(`${apiUrl}/connect_wallet`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wallet_address: walletAddress,
            chain_id: chainId,
            network_id: networkId,
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Wallet connection failed');

        const user: DecodedToken = {
          exp: data.exp,
          user_id: data.user_id,
          role: data.is_superuser ? 'superuser' : 'user',
        };

        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser (user);
        setIsLoggedIn(true);
        setIsSuperuser(data.is_superuser);
        window.location.href = data.is_superuser ? '/superuser_dashboard' : '/dashboard';
      }
    } catch (error) {
      console.error('Wallet connection failed:', error instanceof Error ? error.message : error);
    }
  };
  const connectWalletWithoutApi = async () => {
    try {
      let web3: Web3;
      if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      } else if (infuraApiKey) {
        const provider = new WalletConnectProvider({ infuraId: infuraApiKey });
        await provider.enable();
        web3 = new Web3(provider);
      } else {
        throw new Error('No Ethereum wallet detected or Infura API key missing.');
      }
  
      const accounts = await web3.eth.getAccounts();
      if (accounts.length > 0) {
        const walletAddress = accounts[0];
        const balance = await web3.eth.getBalance(walletAddress);
        const formattedBalance = web3.utils.fromWei(balance, "ether");
        const networkId = Number(await web3.eth.net.getId());
        const chainId = Number(await web3.eth.getChainId());
  
        localStorage.setItem('wallet_address', walletAddress);
        setWalletAddress(walletAddress);
        setFormattedBalance(formattedBalance);
        setNetworkId(networkId);
        setChainId(chainId);
        setWalletConnected(true);
  
        // Perform API call after wallet is connected
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Session token is missing.');
        }
  
        const decodedToken: DecodedToken = jwtDecode<DecodedToken>(token);
        const userId = decodedToken.user_id;
  
        if (!userId) {
          throw new Error('User ID is missing from the token.');
        }
  
        const response = await fetch(`${apiUrl}/dashboard`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            wallet_address: walletAddress,
            user_id: userId, // Include user_id in the body
            action: 'add_wallet',
          }),
        });
  
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || 'Failed to update wallet on the server.');
        }
  
        console.log('Wallet updated successfully:', result.message);
      }
    } catch (error) {
      console.error(
        'Wallet connection without API failed:',
        error instanceof Error ? error.message : error
      );
    }
  };
  
  

  const logout = async () => {
    try {
      // Remove stored token and wallet address
      localStorage.removeItem('token');
      localStorage.removeItem('wallet_address');

      // Reset authentication state
      setToken(undefined);
      setUser (undefined);
      setIsLoggedIn(false);
      setIsSuperuser(false);
      setWalletConnected(false);
      setWalletAddress(undefined);
      setFormattedBalance(undefined);
      setNetworkId(undefined);
      setChainId(undefined);

      // Disconnect WalletConnect if used
      if (window.ethereum && (window.ethereum as any).isWalletConnect) {
        const provider = (window.ethereum as any).walletConnectProvider;
        if (provider && provider.disconnect) {
          await provider.disconnect();
        }
      }
    } catch (error) {
      console.error('Error during logout:', error instanceof Error ? error.message : error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isSuperuser,
        user,
        token,
        walletConnected,
        walletAddress,
        formattedBalance,
        networkId,
        chainId,
        loginWithCredentials,
        connectWallet,
        connectWalletWithoutApi, // Expose the new function
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};