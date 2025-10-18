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
  X,
  Edit,
  Save,
  Leaf,
  ChevronDown,
  ChevronsLeft,
  Check,
  ChevronRight,
  Search,
  Filter,
  MoreVertical,
  Trash2,
  Copy,
  Eye,
  Plus,
  Menu,
} from "lucide-react";

export default function SettingsPrivileges() {
  const router = useRouter();
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("roles");
  const [editingRoleIndex, setEditingRoleIndex] = useState(null);
  const [editedRoleName, setEditedRoleName] = useState("");
  const [editedPermissions, setEditedPermissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
  const [roles, setRoles] = useState([]);

  const [newRoleName, setNewRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [expandedPermissions, setExpandedPermissions] = useState({});

const [allPermissions, setAllPermissions] = useState([]);

  useEffect(() => {
  fetch("http://localhost/API/roles.php")
    .then(res => res.json())
    .then(data => setRoles(data))
    .catch(err => console.error("Error fetching roles:", err));
}, []);


useEffect(() => {
  fetch("http://localhost/API/permissions.php")
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        // Extract just the names
        setAllPermissions(data.permissions.map(p => p.name));
      }
    })
    .catch(err => console.error("Error fetching permissions:", err));
}, []);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/";
  };

  const Switch = ({ id, checked, onCheckedChange, disabled = false }) => {
    return (
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={onCheckedChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${checked ? "bg-emerald-600" : "bg-gray-200"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"
            }`}
        />
      </button>
    );
  };

  const handleAddRole = () => {
    if (!newRoleName.trim()) {
      toast.error("Role name cannot be empty");
      return;
    }

    if (selectedPermissions.length === 0) {
      toast.error("Please select at least one permission");
      return;
    }

    const newRole = {
      id: roles.length + 1,
      name: newRoleName,
      permissions: selectedPermissions,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setRoles([...roles, newRole]);
    setNewRoleName("");
    setSelectedPermissions([]);
    setIsAddRoleModalOpen(false);
    toast.success("Role added successfully!");
  };

  const [permissions, setPermissions] = useState({
    employeeManagement: true,
    employeeAdd: true,
    employeeEdit: true,
    userManagement: true,
    userAdd: true,
    userEdit: true,
    branchManagement: true,
    branchAdd: true,
    branchEdit: true,
    rolesAccess: true,
    rolesEdit: true,
    rolesAssign: true,
  });

  const togglePermission = (permission) => {
    setPermissions(prev => ({
      ...prev,
      [permission]: !prev[permission]
    }));
    toast.success(`Permission ${!permissions[permission] ? 'enabled' : 'disabled'}`);
  };

  const handleEditRole = (index) => {
    setEditingRoleIndex(index);
    setEditedRoleName(roles[index].name);
    setEditedPermissions([...roles[index].permissions]);
    setIsEditRoleModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editedRoleName.trim()) {
      toast.error("Role name cannot be empty");
      return;
    }

    if (editedPermissions.length === 0) {
      toast.error("Please select at least one permission");
      return;
    }

    const updatedRoles = [...roles];
    updatedRoles[editingRoleIndex] = {
      ...updatedRoles[editingRoleIndex],
      name: editedRoleName,
      permissions: editedPermissions
    };

    setRoles(updatedRoles);
    setEditingRoleIndex(null);
    setIsEditRoleModalOpen(false);
    toast.success("Role updated successfully!");
  };

  const toggleEditPermission = (permission) => {
    if (editedPermissions.includes(permission)) {
      setEditedPermissions(editedPermissions.filter(p => p !== permission));
    } else {
      setEditedPermissions([...editedPermissions, permission]);
    }
  };

  const toggleNewPermission = (permission) => {
    if (selectedPermissions.includes(permission)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== permission));
    } else {
      setSelectedPermissions([...selectedPermissions, permission]);
    }
  };

  const togglePermissionSection = (section) => {
    setExpandedPermissions(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.permissions.some(perm => perm.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const permissionCategories = {
    "Service Management": allPermissions.slice(0, 5),
    "User Management": allPermissions.slice(5, 9),
    "System Access": allPermissions.slice(9, 13),
  };

  // Reset form when modal closes
  const handleAddModalClose = () => {
    setIsAddRoleModalOpen(false);
    setNewRoleName("");
    setSelectedPermissions([]);
  };

  const handleEditModalClose = () => {
    setIsEditRoleModalOpen(false);
    setEditingRoleIndex(null);
    setEditedRoleName("");
    setEditedPermissions([]);
  };

  // Enhanced Sidebar Component
  const Sidebar = () => (
    <motion.nav
      className={`w-64 h-screen bg-gradient-to-b from-emerald-800 to-emerald-700 text-white flex flex-col items-start py-6 fixed top-0 left-0 shadow-lg z-20 transition-transform ${isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}`}
      initial={false}
      animate={{ x: sidebarOpen || !isMobile ? 0 : -256 }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
    >
      {/* Branding with Logo */}
      <div className="flex items-center justify-between w-full px-6 mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/10 rounded-lg flex items-center justify-center">
            <Leaf className="text-emerald-300" size={24} />
          </div>
          <h1 className="text-xl font-bold text-white font-sans tracking-tight">
            Lizly Skin Care
          </h1>
        </div>
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg hover:bg-emerald-600/50"
          >
            <ChevronsLeft size={20} />
          </button>
        )}
      </div>

      {/* Menu Items */}
      <div className="w-full px-4 space-y-1 overflow-y-auto flex-grow custom-scrollbar">
        {[
          { path: "/home", icon: Home, label: "Dashboard" },
          { path: "/roles", icon: Shield, label: "Role Settings" },
          { path: "/employeeM", icon: Users, label: "Employee Management" },
          { path: "/userManage", icon: Users, label: "User Management" },
          { path: "/branchM", icon: Home, label: "Branch Management" },
        ].map((item) => (
          <Link key={item.path} href={item.path} passHref>
            <div
              className={`w-full p-3 rounded-lg text-left flex items-center cursor-pointer transition-all ${pathname === item.path ? "bg-emerald-600 shadow-md" : "hover:bg-emerald-600/70"}`}
            >
              <div
                className={`p-1.5 mr-3 rounded-lg ${pathname === item.path ? "bg-white text-emerald-700" : "bg-emerald-900/30 text-white"}`}
              >
                <item.icon size={18} />
              </div>
              <span>{item.label}</span>
              {pathname === item.path && (
                <motion.div
                  className="ml-auto w-2 h-2 bg-white rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                />
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Sidebar Footer */}
      <div className="mt-auto px-6 w-full">
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
      </div>
    </motion.nav>
  );

  // Add Role Modal Component
  const AddRoleModal = () => (
    <AnimatePresence>
      {isAddRoleModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={handleAddModalClose}
          />
          <motion.div
            initial={false} // ✅ prevents re-animation on re-renders
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Add New Role</h2>
                <button
                  onClick={handleAddModalClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role Name
                    </label>
                    <input
                      type="text"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter role name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Permissions
                    </label>
                    <div className="border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {allPermissions.map((permission) => (
                          <label
                            key={permission}
                            className="flex items-center space-x-3 cursor-pointer select-none"
                          >
                            <input
                              type="checkbox"
                              checked={editedPermissions.includes(permission)}
                              onChange={() => toggleEditPermission(permission)}
                              className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-sm text-gray-700">{permission}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={handleAddModalClose}
                  className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddRole}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Save Role
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Edit Role Modal Component
  const EditRoleModal = () => (
    <AnimatePresence>
      {isEditRoleModalOpen && editingRoleIndex !== null && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={handleEditModalClose}
          />
          <motion.div
            initial={false} // ✅ prevents re-animation on re-renders
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Edit Role</h2>
                <button
                  onClick={handleEditModalClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role Name
                    </label>
                    <input
                      type="text"
                      value={editedRoleName}
                      onChange={(e) => setEditedRoleName(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter role name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Permissions
                    </label>
                    <div className="border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {allPermissions.map((permission) => (
                          <label
                            key={permission}
                            className="flex items-center space-x-3 cursor-pointer select-none"
                          >
                            <input
                              type="checkbox"
                              checked={editedPermissions.includes(permission)}
                              onChange={() => toggleEditPermission(permission)}
                              className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-sm text-gray-700">{permission}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={handleEditModalClose}
                  className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );


  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
      <Toaster position="top-right" />

      {/* Modals */}
      <AddRoleModal />
      <EditRoleModal />

      {/* Mobile Header */}
      {isMobile && (
        <header className="flex items-center justify-between bg-emerald-700 text-white p-4 w-full h-16 sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-emerald-600"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-lg font-bold">Settings & Privileges</h1>
          <div className="w-8"></div> {/* Spacer for balance */}
        </header>
      )}

      {/* Desktop Header */}
      {!isMobile && (
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
                  className="absolute top-12 right-0 bg-white shadow-xl rounded-lg w-48 overflow-hidden z-30"
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
                  <Link href="/roles">
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
      )}

      {/* Sidebar */}
      <Sidebar />

      {/* Overlay for mobile sidebar */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className={`flex-1 p-4 md:p-6 transition-all duration-300 ${isMobile ? '' : 'ml-0 md:ml-64'}`}>
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Settings & Privileges
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage system roles and permissions
            </p>
          </div>

          {/* Mobile Profile Button */}
          {isMobile && (
            <div className="flex items-center space-x-4 mt-4 md:mt-0 relative">
              <div
                className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-sm font-bold cursor-pointer hover:bg-amber-600 transition-colors"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                A
              </div>
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    className="absolute top-10 right-0 bg-white shadow-xl rounded-lg w-48 overflow-hidden z-30"
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
                    <Link href="/roles">
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
          )}
        </motion.div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab("roles")}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${activeTab === "roles" ? "text-emerald-600 border-b-2 border-emerald-600" : "text-gray-500 hover:text-gray-700"}`}
          >
            Roles Management
          </button>
          <button
            onClick={() => setActiveTab("advanced")}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${activeTab === "advanced" ? "text-emerald-600 border-b-2 border-emerald-600" : "text-gray-500 hover:text-gray-700"}`}
          >
            Advanced Permissions
          </button>
        </div>

        {/* Roles Tab Content */}
        {activeTab === "roles" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Roles Management
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Create and manage user roles with specific permissions
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search roles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <button
                    onClick={() => setIsAddRoleModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg whitespace-nowrap"
                  >
                    <Plus size={18} />
                    <span>New Role</span>
                  </button>
                </div>
              </div>

              {/* Roles Table */}
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role Name
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Permissions
                      </th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRoles.length > 0 ? filteredRoles.map((role, index) => (
                      <tr key={role.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mr-3">
                              <Shield size={16} className="text-emerald-600" />
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              {role.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.slice(0, 3).map((perm, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full"
                              >
                                {perm.length > 20 ? `${perm.substring(0, 20)}...` : perm}
                              </span>
                            ))}
                            {role.permissions.length > 3 && (
                              <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                                +{role.permissions.length - 3} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEditRole(index)}
                              className="text-emerald-600 hover:text-emerald-900 p-1 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="3" className="px-4 py-8 text-center text-gray-500">
                          No roles found matching your search criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="md:hidden space-y-4 mt-4">
                {filteredRoles.map((role, index) => (
                  <div key={role.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mr-3">
                          <Shield size={16} className="text-emerald-600" />
                        </div>
                        <div className="font-medium text-gray-900">{role.name}</div>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEditRole(index)}
                          className="text-emerald-600 hover:text-emerald-900 p-1"
                        >
                          <Edit size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {role.permissions.slice(0, 2).map((perm, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                          {perm.length > 20 ? `${perm.substring(0, 20)}...` : perm}
                        </span>
                      ))}
                      {role.permissions.length > 2 && (
                        <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                          +{role.permissions.length - 2} more
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      Created: {role.createdAt}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Advanced Permissions Tab Content */}
        {activeTab === "advanced" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="p-4 md:p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Advanced Permissions
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Toggle permissions for different user roles. Changes will be applied immediately.
              </p>

              <div className="space-y-4">
                {Object.entries(permissionCategories).map(([category, perms]) => (
                  <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => togglePermissionSection(category)}
                      className="w-full p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                          <Shield size={16} className="text-emerald-600" />
                        </div>
                        <span className="font-medium text-gray-700 text-left">{category}</span>
                      </div>
                      <ChevronDown
                        className={`text-gray-400 transition-transform ${expandedPermissions[category] ? 'rotate-180' : ''}`}
                        size={20}
                      />
                    </button>

                    <AnimatePresence>
                      {expandedPermissions[category] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                          {perms.map((permission) => (
                            <div key={permission} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-sm text-gray-700">{permission}</span>
                              <Switch
                                id={permission}
                                checked={selectedPermissions.includes(permission) || permissions[permission]}
                                onCheckedChange={() => toggleNewPermission(permission)}
                              />
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}