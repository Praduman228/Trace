import React, { useState } from "react";
import { Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import API from "../config/axios";

function Signup() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", phone: "" });
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "success", message: "Sending OTP..." });
    
    try {
      const data = await API.post("/users/send-otp", { email: formData.email }, { withAuth: false });
      
      setStep(2);
      setStatus({ type: "success", message: "OTP sent successfully!" });
      setTimeout(() => setStatus({ type: "", message: "" }), 3000);
    } catch (error) {
      setStatus({ type: "error", message: error.response?.data?.error || error.message });
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length < 6) {
      setStatus({ type: "error", message: "Please enter complete OTP" });
      return;
    }

    setStatus({ type: "success", message: "Verifying..." });
    
    try {
      const data = await API.post("/users/register", { ...formData, otp: otpString }, { withAuth: false });
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      setStatus({ type: "success", message: "Account created successfully!" });
     
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
    } catch (error) {
      setStatus({ type: "error", message: error.response?.data?.error || error.message });
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const data = await API.post("/users/google-login", {
        credential: credentialResponse.credential,
      }, { withAuth: false });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setStatus({ type: "success", message: "Google Sign-Up successful!" });
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
    } catch (error) {
      console.error(error);
      setStatus({ type: "error", message: error.response?.data?.error || "Google sign-up failed" });
      setTimeout(() => setStatus({ type: "", message: "" }), 3000);
    }
  };

  const handleGoogleFailure = () => {
    setStatus({ type: "error", message: "Google sign-up failed" });
    setTimeout(() => setStatus({ type: "", message: "" }), 3000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <section className="panel-glass max-w-[450px] w-full animate-slide-in">
        {step === 1 ? (
          <>
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Get Started</p>
            <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Create Account
            </h1>
            <form onSubmit={handleDetailsSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Phone Number</label>
                <input
                  type="text"
                  placeholder="1234567890"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <button 
                type="submit"
                className="w-full py-4 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                Continue
              </button>
            </form>

            <div className="mt-6 flex items-center justify-center space-x-2">
              <div className="h-px bg-gray-200 w-full"></div>
              <span className="text-gray-400 text-sm font-medium">OR</span>
              <div className="h-px bg-gray-200 w-full"></div>
            </div>

            <div className="mt-6 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleFailure}
                useOneTap
                shape="rectangular"
                theme="outline"
                size="large"
                text="signup_with"
              />
            </div>
          </>
        ) : (
          <>
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Verification</p>
            <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Enter OTP
            </h1>
            <p className="text-gray-500 mb-8">
              We've sent a 6-digit code to <strong>{formData.email}</strong>
            </p>
            <form onSubmit={handleVerifyOtp} className="space-y-8">
              <div className="flex gap-4 justify-center">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    className="w-14 h-14 text-center text-2xl font-bold rounded-lg border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onFocus={(e) => e.target.select()}
                    required
                  />
                ))}
              </div>
              <button 
                type="submit"
                className="w-full py-4 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                Verify & Sign Up
              </button>
              <button 
                type="button" 
                className="w-full text-primary font-semibold hover:underline"
                onClick={() => setStep(1)}
              >
                Change Email
              </button>
            </form>
          </>
        )}

        {status.message && (
          <p className={`mt-4 text-center text-sm ${status.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
            {status.message}
          </p>
        )}

        <p className="mt-8 text-center text-sm text-gray-500">
          Already have an account? <Link to="/" className="text-primary font-semibold hover:underline">Sign in instead</Link>
        </p>
      </section>
    </div>
  );
}

export default Signup;
