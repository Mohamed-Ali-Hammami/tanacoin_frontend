"use client";
import React, { useState } from 'react';
import styles from '../styles/Contactus.module.css';

interface ContactUsFormProps {
  onClose: () => void; // Prop to handle closing the form
}

const ContactUsForm: React.FC<ContactUsFormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errors, setErrors] = useState({
    emailValid: true,
    submissionError: false,
  });

  // Email validation function
  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  // Handles changes to form inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(''); // Reset status message
  
    const emailValid = validateEmail(formData.email);
    setErrors({
      emailValid,
      submissionError: false,
    });
  
    if (emailValid) {
      try {
        const response = await fetch(`${apiUrl}/api/contact-us`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
  
        if (response.ok) {
          setFormData({
            name: '',
            email: '',
            message: '',
          });
          setStatusMessage('Message sent successfully!'); // Success message
          // Wait for a few seconds before closing the form
          setTimeout(() => {
            onClose(); 
          }, 5000); 
        } else {
          const data = await response.json();
          setErrors((prev) => ({
            ...prev,
            submissionError: true,
          }));
          setStatusMessage(data.message || 'Failed to send message. Please try again.'); // Error message
        }
      } catch (error) {
        console.error("Network error:", error);
        setErrors((prev) => ({
          ...prev,
          submissionError: true,
        }));
        setStatusMessage('An error occurred. Please try again later.'); // Error message
      }
    } else {
      setErrors((prev) => ({
        ...prev,
        emailValid: false,
      }));
      setStatusMessage('Please enter a valid email address.'); // Email error message
    }
  
    setIsLoading(false);
  };
  

  return (
    <div className={styles.wrapper}>
      <button 
        className={styles.closeButton} 
        onClick={(e) => {
          e.preventDefault(); // Prevent default action
          onClose(); // Close the form
        }} 
        aria-label="Close"
      >
        &times; {/* Close icon */}
      </button>
      <h1 className={styles.customh1}>Take contact with us </h1>
      <form onSubmit={handleSubmit} className={styles.formInput}>
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={handleChange}
          required
          className={errors.emailValid ? '' : styles.errorInput} // Add an error class if needed
        />
        {!errors.emailValid && <span className={styles.error}>Invalid email format</span>}
        <textarea
          name="message"
          placeholder="Your Message"
          value={formData.message}
          onChange={handleChange}
          required
          className={errors.submissionError ? styles.errorTextarea : ''} // Add an error class if needed
        />

        <button type="submit" className={styles.submitButton} disabled={isLoading}>
          {isLoading ? "Sending..." : "SEND MESSAGE"}
        </button>
      </form>
      {statusMessage && <div className={styles.statusMessage}>{statusMessage}</div>} {/* Status message */}
      <div className="spinnerContainer">
        {isLoading && <div className={styles.loadingSpinner}></div>}
      </div>
    </div>
  );
};

export default ContactUsForm;