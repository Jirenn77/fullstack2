"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, Fragment } from "react";
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Dialog, Transition } from "@headlessui/react";
import { BarChart, Pencil, Trash2, Power } from "lucide-react";
import {
  Folder,
  ClipboardList,
  Factory,
  ShoppingBag,
  Tag,
  XIcon,
  Bell,
  BarChart3,
  Leaf,
  ChevronDown,
  Search,
  User,
  Percent,
} from "lucide-react";
import {
  Home,
  Users,
  FileText,
  CreditCard,
  Package,
  BarChart2,
  Layers,
  Settings,
  LogOut,
  UserPlus,
  Plus,
  X,
} from "lucide-react";

export default function BeautyDeals() {
  const router = useRouter();
  const pathname = usePathname();
  const [deals, setDeals] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);
  const [isBundleEditOpen, setIsBundleEditOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [dealServiceMap, setDealServiceMap] = useState({});
  const [discountServiceMap, setDiscountServiceMap] = useState({});
  const [allServices, setAllServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceSearchTerm, setServiceSearchTerm] = useState("");
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [expiringPromos, setExpiringPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bundleServiceMap, setBundleServiceMap] = useState({});

  const [selectedBundle, setSelectedBundle] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("promo");
  const [newItem, setNewItem] = useState({
    type: "promo",
    promoType: "Membership",
    name: "",
    description: "",
    validFrom: "",
    validTo: "",
    discountType: "percentage",
    value: "",
    status: "active",
  });

  const slideUp = {
    hidden: { opacity: 0, scale: 0.95, y: 30 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25 } },
    exit: { opacity: 0, scale: 0.95, y: 30, transition: { duration: 0.2 } },
  };

  // Fetch data from backend
  useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch(
        "http://localhost/API/getPromosAndDiscounts.php"
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      
      // Normalize field names for discounts
      const normalizedDiscounts = data.discounts.map(discount => ({
        ...discount,
        valid_from: discount.validFrom || discount.valid_from || "",
        valid_to: discount.validTo || discount.valid_to || "",
        discountType: discount.discount_type || discount.discountType || "percentage",
      }));

      // Normalize field names for deals/promos if needed
      const normalizedDeals = data.promos.map(deal => ({
        ...deal,
        valid_from: deal.validFrom || deal.valid_from || "",
        valid_to: deal.validTo || deal.valid_to || "",
      }));

      setDeals(normalizedDeals);
      setDiscounts(normalizedDiscounts);

      // ✅ Filter promos expiring in the next 3 days
      const now = new Date();
      const expiring = normalizedDeals.filter((promo) => {
        const validToDate = new Date(promo.valid_to);
        const diffDays = (validToDate - now) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 5;
      });

      setExpiringPromos(expiring);
    } catch (error) {
      setError(error.message);
      toast.error("Failed to fetch data: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  fetchData();
}, []);

  useEffect(() => {
    const fetchBundles = async () => {
      try {
        const response = await fetch("http://localhost/API/bundles.php");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();

        // ✅ if API wraps bundles inside an object
        if (Array.isArray(data)) {
          setBundles(data);
        } else if (Array.isArray(data.bundles)) {
          setBundles(data.bundles);
        } else {
          setBundles([]);
        }
      } catch (error) {
        setError(error.message);
        toast.error("Failed to fetch bundles: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBundles();
  }, []);

  // Fix the fetchBundleServices function
  useEffect(() => {
    const fetchBundleServices = async () => {
      try {
        const response = await fetch("http://localhost/API/bundles.php");
        if (!response.ok) throw new Error("Failed to fetch bundle services");

        const data = await response.json();

        // ✅ Fix: Handle the response structure properly
        const bundles = data.bundles || []; // Access the bundles array

        const map = {};
        bundles.forEach((bundle) => {
          map[bundle.id] = bundle.services || []; // Use 'id' instead of 'bundle_id'
        });

        setBundleServiceMap(map);
      } catch (error) {
        console.error("Error fetching bundle services:", error);
      }
    };

    fetchBundleServices();
  }, []);

  const handleViewBundle = (bundle) => {
    setSelectedBundle(bundle);
    setIsOpen(true);
  };

  useEffect(() => {
    fetchServicesForGroups();
  }, []); // Keep initial load

  const fetchServicesForGroups = async () => {
    try {
      const response = await fetch(
        "http://localhost/API/servicegroup.php?action=get_deals_with_services"
      );
      if (!response.ok) throw new Error("Failed to fetch deals");

      const deals = await response.json();

      const dealMap = {};
      const discountMap = {};

      deals.forEach((item) => {
        if (item.type === "promo") {
          dealMap[item.id] = item.services;
        } else if (item.type === "discount") {
          discountMap[item.id] = item.services;
        }
      });

      setDealServiceMap(dealMap);
      setDiscountServiceMap(discountMap);
    } catch (err) {
      toast.error("Failed to load deal/discount services: " + err.message);
    }
  };

  useEffect(() => {
    const fetchServicesForDiscounts = async () => {
      try {
        const res = await fetch(
          "http://localhost/API/servicegroup.php?action=get_discounts_with_services"
        );
        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        const map = {};
        data.forEach((discount) => {
          map[discount.id] = discount.services;
        });

        setDiscountServiceMap(map); // you need this state
      } catch (err) {
        toast.error("Failed to load discount services");
      }
    };

    fetchServicesForDiscounts();
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch(
          "http://localhost/API/servicegroup.php?action=all_services"
        );
        const data = await res.json();

        if (Array.isArray(data)) {
          setAllServices(data);
        } else {
          console.error("Expected an array but got:", data);
          toast.error("Unexpected response format.");
          setAllServices([]);
        }
      } catch (error) {
        console.error("Fetch failed:", error);
        toast.error("Failed to load services.");
        setAllServices([]);
      }
    };

    fetchServices();
  }, []);

  const getCurrentStatus = () => {
    const item = selectedDeal || selectedDiscount;
    if (!item) return "N/A";

    const currentDate = new Date();
    const validFrom = new Date(item.validFrom);
    const validTo = new Date(item.validTo);

    // Check if current date is within the valid range
    if (currentDate >= validFrom && currentDate <= validTo) {
      return "active";
    } else {
      return "inactive";
    }
  };

  // Helper function to check if current date is within valid range
  const isDateInRange = (validFrom, validTo) => {
    if (!validFrom || !validTo) return false;

    try {
      const currentDate = new Date();
      const fromDate = new Date(validFrom);
      const toDate = new Date(validTo);

      // Reset time part for date comparison only
      const today = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
      );
      const startDate = new Date(
        fromDate.getFullYear(),
        fromDate.getMonth(),
        fromDate.getDate()
      );
      const endDate = new Date(
        toDate.getFullYear(),
        toDate.getMonth(),
        toDate.getDate()
      );

      return today >= startDate && today <= endDate;
    } catch (error) {
      console.error("Error parsing dates:", error);
      return false;
    }
  };

  // Status functions for different types
  const getDealStatus = (deal) => {
    if (!deal) return "inactive";
    return isDateInRange(deal.validFrom, deal.validTo) ? "active" : "inactive";
  };

  const getBundleStatus = (bundle) => {
    if (!bundle) return "inactive";
    return isDateInRange(bundle.validFrom, bundle.validTo)
      ? "active"
      : "inactive";
  };

  const getDiscountStatus = (discount) => {
    if (!discount) return "inactive";
    return isDateInRange(discount.validFrom, discount.validTo)
      ? "active"
      : "inactive";
  };

  const handleAddItem = (type) => {
    setNewItem({
      type: type,
      promoType: "  ",
      name: "",
      description: "",
      validFrom: "",
      validTo: "",
      discountType: "percentage",
      value: "",
      status: "active",
    });
    setIsAddModalOpen(true);
  };

  const handleAddItemSubmit = async (e) => {
    e.preventDefault();
    try {
      // ✅ Construct endpoint with action in query string
      const endpoint = `http://localhost/API/getPromosAndDiscounts.php?action=${
        newItem.type === "promo" ? "addPromo" : "addDiscount"
      }`;

      // ✅ Build payload
      const payload = {
        type: newItem.type,
        promoType: newItem.type === "promo" ? newItem.promoType : undefined,
        name: newItem.name,
        description: newItem.description,
        discountType:
          newItem.type === "discount" ? newItem.discountType : undefined,
        value: newItem.type === "discount" ? newItem.value : undefined,
        validFrom: newItem.validFrom,
        validTo: newItem.validTo,

        status: newItem.status,
      };

      // ✅ POST request
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          `${newItem.type === "promo" ? "Promo" : "Discount"} added successfully!`
        );

        // ✅ Refresh lists
        const fetchResponse = await fetch(
          "http://localhost/API/getPromosAndDiscounts.php"
        );
        const data = await fetchResponse.json();
        if (data.promos) setDeals(data.promos);
        if (data.discounts) setDiscounts(data.discounts);

        setIsAddModalOpen(false);
      } else {
        toast.error(result.message || "Failed to add item");
      }
    } catch (error) {
      toast.error("Failed to add item: " + error.message);
    }
  };

  const handleAddBundle = () => {
    setNewItem({
      type: "bundle",
      name: "",
      description: "",
      price: "",
      validFrom: "",
      validTo: "",
      status: "active",
      services: [], // ✅ array of selected service IDs
    });
    setIsAddModalOpen(true);
  };

  const handleAddBundleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = "http://localhost/API/bundles.php?action=addBundle";

      // ✅ Build payload
      const payload = {
        name: newItem.name,
        description: newItem.description,
        price: newItem.price,
        validFrom: newItem.validFrom,
        validTo: newItem.validTo,
        status: newItem.status,
        services: newItem.services, // array of selected services
      };

      // ✅ POST request
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Bundle added successfully!");

        // ✅ Refresh bundles list
        const fetchResponse = await fetch("http://localhost/API/bundles.php");
        const data = await fetchResponse.json();
        setBundles(data);

        setIsAddModalOpen(false);
      } else {
        toast.error(result.message || "Failed to add bundle");
      }
    } catch (error) {
      toast.error("Failed to add bundle: " + error.message);
    }
  };

  const handleEditDeal = (index) => {
  const deal = deals[index];
  
  setSelectedDeal({ 
    ...deal, 
    index,
    // Map backend fields to frontend form fields if needed
    valid_from: deal.validFrom || deal.valid_from || "",
    valid_to: deal.validTo || deal.valid_to || "",
  });
  setIsPromoModalOpen(true);
  setIsOpen(false);
};

  const handleEditDiscount = (index) => {
  const discount = discounts[index];
  
  // Transform the field names to match what your form expects
  setSelectedDiscount({ 
    ...discount, 
    index,
    // Map backend fields to frontend form fields
    valid_from: discount.validFrom || discount.valid_from || "",
    valid_to: discount.validTo || discount.valid_to || "",
  });
  setIsDiscountModalOpen(true);
  setIsOpen(false);
};

  const handleEditBundle = (bundleIndex) => {
    const bundleToEdit = bundles[bundleIndex];
    if (bundleToEdit) {
      setSelectedBundle({
        ...bundleToEdit,
        id: bundleToEdit.id,
        services: bundleToEdit.services
          ? bundleToEdit.services.map((s) => s.service_id)
          : [],
      });
      setIsBundleModalOpen(true);
    }
  };

  const handleSaveEditBundle = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost/API/bundles.php?action=updateBundle",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bundle_id: selectedBundle.id,
            name: selectedBundle.name,
            description: selectedBundle.description,
            price: parseFloat(selectedBundle.price),
            validFrom: selectedBundle.validFrom, // ✅ match backend
            validTo: selectedBundle.validTo, // ✅ match backend
            status: selectedBundle.status,
            services: selectedBundle.services, // ✅ match backend
          }),
        }
      );

      // ✅ Rebuild service objects after update
      const fullServiceObjects = selectedBundle.services
        .map((id) => allServices.find((s) => s.service_id === id))
        .filter(Boolean);

      const updatedBundle = {
        ...selectedBundle,
        services: fullServiceObjects,
      };

      setBundles((prev) =>
        prev.map((b) =>
          b.id === selectedBundle.id || b.bundle_id === selectedBundle.id
            ? updatedBundle
            : b
        )
      );

      toast.success("Bundle updated successfully!");
      setIsBundleModalOpen(false);
    } catch (error) {
      toast.error("Failed to update bundle: " + error.message);
    }
  };

  const handleSaveEditPromo = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost/API/getPromosAndDiscounts.php?action=update_deal",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: selectedDeal.id,
            type: selectedDeal.type,
            name: selectedDeal.name,
            description: selectedDeal.description,
            validFrom: selectedDeal.validFrom,
            validTo: selectedDeal.validTo,
            status: selectedDeal.status,
            discount_type: selectedDeal.discountType || "fixed",
            discount_value: parseFloat(selectedDeal.discountedPrice) || 0,
            serviceIds: selectedServices.map((s) => s.service_id),
          }),
        }
      );

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to update promo.");
      }

      // ✅ Refresh the service maps to get updated data
      await fetchServicesForGroups();

      // Update the local deals state
      const updatedDeal = {
        ...selectedDeal,
        type: selectedDeal.type,
        name: selectedDeal.name,
        description: selectedDeal.description,
        validFrom: selectedDeal.validFrom,
        validTo: selectedDeal.validTo,
        status: selectedDeal.status,
        discountType: selectedDeal.discountType,
        discountValue: selectedDeal.discountedPrice,
        discountedPrice: selectedDeal.discountedPrice,
      };

      setDeals((prev) =>
        prev.map((deal) => (deal.id === selectedDeal.id ? updatedDeal : deal))
      );

      setSelectedDeal(updatedDeal);

      // ✅ Update selectedServices from the refreshed map
      setSelectedServices(dealServiceMap[selectedDeal.id] || []);

      toast.success("Promo updated successfully!");
      setIsPromoModalOpen(false);
    } catch (error) {
      toast.error("Failed to update promo: " + error.message);
    }
  };

  const handleSaveEditDiscount = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch(
      "http://localhost/API/getPromosAndDiscounts.php?action=save_group",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          group_id: selectedDiscount.id,
          group_name: selectedDiscount.name,
          description: selectedDiscount.description,
          status: selectedDiscount.status,
          discount_type: selectedDiscount.discountType,
          value: selectedDiscount.value,
          validFrom: selectedDiscount.valid_from, // Send as validFrom
          validTo: selectedDiscount.valid_to,     // Send as validTo
          services: selectedServices.map((s) => s.service_id),
        }),
      }
    );

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || "Failed to update discount group.");
    }

    // Update local state
    setDiscounts((prev) => {
      const updated = [...prev];
      updated[selectedDiscount.index] = { 
        ...selectedDiscount,
        // Keep both field names for consistency
        validFrom: selectedDiscount.valid_from,
        validTo: selectedDiscount.valid_to,
      };
      return updated;
    });

    toast.success("Discount updated successfully!");
    setIsDiscountModalOpen(false);
  } catch (error) {
    toast.error("Failed to update discount: " + error.message);
  }
};

  if (isLoading) {
    return (
      <main className="flex-1 p-6 bg-white text-gray-900 ml-64 flex items-center justify-center">
        <div>Loading...</div>
      </main>
    );
  }

  const handleSearch = () => {
    toast.success(`Searching for "${searchQuery}"...`);
    console.log("Search query:", searchQuery);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/";
  };

  return (
    <div className="flex flex-col h-screen bg-[#77DD77] text-gray-900">
      <Toaster />

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
                  {router.pathname === '/home2' && (
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
                          { href: "/customers2", label: "Customers", icon: <Users size={16} />, },
                          { href: "/invoices2", label: "Invoices", icon: <FileText size={16} />, },
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
        <main className="flex-1 p-8 bg-gradient-to-br from-gray-50 to-white text-gray-800 ml-64 min-h-screen">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex justify-between items-center mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-800 bg-gradient-to-r from-gray-800 to-gray-800 bg-clip-text text-transparent">
                Beauty Deals & Promotions
              </h1>
              <p className="text-sm text-gray-600 mt-2 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                Manage all your promotions and discounts in one place
              </p>
            </div>
            <div className="flex space-x-4"></div>
          </motion.div>
          <motion.div
            className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <button
              onClick={() => setActiveTab("promo")}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === "promo"
                  ? "bg-white text-blue-600 shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Tag size={18} />
                <span>Promotions ({deals.length})</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("bundle")}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === "bundle"
                  ? "bg-white text-purple-600 shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Package size={18} />
                <span>Bundles ({bundles.length})</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("discount")}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === "discount"
                  ? "bg-white text-green-600 shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Percent size={18} />
                <span>Discounts ({discounts.length})</span>
              </div>
            </button>
          </motion.div>

          {/* Promo Section */}
          {activeTab === "promo" && (
            <motion.section
              className="mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <Tag className="text-blue-600" size={20} />
                  </div>
                  Promotions
                  <span className="ml-3 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    {deals.length}
                  </span>
                </h2>
              </div>

              <motion.div
                className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b font-medium text-xs text-gray-600 uppercase tracking-wider">
                  <div className="col-span-4">Promo Details</div>
                  <div className="col-span-2">Valid From</div>
                  <div className="col-span-2">Valid To</div>
                  <div className="col-span-2">Discount</div>
                  <div className="col-span-2 text-center">Status</div>
                </div>

                <div className="divide-y divide-gray-100">
                  <AnimatePresence>
                    {deals.length > 0 ? (
                      deals.map((deal, index) => (
                        <motion.div
                          key={index}
                          className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-blue-50/50 cursor-pointer transition-all duration-300 group"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -50 }}
                          transition={{ delay: index * 0.05, type: "spring" }}
                          whileHover={{
                            y: -2,
                            backgroundColor: "rgba(239, 246, 255, 0.7)",
                          }}
                          onClick={() => {
                            setSelectedDeal(deal);
                            setSelectedDiscount(null);
                            setSelectedServices(dealServiceMap[deal.id] || []);
                            setIsOpen(true);
                          }}
                        >
                          <div className="col-span-4 flex items-center">
                            <div className="bg-blue-100 p-2 rounded-lg mr-3 group-hover:bg-blue-200 transition-colors">
                              <Tag className="text-blue-600" size={16} />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                                {deal.type}
                              </div>
                              <div className="text-sm text-gray-600 mt-1 line-clamp-1">
                                {deal.description}
                              </div>
                            </div>
                          </div>
                          <div className="col-span-2 text-sm text-gray-700 font-medium">
                            {deal.validFrom}
                          </div>
                          <div className="col-span-2 text-sm text-gray-700 font-medium">
                            {deal.validTo}
                          </div>
                          <div className="col-span-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                              {deal.discountValue}
                              {deal.discountType === "percentage"
                                ? "%"
                                : ""}{" "}
                              OFF
                            </span>
                          </div>
                          <div className="col-span-2 flex justify-center">
                            <span
                              className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                                getDealStatus(deal) === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {getDealStatus(deal).charAt(0).toUpperCase() +
                                getDealStatus(deal).slice(1)}
                            </span>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <motion.div
                        className="px-6 py-16 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <div className="bg-blue-100 p-4 rounded-2xl mb-4">
                            <Tag className="w-12 h-12 text-blue-400" />
                          </div>
                          <p className="text-lg font-medium text-gray-500">
                            No promotions yet
                          </p>
                          <p className="text-sm mt-2 text-gray-400 max-w-md">
                            Create special promotions to attract more customers
                            to your beauty services
                          </p>
                          <motion.button
                            onClick={() => handleAddItem("promo")}
                            className="mt-5 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-medium flex items-center space-x-2 shadow-md hover:shadow-lg"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Plus size={16} />
                            <span>Create Your First Promotion</span>
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.section>
          )}

          {/* Discount Section */}
          {activeTab === "discount" && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <div className="bg-green-100 p-2 rounded-lg mr-3">
                    <Percent className="text-green-600" size={20} />
                  </div>
                  Discounts
                  <span className="ml-3 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    {discounts.length}
                  </span>
                </h2>
              </div>

              <motion.div
                className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b font-medium text-xs text-gray-600 uppercase tracking-wider">
                  <div className="col-span-4">Discount Details</div>
                  <div className="col-span-2">Value</div>
                  <div className="col-span-2">Valid From</div>
                  <div className="col-span-2">Valid To</div>
                  <div className="col-span-2 text-center">Status</div>
                </div>

                <div className="divide-y divide-gray-100">
                  <AnimatePresence>
                    {discounts.length > 0 ? (
                      discounts.map((discount, index) => (
                        <motion.div
                          key={index}
                          className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-green-50/50 cursor-pointer transition-all duration-300 group"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -50 }}
                          transition={{ delay: index * 0.05, type: "spring" }}
                          whileHover={{
                            y: -2,
                            backgroundColor: "rgba(240, 253, 244, 0.7)",
                          }}
                          onClick={() => {
                            setSelectedDiscount(discount);
                            setSelectedDeal(null);
                            setSelectedServices(
                              discountServiceMap[discount.id] || []
                            );
                            setIsOpen(true);
                          }}
                        >
                          <div className="col-span-4 flex items-center">
                            <div className="bg-green-100 p-2 rounded-lg mr-3 group-hover:bg-green-200 transition-colors">
                              <Percent className="text-green-600" size={16} />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                                {discount.name}
                              </div>
                              <div className="text-sm text-gray-600 mt-1 line-clamp-1">
                                {discount.description}
                              </div>
                            </div>
                          </div>

                          <div className="col-span-2">
                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r from-green-500 to-green-600 text-white">
                              {discount.value}
                              {discount.type === "percentage"
                                ? "%"
                                : ""}{" "}
                              OFF
                            </span>
                          </div>

                          <div className="col-span-2 text-sm text-gray-700 font-medium">
                            {discount.validFrom || "N/A"}
                          </div>

                          <div className="col-span-2 text-sm text-gray-700 font-medium">
                            {discount.validTo || "N/A"}
                          </div>

                          <div className="col-span-2 flex justify-center">
                            <span
                              className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                                getDiscountStatus(discount) === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {getDiscountStatus(discount)
                                .charAt(0)
                                .toUpperCase() +
                                getDiscountStatus(discount).slice(1)}
                            </span>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <motion.div
                        className="px-6 py-16 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <div className="bg-green-100 p-4 rounded-2xl mb-4">
                            <Percent className="w-12 h-12 text-green-400" />
                          </div>
                          <p className="text-lg font-medium text-gray-500">
                            No discounts yet
                          </p>
                          <p className="text-sm mt-2 text-gray-400 max-w-md">
                            Create discounts to reward your customers and
                            encourage more bookings
                          </p>
                          <motion.button
                            onClick={() => handleAddItem("discount")}
                            className="mt-5 px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 font-medium flex items-center space-x-2 shadow-md hover:shadow-lg"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Percent size={16} />
                            <span>Create Your First Discount</span>
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.section>
          )}

          {activeTab === "bundle" && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <div className="bg-purple-100 p-2 rounded-lg mr-3">
                    <Package className="text-purple-600" size={20} />
                  </div>
                  Bundles
                  <span className="ml-3 text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                    {bundles.length}
                  </span>
                </h2>
              </div>

              <motion.div
                className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b font-medium text-xs text-gray-600 uppercase tracking-wider">
                  <div className="col-span-4">Bundle Details</div>
                  <div className="col-span-2">Price</div>
                  <div className="col-span-2">Valid From</div>
                  <div className="col-span-2">Valid To</div>
                  <div className="col-span-2 text-center">Status</div>
                </div>

                <div className="divide-y divide-gray-100">
                  <AnimatePresence>
                    {bundles.length > 0 ? (
                      bundles.map((bundle, index) => (
                        <motion.div
                          key={bundle.bundle_id || `bundle-${index}`}
                          className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-purple-50/50 cursor-pointer transition-all duration-300 group"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -50 }}
                          transition={{ delay: index * 0.05, type: "spring" }}
                          whileHover={{
                            y: -2,
                            backgroundColor: "rgba(243, 232, 255, 0.7)",
                          }}
                          onClick={() => handleViewBundle(bundle)}
                        >
                          <div className="col-span-4 flex items-center">
                            <div className="bg-purple-100 p-2 rounded-lg mr-3 group-hover:bg-purple-200 transition-colors">
                              <Package className="text-purple-600" size={16} />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                                {bundle.name}
                              </div>
                              <div className="text-sm text-gray-600 mt-1 line-clamp-1">
                                {bundle.description}
                              </div>
                            </div>
                          </div>
                          <div className="col-span-2 text-sm text-gray-700 font-medium">
                            ₱{parseFloat(bundle.price).toFixed(2)}
                          </div>
                          <div className="col-span-2 text-sm text-gray-700 font-medium">
                            {bundle.validFrom || "N/A"}
                          </div>
                          <div className="col-span-2 text-sm text-gray-700 font-medium">
                            {bundle.validTo || "N/A"}
                          </div>

                          <div className="col-span-2 flex justify-center">
                            <span
                              className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                                getBundleStatus(bundle) === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {getBundleStatus(bundle).charAt(0).toUpperCase() +
                                getBundleStatus(bundle).slice(1)}
                            </span>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <motion.div
                        className="px-6 py-16 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <div className="bg-purple-100 p-4 rounded-2xl mb-4">
                            <Package className="w-12 h-12 text-purple-400" />
                          </div>
                          <p className="text-lg font-medium text-gray-500">
                            No bundles yet
                          </p>
                          <p className="text-sm mt-2 text-gray-400 max-w-md">
                            Create service bundles to offer combined services at
                            special prices
                          </p>
                          <motion.button
                            onClick={() => handleAddBundle()}
                            className="mt-5 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 font-medium flex items-center space-x-2 shadow-md hover:shadow-lg"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Plus size={16} />
                            <span>Create Your First Bundle</span>
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.section>
          )}
        </main>
      </div>

      {/* Main Details Modal */}
<Transition appear show={isOpen} as={Fragment}>
  <Dialog
    as="div"
    className="relative z-10"
    onClose={() => setIsOpen(false)}
  >
    <Transition.Child
      as={Fragment}
      enter="ease-out duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="ease-in duration-200"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="fixed inset-0 bg-black bg-opacity-25" />
    </Transition.Child>

    <div className="fixed inset-0 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <Dialog.Title
                  as="h3"
                  className="text-xl font-bold leading-6 text-gray-900"
                >
                  {selectedDeal ? "Promotion Details" : selectedDiscount ? "Discount Details" : "Details"}
                </Dialog.Title>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedDeal ? "Special promotion information" : selectedDiscount ? "Discount group details" : "Complete information"}
                </p>
              </div>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Content Area */}
            <div className="mt-6 space-y-6">
              {/* Basic Info Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {/* Name & Description */}
                  <div className={`rounded-lg p-4 ${selectedDeal ? 'bg-blue-50' : 'bg-green-50'}`}>
                    <h4 className="font-medium text-gray-900 text-sm uppercase tracking-wide">Name</h4>
                    <p className="text-lg font-semibold mt-1">
                      <span className={selectedDeal ? 'text-blue-700' : 'text-green-700'}>
                        {selectedDeal?.name || selectedDiscount?.name || "N/A"}
                      </span>
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                      {selectedDeal?.description || selectedDiscount?.description || "N/A"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">Status</h4>
                      <span
                        className={`mt-1 px-3 py-1.5 rounded-full text-xs font-medium ${
                          getCurrentStatus() === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {getCurrentStatus() ? getCurrentStatus().charAt(0).toUpperCase() + getCurrentStatus().slice(1) : "N/A"}
                      </span>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">Type</h4>
                      <p className="text-sm text-gray-600 mt-1 capitalize">
                        {selectedDeal ? "Promotion" : selectedDiscount ? "Discount" : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Discount Value */}
                  <div className={`rounded-lg p-4 text-white ${selectedDeal ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-green-500 to-green-600'}`}>
                    <h4 className="font-medium text-white/90 text-sm">Discount Value</h4>
                    <p className="text-3xl font-bold mt-1">
                      {selectedDeal?.discountValue || selectedDiscount?.value || "0"}
                      {selectedDeal?.discountType === "percentage" || selectedDiscount?.discountType === "percentage" ? "%" : ""} OFF
                    </p>
                    <p className="text-sm text-white/80 mt-1 capitalize">
                      {selectedDeal?.discountType || selectedDiscount?.discountType || "Fixed"} Discount
                    </p>
                  </div>

                  {/* Validity Period */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">Valid From</h4>
                      <p className="text-sm text-gray-800 mt-1 font-medium">
                        {selectedDeal?.validFrom || selectedDiscount?.validFrom || "No start date"}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">Valid To</h4>
                      <p className="text-sm text-gray-800 mt-1 font-medium">
                        {selectedDeal?.validTo || selectedDiscount?.validTo || "No expiration"}
                      </p>
                    </div>
                  </div>

                  {/* Additional Info */}
                  {selectedDeal && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <h4 className="font-medium text-blue-900 text-sm">Promotion Type</h4>
                      <p className="text-sm text-blue-700 mt-1 capitalize">
                        {selectedDeal.promoType || "Standard"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Included Services Section - For Promos */}
              {selectedDeal && (
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <ClipboardList className="w-5 h-5 mr-2 text-blue-600" />
                    Included Services ({selectedServices.length})
                  </h4>
                  
                  {selectedServices.length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                      {selectedServices.map((service, index) => {
                        const originalPrice = parseFloat(service.originalPrice) || 0;
                        const discountValue = parseFloat(selectedDeal.discountValue) || 0;
                        const discountedPrice = selectedDeal.discountType === "percentage" 
                          ? originalPrice * (1 - discountValue / 100)
                          : originalPrice - discountValue;

                        return (
                          <motion.div
                            key={service.service_id || index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{service.name}</p>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  {service.category || 'Uncategorized'}
                                </span>
                                {service.duration && (
                                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                    {service.duration} mins
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500 line-through">
                                  ₱{originalPrice.toFixed(2)}
                                </span>
                                <span className="text-sm font-semibold text-green-600">
                                  ₱{discountedPrice.toFixed(2)}
                                </span>
                              </div>
                              <p className="text-xs text-red-500 mt-1">
                                Save ₱{(originalPrice - discountedPrice).toFixed(2)}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No services included in this promotion</p>
                    </div>
                  )}

                  {/* Savings Summary for Promos */}
                  {selectedServices.length > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-blue-900 text-sm">Total Original Value</h4>
                          <p className="text-lg font-bold text-gray-700">
                            ₱{selectedServices.reduce((total, service) => total + (parseFloat(service.originalPrice) || 0), 0).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-900 text-sm">Total Savings</h4>
                          <p className="text-lg font-bold text-green-600">
                            ₱{selectedServices.reduce((total, service) => {
                              const originalPrice = parseFloat(service.originalPrice) || 0;
                              const discountValue = parseFloat(selectedDeal.discountValue) || 0;
                              const discountedPrice = selectedDeal.discountType === "percentage" 
                                ? originalPrice * (1 - discountValue / 100)
                                : originalPrice - discountValue;
                              return total + (originalPrice - discountedPrice);
                            }, 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Service Coverage - For Discounts */}
              {selectedDiscount && selectedServices.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Tag className="w-5 h-5 mr-2 text-green-600" />
                    Applicable Services ({selectedServices.length})
                  </h4>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {selectedServices.map((service, index) => (
                      <motion.div
                        key={service.service_id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-lg hover:border-green-300 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{service.name}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {service.category || 'Uncategorized'}
                            </span>
                            {service.duration && (
                              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                                {service.duration} mins
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-gray-700 ml-4">
                          ₱{parseFloat(service.originalPrice || service.price || 0).toFixed(2)}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Dialog.Panel>
        </Transition.Child>
      </div>
    </div>
  </Dialog>
</Transition>

      {/* Bundle Details Modal */}
      <Transition appear show={isOpen && selectedBundle} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => {
            setIsOpen(false);
            setSelectedBundle(null);
          }}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <Dialog.Title
                        as="h3"
                        className="text-xl font-bold leading-6 text-gray-900"
                      >
                        Bundle Details
                      </Dialog.Title>
                      <p className="text-sm text-gray-500 mt-1">
                        Complete bundle information and included services
                      </p>
                    </div>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500 transition-colors"
                      onClick={() => {
                        setIsOpen(false);
                        setSelectedBundle(null);
                      }}
                    >
                      <XIcon className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Bundle Content */}
                  {selectedBundle && (
                    <div className="mt-6 space-y-6">
                      {/* Basic Info Section */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="bg-purple-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 text-sm uppercase tracking-wide">
                              Bundle Name
                            </h4>
                            <p className="text-lg font-semibold text-purple-700 mt-1">
                              {selectedBundle.name}
                            </p>
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">
                              Description
                            </h4>
                            <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                              {selectedBundle.description}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-gray-900 text-sm">
                                Status
                              </h4>
                              <span
                                className={`mt-1 px-3 py-1.5 rounded-full text-xs font-medium ${
                                  selectedBundle.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {selectedBundle.status.charAt(0).toUpperCase() +
                                  selectedBundle.status.slice(1)}
                              </span>
                            </div>

                            <div>
                              <h4 className="font-medium text-gray-900 text-sm">
                                Bundle ID
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                #{selectedBundle.id}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-3 text-white">
                            <h4 className="font-medium text-white/90 text-sm">
                              Bundle Price
                            </h4>
                            <p className="text-3xl font-bold mt-1">
                              ₱{parseFloat(selectedBundle.price).toFixed(2)}
                            </p>
                            <p className="text-sm text-white/80 mt-1">
                              One-time payment
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-gray-900 text-sm">
                                Valid From
                              </h4>
                              <p className="text-sm text-gray-800 mt-1 font-medium">
                                {selectedBundle.validFrom
                                  ? new Date(
                                      selectedBundle.validFrom
                                    ).toLocaleDateString()
                                  : "No start date"}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 text-sm">
                                Valid To
                              </h4>
                              <p className="text-sm text-gray-800 mt-1 font-medium">
                                {selectedBundle.validTo
                                  ? new Date(
                                      selectedBundle.validTo
                                    ).toLocaleDateString()
                                  : "No expiration"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Included Services Section */}
                      <div className="pt-4 border-t border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <Package className="w-5 h-5 mr-2 text-purple-600" />
                          Included Services (
                          {selectedBundle.services?.length || 0})
                        </h4>

                        {selectedBundle.services &&
                        selectedBundle.services.length > 0 ? (
                          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                            {selectedBundle.services.map((service, index) => (
                              <motion.div
                                key={service.service_id || `service-${index}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
                              >
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">
                                    {service.name}
                                  </p>
                                  <div className="flex items-center space-x-4 mt-1">
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                      {service.category || "Uncategorized"}
                                    </span>
                                    {service.duration && (
                                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                        {service.duration} mins
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span className="text-sm font-semibold text-gray-700 ml-4">
                                  ₱{parseFloat(service.price).toFixed(2)}
                                </span>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500">
                              No services included in this bundle
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Bundle Summary */}
                      {selectedBundle.services &&
                        selectedBundle.services.length > 0 && (
                          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold text-purple-900 text-sm">
                                  Total Individual Value
                                </h4>
                                <p className="text-lg font-bold text-gray-700">
                                  ₱
                                  {selectedBundle.services
                                    .reduce(
                                      (total, service) =>
                                        total + parseFloat(service.price),
                                      0
                                    )
                                    .toFixed(2)}
                                </p>
                              </div>
                              <div>
                                <h4 className="font-semibold text-purple-900 text-sm">
                                  You Save
                                </h4>
                                <p className="text-lg font-bold text-green-600">
                                  ₱
                                  {(
                                    selectedBundle.services.reduce(
                                      (total, service) =>
                                        total + parseFloat(service.price),
                                      0
                                    ) - parseFloat(selectedBundle.price)
                                  ).toFixed(2)}
                                </p>
                              </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-purple-200">
                              <div className="flex justify-between items-center">
                                <span className="font-semibold text-purple-900">
                                  Savings Percentage
                                </span>
                                <span className="text-lg font-bold text-purple-700">
                                  {(
                                    ((selectedBundle.services.reduce(
                                      (total, service) =>
                                        total + parseFloat(service.price),
                                      0
                                    ) -
                                      parseFloat(selectedBundle.price)) /
                                      selectedBundle.services.reduce(
                                        (total, service) =>
                                          total + parseFloat(service.price),
                                        0
                                      )) *
                                    100
                                  ).toFixed(1)}
                                  %
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <AnimatePresence>
        {isAddModalOpen && newItem.type === "promo" && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded-lg shadow-xl w-[600px] max-h-[85vh] overflow-y-auto"
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="text-xl font-bold mb-6">Add Promo</h2>
              <form onSubmit={handleAddItemSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  {/* Promo Type */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Promo Type*
                    </label>
                    <input
                      type="text"
                      value={newItem.promoType}
                      onChange={(e) =>
                        setNewItem({ ...newItem, promoType: e.target.value })
                      }
                      className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300"
                      required
                    />
                  </div>

                  {/* Name */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Name*
                    </label>
                    <input
                      type="text"
                      value={newItem.name}
                      onChange={(e) =>
                        setNewItem({ ...newItem, name: e.target.value })
                      }
                      className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Description
                    </label>
                    <textarea
                      value={newItem.description}
                      onChange={(e) =>
                        setNewItem({ ...newItem, description: e.target.value })
                      }
                      className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300 h-20 resize-none"
                    />
                  </div>

                  {/* Valid Dates */}
                  <input
                    type="date"
                    value={selectedDeal?.validFrom || ""}
                    onChange={(e) =>
                      setSelectedDeal((prev) => ({
                        ...prev,
                        validFrom: e.target.value,
                      }))
                    }
                    className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300"
                  />

                  <input
                    type="date"
                    value={selectedDeal?.validTo || ""}
                    onChange={(e) =>
                      setSelectedDeal((prev) => ({
                        ...prev,
                        validTo: e.target.value,
                      }))
                    }
                    className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300"
                  />

                  {/* Discount Type */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Discount Type
                    </label>
                    <select
                      value={newItem.discountType}
                      onChange={(e) =>
                        setNewItem({ ...newItem, discountType: e.target.value })
                      }
                      className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>

                  {/* Discount Value */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Discount Value
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newItem.value}
                      onChange={(e) =>
                        setNewItem({ ...newItem, value: e.target.value })
                      }
                      className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300"
                      required
                    />
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Status
                    </label>
                    <select
                      value={newItem.status}
                      onChange={(e) =>
                        setNewItem({ ...newItem, status: e.target.value })
                      }
                      className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#5BBF5B] hover:bg-[#4CAF4C] text-white rounded-lg"
                  >
                    Save
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Promo Modal */}
      {isPromoModalOpen && selectedDeal && (
        <AnimatePresence>
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded-xl shadow-xl w-[700px] max-h-[85vh] overflow-y-auto"
              variants={slideUp}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Edit Promotion</h2>
                <button
                  onClick={() => setIsPromoModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSaveEditPromo}>
                <div className="grid grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Promo Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Promo Type*
                      </label>
                      <input
                        type="text"
                        value={selectedDeal.type}
                        onChange={(e) =>
                          setSelectedDeal({
                            ...selectedDeal,
                            type: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="e.g., Membership, Beauty Deals, Skincare"
                        required
                      />
                    </div>

                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name*
                      </label>
                      <input
                        type="text"
                        value={selectedDeal.name}
                        onChange={(e) =>
                          setSelectedDeal({
                            ...selectedDeal,
                            name: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={selectedDeal.description}
                        onChange={(e) =>
                          setSelectedDeal({
                            ...selectedDeal,
                            description: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg h-20 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">

                    {/* Date Range */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Validity Period
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            From
                          </label>
                          <input
                            type="date"
                            value={selectedDeal.validFrom || ""}
                            onChange={(e) =>
                              setSelectedDeal({
                                ...selectedDeal,
                                validFrom: e.target.value,
                              })
                            }
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            To
                          </label>
                          <input
                            type="date"
                            value={selectedDeal.validTo || ""}
                            onChange={(e) =>
                              setSelectedDeal({
                                ...selectedDeal,
                                validTo: e.target.value,
                              })
                            }
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Discount Type and Value */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Discount Type
                        </label>
                        <select
                          value={selectedDeal.discountType || "fixed"}
                          onChange={(e) =>
                            setSelectedDeal({
                              ...selectedDeal,
                              discountType: e.target.value,
                            })
                          }
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        >
                          <option value="fixed">Fixed Amount</option>
                          <option value="percentage">Percentage</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Discount Value*
                        </label>
                        <div className="relative">
                          {selectedDeal.discountType === "percentage" ? (
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                              %
                            </span>
                          ) : (
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                              ₱
                            </span>
                          )}
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max={
                              selectedDeal.discountType === "percentage"
                                ? "100"
                                : ""
                            }
                            value={selectedDeal.discountedPrice || ""}
                            onChange={(e) =>
                              setSelectedDeal({
                                ...selectedDeal,
                                discountedPrice: e.target.value,
                              })
                            }
                            className={`w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                              selectedDeal.discountType === "percentage"
                                ? "pr-8"
                                : "pl-8"
                            }`}
                            placeholder={
                              selectedDeal.discountType === "percentage"
                                ? "0-100"
                                : "0.00"
                            }
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Services Section - Full Width */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Included Services
                  </label>

                  {/* Search */}
                  <input
                    type="text"
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />

                  {/* All Services List (checkboxes) */}
                  <div className="max-h-[200px] overflow-y-auto border border-gray-300 rounded-lg p-3 bg-gray-50">
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
                          key={service.service_id}
                          className="flex items-center space-x-3 py-2 px-2 hover:bg-white rounded"
                        >
                          <input
                            type="checkbox"
                            checked={selectedServices.some(
                              (s) => s.service_id === service.service_id
                            )}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedServices((prev) => [
                                  ...prev,
                                  service,
                                ]);
                              } else {
                                setSelectedServices((prev) =>
                                  prev.filter(
                                    (s) => s.service_id !== service.service_id
                                  )
                                );
                              }
                            }}
                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-800">
                              {service.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {service.category}
                            </div>
                          </div>
                        </label>
                      ))}

                    {/* Empty search */}
                    {allServices.filter(
                      (service) =>
                        service.name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        service.category
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase())
                    ).length === 0 && (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        No services found matching your search
                      </div>
                    )}
                  </div>

                  {/* ✅ Live Included Services Table */}
                  <div className="mt-4 border border-gray-200 rounded-lg">
                    {selectedServices.length > 0 ? (
                      <div className="max-h-60 overflow-y-auto">
                        {" "}
                        {/* ✅ scroll container */}
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 bg-gray-100 z-10">
                            <tr className="text-left">
                              <th className="px-3 py-2">Service Name</th>
                              <th className="px-3 py-2">Category</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedServices.map((s) => (
                              <tr key={s.service_id} className="border-t">
                                <td className="px-3 py-2">{s.name}</td>
                                <td className="px-3 py-2">{s.category}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-gray-500 text-sm px-3 py-2">
                        No services included yet.
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                  <motion.button
                    type="button"
                    onClick={() => setIsPromoModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Save Changes
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Add Discount Modal */}
      <AnimatePresence>
        {isAddModalOpen && newItem.type === "discount" && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded-lg shadow-xl w-[600px] max-h-[85vh] overflow-y-auto"
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="text-xl font-bold mb-6">Add Discount</h2>
              <form onSubmit={handleAddItemSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Name*
                    </label>
                    <input
                      type="text"
                      value={newItem.name}
                      onChange={(e) =>
                        setNewItem({ ...newItem, name: e.target.value })
                      }
                      className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Description
                    </label>
                    <textarea
                      value={newItem.description}
                      onChange={(e) =>
                        setNewItem({ ...newItem, description: e.target.value })
                      }
                      className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300 h-20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Discount Type
                      </label>
                      <select
                        value={newItem.discountType}
                        onChange={(e) =>
                          setNewItem({
                            ...newItem,
                            discountType: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300"
                      >
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed Amount</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Value*
                      </label>
                      <input
                        type="text"
                        value={newItem.value}
                        onChange={(e) =>
                          setNewItem({ ...newItem, value: e.target.value })
                        }
                        className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300"
                        placeholder={
                          newItem.discountType === "percentage"
                            ? "e.g. 10%"
                            : "e.g. $50"
                        }
                        required
                      />
                    </div>
                  </div>
                  {/* Validity Period */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Valid From
                      </label>
                      <input
                        type="date"
                        value={newItem.validFrom}
                        onChange={(e) =>
                          setNewItem({ ...newItem, validFrom: e.target.value })
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Valid To
                      </label>
                      <input
                        type="date"
                        value={newItem.validTo}
                        onChange={(e) =>
                          setNewItem({ ...newItem, validTo: e.target.value })
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                      onClick={() => setIsAddModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#5BBF5B] hover:bg-[#4CAF4C] text-white rounded-lg"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Discount Modal */}
      {isDiscountModalOpen && selectedDiscount && (
        <AnimatePresence>
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              variants={slideUp}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-bold">Edit Discount</h2>
                <button
                  onClick={() => setIsDiscountModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveEditDiscount} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name*
                      </label>
                      <input
                        type="text"
                        value={selectedDiscount.name}
                        onChange={(e) =>
                          setSelectedDiscount({
                            ...selectedDiscount,
                            name: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={selectedDiscount.description}
                        onChange={(e) =>
                          setSelectedDiscount({
                            ...selectedDiscount,
                            description: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg h-28 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Discount Type + Value */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Discount Type
                        </label>
                        <select
                          value={selectedDiscount.discountType}
                          onChange={(e) =>
                            setSelectedDiscount({
                              ...selectedDiscount,
                              discountType: e.target.value,
                            })
                          }
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        >
                          <option value="percentage">Percentage</option>
                          <option value="fixed">Fixed Amount</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Value*
                        </label>
                        <div className="relative">
                          {selectedDiscount.discountType === "percentage" ? (
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                              %
                            </span>
                          ) : (
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                              ₱
                            </span>
                          )}
                          <input
                            type="number"
                            value={selectedDiscount.value}
                            onChange={(e) =>
                              setSelectedDiscount({
                                ...selectedDiscount,
                                value: e.target.value,
                              })
                            }
                            className={`w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                              selectedDiscount.discountType === "percentage"
                                ? "pr-8"
                                : "pl-8"
                            }`}
                            placeholder={
                              selectedDiscount.discountType === "percentage"
                                ? "10"
                                : "50"
                            }
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Validity Period */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Valid From
                        </label>
                        <input
                          type="date"
                          value={selectedDiscount.valid_from || ""}
                          onChange={(e) =>
                            setSelectedDiscount({
                              ...selectedDiscount,
                              valid_from: e.target.value,
                            })
                          }
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Valid To
                        </label>
                        <input
                          type="date"
                          value={selectedDiscount.valid_to || ""}
                          onChange={(e) =>
                            setSelectedDiscount({
                              ...selectedDiscount,
                              valid_to: e.target.value,
                            })
                          }
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <motion.button
                    type="button"
                    onClick={() => setIsDiscountModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Save Changes
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Bundle Modal */}
      <AnimatePresence>
        {isAddModalOpen && newItem.type === "bundle" && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded-lg shadow-xl w-[650px] max-h-[85vh] overflow-y-auto"
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="text-xl font-bold mb-6">Add Bundle</h2>

              <form onSubmit={handleAddBundleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Name*
                    </label>
                    <input
                      type="text"
                      value={newItem.name}
                      onChange={(e) =>
                        setNewItem({ ...newItem, name: e.target.value })
                      }
                      className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Description
                    </label>
                    <textarea
                      value={newItem.description}
                      onChange={(e) =>
                        setNewItem({ ...newItem, description: e.target.value })
                      }
                      className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300 h-20 resize-none"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Price*
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newItem.price}
                      onChange={(e) =>
                        setNewItem({ ...newItem, price: e.target.value })
                      }
                      className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300"
                      required
                    />
                  </div>

                  {/* Valid Dates */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Valid From
                    </label>
                    <input
                      type="date"
                      value={newItem.validFrom}
                      onChange={(e) =>
                        setNewItem({ ...newItem, validFrom: e.target.value })
                      }
                      className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Valid To
                    </label>
                    <input
                      type="date"
                      value={newItem.validTo}
                      onChange={(e) =>
                        setNewItem({ ...newItem, validTo: e.target.value })
                      }
                      className="w-full p-2 border rounded-lg bg-gray-50 border-gray-300"
                    />
                  </div>
                </div>

                {/* Services Section */}
                <div className="mt-6">
                  <label className="block text-sm font-medium mb-2">
                    Included Services
                  </label>

                  {/* Search */}
                  <input
                    type="text"
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 mb-3 border border-gray-300 rounded-lg bg-gray-50"
                  />

                  {/* Service checkboxes */}
                  <div className="max-h-[200px] overflow-y-auto border border-gray-300 rounded-lg p-3 bg-gray-50">
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
                          key={service.service_id}
                          className="flex items-center space-x-3 py-2 px-2 hover:bg-white rounded"
                        >
                          <input
                            type="checkbox"
                            checked={newItem.services.includes(
                              service.service_id
                            )}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewItem({
                                  ...newItem,
                                  services: [
                                    ...newItem.services,
                                    service.service_id,
                                  ],
                                });
                              } else {
                                setNewItem({
                                  ...newItem,
                                  services: newItem.services.filter(
                                    (id) => id !== service.service_id
                                  ),
                                });
                              }
                            }}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-800">
                              {service.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {service.category}
                            </div>
                          </div>
                        </label>
                      ))}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                  >
                    Save
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isBundleModalOpen && selectedBundle && (
        <AnimatePresence>
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded-xl shadow-xl w-[700px] max-h-[85vh] overflow-y-auto"
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Edit Bundle</h2>
                <button
                  onClick={() => setIsBundleModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSaveEditBundle}>
                <div className="grid grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Name*
                    </label>
                    <input
                      type="text"
                      value={selectedBundle.name}
                      onChange={(e) =>
                        setSelectedBundle({
                          ...selectedBundle,
                          name: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Description
                    </label>
                    <textarea
                      value={selectedBundle.description}
                      onChange={(e) =>
                        setSelectedBundle({
                          ...selectedBundle,
                          description: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg h-20"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Price*
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={selectedBundle.price}
                      onChange={(e) =>
                        setSelectedBundle({
                          ...selectedBundle,
                          price: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>

                  {/* Valid Dates */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Valid From
                    </label>
                    <input
                      type="date"
                      value={selectedBundle.validFrom || ""}
                      onChange={(e) =>
                        setSelectedBundle({
                          ...selectedBundle,
                          validFrom: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Valid To
                    </label>
                    <input
                      type="date"
                      value={selectedBundle.validTo || ""}
                      onChange={(e) =>
                        setSelectedBundle({
                          ...selectedBundle,
                          validTo: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                {/* Included Services */}
                <div className="mt-6">
                  <label className="block text-sm font-medium mb-2">
                    Included Services
                  </label>

                  {/* 🔍 Search Input */}
                  <input
                    type="text"
                    placeholder="Search services..."
                    value={serviceSearchTerm}
                    onChange={(e) => setServiceSearchTerm(e.target.value)}
                    className="w-full mb-3 p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />

                  {/* Services List */}
                  <div className="max-h-[200px] overflow-y-auto border border-gray-300 rounded-lg p-3 bg-gray-50">
                    {allServices
                      .filter((service) => {
                        const term = serviceSearchTerm.toLowerCase();
                        return (
                          service.name.toLowerCase().includes(term) ||
                          service.category.toLowerCase().includes(term)
                        );
                      })
                      .map((service) => (
                        <label
                          key={service.service_id}
                          className="flex items-center space-x-3 py-2 px-2 hover:bg-white rounded transition"
                        >
                          <input
                            type="checkbox"
                            checked={selectedBundle.services.includes(
                              service.service_id
                            )}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedBundle({
                                  ...selectedBundle,
                                  services: [
                                    ...selectedBundle.services,
                                    service.service_id,
                                  ],
                                });
                              } else {
                                setSelectedBundle({
                                  ...selectedBundle,
                                  services: selectedBundle.services.filter(
                                    (id) => id !== service.service_id
                                  ),
                                });
                              }
                            }}
                            className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-800">
                              {service.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {service.category}
                            </div>
                          </div>
                        </label>
                      ))}

                    {/* If no results */}
                    {allServices.filter((service) => {
                      const term = serviceSearchTerm.toLowerCase();
                      return (
                        service.name.toLowerCase().includes(term) ||
                        service.category.toLowerCase().includes(term)
                      );
                    }).length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No matching services found.
                      </p>
                    )}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                    onClick={() => setIsBundleModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
