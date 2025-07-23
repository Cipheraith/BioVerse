import React, { useState } from "react";
import logo from '/bio.png';
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

const Register: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [nationalId, setNationalId] = useState("");
  
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/register",
        {
          username,
          password,
          role,
          fullName,
          dob,
          nationalId,
          phoneNumber,
        },
      );

      setSuccess(response.data.message + " You can now log in.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: unknown) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Registration failed. Please try again.");
      }
      console.error("Registration error:", err);
    }
  };

  

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-dark-background">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-card dark:bg-dark-card p-8 rounded-lg shadow-lg w-full max-w-md border border-border dark:border-dark-border"
      >
        <div className="text-center mb-8">
          <img
            src={logo}
            alt="BioVerse Logo"
            className="h-16 w-16 mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold text-text dark:text-dark-text">
            Create your BioVerse Account
          </h2>
        </div>
        {error && (
          <p className="text-destructive dark:text-dark-destructive text-center mb-4">
            {error}
          </p>
        )}
        {success && (
          <p className="text-success dark:text-dark-success text-center mb-4">
            {success}
          </p>
        )}
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
          
        >
          <div>
            <label
              className="block text-sm font-medium text-muted dark:text-dark-muted"
              htmlFor="username"
            >
              Email (Username)
            </label>
            <input
              type="email"
              id="username"
              className="mt-1 block w-full p-3 rounded-md bg-input dark:bg-dark-input border border-border dark:border-dark-border text-text dark:text-dark-text focus:ring-primary focus:border-primary"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium text-muted dark:text-dark-muted"
              htmlFor="phoneNumber"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              className="mt-1 block w-full p-3 rounded-md bg-input dark:bg-dark-input border border-border dark:border-dark-border text-text dark:text-dark-text focus:ring-primary focus:border-primary"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium text-muted dark:text-dark-muted"
              htmlFor="password"
            >
              Password
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
          <div>
            <label
              className="block text-sm font-medium text-muted dark:text-dark-muted"
              htmlFor="role"
            >
              Role
            </label>
            <select
              id="role"
              className="mt-1 block w-full p-3 rounded-md bg-input dark:bg-dark-input border border-border dark:border-dark-border text-text dark:text-dark-text focus:ring-primary focus:border-primary"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="patient">Patient</option>
              <option value="health_worker">Health Worker</option>
              <option value="admin">Admin</option>
              <option value="moh">Ministry of Health</option>
              <option value="ambulance_driver">Ambulance Driver</option>
              <option value="pharmacy">Pharmacy</option>
            </select>
          </div>
          <div>
            <label
              className="block text-sm font-medium text-muted dark:text-dark-muted"
              htmlFor="fullName"
            >
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              className="mt-1 block w-full p-3 rounded-md bg-input dark:bg-dark-input border border-border dark:border-dark-border text-text dark:text-dark-text focus:ring-primary focus:border-primary"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium text-muted dark:text-dark-muted"
              htmlFor="dob"
            >
              Date of Birth
            </label>
            <input
              type="date"
              id="dob"
              className="mt-1 block w-full p-3 rounded-md bg-input dark:bg-dark-input border border-border dark:border-dark-border text-text dark:text-dark-text focus:ring-primary focus:border-primary"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium text-muted dark:text-dark-muted"
              htmlFor="nationalId"
            >
              National ID
            </label>
            <input
              type="text"
              id="nationalId"
              className="mt-1 block w-full p-3 rounded-md bg-input dark:bg-dark-input border border-border dark:border-dark-border text-text dark:text-dark-text focus:ring-primary focus:border-primary"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              required
            />
          </div>
          
          
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-700 text-primary-text font-bold py-3 px-4 rounded-lg transition-all duration-300"
          >
            Register
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-muted dark:text-dark-muted">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
