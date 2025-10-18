"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog } from "@headlessui/react";
import { Menu } from "@headlessui/react";
import { BarChart, BarChart3, ChevronLeft, PieChart, X } from "lucide-react";
import { User, Settings, LogOut, Tag } from "lucide-react";
import { Folder, ClipboardList, Factory, Calendar, MapPin } from "lucide-react";
import {
  Home,
  Users,
  FileText,
  CreditCard,
  Package,
  Layers,
  ShoppingCart,
  UserPlus,
  Search,
  BarChart2,
  Plus,
  Leaf,
  ChevronDown,
  TrendingUp,
  DollarSign,
  Activity,
  ChevronsLeft,
} from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [period, setPeriod] = useState("day");
  const [customDate, setCustomDate] = useState(new Date());
  const [dateRange, setDateRange] = useState({
    start: new Date(),
    end: new Date(),
  });
  const [selectedBranch, setSelectedBranch] = useState(null); // Track selected branch
  const [branches, setBranches] = useState([]); // Store branches separately

  const todayStr = new Date().toISOString().slice(0, 10);

  const [dashboardData, setDashboardData] = useState({
    topServices: [],
    revenueByService: [],
    revenueDistribution: [],
    loading: true,
  });

  const [branchData, setBranchData] = useState({
    topServices: [],
    revenueByService: [],
    loading: false,
  });

  // Fetch branches separately
  const fetchBranches = async () => {
    try {
      const response = await fetch("http://localhost/API/branches.php");
      if (!response.ok) throw new Error("Failed to fetch branches");
      const data = await response.json();
      setBranches(data);
    } catch (error) {
      toast.error("Failed to load branches");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setDashboardData((prev) => ({ ...prev, loading: true }));

      const params = new URLSearchParams({
        action: "dashboard",
        period: period,
      });

      // Only append dates if period is custom and both dates are valid
      if (
        period === "custom" &&
        dateRange.start instanceof Date &&
        !isNaN(dateRange.start) &&
        dateRange.end instanceof Date &&
        !isNaN(dateRange.end)
      ) {
        params.append("start_date", dateRange.start.toISOString().slice(0, 10));
        params.append("end_date", dateRange.end.toISOString().slice(0, 10));
      }

      try {
        const response = await fetch(
          `http://localhost/API/home.php?${params.toString()}`
        );
        const data = await response.json();
        setDashboardData({
          topServices: data.top_services || [],
          revenueByService: data.revenue_by_service || [],
          revenueDistribution: data.revenue_distribution || [],
          loading: false,
        });
      } catch (error) {
        console.error("Error:", error);
        setDashboardData((prev) => ({ ...prev, loading: false }));
      }
    };

    // Don't fetch if custom period but start or end date is missing
    if (period === "custom") {
      if (!dateRange.start || !dateRange.end) return;
    }

    fetchDashboardData();
  }, [period, dateRange]);

  // Function to fetch branch-specific data
  const fetchBranchData = async (branchId) => {
    setBranchData({ loading: true });

    const params = new URLSearchParams({
      action: "branch_dashboard",
      branch_id: branchId,
      period: period,
    });

    if (
      period === "custom" &&
      dateRange.start instanceof Date &&
      !isNaN(dateRange.start) &&
      dateRange.end instanceof Date &&
      !isNaN(dateRange.end)
    ) {
      params.append("start_date", dateRange.start.toISOString().slice(0, 10));
      params.append("end_date", dateRange.end.toISOString().slice(0, 10));
    }

    try {
      const response = await fetch(
        `http://localhost/API/home.php?${params.toString()}`
      );
      const data = await response.json();
      setBranchData({
        topServices: data.top_services || [],
        revenueByService: data.revenue_by_service || [],
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching branch data:", error);
      setBranchData({
        topServices: [],
        revenueByService: [],
        loading: false,
      });
    }
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    const today = new Date();

    let startDate;
    let endDate;

    if (newPeriod === "day") {
      startDate = new Date(today);
      endDate = new Date(today);
    } else if (newPeriod === "week") {
      const day = today.getDay();
      // Calculate Monday of this week (or Sunday if you want)
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      startDate = new Date(today.getFullYear(), today.getMonth(), diff);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
    } else if (newPeriod === "month") {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else if (newPeriod === "year") {
      startDate = new Date(today.getFullYear(), 0, 1);
      endDate = new Date(today.getFullYear(), 11, 31);
    }

    setDateRange({ start: startDate, end: endDate });

    // If a branch is selected, refetch its data with the new period
    if (selectedBranch) {
      fetchBranchData(selectedBranch.id);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/";
  };

  // Handle branch selection
  const handleBranchSelect = (branch) => {
    setSelectedBranch(branch);
    fetchBranchData(branch.id);
  };

  // Handle going back to all branches view
  const handleBackToAllBranches = () => {
    setSelectedBranch(null);
  };

  // Calculate total revenue
  const totalRevenue = dashboardData.revenueDistribution.reduce(
    (sum, branch) => sum + (branch.revenue || 0),
    0
  );

  // Combine branches with revenue data
  const combinedBranchesData = branches.map((branch) => {
    const revenueData = dashboardData.revenueDistribution.find(
      (rev) => rev.branch_id === branch.id
    );
    return {
      ...branch,
      revenue: revenueData ? revenueData.revenue : 0,
      percentage:
        revenueData && totalRevenue > 0
          ? Math.round((revenueData.revenue / totalRevenue) * 100)
          : 0,
    };
  });

  // Sort branches by revenue (highest first)
  const sortedBranches = [...combinedBranchesData].sort(
    (a, b) => (b.revenue || 0) - (a.revenue || 0)
  );

  // Get data for display (either all branches or selected branch)
  const displayData = selectedBranch ? branchData : dashboardData;
  const displayLoading = selectedBranch
    ? branchData.loading
    : dashboardData.loading;

  // Safe access to data properties
  const topServices = displayData.topServices || [];
  const revenueByService = displayData.revenueByService || [];
  const topServiceName = topServices.length > 0 ? topServices[0]?.name : "N/A";

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-800">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <header className="flex items-center justify-between bg-emerald-800 text-white p-4 w-full h-16 pl-64 relative">
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
          {/* Logo/Branding with subtle animation */}
          <motion.div
            className="flex items-center space-x-2 mb-8 px-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-2 bg-white/10 rounded-lg">
              <Leaf size={24} className="text-emerald-300" />
            </div>
            <h1 className="text-xl font-bold text-white font-sans tracking-tight">
              Lizly Skin Care Clinic
            </h1>
          </motion.div>

          {/* Search for Mobile (hidden on desktop) */}
          <div className="px-4 mb-4 w-full lg:hidden">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-300"
                size={18}
              />
              <input
                type="text"
                placeholder="Search menu..."
                className="pl-10 pr-4 py-2 rounded-lg bg-emerald-900/50 text-white w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-emerald-300"
              />
            </div>
          </div>

          {/* Menu Items with Active State Highlight */}
          <div className="w-full px-4 space-y-1 overflow-y-auto flex-grow custom-scrollbar">
            {/* Dashboard */}
            <Menu as="div" className="relative w-full">
              <Link href="/home" passHref>
                <Menu.Button
                  as="div"
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
                </Menu.Button>
              </Link>
            </Menu>

            {/* Services Dropdown - Enhanced */}
            <Menu as="div" className="relative w-full">
              {({ open }) => (
                <>
                  <Menu.Button
                    className={`w-full p-3 rounded-lg text-left flex items-center justify-between transition-all ${open ? "bg-emerald-600" : "hover:bg-emerald-600/70"}`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`p-1.5 mr-3 rounded-lg ${open ? "bg-white text-emerald-700" : "bg-emerald-900/30 text-white"}`}
                      >
                        <Layers size={18} />
                      </div>
                      <span>Services</span>
                    </div>
                    <motion.div
                      animate={{ rotate: open ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-emerald-300"
                    >
                      <ChevronDown size={18} />
                    </motion.div>
                  </Menu.Button>

                  <AnimatePresence>
                    {open && (
                      <Menu.Items
                        as={motion.div}
                        static
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-1 ml-3 w-full bg-emerald-700/90 text-white rounded-lg shadow-lg overflow-hidden"
                      >
                        {[
                          {
                            href: "/servicess",
                            label: "All Services",
                            icon: <Layers size={16} />,
                          },
                          {
                            href: "/membership",
                            label: "Memberships",
                            icon: <UserPlus size={16} />,
                            badge: 3,
                          },
                          {
                            href: "/membership-report",
                            label: "Membership Management",
                            icon: <BarChart3 size={16} />,
                          },
                          {
                            href: "/items",
                            label: "Beauty Deals",
                            icon: <Tag size={16} />,
                            badge: "New",
                          },
                          {
                            href: "/serviceorder",
                            label: "Service Acquire",
                            icon: <ClipboardList size={16} />,
                          },
                        ].map((link, index) => (
                          <Menu.Item key={link.href}>
                            {({ active }) => (
                              <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                              >
                                <Link
                                  href={link.href}
                                  className={`flex items-center justify-between space-x-3 p-3 ${active ? "bg-emerald-600" : ""} ${router.pathname === link.href ? "bg-emerald-600 font-medium" : ""}`}
                                >
                                  <div className="flex items-center">
                                    <span
                                      className={`mr-3 ${router.pathname === link.href ? "text-white" : "text-emerald-300"}`}
                                    >
                                      {link.icon}
                                    </span>
                                    <span>{link.label}</span>
                                  </div>
                                  {link.badge && (
                                    <span
                                      className={`text-xs px-2 py-0.5 rounded-full ${typeof link.badge === "number" ? "bg-amber-500" : "bg-emerald-500"}`}
                                    >
                                      {link.badge}
                                    </span>
                                  )}
                                </Link>
                              </motion.div>
                            )}
                          </Menu.Item>
                        ))}
                      </Menu.Items>
                    )}
                  </AnimatePresence>
                </>
              )}
            </Menu>

            {/* Sales Dropdown - Enhanced */}
            <Menu as="div" className="relative w-full">
              {({ open }) => (
                <>
                  <Menu.Button
                    className={`w-full p-3 rounded-lg text-left flex items-center justify-between transition-all ${open ? "bg-emerald-600" : "hover:bg-emerald-600/70"}`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`p-1.5 mr-3 rounded-lg ${open ? "bg-white text-emerald-700" : "bg-emerald-900/30 text-white"}`}
                      >
                        <BarChart2 size={18} />
                      </div>
                      <span>Sales</span>
                    </div>
                    <motion.div
                      animate={{ rotate: open ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-emerald-300"
                    >
                      <ChevronDown size={18} />
                    </motion.div>
                  </Menu.Button>

                  <AnimatePresence>
                    {open && (
                      <Menu.Items
                        as={motion.div}
                        static
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-1 ml-3 w-full bg-emerald-700/90 text-white rounded-lg shadow-lg overflow-hidden"
                      >
                        {[
                          {
                            href: "/customers",
                            label: "Customers",
                            icon: <Users size={16} />,
                          },
                          {
                            href: "/invoices",
                            label: "Invoices",
                            icon: <FileText size={16} />,
                          },
                        ].map((link, index) => (
                          <Menu.Item key={link.href}>
                            {({ active }) => (
                              <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                              >
                                <Link
                                  href={link.href}
                                  className={`flex items-center justify-between space-x-3 p-3 ${active ? "bg-emerald-600" : ""} ${router.pathname === link.href ? "bg-emerald-600 font-medium" : ""}`}
                                >
                                  <div className="flex items-center">
                                    <span
                                      className={`mr-3 ${router.pathname === link.href ? "text-white" : "text-emerald-300"}`}
                                    >
                                      {link.icon}
                                    </span>
                                    <span>{link.label}</span>
                                  </div>
                                  {link.count && (
                                    <span className="text-xs text-emerald-200">
                                      {link.count}
                                    </span>
                                  )}
                                </Link>
                              </motion.div>
                            )}
                          </Menu.Item>
                        ))}
                      </Menu.Items>
                    )}
                  </AnimatePresence>
                </>
              )}
            </Menu>
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
                <button className="text-emerald-300 hover:text-white transition-colors"
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
        <main className="flex-1 p-8 max-w-screen-xl mx-auto ml-64 bg-gray-50 min-h-screen pt-26">
          {/* Header with Stats */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  {selectedBranch
                    ? `${selectedBranch.name} Dashboard`
                    : "Dashboard Overview"}
                </h1>
                <p className="text-gray-600">
                  {selectedBranch
                    ? `Performance insights for ${selectedBranch.name}`
                    : "Performance insights for your business across all branches"}
                </p>
              </div>

              {selectedBranch && (
                <motion.button
                  onClick={handleBackToAllBranches}
                  className="flex items-center gap-2 px-5 py-2 text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronsLeft size={18} />
                  Back
                </motion.button>
              )}
            </div>
          </div>

          {/* Time Period Filter */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex space-x-2 bg-white p-1 rounded-lg shadow-sm">
              {["day", "week", "month", "year", "custom"].map((p) => (
                <motion.button
                  key={p}
                  onClick={() => handlePeriodChange(p)}
                  className={`text-xs px-3 py-1.5 rounded transition ${
                    period === p
                      ? "bg-emerald-600 text-white"
                      : "bg-transparent text-gray-600 hover:bg-gray-100"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {p === "custom"
                    ? "Custom"
                    : p.charAt(0).toUpperCase() + p.slice(1)}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Custom Date Range Picker */}
          {period === "custom" && (
            <div className="flex justify-end mb-6">
              <div className="flex items-center space-x-2 bg-white p-2 rounded-lg shadow-sm">
                <input
                  type="date"
                  value={
                    dateRange.start
                      ? dateRange.start.toISOString().slice(0, 10)
                      : todayStr
                  }
                  max={todayStr} // Prevent future date
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev,
                      start: e.target.value ? new Date(e.target.value) : null,
                      // Reset end if end is before new start
                      end:
                        prev.end &&
                        e.target.value &&
                        new Date(e.target.value) > prev.end
                          ? null
                          : prev.end,
                    }))
                  }
                  className="border px-3 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={
                    dateRange.end
                      ? dateRange.end.toISOString().slice(0, 10)
                      : ""
                  }
                  min={
                    dateRange.start
                      ? dateRange.start.toISOString().slice(0, 10)
                      : undefined
                  }
                  max={todayStr} // Prevent future date
                  disabled={!dateRange.start}
                  onChange={(e) =>
                    setDateRange((prev) => ({
                      ...prev,
                      end: e.target.value ? new Date(e.target.value) : null,
                    }))
                  }
                  className={`border px-3 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                    !dateRange.start ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                />
              </div>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Revenue Card */}
            <motion.div
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    {selectedBranch ? "Branch Revenue" : "Total Revenue"}
                  </p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">
                    {selectedBranch
                      ? `₱${(selectedBranch.revenue || 0).toLocaleString()}`
                      : `₱${totalRevenue.toLocaleString()}`}
                  </h3>
                </div>
                <div className="p-3 bg-emerald-100 rounded-full">
                  <DollarSign className="text-emerald-600" size={24} />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <TrendingUp className="text-emerald-500 mr-1" size={16} />
                <span className="text-sm text-emerald-600">
                  +12.3% from last {period}
                </span>
              </div>
            </motion.div>

            {/* Top Performing Branch Card - Only show when viewing all branches */}
            {!selectedBranch && (
              <motion.div
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      Top Performing Branch
                    </p>
                    <h3 className="text-xl font-bold text-gray-800 mt-1">
                      {sortedBranches[0]?.name || "N/A"}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      ₱{(sortedBranches[0]?.revenue || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-amber-100 rounded-full">
                    <MapPin className="text-amber-600" size={24} />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-amber-500 h-2 rounded-full"
                      style={{
                        width: `${sortedBranches[0]?.percentage || 0}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {sortedBranches[0]?.percentage || 0}% of total revenue
                  </p>
                </div>
              </motion.div>
            )}

            {/* Branch Info Card - Only show when viewing a specific branch */}
            {selectedBranch && (
              <motion.div
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Branch Information</p>
                    <h3 className="text-xl font-bold text-gray-800 mt-1">
                      {selectedBranch.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedBranch.address}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <MapPin className="text-blue-600" size={24} />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-xs text-gray-500">
                    Contribution: {selectedBranch.percentage || 0}% of total
                    revenue
                  </p>
                </div>
              </motion.div>
            )}

            {/* Services Performance Card */}
            <motion.div
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Services Performance</p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">
                    {topServices.length}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">Active services</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Activity className="text-blue-600" size={24} />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <span className="text-sm text-gray-600">
                  Top service: {topServiceName}
                </span>
              </div>
            </motion.div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Top Ordered Services */}
            <motion.div
              className="p-6 bg-white rounded-xl shadow-sm border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  {selectedBranch
                    ? "Branch Top Services"
                    : "Top Ordered Services"}
                </h2>
                <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  {period === "custom" && dateRange.start && dateRange.end
                    ? `${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`
                    : `This ${period}`}
                </span>
              </div>
              {displayLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
                </div>
              ) : topServices.length > 0 ? (
                <div className="space-y-4 max-h-64 overflow-y-auto pr-2 scrollbar-hide">
                  {topServices.map((service, index) => (
                    <motion.div
                      key={index}
                      className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 mr-3"></span>
                        <span className="text-gray-700">{service.name}</span>
                      </div>
                      <span className="font-medium text-gray-900">
                        {service.count} orders
                      </span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex justify-center items-center h-40 text-gray-500">
                  No service data available
                </div>
              )}
            </motion.div>

            {/* Revenue by Service */}
            <motion.div
              className="p-6 bg-white rounded-xl shadow-sm border border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  {selectedBranch
                    ? "Branch Service Revenue"
                    : "Service Revenue"}
                </h2>
                <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  {period === "custom" && dateRange.start && dateRange.end
                    ? `${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`
                    : `This ${period}`}
                </span>
              </div>
              {displayLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
                </div>
              ) : revenueByService.length > 0 ? (
                <div className="space-y-4 max-h-64 overflow-y-auto pr-2 scrollbar-hide">
                  {revenueByService.map((service, index) => (
                    <motion.div
                      key={index}
                      className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-amber-500 mr-3"></span>
                        <span className="text-gray-700">{service.name}</span>
                      </div>
                      <span className="font-medium text-gray-900">
                        ₱{(service.revenue || 0).toLocaleString()}
                      </span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex justify-center items-center h-40 text-gray-500">
                  No revenue data available
                </div>
              )}
            </motion.div>
          </div>

          {/* Combined Branch Performance - Only show when viewing all branches */}
          {!selectedBranch && (
            <motion.div
              className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">
                  Branch Performance Overview
                </h2>
                <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  {period === "custom" && dateRange.start && dateRange.end
                    ? `${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`
                    : `This ${period}`}
                </span>
              </div>

              {dashboardData.loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
                </div>
              ) : sortedBranches.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Donut Chart */}
                  <div className="flex flex-col items-center">
                    <div className="relative w-64 h-64">
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        {(() => {
                          let currentAngle = 0;
                          const colors = [
                            "#10B981",
                            "#3B82F6",
                            "#F59E0B",
                            "#EF4444",
                            "#8B5CF6",
                            "#EC4899",
                          ];

                          return sortedBranches.map((branch, index) => {
                            const percentage = branch.percentage || 0;
                            const angle = (percentage / 100) * 360;
                            const largeArcFlag = percentage > 50 ? 1 : 0;

                            const x1 =
                              50 +
                              50 * Math.cos((Math.PI * currentAngle) / 180);
                            const y1 =
                              50 +
                              50 * Math.sin((Math.PI * currentAngle) / 180);
                            const x2 =
                              50 +
                              50 *
                                Math.cos(
                                  (Math.PI * (currentAngle + angle)) / 180
                                );
                            const y2 =
                              50 +
                              50 *
                                Math.sin(
                                  (Math.PI * (currentAngle + angle)) / 180
                                );

                            currentAngle += angle;

                            return (
                              <motion.path
                                key={index}
                                d={`M50,50 L${x1},${y1} A50,50 0 ${largeArcFlag},1 ${x2},${y2} Z`}
                                fill={colors[index % colors.length]}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.2 }}
                              />
                            );
                          });
                        })()}
                        {/* Donut Hole */}
                        <circle cx="50" cy="50" r="25" fill="white" />
                      </svg>
                      {/* Center Label */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-sm text-gray-500">
                          Total Revenue
                        </span>
                        <span className="text-lg font-bold text-gray-800">
                          ₱{totalRevenue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Branch List with Performance Metrics */}
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {sortedBranches.map((branch, index) => (
                      <motion.div
                        key={branch.id}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        onClick={() => handleBranchSelect(branch)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-start">
                            <div
                              className="w-3 h-3 rounded-full mt-1.5 mr-3"
                              style={{
                                backgroundColor: [
                                  "#10B981",
                                  "#3B82F6",
                                  "#F59E0B",
                                  "#EF4444",
                                  "#8B5CF6",
                                  "#EC4899",
                                ][index % 6],
                              }}
                            ></div>
                            <div>
                              <h3 className="font-medium text-gray-800">
                                {branch.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {branch.address}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              ₱{(branch.revenue || 0).toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              {branch.percentage || 0}% of total
                            </p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${branch.percentage || 0}%`,
                                backgroundColor: [
                                  "#10B981",
                                  "#3B82F6",
                                  "#F59E0B",
                                  "#EF4444",
                                  "#8B5CF6",
                                  "#EC4899",
                                ][index % 6],
                              }}
                            ></div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex justify-center items-center h-64 text-gray-500">
                  No branch performance data available
                </div>
              )}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
