"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Menu } from "@headlessui/react";
import {
  BarChart,
  BarChart3,
  Home,
  Users,
  FileText,
  CreditCard,
  Package,
  Layers,
  Star,
  Search,
  X,
  Phone,
  Mail,
  Settings,
  LogOut,
  Plus,
  User,
  UserPlus,
  Tag,
  Activity,
  ClipboardList,
  UserX,
  BarChart2,
  Calendar,
  Edit,
  Eye,
  RefreshCw,
  UserCheck,
  ChevronLeft,
  ChevronsLeft,
  ChevronRight,
  ChevronsRight,
  ChevronDown,
  Leaf,
} from "lucide-react";

export default function CustomersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [formData, setFormData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [activeView, setActiveView] = useState("overview");
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [selectedType, setSelectedType] = useState("basic");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [currentPage, setCurrentPage] = useState(1);
  const [customersPerPage] = useState(10);
  const [logsLoading, setLogsLoading] = useState(false);
  const [customerMemberships, setCustomerMemberships] = useState([]);
  const [isRenewing, setIsRenewing] = useState(false);
  const [membershipLogs, setMembershipLogs] = useState([]);
  const [membershipTemplates, setMembershipTemplates] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
  const fetchCurrentUser = async () => {
    try {
      let finalUserData = null;

      console.log("=== Starting user fetch ===");

      // First, try to fetch as regular user
      const currentUserResponse = await fetch(
        "http://localhost/API/branches.php?action=user",
        {
          credentials: "include",
        }
      );

      console.log("User endpoint status:", currentUserResponse.status);

      if (currentUserResponse.ok) {
        const currentUserData = await currentUserResponse.json();
        console.log("User endpoint response:", currentUserData);
        
        if (!currentUserData.error) {
          console.log("✅ User data found via user endpoint");
          finalUserData = currentUserData;
        } else {
          console.log("❌ User endpoint returned error:", currentUserData.error);
        }
      }

      // Always try admin endpoint if we didn't get valid data from user endpoint
      if (!finalUserData) {
        console.log("🔄 Trying admin endpoint...");
        const adminResponse = await fetch(
          "http://localhost/API/branches.php?action=admin",
          {
            credentials: "include",
          }
        );

        console.log("Admin endpoint status:", adminResponse.status);

        if (adminResponse.ok) {
          const adminData = await adminResponse.json();
          console.log("Admin endpoint response:", adminData);
          
          if (!adminData.error) {
            console.log("✅ Admin data found via admin endpoint");
            finalUserData = adminData;
          } else {
            console.log("❌ Admin endpoint returned error:", adminData.error);
          }
        }
      }

      console.log("=== Final decision ===");
      console.log("Final user data to set:", finalUserData);

      if (finalUserData) {
        setCurrentUser(finalUserData);
        localStorage.setItem("user", JSON.stringify(finalUserData));
        console.log("🎯 User data successfully set");
      } else {
        console.log("⚠️ No user data available from API endpoints");
      }

    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  fetchCurrentUser();
}, []);

  // Helper function to check if customer should show new member badge
  const shouldShowNewMemberBadge = (customer) => {
    try {
      const stored = localStorage.getItem(`newMember:${customer.id}`);
      if (!stored) return false;

      const parsed = JSON.parse(stored);
      const storedMembershipId = parsed?.membershipId;
      const currentMembershipId = customer.membership_id;

      // Only remove the badge if membership has been renewed (different membership ID)
      if (
        storedMembershipId &&
        currentMembershipId &&
        storedMembershipId !== currentMembershipId &&
        currentMembershipId !== null &&
        currentMembershipId !== undefined
      ) {
        // Membership renewed - remove flag and don't show badge
        localStorage.removeItem(`newMember:${customer.id}`);
        return false;
      }

      // Show badge if flag exists and hasn't been renewed
      return true;
    } catch (_) {
      return false;
    }
  };

  // Membership-related states
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
  const [selectedForMembership, setSelectedForMembership] = useState(null);
  const [membershipForm, setMembershipForm] = useState({
    type: "basic",
    name: "Basic",
    fee: 3000,
    consumable: 5000,
    paymentMethod: "Cash",
  });

  const [newCustomer, setNewCustomer] = useState({
    name: "",
    contact: "",
    email: "",
    address: "",
    membership: "None",
    customerId: "",
    birthday: "",
  });

  const [renewMembership, setRenewMembership] = useState({
    type: "",
    price: "",
    consumable_amount: "",
    valid_until: "",
    no_expiration: false,
  });

  useEffect(() => {
    const fetchMembershipTemplates = async () => {
      try {
        const res = await fetch("http://localhost/API/memberships.php");
        const data = await res.json();
        setMembershipTemplates(data);
      } catch (error) {
        console.error("Failed to fetch memberships:", error);
      }
    };

    fetchMembershipTemplates();
  }, []);

  useEffect(() => {
    fetchCustomers(activeTab);
  }, [activeTab]);

  const fetchCustomers = async (filter = "all") => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `http://localhost/API/customers.php?filter=${filter}`
      );
      if (!response.ok) throw new Error("Failed to fetch customers");
      const data = await response.json();

      // Decorate with persisted "new member" flags using helper function
      const decorated = Array.isArray(data)
        ? data.map((c) => {
            const shouldShowBadge = shouldShowNewMemberBadge(c);
            if (!shouldShowBadge) return c;

            // Get stored data for badge type
            try {
              const stored = localStorage.getItem(`newMember:${c.id}`);
              const parsed = JSON.parse(stored);

              return {
                ...c,
                isNewMember: true,
                newMemberType:
                  parsed?.type ||
                  (c.membership_status
                    ? String(c.membership_status).toLowerCase()
                    : undefined),
              };
            } catch (_) {
              return c;
            }
          })
        : data;

      setCustomers(decorated);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomerDetails = async (customerId) => {
    setIsLoadingDetails(true);
    try {
      const res = await fetch(
        `http://localhost/API/customers.php?customerId=${customerId}`
      );
      const data = await res.json();

      // Make sure to include all expected properties in the result
      setSelectedCustomer({
        id: data.id,
        name: data.name,
        contact: data.contact,
        email: data.email,
        address: data.address,
        birthday: data.birthday,
        customerId: data.customerId,
        membership: data.membership || "None",
        membershipDetails: data.membershipDetails || null,
        transactions: data.transactions || [],
      });
    } catch (error) {
      console.error("Error fetching customer details:", error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const fetchMembershipLogs = async (filter = "all") => {
    setLogsLoading(true);
    try {
      const response = await fetch(
        `http://localhost/API/membership_logs.php?filter=${filter}`
      );
      if (!response.ok) throw new Error("Failed to fetch membership logs");
      const data = await response.json();
      setMembershipLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to load membership logs.");
      console.error(error);
    } finally {
      setLogsLoading(false);
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    if (activeTab === "all") return true;
    if (activeTab === "member") return customer.membership_status !== "None";
    if (activeTab === "nonMember") return customer.membership_status === "None";
    return true;
  });

  const handleRenewMembership = async (
  customerId,
  type,
  payment,
  renewMembership
) => {
  try {
    console.log("Renewing membership with:", {
      customerId,
      type,
      payment,
      renewMembership,
    });

    const { price, consumable_amount, valid_until, no_expiration } =
      renewMembership;

    // Fetch the latest membership
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
      const customerMembershipHistory = customerMemberships
        .filter((m) => m.customer_id === customerId)
        .sort(
          (a, b) =>
            new Date(b.date_registered).getTime() -
            new Date(a.date_registered).getTime()
        );

      currentMembership = customerMembershipHistory[0];
    }

    // If no current membership, create instead of renew
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
          price = 5000;
        } else if (type === "pro") {
          coverage = 10000;
          price = 10000;
        } else if (type === "promo") {
          coverage = parseFloat(consumable_amount || 0);
          price = parseFloat(price || 0);
        }

        if (!expireDate && type !== "promo") {
          const today = new Date();
          today.setMonth(today.getMonth() + (type === "pro" ? 2 : 1));
          expireDate = today.toISOString().split("T")[0];
        }

        // Use consistent user ID and branch ID fields
        const userId = currentUser?.id || currentUser?.user_id || null;
        const branchId = currentUser?.branch_id || null;
        const userName = currentUser?.name || "Unknown User";

        const payload = {
          customer_id: customerId,
          action: "renew",
          type,
          coverage,
          price,
          expire_date: expireDate,
          payment_method: payment,
          branch_id: branchId,
          performed_by: userId,
          performed_by_name: userName,
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

    // ✅ Proceed with renewal setup (no balance check anymore)
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

    if (type !== "promo") {
      const today = new Date();
      today.setMonth(today.getMonth() + (type === "pro" ? 2 : 1));
      expireDate = today.toISOString().split("T")[0];
    }

    const membershipId = currentMembership.id;
    if (!membershipId) {
      toast.error("❌ Cannot determine membership ID for renewal");
      console.error("Current membership object:", currentMembership);
      return;
    }

    // Use consistent user ID and branch ID fields
    const userId = currentUser?.id || currentUser?.user_id || null;
    const branchId = currentUser?.branch_id || null;
    const userName = currentUser?.name || "Unknown User";

    const payload = {
      customer_id: customerId,
      membership_id: membershipId,
      action: "renew",
      type,
      coverage, // new coverage to add
      price: parseFloat(price || 0),
      expire_date: expireDate,
      payment_method: payment,
      branch_id: branchId,
      performed_by: userId,
      performed_by_name: userName,
    };

    console.log("Sending renewal payload:", payload);

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

    const newMembership = data;

    await fetch("http://localhost/API/membership_logs.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_id: customerId,
        membership_id: newMembership.id,
        action: "renewal",
        type,
        amount: coverage,
        payment_method: payment,
        // Use consistent user tracking fields
        branch_id: branchId,
        performed_by: userId,
        performed_by_name: userName,
      }),
    });

    setCustomerMemberships((prev) => [...prev, newMembership]);

    // ✅ Clear badge FIRST before updating state
    try {
      localStorage.removeItem(`newMember:${customerId}`);
    } catch (_) {
      // ignore
    }

    // Update customers list to remove badge
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? {
              ...c,
              isNewMember: false,
              newMemberType: undefined,
              membership_id: newMembership.id, // ✅ Update with NEW membership ID
            }
          : c
      )
    );

    fetchMembershipLogs(customerId);
    toast.success("✅ Membership renewed successfully!");

    // Refresh the customer list to update badges
    setTimeout(() => {
      refreshCustomerList();
    }, 500);
  } catch (error) {
    toast.error("❌ Failed to renew membership.");
    console.error("Renewal error:", error);
  }
};

  const handleSaveMembership = async () => {
  const customer = selectedForMembership;

  try {
    let userData = currentUser;

    // If currentUser is not available, try to fetch it
    if (!userData) {
      try {
        const currentUserResponse = await fetch(
          "http://localhost/API/branches.php?action=user",
          {
            credentials: "include",
          }
        );

        if (currentUserResponse.ok) {
          userData = await currentUserResponse.json();
          console.log("Fetched user data in handleSaveMembership:", userData);
        }
      } catch (userError) {
        console.error("Error fetching user data:", userError);
      }
    }

    // Also try localStorage as fallback
    if (!userData) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          userData = JSON.parse(storedUser);
          console.log("User data from localStorage:", userData);
        } catch (parseError) {
          console.error(
            "Error parsing user data from localStorage:",
            parseError
          );
        }
      }
    }

    // Use consistent user ID and branch ID fields
    const userId = userData?.id || userData?.user_id || null;
    const branchId = userData?.branch_id || null;
    const userName = userData?.name || "Unknown User";

    const body = {
      customer_id: customer.id,
      action: "New Member",
      type: membershipForm.type.toLowerCase(),
      coverage: parseFloat(membershipForm.consumable),
      remaining_balance: parseFloat(membershipForm.consumable),
      payment_method: membershipForm.paymentMethod || "cash",
      note: membershipForm.description || "",
      duration: 1,
      branch_id: branchId,
      performed_by: userId,
      performed_by_name: userName,
    };

    console.log("Sending membership data:", body); // Debug log

    if (
      membershipForm.type === "promo" &&
      !membershipForm.noExpiration &&
      membershipForm.validTo
    ) {
      body.duration = calculateDuration(membershipForm.validTo);
    }

    const response = await fetch("http://localhost/API/members.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to add membership");
    }

    const data = await response.json();
    console.log("Membership API response:", data);

    if (data && data.id) {
      const updatedCustomers = customers.map((c) =>
        c.id === customer.id
          ? {
              ...c,
              membership_status: data.type.toUpperCase(),
              membership_id: data.id, // Store the membership ID
              membershipDetails: {
                type: data.type,
                coverage: data.coverage,
                remainingBalance: data.remaining_balance,
                dateRegistered: data.date_registered,
                expireDate: data.expire_date,
              },
              isNewMember: true,
              newMemberType: data.type,
            }
          : c
      );

      setCustomers(updatedCustomers);
      setIsMembershipModalOpen(false);
      setSelectedCustomer(updatedCustomers.find((c) => c.id === customer.id));

      // Store the new member flag with membership ID (no expiration)
      try {
        localStorage.setItem(
          `newMember:${customer.id}`,
          JSON.stringify({
            type: data.type,
            membershipId: data.id, // ✅ Store the membership ID
            createdAt: new Date().toISOString(),
          })
        );
      } catch (_) {
        // ignore storage errors
      }

      toast.success("Membership added successfully");

      // Refresh the customer list to show new badges
      setTimeout(() => {
        refreshCustomerList();
      }, 500);
    } else {
      throw new Error("Invalid response from server");
    }
  } catch (error) {
    console.error("Error adding membership:", error);
    toast.error(error.message || "Error connecting to server");
  }
};

  // Helper function to calculate duration in months
  function calculateDuration(validToDate) {
    const today = new Date();
    const validTo = new Date(validToDate);
    const months = (validTo.getFullYear() - today.getFullYear()) * 12;
    return months + (validTo.getMonth() - today.getMonth());
  }

  const handleAddMembershipClick = (customer) => {
    setSelectedForMembership(customer);
    setIsMembershipModalOpen(true);
  };

  const handleRenewMembershipClick = (customer) => {
    setSelectedForMembership(customer);
    setIsRenewModalOpen(true);
  };

  // Function to refresh customer list and check badge persistence
  const refreshCustomerList = () => {
    fetchCustomers(activeTab);
  };

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.trim() === "") {
        fetchCustomers(activeTab);
      } else {
        const filtered = customers.filter((customer) => {
          const name = customer.name ? customer.name.toLowerCase() : "";
          const email = customer.email ? customer.email.toLowerCase() : "";
          const contact = customer.contact || "";
          const customerId = customer.customerId || "";

          return (
            name.includes(searchQuery.toLowerCase()) ||
            contact.includes(searchQuery) ||
            email.includes(searchQuery.toLowerCase()) ||
            customerId.includes(searchQuery)
          );
        });
        setCustomers(filtered);
      }
    }, 300); // 300ms debounce delay

    return () => clearTimeout(delaySearch);
  }, [searchQuery, activeTab]);

  const handleEditClick = (customer) => {
    const sanitizedCustomer = Object.fromEntries(
      Object.entries(customer).map(([key, value]) => [key, value ?? ""])
    );

    setEditCustomer(sanitizedCustomer);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (updatedCustomer) => {
    try {
      // Clean up values before sending to backend
      const payload = {
        ...updatedCustomer,
        email: updatedCustomer.email?.trim() || null,
        customerId: updatedCustomer.customerId?.trim() || null,
        birthday:
          updatedCustomer.birthday?.trim() &&
          updatedCustomer.birthday !== "0000-00-00"
            ? updatedCustomer.birthday
            : null,
      };

      const res = await fetch(
        `http://localhost/API/customers.php?action=update&id=${updatedCustomer.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();

      if (result.success) {
        // Update local state
        const updatedList = customers.map((cust) =>
          cust.id === updatedCustomer.id ? { ...cust, ...payload } : cust
        );
        setCustomers(updatedList);
        toast.success("Customer updated successfully.");
        setIsEditModalOpen(false);
      } else {
        toast.error(result.message || "Failed to update.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred.");
    }
  };

  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers.slice(
    indexOfFirstCustomer,
    indexOfLastCustomer
  );
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Optional: Scroll to top of table
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, filteredCustomers]);

  const handleSave = () => {
    const updatedCustomers = customers.map((customer) =>
      customer.id === formData.id ? formData : customer
    );
    setCustomers(updatedCustomers);
    setSelectedCustomer(formData);
    setEditMode(false);
    toast.success("Changes saved successfully");
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault(); // Prevent reload

    try {
      // ✅ Validate required fields
      if (!newCustomer.name || !newCustomer.contact) {
        toast.error("Name and contact number are required.");
        return;
      }

      // ✅ Step 1: Check for duplicates in the existing customer list
      const duplicate = customers.find(
        (cust) =>
          cust.name.trim().toLowerCase() ===
            newCustomer.name.trim().toLowerCase() ||
          cust.phone === newCustomer.contact
      );

      if (duplicate) {
        toast.error(
          "Customer with this name or contact number already exists."
        );
        return;
      }

      // ✅ Step 2: Prepare payload
      const payload = {
        name: newCustomer.name.trim(),
        phone: newCustomer.contact.trim(),
        email: newCustomer.email || null,
        address: newCustomer.address || null,
        birthday: newCustomer.birthday || null,
      };

      // ✅ Step 3: Send POST request to backend
      const response = await fetch(
        "http://localhost/API/customers.php?action=add",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!result.success || !result.customer_id) {
        toast.error(result.message || "Failed to add customer.");
        return;
      }

      toast.success("Customer added successfully!");

      // ✅ Step 4: Refresh customers list (so it appears immediately)
      const fetchResponse = await fetch(
        "http://localhost/API/customers.php?action=get_all"
      );
      const updatedCustomers = await fetchResponse.json();
      setCustomers(updatedCustomers);

      // ✅ Step 5: Reset form and close modal
      setNewCustomer({
        name: "",
        contact: "",
        email: "",
        address: "",
        birthday: "",
      });

      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding customer:", error);
      toast.error("An error occurred while adding customer.");
    }
  };

  const handleLogout = async () => {
  try {
    // Call logout API if you have one
    await fetch(`${API_BASE}/admin.php?action=logout`, {
      method: "POST",
      credentials: "include"
    });
  } catch (error) {
    console.error("Logout API error:", error);
  } finally {
    // Clear ALL localStorage data
    localStorage.removeItem("user");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_name");
    localStorage.removeItem("role");
    localStorage.removeItem("branch_id");
    localStorage.removeItem("branch_name");
    localStorage.removeItem("loginAttempts");
    
    // Clear session storage too
    sessionStorage.clear();
    
    // Redirect to login page
    window.location.href = "/";
  }
};

  return (
    <div className="flex flex-col h-screen bg-[#77DD77] text-gray-900">
      <Toaster />
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
        <main className="flex-1 p-4 md:p-6 bg-gradient-to-br from-gray-50 to-white ml-0 lg:ml-64 min-h-screen transition-all duration-300 overflow-x-hidden">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8"
          >
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 bg-gradient-to-r from-gray-800 to-gray-800 bg-clip-text text-transparent">
                Customer Management
              </h1>
              <p className="text-xs md:text-sm text-gray-600 mt-1 md:mt-2 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                Manage your clinic's customers and memberships
              </p>
            </div>

            <div className="mt-3 md:mt-0">
              <motion.button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-lg md:rounded-xl transition-all duration-300 text-sm md:text-base"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={16} />
                <span>New Customer</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Stats Overview */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 mb-5 md:mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white p-3 md:p-5 rounded-xl md:rounded-2xl shadow-sm border border-gray-100 flex items-center">
              <div className="bg-blue-100 p-2 md:p-3 rounded-lg md:rounded-xl mr-3 md:mr-4">
                <Users className="text-blue-600" size={20} />
              </div>
              <div>
                <h3 className="text-lg md:text-2xl font-bold text-gray-800">
                  {filteredCustomers.length}
                </h3>
                <p className="text-xs md:text-sm text-gray-600">
                  Total Customers
                </p>
              </div>
            </div>

            <div className="bg-white p-3 md:p-5 rounded-xl md:rounded-2xl shadow-sm border border-gray-100 flex items-center">
              <div className="bg-green-100 p-2 md:p-3 rounded-lg md:rounded-xl mr-3 md:mr-4">
                <UserCheck className="text-green-600" size={20} />
              </div>
              <div>
                <h3 className="text-lg md:text-2xl font-bold text-gray-800">
                  {
                    filteredCustomers.filter(
                      (c) =>
                        c.membership_status &&
                        c.membership_status.toLowerCase() !== "none"
                    ).length
                  }
                </h3>
                <p className="text-xs md:text-sm text-gray-600">Members</p>
              </div>
            </div>

            <div className="bg-white p-3 md:p-5 rounded-xl md:rounded-2xl shadow-sm border border-gray-100 flex items-center">
              <div className="bg-gray-100 p-2 md:p-3 rounded-lg md:rounded-xl mr-3 md:mr-4">
                <UserX className="text-gray-600" size={20} />
              </div>
              <div>
                <h3 className="text-lg md:text-2xl font-bold text-gray-800">
                  {
                    filteredCustomers.filter(
                      (c) =>
                        !c.membership_status ||
                        c.membership_status.toLowerCase() === "none"
                    ).length
                  }
                </h3>
                <p className="text-xs md:text-sm text-gray-600">Non-Members</p>
              </div>
            </div>
          </motion.div>

          {/* Filter Tabs */}
          <motion.div
            className="mb-5 md:mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg md:rounded-xl">
              {["all", "member", "nonMember"].map((tab) => (
                <motion.button
                  key={tab}
                  className={`px-3 py-2 md:px-5 md:py-2.5 text-xs md:text-sm font-medium rounded-md md:rounded-lg transition-all duration-300 ${
                    activeTab === tab
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => {
                    setActiveTab(tab);
                    fetchCustomers(tab);
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {tab === "all"
                    ? "All Customers"
                    : tab === "member"
                      ? "Members"
                      : "Non-Members"}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Main Content Area */}
          <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
            {/* Customer Table - Takes full width when no customer is selected */}
            <motion.div
              className={`${selectedCustomer ? "lg:w-[calc(100%-340px)] xl:w-[calc(100%-380px)]" : "w-full"} transition-all duration-300`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="bg-white rounded-xl md:rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 md:px-6 md:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-4 py-3 md:px-6 md:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-4 py-3 md:px-6 md:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Membership
                        </th>
                        <th className="px-4 py-3 md:px-6 md:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      <AnimatePresence>
                        {currentCustomers.map((customer) => (
                          <motion.tr
                            key={customer.id}
                            className={`hover:bg-gray-50/80 cursor-pointer transition-all duration-300 ${
                              selectedCustomer?.id === customer.id
                                ? "bg-blue-50"
                                : ""
                            }`}
                            onClick={() => fetchCustomerDetails(customer.id)}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            whileHover={{ y: -2, backgroundColor: "#f9fafb" }}
                          >
                            {/* Customer Column */}
                            <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="ml-3 md:ml-4">
                                  <div className="text-sm font-medium text-gray-900 flex items-center">
                                    {customer.name}
                                    {customer.isNewMember ? (
                                      <span className="ml-2 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 text-xs px-2 py-1 rounded-full border border-amber-300 font-semibold shadow-sm animate-pulse">
                                        ✨ New{" "}
                                        {customer.newMemberType
                                          ? customer.newMemberType
                                              .charAt(0)
                                              .toUpperCase() +
                                            customer.newMemberType.slice(1)
                                          : ""}{" "}
                                        Member
                                      </span>
                                    ) : (
                                      customer.membership_status &&
                                      customer.membership_status.toLowerCase() !==
                                        "none" && (
                                        <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded-full">
                                          Member
                                        </span>
                                      )
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Contact Column */}
                            <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {customer.contact}
                              </div>
                              <div className="text-xs md:text-sm text-gray-500 truncate max-w-[120px] md:max-w-[160px]">
                                {customer.email}
                              </div>
                            </td>

                            {/* Membership Column */}
                            <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap">
                              <div className="flex flex-col">
                                {(() => {
                                  const rawStatus = customer.membership_status;
                                  const type =
                                    rawStatus &&
                                    rawStatus.trim().toLowerCase() !== "none"
                                      ? rawStatus.trim().toLowerCase()
                                      : null;

                                  let badgeClass = "bg-gray-200 text-gray-800";
                                  if (type === "pro")
                                    badgeClass =
                                      "bg-gradient-to-r from-purple-200 to-purple-100 text-purple-800 border border-purple-200";
                                  else if (type === "basic")
                                    badgeClass =
                                      "bg-gradient-to-r from-blue-200 to-blue-100 text-blue-800 border border-blue-200";
                                  else if (type === "promo")
                                    badgeClass =
                                      "bg-gradient-to-r from-amber-200 to-amber-100 text-amber-800 border border-amber-200";

                                  return (
                                    <>
                                      <span
                                        className={`inline-flex items-center px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs font-medium ${badgeClass}`}
                                      >
                                        {type
                                          ? type.charAt(0).toUpperCase() +
                                            type.slice(1)
                                          : "Non-Member"}
                                      </span>
                                      {customer.membershipDetails && (
                                        <div className="mt-1 text-xs text-gray-500 space-y-1">
                                          <div>
                                            Balance: ₱
                                            {Number(
                                              customer.membershipDetails
                                                .remainingBalance
                                            ).toLocaleString("en-PH", {
                                              minimumFractionDigits: 2,
                                              maximumFractionDigits: 2,
                                            })}
                                          </div>
                                        </div>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                            </td>

                            {/* Actions Column */}
                            <td className="px-4 py-3 md:px-6 md:py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex space-x-2 md:space-x-3">
                                {customer.membership_status === "None" ? (
                                  // Add Membership
                                  <motion.button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddMembershipClick(customer);
                                    }}
                                    className="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-100 transition-colors"
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                    title="Add Membership"
                                  >
                                    <UserPlus size={14} />
                                  </motion.button>
                                ) : (
                                  <motion.button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Set the customer first, then open modal
                                      setSelectedCustomer(customer);
                                      handleRenewMembershipClick(customer);
                                      setIsRenewModalOpen(true);
                                    }}
                                    className="text-green-600 hover:text-green-800 p-1 rounded-md hover:bg-green-100 transition-colors"
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                    title="Renew Membership"
                                  >
                                    <RefreshCw size={14} />
                                  </motion.button>
                                )}
                                <motion.button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditClick(customer);
                                  }}
                                  className="text-gray-600 hover:text-gray-800 p-1 rounded-md hover:bg-gray-100 transition-colors"
                                  whileHover={{ scale: 1.2 }}
                                  whileTap={{ scale: 0.9 }}
                                  title="Edit"
                                >
                                  <Edit size={14} />
                                </motion.button>
                                <motion.button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCustomer(customer);
                                    fetchCustomerDetails(customer.id);
                                  }}
                                  className="text-purple-600 hover:text-purple-800 p-1 rounded-md hover:bg-purple-100 transition-colors"
                                  whileHover={{ scale: 1.2 }}
                                  whileTap={{ scale: 0.9 }}
                                  title="View Details"
                                >
                                  <Eye size={14} />
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>

                  {/* Pagination Controls */}
                  <div className="px-4 py-3 md:px-6 md:py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50/50">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="ml-2 relative inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs md:text-sm text-gray-700">
                          Showing{" "}
                          <span className="font-medium">
                            {(currentPage - 1) * customersPerPage + 1}
                          </span>{" "}
                          to{" "}
                          <span className="font-medium">
                            {Math.min(
                              currentPage * customersPerPage,
                              filteredCustomers.length
                            )}
                          </span>{" "}
                          of{" "}
                          <span className="font-medium">
                            {filteredCustomers.length}
                          </span>{" "}
                          customers
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
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-xs md:text-sm font-medium text-gray-500 hover:bg-gray-50"
                          >
                            <span className="sr-only">First</span>
                            <ChevronsLeft className="h-4 w-4 md:h-5 md:w-5" />
                          </button>
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-xs md:text-sm font-medium text-gray-500 hover:bg-gray-50"
                          >
                            <span className="sr-only">Previous</span>
                            <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
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
                                  className={`relative inline-flex items-center px-3 py-2 border text-xs md:text-sm font-medium ${
                                    currentPage === pageNum
                                      ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
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
                            className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-xs md:text-sm font-medium text-gray-500 hover:bg-gray-50"
                          >
                            <span className="sr-only">Next</span>
                            <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
                          </button>
                          <button
                            onClick={() => handlePageChange(totalPages)}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-xs md:text-sm font-medium text-gray-500 hover:bg-gray-50"
                          >
                            <span className="sr-only">Last</span>
                            <ChevronsRight className="h-4 w-4 md:h-5 md:w-5" />
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Customer Details Panel */}
            {selectedCustomer && (
              <motion.div
                className="w-full lg:w-[350px] mt-4 lg:mt-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 lg:sticky lg:top-4 max-h-[82vh] overflow-y-auto">
                  {/* Loading Indicator */}
                  {isLoadingDetails && (
                    <div className="flex justify-center mb-3 py-2">
                      <RefreshCw className="animate-spin h-5 w-5 text-blue-600" />
                    </div>
                  )}

                  {/* Panel Header */}
                  <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-800 truncate pr-2">
                      {selectedCustomer.name}
                    </h2>
                    <button
                      onClick={() => setSelectedCustomer(null)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
                      aria-label="Close panel"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Customer Information */}
                  <div className="space-y-4">
                    {/* Basic Info */}
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                        <User className="mr-2" size={14} />
                        Contact Information
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center p-2 bg-gray-50 rounded-lg">
                          <Phone
                            className="flex-shrink-0 text-gray-400 mr-2"
                            size={14}
                          />
                          <span className="text-sm truncate">
                            {selectedCustomer.contact || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center p-2 bg-gray-50 rounded-lg">
                          <Mail
                            className="flex-shrink-0 text-gray-400 mr-2"
                            size={14}
                          />
                          <span className="text-sm truncate">
                            {selectedCustomer.email || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-start p-2 bg-gray-50 rounded-lg">
                          <Home
                            className="flex-shrink-0 text-gray-400 mr-2 mt-0.5"
                            size={14}
                          />
                          <span className="text-sm break-words flex-1">
                            {selectedCustomer.address || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center p-2 bg-gray-50 rounded-lg">
                          <Calendar
                            className="flex-shrink-0 text-gray-400 mr-2"
                            size={14}
                          />
                          <span className="text-sm">
                            {selectedCustomer.birthday || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Membership Status */}
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                        <Star className="mr-2" size={14} />
                        Membership Status
                      </h3>
                      <div
                        className={`p-3 rounded-lg ${
                          selectedCustomer.membership?.toLowerCase() === "pro"
                            ? "bg-purple-100 border border-purple-200"
                            : selectedCustomer.membership?.toLowerCase() ===
                                "basic"
                              ? "bg-blue-100 border border-blue-200"
                              : selectedCustomer.membership?.toLowerCase() ===
                                  "promo"
                                ? "bg-amber-100 border border-amber-200"
                                : "bg-gray-100 border border-gray-200"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-sm">
                            {selectedCustomer.membership?.toLowerCase() ===
                            "pro"
                              ? "PRO Member"
                              : selectedCustomer.membership?.toLowerCase() ===
                                  "basic"
                                ? "Basic Member"
                                : selectedCustomer.membership?.toLowerCase() ===
                                    "promo"
                                  ? "Membership Promo"
                                  : "No Membership"}
                          </span>
                          {selectedCustomer.membership !== "None" && (
                            <span className="text-xs text-gray-500">
                              {selectedCustomer.membershipDetails?.expireDate}
                            </span>
                          )}
                        </div>

                        {selectedCustomer.membership !== "None" && (
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <div className="text-gray-600">Coverage:</div>
                              <div className="font-medium truncate">
                                {selectedCustomer.membershipDetails?.coverage}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-600">Remaining:</div>
                              <div className="font-medium text-green-700">
                                ₱
                                {
                                  selectedCustomer.membershipDetails
                                    ?.remainingBalance
                                }
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-3">
                        {selectedCustomer.membership === "None" ? (
                          <motion.button
                            onClick={() =>
                              handleAddMembershipClick(selectedCustomer)
                            }
                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Add Membership
                          </motion.button>
                        ) : (
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsRenewModalOpen(true);
                              handleRenewMembershipClick(selectedCustomer);
                            }}
                            className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            Renew Membership
                          </motion.button>
                        )}
                      </div>
                    </div>

                    {/* Recent Activity
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                        <Activity className="mr-2" size={14} />
                        Recent Activity
                      </h3>
                      <div className="space-y-2 max-h-[140px] overflow-y-auto">
                        {selectedCustomer.recentActivity?.length > 0 ? (
                          selectedCustomer.recentActivity.map((activity, index) => (
                            <div key={index} className="flex items-start p-2 bg-gray-50 rounded-lg">
                              <div className="flex-shrink-0 mt-0.5 mr-2">
                                {activity.type === "service" ? (
                                  <Scissors className="text-gray-400" size={14} />
                                ) : (
                                  <CreditCard className="text-gray-400" size={14} />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">
                                  {activity.description}
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                  {activity.date}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded-lg text-center">
                            No recent activity
                          </div>
                        )}
                      </div>
                    </div> */}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>

      <AnimatePresence>
        {isMembershipModalOpen && selectedForMembership && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded-lg w-[600px]"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="text-xl font-bold mb-4">
                Add Membership to {selectedForMembership.name}
              </h2>

              <div className="space-y-4">
                {/* Membership Type Selector */}
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Membership Type
                  </label>
                  <select
                    value={membershipForm.type}
                    onChange={(e) => {
                      const type = e.target.value;
                      const template = membershipTemplates.find(
                        (m) => m.type === type
                      );

                      setMembershipForm({
                        ...membershipForm,
                        type,
                        name: template
                          ? template.name
                          : type === "basic"
                            ? "Basic"
                            : "Pro",
                        fee: template
                          ? template.price
                          : type === "basic"
                            ? 3000
                            : 6000,
                        consumable: template
                          ? template.consumable_amount
                          : type === "basic"
                            ? 5000
                            : 10000,
                        validTo:
                          template && template.valid_until
                            ? template.valid_until
                            : "",
                        noExpiration: template
                          ? template.no_expiration === 1
                          : false,
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
                    {membershipTemplates
                      .filter((m) => m.type === "promo")
                      .map((m) => (
                        <option key={m.id} value="promo">
                          {m.name} (Promo)
                        </option>
                      ))}
                  </select>
                </div>

                {/* Payment Method Selector */}
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Payment Method
                  </label>
                  <select
                    value={membershipForm.paymentMethod}
                    onChange={(e) =>
                      setMembershipForm({
                        ...membershipForm,
                        paymentMethod: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded"
                  >
                    <option value="Cash">Cash</option>
                    <option value="GCash">GCash</option>
                    <option value="Card">Card</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Custom fields only for promo */}
                {membershipForm.type === "promo" && (
                  <>
                    <div>
                      <label className="block text-sm mb-1">Price (₱)</label>
                      <input
                        type="number"
                        value={membershipForm.fee}
                        onChange={(e) =>
                          setMembershipForm({
                            ...membershipForm,
                            fee: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">
                        Consumable Amount
                      </label>
                      <input
                        type="number"
                        value={membershipForm.consumable}
                        onChange={(e) =>
                          setMembershipForm({
                            ...membershipForm,
                            consumable: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    {!membershipForm.noExpiration && (
                      <div>
                        <label className="block mb-1 text-sm">
                          Valid Until
                        </label>
                        <input
                          type="date"
                          value={membershipForm.validTo}
                          onChange={(e) =>
                            setMembershipForm({
                              ...membershipForm,
                              validTo: e.target.value,
                            })
                          }
                          className="w-full p-2 border rounded"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => setIsMembershipModalOpen(false)}
                  className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveMembership}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Renew Membership Modal */}
      <AnimatePresence>
        {isRenewModalOpen && (
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
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Renew Membership</h2>
                <button
                  onClick={() => setIsRenewModalOpen(false)}
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

                      const template = membershipTemplates.find(
                        (m) => m.type === type
                      );

                      setRenewMembership((prev) => ({
                        ...prev,
                        type,
                        price: template
                          ? template.price
                          : type === "basic"
                            ? 3000
                            : type === "pro"
                              ? 6000
                              : "",
                        consumable_amount: template
                          ? template.consumable_amount
                          : type === "basic"
                            ? 5000
                            : type === "pro"
                              ? 10000
                              : "",
                        valid_until: template?.valid_until || "",
                        no_expiration: template
                          ? template.no_expiration === 1
                          : false,
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
                      <label className="block text-sm font-medium mb-1">
                        Price (₱)
                      </label>
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
                  disabled={isRenewing}
                  onClick={async () => {
                    if (!selectedCustomer) return;
                    setIsRenewing(true);
                    try {
                      const renewMembershipPayload = {
                        price: Number(renewMembership.price || 0),
                        consumable_amount: Number(
                          renewMembership.consumable_amount || 0
                        ),
                        valid_until: renewMembership.no_expiration
                          ? null
                          : renewMembership.valid_until || null,
                        no_expiration: renewMembership.no_expiration,
                      };

                      await handleRenewMembership(
                        selectedCustomer.id,
                        renewMembership.type || "basic",
                        paymentMethod,
                        renewMembershipPayload
                      );

                      setIsRenewModalOpen(false);
                    } finally {
                      setIsRenewing(false);
                    }
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    isRenewing
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  {isRenewing ? "Processing..." : "Confirm Renewal"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Customer Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8"
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Add New Customer
              </h2>

              {/* ✅ Wrap everything inside a form */}
              <form onSubmit={handleAddCustomer}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newCustomer.name}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, name: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Enter full name"
                      required
                    />
                  </div>

                  {/* Contact */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newCustomer.contact}
                      onChange={(e) =>
                        setNewCustomer({
                          ...newCustomer,
                          contact: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="e.g. 09XXXXXXXXX"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) =>
                        setNewCustomer({
                          ...newCustomer,
                          email: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Optional"
                    />
                  </div>

                  {/* Birthday */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Birthday
                    </label>
                    <input
                      type="date"
                      value={newCustomer.birthday}
                      onChange={(e) =>
                        setNewCustomer({
                          ...newCustomer,
                          birthday: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      value={newCustomer.address}
                      onChange={(e) =>
                        setNewCustomer({
                          ...newCustomer,
                          address: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                {/* ✅ Action buttons */}
                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit" // ✅ use submit instead of onClick
                    className="px-5 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
                  >
                    Save
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditModalOpen && editCustomer && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded-lg w-[700px] max-h-[85vh] overflow-y-auto"
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="text-xl font-bold mb-4">
                Edit Customer Information
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={editCustomer.name}
                    onChange={(e) =>
                      setEditCustomer({ ...editCustomer, name: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Contact
                  </label>
                  <input
                    type="text"
                    value={editCustomer.contact}
                    onChange={(e) =>
                      setEditCustomer({
                        ...editCustomer,
                        contact: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editCustomer.email}
                    onChange={(e) =>
                      setEditCustomer({
                        ...editCustomer,
                        email: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={editCustomer.address}
                    onChange={(e) =>
                      setEditCustomer({
                        ...editCustomer,
                        address: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Birthday
                  </label>
                  <input
                    type="date"
                    value={editCustomer.birthday}
                    onChange={(e) =>
                      setEditCustomer({
                        ...editCustomer,
                        birthday: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveEdit(editCustomer)}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
