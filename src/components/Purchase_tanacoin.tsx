import React, { useState } from "react";
import { ethers } from "ethers";
import WalletConnectProvider from "@walletconnect/web3-provider";
import QRCode from "qrcode.react";

interface PurchaseProps {
  receiverAddress: string; // The receiver's wallet address
  network: string; // Blockchain network (e.g., "homestead" for Ethereum Mainnet)
}

const PurchaseComponent: React.FC<PurchaseProps> = ({ receiverAddress, network }) => {
  const [selectedMethod, setSelectedMethod] = useState<"metamask" | "walletconnect" | "qrcode" | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const handlePurchase = async () => {
    if (!amount || amount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    try {
      setError(null);
      setIsLoading(true);

      if (selectedMethod === "metamask") {
        if (!window.ethereum) {
          setError("MetaMask is not installed.");
          return;
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        const transaction = await signer.sendTransaction({
          to: receiverAddress,
          value: ethers.utils.parseEther(amount.toString()),
        });

        setTransactionHash(transaction.hash);

        const receipt = await transaction.wait();
        if (receipt.status === 1) {
          setConfirmation("Transaction confirmed successfully!");
        } else {
          setError("Transaction failed.");
        }
      } else if (selectedMethod === "walletconnect") {
        const walletConnectProvider = new WalletConnectProvider({
          rpc: {
            1: `https://${network}.infura.io/v3/YOUR_INFURA_PROJECT_ID`, // Replace with your Infura ID
          },
        });

        await walletConnectProvider.enable();
        const provider = new ethers.providers.Web3Provider(walletConnectProvider);

        const signer = provider.getSigner();
        const transaction = await signer.sendTransaction({
          to: receiverAddress,
          value: ethers.utils.parseEther(amount.toString()),
        });

        setTransactionHash(transaction.hash);

        const receipt = await provider.waitForTransaction(transaction.hash);
        if (receipt.confirmations > 0) {
          setConfirmation("Transaction confirmed successfully!");
        } else {
          setError("Transaction failed.");
        }

        walletConnectProvider.disconnect();
      }
    } catch (err) {
      setError((err as Error).message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Purchase</h2>

      <label>
        Enter Amount (ETH):
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          min="0.0001"
          step="0.0001"
        />
      </label>

      <div>
        <button onClick={() => setSelectedMethod("metamask")}>Use MetaMask</button>
        <button onClick={() => setSelectedMethod("walletconnect")}>Use WalletConnect</button>
        <button onClick={() => setSelectedMethod("qrcode")}>Display QR Code</button>
      </div>

      {selectedMethod === "qrcode" && (
        <div>
          <h3>Scan this QR Code to send:</h3>
          <QRCode value={receiverAddress} />
          <p>Receiver Address: {receiverAddress}</p>
        </div>
      )}

      {(selectedMethod === "metamask" || selectedMethod === "walletconnect") && (
        <button onClick={handlePurchase} disabled={isLoading}>
          {isLoading ? "Processing..." : "Confirm Purchase"}
        </button>
      )}

      {transactionHash && (
        <div>
          <p>Transaction Hash: {transactionHash}</p>
          <a
            href={`https://etherscan.io/tx/${transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Etherscan
          </a>
        </div>
      )}

      {confirmation && <p style={{ color: "green" }}>{confirmation}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default PurchaseComponent;
