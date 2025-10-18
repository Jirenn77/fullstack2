"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Toaster, toast } from "sonner";
import { User, Settings, LogOut, Home, X, BarChart3 } from "lucide-react";
import { Menu } from "@headlessui/react";
import {
  Users,
  FileText,
  CreditCard,
  Package,
  Layers,
  ShoppingCart,
  UserPlus,
  Plus,
  Eye,
  RefreshCw,
  Search,
  ChevronsLeft,
  ChevronLeft,
  ChevronsRight,
  ChevronRight,
  ChevronDown,
  Leaf,
  BarChart2,
} from "lucide-react";
import { ClipboardList, Factory, ShoppingBag, Folder, Tag } from "lucide-react";
import { BarChart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MembershipExpirationReport() {
  const router = useRouter();
  const pathname = usePathname();
  const [expiringMemberships, setExpiringMemberships] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerMemberships, setCustomerMemberships] = useState([]);
  const [daysThreshold, setDaysThreshold] = useState(30);
  const [customerFilter, setCustomerFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [renewModalData, setRenewModalData] = useState(null);
  const [selectedType, setSelectedType] = useState("basic");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [activeTab, setActiveTab] = useState("memberships");
  const [membershipLogs, setMembershipLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logFilter, setLogFilter] = useState("all");
  const [currentUser, setCurrentUser] = useState(null);
  const [renewMembership, setRenewMembership] = useState({
    type: "",
    price: "",
    consumable_amount: "",
    valid_until: "",
    no_expiration: false,
  });

  // Memberships Pagination
  const [membershipPage, setMembershipPage] = useState(1);
  const membershipsPerPage = 10;
  const membershipTotalPages = Math.ceil(
    customerMemberships.length / membershipsPerPage
  );

  // Function to generate pagination range
  const getPaginationRange = (currentPage, totalPages) => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  // Logs Pagination
  const [logPage, setLogPage] = useState(1);
  const logsPerPage = 10;
  const logTotalPages = Math.ceil(membershipLogs.length / logsPerPage);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const slideUp = {
    hidden: { y: 50, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3 } },
    exit: { y: 50, opacity: 0, transition: { duration: 0.2 } },
  };

  useEffect(() => {
  const userData = localStorage.getItem("user");
  if (userData) {
    try {
      const user = JSON.parse(userData);
      setCurrentUser(user);
      console.log("Current user loaded:", user);
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }
}, []);

  useEffect(() => {
    fetchExpiringMemberships();
    fetchCustomers(customerFilter);
    fetchCustomerMemberships();
  }, [customerFilter, daysThreshold]);

  const membershipOptions = {
    basic: { coverage: 5000 },
    pro: { coverage: 10000 },
  };

  function calculateDaysRemaining(dateStr) {
    const today = new Date();
    const target = new Date(dateStr);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  const filteredCustomers = customers.filter((customer) => {
    const membership = customerMemberships.find(
      (m) => m.customer_id === customer.id
    );

    if (!membership) return false;

    const type = membership.type?.toLowerCase();
    const hasExpire = Boolean(membership.expire_date);
    const today = new Date();

    // Only calculate if expire_date exists
    const expireDate = hasExpire ? new Date(membership.expire_date) : null;
    const daysRemaining = hasExpire
      ? calculateDaysRemaining(membership.expire_date)
      : null;

    switch (customerFilter) {
      case "all":
        return true; // show all memberships
      case "active":
        // For promo, check if still valid; others are always active
        return type === "promo" ? hasExpire && expireDate >= today : true;
      case "expiring":
        // Only promos can be expiring
        return (
          type === "promo" &&
          hasExpire &&
          expireDate >= today &&
          daysRemaining <= daysThreshold
        );
      case "expired":
        // Only promos can expire
        return type === "promo" && hasExpire && expireDate < today;
      default:
        return true;
    }
  });

  // Fetch expiring memberships
  const fetchExpiringMemberships = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `http://localhost/API/members.php?expiring=${daysThreshold}`
      );
      const data = await res.json();
      setExpiringMemberships(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to load expiring memberships.");
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch customers with filter
  const fetchCustomers = async (filter = "all") => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `http://localhost/API/customers.php?filter=${filter}`
      );
      if (!response.ok) throw new Error("Failed to fetch customers");
      const data = await response.json();
      setCustomers(data);
      console.log("res ni customers", data);
    } catch (error) {
      toast.error("Failed to load customers.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch customer memberships
  const fetchCustomerMemberships = async () => {
    try {
      const response = await fetch("http://localhost/API/members.php");
      if (!response.ok) throw new Error("Failed to fetch customer memberships");
      const data = await response.json();
      setCustomerMemberships(data);
      console.log("res ni cus memberships", data);
    } catch (error) {
      toast.error("Failed to load customer memberships.");
      console.error(error);
    }
  };

  // Fetch detailed customer information
  const fetchCustomerDetails = async (customerId) => {
    setIsLoadingDetails(true);
    try {
      const [customerRes, membershipRes, logsRes] = await Promise.all([
        fetch(`http://localhost/API/customers.php?customerId=${customerId}`),
        fetch(`http://localhost/API/members.php?customer_id=${customerId}`),
        fetch(
          `http://localhost/API/membership_logs.php?customer_id=${customerId}`
        ),
      ]);

      const customerData = await customerRes.json();
      const membershipData = await membershipRes.json();
      const logsData = await logsRes.json();

      setSelectedCustomer({
        ...customerData,
        id: customerData.id,
        first_name:
          customerData.first_name || customerData.name?.split(" ")[0] || "",
        last_name:
          customerData.last_name || customerData.name?.split(" ")[1] || "",
        contact: customerData.contact || customerData.phone || "",
        email: customerData.email,
        address: customerData.address,
        birthday: customerData.birthday,
        customerId: customerData.customerId || customerData.id,
        membership: membershipData.membershipDetails
          ? membershipData.membershipDetails.type
          : "None",
        membershipDetails: membershipData.membershipDetails ?? null,
        membershipData: membershipData,
        membershipLogs: logsData,
        transactions: customerData.transactions || [],
        join_date: customerData.join_date,
      });
    } catch (error) {
      toast.error("Failed to load customer details.");
      console.error("Error fetching customer details:", error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleCustomerRowClick = async (customerId) => {
    await fetchCustomerDetails(customerId);
    setIsDetailsOpen(true);
  };

  // Example login function
  // const handleLogin = async () => {
  //   const response = await fetch("http://localhost/API/users.php", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ email, password }),
  //   });

  //   if (!response.ok) {
  //     toast.error("Invalid credentials");
  //     return;
  //   }

  //   const user = await response.json();

  //   // Save user in localStorage
  //   localStorage.setItem("user", JSON.stringify(user));

  //   toast.success(`Welcome ${user.name}!`);
  // };

  const handleRenew = async (
    customerId,
    membershipId,
    type,
    payment,
    renewMembership
  ) => {
    try {
      console.log("Renewing membership with:", {
        customerId,
        membershipId,
        type,
        payment,
        renewMembership,
      });

      const { price, consumable_amount, valid_until, no_expiration } =
        renewMembership;

      // Fetch the latest membership (like customer function)
      let currentMembership = null;
      try {
        const response = await fetch(
          `http://localhost/API/members.php?customer_id=${customerId}`
        );
        const memberships = await response.json();

        if (memberships && memberships.length > 0) {
          currentMembership = memberships.sort(
            (a, b) => new Date(b.date_registered) - new Date(a.date_registered)
          )[0];
        }
      } catch (fetchError) {
        console.warn("Could not fetch membership from API:", fetchError);
        // Fallback to local state
        const customerMembershipHistory = customerMemberships
          .filter((m) => m.customer_id === customerId)
          .sort(
            (a, b) =>
              new Date(b.date_registered).getTime() -
              new Date(a.date_registered).getTime()
          );

        currentMembership = customerMembershipHistory[0];
      }

      // If no current membership, create instead of renew (like customer function)
      if (!currentMembership) {
        const confirmCreate = window.confirm(
          "No existing membership found. Would you like to create a new membership instead of renewing?"
        );

        if (confirmCreate) {
          let coverage = 0;
          let price = 0;
          let expireDate = null;

          if (type === "basic") {
            coverage = 5000;
            price = 3000;
          } else if (type === "pro") {
            coverage = 10000;
            price = 6000;
          } else if (type === "promo") {
            coverage = parseFloat(consumable_amount || 0);
            price = parseFloat(price || 0);
          }

          if (!expireDate && type !== "promo") {
            const today = new Date();
            today.setMonth(today.getMonth() + (type === "pro" ? 2 : 1));
            expireDate = today.toISOString().split("T")[0];
          }

          const payload = {
            customer_id: customerId,
            action: "new member",
            type,
            coverage,
            price,
            expire_date: expireDate,
            payment_method: payment,
          };

          const response = await fetch("http://localhost/API/members.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          const data = await response.json();
          if (data.error) {
            toast.error(`❌ ${data.error}`);
            return;
          }

          setCustomerMemberships((prev) => [...prev, data]);
          toast.success("✅ New membership created successfully!");
          return;
        } else {
          return;
        }
      }

      // Determine coverage and expiry (updated logic)
      let coverage = 0;
      let expireDate = null;

      if (type === "basic") {
        coverage = 5000;
      } else if (type === "pro") {
        coverage = 10000;
      } else if (type === "promo") {
        coverage = parseFloat(consumable_amount || 0);
        if (!no_expiration && valid_until) {
          expireDate = valid_until;
        }
      }

      // For BASIC and PRO, set expiration date
      if (type !== "promo") {
        const today = new Date();
        today.setMonth(today.getMonth() + (type === "pro" ? 2 : 1));
        expireDate = today.toISOString().split("T")[0];
      }

      // Use the fetched membership ID instead of the passed one for safety
      const actualMembershipId = currentMembership.id;
      if (!actualMembershipId) {
        toast.error("❌ Cannot determine membership ID for renewal");
        console.error("Current membership object:", currentMembership);
        return;
      }

      const payload = {
        customer_id: customerId,
        membership_id: actualMembershipId,
        action: "renew",
        type,
        coverage, // new coverage to add
        price: parseFloat(price || 0),
        expire_date: expireDate,
        no_expiration: type !== "promo" ? 1 : no_expiration ? 1 : 0,
        payment_method: payment,
      };

      console.log("Sending payload to backend:", payload);

      const response = await fetch("http://localhost/API/members.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.error) {
        toast.error(`❌ ${data.error}`);
        return;
      }

      const newMembership = data;

      // Log renewal with updated action type
      await fetch("http://localhost/API/membership_logs.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: customerId,
          membership_id: newMembership.id,
          action: "renewed",
          type,
          amount: coverage,
          payment_method: payment,
          // branch_id: user.branch_id, // now coming from localStorage
          // performed_by: user.user_id, // now coming from localStorage
        }),
      });

      // Update UI state
      setCustomerMemberships((prev) => [...prev, newMembership]);

      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customerId ? { ...c, membershipUpdatedAt: Date.now() } : c
        )
      );

      fetchMembershipLogs(customerId);
      toast.success("✅ Membership renewed successfully!");
    } catch (error) {
      toast.error("❌ Failed to renew membership.");
      console.error("Renewal error:", error);
    }
  };

  const formatActionLabel = (raw) => {
  if (!raw) return "N/A";
  const action = raw.toString().toLowerCase().trim();
  
  if (["new member", "new", "create"].includes(action)) return "New member";
  if (["renewed", "renew", "renewal"].includes(action)) return "Renewed";
  
  // fallback: capitalize first letter
  return raw.charAt(0).toUpperCase() + raw.slice(1);
};


  const fetchMembershipLogs = async (filter = "all") => {
  setLogsLoading(true);
  try {
    const response = await fetch(
      `http://localhost/API/membership_logs.php?filter=${filter}`
    );
    if (!response.ok) throw new Error("Failed to fetch membership logs");
    const data = await response.json();
    console.log("res ni logs", data);
    
    // Debug: Check what fields are available
    if (data.length > 0) {
      console.log("Available fields in first log:", Object.keys(data[0]));
      console.log("First log data:", data[0]);
    }
    
    setMembershipLogs(Array.isArray(data) ? data : []);
    setLogPage(1);
  } catch (error) {
    toast.error("Failed to load membership logs.");
    console.error(error);
  } finally {
    setLogsLoading(false);
  }
};

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount) => {
    if (!amount) return "N/A";

    // If it's a string with commas, convert to number
    if (typeof amount === "string") {
      amount = Number(amount.replace(/,/g, ""));
    }

    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  useEffect(() => {
    fetchExpiringMemberships();
    fetchCustomers(customerFilter);
    fetchCustomerMemberships();
    fetchMembershipLogs(logFilter);
  }, [customerFilter, daysThreshold, logFilter]);

  const paginatedMemberships = customerMemberships.slice(
    (membershipPage - 1) * membershipsPerPage,
    membershipPage * membershipsPerPage
  );

  const paginatedLogs = membershipLogs.slice(
    (logPage - 1) * logsPerPage,
    logPage * logsPerPage
  );

  const handleMembershipPageChange = (page) => {
    if (page >= 1 && page <= membershipTotalPages) setMembershipPage(page);
  };

  const handleLogPageChange = (page) => {
    if (page >= 1 && page <= logTotalPages) setLogPage(page);
  };

  const handleLogout = () => {
    // Clear any authentication tokens or user data here
    toast.success("Logged out successfully!");
    // Redirect to login page or home page
    window.location.href = "/"; // Adjust the path as needed
  };

  const [searchQuery, setSearchQuery] = useState("");
  const handleSearch = () => {
    // Implement search functionality here
    toast.info(`Searching for: ${searchQuery}`);
    // You can filter the expiringMemberships based on the searchQuery
    // For now, just log it
    console.log("Search query:", searchQuery);
  };

  return (
    <div className="flex flex-col h-screen bg-[#77DD77] text-gray-900">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <header className="flex items-center justify-between bg-emerald-800 text-white p-4 w-full h-16 pl-64 relative">
        <div className="flex items-center space-x-4">
          {/* Space for potential left-aligned elements */}
        </div>

        <div className="flex items-center space-x-4 flex-grow justify-center">
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

        <main className="flex-1 p-6 bg-gray-50 text-gray-900 ml-64 overflow-x-hidden">
          <motion.div
            className="p-6 bg-white rounded-xl shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { duration: 0.5, ease: "easeOut" },
            }}
          >
            {/* Header with filters */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-2xl font-bold text-gray-800">
                  Membership Management
                </h2>
                <motion.p
                  className="text-sm text-gray-500 mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Manage customer memberships and renewals
                </motion.p>
              </motion.div>

              {activeTab === "memberships" && (
                <motion.div
                  className="flex flex-col sm:flex-row gap-3 w-full md:w-auto"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center bg-gray-50 rounded-lg p-1">
                    <label
                      htmlFor="customerFilter"
                      className="mr-2 text-sm font-medium text-gray-700 px-2"
                    >
                      Filter:
                    </label>
                    <select
                      id="customerFilter"
                      value={customerFilter}
                      onChange={(e) => setCustomerFilter(e.target.value)}
                      className="bg-white px-3 py-2 border-0 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="all">All Customers</option>
                      <option value="active">Active Memberships</option>
                      <option value="expiring">Expiring Soon</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>

                  {customerFilter === "expiring" && (
                    <motion.div
                      className="flex items-center bg-gray-50 rounded-lg p-1"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <label
                        htmlFor="daysThreshold"
                        className="mr-2 text-sm font-medium text-gray-700 px-2"
                      >
                        Within:
                      </label>
                      <select
                        id="daysThreshold"
                        value={daysThreshold}
                        onChange={(e) =>
                          setDaysThreshold(Number(e.target.value))
                        }
                        className="bg-white px-3 py-2 border-0 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="7">7 days</option>
                        <option value="14">14 days</option>
                        <option value="30">30 days</option>
                        <option value="60">60 days</option>
                        <option value="90">90 days</option>
                      </select>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Tabs */}
            <motion.div
              className="mb-6 border-b border-gray-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <nav className="-mb-px flex space-x-8">
                <motion.button
                  onClick={() => setActiveTab("memberships")}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "memberships"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Memberships
                </motion.button>
                <motion.button
                  onClick={() => setActiveTab("logs")}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "logs"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Membership Logs
                </motion.button>
              </nav>
            </motion.div>

            {/* Memberships Table */}
            {activeTab === "memberships" && (
              <>
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <motion.div
                      className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"
                      animate={{ rotate: 360 }}
                      transition={{
                        repeat: Infinity,
                        duration: 1,
                        ease: "linear",
                      }}
                    />
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="w-full overflow-hidden">
                      <table className="w-full table-auto divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {[
                              "Customer",
                              "Contact",
                              "Membership",
                              "Status",
                              "Expires",
                              "Days Left",
                              "Actions",
                            ].map((header, index) => (
                              <motion.th
                                key={header}
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 + index * 0.05 }}
                              >
                                {header}
                              </motion.th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredCustomers.length === 0 ? (
                            <motion.tr
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.8 }}
                            >
                              <td colSpan="7" className="px-6 py-8 text-center">
                                <motion.div
                                  className="flex flex-col items-center justify-center text-gray-400"
                                  initial={{ scale: 0.9 }}
                                  animate={{ scale: 1 }}
                                >
                                  <Users className="w-12 h-12 mb-4" />
                                  <p className="text-lg font-medium">
                                    No customers found
                                  </p>
                                  <p className="text-sm">
                                    Adjust your filters or add new customers
                                  </p>
                                </motion.div>
                              </td>
                            </motion.tr>
                          ) : (
                            paginatedMemberships.map((membership, index) => {
                              const customer =
                                customers.find(
                                  (c) => c.id === membership.customer_id
                                ) || membership;

                              return (
                                <motion.tr
                                  key={customer.id}
                                  className="hover:bg-gray-50"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{
                                    opacity: 1,
                                    y: 0,
                                    transition: { delay: index * 0.03 },
                                  }}
                                  whileHover={{
                                    backgroundColor: "#f8fafc",
                                    transition: { duration: 0.15 },
                                  }}
                                >
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">
                                          {customer.first_name ||
                                            customer.name?.split(" ")[0]}{" "}
                                          {customer.last_name ||
                                            customer.name?.split(" ")[1]}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {customer.email || customer.contact}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {customer.phone ||
                                      customer.contact ||
                                      "N/A"}
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex flex-col space-y-1">
                                      <span
                                        className={`px-2 py-1 text-xs rounded-full font-medium w-fit
                              ${membership.type?.toLowerCase() === "basic"
                                            ? "bg-blue-100 text-blue-800"
                                            : membership.type?.toLowerCase() === "pro"
                                              ? "bg-purple-100 text-purple-800"
                                              : membership.type
                                                ?.toLowerCase()
                                                .includes("promo")
                                                ? "bg-orange-100 text-orange-800"
                                                : "bg-gray-100 text-gray-800"
                                          }`}
                                      >
                                        {membership.type?.toUpperCase()}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {formatCurrency(membership.coverage)}{" "}
                                        coverage
                                      </span>
                                    </div>
                                  </td>

                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {membership.expire_date &&
                                      new Date(membership.expire_date) <
                                      new Date() ? (
                                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                        Expired
                                      </span>
                                    ) : (
                                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                        Active
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {membership.expire_date
                                      ? formatDate(membership.expire_date)
                                      : "No Expiration"}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {membership.expire_date ? (
                                      <div className="flex items-center">
                                        <span
                                          className={`font-medium ${calculateDaysRemaining(
                                            membership.expire_date
                                          ) <= 7
                                            ? "text-red-600"
                                            : calculateDaysRemaining(
                                              membership.expire_date
                                            ) <= 30
                                              ? "text-amber-600"
                                              : "text-emerald-600"
                                            }`}
                                        >
                                          {calculateDaysRemaining(
                                            membership.expire_date
                                          )}
                                        </span>
                                        <span className="text-gray-400 ml-1">
                                          days
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-gray-400">
                                        No Expiration
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-2">
                                      <motion.button
                                        onClick={() =>
                                          handleCustomerRowClick(customer.id)
                                        }
                                        className="text-gray-500 hover:text-emerald-600 p-1"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        title="View"
                                      >
                                        <Eye className="w-4 h-4" />
                                      </motion.button>
                                      {/* <motion.button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setRenewModalData({
                                            customerId: customer.id,
                                            membershipId: membership.id,
                                          });
                                        }}
                                        className="text-gray-500 hover:text-blue-600 p-1"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        title="Renew"
                                      >
                                        <RefreshCw className="w-4 h-4" />
                                      </motion.button> */}
                                    </div>
                                  </td>
                                </motion.tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                          <p className="text-sm text-gray-700">
                            Showing{" "}
                            <span className="font-medium">
                              {(membershipPage - 1) * membershipsPerPage + 1}
                            </span>{" "}
                            to{" "}
                            <span className="font-medium">
                              {Math.min(
                                membershipPage * membershipsPerPage,
                                customerMemberships.length
                              )}
                            </span>{" "}
                            of{" "}
                            <span className="font-medium">
                              {customerMemberships.length}
                            </span>{" "}
                            memberships
                          </p>
                          <nav
                            className="inline-flex shadow-sm rounded-md"
                            aria-label="Pagination"
                          >
                            <motion.button
                              onClick={() => handleMembershipPageChange(1)}
                              disabled={membershipPage === 1}
                              className="px-2 py-2 border border-gray-300 bg-white text-sm rounded-l-md text-gray-500 hover:bg-gray-50"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <ChevronsLeft className="h-5 w-5" />
                            </motion.button>
                            <motion.button
                              onClick={() =>
                                handleMembershipPageChange(membershipPage - 1)
                              }
                              disabled={membershipPage === 1}
                              className="px-2 py-2 border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <ChevronLeft className="h-5 w-5" />
                            </motion.button>

                            {Array.from(
                              { length: Math.min(5, membershipTotalPages) },
                              (_, i) => {
                                let pageNum =
                                  membershipTotalPages <= 5
                                    ? i + 1
                                    : membershipPage <= 3
                                      ? i + 1
                                      : membershipPage >=
                                        membershipTotalPages - 2
                                        ? membershipTotalPages - 4 + i
                                        : membershipPage - 2 + i;

                                return (
                                  <motion.button
                                    key={pageNum}
                                    onClick={() =>
                                      handleMembershipPageChange(pageNum)
                                    }
                                    className={`px-4 py-2 border text-sm font-medium ${membershipPage === pageNum
                                      ? "z-10 bg-emerald-50 border-emerald-500 text-emerald-600"
                                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                      }`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    {pageNum}
                                  </motion.button>
                                );
                              }
                            )}

                            <motion.button
                              onClick={() =>
                                handleMembershipPageChange(membershipPage + 1)
                              }
                              disabled={membershipPage === membershipTotalPages}
                              className="px-2 py-2 border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <ChevronRight className="h-5 w-5" />
                            </motion.button>
                            <motion.button
                              onClick={() =>
                                handleMembershipPageChange(membershipTotalPages)
                              }
                              disabled={membershipPage === membershipTotalPages}
                              className="px-2 py-2 border border-gray-300 bg-white text-sm rounded-r-md text-gray-500 hover:bg-gray-50"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <ChevronsRight className="h-5 w-5" />
                            </motion.button>
                          </nav>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </>
            )}

            {/* Logs Table */}
            {activeTab === "logs" && (
              <motion.div
                className="mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">
                    Membership Activity Log
                  </h3>
                  <motion.div
                    className="flex items-center bg-gray-50 rounded-lg p-1"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <label
                      htmlFor="logFilter"
                      className="mr-2 text-sm font-medium text-gray-700 px-2"
                    >
                      Filter:
                    </label>
                    <select
                      id="logFilter"
                      value={logFilter}
                      onChange={(e) => {
                        setLogFilter(e.target.value);
                        fetchMembershipLogs(e.target.value);
                      }}
                      className="bg-white px-3 py-2 border-0 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="all">All Activities</option>
                      <option value="new">New Memberships</option>
                      <option value="renewal">Renewals</option>
                    </select>
                  </motion.div>
                </div>

                {logsLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <motion.div
                      className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"
                      animate={{ rotate: 360 }}
                      transition={{
                        repeat: Infinity,
                        duration: 1,
                        ease: "linear",
                      }}
                    />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {[
                            "Date & Time",
                            "Customer",
                            "Branch",
                            "Handled By",
                            "Status",
                            "Type",
                            "Amount",
                            "Payment Method",
                          ].map((header, index) => (
                            <motion.th
                              key={header}
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.6 + index * 0.05 }}
                            >
                              {header}
                            </motion.th>
                          ))}
                        </tr>
                      </thead>

                      <tbody className="bg-white divide-y divide-gray-200">
                        {membershipLogs.length === 0 ? (
                          /* No logs UI unchanged */
                          <motion.tr
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                          >
                            <td colSpan="8" className="px-6 py-8 text-center">
                              {/* Empty state UI here */}
                            </td>
                          </motion.tr>
                        ) : (
                          paginatedLogs.map((log, index) => {
                            const customer = customers.find(
                              (c) => c.id === log.customer_id
                            );
                            return (
                              <motion.tr
                                key={log.id}
                                className="hover:bg-gray-50"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{
                                  opacity: 1,
                                  y: 0,
                                  transition: { delay: index * 0.03 },
                                }}
                                whileHover={{
                                  backgroundColor: "#f8fafc",
                                  transition: { duration: 0.15 },
                                }}
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatDateTime(log.timestamp)}
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {log.name || "N/A"}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {customer ? customer.email : "N/A"}
                                  </div>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {log.branch_name || "N/A"}
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {log.performed_by_name || "N/A"}
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap">
  <span
    className={`px-2 py-1 text-xs rounded-full capitalize ${
      log.action === "New member" || log.action === "create" || log.action === "new"
        ? "bg-blue-100 text-blue-800"
        : log.action === "renewed" || log.action === "renew"
        ? "bg-green-100 text-green-800"
        : "bg-purple-100 text-purple-800"
    }`}
  >
    {formatActionLabel(log.action)}
  </span>
</td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                  {log.type}
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatCurrency(log.amount)}
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                  {log.payment_method}
                                </td>
                              </motion.tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                    {/* Logs Pagination Controls */}
                    {membershipLogs.length > 0 && (
                      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                          <p className="text-sm text-gray-700">
                            Showing{" "}
                            <span className="font-medium">
                              {(logPage - 1) * logsPerPage + 1}
                            </span>{" "}
                            to{" "}
                            <span className="font-medium">
                              {Math.min(
                                logPage * logsPerPage,
                                membershipLogs.length
                              )}
                            </span>{" "}
                            of{" "}
                            <span className="font-medium">
                              {membershipLogs.length}
                            </span>{" "}
                            logs
                          </p>
                          <nav
                            className="inline-flex shadow-sm rounded-md"
                            aria-label="Pagination"
                          >
                            <motion.button
                              onClick={() => handleLogPageChange(1)}
                              disabled={logPage === 1}
                              className="px-2 py-2 border border-gray-300 bg-white text-sm rounded-l-md text-gray-500 hover:bg-gray-50"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <ChevronsLeft className="h-5 w-5" />
                            </motion.button>
                            <motion.button
                              onClick={() => handleLogPageChange(logPage - 1)}
                              disabled={logPage === 1}
                              className="px-2 py-2 border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <ChevronLeft className="h-5 w-5" />
                            </motion.button>

                            {Array.from(
                              { length: Math.min(5, logTotalPages) },
                              (_, i) => {
                                let pageNum =
                                  logTotalPages <= 5
                                    ? i + 1
                                    : logPage <= 3
                                      ? i + 1
                                      : logPage >= logTotalPages - 2
                                        ? logTotalPages - 4 + i
                                        : logPage - 2 + i;

                                return (
                                  <motion.button
                                    key={pageNum}
                                    onClick={() => handleLogPageChange(pageNum)}
                                    className={`px-4 py-2 border text-sm font-medium ${logPage === pageNum
                                      ? "z-10 bg-emerald-50 border-emerald-500 text-emerald-600"
                                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                      }`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    {pageNum}
                                  </motion.button>
                                );
                              }
                            )}

                            <motion.button
                              onClick={() => handleLogPageChange(logPage + 1)}
                              disabled={logPage === logTotalPages}
                              className="px-2 py-2 border border-gray-300 bg-white text-sm text-gray-500 hover:bg-gray-50"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <ChevronRight className="h-5 w-5" />
                            </motion.button>
                            <motion.button
                              onClick={() => handleLogPageChange(logTotalPages)}
                              disabled={logPage === logTotalPages}
                              className="px-2 py-2 border border-gray-300 bg-white text-sm rounded-r-md text-gray-500 hover:bg-gray-50"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <ChevronsRight className="h-5 w-5" />
                            </motion.button>
                          </nav>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* Customer Details Modal */}
          <AnimatePresence>
            {isDetailsOpen && selectedCustomer && (
              <motion.div
                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                  variants={slideUp}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold">
                      {selectedCustomer.first_name} {selectedCustomer.last_name}
                      's Details
                    </h2>
                    <motion.button
                      onClick={() => setIsDetailsOpen(false)}
                      className="text-gray-500 hover:text-gray-700"
                      whileHover={{ rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X size={24} />
                    </motion.button>
                  </div>

                  {isLoadingDetails ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <motion.div
                          className="bg-gray-50 p-4 rounded-lg"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <h3 className="font-bold mb-3 text-lg">
                            Personal Information
                          </h3>
                          <div className="space-y-2">
                            <p>
                              <span className="font-semibold">Name:</span>{" "}
                              {selectedCustomer.first_name}{" "}
                              {selectedCustomer.last_name}
                            </p>
                            <p>
                              <span className="font-semibold">Email:</span>{" "}
                              {selectedCustomer.email || "N/A"}
                            </p>
                            <p>
                              <span className="font-semibold">Phone:</span>{" "}
                              {selectedCustomer.contact || "N/A"}
                            </p>
                            <p>
                              <span className="font-semibold">Address:</span>{" "}
                              {selectedCustomer.address || "N/A"}
                            </p>
                            <p>
                              <span className="font-semibold">Birthday:</span>{" "}
                              {selectedCustomer.birthday
                                ? formatDate(selectedCustomer.birthday)
                                : "N/A"}
                            </p>
                            <p>
                              <span className="font-semibold">
                                Member Since:
                              </span>{" "}
                              {selectedCustomer.join_date
                                ? formatDate(selectedCustomer.join_date)
                                : "N/A"}
                            </p>
                          </div>
                        </motion.div>

                        <motion.div
                          className="bg-gray-50 p-4 rounded-lg"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <h3 className="font-bold mb-3 text-lg">
                            Membership Information
                          </h3>
                          {selectedCustomer.membershipData?.length > 0 ? (
                            selectedCustomer.membershipData.map(
                              (membership) => (
                                <div
                                  key={membership.id}
                                  className="space-y-2 mb-4 border-b pb-4"
                                >
                                  <p>
                                    <span className="font-semibold">Plan:</span>{" "}
                                    {membership.type === "vip"
                                      ? "VIP"
                                      : membership.type
                                        ? membership.type
                                          .charAt(0)
                                          .toUpperCase() +
                                        membership.type.slice(1).toLowerCase()
                                        : "None"}
                                  </p>
                                  <p>
                                    <span className="font-semibold">
                                      Coverage:
                                    </span>{" "}
                                    {formatCurrency(membership.coverage)}
                                  </p>
                                  <p>
                                    <span className="font-semibold">
                                      Remaining Balance:
                                    </span>{" "}
                                    {formatCurrency(
                                      membership.remaining_balance
                                    )}
                                  </p>
                                  <p>
                                    <span className="font-semibold">
                                      Registered:
                                    </span>{" "}
                                    {formatDate(membership.date_registered)}
                                  </p>
                                  <p>
                                    <span className="font-semibold">
                                      Expiration:
                                    </span>{" "}
                                    {formatDate(membership.expire_date)}
                                  </p>
                                  <p>
                                    <span className="font-semibold">
                                      Days Remaining:
                                    </span>{" "}
                                    {membership.expire_date
                                      ? calculateDaysRemaining(
                                        membership.expire_date
                                      )
                                      : "No Expiry"}
                                  </p>
                                  <p>
                                    <span className="font-semibold">
                                      Status:
                                    </span>
                                    {membership.expire_date &&
                                      new Date(membership.expire_date) <
                                      new Date() ? (
                                      <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                                        Expired
                                      </span>
                                    ) : (
                                      <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                                        Active
                                      </span>
                                    )}
                                  </p>
                                </div>
                              )
                            )
                          ) : (
                            <div className="text-gray-500">
                              No active memberships
                            </div>
                          )}
                        </motion.div>
                      </div>

                      <motion.div
                        className="bg-gray-50 p-4 rounded-lg mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <h3 className="font-bold mb-3 text-lg">
                          Membership History
                        </h3>
                        {selectedCustomer.membershipLogs?.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full border border-gray-300">
                              <thead>
                                <tr className="bg-gray-200">
                                  <th className="border px-3 py-2 text-left text-sm">
                                    Date
                                  </th>
                                  <th className="border px-3 py-2 text-left text-sm">
                                    Action
                                  </th>
                                  <th className="border px-3 py-2 text-left text-sm">
                                    Type
                                  </th>
                                  <th className="border px-3 py-2 text-left text-sm">
                                    Amount
                                  </th>
                                  <th className="border px-3 py-2 text-left text-sm">
                                    Payment Method
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedCustomer.membershipLogs.map(
                                  (log, index) => (
                                    <tr key={index}>
                                      <td className="border px-3 py-2 text-sm">
                                        {log.timestamp
                                          ? formatDate(log.timestamp)
                                          : "N/A"}
                                      </td>
                                      <td className="border px-3 py-2 text-sm capitalize">
                                        {log.action || "N/A"}
                                      </td>
                                      <td className="border px-3 py-2 text-sm">
                                        {log.type === "pro" ? "PRO" : "Basic"}
                                      </td>
                                      <td className="border px-3 py-2 text-sm">
                                        {formatCurrency(log.amount)}
                                      </td>
                                      <td className="border px-3 py-2 text-sm capitalize">
                                        {log.payment_method || "N/A"}
                                      </td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-gray-500">
                            No membership history found
                          </div>
                        )}
                      </motion.div>

                      {selectedCustomer.transactions &&
                        selectedCustomer.transactions.length > 0 && (
                          <motion.div
                            className="bg-gray-50 p-4 rounded-lg mb-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            <h3 className="font-bold mb-3 text-lg">
                              Recent Transactions
                            </h3>
                            <div className="overflow-x-auto">
                              <table className="w-full border border-gray-300">
                                <thead>
                                  <tr className="bg-gray-200">
                                    <th className="border px-3 py-2 text-left text-sm">
                                      Date
                                    </th>
                                    <th className="border px-3 py-2 text-left text-sm">
                                      Service
                                    </th>
                                    <th className="border px-3 py-2 text-left text-sm">
                                      Amount
                                    </th>
                                    <th className="border px-3 py-2 text-left text-sm">
                                      Status
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {selectedCustomer.transactions
                                    .slice(0, 5)
                                    .map((transaction, index) => (
                                      <tr key={index}>
                                        <td className="border px-3 py-2 text-sm">
                                          {transaction.date
                                            ? formatDate(transaction.date)
                                            : "N/A"}
                                        </td>
                                        <td className="border px-3 py-2 text-sm">
                                          {transaction.service || "N/A"}
                                        </td>
                                        <td className="border px-3 py-2 text-sm">
                                          {formatCurrency(transaction.amount)}
                                        </td>
                                        <td className="border px-3 py-2 text-sm">
                                          <span
                                            className={`px-2 py-1 rounded-full text-xs ${transaction.status === "Paid"
                                              ? "bg-green-100 text-green-800"
                                              : transaction.status ===
                                                "Pending"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : "bg-gray-100 text-gray-800"
                                              }`}
                                          >
                                            {transaction.status || "N/A"}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            </div>
                          </motion.div>
                        )}

                      <motion.div
                        className="flex justify-end space-x-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        {selectedCustomer.membershipData?.length > 0 && (
                          <motion.button
                            onClick={() =>
                              setRenewModalData({
                                customerId: selectedCustomer.id,
                                membershipId:
                                  selectedCustomer.membershipData[0].id,
                              })
                            }
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Renew Membership
                          </motion.button>
                        )}
                        <motion.button
                          onClick={() => setIsDetailsOpen(false)}
                          className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Close
                        </motion.button>
                      </motion.div>
                    </>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {renewModalData && (
              <motion.div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-white p-6 rounded-lg w-full max-w-md"
                  initial={{ scale: 0.9, y: 20, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{ scale: 0.9, y: 20, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* Header */}
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Renew Membership</h2>
                    <button
                      onClick={() => setRenewModalData(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Membership Type */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Membership Type
                      </label>
                      <select
                        value={selectedType}
                        onChange={(e) => {
                          const type = e.target.value;
                          setSelectedType(type);
                          setRenewMembership((prev) => ({
                            ...prev,
                            type,
                            price: type === "basic" ? 3000 : type === "pro" ? 6000 : "",
                            consumable_amount:
                              type === "basic" ? 5000 : type === "pro" ? 10000 : "",
                          }));
                        }}
                        className="w-full p-2 border rounded"
                      >
                        <option value="basic">Basic (₱3,000 for 5,000)</option>
                        <option value="pro">Pro (₱6,000 for 10,000)</option>
                        <option value="promo">Promo (Custom)</option>
                      </select>
                    </div>

                    {/* Promo-only Fields */}
                    {selectedType === "promo" && (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-1">Price (₱)</label>
                          <input
                            type="number"
                            value={renewMembership.price}
                            onChange={(e) =>
                              setRenewMembership((prev) => ({
                                ...prev,
                                price: e.target.value,
                              }))
                            }
                            className="w-full p-2 border rounded"
                            placeholder="Enter price"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Consumable Amount
                          </label>
                          <input
                            type="number"
                            value={renewMembership.consumable_amount}
                            onChange={(e) =>
                              setRenewMembership((prev) => ({
                                ...prev,
                                consumable_amount: e.target.value,
                              }))
                            }
                            className="w-full p-2 border rounded"
                            placeholder="Enter consumable amount"
                          />
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="renewNoExpiration"
                            checked={renewMembership.no_expiration}
                            onChange={(e) =>
                              setRenewMembership((prev) => ({
                                ...prev,
                                no_expiration: e.target.checked,
                              }))
                            }
                            className="mr-2"
                          />
                          <label htmlFor="renewNoExpiration">No Expiration</label>
                        </div>
                        {!renewMembership.no_expiration && (
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Valid Until
                            </label>
                            <input
                              type="date"
                              value={renewMembership.valid_until}
                              onChange={(e) =>
                                setRenewMembership((prev) => ({
                                  ...prev,
                                  valid_until: e.target.value,
                                }))
                              }
                              className="w-full p-2 border rounded"
                            />
                          </div>
                        )}
                      </>
                    )}

                    {/* Payment Method */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Payment Method
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full p-2 border rounded"
                      >
                        <option value="Cash">Cash</option>
                        <option value="GCash">GCash</option>
                        <option value="Card">Card</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end space-x-2 mt-6">
                    <button
                      onClick={() => setRenewModalData(null)}
                      className="flex items-center gap-2 bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        await handleRenew(
                          renewModalData.customerId,
                          renewModalData.membershipId,
                          selectedType,
                          paymentMethod,
                          renewMembership
                        );
                        setRenewModalData(null);
                      }}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg"
                    >
                      Confirm Renewal
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
