import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "./hooks/useAuth";
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const [loginType, setLoginType] = useState<'username' | 'phoneNumber'>('username'); // 'username' for email
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const payload: { password: string; email?: string; phoneNumber?: string } = {
        password,
      };

      if (loginType === 'username') {
        payload.email = username;
      } else {
        payload.phoneNumber = phoneNumber;
      }

      const response = await axios.post("http://localhost:3000/api/auth/login", payload);
      login(response.data.token, response.data.user.role, response.data.user.id);
      navigate("/dashboard");
    } catch (err) {
      setError(t("login_error_invalid_credentials"));
      if (axios.isAxiosError(err) && err.response) {
        console.error("Login error details:", err.response.data);
      } else {
        console.error("Login error:", err.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-dark-background">
      <motion.div 
        className="bg-card dark:bg-dark-card p-8 rounded-lg shadow-lg w-full max-w-md border border-border dark:border-dark-border"
      >
        <div className="text-center mb-8">
          <img src="/public/bio.png" alt="BioVerse Logo" className="h-16 w-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text dark:text-dark-text">{t("login_title")}</h2>
        </div>
        {error && (
          <p className="text-destructive dark:text-dark-destructive text-center mb-4">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center mb-4">
            <button
              type="button"
              className={`px-4 py-2 rounded-l-md text-sm font-medium ${loginType === 'username' ? 'bg-primary text-primary-text' : 'bg-muted/20 text-muted dark:bg-dark-muted/20 dark:text-dark-muted'}`}
              onClick={() => setLoginType('username')}
            >
              {t("login_with_email")}
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-r-md text-sm font-medium ${loginType === 'phoneNumber' ? 'bg-primary text-primary-text' : 'bg-muted/20 text-muted dark:bg-dark-muted/20 dark:text-dark-muted'}`}
              onClick={() => setLoginType('phoneNumber')}
            >
              {t("login_with_phone")}
            </button>
          </div>

          {loginType === 'username' ? (
            <div>
              <label className="block text-sm font-medium text-muted dark:text-dark-muted" htmlFor="username">
                {t("login_email_label")}
              </label>
              <input
                type="text"
                id="username"
                className="mt-1 block w-full p-3 rounded-md bg-input dark:bg-dark-input border border-border dark:border-dark-border text-text dark:text-dark-text focus:ring-primary focus:border-primary"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-muted dark:text-dark-muted" htmlFor="phoneNumber">
                {t("login_phone_label")}
              </label>
              <input
                type="tel"
                id="phoneNumber"
                className="mt-1 block w-full p-3 rounded-md bg-input dark:bg-dark-input border border-border dark:border-dark-border text-text dark:text-dark-text focus:ring-primary focus:border-primary"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-muted dark:text-dark-muted" htmlFor="password">
              {t("login_password_label")}
            </label>
            <input
              type="password"
              id="password"
              className="mt-1 block w-full p-3 rounded-md bg-input dark:bg-dark-input border border-border dark:border-dark-border text-text dark:text-dark-text focus:ring-primary focus:border-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-700 text-primary-text font-bold py-3 px-4 rounded-lg transition-all duration-300"
          >
            {t("login_button")}
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-muted dark:text-dark-muted">
            {t("login_no_account")}{" "}
            <Link to="/register" className="text-primary hover:underline">
              {t("login_register_here")}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;