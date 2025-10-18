"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Toaster, toast } from "sonner";
import { Dialog } from "@headlessui/react";
import { Menu } from "@headlessui/react";
import { BarChart } from "lucide-react";
import { Folder, ClipboardList, Factory, ShoppingBag } from "lucide-react";
import { Home, Users, FileText, CreditCard, Package, Layers, ShoppingCart, Settings, LogOut, Plus } from "lucide-react";


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

export default function InventoryPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalType, setModalType] = useState("view");
    const [isMoreModalOpen, setIsMoreModalOpen] = useState(false);
    const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const [newItem, setNewItem] = useState({
        name: "",
        category: "",
        type: "",
        stockQty: 0,
        service: "",
        description: "",
        unitPrice: 0,
        supplier: "",
    });

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch("http://localhost/API/getInventory.php?action=get_products");
                const data = await res.json();
                setProducts(data);
            } catch (error) {
                toast.error("Error fetching products.");
                console.error("Error fetching products:", error);
            }
        };

        fetchProducts();
    }, []);

    const handleSearch = () => {
        toast(`Searching for: ${searchQuery}`);
    };

    const handleSelectItem = (item) => {
        setSelectedItem(item);
    };

    const handleEdit = () => {
        setModalType("edit");
        setIsModalOpen(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            action: "edit_item",
            id: selectedItem.id, // Ensure selectedItem is defined and has an id
            name: selectedItem.name,
            category: selectedItem.category,
            type: selectedItem.type,
            stockQty: selectedItem.stockQty,
            service: selectedItem.service,
            description: selectedItem.description,
            unitPrice: selectedItem.unitPrice,
            supplier: selectedItem.supplier,
        };

        try {
            const response = await fetch("http://localhost/API/addItem.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Item updated successfully!");
                setIsModalOpen(false);
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            toast.error("Error updating item.");
            console.error("Error updating item:", error);
        }
    };

    const handleCloneItem = async () => {
        const payload = {
            action: "clone_item",
            id: selectedItem.id,
        };

        const response = await fetch("http://localhost/API/addItem.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (data.success) {
            toast.success("Item cloned successfully!");
            setIsMoreModalOpen(false);
        } else {
            toast.error(data.error);
        }
    };

    const handleMarkAsInactive = async () => {
        const payload = {
            action: "mark_as_inactive",
            id: selectedItem.id,
        };

        const response = await fetch("http://localhost/API/addItem.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (data.success) {
            toast.success("Item marked as inactive!");
            setIsMoreModalOpen(false);
        } else {
            toast.error(data.error);
        }
    };

    const handleDelete = async () => {
        if (window.confirm(`Are you sure you want to delete ${selectedItem.name}?`)) {
            const payload = {
                action: "delete_item",
                id: selectedItem.id,
            };

            const response = await fetch("http://localhost/API/addItem.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Item deleted successfully!");
                setSelectedItem(null);
                setIsMoreModalOpen(false);
            } else {
                toast.error(data.error);
            }
        }
    };

    const handleAddToGroup = async () => {
        const groupId = prompt("Enter the group ID:");
        if (groupId) {
            const payload = {
                action: "add_to_group",
                id: selectedItem.id,
                groupId: groupId,
            };

            const response = await fetch("http://localhost/API/addItem.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Item added to group successfully!");
                setIsMoreModalOpen(false);
            } else {
                toast.error(data.error);
            }
        }
    };

    const handleCheckboxChange = (item) => {
        if (selectedItem?.name === item.name) {
            setSelectedItem(null);
        } else {
            setSelectedItem(item);
        }
    };

    const handleAddItem = () => {
        setIsAddItemModalOpen(true);
    };

    const handleNewItemChange = (e) => {
        const { name, value } = e.target;
        setNewItem((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAddItemSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost/API/addItem.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    action: "add_item",
                    ...newItem,
                }),
            });

            const data = await response.json();

            if (data.success) {
                const res = await fetch("http://localhost/API/getInventory.php?action=get_products");
                const updatedProducts = await res.json();
                setProducts(updatedProducts);
                toast.success("Item added successfully!");
                setIsAddItemModalOpen(false);
                setNewItem({
                    name: "",
                    category: "",
                    type: "",
                    stockQty: 0,
                    service: "",
                    description: "",
                    unitPrice: 0,
                    supplier: "",
                });
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            toast.error("Error adding item.");
            console.error("Error adding item:", error);
        }
    };


    const handleLogout = () => {
        localStorage.removeItem("authToken");
        window.location.href = "/";
    };

    return (
        <div className="flex flex-col h-screen bg-gradient-to-b from-[#77DD77] to-[#56A156] text-gray-900">
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
                <main className="flex-1 p-8 p-6 bg-white max-w-screen-xl mx-auto ml-64">
                    {/* Table Section */}
                    <div className={`flex-1 pr-4 transition-all ${selectedItem ? "w-[calc(100%-300px)]" : "w-full"}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h1 className="text-2xl font-bold">All Items</h1>
                            <button
                                onClick={handleAddItem}
                                className="bg-[#5BBF5B] text-white py-2 px-4 rounded hover:bg-[#56AE57]"
                            >
                                + New Item
                            </button>
                        </div>

                        <table className="w-full bg-gray-400 shadow-lg border border-gray-400 rounded-lg overflow-hidden">
                            <thead className="bg-[#5BBF5B] text-black">
                                <tr>
                                    <th className="text-center py-2 px-4 w-12"></th>
                                    <th className="text-left py-2 px-4">Name</th>
                                    <th className="text-left py-2 px-4">Category</th>
                                    <th className="text-left py-2 px-4">Type</th>
                                    <th className="text-right py-2 px-4">Stock Qty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((item, index) => (
                                    <tr
                                        key={index}
                                        className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100`}
                                    >
                                        <td className="py-2 px-4 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedItem?.name === item.name}
                                                onChange={() => handleCheckboxChange(item)}
                                                className="w-4 h-4 text-[#56A156] rounded focus:ring-[#56A156]"
                                            />
                                        </td>
                                        <td className="py-2 px-4 text-blue-600 underline cursor-pointer">
                                            {item.name}
                                        </td>
                                        <td className="py-2 px-4">{item.category}</td>
                                        <td className="py-2 px-4">{item.type}</td>
                                        <td className="py-2 px-4 text-right">{item.stockQty}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Selected Item Details Section */}
                    {selectedItem && (
                        <div className="w-[300px] bg-white rounded-lg shadow-md border border-gray-400 p-4 fixed right-4 top-20">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">{selectedItem.name}</h2>
                                <button
                                    onClick={handleEdit}
                                    className="p-1 text-gray-700 hover:bg-gray-100 rounded"
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={() => setIsMoreModalOpen(true)}
                                    className="p-1 text-gray-700 hover:bg-gray-100 rounded"
                                >
                                    More
                                </button>
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>
                            <table className="w-full">
                                <tbody>
                                    <tr>
                                        <td className="font-medium py-2">Service type:</td>
                                        <td className="py-2">{selectedItem.service || "Hair Services"}</td>
                                    </tr>
                                    <tr>
                                        <td className="font-medium py-2">Description:</td>
                                        <td className="py-2">{selectedItem.description || "Professional hair care product"}</td>
                                    </tr>
                                    <tr>
                                        <td className="font-medium py-2">Category:</td>
                                        <td className="py-2">{selectedItem.category}</td>
                                    </tr>
                                    <tr>
                                        <td className="font-medium py-2">Stock Quantity:</td>
                                        <td className="py-2">{selectedItem.stockQty}</td>
                                    </tr>
                                    <tr>
                                        <td className="font-medium py-2">Unit Price:</td>
                                        <td className="py-2">P{selectedItem.unitPrice || "395"}</td>
                                    </tr>
                                    <tr>
                                        <td className="font-medium py-2">Total Value:</td>
                                        <td className="py-2">P{(selectedItem.stockQty * (selectedItem.unitPrice || 395)).toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td className="font-medium py-2">Supplier Name:</td>
                                        <td className="py-2">{selectedItem.supplier || "James"}</td>
                                    </tr>
                                    <tr>
                                        <td className="font-medium py-2">Inventory Link:</td>
                                        <td className="py-2">
                                            <Link href="/inventory" className="text-blue-600 hover:underline">
                                                Hair Services
                                            </Link>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <div className="flex justify-end space-x-2 mt-4">

                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Add Item Modal */}
            {isAddItemModalOpen && (
                <Dialog open={isAddItemModalOpen} onClose={() => setIsAddItemModalOpen(false)} className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <Dialog.Panel className="bg-white bg-opacity-100 p-6 rounded-lg shadow-xl w-96">
                        <Dialog.Title className="text-lg font-bold mb-4 text-gray-800">Add New Item</Dialog.Title>
                        <form onSubmit={handleAddItemSubmit}>
                            <div className="space-y-4">
                                {/* Row for each form field */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={newItem.name}
                                            onChange={handleNewItemChange}
                                            className="w-full px-3 py-2 border rounded-lg bg-lime-200 text-gray-900 border border-lime-400"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Category</label>
                                        <input
                                            type="text"
                                            name="category"
                                            value={newItem.category}
                                            onChange={handleNewItemChange}
                                            className="w-full px-3 py-2 border rounded-lg bg-lime-200 text-gray-900 border border-lime-400"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Type</label>
                                        <input
                                            type="text"
                                            name="type"
                                            value={newItem.type}
                                            onChange={handleNewItemChange}
                                            className="w-full px-3 py-2 border rounded-lg bg-lime-200 text-gray-900 border border-lime-400"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                                        <input
                                            type="number"
                                            name="stockQty"
                                            value={newItem.stockQty}
                                            onChange={handleNewItemChange}
                                            className="w-full px-3 py-2 border rounded-lg bg-lime-200 text-gray-900 border border-lime-400"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Unit Price</label>
                                        <input
                                            type="number"
                                            name="unitPrice"
                                            value={newItem.unitPrice}
                                            onChange={handleNewItemChange}
                                            className="w-full px-3 py-2 border rounded-lg bg-lime-200 text-gray-900 border border-lime-400"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Supplier</label>
                                        <input
                                            type="text"
                                            name="supplier"
                                            value={newItem.supplier}
                                            onChange={handleNewItemChange}
                                            className="w-full px-3 py-2 border rounded-lg bg-lime-200 text-gray-900 border border-lime-400"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAddItemModalOpen(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    onClick={() => handleAddItemSubmit}
                                    className="px-4 py-2 bg-[#5BBF5B] text-white rounded hover:bg-[#4CAF4C]"
                                >
                                    Add Item
                                </button>
                            </div>
                        </form>
                    </Dialog.Panel>
                </Dialog>
            )}

            {/* More Button Modal */}
            {isMoreModalOpen && (
                <Dialog open={isMoreModalOpen} onClose={() => setIsMoreModalOpen(false)} className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <Dialog.Panel className="bg-white p-6 rounded-lg shadow-xl w-80">
                        <Dialog.Title className="text-lg font-bold mb-4 text-gray-800">
                            More Options
                        </Dialog.Title>
                        <div className="space-y-2">
                            <button
                                onClick={handleCloneItem}
                                className="w-full p-2 text-left hover:bg-gray-100 rounded text-gray-800"
                            >
                                Clone Item
                            </button>
                            <button
                                onClick={handleMarkAsInactive}
                                className="w-full p-2 text-left hover:bg-gray-100 rounded text-gray-800"
                            >
                                Mark as Inactive
                            </button>
                            <button
                                onClick={handleDelete}
                                className="w-full p-2 text-left hover:bg-gray-100 rounded text-red-600 text-gray-800"
                            >
                                Delete
                            </button>
                            <button
                                onClick={handleAddToGroup}
                                className="w-full p-2 text-left hover:bg-gray-100 rounded text-gray-800"
                            >
                                Add to Group
                            </button>
                        </div>
                        <button
                            onClick={() => setIsMoreModalOpen(false)}
                            className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-gray-800"
                        >
                            Close
                        </button>
                    </Dialog.Panel>
                </Dialog>
            )}

            {/* Modal Dialog */}
            {isModalOpen && (
                <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <Dialog.Panel className="bg-white p-6 rounded-lg shadow-xl">
                        <Dialog.Title className="text-lg font-bold mb-4">
                            {modalType === "view" ? "View Item" : "Edit Item"}
                        </Dialog.Title>
                        <p>Name: {selectedItem?.name}</p>
                        <p>Category: {selectedItem?.category}</p>
                        {modalType === "edit" && (
                            <input
                                type="text"
                                className="border p-2 mt-2 w-full"
                                defaultValue={selectedItem?.name}
                            />
                        )}
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
                        >
                            Close
                        </button>
                    </Dialog.Panel>
                </Dialog>
            )}

            {isModalOpen && modalType === "edit" && (
                <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <Dialog.Panel className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <Dialog.Title className="text-lg font-bold mb-4 text-gray-800">Edit Item</Dialog.Title>
                        <form onSubmit={handleEditSubmit}>
                            <div className="space-y-4">
                                {/* Row for each form field */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={selectedItem?.name || ""}
                                            onChange={(e) => setSelectedItem({ ...selectedItem, name: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg bg-lime-200 text-gray-900 border border-lime-400"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Category</label>
                                        <input
                                            type="text"
                                            name="category"
                                            value={selectedItem?.category || ""}
                                            onChange={(e) => setSelectedItem({ ...selectedItem, category: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg bg-lime-200 text-gray-900 border border-lime-400"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Type</label>
                                        <input
                                            type="text"
                                            name="type"
                                            value={selectedItem?.type || ""}
                                            onChange={(e) => setSelectedItem({ ...selectedItem, type: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg bg-lime-200 text-gray-900 border border-lime-400"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                                        <input
                                            type="number"
                                            name="stockQty"
                                            value={selectedItem?.stockQty || 0}
                                            onChange={(e) => setSelectedItem({ ...selectedItem, stockQty: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg bg-lime-200 text-gray-900 border border-lime-400"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Unit Price</label>
                                        <input
                                            type="number"
                                            name="unitPrice"
                                            value={selectedItem?.unitPrice || 0}
                                            onChange={(e) => setSelectedItem({ ...selectedItem, unitPrice: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg bg-lime-200 text-gray-900 border border-lime-400"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Supplier</label>
                                        <input
                                            type="text"
                                            name="supplier"
                                            value={selectedItem?.supplier || ""}
                                            onChange={(e) => setSelectedItem({ ...selectedItem, supplier: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg bg-lime-200 text-gray-900 border border-lime-400"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    onClick={() => handleEditSubmit}
                                    className="px-4 py-2 bg-[#5BBF5B] text-white rounded hover:bg-[#4CAF4C]"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </Dialog.Panel>
                </Dialog>
            )}
        </div>
    );
}