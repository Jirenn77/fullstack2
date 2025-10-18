"use client";

import React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Dialog } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { Menu } from "@headlessui/react";
import { BarChart, BarChart3 } from "lucide-react";
import { User } from "lucide-react";
import {
  BarChart2,
  ClipboardList,
  ShoppingBag,
  UserPlus,
  Tag,
  Leaf,
} from "lucide-react";
import {
  Home,
  Users,
  FileText,
  CreditCard,
  Package,
  Layers,
  ShoppingCart,
  Settings,
  LogOut,
  Plus,
  Edit,
  MoreHorizontal,
  Eye,
  Edit2,
  X,
  Moon,
  Sun,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ChevronDown,
} from "lucide-react";

export default function ServiceGroupsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [serviceGroups, setServiceGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [linkedServices, setLinkedServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceToEdit, setServiceToEdit] = useState(null);
  const [groupToEdit, setGroupToEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "Active",
    services: [],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newService, setNewService] = useState({
    name: "",
    price: "",
    duration: "",
    description: "",
  });
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    status: "Active",
  });

  const [filters, setFilters] = useState({
    searchQuery: "",
    status: "all", // 'all', 'active', 'inactive'
    sortBy: "name", // 'name', 'servicesCount', 'dateCreated'
    sortOrder: "asc", // 'asc', 'desc'
  });
  const [currentGroupPage, setCurrentGroupPage] = useState(1);
  const [currentServicePage, setCurrentServicePage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // For service groups
  const [servicesPerPage, setServicesPerPage] = useState(5); // For services list
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [error, setError] = useState("");

  // Add active tab state
  const [activeTab, setActiveTab] = useState("service-groups"); // Default to service groups

  useEffect(() => {
    const fetchServiceGroups = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "http://localhost/API/servicegroup.php?action=get_groups_with_services"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch service groups");
        }
        const data = await response.json();

        // ✅ Ensure the response is always an array
        if (Array.isArray(data)) {
          const updatedData = data.map((group) => ({
            ...group,
            servicesCount: group.services?.length || 0,
            averagePrice: group.services?.length
              ? (
                group.services.reduce(
                  (acc, s) => acc + parseFloat(s.price || 0),
                  0
                ) / group.services.length
              ).toFixed(2)
              : "0.00",
          }));
          console.log("Fetched service groups:", data);
          setServiceGroups(updatedData);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setServiceGroups([]); // fallback in case of error
      } finally {
        setLoading(false);
      }
    };

    fetchServiceGroups();
  }, []);

  // Add function to fetch all services (for the All Services tab)
  const fetchAllServices = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost/API/servicegroup.php?action=all_services"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch services");
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setServices(data);
      }
    } catch (err) {
      console.error("Fetch services error:", err);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "all-services") {
      fetchAllServices();
    }
  };

  const handleAddGroup = async () => {
    if (!newGroup.name.trim()) {
      toast.error("Group name is required.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost/API/servicegroup.php?action=save_group",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            group_name: newGroup.name,
            description: newGroup.description,
            status: newGroup.status || "Active",
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        const groupToAdd = {
          id: result.group_id,
          group_name: newGroup.name, // ✅ match DB field
          description: newGroup.description,
          servicesCount: 0,
          averagePrice: "0",
          services: [],
          status: newGroup.status || "Active",
        };

        setServiceGroups([...serviceGroups, groupToAdd]);
        setNewGroup({ name: "", description: "" });
        setIsAddGroupModalOpen(false);

        // ✅ Success toast
        toast.success(`New group "${newGroup.name}" added successfully!`);
      } else {
        toast.error(result.error || "Failed to create group.");
      }
    } catch (error) {
      console.error("Error adding group:", error);
      toast.error("Something went wrong while creating the group.");
    }
  };

  // THIS IS FOR EDIT2
  const handleSaveEditedService = async () => {
    try {
      const response = await axios.post(
        "http://localhost/API/servicegroup.php?action=update_service",
        {
          id: serviceToEdit.service_id, // ✅ map correctly
          name: serviceToEdit.name,
          price: serviceToEdit.price,
          duration: serviceToEdit.duration,
        }
      );

      if (response.data.success) {
        // Update local state
        const updatedServices = selectedGroup.services.map((s) =>
          s.service_id === serviceToEdit.service_id ? serviceToEdit : s
        );
        setSelectedGroup({ ...selectedGroup, services: updatedServices });

        setIsEditModalOpen(false);

        // ✅ Show toast notification
        toast.success("Service updated successfully!");
      } else {
        console.error(
          "API update failed:",
          response.data.message || "Unknown error"
        );
        alert("Failed to update service.");
      }
    } catch (error) {
      console.error("Error updating service:", error);
      alert("An error occurred while updating the service.");
    }
  };

  const filteredServiceGroups = serviceGroups
    .filter((group) => {
      // Search by name or description
      const matchesSearch =
        group.group_name
          .toLowerCase()
          .includes(filters.searchQuery.toLowerCase()) ||
        (group.description &&
          group.description
            .toLowerCase()
            .includes(filters.searchQuery.toLowerCase()));

      // Filter by status if not 'all'
      const matchesStatus =
        filters.status === "all" ||
        (filters.status === "active" && group.status === "Active") ||
        (filters.status === "inactive" && group.status === "Inactive");

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Sorting logic
      if (filters.sortBy === "name") {
        return filters.sortOrder === "asc"
          ? a.group_name.localeCompare(b.group_name)
          : b.group_name.localeCompare(a.group_name);
      } else if (filters.sortBy === "servicesCount") {
        return filters.sortOrder === "asc"
          ? a.servicesCount - b.servicesCount
          : b.servicesCount - a.servicesCount;
      } else if (filters.sortBy === "dateCreated") {
        return filters.sortOrder === "asc"
          ? new Date(a.created_at) - new Date(b.created_at)
          : new Date(b.created_at) - new Date(a.created_at);
      }
      return 0;
    });

  // Filter services for All Services tab
  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(filters.searchQuery.toLowerCase())
  );

  // Paginated data
  const paginatedServiceGroups = filteredServiceGroups.slice(
    (currentGroupPage - 1) * itemsPerPage,
    currentGroupPage * itemsPerPage
  );

  const paginatedServices = filteredServices.slice(
    (currentServicePage - 1) * itemsPerPage,
    currentServicePage * itemsPerPage
  );

  useEffect(() => {
    setCurrentGroupPage(1);
    setCurrentServicePage(1);
  }, [filters.searchQuery, filters.status, filters.sortBy, filters.sortOrder, activeTab]);

  const handleEditServices = () => {
    setEditMode(true);
    setFormData(selectedService);
  };

  const handleEditGroup = (group) => {
    setSelectedGroup(group);
    setFormData({
      id: group.group_id || group.id, // 👈 KEEP ID
      name: group.group_name || "",
      description: group.description || "",
      status: group.status || "Active",
      services: Array.isArray(group.services) ? group.services : [],
    });
    setLinkedServices(Array.isArray(group.services) ? group.services : []);
    setEditMode(true);
  };

  const handleEditServiceGroupClick = (group) => {
    setGroupToEdit(group);
    setFormData({
      name: group.name || "",
      description: group.description || "",
      status: group.status || "Active",
    });
    setLinkedServices(group.services || []);
    setEditMode(true); // open the modal
  };

  const handleEditService = (service) => {
    setServiceToEdit(service); // set the selected service in state
    setIsEditModalOpen(true); // open the edit modal
  };

  const handleSaveGroup = async () => {
    try {
      if (!formData.id) {
        toast.error("Missing group_id for update");
        return;
      }

      const response = await fetch(
        `http://localhost/API/servicegroup.php?action=save_group`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            group_id: formData.id, // required for update
            group_name: formData.name,
            description: formData.description,
            status: formData.status,
            services: formData.services.map((s) =>
              typeof s === "object" ? s.service_id : s
            ),
          }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        toast.error(result.error || "Failed to update group");
        return;
      }

      // Determine canonical id and services from backend if provided
      const backendGroup = result.group || {};
      const gid = backendGroup.group_id ?? result.group_id ?? formData.id;
      const services = backendGroup.services ?? formData.services ?? [];
      const servicesCount = Array.isArray(services) ? services.length : (backendGroup.servicesCount ?? 0);

      // Build an updatedGroup that contains both id and group_id to avoid mismatch
      const updatedGroup = {
        id: gid,
        group_id: gid,
        group_name: backendGroup.group_name ?? formData.name,
        description: backendGroup.description ?? formData.description,
        status: backendGroup.status ?? formData.status,
        services,
        servicesCount,
        created_at: backendGroup.created_at ?? undefined,
        updated_at: backendGroup.updated_at ?? undefined,
      };

      // Safe functional update to prevent duplicates / race conditions
      setServiceGroups((prev) => {
        const exists = prev.some((g) => (g.group_id ?? g.id) === gid);
        if (exists) {
          return prev.map((g) => ((g.group_id ?? g.id) === gid ? updatedGroup : g));
        } else {
          // if it truly doesn't exist, append once
          return [...prev, updatedGroup];
        }
      });

      setSelectedGroup(updatedGroup);
      setEditMode(false);
      toast.success("Group updated successfully!");
    } catch (error) {
      console.error("Error updating group:", error);
      toast.error("Something went wrong while updating the group.");
    }
  };

  const handleAddService = async () => {
    if (!selectedGroup || !newService.name || !newService.price) return;

    const serviceToAdd = {
      name: newService.name,
      price: parseFloat(newService.price),
      description: newService.description || null,
      duration: parseInt(newService.duration) || null,
      category: selectedGroup.group_name,
    };

    try {
      console.log("Sending:", {
        service: serviceToAdd,
        group_id: selectedGroup.id || selectedGroup.group_id,
      });

      const response = await fetch(
        "http://localhost/API/servicegroup.php?action=add_service",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service: serviceToAdd,
            group_id: selectedGroup.id || selectedGroup.group_id,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        const updatedGroups = serviceGroups.map((group) =>
          (group.id || group.group_id) ===
            (selectedGroup.id || selectedGroup.group_id)
            ? {
              ...group,
              services: [
                ...group.services,
                { ...serviceToAdd, id: result.service_id },
              ],
              servicesCount: group.services.length + 1,
            }
            : group
        );

        setServiceGroups(updatedGroups);
        setIsAddModalOpen(false); // Close modal

        // ✅ Success toast
        toast.success("Service added successfully!");
      } else {
        console.error("Error adding service:", result.message);
        toast.error(result.message || "Failed to add service.");
      }
    } catch (err) {
      console.error("Network error:", err);
      toast.error("Network error. Please try again.");
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/";
  };

  // Render Services Table for All Services tab
  const renderServicesTable = () => (
    <motion.div
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Service Name
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Price
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Duration
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {paginatedServices.map((service, index) => (
            <motion.tr
              key={service.id || `service-${index}`}
              className="hover:bg-emerald-50 transition-colors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.005 }}
            >
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div className="ml-3">
                    <div className="text-sm font-semibold text-gray-900">
                      {service.name}
                    </div>
                    {service.description && (
                      <div className="text-sm text-gray-500">
                        {service.description}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {service.category || "Uncategorized"}
              </td>
              <td className="px-6 py-4 text-sm font-medium text-green-600">
                ₱{service.price ?? service.service_price ?? 0}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {service.duration ?? service.service_duration ?? "-"} mins
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                <div className="flex space-x-3">
                  <motion.button
                    onClick={() => handleEditService(service)}
                    className="text-blue-600 hover:text-blue-800 p-1.5 rounded-md hover:bg-blue-100 transition-colors"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    title="Edit"
                  >
                    <Edit size={16} />
                  </motion.button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>

      {/* Pagination for Services */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-200">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => setCurrentServicePage((prev) => Math.max(prev - 1, 1))}
            disabled={currentServicePage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentServicePage((prev) => prev + 1)}
            disabled={paginatedServices.length < itemsPerPage}
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
                {(currentServicePage - 1) * itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(currentServicePage * itemsPerPage, filteredServices.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium">
                {filteredServices.length}
              </span>{" "}
              results
            </p>
          </div>
          <div>
            <nav
              className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination"
            >
              <button
                onClick={() => setCurrentServicePage((prev) => Math.max(prev - 1, 1))}
                disabled={currentServicePage === 1}
                className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span className="sr-only">Previous</span>
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              {Array.from({
                length: Math.ceil(filteredServices.length / itemsPerPage),
              }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentServicePage(index + 1)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentServicePage === index + 1
                      ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                    }`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentServicePage((prev) => prev + 1)}
                disabled={currentServicePage * itemsPerPage >= filteredServices.length}
                className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span className="sr-only">Next</span>
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Render Service Groups Table (your existing code)
  const renderServiceGroupsTable = () => (
    <motion.div
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Service Group
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Services Count
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {paginatedServiceGroups.map((group, index) => (
            <motion.tr
              key={group.group_id || `group-${index}`}
              className={`hover:bg-emerald-50 transition-colors ${selectedGroup?.group_id === group.group_id ? "bg-emerald-50" : ""}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.005 }}
            >
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div className="ml-3">
                    <div className="text-sm font-semibold text-gray-900">
                      {group.group_name}
                    </div>
                  </div>
                </div>
              </td>

              <td className="px-6 py-4 text-sm text-gray-600">
                {group.description || "No description"}
              </td>

              <td className="px-6 py-4">
                <motion.span
                  className="px-3 py-1 text-xs rounded-full bg-emerald-100 text-emerald-800 font-medium"
                  whileHover={{ scale: 1.1 }}
                >
                  {group.servicesCount} Services
                </motion.span>
              </td>

              <td className="px-6 py-4 text-sm text-gray-500">
                <div className="flex space-x-3">
                  {/* Edit Button */}
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation(); // 🚀 prevents triggering the row click
                      handleEditGroup(group); // only open edit modal
                    }}
                    className="text-blue-600 hover:text-blue-800 p-1.5 rounded-md hover:bg-blue-100 transition-colors"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    title="Edit"
                  >
                    <Edit size={16} />
                  </motion.button>

                  {/* View Details Button */}
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedGroup(group);
                      setIsViewModalOpen(true); // 👈 open modal explicitly
                    }}
                    className="text-gray-600 hover:text-gray-800 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    title="View Details"
                  >
                    <Eye size={16} />
                  </motion.button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>

      {/* Pagination for Service Groups */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-200">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => setCurrentGroupPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentGroupPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentGroupPage((prev) => prev + 1)}
            disabled={filteredServiceGroups.length < itemsPerPage}
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
                {(currentGroupPage - 1) * itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(currentGroupPage * itemsPerPage, filteredServiceGroups.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium">
                {filteredServiceGroups.length}
              </span>{" "}
              results
            </p>
          </div>
          <div>
            <nav
              className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination"
            >
              <button
                onClick={() => setCurrentGroupPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentGroupPage === 1}
                className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span className="sr-only">Previous</span>
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              {Array.from({
                length: Math.ceil(filteredServiceGroups.length / itemsPerPage),
              }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentGroupPage(index + 1)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentGroupPage === index + 1
                      ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                    }`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentGroupPage((prev) => prev + 1)}
                disabled={currentGroupPage * itemsPerPage >= filteredServiceGroups.length}
                className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span className="sr-only">Next</span>
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className={`flex flex-col h-screen ${darkMode ? "dark bg-[#0a1a14] text-gray-100" : "bg-gray-50 text-gray-800"}`}>
      <Toaster position="top-right" richColors />
      {/* Header */}
      <header className="flex items-center justify-between bg-emerald-700 text-white p-4 w-full h-16 pl-64 relative">
        <div className="flex items-center space-x-4">
          {/* Space for potential left-aligned elements */}
        </div>

        <div className="flex items-center space-x-4 flex-wrap gap-4 mb-1">
          {/* Search Input - Matching your current design */}
          <div className="relative flex-grow min-w-[200px]">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder={activeTab === "service-groups" ? "Search groups..." : "Search services..."}
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              className="pl-10 pr-4 py-2 rounded-lg bg-white/90 text-gray-800 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Sort By - Styled to match */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="appearance-none pl-3 pr-1 py-1 rounded-l-lg bg-white/90 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
              >
                <option value="name">Name</option>
                {activeTab === "service-groups" && (
                  <option value="servicesCount">Services Count</option>
                )}
                <option value="dateCreated">Date Created</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                size={16}
              />
            </div>
            <button
              onClick={() => setFilters({ ...filters, sortOrder: filters.sortOrder === "asc" ? "desc" : "asc" })}
              className="px-3 py-2 rounded-r-lg bg-white/90 text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {filters.sortOrder === "asc" ? (
                <ArrowUp className="h-4 w-4 text-gray-700" />
              ) : (
                <ArrowDown className="h-4 w-4 text-gray-700" />
              )}
            </button>
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

        {/* Main Content */}
        <main className="flex-1 p-8 max-w-screen-xl mx-auto ml-64 bg-white min-h-screen pt-26">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex justify-between items-center mb-6"
          >
            <h1 className="text-2xl font-bold text-gray-800">
              {activeTab === "service-groups" ? "All Service Groups" : "All Services"}
            </h1>
            <motion.button
              onClick={() => {
                if (activeTab === "service-groups") {
                  setIsAddGroupModalOpen(true);
                } else {
                  // Handle add service logic here
                  setIsAddModalOpen(true);
                }
              }}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-lg transition-colors font-medium shadow-md hover:shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={18} />
              <span>
                {activeTab === "service-groups" ? "New Service Group" : "New Service"}
              </span>
            </motion.button>
          </motion.div>

          {/* Tabs Navigation */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => handleTabChange("service-groups")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "service-groups"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                Service Groups
              </button>
              <button
                onClick={() => handleTabChange("all-services")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === "all-services"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                All Services
              </button>
            </nav>
          </div>

          <div className="flex">
            {/* Main Content Area */}
            <motion.div
              className={`${selectedGroup && activeTab === "service-groups" ? "w-[calc(100%-350px)]" : "w-full"} transition-all duration-300 pr-4`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {activeTab === "service-groups" ? renderServiceGroupsTable() : renderServicesTable()}
            </motion.div>

            {/* Service Group Detail Panel (only shown for service groups tab) */}
            <AnimatePresence>
              {selectedGroup && activeTab === "service-groups" && (
                <motion.div
                  className="hidden lg:block w-[350px]"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  {/* Your existing service group detail panel code */}
                  <motion.div
                    className="bg-white rounded-xl shadow-md border border-gray-200 p-5 h-[calc(100vh-120px)] sticky top-20 overflow-y-auto"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  >
                    {/* Panel Header */}
                    <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-200">
                      <h2 className="text-xl font-bold text-gray-800">
                        {selectedGroup.group_name}
                      </h2>
                      <motion.button
                        onClick={() => setSelectedGroup(null)}
                        className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X size={20} />
                      </motion.button>
                    </div>

                    {/* Group Info */}
                    <motion.div
                      className="space-y-4 mb-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div>
                        <h3 className="text-sm font-semibold text-gray-600 mb-2">
                          Description
                        </h3>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                          {selectedGroup.description || "No description available"}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <motion.div
                          className="bg-blue-50 p-3 rounded-lg text-center border border-blue-100"
                          whileHover={{ scale: 1.05 }}
                        >
                          <div className="text-xs text-blue-600 font-medium">
                            Total Services
                          </div>
                          <div className="font-bold text-blue-800 text-lg">
                            {selectedGroup.servicesCount}
                          </div>
                        </motion.div>
                        <motion.div
                          className="bg-green-50 p-3 rounded-lg text-center border border-green-100"
                          whileHover={{ scale: 1.05 }}
                        >
                          <div className="text-xs text-green-600 font-medium">
                            Average Price
                          </div>
                          <div className="font-bold text-green-800 text-lg">
                            ₱{selectedGroup.averagePrice}
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>

                    {/* Services List */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-semibold text-gray-600">
                          Services
                        </h3>
                        <motion.button
                          onClick={() => setIsAddModalOpen(true)}
                          className="text-xs bg-blue-600 text-white py-1.5 px-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
                          whileHover={{ scale: 1.05 }}
                        >
                          + Add Service
                        </motion.button>
                      </div>

                      <motion.div
                        className="border border-gray-200 rounded-lg overflow-auto max-h-[400px]"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        <table className="min-w-full table-fixed divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="w-1/3 px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Name
                              </th>
                              <th className="w-1/4 px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Price
                              </th>
                              <th className="w-1/4 px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Duration
                              </th>
                              <th className="w-1/12 px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider"></th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedGroup.services.length > 0 ? (
                              selectedGroup.services
                                .slice(
                                  (currentServicePage - 1) * servicesPerPage,
                                  currentServicePage * servicesPerPage
                                )
                                .map((service, index) => (
                                  <motion.tr
                                    key={service.id || `service-${index}`}
                                    className="hover:bg-gray-50 transition-colors"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                  >
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900 break-words">
                                      {service.name}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-green-600 font-medium">
                                      ₱{service.price}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                      {service.duration} mins
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500 text-right">
                                      <motion.button
                                        className="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-100 transition-colors"
                                        whileHover={{ scale: 1.2 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleEditService(service)}
                                      >
                                        <Edit2 size={16} />
                                      </motion.button>
                                    </td>
                                  </motion.tr>
                                ))
                            ) : (
                              <motion.tr
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                              >
                                <td
                                  colSpan="4"
                                  className="text-center text-gray-500 py-6 italic bg-gray-50"
                                >
                                  No services available
                                </td>
                              </motion.tr>
                            )}
                          </tbody>
                        </table>

                        {/* Pagination for Services */}
                        {selectedGroup.services.length > servicesPerPage && (
                          <div className="flex items-center justify-between px-3 py-3 bg-white border-t border-gray-200">
                            <div className="flex-1 flex justify-between">
                              <button
                                onClick={() => setCurrentServicePage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentServicePage === 1}
                                className="relative inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                              >
                                Previous
                              </button>
                              <button
                                onClick={() => setCurrentServicePage((prev) => prev + 1)}
                                disabled={currentServicePage * servicesPerPage >= selectedGroup.services.length}
                                className="ml-2 relative inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Your existing modals (Add Service, Edit Service, Add Group, Edit Group) remain the same */}
          {/* Add Service Modal */}
          <AnimatePresence>
            {isAddModalOpen && selectedGroup && (
              <motion.div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-white p-6 rounded-xl w-96 shadow-xl"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  <h2 className="text-xl font-bold mb-5 text-gray-800">Add New Service</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        Service Name
                      </label>
                      <motion.input
                        type="text"
                        value={newService.name}
                        onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        whileFocus={{ scale: 1.01 }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                          Price
                        </label>
                        <motion.input
                          type="number"
                          value={newService.price}
                          onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          whileFocus={{ scale: 1.01 }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                          Duration (mins)
                        </label>
                        <motion.input
                          type="number"
                          value={newService.duration}
                          onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          whileFocus={{ scale: 1.01 }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <motion.button
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      onClick={handleAddService}
                      className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Add Service
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Edit Service Modal */}
          {isEditModalOpen && serviceToEdit && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Edit Service</h2>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={serviceToEdit.name}
                    onChange={(e) => setServiceToEdit({ ...serviceToEdit, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₱)
                  </label>
                  <input
                    type="number"
                    value={serviceToEdit.price}
                    onChange={(e) => setServiceToEdit({ ...serviceToEdit, price: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (mins)
                  </label>
                  <input
                    type="number"
                    value={serviceToEdit.duration}
                    onChange={(e) => setServiceToEdit({ ...serviceToEdit, duration: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEditedService}
                    className="px-4 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add Group Modal */}
          <AnimatePresence>
            {isAddGroupModalOpen && (
              <motion.div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  <div className="p-6">
                    {/* Modal Header */}
                    <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-200">
                      <h2 className="text-xl font-semibold text-gray-800">
                        Create Services Group
                      </h2>
                      <motion.button
                        onClick={() => setIsAddGroupModalOpen(false)}
                        className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </motion.button>
                    </div>

                    {/* Modal Content */}
                    <div className="space-y-5">
                      {/* Group Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Group Name<span className="text-red-500 ml-1">*</span>
                        </label>
                        <motion.input
                          type="text"
                          value={newGroup.name}
                          onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., Hair Services"
                          autoFocus
                          whileFocus={{ scale: 1.01 }}
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <motion.textarea
                          value={newGroup.description}
                          onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                          rows={3}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Brief description of this service group"
                          whileFocus={{ scale: 1.01 }}
                        />
                      </div>

                      {/* Status Dropdown (Hidden by default, shown if needed) */}
                      {newGroup.hasOwnProperty("status") && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                          </label>
                          <motion.select
                            value={newGroup.status || "Active"}
                            onChange={(e) => setNewGroup({ ...newGroup, status: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            whileFocus={{ scale: 1.01 }}
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </motion.select>
                        </div>
                      )}
                    </div>

                    {/* Modal Footer - Matched to Edit Modal */}
                    <div className="flex space-x-3 pt-6 border-t mt-6">
                      <motion.button
                        onClick={handleAddGroup}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Create Group
                      </motion.button>
                      <motion.button
                        onClick={() => setIsAddGroupModalOpen(false)}
                        className="bg-gray-200 hover:bg-gray-300 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Edit Group Modal */}
          <AnimatePresence>
            {editMode && (
              <motion.div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-white rounded-xl shadow-xl w-full max-w-3xl"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                >
                  <div className="p-6">
                    {/* Modal Header */}
                    <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-200">
                      <h2 className="text-xl font-semibold text-gray-800">
                        Edit Services Group
                      </h2>
                      <motion.button
                        onClick={() => setEditMode(false)}
                        className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </motion.button>
                    </div>

                    {/* 2-Column Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left Column - Form Fields */}
                      <motion.div
                        className="space-y-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        {/* Group Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Group Name
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <motion.input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter group name"
                            autoFocus
                            whileFocus={{ scale: 1.01 }}
                          />
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                          </label>
                          <motion.textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={5}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter description (optional)"
                            whileFocus={{ scale: 1.01 }}
                          />
                        </div>

                        {/* Status Dropdown */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                          </label>
                          <motion.select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            whileFocus={{ scale: 1.01 }}
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </motion.select>
                        </div>
                      </motion.div>

                      {/* Right Column - Services List */}
                      <motion.div
                        className="space-y-4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="h-full flex flex-col">
                          <motion.div
                            className="border border-gray-300 rounded-lg bg-gray-50 p-4 overflow-y-auto max-h-72"
                            whileHover={{ scale: 1.01 }}
                          >
                            {linkedServices.length > 0 ? (
                              <ul className="space-y-2">
                                {linkedServices.map((service, index) => (
                                  <motion.li
                                    key={index}
                                    className="flex items-center p-3 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                  >
                                    <span className="flex-grow text-sm font-medium text-gray-700">
                                      {service.name}
                                    </span>
                                  </motion.li>
                                ))}
                              </ul>
                            ) : (
                              <div className="h-full flex items-center justify-center py-8">
                                <p className="text-gray-500 italic">
                                  No services linked to this group
                                </p>
                              </div>
                            )}
                          </motion.div>
                        </div>
                      </motion.div>
                    </div>

                    {/* Modal Footer */}
                    <div className="flex justify-end space-x-3 pt-6 mt-6 border-t">
                      <motion.button
                        onClick={() => setEditMode(false)}
                        className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        onClick={handleSaveGroup}
                        className="px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Save Changes
                      </motion.button>
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