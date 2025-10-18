"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { Leaf, Lock, Eye, EyeOff, } from "lucide-react";
import "./globals.css";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [correctCaptchaAnswer, setCorrectCaptchaAnswer] = useState(0);
  const [error, setError] = useState("");
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const MAX_ATTEMPTS = 5;
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost/API";

  useEffect(() => {
    generateCaptcha();
    fetchBranches();
  }, []);

  const generateCaptcha = () => {
    let num1 = Math.floor(Math.random() * 10);
    let num2 = Math.floor(Math.random() * 10);
    setCorrectCaptchaAnswer(num1 + num2);
    setCaptchaQuestion(`${num1} + ${num2} = ?`);
  };

  const fetchBranches = async () => {
    try {
      const res = await fetch(`${API_BASE}/branches.php`);
      if (!res.ok) throw new Error("Failed to load branches");
      const data = await res.json();
      setBranches(data || []);
    } catch (e) {
      // Keep silent in UI; login can still work for admin
    }
  };

  const sanitizeInput = (input) => {
    return input.replace(/[<>/'";(){}]/g, "").trim();
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  // Clear ALL previous data first - INCLUDING PHP SESSIONS
  localStorage.removeItem("user");
  localStorage.removeItem("user_id");
  localStorage.removeItem("user_name");
  localStorage.removeItem("role");
  localStorage.removeItem("branch_id");
  localStorage.removeItem("branch_name");
  localStorage.removeItem("loginAttempts");
  sessionStorage.clear();

  // Clear PHP session by calling logout on BOTH endpoints before login
  try {
    await Promise.allSettled([
      fetch(`${API_BASE}/admin.php?action=logout`, {
        method: "POST",
        credentials: "include"
      }),
      fetch(`${API_BASE}/users.php?action=logout`, {
        method: "POST", 
        credentials: "include"
      })
    ]);
    console.log("PHP sessions cleared successfully");
  } catch (error) {
    console.log("Session clear completed (some endpoints may have failed)");
  }

  if (loginAttempts >= MAX_ATTEMPTS) {
    toast.error("Too many failed attempts. Please try again later.");
    return;
  }

  let sanitizedEmail = sanitizeInput(email);
  if (!validateEmail(sanitizedEmail)) {
    toast.error("Invalid email format.");
    return;
  }

  if (parseInt(captcha) !== correctCaptchaAnswer) {
    toast.error("Incorrect CAPTCHA answer. Try again.");
    generateCaptcha();
    return;
  }

  try {
    // Admin login
    let res = await axios.post(
      `${API_BASE}/admin.php?action=login`,
      new URLSearchParams({ email: sanitizedEmail, password: password }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        withCredentials: true,
      }
    );

    if (res.data.role === "admin") {
      toast.success("Admin login successful!");
      
      // Store admin data in localStorage with consistent structure
      const adminUserData = {
        id: res.data.admin_id || res.data.id,
        admin_id: res.data.admin_id || res.data.id,
        name: 'Admin',
        email: res.data.email,
        role: 'admin',
        branch: 'Pabayo Gomez Street',
        branch_id: 1,
        branch_name: 'Pabayo Gomez Street',
        username: res.data.email,
        status: 'Active'
      };
      
      localStorage.setItem("user", JSON.stringify(adminUserData));
      localStorage.setItem("loginAttempts", "0");
      
      console.log("Admin login - stored user data:", adminUserData);
      router.push("/home");
      return;
    }

    // Receptionist login
    res = await axios.post(
      `${API_BASE}/users.php?action=login`,
      { email, password, branch_id: selectedBranchId || null },
      { withCredentials: true }
    );

    if (res.data.role === "receptionist") {
      toast.success("Receptionist login successful!");
      if (!selectedBranchId) {
        toast.error("Please select a branch");
        return;
      }
      
      try {
        const branch = branches.find((b) => String(b.id) === String(selectedBranchId));
        if (branch) {
          localStorage.setItem("branch_id", String(branch.id));
          localStorage.setItem("branch_name", branch.name);
        } else {
          localStorage.setItem("branch_id", String(selectedBranchId));
        }
        
        // Store receptionist data in localStorage with consistent structure
        const userData = res.data?.user || res.data;
        const receptionistUserData = {
          id: userData.user_id || userData.id,
          name: userData.name,
          username: userData.username,
          email: userData.email,
          role: 'receptionist',
          branch: userData.branch || branch?.name,
          branch_id: userData.branch_id || selectedBranchId,
          branch_name: userData.branch_name || branch?.name,
          status: userData.status || 'Active'
        };
        
        localStorage.setItem("user", JSON.stringify(receptionistUserData));
        console.log("Receptionist login - stored user data:", receptionistUserData);
        
      } catch (_) {}
      
      localStorage.setItem("loginAttempts", "0");
      router.push("/home2");
    } else {
      setLoginAttempts((prev) => {
        const newAttempts = prev + 1;
        localStorage.setItem("loginAttempts", newAttempts);
        return newAttempts;
      });
      toast.error("Login failed. Please try again.");
    }
  } catch (err) {
    toast.error("An error occurred. Please try again.");
  }
};

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-lime-500 via-lime-600 to-lime-700 p-6">
      <Toaster position="top-center" richColors />

      {/* Card Layout */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl flex w-full max-w-5xl overflow-hidden">
        {/* Left Section */}
        <div className="flex flex-col justify-center items-start flex-1 p-12 text-white">
          <div className="p-3 bg-lime-100 rounded-xl mb-6">
            <Leaf className="text-lime-700" size={35} />
          </div>
          <h1 className="text-4xl font-extrabold mb-4">Welcome to <br></br> Lizly Skin Care Clinic</h1>
          <p className="text-sm text-lime-100 mb-6 max-w-sm">
            Please sign in to continue accessing the Lizly Skin Care Clinic
            system.
          </p>
          {/* <button
  className="learn-more"
  onClick={() => router.push("/")}
>
  <span className="circle" aria-hidden="true">
    <span className="icon arrow"></span>
  </span>
  <span className="button-text">Learn More</span>
</button> */}

        </div>

        {/* Right Section - Sign In Form */}
        <div className="flex-1 bg-emerald/10 backdrop-blur-lg p-10">
          <h2 className="text-2xl font-bold text-center text-white mb-8">
            Sign In
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Branch (required for receptionist)
              </label>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/20 border border-white/30 focus:ring-2 focus:ring-lime-400 focus:border-lime-400 text-white"
              >
                <option value="" className="text-black">Select a branch</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id} className="text-black">
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/20 border border-white/30 focus:ring-2 focus:ring-lime-400 focus:border-lime-400 placeholder-white/70 text-white"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white mb-1"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300"
                  size={16}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-white/20 border border-white/30 
                 focus:ring-2 focus:ring-lime-400 focus:border-lime-400 
                 placeholder-white/70 text-white"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="captcha"
                className="block text-sm font-medium text-white mb-1"
              >
                {captchaQuestion}
              </label>
              <input
                type="text"
                id="captcha"
                value={captcha}
                onChange={(e) => setCaptcha(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/20 border border-white/30 focus:ring-2 focus:ring-lime-400 focus:border-lime-400 placeholder-white/70 text-white"
                placeholder="Enter the answer"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-green-500 to-lime-500 hover:opacity-70 text-white font-medium rounded-lg transition shadow-lg"
            >
              Sign In
            </button>
          </form>

          {/* Footer Links */}

          {/* <div className="mt-6 text-center text-sm text-white/80">
            <p>
              Don&apos;t have an account?{" "}
              <button
                onClick={() => router.push("/register")}
                className="font-medium text-white hover:underline"
              >
                Register here
              </button>
            </p>
            <p className="mt-2">
              <button
                onClick={() => router.push("/forgot-password")}
                className="font-medium text-white hover:underline"
              >
                Forgot password?
              </button>
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
}
