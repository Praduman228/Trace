import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Routine from "./pages/Routine";
import MainLayout from "./components/MainLayout";
import PWAPrompt from "./components/PWAPrompt";

function App() {
  return (
    <Router>
      <PWAPrompt />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected/Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <MainLayout>
              <Dashboard />
            </MainLayout>
          }
        />
        <Route
          path="/routine"
          element={
            <MainLayout>
              <Routine />
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
