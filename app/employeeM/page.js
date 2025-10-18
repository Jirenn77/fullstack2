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
  ChevronDown,
  Leaf,
  Plus,
  Search,
  X,
  Edit,
  Eye,
  Trash2,
  UserPlus,
} from "lucide-react";

export default function EmployeeManagement() {
  const router = useRouter();
  const pathname = usePathname();
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [employeesPerPage] = useState(10);

  const [newEmployee, setNewEmployee] = useState({
    name: "",
    service: "",
    email: "",
    phone: "",
    hireDate: "",
    contactDetails: "",
    status: "Active",
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      // Replace with your actual API endpoint
      const response = await fetch("http://localhost/API/employees.php");
      if (!response.ok) throw new Error("Failed to fetch employees");
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      toast.error("Failed to load employees");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployeeDetails = async (employeeId) => {
    try {
      const res = await fetch(
        `http://localhost/API/employees.php?id=${employeeId}`
      );
      const data = await res.json();
      setSelectedEmployee(data);
    } catch (error) {
      console.error("Error fetching employee details:", error);
    }
  };

  const handleEditClick = (employee) => {
    setEditEmployee({ ...employee });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (updatedEmployee) => {
    try {
      const res = await fetch(
        `http://localhost/API/employees.php?action=update&id=${updatedEmployee.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedEmployee),
        }
      );

      const result = await res.json();
      if (result.success) {
        const updatedList = employees.map((emp) =>
          emp.id === updatedEmployee.id ? updatedEmployee : emp
        );
        setEmployees(updatedList);
        toast.success("Employee updated successfully");
        setIsEditModalOpen(false);
      } else {
        toast.error(result.message || "Failed to update");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;

    try {
      const res = await fetch(
        `http://localhost/API/employees.php?action=delete&id=${employeeId}`,
        {
          method: "DELETE",
        }
      );

      const result = await res.json();
      if (result.success) {
        setEmployees(employees.filter((emp) => emp.id !== employeeId));
        toast.success("Employee deleted successfully");
        if (selectedEmployee?.id === employeeId) {
          setSelectedEmployee(null);
        }
      } else {
        toast.error(result.message || "Failed to delete");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    }
  };

  const handleAddEmployee = async () => {
    try {
      if (!newEmployee.name || !newEmployee.service) {
        toast.error("Name and service are required");
        return;
      }

      const response = await fetch("http://localhost/API/employees.php?action=add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEmployee),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to add employee");

      // result is already the employee object
      setEmployees([...employees, result]);

      setIsModalOpen(false);
      setNewEmployee({
        name: "",
        service: "",
        email: "",
        phone: "",
        hireDate: "",
        contactDetails: "",
        status: "Active",
      });

      toast.success("Employee added successfully");
    } catch (error) {
      console.error("Error adding employee:", error);
      toast.error(error.message || "Failed to add employee");
    }
  };


  const filteredEmployees = employees
    .filter((employee) => {
      if (activeTab === "all") return true;
      if (activeTab === "active") return employee.status === "Active";
      if (activeTab === "inactive") return employee.status === "Inactive";
      return true;
    })
    .filter((employee) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        employee.name.toLowerCase().includes(query) ||
        employee.service.toLowerCase().includes(query) ||
        employee.email.toLowerCase().includes(query) ||
        employee.phone.includes(query)
      );
    });

  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = filteredEmployees.slice(
    indexOfFirstEmployee,
    indexOfLastEmployee
  );
  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);

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
                Employee Management
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your clinic's employees and their information
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
                <span>New Employee</span>
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
                    ? "All Employees"
                    : tab === "active"
                      ? "Active"
                      : "Inactive"}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Main Content Area */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Employee Table */}
            <motion.div
              className={`${selectedEmployee ? "lg:w-[calc(100%-350px)]" : "w-full"} transition-all duration-300`}
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
                          Employee
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Service
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
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
                            Loading employees...
                          </td>
                        </tr>
                      ) : currentEmployees.length === 0 ? (
                        <tr>
                          <td
                            colSpan="5"
                            className="px-6 py-4 text-center text-gray-500"
                          >
                            No employees found
                          </td>
                        </tr>
                      ) : (
                        currentEmployees.map((employee) => (
                          <motion.tr
                            key={employee.id}
                            className={`hover:bg-gray-50 cursor-pointer ${selectedEmployee?.id === employee.id
                                ? "bg-emerald-50"
                                : ""
                              }`}
                            onClick={() => fetchEmployeeDetails(employee.id)}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            whileHover={{ backgroundColor: "#f9fafb" }}
                          >
                            {/* Employee Column */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {employee.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {employee.email}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Service Column */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {employee.service}
                              </div>
                            </td>

                            {/* Contact Column */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {employee.phone}
                              </div>
                            </td>

                            {/* Status Column */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${employee.status === "Active"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                  }`}
                              >
                                {employee.status}
                              </span>
                            </td>

                            {/* Actions Column */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex space-x-3">
                                <motion.button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditClick(employee);
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
                                    fetchEmployeeDetails(employee.id);
                                  }}
                                  className="text-gray-600 hover:text-gray-800"
                                  whileHover={{ scale: 1.2 }}
                                  whileTap={{ scale: 0.9 }}
                                  title="View Details"
                                >
                                  <Eye size={16} />
                                </motion.button>
                                <motion.button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteEmployee(employee.id);
                                  }}
                                  className="text-red-600 hover:text-red-800"
                                  whileHover={{ scale: 1.2 }}
                                  whileTap={{ scale: 0.9 }}
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  {/* Pagination Controls */}
                  <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing{" "}
                          <span className="font-medium">
                            {(currentPage - 1) * employeesPerPage + 1}
                          </span>{" "}
                          to{" "}
                          <span className="font-medium">
                            {Math.min(
                              currentPage * employeesPerPage,
                              filteredEmployees.length
                            )}
                          </span>{" "}
                          of{" "}
                          <span className="font-medium">
                            {filteredEmployees.length}
                          </span>{" "}
                          employees
                        </p>
                      </div>
                      <div>
                        <nav
                          className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                          aria-label="Pagination"
                        >
                          <button
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                          >
                            <span className="sr-only">First</span>
                            <ChevronsLeft className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                          >
                            <span className="sr-only">Previous</span>
                            <ChevronLeft className="h-5 w-5" />
                          </button>

                          {/* Page numbers */}
                          {Array.from(
                            { length: Math.min(5, totalPages) },
                            (_, i) => {
                              let pageNum;
                              if (totalPages <= 5) {
                                pageNum = i + 1;
                              } else if (currentPage <= 3) {
                                pageNum = i + 1;
                              } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                              } else {
                                pageNum = currentPage - 2 + i;
                              }

                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => handlePageChange(pageNum)}
                                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pageNum
                                      ? "z-10 bg-emerald-50 border-emerald-500 text-emerald-600"
                                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                    }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            }
                          )}

                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                          >
                            <span className="sr-only">Next</span>
                            <ChevronRight className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handlePageChange(totalPages)}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                          >
                            <span className="sr-only">Last</span>
                            <ChevronsRight className="h-5 w-5" />
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Employee Details Panel */}
            {selectedEmployee && (
              <motion.div
                className="lg:w-[350px] w-full"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:sticky lg:top-6 h-fit lg:h-[calc(100vh-120px)] lg:overflow-y-auto">
                  {/* Panel Header */}
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">
                      {selectedEmployee.name}
                    </h2>
                    <button
                      onClick={() => setSelectedEmployee(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Employee Information */}
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Contact Information
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-start">
                          <Phone
                            className="flex-shrink-0 mt-0.5 mr-2 text-gray-400"
                            size={16}
                          />
                          <span className="text-sm">
                            {selectedEmployee.phone || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-start">
                          <Mail
                            className="flex-shrink-0 mt-0.5 mr-2 text-gray-400"
                            size={16}
                          />
                          <span className="text-sm">
                            {selectedEmployee.email || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-start">
                          <Calendar
                            className="flex-shrink-0 mt-0.5 mr-2 text-gray-400"
                            size={16}
                          />
                          <span className="text-sm">
                            {selectedEmployee.hireDate || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Service Info */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Service Information
                      </h3>
                      <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                        <div className="text-sm font-medium text-gray-900">
                          {selectedEmployee.service || "N/A"}
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Employment Status
                      </h3>
                      <div
                        className={`p-4 rounded-lg ${selectedEmployee.status === "Active"
                            ? "bg-green-100 border border-green-200"
                            : "bg-gray-100 border border-gray-200"
                          }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">
                            {selectedEmployee.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Contact Details */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Address
                      </h3>
                      <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                        <p className="text-sm">
                          {selectedEmployee.contactDetails || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>

      {/* Add Employee Modal */}
      <AnimatePresence>
        {isModalOpen && (
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
                  <h3 className="text-lg font-bold">Add New Employee</h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* 2-Column Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Column 1 */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={newEmployee.name}
                        onChange={(e) =>
                          setNewEmployee({
                            ...newEmployee,
                            name: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={newEmployee.email}
                        onChange={(e) =>
                          setNewEmployee({
                            ...newEmployee,
                            email: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Hire Date
                      </label>
                      <input
                        type="date"
                        value={newEmployee.hireDate}
                        onChange={(e) =>
                          setNewEmployee({
                            ...newEmployee,
                            hireDate: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Address
                      </label>
                      <textarea
                        value={newEmployee.contactDetails}
                        onChange={(e) =>
                          setNewEmployee({
                            ...newEmployee,
                            contactDetails: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded-lg"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Column 2 */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Service
                      </label>
                      <input
                        type="text"
                        value={newEmployee.service}
                        onChange={(e) =>
                          setNewEmployee({
                            ...newEmployee,
                            service: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Phone
                      </label>
                      <input
                        type="text"
                        value={newEmployee.phone}
                        onChange={(e) =>
                          setNewEmployee({
                            ...newEmployee,
                            phone: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Status
                      </label>
                      <select
                        value={newEmployee.status}
                        onChange={(e) =>
                          setNewEmployee({
                            ...newEmployee,
                            status: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded-lg"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddEmployee}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                  >
                    Add Employee
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Employee Modal */}
      <AnimatePresence>
        {isEditModalOpen && editEmployee && (
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
                  <h3 className="text-lg font-bold">Edit Employee</h3>
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* 2-Column Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Column 1 */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={editEmployee.name}
                        onChange={(e) =>
                          setEditEmployee({
                            ...editEmployee,
                            name: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={editEmployee.email}
                        onChange={(e) =>
                          setEditEmployee({
                            ...editEmployee,
                            email: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Hire Date
                      </label>
                      <input
                        type="date"
                        value={editEmployee.hireDate}
                        onChange={(e) =>
                          setEditEmployee({
                            ...editEmployee,
                            hireDate: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Address
                      </label>
                      <textarea
                        value={editEmployee.contactDetails}
                        onChange={(e) =>
                          setEditEmployee({
                            ...editEmployee,
                            contactDetails: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded-lg"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Column 2 */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Service
                      </label>
                      <input
                        type="text"
                        value={editEmployee.service}
                        onChange={(e) =>
                          setEditEmployee({
                            ...editEmployee,
                            service: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Phone
                      </label>
                      <input
                        type="text"
                        value={editEmployee.phone}
                        onChange={(e) =>
                          setEditEmployee({
                            ...editEmployee,
                            phone: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Status
                      </label>
                      <select
                        value={editEmployee.status}
                        onChange={(e) =>
                          setEditEmployee({
                            ...editEmployee,
                            status: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded-lg"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveEdit(editEmployee)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
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
