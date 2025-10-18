"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Toaster, toast } from "sonner";
import { User, Settings, LogOut, Home, X } from "lucide-react";
import { Menu } from "@headlessui/react";
import {
  Users,
  FileText,
  CreditCard,
  Package,
  Layers,
  BarChart2,
  UserPlus,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  ClipboardList,
  Factory,
  ShoppingBag,
  Folder,
  Tag,
  Plus,
  Search,
  Leaf,
  ChevronDown,
} from "lucide-react";
import { BarChart, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Memberships() {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [memberships, setMemberships] = useState([]);
  const [isLoadingServices, setIsLoadingServices] = useState([]);
  const [includedServices, setIncludedServices] = useState([]);
  const [availablePremiumServices, setAvailablePremiumServices] = useState([]);
  const [editMembership, setEditMembership] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState(null);
  const [membershipServices, setMembershipServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedServices, setSelectedServices] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showSummary, setShowSummary] = useState(false);
  const servicesPerPage = 12;
  const [allServices, setAllServices] = useState([]);
  const [newMembership, setNewMembership] = useState({
    name: "Basic", // Default to "Basic" to match type
    type: "basic",
    description: "",
    price: 3000,
    consumable_amount: 5000,
    no_expiration: true,
    valid_until: "",
  });

  const calculateDiscountedPrice = (originalPrice) => {
    return originalPrice * 0.5; // 50% fixed discount for both types
  };

  const fetchMemberships = async () => {
    try {
      const res = await fetch("http://localhost/API/memberships.php");
      const data = await res.json();

      if (Array.isArray(data)) {
        setMemberships(data);
      } else {
        toast.error("Invalid data format from server.");
        console.error("Expected array, got:", data);
      }
    } catch (error) {
      toast.error("Failed to load memberships.");
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    fetchMemberships();
  }, []);

  const fetchPremiumServices = async (membershipType) => {
    try {
      // Add debug logging
      console.log(`Fetching premium services for: ${membershipType}`);

      const res = await fetch(
        `http://localhost/API/servicegroup.php?action=premium_services&membership_type=${membershipType}`
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("API Error:", {
          status: res.status,
          statusText: res.statusText,
          errorData,
        });
        throw new Error(
          `Failed to fetch services: ${res.status} ${res.statusText}`
        );
      }

      const data = await res.json();
      console.log("Received services:", data);

      if (!Array.isArray(data)) {
        console.error("Expected array but got:", data);
        return [];
      }

      return data.map((service) => ({
        id: service.service_id,
        name: service.name,
        duration: service.duration ? `${service.duration} mins` : "N/A",
        originalPrice: parseFloat(service.originalPrice),
        price: `₱${parseFloat(service.originalPrice).toFixed(2)}`,
        discountedPrice: service.discountedPrice
          ? parseFloat(service.discountedPrice)
          : null,
        discountPercentage: service.discountPercentage || "50%",
        description: service.description || "No description available",
        category: service.category || "Uncategorized",
        membershipType: service.membershipType || membershipType,
      }));
    } catch (error) {
      console.error("Error fetching premium services:", error);
      toast.error("Failed to load services. Please try again.");
      return [];
    }
  };

  useEffect(() => {
    if (editMembership) {
      fetchPremiumServices(editMembership.membershipType).then((services) => {
        setAllServices(services);

        const included = editMembership.includedServices || [];

        // Normalize and match services
        const preselected = services.filter((s) =>
          included.some(
            (inc) => inc.id === s.id || inc.service_id === s.id // in case of different key names
          )
        );

        setSelectedServices(preselected);
      });
    }
  }, [editMembership]);

  const handleSearch = () => {
    toast(`Searching for: ${searchQuery}`);
  };

  const handleAdd = async () => {
    if (!newMembership.description.trim()) {
      toast.error("Description is required.");
      return;
    }

    // Additional validation for promo memberships
    if (newMembership.type === "promo") {
      if (!newMembership.price || newMembership.price <= 0) {
        toast.error("Please enter a valid price for the promo.");
        return;
      }
      if (
        !newMembership.consumable_amount ||
        newMembership.consumable_amount <= 0
      ) {
        toast.error("Please enter a valid consumable amount.");
        return;
      }
      if (!newMembership.no_expiration && !newMembership.valid_until) {
        toast.error(
          "Please select a valid until date or check 'No Expiration'."
        );
        return;
      }
    }

    try {
      const membershipToSend = {
        name:
          newMembership.type === "basic"
            ? "Basic"
            : newMembership.type === "pro"
              ? "Pro"
              : "Promo",
        type: newMembership.type,
        description: newMembership.description,
        discount: "50%",
        consumable_amount:
          newMembership.type === "basic"
            ? 5000
            : newMembership.type === "pro"
              ? 10000
              : Number(newMembership.consumable_amount),
        price:
          newMembership.type === "basic"
            ? 3000
            : newMembership.type === "pro"
              ? 6000
              : Number(newMembership.price),
        no_expiration:
          newMembership.type === "promo" ? newMembership.no_expiration : true,
        valid_until:
          newMembership.type === "promo" && !newMembership.no_expiration
            ? newMembership.valid_until
            : null,
        duration: 12, // Default duration as shown in your existing records
      };

      const res = await fetch("http://localhost/API/memberships.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(membershipToSend),
      });

      const data = await res.json();

      // Reset form with correct defaults
      setNewMembership({
        name: "Basic",
        type: "basic",
        description: "",
        price: 3000,
        consumable_amount: 5000,
        no_expiration: true,
        valid_until: "",
      });

      setIsModalOpen(false);
      toast.success("Membership added successfully!");
    } catch (error) {
      console.error("Add error:", error);
      toast.error("Failed to add membership. Please try again.");
    }
  };

  const handleEdit = async (id) => {
    const membershipToEdit = memberships.find((m) => m.id === id);
    if (!membershipToEdit) return;

    // Detect type from actual `membership_type` if available
    const type = membershipToEdit.type; // "basic", "pro", or "promo"

    let included_services = [];

    if (type === "basic" || type === "pro") {
      included_services = await fetchPremiumServices(type);
    } else {
      included_services = membershipToEdit.included_services || [];
    }

    setEditMembership({
      ...membershipToEdit,
      type, // keep as-is: "basic", "pro", "promo"
      included_services,
    });
  };

  const handleSaveEdit = async () => {
    if (
      !editMembership.name ||
      !editMembership.type ||
      !editMembership.description
    ) {
      toast.error("All fields are required.");
      return;
    }

    try {
      let includedServices = [];

      if (editMembership.type === "basic" || editMembership.type === "pro") {
        includedServices = await fetchPremiumServices(editMembership.type);
      } else {
        includedServices = editMembership.included_services || [];
      }

      const membershipToSend = {
        ...editMembership,
        included_services: includedServices,
        discount:
          editMembership.type === "pro"
            ? "50"
            : editMembership.type === "basic"
              ? "30"
              : editMembership.discount || "0",
      };

      const res = await fetch(`http://localhost/API/memberships.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update", // ← important
          membership_id: editMembership.id, // ← send the ID of the membership to update
          ...membershipToSend,
        }),
      });

      const updated = await res.json();

      const updatedWithType = {
        ...updated,
        type:
          updated.discount === "50"
            ? "pro"
            : updated.discount === "30"
              ? "basic"
              : "promo",
      };

      setMemberships((prev) =>
        prev.map((m) => (m.id === updatedWithType.id ? updatedWithType : m))
      );

      setEditMembership(null);
      toast.success("Membership updated successfully.");
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update membership.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/";
  };

  // const handleToggleActive = async (id) => {
  //   try {
  //     const membershipToUpdate = memberships.find((m) => m.id === id);
  //     const newStatus =
  //       membershipToUpdate.status === "active" ? "inactive" : "active";

  //     const updatedMemberships = memberships.map((membership) =>
  //       membership.id === id ? { ...membership, status: newStatus } : membership
  //     );
  //     setMemberships(updatedMemberships);

  //     await fetch(`http://localhost/API/memberships.php/${id}`, {
  //       method: "PUT",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ ...membershipToUpdate, status: newStatus }),
  //     });

  //     toast.success(
  //       `Membership ${newStatus === "active" ? "activated" : "deactivated"} successfully.`
  //     );
  //   } catch (error) {
  //     toast.error("Failed to update membership status.");
  //     console.error(error);
  //   }
  // };

  const handleRowClick = async (membership) => {
    // Determine membership type based on name or other attribute
    const membershipType = membership.name.toLowerCase().includes("pro")
      ? "pro"
      : "basic";

    setSelectedMembership({
      ...membership,
      type: membershipType, // Make sure this is either 'basic' or 'pro'
    });

    setIsLoadingServices(true);

    try {
      const services = await fetchPremiumServices(membershipType);
      setMembershipServices(services);
    } catch (error) {
      console.error("Error loading services:", error);
      toast.error("Failed to load services");
    } finally {
      setIsLoadingServices(false);
    }
  };

  const closeMembershipDetails = () => {
    setSelectedMembership(null);
  };

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

  const scaleUp = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.3 } },
    exit: { scale: 0.95, opacity: 0, transition: { duration: 0.2 } },
  };

  const SummaryView = ({
    services,
    searchTerm,
    categoryFilter,
    membershipType,
  }) => {
    const filteredServices = services.filter((service) => {
      const name = service.name?.toLowerCase() || "";
      const description = service.description?.toLowerCase() || "";
      const category = service.category?.toLowerCase() || "";
      const search = searchTerm.toLowerCase();
      const filterCategory = categoryFilter.toLowerCase();

      const matchesSearch =
        name.includes(search) || description.includes(search);

      const matchesCategory =
        filterCategory === "" || category === filterCategory;

      return matchesSearch && matchesCategory;
    });

    const categories = Array.from(
      new Set(filteredServices.map((s) => s.category))
    );

    return (
      <div className="space-y-4">
        {categories.map((category) => {
          const categoryServices = filteredServices.filter(
            (s) => s.category?.toLowerCase() === category?.toLowerCase()
          );

          const categoryTotal = categoryServices.reduce(
            (sum, s) => sum + (s.originalPrice || 0),
            0
          );

          const categoryDiscountedTotal = categoryServices.reduce(
            (sum, s) => sum + (s.discountedPrice || 0),
            0
          );

          return (
            <div key={category} className="border-b pb-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">{category}</h4>
                <span className="text-sm text-gray-600">
                  {categoryServices.length} services
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-600">
                  Original: ₱
                  {Number(categoryTotal).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span className="font-medium text-red-500">
                  50% off: ₱
                  {Number(categoryDiscountedTotal).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const DetailedView = ({
    services,
    searchTerm,
    categoryFilter,
    membershipType,
    currentPage,
    servicesPerPage,
    setCurrentPage,
  }) => {
    const filteredServices = services.filter((service) => {
      const matchesSearch =
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        categoryFilter === "" || service.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    const indexOfLastService = currentPage * servicesPerPage;
    const indexOfFirstService = indexOfLastService - servicesPerPage;
    const currentServices = filteredServices.slice(
      indexOfFirstService,
      indexOfLastService
    );
    const totalPages = Math.ceil(filteredServices.length / servicesPerPage);

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {currentServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              membershipType={membershipType}
            />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-4">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`mx-1 px-3 py-1 rounded ${
                  currentPage === index + 1
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const ServiceCard = ({ service, membershipType }) => {
    return (
      <motion.div
        className="border rounded-lg p-3 hover:shadow-md transition-shadow"
        whileHover={{ y: -2 }}
      >
        <div className="flex justify-between items-start">
          <h4 className="font-medium text-sm">{service.name}</h4>
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
            {service.category}
          </span>
        </div>
        <div className="mt-2 text-xs text-gray-600">
          <div>Duration: {service.duration}</div>
          <div className="flex justify-between mt-1">
            <span>
              Original: ₱
              {Number(service.originalPrice).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="font-medium text-red-500">
              {service.discountPercentage} off: ₱
              {Number(service.discountedPrice).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-800">
      <Toaster position="top-right" richColors />
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
                            count: 6,
                          },
                          {
                            href: "/invoices2",
                            label: "Invoices",
                            icon: <FileText size={16} />,
                            count: 30,
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

        {/* Main Content - Enhanced */}
        <main className="flex-1 p-8 ml-64">
          <motion.div
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            {/* Header with search and actions */}
            <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">
                  Membership Programs
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage your clinic's membership offerings
                </p>
              </div>
            </div>

            {/* Enhanced Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Membership
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Value
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Discount
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.isArray(memberships) && memberships.length > 0 ? (
                    memberships.map((membership) => (
                      <motion.tr
                        key={membership.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleRowClick(membership)}
                        whileHover={{ backgroundColor: "#f8fafc" }}
                        transition={{ duration: 0.15 }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            <div className="flex items-center gap-2">
                              {membership.name}
                              {membership.type === "promo" && (
                                <span className="px-1.5 py-0.5 text-xs font-medium bg-amber-200 text-amber-800 rounded-full">
                                  Membership Promo
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              ₱
                              {Number(membership.price).toLocaleString(
                                undefined,
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}{" "}
                              for{" "}
                              {Number(
                                membership.consumable_amount
                              ).toLocaleString()}{" "}
                              consumable
                              {membership.type === "promo" &&
                                !membership.no_expiration &&
                                membership.valid_until && (
                                  <div className="text-xs mt-1">
                                    <span
                                      className={`px-1.5 py-0.5 rounded-full ${
                                        new Date(membership.valid_until) <
                                        new Date()
                                          ? "bg-red-100 text-red-800"
                                          : "bg-blue-100 text-blue-800"
                                      }`}
                                    >
                                      {new Date(membership.valid_until) <
                                      new Date()
                                        ? "Expired"
                                        : `Valid until ${new Date(membership.valid_until).toLocaleDateString()}`}
                                    </span>
                                  </div>
                                )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {Number(
                              membership.consumable_amount
                            ).toLocaleString()}{" "}
                            consumable
                            {membership.type === "basic" && (
                              <div className="text-xs text-gray-500 mt-1">
                                No expiration
                              </div>
                            )}
                            {membership.type === "pro" && (
                              <div className="text-xs text-gray-500 mt-1">
                                No expiration
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-emerald-600">
                            {membership.discount} off
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div
                            className="text-sm text-gray-500 line-clamp-2"
                            title={membership.description}
                          >
                            {membership.description}
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        <div className="flex flex-col items-center justify-center">
                          <Users className="w-12 h-12 text-gray-300 mb-4" />
                          <p className="text-lg font-medium text-gray-400">
                            No memberships found
                          </p>
                          <p className="text-sm mt-1">
                            Create your first membership program
                          </p>
                          <button
                            onClick={() => setIsModalOpen(true)}
                            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                          >
                            Create Membership
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Add Membership Modal */}
          <AnimatePresence>
            {isModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-bold mb-4">New Membership</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block mb-1">Membership Type</label>
                      <select
                        value={newMembership.type}
                        onChange={(e) => {
                          const type = e.target.value;
                          setNewMembership({
                            ...newMembership,
                            type: type,
                            name:
                              type === "basic"
                                ? "Basic"
                                : type === "pro"
                                  ? "Pro"
                                  : "Promo", // Auto-set name based on type
                            price:
                              type === "basic"
                                ? 3000
                                : type === "pro"
                                  ? 6000
                                  : "",
                            consumable_amount:
                              type === "basic"
                                ? 5000
                                : type === "pro"
                                  ? 10000
                                  : "",
                          });
                        }}
                        className="w-full p-2 border rounded"
                      >
                        <option value="basic">
                          Basic (₱3,000 for 5,000 consumable)
                        </option>
                        <option value="pro">
                          Pro (₱6,000 for 10,000 consumable)
                        </option>
                        <option value="promo">Promo (Custom)</option>
                      </select>
                    </div>

                    {/* Show these fields only for promo memberships */}
                    {newMembership.type === "promo" && (
                      <>
                        <div>
                          <label className="block mb-1">Price (₱)</label>
                          <input
                            type="number"
                            value={newMembership.price}
                            onChange={(e) =>
                              setNewMembership({
                                ...newMembership,
                                price: e.target.value,
                              })
                            }
                            className="w-full p-2 border rounded"
                            placeholder="Enter price"
                          />
                        </div>
                        <div>
                          <label className="block mb-1">
                            Consumable Amount
                          </label>
                          <input
                            type="number"
                            value={newMembership.consumable_amount}
                            onChange={(e) =>
                              setNewMembership({
                                ...newMembership,
                                consumable_amount: e.target.value,
                              })
                            }
                            className="w-full p-2 border rounded"
                            placeholder="Enter consumable amount"
                          />
                        </div>
                        {!newMembership.no_expiration && (
                          <div>
                            <label className="block mb-1">Valid Until</label>
                            <input
                              type="date"
                              value={newMembership.valid_until}
                              onChange={(e) =>
                                setNewMembership({
                                  ...newMembership,
                                  valid_until: e.target.value,
                                })
                              }
                              className="w-full p-2 border rounded"
                            />
                          </div>
                        )}
                      </>
                    )}

                    {/* Common fields for all membership types */}
                    <div>
                      <label className="block mb-1">Description</label>
                      <textarea
                        value={newMembership.description}
                        onChange={(e) =>
                          setNewMembership({
                            ...newMembership,
                            description: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded"
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 bg-gray-300 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAdd}
                        className="px-4 py-2 bg-green-600 text-white rounded"
                      >
                        Create
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>

          {/* Edit Membership Modal */}
          <AnimatePresence>
            {editMembership && (
              <motion.div
                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto hide-scrollbar"
                  variants={slideUp}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {/* Modal Header */}
                  <div className="flex justify-between items-center mb-4 sticky top-0 bg-white py-2">
                    <h3 className="font-bold text-lg">Edit Membership</h3>
                    <button
                      onClick={() => setEditMembership(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Membership Type */}
                    <div>
                      <label className="block font-medium mb-1">
                        Membership Type
                      </label>
                      <div className="px-3 py-2 border rounded-lg bg-gray-50">
                        {editMembership.type === "basic" && "Basic Membership"}
                        {editMembership.type === "pro" && "Pro Membership"}
                        {editMembership.type === "promo" && "Promo Membership"}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Membership type cannot be changed after creation
                      </p>
                    </div>

                    {/* Pricing Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Price */}
                      <div>
                        <label className="block font-medium mb-1">
                          Price (₱)
                        </label>
                        {editMembership.type === "promo" ? (
                          <input
                            type="number"
                            value={editMembership.price ?? ""}
                            onChange={(e) =>
                              setEditMembership({
                                ...editMembership,
                                price: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                          />
                        ) : (
                          <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm">
                            ₱{editMembership.price}
                          </div>
                        )}
                      </div>

                      {/* Consumable Amount */}
                      <div>
                        <label className="block font-medium mb-1">
                          Consumable Amount
                        </label>
                        {editMembership.type === "promo" ? (
                          <input
                            type="number"
                            value={editMembership.consumable_amount ?? ""}
                            onChange={(e) =>
                              setEditMembership({
                                ...editMembership,
                                consumable_amount: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                          />
                        ) : (
                          <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm">
                            {editMembership.consumable_amount}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expiration Settings */}
                    <div className="space-y-2">
                      {!editMembership.no_expiration && (
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Valid Until
                          </label>
                          {editMembership.type === "promo" ? (
                            <input
                              type="date"
                              value={editMembership.valid_until ?? ""}
                              onChange={(e) =>
                                setEditMembership({
                                  ...editMembership,
                                  valid_until: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border rounded-lg text-sm"
                            />
                          ) : (
                            <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm">
                              {editMembership.valid_until || "N/A"}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block font-medium mb-1">
                        Description
                      </label>
                      <textarea
                        value={editMembership.description ?? ""}
                        onChange={(e) =>
                          setEditMembership({
                            ...editMembership,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                        rows={2}
                      />
                    </div>

                    {/* Included Services */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block font-medium">
                          Included Services
                        </label>
                        <button
                          onClick={() => setSelectedServices(allServices)}
                          className="text-xs text-blue-500 hover:underline"
                        >
                          Select All
                        </button>
                      </div>

                      {/* Search bar */}
                      <input
                        type="text"
                        placeholder="Search services..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 mb-2 border rounded-lg text-sm"
                      />

                      {/* Services Selection List */}
                      <div className="max-h-[150px] overflow-y-auto border rounded-lg p-2 bg-gray-50">
                        {allServices
                          .filter(
                            (service) =>
                              service.name
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase()) ||
                              service.category
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase())
                          )
                          .map((service) => (
                            <label
                              key={service.id}
                              className="flex items-center space-x-2 p-1 text-sm hover:bg-gray-100 rounded"
                            >
                              <input
                                type="checkbox"
                                checked={selectedServices.some(
                                  (s) => s.id === service.id
                                )}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedServices((prev) => [
                                      ...prev,
                                      service,
                                    ]);
                                  } else {
                                    setSelectedServices((prev) =>
                                      prev.filter((s) => s.id !== service.id)
                                    );
                                  }
                                }}
                              />
                              <span className="truncate">
                                {service.name}{" "}
                                <span className="text-gray-500">
                                  ({service.category})
                                </span>
                              </span>
                            </label>
                          ))}

                        {allServices.filter(
                          (service) =>
                            service.name
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            service.category
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase())
                        ).length === 0 && (
                          <div className="text-center py-2 text-gray-500 text-sm">
                            No matching services found
                          </div>
                        )}
                      </div>

                      {/* Display Selected Services with Remove Button */}
                      {selectedServices.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2">
                            Selected Services:
                          </h4>
                          <div className="flex flex-col gap-1 max-h-[150px] overflow-y-auto border rounded-lg p-2 bg-white">
                            {selectedServices.map((service) => (
                              <div
                                key={service.id}
                                className="flex justify-between items-center px-2 py-1 rounded hover:bg-gray-50 text-sm"
                              >
                                <div>
                                  {service.name}{" "}
                                  <span className="text-gray-400">
                                    ({service.category})
                                  </span>
                                </div>
                                <button
                                  onClick={() =>
                                    setSelectedServices((prev) =>
                                      prev.filter((s) => s.id !== service.id)
                                    )
                                  }
                                  className="text-red-500 hover:underline text-xs"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block font-medium mb-1">Status</label>
                      <select
                        value={editMembership.status ?? "active"}
                        onChange={(e) =>
                          setEditMembership({
                            ...editMembership,
                            status: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-2">
                      <button
                        onClick={() => setEditMembership(null)}
                        className="px-4 py-2 bg-gray-400 hover:bg-gray-500 rounded-lg text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Membership Details Modal */}
          <AnimatePresence>
            {selectedMembership && (
              <motion.div
                className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl max-h-[90vh] flex flex-col"
                  variants={scaleUp}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold">
                        {selectedMembership.name} Membership
                      </h2>
                      <p className="text-sm text-gray-600">
                        Discount: {selectedMembership.discount} | Status:
                        <span
                          className={`ml-2 px-2 py-1 rounded-full text-xs ${
                            selectedMembership.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          {selectedMembership.status}
                        </span>
                      </p>
                    </div>
                    <motion.button
                      onClick={closeMembershipDetails}
                      className="text-gray-500 hover:text-gray-700"
                      whileHover={{ rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X size={24} />
                    </motion.button>
                  </div>

                  {/* Main Content */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-hidden">
                    {/* Membership Info Sidebar */}
                    <div className="space-y-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-bold mb-3 text-lg">Details</h3>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="font-semibold">Description:</span>{" "}
                            {selectedMembership.description}
                          </p>
                          <p>
                            <span className="font-semibold">Value:</span>{" "}
                            {Number(
                              selectedMembership.consumable_amount
                            ).toLocaleString()}{" "}
                            consumable for ₱
                            {Number(selectedMembership.price).toLocaleString()}
                          </p>
                          <p>
                            <span className="font-semibold">Discount:</span>{" "}
                            {selectedMembership.discount} on all services
                          </p>
                          <p>
                            <span className="font-semibold">Expiration:</span>{" "}
                            {selectedMembership.type?.toLowerCase() === "promo"
                              ? selectedMembership.expire_date
                                ? new Date(
                                    selectedMembership.expire_date
                                  ).toLocaleDateString()
                                : "No expiration date set"
                              : "No expiration"}
                          </p>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-bold mb-3 text-lg">Quick Stats</h3>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="font-semibold">
                              Total Services:
                            </span>{" "}
                            {membershipServices.length}
                          </p>
                          <p>
                            <span className="font-semibold">Categories:</span>{" "}
                            {
                              Array.from(
                                new Set(
                                  membershipServices.map((s) => s.category)
                                )
                              ).length
                            }
                          </p>
                          <p>
                            <span className="font-semibold">Avg. Price:</span> ₱
                            {(
                              membershipServices.reduce(
                                (sum, s) =>
                                  sum +
                                  parseFloat(
                                    s.price.replace("₱", "").replace(/,/g, "")
                                  ),
                                0
                              ) / membershipServices.length || 0
                            ).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Services Main Panel */}
                    <div className="md:col-span-2 flex flex-col overflow-hidden">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg">
                          Included Services{" "}
                          <span className="text-sm font-normal">
                            ({membershipServices.length})
                          </span>
                        </h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowSummary(!showSummary)}
                            className="text-sm text-green-600 hover:underline"
                            disabled={membershipServices.length === 0}
                          >
                            {showSummary ? "Show Details" : "Show Summary"}
                          </button>
                        </div>
                      </div>

                      {/* Filter Controls */}
                      <div className="mb-4 flex flex-wrap gap-2">
                        <input
                          type="text"
                          placeholder="Search services..."
                          className="px-3 py-1 border rounded-md text-sm flex-1 min-w-[200px]"
                          onChange={(e) => setSearchTerm(e.target.value)}
                          value={searchTerm}
                          disabled={membershipServices.length === 0}
                        />
                        <select
                          className="px-3 py-1 border rounded-md text-sm"
                          onChange={(e) => setCategoryFilter(e.target.value)}
                          value={categoryFilter}
                          disabled={membershipServices.length === 0}
                        >
                          <option value="">All Categories</option>
                          {Array.from(
                            new Set(membershipServices.map((s) => s.category))
                          ).map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Services Display */}
                      <div className="flex-1 overflow-auto">
                        {isLoadingServices ? (
                          <div className="flex justify-center items-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                          </div>
                        ) : membershipServices.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <Package className="w-12 h-12 mb-4" />
                            <p>No services included in this membership</p>
                            <p className="text-sm mt-1">
                              Premium services will appear here
                            </p>
                          </div>
                        ) : showSummary ? (
                          <SummaryView
                            services={membershipServices}
                            searchTerm={searchTerm}
                            categoryFilter={categoryFilter}
                            membershipType={selectedMembership?.type || "basic"}
                          />
                        ) : (
                          <DetailedView
                            services={membershipServices}
                            searchTerm={searchTerm}
                            categoryFilter={categoryFilter}
                            membershipType={selectedMembership?.type || "basic"}
                            currentPage={currentPage}
                            servicesPerPage={servicesPerPage}
                            setCurrentPage={setCurrentPage}
                          />
                        )}
                      </div>
                    </div>
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
