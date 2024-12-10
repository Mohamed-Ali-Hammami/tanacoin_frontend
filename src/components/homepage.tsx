"use client";
import React, { useEffect, useState } from "react";
import PurchaseToken from "./purchase_token";
import Login from "../components/loginUser"; // Login component
import RegisterUser from "../components/registerUser"; // RegisterUser component

// Type for countdown state
interface Countdown {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

const HomePage: React.FC = () => {
  const [totalSupply, setTotalSupply] = useState<string>("Loading...");
  const [countdown, setCountdown] = useState<Countdown>({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);
  const [userName, setUserName] = useState<string | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Async function to fetch total supply
  const fetchTokenSupply = async () => {
    try {
      const response = await fetch(`${apiUrl}/token-supply`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      if (data && data.totalSupply) {
        setTotalSupply(data.totalSupply.toString());
      } else {
        console.error("Invalid response structure:", data);
        setTotalSupply("Error: Invalid data format.");
      }
    } catch (error) {
      console.error("Error fetching token supply:", error);
      setTotalSupply("Error loading supply.");
    }
  };
  
  useEffect(() => {
    // Fetch total token supply from the server
    fetchTokenSupply();

    // Countdown Timer
    const launchDate = new Date("April 3, 2024 00:00:00").getTime();
    const countdownTimer = setInterval(() => {
      const now = new Date().getTime();
      const timeLeft = launchDate - now;

      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      setCountdown({
        days: String(days).padStart(2, "0"),
        hours: String(hours).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
        seconds: String(seconds).padStart(2, "0"),
      });

      if (timeLeft < 0) {
        clearInterval(countdownTimer);
        setCountdown({
          days: "00",
          hours: "00",
          minutes: "00",
          seconds: "00",
        });
      }
    }, 1000);

    // Load user details from localStorage
    const storedUser = localStorage.getItem("user_details");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(user.name || "User");
    }

    return () => clearInterval(countdownTimer); // Clean up on unmount
  }, []);

  return (
    <div className="main-container">
      {/* Hero Section */}
      <header className="hero-container">
        <div className="hero-content">
          {userName ? (
            <h1 className="hero-title">Welcome back, {userName}!</h1>
          ) : (
            <h1 className="hero-title">Welcome to the Tanacoin Launch!</h1>
          )}
          <p className="hero-description">
            Exclusive Weekend Discount! Get{" "}
            <span className="highlight-text">-25%</span> off the token price, every weekend!
          </p>
          <div className="auth-buttons">
            {!userName && (
              <>
                <button onClick={() => setIsLoginModalOpen(true)} className="cta-button">
                  Login
                </button>
                <button onClick={() => setIsRegisterModalOpen(true)} className="cta-button">
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Token Details Section */}
      <section id="details" className="token-details-container">
        <div className="token-info">
          <h2>About Tanacoin</h2>
          <p className="token-description">
            Tanacoin is a revolutionary digital asset designed to bring decentralization, transparency, and security to the blockchain ecosystem.
          </p>
          <ul className="token-features">
            <li>Token Type: ERC-20</li>
            <li>Launch Date: 3rd April</li>
            <li>Total Supply: <span>{totalSupply}</span> TNC</li>
            <li>Price (Pre-sale): $0.10 per token</li>
          </ul>
        </div>

        <div className="token-promo">
          <h2>Exclusive Weekend Offer</h2>
          <p className="promo-text">
            Buy Tanacoins this weekend and get <strong>-25%</strong> off the regular price!
          </p>
          <p className="promo-terms">
            Offer valid only until Sunday midnight. Don’t miss out!
          </p>
          <button onClick={() => setIsPurchaseModalOpen(true)} className="cta-button">
            Buy Now
          </button>
        </div>
      </section>

      {/* Countdown Section */}
      <section className="countdown-container">
        <h2>Countdown to Launch</h2>
        <div id="countdown-timer" className="countdown-timer">
          <div className="countdown-item">
            <span>{countdown.days}</span>
            <p>Days</p>
          </div>
          <div className="countdown-item">
            <span>{countdown.hours}</span>
            <p>Hours</p>
          </div>
          <div className="countdown-item">
            <span>{countdown.minutes}</span>
            <p>Minutes</p>
          </div>
          <div className="countdown-item">
            <span>{countdown.seconds}</span>
            <p>Seconds</p>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="footer-container">
        <p>&copy; 2024 Tanacoin Launch. All rights reserved.</p>
      </footer>

      {/* Modals */}
      <PurchaseToken isOpen={isPurchaseModalOpen} setIsOpen={setIsPurchaseModalOpen} />
      <Login isOpen={isLoginModalOpen} setIsOpen={setIsLoginModalOpen} />
      <RegisterUser isOpen={isRegisterModalOpen} setIsOpen={setIsRegisterModalOpen} />
    </div>
  );
};

export default HomePage;
