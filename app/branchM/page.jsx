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
  Plus,
  MoreVertical,
  Search,
  X,
  Edit,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronsLeft,
  ChevronRight,
  ChevronsRight,
  ChevronDown,
  Leaf,
  Phone,
} from "lucide-react";

export default function BranchManagementPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editBranch, setEditBranch] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [branchesPerPage] = useState(10);
  const [users, setUsers] = useState([]);

  const [newBranch, setNewBranch] = useState({
    name: "",
    address: "",
    contactNumber: "",
    user: "",
  });

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost/API/branches.php");
      if (!response.ok) throw new Error("Failed to fetch branches");
      const data = await response.json();
      setBranches(data);
    } catch (error) {
      toast.error("Failed to load branches");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBranchDetails = async (branchId) => {
    try {
      const res = await fetch(
        `http://localhost/API/branches.php?id=${branchId}`
      );
      const data = await res.json();
      setSelectedBranch(data);
    } catch (error) {
      console.error("Error fetching branch details:", error);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost/API/users.php?action=users");
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleEditClick = (branch) => {
    setEditBranch({ ...branch });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (updatedBranch) => {
  try {
    // sanitize user_id before sending
    const payload = {
      ...updatedBranch,
      user_id:
        updatedBranch.user_id === "Not assigned" || updatedBranch.user_id === "" 
          ? null 
          : updatedBranch.user_id,
    };

    const res = await fetch(
      `http://localhost/API/branches.php?action=update&id=${updatedBranch.id}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const result = await res.json();
    if (result.success) {
      const updatedList = branches.map((b) =>
        b.id === updatedBranch.id ? payload : b
      );
      setBranches(updatedList);
      toast.success("Branch updated successfully");
      setIsEditModalOpen(false);
    } else {
      toast.error(result.error || "Failed to update");
    }
  } catch (err) {
    console.error(err);
    toast.error("An error occurred");
  }
};

  const handleAddBranch = async () => {
    try {
      if (!newBranch.name || !newBranch.address) {
        toast.error("Name and address are required");
        return;
      }

      const response = await fetch("http://localhost/API/branches.php?action=add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newBranch.name,
          address: newBranch.address,
          contactNumber: newBranch.contactNumber || null,
          colorCode: "#3B82F6", // default if not provided
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to add branch");

      // ✅ Use the actual branch object from backend
      setBranches((prev) => [...prev, result.branch]);

      // Reset form + close modal
      setIsModalOpen(false);
      setNewBranch({
        name: "",
        address: "",
        contactNumber: "",
      });

      toast.success("Branch added successfully");

    } catch (error) {
      console.error("Error adding branch:", error);
      toast.error(error.message || "Failed to add branch");
    }
  };


  const filteredBranches = branches.filter((branch) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      branch.name.toLowerCase().includes(query) ||
      branch.address.toLowerCase().includes(query) ||
      (branch.user_id && branch.user_id.toLowerCase().includes(query))
    );
  });

  const indexOfLastBranch = currentPage * branchesPerPage;
  const indexOfFirstBranch = indexOfLastBranch - branchesPerPage;
  const currentBranches = filteredBranches.slice(
    indexOfFirstBranch,
    indexOfLastBranch
  );
  const totalPages = Math.ceil(filteredBranches.length / branchesPerPage);

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
        <main className="flex-1 p-6 bg-gray-50 ml-64 overflow-x-hidden">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6"
          >
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Branch Management
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your clinic branches and locations
              </p>
            </div>

            <div className="mt-4 md:mt-0">
              <motion.button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus size={18} />
                <span>New Branch</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Main Content Area */}
          <div className="flex flex-col xl:flex-row gap-6 w-full">
            {/* Branch Table - Takes full width when no branch is selected */}
            <motion.div
              className={`${selectedBranch ? "xl:w-[70%]" : "w-full"} transition-all duration-300`}
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
                          Branch Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Address
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User Assigned
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {isLoading ? (
                        <tr>
                          <td colSpan="4" className="px-6 py-4 text-center">
                            Loading branches...
                          </td>
                        </tr>
                      ) : currentBranches.length === 0 ? (
                        <tr>
                          <td
                            colSpan="4"
                            className="px-6 py-4 text-center text-gray-500"
                          >
                            No branches found
                          </td>
                        </tr>
                      ) : (
                        currentBranches.map((branch) => (
                          <motion.tr
                            key={branch.id}
                            className={`hover:bg-gray-50 cursor-pointer ${selectedBranch?.id === branch.id
                              ? "bg-emerald-50"
                              : ""
                              }`}
                            onClick={() => fetchBranchDetails(branch.id)}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            whileHover={{ backgroundColor: "#f9fafb" }}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {branch.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {branch.address}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {branch.user_name || "Not assigned"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex space-x-3">
                                <motion.button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditClick(branch);
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
                                    fetchBranchDetails(branch.id);
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
                </div>
              </div>
            </motion.div>

            {/* Branch Details Panel */}
            {selectedBranch && (
              <motion.div
                className="xl:w-[30%] w-full"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6 max-h-[calc(100vh-120px)] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">
                      {selectedBranch.name}
                    </h2>
                    <button
                      onClick={() => setSelectedBranch(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Branch Information
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-start">
                          <Home
                            className="flex-shrink-0 mt-0.5 mr-2 text-gray-400"
                            size={16}
                          />
                          <span className="text-sm">
                            {selectedBranch.address || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-start">
                          <Phone
                            className="flex-shrink-0 mt-0.5 mr-2 text-gray-400"
                            size={16}
                          />
                          <span className="text-sm">
                            {selectedBranch.contactNumber || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        User Assigned
                      </h3>
                      <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                        <div className="text-sm font-medium text-gray-900">
                          {selectedBranch.user_name || "Not assigned"}
                        </div>

                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Branch Statistics
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                          <div className="text-xs text-blue-800">Users</div>
                          <div className="text-lg font-bold text-blue-900">
                            {selectedBranch.users || 0}
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-green-50 border border-green-100">
                          <div className="text-xs text-green-800">
                            Employees
                          </div>
                          <div className="text-lg font-bold text-green-900">
                            {selectedBranch.employees || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>

      {/* Add Branch Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl w-full max-w-md"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Add New Branch</h3>
                  <button onClick={() => setIsModalOpen(false)}>
                    <X size={20} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Branch Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={newBranch.name}
                      onChange={(e) =>
                        setNewBranch({ ...newBranch, name: e.target.value })
                      }
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={newBranch.address}
                      onChange={(e) =>
                        setNewBranch({ ...newBranch, address: e.target.value })
                      }
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Contact Number
                    </label>
                    <input
                      type="text"
                      name="contactNumber"
                      value={newBranch.contactNumber}
                      onChange={(e) =>
                        setNewBranch({
                          ...newBranch,
                          contactNumber: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  {/* <div>
                    <label className="block text-sm font-medium mb-1">
                      User Assign
                    </label>
                    <select
                      name="user_id"
                      value={newBranch.user_id}
                      onChange={(e) =>
                        setNewBranch({ ...newBranch, user_id: e.target.value })
                      }
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      required
                    >
                      <option value="">Select User</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.role})
                        </option>
                      ))}
                    </select>
                  </div> */}
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddBranch}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    Add Branch
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Branch Modal */}
      <AnimatePresence>
        {isEditModalOpen && editBranch && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl w-full max-w-md"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Edit Branch</h3>
                  <button onClick={() => setIsEditModalOpen(false)}>
                    <X size={20} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Branch Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={editBranch.name}
                      onChange={(e) =>
                        setEditBranch({ ...editBranch, name: e.target.value })
                      }
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={editBranch.address}
                      onChange={(e) =>
                        setEditBranch({
                          ...editBranch,
                          address: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Contact Number
                    </label>
                    <input
                      type="text"
                      name="contactNumber"
                      value={editBranch.contactNumber}
                      onChange={(e) =>
                        setEditBranch({
                          ...editBranch,
                          contactNumber: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  {/* <div>
                    <label className="block text-sm font-medium mb-1">
                      User Assigned
                    </label>
                    <select
                      name="user_id"
                      value={editBranch.user_id || ""}
                      onChange={(e) =>
                        setEditBranch({
                          ...editBranch,
                          user_id: e.target.value, // keep consistent with backend
                        })
                      }
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">-- Select User --</option>
                      {users.map((user) => (
                        <option key={user.user_id} value={user.user_id}>
                          {user.name}
                        </option>
                      ))}

                    </select>
                  </div> */}
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveEdit(editBranch)}
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
