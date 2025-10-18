"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog } from "@headlessui/react";
import { Menu } from "@headlessui/react";
import { BarChart, BarChart3 } from "lucide-react";
import { User, Settings, LogOut, Tag } from "lucide-react";
import { Folder, ClipboardList, Factory, Calendar } from "lucide-react";
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
} from "lucide-react";

export default function Dashboard() {
      const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [period, setPeriod] = useState("day");
  const [customDate, setCustomDate] = useState(new Date());
  const [dateRange, setDateRange] = useState({
    start: new Date(),
    end: new Date(),
  });

  const todayStr = new Date().toISOString().slice(0, 10);

  const [dashboardData, setDashboardData] = useState({
    topServices: [],
    revenueByService: [],
    branches: [],
    revenueDistribution: [],
    loading: true,
  });

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
          branches: data.branches || [],
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
  };

  const handleAddUser = () => {
    toast("Add User functionality triggered.");
  };

  const handleAddService = () => {
    toast("Add Service functionality triggered.");
  };

  const handleAddServiceGroup = () => {
    toast("Add Service Item Group functionality triggered.");
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/";
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const cardVariants = {
    offscreen: { y: 50, opacity: 0 },
    onscreen: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        bounce: 0.4,
        duration: 0.8,
      },
    },
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-800">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <header className="flex items-center justify-between bg-emerald-700 text-white p-4 w-full h-16 pl-64 relative">
        <div className="flex items-center space-x-4">
          {/* Space for potential left-aligned elements */}
        </div>

        {/* <div className="flex items-center space-x-4 flex-grow justify-center">
          <button
            className="p-2 bg-emerald-600 rounded-full hover:bg-emerald-500 transition-colors"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={20} />
          </button>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg bg-white/90 text-gray-800 w-64 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
        </div> */}

        <div className="flex items-center space-x-4 relative">
          <div
            className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-lg font-bold cursor-pointer hover:bg-amber-600 transition-colors"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            R
          </div>
          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                className="absolute top-12 right-0 bg-white shadow-xl rounded-lg w-48 overflow-hidden"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Link href="/profiles">
                  <button className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 w-full text-left text-gray-700">
                    <User size={16} /> Profile
                  </button>
                </Link>
                <Link href="/acc-settings">
                  <button className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 w-full text-left text-gray-700">
                    <Settings size={16} /> Settings
                  </button>
                </Link>
                <button
                  className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 w-full text-left text-red-500"
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-300" size={18} />
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
              <Link href="/home2" passHref>
                <Menu.Button
                  as="div"
                  className={`w-full p-3 rounded-lg text-left flex items-center cursor-pointer transition-all ${router.pathname === '/home' ? 'bg-emerald-600 shadow-md' : 'hover:bg-emerald-600/70'}`}
                >
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
                </Menu.Button>
              </Link>
            </Menu>
      
            {/* Services Dropdown - Enhanced */}
            <Menu as="div" className="relative w-full">
              {({ open }) => (
                <>
                  <Menu.Button 
                    className={`w-full p-3 rounded-lg text-left flex items-center justify-between transition-all ${open ? 'bg-emerald-600' : 'hover:bg-emerald-600/70'}`}
                  >
                    <div className="flex items-center">
                      <div className={`p-1.5 mr-3 rounded-lg ${open ? 'bg-white text-emerald-700' : 'bg-emerald-900/30 text-white'}`}>
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
                          { href: "/servicess2", label: "All Services", icon: <Layers size={16} /> },
                          { href: "/membership2", label: "Memberships", icon: <UserPlus size={16} />, badge: 3 },
                          { href: "/items2", label: "Beauty Deals", icon: <Tag size={16} />, badge: 'New' },
                          { href: "/serviceorder2", label: "Service Acquire", icon: <ClipboardList size={16} /> },
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
                                  className={`flex items-center justify-between space-x-3 p-3 ${active ? 'bg-emerald-600' : ''} ${router.pathname === link.href ? 'bg-emerald-600 font-medium' : ''}`}
                                >
                                  <div className="flex items-center">
                                    <span className={`mr-3 ${router.pathname === link.href ? 'text-white' : 'text-emerald-300'}`}>
                                      {link.icon}
                                    </span>
                                    <span>{link.label}</span>
                                  </div>
                                  {link.badge && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${typeof link.badge === 'number' ? 'bg-amber-500' : 'bg-emerald-500'}`}>
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
                    className={`w-full p-3 rounded-lg text-left flex items-center justify-between transition-all ${open ? 'bg-emerald-600' : 'hover:bg-emerald-600/70'}`}
                  >
                    <div className="flex items-center">
                      <div className={`p-1.5 mr-3 rounded-lg ${open ? 'bg-white text-emerald-700' : 'bg-emerald-900/30 text-white'}`}>
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
                          { href: "/customers2", label: "Customers", icon: <Users size={16} />, count: 6 },
                          { href: "/invoices2", label: "Invoices", icon: <FileText size={16} />, count: 30 },
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
                                  className={`flex items-center justify-between space-x-3 p-3 ${active ? 'bg-emerald-600' : ''} ${router.pathname === link.href ? 'bg-emerald-600 font-medium' : ''}`}
                                >
                                  <div className="flex items-center">
                                    <span className={`mr-3 ${router.pathname === link.href ? 'text-white' : 'text-emerald-300'}`}>
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
                    <p className="text-sm font-medium">Reception User</p>
                    <p className="text-xs text-emerald-300">Receptionist</p>
                  </div>
                </div>
                <button className="text-emerald-300 hover:text-white transition-colors">
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
                  Top Ordered Services
                </h2>
                <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  {period === "custom" && dateRange.start && dateRange.end
                    ? `${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`
                    : `This ${period}`}
                </span>
              </div>
              {dashboardData.loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
                </div>
              ) : dashboardData.topServices.length > 0 ? (
                <div className="space-y-4 max-h-64 overflow-y-auto pr-2 scrollbar-hide">
                  {dashboardData.topServices.map((service, index) => (
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
                  Service Revenue
                </h2>
                <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  {period === "custom" && dateRange.start && dateRange.end
                    ? `${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`
                    : `This ${period}`}
                </span>
              </div>
              {dashboardData.loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
                </div>
              ) : dashboardData.revenueByService.length > 0 ? (
                <div className="space-y-4 max-h-64 overflow-y-auto pr-2 scrollbar-hide">
                  {dashboardData.revenueByService.map((service, index) => (
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
                        ₱{service.revenue.toLocaleString()}
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
        </main>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <Dialog
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <Dialog.Panel className="bg-gradient-to-b from-[#77DD77] to-[#56A156] text-gray-900 p-6 rounded-lg shadow-xl w-full max-w-lg">
            <Dialog.Title
              id="modal-title"
              className="text-lg font-bold text-gray-900 mb-4"
            >
              Select Option
            </Dialog.Title>
            <div id="modal-description" className="grid grid-cols-2 gap-6">
              {/* General Section */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="text-xl">📊</div>
                  <h2 className="font-semibold text-[#FFFFFF]-700">General</h2>
                </div>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={handleAddUser}
                      className="text-[#FFFFFF]-600 hover:underline hover:text-blue-600"
                    >
                      + Add Users
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={handleAddService}
                      className="text-[#FFFFFF]-600 hover:underline hover:text-blue-600"
                    >
                      + Services
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={handleAddServiceGroup}
                      className="text-[#FFFFFF]-600 hover:underline hover:text-blue-600"
                    >
                      + Services Item Groups
                    </button>
                  </li>
                </ul>
              </div>

              {/* Sales Section */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="text-xl">🛒</div>
                  <h2 className="font-semibold text-[#FFFFFF]-700">Sales</h2>
                </div>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() =>
                        toast("Customers functionality triggered.")
                      }
                      className="text-[#FFFFFF]-600 hover:underline hover:text-blue-600"
                    >
                      + Customers
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => toast("Invoices functionality triggered.")}
                      className="text-[#FFFFFF]-600 hover:underline hover:text-blue-600"
                    >
                      + Invoices
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => toast("Payments functionality triggered.")}
                      className="text-[#FFFFFF]-600 hover:underline hover:text-blue-600"
                    >
                      + Payments
                    </button>
                  </li>
                </ul>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-6 w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:ring-2 focus:ring-red-400 focus:outline-none"
            >
              Close
            </button>
          </Dialog.Panel>
        </Dialog>
      )}
    </div>
  );
}
