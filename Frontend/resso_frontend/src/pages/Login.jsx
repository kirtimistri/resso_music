import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
const backgroundImages = ["/1.png", "/4.png", "/3.png"];

function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [bgIndex, setBgIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const baseURL = "http://127.0.0.1:8000/api";

  const phrases = [
    "Welcome back to Resso!",
    "Feel the beat again...",
    "Login and vibe with your favorites.",
  ];

  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let timeout;
    const current = phrases[phraseIndex];
    if (!deleting && charIndex <= current.length) {
      timeout = setTimeout(() => {
        setDisplayedText(current.substring(0, charIndex));
        setCharIndex((prev) => prev + 1);
      }, 100);
    } else if (deleting && charIndex >= 0) {
      timeout = setTimeout(() => {
        setDisplayedText(current.substring(0, charIndex));
        setCharIndex((prev) => prev - 1);
      }, 50);
    } else {
      timeout = setTimeout(() => {
        if (!deleting) setDeleting(true);
        else {
          setDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
          setCharIndex(0);
        }
      }, 1500);
    }
    return () => clearTimeout(timeout);
  }, [charIndex, deleting, phraseIndex]);

  useEffect(() => {
    const access = localStorage.getItem("access_token");
    const refresh = localStorage.getItem("refresh_token");
    if (access && refresh) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const res = await fetch("http://127.0.0.1:8000/api/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // 🔥 cookies saved here
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Login failed");
    }

    // ✅ backend sets cookies
    navigate("/", { replace: true });

  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};



  return (
    <div className="min-h-screen flex text-white bg-gradient-to-tr from-[rgb(32,52,1)] via-[rgb(19,1,85)] to-[rgb(14,165,188)]">
      <div className="w-1/2 flex items-center justify-center p-10">
        <form onSubmit={handleLogin} className="w-full max-w-md p-8 space-y-5">
          <h2 className="text-3xl font-bold text-center mb-4">Login</h2>

          {error && (
            <div className="bg-red-600/80 p-3 rounded text-white text-sm">
              {error}
            </div>
          )}

          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />

          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold transition-all duration-300 shadow ${
              loading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          <Link to="/register" className="text-cyan-300 underline hover:text-cyan-100">
  Signup here
</Link>

          <div className="mt-4 text-center text-sm text-gray-300">
            Don’t have an account?{" "}
            
          </div>
        </form>
      </div>

      <div className="w-1/2 relative overflow-hidden flex items-center justify-center">
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{
            backgroundImage: `url(${backgroundImages[bgIndex]})`,
            opacity: 0.3,
          }}
        />
        <div className="absolute text-5xl font-bold inset-0 flex flex-col items-baseline justify-start p-6 z-10">
          <img src="/logo.png" alt="Logo" className="h-30 w-auto" />
          {displayedText}
        </div>
      </div>
    </div>
  );
}

export default Login;
