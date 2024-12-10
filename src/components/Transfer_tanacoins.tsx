import React, { useState } from 'react';

const TransferTanacoinForm: React.FC = () => {
  const [recipientWalletId, setRecipientWalletId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!recipientWalletId || !amount) {
      setErrorMessage('Please provide both recipient ID and amount.');
      return;
    }

    const token = localStorage.getItem('token'); // Retrieve token from local storage

    if (!token) {
      setErrorMessage('Authentication token is missing.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`${apiUrl}/dashboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        },
        body: JSON.stringify({
          action: 'transfer',
          recipient_tnc_wallet_id: recipientWalletId,
          amount: parseFloat(amount),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccessMessage(result.message); // Show success message on success
      } else {
        setErrorMessage(result.error || 'An error occurred during the transfer.');
      }
    } catch (error) {
      console.error(error);
      setErrorMessage('An unexpected error occurred while processing the transfer.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <h3>Transfer Tanacoin</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            TNC wallet address:
            <input
              type="text"
              value={recipientWalletId}
              onChange={(e) => setRecipientWalletId(e.target.value)}
              placeholder="Recipient ID"
            />
          </label>
        </div>
        <div>
          <label>
            Amount:
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount to transfer"
            />
          </label>
        </div>
        <button type="submit" disabled={isProcessing}>
          {isProcessing ? 'Processing...' : 'Transfer Tanacoin'}
        </button>
      </form>

      {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
      {successMessage && <div style={{ color: 'green' }}>{successMessage}</div>}
    </div>
  );
};

export default TransferTanacoinForm;