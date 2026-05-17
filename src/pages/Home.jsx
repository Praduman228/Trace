import React, { useState } from "react";
import { Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import API from "../config/axios";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
function Home() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await API.post("/users/login", { email, password }, { withAuth: false });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setStatus({ type: "success", message: "Login successful!" });
      navigate("/dashboard");
    } catch (error) {
      console.log(error);
      setStatus({ type: "error", message: error.response?.data?.error || error.message });
      setTimeout(() => setStatus({ type: "", message: "" }), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const data = await API.post("/users/google-login", {
        credential: credentialResponse.credential,
      }, { withAuth: false });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setStatus({ type: "success", message: "Google Login successful!" });
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      setStatus({ type: "error", message: error.response?.data?.error || "Google login failed" });
      setTimeout(() => setStatus({ type: "", message: "" }), 3000);
    }
  };

  const handleGoogleFailure = () => {
    setStatus({ type: "error", message: "Google login failed" });
    setTimeout(() => setStatus({ type: "", message: "" }), 3000);
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
            disabled={isLoading}
            className="w-full py-4 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
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
          />
        </div>

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
