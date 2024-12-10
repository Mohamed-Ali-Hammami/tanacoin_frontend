import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Modal from 'react-modal';

// Ensure environment variables are defined
const INFURA_API_KEY = process.env.NEXT_PUBLIC_INFURA_API_KEY ?? '';
const RECEIVER_ADDRESS = process.env.NEXT_PUBLIC_RECEIVER_ADDRESS ?? '';
const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL??'';

if (!INFURA_API_KEY || !RECEIVER_ADDRESS) {
  console.error('Missing environment variables: INFURA_API_KEY or RECEIVER_ADDRESS');
}

type PaymentMethod = 'ETH' | 'USDT';

interface ConversionRates {
  ETH: number;
  USDT: number;
}

interface PurchaseTokenProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const PurchaseToken: React.FC<PurchaseTokenProps> = ({ isOpen, setIsOpen }) => {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [tanacoinAmount, setTanacoinAmount] = useState<number>(0);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ETH');
  const [conversionRates, setConversionRates] = useState<ConversionRates>({
    ETH: 0,
    USDT: 0,
  });

  // Fetch conversion rates on mount
  useEffect(() => {
    const fetchConversionRates = async () => {
      try {
        const response = await await fetch(`${apiUrl}/get_tanacoin_price`)
        const data = await response.json();
        setConversionRates({
          ETH: data.ETH || 0,
          USDT: data.USDT || 0,
        });
      } catch (error) {
        console.error('Error fetching conversion rates:', error);
      }
    };

    fetchConversionRates();
  }, []);

  // Initialize Web3
  useEffect(() => {
    const initWeb3 = async () => {
      try {
        const provider = new WalletConnectProvider({ infuraId: INFURA_API_KEY });
        const web3Instance = new Web3(provider);
        setWeb3(web3Instance);

        // Enable wallet and get accounts
        await provider.enable();
        const accounts = await web3Instance.eth.getAccounts();
        if (accounts.length > 0) setAccount(accounts[0]);
      } catch (error) {
        console.error('Error initializing Web3:', error);
      }
    };

    initWeb3();
  }, []);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setTanacoinAmount(value);
    setPaymentAmount(value * conversionRates[paymentMethod]);
  };

  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const method = e.target.value as PaymentMethod;
    setPaymentMethod(method);
    setPaymentAmount(tanacoinAmount * conversionRates[method]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tanacoinAmount || !paymentAmount || !account) {
      alert('Please fill in all fields correctly.');
      return;
    }

    try {
      if (web3) {
        if (paymentMethod === 'ETH') {
          const transactionValue = web3.utils.toWei(paymentAmount.toString(), 'ether');
          await web3.eth.sendTransaction({
            from: account,
            to: RECEIVER_ADDRESS,
            value: transactionValue,
          });
        } else if (paymentMethod === 'USDT') {
          const usdtContract = new web3.eth.Contract(
            [
              {
                constant: false,
                inputs: [
                  { name: '_to', type: 'address' },
                  { name: '_value', type: 'uint256' },
                ],
                name: 'transfer',
                outputs: [{ name: '', type: 'bool' }],
                type: 'function',
              },
            ],
            '<USDT_CONTRACT_ADDRESS>' // Replace with the actual USDT contract address
          );
          await usdtContract.methods
            .transfer(RECEIVER_ADDRESS, web3.utils.toWei(paymentAmount.toString(), 'ether'))
            .send({ from: account });
        }
        alert(`Purchase successful: ${tanacoinAmount} TNC for ${paymentAmount} ${paymentMethod}`);
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Error processing transaction:', error);
      alert('Transaction failed. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onRequestClose={() => setIsOpen(false)} contentLabel="Purchase Tanacoin">
      <h2>Purchase Tanacoins</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="purchase-amount">Amount of Tanacoins (TNC):</label>
          <input
            type="number"
            id="purchase-amount"
            value={tanacoinAmount}
            onChange={handleAmountChange}
            min="0"
            required
          />
        </div>
        <div>
          <label htmlFor="payment-method">Payment Method:</label>
          <select id="payment-method" value={paymentMethod} onChange={handlePaymentMethodChange} required>
            <option value="ETH">ETH</option>
            <option value="USDT">USDT</option>
          </select>
        </div>
        <div>
          <label htmlFor="payment-amount">Payment Amount:</label>
          <input type="number" id="payment-amount" value={paymentAmount} readOnly />
        </div>
        <button type="submit">Confirm Purchase</button>
      </form>
    </Modal>
  );
};

export default PurchaseToken;
