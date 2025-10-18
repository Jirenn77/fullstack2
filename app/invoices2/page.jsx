"use client";

import React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Menu } from "@headlessui/react";
import DatePicker from "react-datepicker";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "react-datepicker/dist/react-datepicker.css";
import {
  Home,
  Users,
  FileText,
  CreditCard,
  Calendar,
  Layers,
  ShoppingCart,
  Settings,
  LogOut,
  Plus,
  User,
  UserPlus,
  Tag,
  Factory,
  ClipboardList,
  Folder,
  ChevronDown,
  BarChart3,
  BarChartIcon,
  ChevronRight,
  Search,
  BarChart2,
  ArrowLeft,
  Eye,
  Printer,
  X,
  ChevronLeft,
  Leaf,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { getWeek } from "date-fns";
import dynamic from "next/dynamic";

const RechartsBarChart = dynamic(
  () => import("recharts").then((mod) => mod.BarChart),
  { ssr: false }
);
const RechartsBar = dynamic(() => import("recharts").then((mod) => mod.Bar), {
  ssr: false,
});
const RechartsXAxis = dynamic(
  () => import("recharts").then((mod) => mod.XAxis),
  { ssr: false }
);
const RechartsYAxis = dynamic(
  () => import("recharts").then((mod) => mod.YAxis),
  { ssr: false }
);
const RechartsCartesianGrid = dynamic(
  () => import("recharts").then((mod) => mod.CartesianGrid),
  { ssr: false }
);
const RechartsTooltip = dynamic(
  () => import("recharts").then((mod) => mod.Tooltip),
  { ssr: false }
);
const RechartsLegend = dynamic(
  () => import("recharts").then((mod) => mod.Legend),
  { ssr: false }
);
const RechartsResponsiveContainer = dynamic(
  () => import("recharts").then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);

export default function InvoicesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [activeView, setActiveView] = useState("invoices");
  const [currentPage, setCurrentPage] = useState(1);
  const [invoicesPerPage] = useState(10);

  useEffect(() => {
    // Fetch current user data (including branch info)
    // const fetchCurrentUser = async () => {
    //   try {
    //     const response = await fetch(
    //       "http://localhost/API/branches.php?action=user",
    //       {
    //         headers: { "Content-Type": "application/json" },
    //         credentials: "include", // important if you use session
    //       }
    //     );

    //     const userData = await response.json();
    //     setCurrentUser(userData);

    //     // ✅ Update this to branch_id or branch_name based on what you use
    //     if (userData.branch_name) {
    //       setSelectedBranch(userData.branch_name); // or branch_id if you're filtering by ID
    //     }
    //   } catch (error) {
    //     console.error("Failed to fetch user data:", error);
    //   }
    // };

    // Fetch branches data
    const fetchBranches = async () => {
      try {
        const response = await fetch(
          "http://localhost/API/branches.php?action=branches"
        );
        const branchesData = await response.json();
        setBranches(branchesData);
      } catch (error) {
        console.error("Failed to fetch branches:", error);
      }
    };

    // fetchCurrentUser();
    fetchBranches();
  }, []);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(
          `http://localhost/API/getInvoices.php?branch=${selectedBranch}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }

        const result = await response.json();
        setInvoices(result);
        setFilteredInvoices(result);
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
        setError(error.message);
        toast.error(`Failed to load invoices: ${error.message}`);

        // Fallback to mock data if API fails (remove in production)
        const mockData = [
          {
            id: 1,
            name: "Sample Customer",
            invoiceNumber: "000001",
            dateIssued: "Feb 26, 2025",
            totalAmount: "₱150.00",
            paymentStatus: "Paid",
            services: [{ name: "Sample Service", price: "₱150.00" }],
            branch: "Main",
            handledBy: "Admin",
          },
        ];
        setInvoices(mockData);
        setFilteredInvoices(mockData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, [selectedBranch]);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch("http://localhost/API/getInvoices.php", {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }

        const result = await response.json();

        // No need to transform data since API already provides the correct format
        setInvoices(result);
        setFilteredInvoices(result);
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
        setError(error.message);
        toast.error(`Failed to load invoices: ${error.message}`);

        // Fallback to mock data if API fails (remove in production)
        const mockData = [
          {
            id: 1,
            name: "Sample Customer",
            invoiceNumber: "000001",
            dateIssued: "Feb 26, 2025",
            totalAmount: "₱150.00",
            paymentStatus: "Paid",
            services: [{ name: "Sample Service", price: "₱150.00" }],
          },
        ];
        setInvoices(mockData);
        setFilteredInvoices(mockData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const handlePrintInvoice = (invoice) => {
      const doc = new jsPDF();
  
      // Peso formatting
      const formatPeso = (value) => {
        const number = Number(String(value).replace(/[^0-9.-]+/g, ""));
        return "PHP " + number.toLocaleString("en-PH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      };
  
      // Header - Clinic Info
      doc.setFontSize(18);
      doc.text("Lizly Skin Care Clinic", 105, 15, { align: "center" });
      doc.setFontSize(10);
      doc.text("Condoy Building Room 201, Pabayo Gomez Street, CDO", 105, 21, {
        align: "center",
      });
      doc.text("Phone: (09) 123-4567 | Email: lizlyskincare@gmail.com", 105, 26, {
        align: "center",
      });
  
      // Invoice Info
      doc.setFontSize(14);
      doc.text(`Invoice #${invoice.invoiceNumber}`, 14, 45);
      doc.setFontSize(11);
  
      const issueDate = new Date(invoice.dateIssued);
      doc.text(`Issued: ${issueDate.toLocaleString()}`, 14, 52);
  
      // Customer Only
      doc.text(`Customer: ${invoice.name}`, 14, 62);
  
      // Services Table
      autoTable(doc, {
        startY: 75,
        head: [["Service", "Price"]],
        body: invoice.services.map((service) => [
          service.name,
          formatPeso(service.price),
        ]),
        theme: "striped",
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        columnStyles: { 0: { halign: "left" }, 1: { halign: "right" } },
        bodyStyles: { fontSize: 11 },
      });
  
      // Total Amount Box
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(14, finalY, 180, 12, 3, 3, "F");
  
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.text("Total Amount", 20, finalY + 8);
      doc.text(formatPeso(invoice.totalAmount), 190, finalY + 8, {
        align: "right",
      });
  
      // Footer
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      doc.text("Thank you for your business!", 105, pageHeight - 15, {
        align: "center",
      });
  
      // Open invoice
      doc.output("dataurlnewwindow");
    };

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredInvoices(invoices);
    } else {
      const filtered = invoices.filter(
        (invoice) =>
          invoice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          invoice.invoiceNumber.toString().includes(searchQuery.toLowerCase())
      );
      setFilteredInvoices(filtered);
    }
  }, [searchQuery, invoices]);

  const prepareChartData = () => {
    const now = new Date();
    const currentYear = now.getFullYear();

    // Group invoices by month
    const monthlyData = invoices.reduce((acc, invoice) => {
      if (selectedBranch !== "all" && invoice.branch !== selectedBranch) {
        return acc;
      }

      const invoiceDate = new Date(invoice.dateIssued);
      const month = invoiceDate.getMonth();
      const year = invoiceDate.getFullYear();

      // Only include current year's data
      if (year !== currentYear) return acc;

      const monthName = new Date(2000, month, 1).toLocaleString("default", {
        month: "short",
      });
      const amount =
        typeof invoice.totalAmount === "string"
          ? parseFloat(invoice.totalAmount.replace(/[₱,]/g, ""))
          : invoice.totalAmount;

      if (!acc[month]) {
        acc[month] = {
          name: monthName,
          sales: 0,
          count: 0,
        };
      }

      acc[month].sales += amount || 0;
      acc[month].count += 1;

      return acc;
    }, {});

    // Fill in all months with data (even if no sales)
    const completeData = Array.from({ length: 12 }, (_, i) => {
      const monthName = new Date(2000, i, 1).toLocaleString("default", {
        month: "short",
      });
      return monthlyData[i] || { name: monthName, sales: 0, count: 0 };
    });

    return completeData;
  };

  const chartData = prepareChartData();

  const handlePaymentStatusUpdate = async (invoiceId, newStatus) => {
    try {
      // Optimistic UI update
      const updatedInvoices = invoices.map((invoice) =>
        invoice.id === invoiceId
          ? { ...invoice, paymentStatus: newStatus }
          : invoice
      );

      setInvoices(updatedInvoices);
      setFilteredInvoices(updatedInvoices);

      if (selectedInvoice?.id === invoiceId) {
        setSelectedInvoice({ ...selectedInvoice, paymentStatus: newStatus });
      }

      // API call to update status
      const response = await fetch(
        "http://localhost/API/updateInvoiceStatus.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            invoiceId,
            status: newStatus,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update status on server");
      }

      toast.success(`Invoice status updated to ${newStatus}`);
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update invoice status");

      // Revert changes if update fails
      const originalInvoices = [...invoices];
      setInvoices(originalInvoices);
      setFilteredInvoices(originalInvoices);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/";
  };

  const filterInvoicesByCustomDate = (date) => {
    setSelectedDate(date);

    if (!date) {
      setFilteredInvoices(invoices); // Reset
      return;
    }

    const filtered = invoices.filter((invoice) => {
      const invoiceDate = new Date(invoice.dateIssued);
      return invoiceDate.toDateString() === new Date(date).toDateString();
    });

    setFilteredInvoices(filtered);
    toast.success(`Showing invoices on ${date.toDateString()}`);
  };

  const filterInvoicesByPeriod = (period) => {
    const now = new Date();
    let filtered = [...invoices]; // Start with a copy of all invoices

    if (period === "week") {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday of this week
      filtered = invoices.filter((invoice) => {
        const invoiceDate = new Date(invoice.dateIssued);
        return invoiceDate >= startOfWeek;
      });
    } else if (period === "month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      filtered = invoices.filter((invoice) => {
        const invoiceDate = new Date(invoice.dateIssued);
        return invoiceDate >= startOfMonth;
      });
    } else if (period === "year") {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      filtered = invoices.filter((invoice) => {
        const invoiceDate = new Date(invoice.dateIssued);
        return invoiceDate >= startOfYear;
      });
    }

    setFilteredInvoices(filtered);
    toast.success(`Showing invoices from this ${period}`);
  };

  // Calculate sales report data
  const calculateSalesReport = () => {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    let dailySales = 0;
    let weeklySales = 0;
    let monthlySales = 0;
    let yearlySales = 0;
    let totalSales = 0;
    let paidInvoices = 0;
    let pendingInvoices = 0;

    invoices.forEach((invoice) => {
      // Skip if invoice doesn't belong to selected branch (unless 'all' is selected)
      if (selectedBranch !== "all" && invoice.branch !== selectedBranch) {
        return;
      }

      const invoiceDate = new Date(invoice.dateIssued);
      const amount =
        typeof invoice.totalAmount === "string"
          ? parseFloat(invoice.totalAmount.replace(/[₱,]/g, ""))
          : invoice.totalAmount;

      totalSales += amount || 0;

      if (invoice.paymentStatus === "Paid") {
        paidInvoices++;
      } else {
        pendingInvoices++;
      }

      if (invoiceDate >= startOfDay) {
        dailySales += amount || 0;
      }
      if (invoiceDate >= startOfWeek) {
        weeklySales += amount || 0;
      }
      if (invoiceDate >= startOfMonth) {
        monthlySales += amount || 0;
      }
      if (invoiceDate >= startOfYear) {
        yearlySales += amount || 0;
      }
    });

    return {
      dailySales,
      weeklySales,
      monthlySales,
      yearlySales,
      totalSales,
      paidInvoices,
      pendingInvoices,
      totalInvoices: invoices.filter(
        (invoice) =>
          selectedBranch === "all" || invoice.branch === selectedBranch
      ).length,
    };
  };

  const salesReport = calculateSalesReport();

  // Group invoices by customer name (or customerId if that's better)
  const groupedInvoices = filteredInvoices.reduce((acc, invoice) => {
    if (!acc[invoice.name]) {
      acc[invoice.name] = invoice;
    } else {
      // Optionally: update if newer invoice
      if (
        new Date(invoice.dateIssued) > new Date(acc[invoice.name].dateIssued)
      ) {
        acc[invoice.name] = invoice;
      }
    }
    return acc;
  }, {});

  const selectedCustomerName = selectedInvoice?.name;

  const recentServicesForCustomer = filteredInvoices
    .filter((inv) => inv.name === selectedCustomerName)
    .flatMap((inv) =>
      inv.services.map((service) => ({
        ...service,
        invoiceDate: inv.dateIssued,
        invoiceId: inv.invoiceNumber,
        employee: service.employee || "Staff", // fallback
      }))
    )
    .sort((a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate));

  const subtotal = recentServicesForCustomer.reduce((sum, service) => {
    const price =
      typeof service.price === "string"
        ? parseFloat(service.price.replace(/[₱,]/g, ""))
        : service.price;
    return sum + (price || 0);
  }, 0);

  const uniqueInvoices = Object.values(groupedInvoices);

  // Group and sum all invoices by customer name
  const invoiceTotalsByCustomer = filteredInvoices.reduce((acc, invoice) => {
    const key = invoice.name;
    const amount =
      typeof invoice.totalAmount === "string"
        ? parseFloat(invoice.totalAmount.replace(/[₱,]/g, ""))
        : invoice.totalAmount;

    if (!acc[key]) acc[key] = 0;
    acc[key] += amount || 0;
    return acc;
  }, {});

  function formatCurrency(value) {
    const num =
      typeof value === "string"
        ? parseFloat(value.replace(/[₱,]/g, ""))
        : value;
    if (isNaN(num)) return "₱0.00";
    return `₱${num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
  }

  const indexOfLastInvoice = currentPage * invoicesPerPage;
  const indexOfFirstInvoice = indexOfLastInvoice - invoicesPerPage;
  const currentInvoices = filteredInvoices.slice(
    indexOfFirstInvoice,
    indexOfLastInvoice
  );

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calculate total pages
  const totalPages = Math.ceil(filteredInvoices.length / invoicesPerPage);

  // Add this function to your component or utility functions
  function getWeekNumber(date) {
    // Copy date so don't modify original
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    // Get first day of year
    const yearStart = new Date(d.getFullYear(), 0, 1);
    // Calculate full weeks to nearest Thursday
    const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    // Return array of year and week number
    return weekNo;
  }
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredInvoices]);

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-800">
      <Toaster position="top-right" richColors />
      {/* Header */}
      <header className="flex items-center justify-between bg-emerald-700 text-white p-4 w-full h-16 pl-64 relative">
        <div className="flex items-center space-x-4">
          {/* Space for potential left-aligned elements */}
        </div>

        <div className="flex items-center space-x-4 flex-grow justify-center">
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
        </div>

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
                  {router.pathname === "/home2" && (
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
                            href: "/servicess2",
                            label: "All Services",
                            icon: <Layers size={16} />,
                          },
                          {
                            href: "/membership2",
                            label: "Memberships",
                            icon: <UserPlus size={16} />,
                            badge: 3,
                          },
                          {
                            href: "/items2",
                            label: "Beauty Deals",
                            icon: <Tag size={16} />,
                            badge: "New",
                          },
                          {
                            href: "/serviceorder2",
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
                            href: "/customers2",
                            label: "Customers",
                            icon: <Users size={16} />,
                          },
                          {
                            href: "/invoices2",
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

        <main className="flex-1 p-6 bg-gray-50 ml-64">
          {/* Sales Report View */}
          {activeView === "sales" && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    Sales Dashboard
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Overview of your clinic's sales performance
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-end gap-4 w-full md:w-auto">
                  <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                    Handled by:{" "}
                    <span className="font-medium text-gray-800">
                      {currentUser?.name || "User"}
                    </span>
                  </div>

                  <div className="relative w-full sm:w-48">
                    <select
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    >
                      <option value="all">All Branches</option>
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sales Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {/* Today's Sales */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">
                        Today's Sales
                      </p>
                      <p className="text-2xl font-bold text-gray-800 mt-2">
                        {formatCurrency(salesReport.dailySales)}
                      </p>
                      <p className="text-xs text-blue-500 mt-2">
                        {new Date().toLocaleDateString("en-US", {
                          weekday: "long",
                        })}
                      </p>
                    </div>
                    <div className="bg-blue-200/50 p-2 rounded-lg">
                      <Calendar size={20} className="text-blue-600" />
                    </div>
                  </div>
                </div>

                {/* Weekly Sales */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-200 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-green-600 font-medium">
                        This Week
                      </p>
                      <p className="text-2xl font-bold text-gray-800 mt-2">
                        {formatCurrency(salesReport.weeklySales)}
                      </p>
                      <p className="text-xs text-green-500 mt-2">
                        Week {getWeekNumber(new Date())}
                      </p>
                    </div>
                    <div className="bg-green-200/50 p-2 rounded-lg">
                      <Calendar size={20} className="text-green-600" />
                    </div>
                  </div>
                </div>

                {/* Monthly Sales */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-200 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-purple-600 font-medium">
                        This Month
                      </p>
                      <p className="text-2xl font-bold text-gray-800 mt-2">
                        {formatCurrency(salesReport.monthlySales)}
                      </p>
                      <p className="text-xs text-purple-500 mt-2">
                        {new Date().toLocaleDateString("en-US", {
                          month: "long",
                        })}
                      </p>
                    </div>
                    <div className="bg-purple-200/50 p-2 rounded-lg">
                      <Calendar size={20} className="text-purple-600" />
                    </div>
                  </div>
                </div>

                {/* Yearly Sales */}
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-5 rounded-xl border border-amber-200 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-amber-600 font-medium">
                        This Year
                      </p>
                      <p className="text-2xl font-bold text-gray-800 mt-2">
                        {formatCurrency(salesReport.yearlySales)}
                      </p>
                      <p className="text-xs text-amber-500 mt-2">
                        {new Date().getFullYear()}
                      </p>
                    </div>
                    <div className="bg-amber-200/50 p-2 rounded-lg">
                      <Calendar size={20} className="text-amber-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Monthly Sales Chart */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <BarChart2 className="mr-2 text-emerald-600" size={18} />
                      Monthly Sales Breakdown
                    </h3>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: "#6b7280" }}
                          axisLine={{ stroke: "#d1d5db" }}
                        />
                        <YAxis
                          tickFormatter={(value) =>
                            `₱${value.toLocaleString()}`
                          }
                          tick={{ fill: "#6b7280" }}
                          axisLine={{ stroke: "#d1d5db" }}
                        />
                        <Tooltip
                          formatter={(value) => [
                            `₱${value.toLocaleString()}`,
                            "Sales",
                          ]}
                          labelFormatter={(label) => `Month: ${label}`}
                          contentStyle={{
                            backgroundColor: "#ffffff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "0.5rem",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                        <Legend />
                        <Bar
                          dataKey="sales"
                          name="Sales Amount"
                          fill="#10b981"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Invoice Status */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <FileText className="mr-2 text-blue-600" size={18} />
                      Invoice Status
                    </h3>
                  </div>
                  <div className="h-64 flex flex-col">
                    <div className="flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              {
                                name: "Paid",
                                value: salesReport.paidInvoices,
                                color: "#10b981",
                              },
                              {
                                name: "Pending",
                                value: salesReport.pendingInvoices,
                                color: "#f59e0b",
                              },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) =>
                              `${name} ${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {[
                              {
                                name: "Paid",
                                value: salesReport.paidInvoices,
                                color: "#10b981",
                              },
                              {
                                name: "Pending",
                                value: salesReport.pendingInvoices,
                                color: "#f59e0b",
                              },
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value, name) => [
                              `${value} invoices`,
                              name,
                            ]}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 mt-2">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
                        <span className="text-xs text-gray-600">
                          Paid: {salesReport.paidInvoices}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-amber-400 mr-2"></div>
                        <span className="text-xs text-gray-600">
                          Pending: {salesReport.pendingInvoices}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
                  <p className="text-sm text-gray-600 font-medium">
                    Total Sales
                  </p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {formatCurrency(salesReport.totalSales)}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
                  <p className="text-sm text-gray-600 font-medium">
                    Total Invoices
                  </p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {salesReport.totalInvoices}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Quick Actions
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <motion.button
                      onClick={() => window.print()}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm flex items-center"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Printer className="mr-1" size={14} /> Print
                    </motion.button>
                    <motion.button
                      onClick={() => setActiveView("invoices")}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <FileText className="mr-1" size={14} /> Invoices
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Invoices View */}
                    {activeView === "invoices" && (
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                      >
                        {/* Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                          <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                              Invoices
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                              View and monitor all customer invoices
                            </p>
                          </div>
          
                          <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
                            <motion.button
                              onClick={() => filterInvoicesByPeriod("week")}
                              className="px-3 py-1 bg-orange-200 hover:bg-orange-300 text-orange-700 rounded-lg text-sm"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              This Week
                            </motion.button>
                            <motion.button
                              onClick={() => filterInvoicesByPeriod("month")}
                              className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              This Month
                            </motion.button>
                            <motion.button
                              onClick={() => filterInvoicesByPeriod("year")}
                              className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              This Year
                            </motion.button>
                            <div className="relative">
                              <DatePicker
                                selected={selectedDate}
                                onChange={(date) => filterInvoicesByCustomDate(date)}
                                placeholderText="Select date"
                                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                dateFormat="MMM d, yyyy"
                              />
                              <Calendar
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                size={16}
                              />
                            </div>
                          </div>
                        </div>
          
                        {/* Back to Sales button */}
                        <div className="mb-4">
                        </div>
          
                        {isLoading ? (
                          <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
                          </div>
                        ) : error ? (
                          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                            <div className="flex items-center">
                              <AlertCircle className="text-red-500 mr-2" size={18} />
                              <h3 className="text-red-800 font-medium">
                                Error Loading Invoices
                              </h3>
                            </div>
                            <p className="text-red-700 text-sm mt-1">{error}</p>
                            <button
                              onClick={() => window.location.reload()}
                              className="mt-3 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-sm"
                            >
                              Try Again
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col lg:flex-row gap-6">
                            {/* Invoice Table */}
                            <div className={`${selectedInvoice ? "lg:w-2/3" : "w-full"}`}>
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Invoice #
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                      </th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {currentInvoices.length > 0 ? (
                                      currentInvoices.map((invoice) => (
                                        <motion.tr
                                          key={`invoice-${invoice.invoiceNumber}`}
                                          className={`hover:bg-gray-50 ${selectedInvoice?.invoiceNumber ===
                                              invoice.invoiceNumber
                                              ? "bg-emerald-50"
                                              : ""
                                            }`}
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          transition={{ duration: 0.2 }}
                                        >
                                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {invoice.invoiceNumber}
                                          </td>
                                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                            {invoice.name}
                                          </td>
                                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                            {invoice.dateIssued}
                                          </td>
                                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                            {invoice.totalAmount}
                                          </td>
                                          <td className="px-4 py-3 whitespace-nowrap">
                                            <span
                                              className={`px-2 py-1 text-xs rounded-full ${invoice.paymentStatus === "Paid"
                                                  ? "bg-green-100 text-green-800"
                                                  : "bg-yellow-100 text-yellow-800"
                                                }`}
                                            >
                                              {invoice.paymentStatus}
                                            </span>
                                          </td>
                                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex space-x-2">
                                              <motion.button
                                                onClick={() =>
                                                  setSelectedInvoice(invoice)
                                                }
                                                className="text-blue-600 hover:text-blue-800"
                                                whileHover={{ scale: 1.2 }}
                                                whileTap={{ scale: 0.9 }}
                                                title="View Details"
                                              >
                                                <Eye size={16} />
                                              </motion.button>
                                              <motion.button
                                                onClick={() =>
                                                  handlePrintInvoice(invoice)
                                                }
                                                className="text-gray-600 hover:text-gray-800"
                                                whileHover={{ scale: 1.2 }}
                                                whileTap={{ scale: 0.9 }}
                                                title="Print"
                                              >
                                                <Printer size={16} />
                                              </motion.button>
                                            </div>
                                          </td>
                                        </motion.tr>
                                      ))
                                    ) : (
                                      <tr>
                                        <td
                                          colSpan="6"
                                          className="px-4 py-6 text-center text-gray-500"
                                        >
                                          <div className="flex flex-col items-center justify-center">
                                            <FileText className="w-12 h-12 text-gray-300 mb-4" />
                                            <p>No invoices found</p>
                                            <p className="text-sm mt-1">
                                              Try adjusting your filters
                                            </p>
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
          
                              {/* Pagination Controls - Improved Version */}
                              {filteredInvoices.length > invoicesPerPage && (
                                <div className="flex items-center justify-between mt-4 px-4 py-3 bg-gray-50 border-t border-gray-200 sm:px-6">
                                  <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    {/* Showing X-Y of Z results */}
                                    <div className="text-sm text-gray-700">
                                      <p>
                                        Showing{" "}
                                        <span className="font-medium">
                                          {indexOfFirstInvoice + 1}
                                        </span>{" "}
                                        to{" "}
                                        <span className="font-medium">
                                          {Math.min(
                                            indexOfLastInvoice,
                                            filteredInvoices.length
                                          )}
                                        </span>{" "}
                                        of{" "}
                                        <span className="font-medium">
                                          {filteredInvoices.length}
                                        </span>{" "}
                                        results
                                      </p>
                                    </div>
          
                                    {/* Page Navigation */}
                                    <nav
                                      className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                                      aria-label="Pagination"
                                    >
                                      {/* Previous Button */}
                                      <button
                                        onClick={() =>
                                          paginate(Math.max(1, currentPage - 1))
                                        }
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed"
                                        aria-label="Previous page"
                                      >
                                        <span className="sr-only">Previous</span>
                                        <ChevronLeft
                                          className="h-5 w-5"
                                          aria-hidden="true"
                                        />
                                      </button>
          
                                      {/* Page Numbers - Optimized to not show all pages when too many */}
                                      {(() => {
                                        const maxVisiblePages = 5; // Show maximum 5 page buttons
                                        let startPage, endPage;
          
                                        if (totalPages <= maxVisiblePages) {
                                          startPage = 1;
                                          endPage = totalPages;
                                        } else {
                                          const maxPagesBeforeCurrent = Math.floor(
                                            maxVisiblePages / 2
                                          );
                                          const maxPagesAfterCurrent =
                                            Math.ceil(maxVisiblePages / 2) - 1;
          
                                          if (currentPage <= maxPagesBeforeCurrent) {
                                            startPage = 1;
                                            endPage = maxVisiblePages;
                                          } else if (
                                            currentPage + maxPagesAfterCurrent >=
                                            totalPages
                                          ) {
                                            startPage = totalPages - maxVisiblePages + 1;
                                            endPage = totalPages;
                                          } else {
                                            startPage =
                                              currentPage - maxPagesBeforeCurrent;
                                            endPage = currentPage + maxPagesAfterCurrent;
                                          }
                                        }
          
                                        return (
                                          <>
                                            {startPage > 1 && (
                                              <>
                                                <button
                                                  onClick={() => paginate(1)}
                                                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${1 === currentPage
                                                      ? "z-10 bg-emerald-50 border-emerald-500 text-emerald-600"
                                                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                                    }`}
                                                  key="page-1"
                                                >
                                                  1
                                                </button>
                                                {startPage > 2 && (
                                                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                                    ...
                                                  </span>
                                                )}
                                              </>
                                            )}
          
                                            {Array.from({
                                              length: endPage - startPage + 1,
                                            }).map((_, idx) => {
                                              const pageNumber = startPage + idx;
                                              return (
                                                <button
                                                  key={`page-${pageNumber}`} // Make sure this is unique
                                                  onClick={() => paginate(pageNumber)}
                                                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${pageNumber === currentPage
                                                      ? "z-10 bg-emerald-50 border-emerald-500 text-emerald-600"
                                                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                                    }`}
                                                  aria-current={
                                                    pageNumber === currentPage
                                                      ? "page"
                                                      : undefined
                                                  }
                                                >
                                                  {pageNumber}
                                                </button>
                                              );
                                            })}
          
                                            {endPage < totalPages && (
                                              <>
                                                {endPage < totalPages - 1 && (
                                                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                                    ...
                                                  </span>
                                                )}
                                                <button
                                                  onClick={() => paginate(totalPages)}
                                                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${totalPages === currentPage
                                                      ? "z-10 bg-emerald-50 border-emerald-500 text-emerald-600"
                                                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                                    }`}
                                                  key={`page-${totalPages}`}
                                                >
                                                  {totalPages}
                                                </button>
                                              </>
                                            )}
                                          </>
                                        );
                                      })()}
          
                                      {/* Next Button */}
                                      <button
                                        onClick={() =>
                                          paginate(Math.min(totalPages, currentPage + 1))
                                        }
                                        disabled={currentPage === totalPages}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20 disabled:opacity-50 disabled:cursor-not-allowed"
                                        aria-label="Next page"
                                      >
                                        <span className="sr-only">Next</span>
                                        <ChevronRight
                                          className="h-5 w-5"
                                          aria-hidden="true"
                                        />
                                      </button>
                                    </nav>
                                  </div>
                                </div>
                              )}
                            </div>

                  {/* Invoice Detail Panel */}
                  <AnimatePresence>
                    {selectedInvoice && (
                      <motion.div
                        key={`detail-${selectedInvoice.invoiceNumber}`}
                        className="lg:w-1/3"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sticky top-4">
                          <div className="flex justify-between items-center mb-6">
                            <div>
                              <h2 className="text-xl font-bold text-gray-800">
                                Invoice #{selectedInvoice.invoiceNumber}
                              </h2>
                              <p className="text-sm text-gray-500">
                                Issued:{" "}
                                {new Date(
                                  selectedInvoice.dateIssued
                                ).toLocaleString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                })}
                              </p>
                            </div>
                            <button
                              onClick={() => setSelectedInvoice(null)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <X size={20} />
                            </button>
                          </div>

                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">
                                  Customer
                                </h3>
                                <p className="text-gray-900 font-medium">
                                  {selectedInvoice.name}
                                </p>
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">
                                  Status
                                </h3>
                                <span
                                  className={`px-3 py-1 text-xs rounded-full font-medium ${
                                    selectedInvoice.paymentStatus === "Paid"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {selectedInvoice.paymentStatus}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">
                                  Branch
                                </h3>
                                <p className="text-gray-900">
                                  {selectedInvoice.branch || "Main"}
                                </p>
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">
                                  Handled By
                                </h3>
                                <p className="text-gray-900">
                                  {selectedInvoice.handledBy || "Staff"}
                                </p>
                              </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                              <h3 className="text-sm font-medium text-gray-500 mb-3">
                                Services
                              </h3>
                              <div className="space-y-3">
                                {selectedInvoice.services.map(
                                  (service, index) => (
                                    <div
                                      key={`service-${selectedInvoice.invoiceNumber}-${index}`}
                                      className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                                    >
                                      <div>
                                        <p className="text-gray-800 font-medium">
                                          {service.name}
                                        </p>
                                      </div>
                                      <p className="text-gray-900 font-medium">
                                        {service.price}
                                      </p>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                              <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-800">
                                  Total Amount
                                </h3>
                                <p className="text-xl font-bold text-emerald-600">
                                  {selectedInvoice.totalAmount}
                                </p>
                              </div>
                            </div>

                            <div className="flex space-x-3 pt-2">
                              <motion.button
                                onClick={() =>
                                  handlePrintInvoice(selectedInvoice)
                                }
                                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium flex items-center justify-center"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Printer className="mr-2" size={16} />
                                Print Invoice
                              </motion.button>
                              {selectedInvoice.paymentStatus === "Pending" && (
                                <motion.button
                                  onClick={() =>
                                    handlePaymentStatusUpdate(
                                      selectedInvoice.invoiceNumber,
                                      "Paid"
                                    )
                                  }
                                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium flex items-center justify-center"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <Check className="mr-2" size={16} />
                                  Mark as Paid
                                </motion.button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
