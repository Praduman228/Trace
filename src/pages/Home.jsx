import React, { useState } from "react";
import { Link } from "react-router-dom";
import API from "../config/axios";

function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await API.post("/users/login", { email, password }, { withAuth: false });
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setStatus({ type: "success", message: "Login successful!" });
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
    } catch (error) {
      console.log(error);
      setStatus({ type: "error", message: error.response?.data?.error || error.message });
      setTimeout(() => setStatus({ type: "", message: "" }), 3000);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <section className="panel-glass max-w-[450px] w-full animate-slide-in">
        <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Welcome Back</p>
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Login to Trace
        </h1>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Email Address</label>
            <input
              type="email"
              placeholder="name@company.com"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full py-4 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            Sign In
          </button>
        </form>

        {status.message && (
          <p className={`mt-4 text-center text-sm ${status.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
            {status.message}
          </p>
        )}

        <p className="mt-8 text-center text-sm text-gray-500">
          Don't have an account? <Link to="/signup" className="text-primary font-semibold hover:underline">Create one for free</Link>
        </p>
      </section>
    </div>
  );
}

export default Home;
