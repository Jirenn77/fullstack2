"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { Leaf } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState(null);
  const router = useRouter();

  const sanitizeInput = (input) => input.replace(/[<>/';\"(){}]/g, "").trim();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanEmail = sanitizeInput(email);
    const cleanPassword = sanitizeInput(password);
    const cleanConfirmPassword = sanitizeInput(confirmPassword);

    if (!validateEmail(cleanEmail)) return toast.error("Invalid email format");

    if (!validatePassword(cleanPassword))
      return toast.error(
        "Password must be at least 8 characters, include uppercase, lowercase, number, and special character."
      );

    if (cleanPassword !== cleanConfirmPassword)
      return toast.error("Passwords do not match");

    if (!captchaToken) return toast.error("Please complete the CAPTCHA");

    try {
      const res = await axios.post(
        "http://localhost/API/getBalance.php?action=register",
        { email: cleanEmail, password: cleanPassword, role: "customer", captchaToken },
        { headers: { "Content-Type": "application/json" } }
      );

      if (res.data.success) {
        toast.success("Registration successful! You can now log in.");
        router.push("/");
      } else {
        toast.error(res.data.error || "Registration failed. Please try again.");
      }
    } catch {
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
          <h1 className="text-4xl font-extrabold mb-4">
            Join Lizly Skin Care Clinic
          </h1>
          <p className="text-sm text-lime-100 mb-6 max-w-sm">
            Create an account and start your journey with Lizly Skin Care Clinic.
          </p>
        </div>

        {/* Right Section - Register Form */}
        <div className="flex-1 bg-white/10 backdrop-blur-lg p-10">
          <h2 className="text-2xl font-bold text-center text-white mb-8">
            Create Account
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-white mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/20 border border-white/30 
                focus:ring-2 focus:ring-lime-400 focus:border-lime-400 placeholder-white/70 text-white"
                placeholder="your@email.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white mb-1"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/20 border border-white/30 
                focus:ring-2 focus:ring-lime-400 focus:border-lime-400 placeholder-white/70 text-white"
                placeholder="••••••••"
                required
              />
              <p className="text-xs text-white/70 mt-1">
                Must include uppercase, lowercase, number, and special character
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-white mb-1"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-white/20 border border-white/30 
                focus:ring-2 focus:ring-lime-400 focus:border-lime-400 placeholder-white/70 text-white"
                placeholder="••••••••"
                required
              />
            </div>

            {/* CAPTCHA */}
            <div className="flex justify-center">
              <ReCAPTCHA
                sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                onChange={(token) => setCaptchaToken(token)}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-pink-600 
              hover:opacity-90 text-white font-medium rounded-lg transition shadow-lg"
            >
              Create Account
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center text-sm text-white/80">
            <p>
              Already have an account?{" "}
              <button
                onClick={() => router.push("/")}
                className="font-medium text-white hover:underline"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
