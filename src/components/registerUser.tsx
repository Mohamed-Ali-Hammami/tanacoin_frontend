"use client";
import React, { useState } from "react";
import styles from "../styles/registerstyles.module.css";

interface FormData {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  wallet_connect: boolean;
  wallet_address?: string; // Optional field
}
interface RegisterFormProps {
  isOpen: boolean;
  onClose: () => void; // Accept the onClose function as a prop
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const RegistrationForm: React.FC<RegisterFormProps> = ({ isOpen, setIsOpen }) => {
  const [formData, setFormData] = useState<FormData>({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    wallet_connect: false,
    wallet_address: "",
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading ] = useState(false);
  const apiUrl =  process.env.NEXT_PUBLIC_BACKEND_URL


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    await registerUser(formData);
  };
  const validateForm = (data: FormData): string[] => {
    const errors: string[] = [];
    const requiredFields: (keyof FormData)[] = ["first_name", "last_name", "username", "email", "password", "confirm_password"];
    requiredFields.forEach((field) => {
      if (!data[field]) {
        errors.push(`${field} est requis.`);
      }
    });

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push("L'adresse e-mail n'est pas valide.");
    }
    if (data.password !== data.confirm_password) {
      errors.push("Les mots de passe ne correspondent pas.");
    }
    return errors;
  };

  const registerUser = async (data: FormData) => {
    try {
      const response = await  fetch(`${apiUrl}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      if (response.ok) {
        window.location.href = `/success/${responseData.username}`;
      } else {
        setErrors([responseData.message || "Une erreur est survenue lors de l'inscription."]);
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setErrors(["Une erreur est survenue."]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>Close</button>
        <h1>Inscription</h1>
        {errors.length > 0 && <div className={styles.errorContainer}>{errors.map((err, i) => <p key={i}>{err}</p>)}</div>}
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label>Nom d&apos;utilisateur :</label>
            <input type='text' name="username" value={formData.username} onChange={handleInputChange} />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="first_name">Prénom :</label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="last_name">Nom :</label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Adresse e-mail :</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Mot de passe :</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="confirm_password">Confirmer le mot de passe :</label>
            <input
              type="password"
              id="confirm_password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleInputChange}
              required
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? "Chargement..." : "S'inscrire"}
          </button>
        </form>

        <p className={styles.loginLink}>
          Déjà inscrit ? <a href="/login">Se connecter</a>
        </p>

        <button
          id="connect-wallet-button"
          className={styles.walletConnectBtn}
          disabled={isLoading}
        >
          {isLoading ? "Connexion..." : "Ou connectez votre portefeuille"}
        </button>
      </div>
    </div>
  );
};

export default RegistrationForm;