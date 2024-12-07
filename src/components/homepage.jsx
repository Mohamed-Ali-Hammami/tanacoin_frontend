import React, { useEffect, useState } from "react";
import PurchaseToken from './purchase_token';

const HomePage = () => {
  const [totalSupply, setTotalSupply] = useState("Loading...");
  const [countdown, setCountdown] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false); // State to control modal visibility

  useEffect(() => {
    // Fetch total token supply from the server and update the display
    fetch("/api/token-supply")
      .then((response) => response.json())
      .then((data) => {
        setTotalSupply(data.totalSupply);
      })
      .catch((error) => {
        console.error("Error fetching token supply:", error);
        setTotalSupply("Error loading supply.");
      });

    // Countdown Timer Script
    const launchDate = new Date("April 3, 2024 00:00:00").getTime();
    const countdownTimer = setInterval(() => {
      const now = new Date().getTime();
      const timeLeft = launchDate - now;

      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      setCountdown({
        days,
        hours,
        minutes,
        seconds,
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

    return () => clearInterval(countdownTimer); // Clean up on unmount
  }, []);

  return (
    <div className="main-container">
      {/* Hero Section */}
      <header className="hero-container">
        <div className="hero-content">
          <h1 className="hero-title">Get Ready for the Big Tanacoin Launch!</h1>
          <p className="hero-description">
            Exclusive Weekend Discount! Get{" "}
            <span className="highlight-text">-25%</span> off the token price, every weekend!
          </p>
          <a href="#details" className="cta-button">Learn More</a>
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
            <li>Total Supply: <span>{totalSupply}</span> Tanacoins</li>
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
          {/* Update Buy Now button to trigger modal */}
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

      {/* Login Section */}
      <section className="login-container">
        <h2>Login to Your Account</h2>
        <form id="login-form" action="/login" method="POST">
          <div className="input-group">
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" required />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password:</label>
            <input type="password" id="password" name="password" required />
          </div>
          <button type="submit" className="submit-btn">Login</button>
        </form>
        <p className="login-link">
          Don't have an account? <a href="/registerUser">Sign Up</a>
        </p>
      </section>

      {/* Footer Section */}
      <footer className="footer-container">
        <p>&copy; 2024 Tanacoin Launch. All rights reserved.</p>
      </footer>

      {/* PurchaseToken Modal Component */}
      <PurchaseToken isOpen={isPurchaseModalOpen} setIsOpen={setIsPurchaseModalOpen} />
    </div>
  );
};

export default HomePage;
