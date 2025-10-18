"use client";

import { useState, useEffect } from "react";
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
  ChevronsLeft,
  ChevronRight,
  ChevronsRight,
  Plus,
  Search,
  X,
  Edit,
  Eye,
  Trash2,
  UserPlus,
  Lock,
  Leaf,
  ChevronDown,
  EyeOff,
} from "lucide-react";

export default function UserManagement() {
  const router = useRouter();
  const pathname = usePathname();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [branches, setBranches] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [showEditConfirmPassword, setShowEditConfirmPassword] = useState(false);


  const [newUser, setNewUser] = useState({
    name: "",
    username: "",
    email: "",
    branch_id: "",
    password: "",
    confirmPassword: "",
    status: "Active", // or "" depending on your default
  });


  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      // Replace with your actual API endpoint
      const response = await fetch("http://localhost/API/users.php");
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast.error("Failed to load users");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const res = await fetch(`http://localhost/API/users.php?action=get&id=${userId}`);
      const data = await res.json();
      setSelectedUser(data);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await fetch("http://localhost/API/users.php?action=branches");
        const data = await res.json();
        if (data.success) {
          setBranches(data.branches);
        }
      } catch (error) {
        console.error("Failed to load branches:", error);
      }
    };
    fetchBranches();
  }, []);

  const handleEditClick = (user) => {
    setEditUser({ ...user });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (updatedUser) => {
    if (updatedUser.password && updatedUser.password !== updatedUser.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const payload = {
      ...updatedUser,
      user_id: updatedUser.id,
    };

    try {
      const res = await fetch(
        `http://localhost/API/users.php?action=update&id=${updatedUser.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();
      if (res.ok && !result.error) {
        const updatedList = users.map((u) =>
          u.id === updatedUser.id ? updatedUser : u
        );
        setUsers(updatedList);
        toast.success(result.message || "User updated successfully");
        setIsEditModalOpen(false);
      } else {
        toast.error(result.error || result.message || "Failed to update");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    }
  };


  const handleAddUser = async () => {
    try {
      if (!newUser.name || !newUser.username || !newUser.email || !newUser.password) {
        toast.error("Name, username, email, and password are required");
        return;
      }

      const response = await fetch("http://localhost/API/users.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          ...newUser,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to add user");
      }

      // Use result.user (not result itself)
      setUsers([...users, result.user]);

      setIsModalOpen(false);
      setNewUser({
        name: "",
        username: "",
        email: "",
        password: "",
        branch: "",
        branch_id: "",
        status: "Active",
      });

      toast.success(result.message || "User added successfully");
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error(error.message || "Failed to add user");
    }
  };


  const filteredUsers = users
    .filter((user) => {
      if (activeTab === "all") return true;
      if (activeTab === "active") return user.status === "Active";
      if (activeTab === "inactive") return user.status === "Inactive";
      return true;
    })
    .filter((user) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        user.name.toLowerCase().includes(query) ||
        user.username.toLowerCase().includes(query) ||
        user.branch.toLowerCase().includes(query)
      );
    });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/";
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
              <div
                className={`w-full p-3 rounded-lg text-left flex items-center cursor-pointer transition-all ${router.pathname === "/home" ? "bg-emerald-600 shadow-md" : "hover:bg-emerald-600/70"}`}
              >
                <div
                  className={`p-1.5 mr-3 rounded-lg ${router.pathname === "/home" ? "bg-white text-emerald-700" : "bg-emerald-900/30 text-white"}`}
                >
                  <Home size={18} />
                </div>
                <span>Dashboard</span>
                {router.pathname === "/home" && (
                  <motion.div
                    className="ml-auto w-2 h-2 bg-white rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  />
                )}
              </div>
            </Link>

            <Link href="/roles" passHref>
              <div
                className={`w-full p-3 rounded-lg text-left flex items-center cursor-pointer transition-all ${router.pathname === "/roles" ? "bg-emerald-600 shadow-md" : "hover:bg-emerald-600/70"}`}
              >
                <div
                  className={`p-1.5 mr-3 rounded-lg ${router.pathname === "/roles" ? "bg-white text-emerald-700" : "bg-emerald-900/30 text-white"}`}
                >
                  <Shield size={18} />
                </div>
                <span>Role Settings</span>
                {router.pathname === "/roles" && (
                  <motion.div
                    className="ml-auto w-2 h-2 bg-white rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  />
                )}
              </div>
            </Link>

            <Link href="/employeeM" passHref>
              <div
                className={`w-full p-3 rounded-lg text-left flex items-center cursor-pointer transition-all ${router.pathname === "/employeeM" ? "bg-emerald-600 shadow-md" : "hover:bg-emerald-600/70"}`}
              >
                <div
                  className={`p-1.5 mr-3 rounded-lg ${router.pathname === "/employeeM" ? "bg-white text-emerald-700" : "bg-emerald-900/30 text-white"}`}
                >
                  <Users size={18} />
                </div>
                <span>Employee Management</span>
                {router.pathname === "/employeeM" && (
                  <motion.div
                    className="ml-auto w-2 h-2 bg-white rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  />
                )}
              </div>
            </Link>

            <Link href="/userManage" passHref>
              <div
                className={`w-full p-3 rounded-lg text-left flex items-center cursor-pointer transition-all ${router.pathname === "/userManage" ? "bg-emerald-600 shadow-md" : "hover:bg-emerald-600/70"}`}
              >
                <div
                  className={`p-1.5 mr-3 rounded-lg ${router.pathname === "/userManage" ? "bg-white text-emerald-700" : "bg-emerald-900/30 text-white"}`}
                >
                  <Users size={18} />
                </div>
                <span>User Management</span>
                {router.pathname === "/userManage" && (
                  <motion.div
                    className="ml-auto w-2 h-2 bg-white rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  />
                )}
              </div>
            </Link>

            <Link href="/branchM" passHref>
              <div
                className={`w-full p-3 rounded-lg text-left flex items-center cursor-pointer transition-all ${router.pathname === "/branchM" ? "bg-emerald-600 shadow-md" : "hover:bg-emerald-600/70"}`}
              >
                <div
                  className={`p-1.5 mr-3 rounded-lg ${router.pathname === "/branchM" ? "bg-white text-emerald-700" : "bg-emerald-900/30 text-white"}`}
                >
                  <Home size={18} />
                </div>
                <span>Branch Management</span>
                {router.pathname === "/branchM" && (
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
                User Management
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage system users and their permissions
              </p>
            </div>

            <div className="mt-4 md:mt-0">
              <motion.button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <UserPlus size={18} />
                <span>New User</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Filter Tabs */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {["all", "active", "inactive"].map((tab) => (
                <motion.button
                  key={tab}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab
                    ? "bg-white text-emerald-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                    }`}
                  onClick={() => {
                    setActiveTab(tab);
                    setCurrentPage(1);
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {tab === "all"
                    ? "All Users"
                    : tab === "active"
                      ? "Active"
                      : "Inactive"}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Main Content Area */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* User Table */}
            <motion.div
              className={`${selectedUser ? "lg:w-[calc(100%-350px)]" : "w-full"} transition-all duration-300`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Username
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Branch
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {isLoading ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-4 text-center">
                            Loading users...
                          </td>
                        </tr>
                      ) : currentUsers.length === 0 ? (
                        <tr>
                          <td
                            colSpan="5"
                            className="px-6 py-4 text-center text-gray-500"
                          >
                            No users found
                          </td>
                        </tr>
                      ) : (
                        currentUsers.map((user) => (
                          <motion.tr
                            key={user.id}
                            className={`hover:bg-gray-50 cursor-pointer ${selectedUser?.id === user.id
                              ? "bg-emerald-50"
                              : ""
                              }`}
                            onClick={() => fetchUserDetails(user.id)}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            whileHover={{ backgroundColor: "#f9fafb" }}
                          >
                            {/* User Column */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {user.email || "No email"}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Username Column */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {user.username}
                              </div>
                            </td>

                            {/* Branch Column */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {user.branchName}
                              </div>
                            </td>

                            {/* Status Column */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === "Active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                                  }`}
                              >
                                {user.status}
                              </span>
                            </td>

                            {/* Actions Column */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex space-x-3">
                                <motion.button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditClick(user);
                                  }}
                                  className="text-gray-600 hover:text-gray-800"
                                  whileHover={{ scale: 1.2 }}
                                  whileTap={{ scale: 0.9 }}
                                  title="Edit"
                                >
                                  <Edit size={16} />
                                </motion.button>
                                <motion.button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    fetchUserDetails(user.id);
                                  }}
                                  className="text-gray-600 hover:text-gray-800"
                                  whileHover={{ scale: 1.2 }}
                                  whileTap={{ scale: 0.9 }}
                                  title="View Details"
                                >
                                  <Eye size={16} />
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4 px-6 py-3 bg-white border-t border-gray-200 rounded-b-xl">
                      {/* Left side: showing count */}
                      <span className="text-sm text-gray-600">
                        Showing {indexOfFirstBranch + 1} to{" "}
                        {Math.min(indexOfLastBranch, filteredBranches.length)} of{" "}
                        {filteredBranches.length} branches
                      </span>

                      {/* Right side: page buttons */}
                      <div className="flex items-center space-x-1">
                        <button
                          className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
                          onClick={() => handlePageChange(1)}
                          disabled={currentPage === 1}
                        >
                          <ChevronsLeft size={16} />
                        </button>
                        <button
                          className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft size={16} />
                        </button>

                        {/* Page numbers */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1 rounded-lg text-sm ${currentPage === page
                                ? "bg-emerald-600 text-white"
                                : "hover:bg-gray-100"
                              }`}
                          >
                            {page}
                          </button>
                        ))}

                        <button
                          className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight size={16} />
                        </button>
                        <button
                          className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
                          onClick={() => handlePageChange(totalPages)}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronsRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* User Details Panel */}
            {selectedUser && (
              <motion.div
                className="lg:w-[350px]"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6 h-[calc(100vh-120px)] overflow-y-auto">
                  {/* Panel Header */}
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">
                      {selectedUser.name}
                    </h2>
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* User Information */}
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Account Information
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-start">
                          <User
                            className="flex-shrink-0 mt-0.5 mr-2 text-gray-400"
                            size={16}
                          />
                          <span className="text-sm">
                            {selectedUser.username || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-start">
                          <Shield
                            className="flex-shrink-0 mt-0.5 mr-2 text-gray-400"
                            size={16}
                          />
                          <span className="text-sm">
                            {selectedUser.branch || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Account Status
                      </h3>
                      <div
                        className={`p-4 rounded-lg ${selectedUser.status === "Active"
                          ? "bg-green-100 border border-green-200"
                          : "bg-gray-100 border border-gray-200"
                          }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">
                            {selectedUser.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    {selectedUser.email && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                          Contact Information
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-start">
                            <Mail
                              className="flex-shrink-0 mt-0.5 mr-2 text-gray-400"
                              size={16}
                            />
                            <span className="text-sm">
                              {selectedUser.email}
                            </span>
                          </div>
                          {selectedUser.phone && (
                            <div className="flex items-start">
                              <Phone
                                className="flex-shrink-0 mt-0.5 mr-2 text-gray-400"
                                size={16}
                              />
                              <span className="text-sm">
                                {selectedUser.phone}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl w-full max-w-2xl" // wider modal for 2 cols
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Add New User</h3>
                  <button onClick={() => setIsModalOpen(false)}>
                    <X size={20} />
                  </button>
                </div>

                {/* Two-column form */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={newUser.name}
                      onChange={(e) =>
                        setNewUser({ ...newUser, name: e.target.value })
                      }
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={newUser.username}
                      onChange={(e) =>
                        setNewUser({ ...newUser, username: e.target.value })
                      }
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={newUser.email}
                      onChange={(e) =>
                        setNewUser({ ...newUser, email: e.target.value })
                      }
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Branch</label>
                    <select
                      name="branch_id"
                      value={newUser.branch_id}
                      onChange={(e) =>
                        setNewUser({ ...newUser, branch_id: e.target.value })
                      }
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      required
                    >
                      <option value="">Select Branch</option>
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <div className="relative">
                      <Lock
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={16}
                      />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={newUser.password}
                        onChange={(e) =>
                          setNewUser({ ...newUser, password: e.target.value })
                        }
                        className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Confirm Password</label>
                    <div className="relative">
                      <Lock
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={16}
                      />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={newUser.confirmPassword}
                        onChange={(e) =>
                          setNewUser({
                            ...newUser,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                      name="status"
                      value={newUser.status}
                      onChange={(e) =>
                        setNewUser({ ...newUser, status: e.target.value })
                      }
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddUser}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    Add User
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {isEditModalOpen && editUser && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl w-full max-w-2xl"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Edit User</h3>
                  <button onClick={() => setIsEditModalOpen(false)}>
                    <X size={20} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editUser.name}
                      onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={editUser.username}
                      onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  {/* Branch */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Branch</label>
                    <select
                      name="branch_id"
                      value={editUser.branch_id}
                      onChange={(e) =>
                        setEditUser({ ...editUser, branch_id: e.target.value })
                      }
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      required
                    >
                      <option value="">Select Branch</option>
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                      name="status"
                      value={editUser.status}
                      onChange={(e) => setEditUser({ ...editUser, status: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <div className="relative">
                      <Lock
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={16}
                      />
                      <input
                        type={showEditPassword ? "text" : "password"}
                        name="password"
                        value={editUser.password || ""}
                        onChange={(e) =>
                          setEditUser({ ...editUser, password: e.target.value })
                        }
                        className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditPassword(!showEditPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      >
                        {showEditPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Confirm Password</label>
                    <div className="relative">
                      <Lock
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={16}
                      />
                      <input
                        type={showEditConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={editUser.confirmPassword || ""}
                        onChange={(e) =>
                          setEditUser({
                            ...editUser,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowEditConfirmPassword(!showEditConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      >
                        {showEditConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Email - spans full width */}
                  {editUser.email && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={editUser.email}
                        onChange={(e) =>
                          setEditUser({ ...editUser, email: e.target.value })
                        }
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  )}

                  {/* Phone - spans full width */}
                  {editUser.phone && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">Phone</label>
                      <input
                        type="text"
                        name="phone"
                        value={editUser.phone}
                        onChange={(e) =>
                          setEditUser({ ...editUser, phone: e.target.value })
                        }
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  )}
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveEdit(editUser)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
