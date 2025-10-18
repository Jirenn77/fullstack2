"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import { Menu } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/solid";
import { BarChart, Pencil, Trash2, ArrowLeft, BarChart3 } from "lucide-react";
import { Folder, ClipboardList, Factory, ShoppingBag, Tag } from "lucide-react";
import { Home, Users, FileText, CreditCard, Package, Layers, ShoppingCart, Settings, LogOut, UserPlus } from "lucide-react";

const navLinks = [
    { href: "/servicess", label: "Services", icon: "💆‍♀️" },
    { href: "/price-list", label: "Price List", icon: "📋" },
    { href: "/items", label: "Item Groups", icon: "📂" },
];

const salesLinks = [
    { href: "/customers", label: "Customers", icon: "👥" },
    { href: "/invoices", label: "Invoices", icon: "📜" },
    { href: "/payments", label: "Payments", icon: "💰" },
];

export default function ServiceGroupsPage() {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [services, setServices] = useState([]);
    const [groups, setGroups] = useState([
        { name: "Hair Services", description: "Description", services: "16 Active Services" },
        { name: "Body and Relaxing Services", description: "Description", services: "3 Active Services" },
        { name: "Diode Lazer Services", description: "Description", services: "8 Active Services" },
        { name: "Nails and Foot Services", description: "Description", services: "6 Active Services" },
    ]);

    const [editingGroupIndex, setEditingGroupIndex] = useState(null);
    const [editedGroup, setEditedGroup] = useState({
        name: "",
        description: "",
        services: ""
    });

    const [newGroup, setNewGroup] = useState({
        name: "",
        description: "",
        services: "0 Active Services",
    });

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await fetch('http://localhost/API/category.php?action=get_services');
                const data = await response.json();
                if (response.ok) {
                    setServices(data);
                } else {
                    toast.error("Failed to fetch services.");
                }
            } catch (error) {
                toast.error("Error fetching services.");
            }
        };

        fetchServices();
    }, []);

    const handleSearch = () => {
        const filteredGroups = groups.filter(group =>
            group.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setGroups(filteredGroups);
    };

    const handleAddGroup = () => {
        setIsAddGroupModalOpen(true);
    };

    const handleEditGroup = (index) => {
        setSelectedGroup({ ...groups[index], index });
        setIsModalOpen(true);
    };

    const handleDeleteGroup = (index) => {
        setGroups((prev) => prev.filter((_, i) => i !== index));
        toast.success("Service group deleted successfully!");
    };

    const handleSaveGroup = () => {
        if (selectedGroup) {
            const updatedGroups = [...groups];
            updatedGroups[selectedGroup.index] = {
                name: selectedGroup.name,
                description: selectedGroup.description,
                services: selectedGroup.services,
            };
            setGroups(updatedGroups);
            toast.success("Service group updated successfully!");
        }
        setIsModalOpen(false);
    };

    const handleAddGroupSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost/API/addgroup.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newGroup),
            });
            const result = await response.json();
            if (response.ok) {
                setGroups((prev) => [...prev, newGroup]);
                toast.success(result.message);
                setIsAddGroupModalOpen(false);
                setNewGroup({
                    name: "",
                    description: "",
                    services: "0 Active Services",
                });
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Failed to add service group.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        window.location.href = "/home";
    };

    const handleEditClick = (index) => {
        setEditingGroupIndex(index);
        setEditedGroup({
            name: groups[index].name,
            description: groups[index].description,
            services: groups[index].services
        });
    };

    const handleSaveEdit = async (index) => {
        try {
            const response = await fetch('http://localhost/API/updategroup.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: index, // or use a proper ID from your data
                    ...editedGroup
                }),
            });

            if (response.ok) {
                const updatedGroups = [...groups];
                updatedGroups[index] = editedGroup;
                setGroups(updatedGroups);
                setEditingGroupIndex(null);
                toast.success("Service group updated successfully!");
            } else {
                toast.error("Failed to update service group.");
            }
        } catch (error) {
            toast.error("Error updating service group.");
        }
    };

    const handleCancelEdit = () => {
        setEditingGroupIndex(null);
    };

    // Function to handle input changes during editing
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditedGroup(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100 text-gray-900">
            <Toaster />

            {/* Header */}
            <header className="flex items-center justify-between bg-[#89C07E] text-white p-4 w-full h-16 pl-64 relative">
                <div className="flex items-center space-x-4">
                    {/* Home icon removed from here */}
                </div>

                <div className="flex items-center space-x-4 flex-grow justify-center">
                    <button className="text-2xl" onClick={() => setIsModalOpen(true)}>
                        ➕
                    </button>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="px-4 py-2 rounded-lg bg-white text-gray-900 w-64 focus:outline-none"
                    />
                    <button
                        onClick={handleSearch}
                        className="bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg transition-colors text-md"
                    >
                        Search
                    </button>
                </div>

                <div className="flex items-center space-x-4 relative">
                    <div
                        className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-lg font-bold cursor-pointer"
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                    >
                        A
                    </div>
                    {isProfileOpen && (
                        <div className="bg-green-500 absolute top-12 right-0 text-white shadow-lg rounded-lg w-48 p-2 flex flex-col animate-fade-in text-start">
                            <Link href="/acc-settings">
                                <button className="flex items-center gap-2 px-4 py-2 hover:bg-green-600 rounded w-full justify-start">
                                    <User size={16} /> Edit Profile
                                </button>
                            </Link>
                            <Link href="/settings">
                                <button className="flex items-center gap-2 px-4 py-2 hover:bg-green-600 rounded w-full justify-start">
                                    <Settings size={16} /> Settings
                                </button>
                            </Link>
                            <button className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded justify-start" onClick={handleLogout}>
                                <LogOut size={16} /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Sidebar */}
            <div className="flex flex-1">
                <nav className="w-64 h-screen bg-gradient-to-b from-[#467750] to-[#56A156] text-gray-900 flex flex-col items-center py-6 fixed top-0 left-0">
                    <div className="flex items-center space-x-2 mb-4">
                        <h1 className="text-xl font-bold text-white flex items-center space-x-2">
                            <span>Lizly Skin Care Clinic</span>
                        </h1>
                    </div>

                    {/* Home Menu Button */}
                    <Menu as="div" className="relative w-full px-4 mt-4">
                        <Link href="/home" passHref>
                            <Menu.Button as="div" className="w-full p-3 bg-[#467750] rounded-lg hover:bg-[#2A3F3F] text-white text-left font-normal md:font-bold flex items-center cursor-pointer">
                                <Home className="text-2xl"></Home>
                                <span className="ml-2">Dashboard</span>
                            </Menu.Button>
                        </Link>
                    </Menu>

                    <Menu as="div" className="relative w-full px-4 mt-4">
                        <Menu.Button className="w-full p-3 bg-[#467750] rounded-lg hover:bg-[#2A3F3F] text-white text-left font-normal md:font-bold flex items-center">
                            <Layers className="mr-2" size={20} /> Services ▾
                        </Menu.Button>
                        <Menu.Items className="absolute left-4 mt-2 w-full bg-[#467750] text-white rounded-lg shadow-lg z-10">
                            {[
                                { href: "/servicess", label: "All Services", icon: <Layers size={20} /> },
                                { href: "/membership", label: "Memberships", icon: <UserPlus size={20} /> }, // or <Users />
                                { href: "/items", label: "Beauty Deals", icon: <Tag size={20} /> },
                                { href: "/serviceorder", label: "Service Orders", icon: <ClipboardList size={20} /> },
                                { href: "/servicegroup", label: "Service Groups", icon: <Folder size={20} /> }, // or <Layers />
                            ].map((link) => (
                                <Menu.Item key={link.href}>
                                    {({ active }) => (
                                        <Link href={link.href} className={`flex items-center space-x-4 p-3 rounded-lg ${active ? 'bg-[#2A3F3F] text-white' : ''}`}>
                                            {link.icon}
                                            <span className="font-normal md:font-bold">{link.label}</span>
                                        </Link>
                                    )}
                                </Menu.Item>
                            ))}
                        </Menu.Items>
                    </Menu>

                    <Menu as="div" className="relative w-full px-4 mt-4">
                        <Menu.Button className="w-full p-3 bg-[#467750] rounded-lg hover:bg-[#2A3F3F] text-white text-left font-normal md:font-bold flex items-center">
                            <BarChart className="mr-2" size={20} /> Sales ▾
                        </Menu.Button>
                        <Menu.Items className="absolute left-4 mt-2 w-full bg-[#467750] text-white rounded-lg shadow-lg z-10">
                            {[
                                { href: "/customers", label: "Customers", icon: <Users size={20} /> },
                                { href: "/invoices", label: "Invoices", icon: <FileText size={20} /> },
                            ].map((link) => (
                                <Menu.Item key={link.href}>
                                    {({ active }) => (
                                        <Link href={link.href} className={`flex items-center space-x-4 p-3 rounded-lg ${active ? 'bg-[#2A3F3F] text-white' : ''}`}>
                                            {link.icon}
                                            <span className="font-normal md:font-bold">{link.label}</span>
                                        </Link>
                                    )}
                                </Menu.Item>
                            ))}
                        </Menu.Items>
                    </Menu>
                </nav>

                {/* Main Content */}
                <main className="flex-1 p-6 bg-white text-gray-900 ml-64">
                    {/* Header section */}
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">All Services Groups</h2>
                        <div className="flex space-x-2">
                            <button
                                className="px-4 py-2 bg-[#5BBF5B] text-white rounded-lg hover:bg-[#56AE57]"
                                onClick={handleAddGroup}
                            >
                                New Group List
                            </button>
                            <button className="px-4 py-2 bg-gray-300 rounded-lg">
                                <EllipsisVerticalIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Service Groups Table */}
                    <div className="p-6 bg-white rounded-lg shadow-lg border border-gray-400">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-300">
                                    <th className="py-2 px-4 font-medium">Name and Description</th>
                                    <th className="py-2 px-4 font-medium">Number of Services</th>
                                    <th className="py-2 px-4 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groups.map((group, index) => (
                                    <tr key={index} className="border-b border-gray-300">
                                        <td className="py-2 px-4">
                                            {editingGroupIndex === index ? (
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={editedGroup.name}
                                                    onChange={handleEditChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                                                />
                                            ) : (
                                                <h3 className="font-semibold">{group.name}</h3>
                                            )}
                                            {editingGroupIndex === index ? (
                                                <textarea
                                                    name="description"
                                                    value={editedGroup.description}
                                                    onChange={handleEditChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                />
                                            ) : (
                                                <p className="text-sm text-gray-600">{group.description}</p>
                                            )}
                                        </td>
                                        <td className="py-2 px-4">
                                            {editingGroupIndex === index ? (
                                                <input
                                                    type="text"
                                                    name="services"
                                                    value={editedGroup.services}
                                                    onChange={handleEditChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                />
                                            ) : (
                                                group.services
                                            )}
                                        </td>
                                        <td className="py-2 px-4">
                                            {editingGroupIndex === index ? (
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleSaveEdit(index)}
                                                        className="p-2 text-white bg-green-500 rounded-lg hover:bg-green-600"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className="p-2 text-white bg-gray-500 rounded-lg hover:bg-gray-600"
                                                    >
                                                        <ArrowLeft className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEditClick(index)}
                                                        className="p-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteGroup(index)}
                                                        className="p-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Edit Group Modal */}
                    {isModalOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                            <div className="bg-white bg-opacity-90 p-6 rounded-lg shadow-lg w-96">
                                <h2 className="text-lg font-bold mb-4">Edit Service Group</h2>
                                <label className="block text-sm font-medium">Group Name</label>
                                <input
                                    type="text"
                                    value={selectedGroup?.name || ""}
                                    onChange={(e) => setSelectedGroup({ ...selectedGroup, name: e.target.value })}
                                    className="w-full px-3 py-2 border bg-lime-200 text-gray-900 border border-lime-400 rounded-lg mb-3"
                                />
                                <label className="block text-sm font-medium">Description</label>
                                <textarea
                                    value={selectedGroup?.description || ""}
                                    onChange={(e) => setSelectedGroup({ ...selectedGroup, description: e.target.value })}
                                    className="w-full px-3 py-2 border bg-lime-200 text-gray-900 border border-lime-400 rounded-lg mb-3"
                                ></textarea>
                                <div className="flex justify-between">
                                    <button className="px-4 py-2 bg-gray-300 rounded-lg" onClick={() => setIsModalOpen(false)}>
                                        Cancel
                                    </button>
                                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg" onClick={() => handleDeleteGroup(selectedGroup.index)}>
                                        Delete
                                    </button>
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg" onClick={handleSaveGroup}>
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Add Group Modal */}
                    {isAddGroupModalOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                            <div className="bg-white bg-opacity-85 p-6 rounded-lg shadow-lg w-96">
                                <h2 className="text-lg font-bold mb-4">Add New Service Group</h2>
                                <form onSubmit={handleAddGroupSubmit}>
                                    <label className="block text-sm font-medium">Group Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={newGroup.name}
                                        onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                                        className="w-full px-3 py-2 border bg-lime-200 text-gray-900 border border-lime-400 rounded-lg mb-3"
                                        required
                                    />
                                    <label className="block text-sm font-medium">Description</label>
                                    <textarea
                                        name="description"
                                        value={newGroup.description}
                                        onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                                        className="w-full px-3 py-2 border bg-lime-200 text-gray-900 border border-lime-400 rounded-lg mb-3"
                                        required
                                    ></textarea>
                                    <div className="flex justify-between">
                                        <button
                                            type="button"
                                            className="px-4 py-2 bg-red-500 hover:bg-red-400 rounded-lg"
                                            onClick={() => setIsAddGroupModalOpen(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-[#5BBF5B] hover:bg-[#56AE57] text-white rounded-lg"
                                        >
                                            Add Group
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}