import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Signup() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [contact, setContact] = useState('');
  const [method, setMethod] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  // Animated text states
  const [displayedText, setDisplayedText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();
  const baseURL = 'http://127.0.0.1:8000/api';

  const phrases = [
    "Join Resso, feel the rhythm of life!",
    "Your music, your vibe — only on Resso.",
    "Connect, listen, and express with Resso.",
  ];

  // Animated typing effect for phrases
  useEffect(() => {
    let timeout;
    if (!deleting && charIndex <= phrases[phraseIndex].length) {
      timeout = setTimeout(() => {
        setDisplayedText(phrases[phraseIndex].substring(0, charIndex));
        setCharIndex(charIndex + 1);
      }, 100);
    } else if (deleting && charIndex >= 0) {
      timeout = setTimeout(() => {
        setDisplayedText(phrases[phraseIndex].substring(0, charIndex));
        setCharIndex(charIndex - 1);
      }, 50);
    } else {
      timeout = setTimeout(() => {
        if (!deleting) {
          setDeleting(true);
        } else {
          setDeleting(false);
          setPhraseIndex((phraseIndex + 1) % phrases.length);
          setCharIndex(0);
        }
      }, 1500);
    }
    return () => clearTimeout(timeout);
  }, [charIndex, deleting, phraseIndex, phrases]);

  // Detect if input is email or phone
  const detectMethod = (value) => {
    if (/^\d{10,15}$/.test(value)) return "phone";
    if (/^\S+@\S+\.\S+$/.test(value)) return "email";
    return '';
  };

  const handleContactChange = (e) => {
    const value = e.target.value.trim();
    setContact(value);
    const detectedMethod = detectMethod(value);
    setMethod(detectedMethod);
    setOtpSent(false);
    setOtpVerified(false);
    setOtp('');
  };

  const sendOtp = async () => {
    if (!method) {
      alert('Enter a valid email or phone number');
      return;
    }
    setLoading(true);
    try {
      let url = '';
      let bodyData = {};
      if (method === 'email') {
        url = `${baseURL}/email-otp/send-email-otp/`;
        bodyData = { email: contact };
      } else if (method === 'phone') {
        url = `${baseURL}/phone-otp/send-phone-otp/`;
        bodyData = { phone_number: contact };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
        credentials: 'include',
      });

      const data = await response.json();
      if (response.ok) {
        setOtpSent(true);
        alert('OTP sent successfully');
      } else {
        alert(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('Error sending OTP:', err);
      alert('Error sending OTP');
    } finally {
      setLoading(false);
    }
  };
async function verifyOtp() {
  setLoading(true); // Optional: show loading state
  try {
    let url = '';
    let bodyData = {};

    if (method === 'email') {
      url = 'http://127.0.0.1:8000/api/email-otp/verify-email-otp/';
      bodyData = { email: contact, otp: otp };
    } else if (method === 'phone') {
      url = 'http://127.0.0.1:8000/api/phone-otp/verify-phone-otp/';
      bodyData = { phone_number: contact, otp: otp };
    } else {
      alert('Invalid method for OTP verification');
      setLoading(false);
      return;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData),
      credentials: 'include',
    });

    const data = await response.json();

    if (response.ok) {
      setOtpVerified(true);
      alert('OTP verified successfully!');
      console.log('OTP Verified:', data);
    } else {
      setOtpVerified(false);
      alert(data.message || 'OTP verification failed');
      console.error('Backend validation error:', data);
    }
  } catch (error) {
    setOtpVerified(false);
    console.error('Network or unexpected error:', error);
    alert('Network error during OTP verification');
  } finally {
    setLoading(false);
  }
}


  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (!otpVerified) {
      setError('Please verify the OTP first.');
      return;
    }

    if (!username || !password || !contact) {
      setError('Please fill all fields');
      return;
    }

    try {
      const res = await fetch(`${baseURL}/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username,
          password,
          otp,
          [method === 'email' ? 'email' : 'phone_number']: contact,
        }),
      });
       console.log({
  username,
  password,
  otp,
  [method === 'email' ? 'email' : 'phone_number']: contact,
});

      const data = await res.json();
      if (res.ok) {
        alert('Signup successful!');
        // Reset form
        setUsername('');
        setContact('');
        setPassword('');
        setOtp('');
        setOtpSent(false);
        setOtpVerified(false);
        setMethod('');
        setError('');
        navigate('/');
      } else {
        setError(data.error || data.message || 'Signup failed');
      }
    } catch (err) {
      setError('Error during signup. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-gradient-to-tr from-[rgb(11,1,87)] via-[rgb(25,2,73)] to-[rgb(3,109,125)]">
      {/* Left side: image + logo + animated text */}
      <div className="relative w-1/2 p-8">
        {/* Fixed Logo on Top-Left */}
        <img
          src="/logo.png"
          alt="Resso Logo"
          className="absolute top-6 left-6 h-30 w-auto z-20"
        />

        {/* Animated Text Below Logo */}
        <div className="mt-28 z-20 max-w-md text-white">
          <p className="text-3xl font-bold animate-pulse leading-snug">
            {displayedText}
            <span className="blinking-cursor">|</span>
          </p>
        </div>

        {/* Overlay Image */}
        <img
          src="/1.png"
          alt="Overlay"
          className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
        />
      </div>

      {/* Right side: signup form */}
      <div className="w-1/2 flex items-center justify-center p-10">
        <div className="w-full max-w-md space-y-6 text-white">
          <h2 className="text-4xl font-bold text-center tracking-wide">Sign Up</h2>

          {error && (
            <div className="bg-red-600 text-white text-sm p-3 rounded shadow-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/70 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-cyan-400"
              required
            />

            <input
              type="text"
              value={contact}
              onChange={handleContactChange}
              placeholder="Email or Phone"
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/70 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-cyan-400"
              required
            />

            {!otpVerified && (
              <>
                {!otpSent ? (
                  <button
                    type="button"
                    onClick={sendOtp}
                    disabled={loading || !method}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 hover:scale-105 transition-transform font-semibold shadow-lg disabled:opacity-50"
                  >
                    {loading ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                ) : (
                  <>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter OTP"
                      className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/70 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-green-300"
                      required
                    />
                    <button
                      type="button"
                      onClick={verifyOtp}
                      disabled={loading}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 via-emerald-500 to-lime-500 hover:scale-105 transition-transform font-semibold shadow-lg disabled:opacity-50"
                    >
                      {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                  </>
                )}
              </>
            )}

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/70 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-cyan-400"
              required
            />

            <button
              type="submit"
              disabled={!otpVerified}
              className={`w-full py-3 rounded-xl text-white font-semibold transition-all shadow-lg ${
                otpVerified
                  ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:scale-105'
                  : 'bg-gray-700 cursor-not-allowed opacity-50'
              }`}
            >
              Sign Up
            </button>

            <Link
              to="/login"
              className="text-cyan-300 underline hover:text-cyan-100 block text-center"
            >
              Login here
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;
