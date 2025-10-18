"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "sonner";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { 
  User, 
  Settings, 
  LogOut, 
  Home, 
  Users, 
  Shield,
  Mail,
  Phone,
  Calendar,
  ChevronLeft,
  X,
  Edit,
  Save,
  Leaf,
  ChevronDown,
  ChevronsLeft
} from "lucide-react";

export default function ViewProfile() {
    const router = useRouter();
  const pathname = usePathname();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: "John Mark",
        service: "Hair Stylist",
        email: "john_mark@yahoo.com",
        phone: "+639 856 3245",
        hireDate: "2024-10-10",
        contactDetails: "Regency Plain Subdivision",
        status: "Active",
    });

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        window.location.href = "/";
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSaveClick = () => {
        setIsEditing(false);
        toast.success("Profile updated successfully!");
        // Here you would typically send the updated data to your API
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="flex flex-col h-screen bg-[#77DD77] text-gray-900">
            <Toaster />
            {/* Header */}
      <header className="flex items-center justify-between bg-emerald-700 text-white p-4 w-full h-16 pl-64 relative">
        <div className="flex items-center space-x-4">
          {/* Space for potential left-aligned elements */}
        </div>

        <div className="flex items-center space-x-4 relative">
          <div
            className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-lg font-bold cursor-pointer hover:bg-amber-600 transition-colors"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            A
          </div>
          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                className="absolute top-12 right-0 bg-white shadow-xl rounded-lg w-48 overflow-hidden z-50"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  href="/profiles"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 w-full text-gray-700"
                >
                  <User size={16} /> Profile
                </Link>
                <Link
                  href="/roles"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 w-full text-gray-700"
                >
                  <Settings size={16} /> Settings
                </Link>
                <button
                  className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 w-full text-red-500"
                  onClick={handleLogout}
                >
                  <LogOut size={16} /> Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

            {/* Enhanced Sidebar */}
<div className="flex flex-1">
  <nav className="w-64 h-screen bg-gradient-to-b from-emerald-800 to-emerald-700 text-white flex flex-col items-start py-6 fixed top-0 left-0 shadow-lg z-10">
    {/* Branding with Logo */}
    <div className="flex items-center space-x-3 mb-8 px-6">
      <div className="p-2 bg-white/10 rounded-lg flex items-center justify-center">
        <Leaf className="text-emerald-300" size={24} />
      </div>
      <h1 className="text-xl font-bold text-white font-sans tracking-tight">
        Lizly Skin Care Clinic
      </h1>
    </div>

    {/* Menu Items with Active States */}
    <div className="w-full px-4 space-y-1 overflow-y-auto flex-grow custom-scrollbar">
      <Link href="/home" passHref>
        <div className={`w-full p-3 rounded-lg text-left flex items-center cursor-pointer transition-all ${router.pathname === '/home' ? 'bg-emerald-600 shadow-md' : 'hover:bg-emerald-600/70'}`}>
          <div className={`p-1.5 mr-3 rounded-lg ${router.pathname === '/home' ? 'bg-white text-emerald-700' : 'bg-emerald-900/30 text-white'}`}>
            <Home size={18} />
          </div>
          <span>Dashboard</span>
          {router.pathname === '/home' && (
            <motion.div 
              className="ml-auto w-2 h-2 bg-white rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            />
          )}
        </div>
      </Link>

      <Link href="/profiles" passHref>
        <div className={`w-full p-3 rounded-lg text-left flex items-center cursor-pointer transition-all ${router.pathname === '/profiles' ? 'bg-emerald-600 shadow-md' : 'hover:bg-emerald-600/70'}`}>
          <div className={`p-1.5 mr-3 rounded-lg ${router.pathname === '/profiles' ? 'bg-white text-emerald-700' : 'bg-emerald-900/30 text-white'}`}>
            <User size={18} />
          </div>
          <span>Profiles</span>
          {router.pathname === '/profiles' && (
            <motion.div 
              className="ml-auto w-2 h-2 bg-white rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            />
          )}
        </div>
      </Link>
    </div>

    {/* Enhanced Sidebar Footer */}
    <motion.div
      className="mt-auto px-6 w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <div className="border-t border-emerald-600 pt-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
              <User size={16} />
            </div>
            <div>
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-emerald-300">Administrator</p>
            </div>
          </div>
          <button 
            className="text-emerald-300 hover:text-white transition-colors"
            onClick={handleLogout}
          >
            <LogOut size={18} />
          </button>
        </div>
        <p className="text-xs text-emerald-200 mt-3">
          Lizly Skin Care Clinic v1.2.0
        </p>
        <p className="text-xs text-emerald-300 mt-1">
          © {new Date().getFullYear()} All Rights Reserved
        </p>
      </div>
    </motion.div>
  </nav>

                {/* Main Content */}
                <main className="flex-1 p-6 bg-gray-50 ml-64">
                    {/* Header Section */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6"
                    >
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                User Profile
                            </h1>
                        </div>

                        <div className="flex space-x-3 mt-4 md:mt-0">
                            {isEditing ? (
                                <>
                                    <motion.button
                                        onClick={() => setIsEditing(false)}
                                        className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <X size={18} />
                                        <span>Cancel</span>
                                    </motion.button>
                                    <motion.button
                                        onClick={handleSaveClick}
                                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Save size={18} />
                                        <span>Save</span>
                                    </motion.button>
                                </>
                            ) : (
                                <motion.button
                                    onClick={handleEditClick}
                                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Edit size={18} />
                                    <span>Edit Profile</span>
                                </motion.button>
                            )}
                        </div>
                    </motion.div>

                    {/* Profile Content */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                    >
                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Profile Details */}
                            <div className="md:col-span-2 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            />
                                        ) : (
                                            <div className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                                {formData.name}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="service"
                                                value={formData.service}
                                                onChange={handleChange}
                                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            />
                                        ) : (
                                            <div className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                                {formData.service}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        {isEditing ? (
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex items-center w-full p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                                <Mail className="mr-2 text-gray-400" size={16} />
                                                {formData.email}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                        {isEditing ? (
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                                <input
                                                    type="text"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex items-center w-full p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                                <Phone className="mr-2 text-gray-400" size={16} />
                                                {formData.phone}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date</label>
                                        {isEditing ? (
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                                <input
                                                    type="date"
                                                    name="hireDate"
                                                    value={formData.hireDate}
                                                    onChange={handleChange}
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex items-center w-full p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                                <Calendar className="mr-2 text-gray-400" size={16} />
                                                {formData.hireDate}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        {isEditing ? (
                                            <select
                                                name="status"
                                                value={formData.status}
                                                onChange={handleChange}
                                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            >
                                                <option value="Active">Active</option>
                                                <option value="Inactive">Inactive</option>
                                            </select>
                                        ) : (
                                            <div className={`w-full p-3 border rounded-lg ${
                                                formData.status === "Active" 
                                                    ? "bg-green-50 border-green-200 text-green-800" 
                                                    : "bg-gray-50 border-gray-200"
                                            }`}>
                                                {formData.status}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Details</label>
                                    {isEditing ? (
                                        <textarea
                                            name="contactDetails"
                                            value={formData.contactDetails}
                                            onChange={handleChange}
                                            rows={3}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                        />
                                    ) : (
                                        <div className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg min-h-[100px]">
                                            {formData.contactDetails}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </main>
            </div>
        </div>
    );
}