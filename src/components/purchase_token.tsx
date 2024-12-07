import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Modal from 'react-modal';

const INFURA_API_KEY = process.env.INFURA_API_KEY as string; // Ensure Infura API key is set in .env
const RECEIVER_ADDRESS = process.env.RECEIVER_ADDRESS as string; // Set the receiver address

const PurchaseToken: React.FC = () => {
    const [web3, setWeb3] = useState<Web3 | null>(null);
    const [account, setAccount] = useState<string | null>(null);
    const [tanacoinAmount, setTanacoinAmount] = useState<number>(0);
    const [paymentAmount, setPaymentAmount] = useState<number>(0);
    const [paymentMethod, setPaymentMethod] = useState<'ETH' | 'USDT'>('ETH');
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [conversionRates, setConversionRates] = useState<{ [key: string]: number }>({
        ETH: 0,
        USDT: 0,
    });

    useEffect(() => {
        const fetchConversionRates = async () => {
            try {
                const response = await fetch('https://your-api-endpoint/get_tanacoin_values');
                const data = await response.json();
                setConversionRates({
                    ETH: data.ETH,   // Set the fetched rate for ETH
                    USDT: data.USDT, // Set the fetched rate for USDT
                });
            } catch (error) {
                console.error('Error fetching conversion rates:', error);
            }
        };

        fetchConversionRates();
    }, []); // This will run only once when the component mounts

    useEffect(() => {
        const initWeb3 = async () => {
            const provider = new WalletConnectProvider({
                infuraId: INFURA_API_KEY,
            });
            const web3Instance = new Web3(provider);
            setWeb3(web3Instance);
        };
        initWeb3();
    }, []);

    useEffect(() => {
        if (web3) {
            const enableWallet = async () => {
                try {
                    const provider = web3.currentProvider;
                    if (provider) {
                        // Check if the provider is WalletConnectProvider and use its `enable` method
                        if (provider instanceof WalletConnectProvider) {
                            await provider.enable();
                        } else if ((provider as any).enable) {
                            // If it's another provider that has `enable` method (e.g. MetaMask)
                            await (provider as any).enable();
                        }
                        const accounts = await web3.eth.getAccounts();
                        if (accounts[0]) setAccount(accounts[0]);
                    } else {
                        console.error('Web3 provider is not available.');
                    }
                } catch (error) {
                    console.error("Wallet connection error:", error);
                }
            };
            enableWallet();
        }
    }, [web3]);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value) || 0;
        setTanacoinAmount(value);
        setPaymentAmount(value * conversionRates[paymentMethod]);
    };

    const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const method = e.target.value as 'ETH' | 'USDT';
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
                const transactionValue = paymentMethod === 'ETH'
                    ? web3.utils.toWei(paymentAmount.toString(), 'ether')
                    : 0;

                const tokenContractAddress = paymentMethod === 'USDT'
                    ? '<USDT_CONTRACT_ADDRESS>' // Set USDT contract address
                    : '';

                if (paymentMethod === 'ETH') {
                    await web3.eth.sendTransaction({
                        from: account,
                        to: RECEIVER_ADDRESS,
                        value: transactionValue,
                    });
                } else if (paymentMethod === 'USDT' && tokenContractAddress) {
                    const usdtContract = new web3.eth.Contract(
                        [
                            {
                                constant: false,
                                inputs: [
                                    { name: "_to", type: "address" },
                                    { name: "_value", type: "uint256" }
                                ],
                                name: "transfer",
                                outputs: [{ name: "", type: "bool" }],
                                type: "function"
                            }
                        ],
                        tokenContractAddress
                    );

                    await usdtContract.methods
                        .transfer(RECEIVER_ADDRESS, web3.utils.toWei(paymentAmount.toString(), 'ether'))
                        .send({ from: account });
                }

                alert(`Purchase successful: ${tanacoinAmount} TNC for ${paymentAmount} ${paymentMethod}`);
            }
        } catch (error) {
            console.error('Error processing transaction:', error);
            alert('Transaction failed. Please try again.');
        }
    };

    return (
        <div>
            <button onClick={() => setIsModalOpen(true)}>Buy Tanacoins</button>
            
            <Modal isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)} contentLabel="Purchase Tanacoin">
                <h2>Purchase Tanacoins</h2>
                <form id="purchase-tanacoin-form" onSubmit={handleSubmit}>
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
                        <select
                            id="payment-method"
                            value={paymentMethod}
                            onChange={handlePaymentMethodChange}
                            required
                        >
                            <option value="ETH">ETH</option>
                            <option value="USDT">USDT</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="payment-amount">Payment Amount:</label>
                        <input
                            type="number"
                            id="payment-amount"
                            value={paymentAmount}
                            readOnly
                        />
                    </div>

                    <button type="submit">Confirm Purchase</button>
                </form>
            </Modal>
        </div>
    );
};

export default PurchaseToken;
