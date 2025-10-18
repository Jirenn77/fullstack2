"use client";

import { useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';
import BackButton from '../components/BackButton';

export default function ViewInvoice() {
    const [invoices, setInvoices] = useState([]);
    const [customerFilter, setCustomerFilter] = useState(''); // State for filtering by customer name
    const [statusFilter, setStatusFilter] = useState(''); // State for filtering by status

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const res = await fetch(`http://localhost/API/getBalance.php?action=get_invoices`);
                const data = await res.json();

                if (data && data.invoices) {
                    const invoicesWithNumericAmount = data.invoices.map(invoice => ({
                        ...invoice,
                        TotalAmount: Number(invoice.TotalAmount),
                    }));

                    setInvoices(invoicesWithNumericAmount);
                } else {
                    throw new Error('Invalid response from server');
                }
            } catch (error) {
                toast.error('Error fetching invoices.');
                console.error('Error fetching invoices:', error);
            }
        };

        fetchInvoices(); // Fetch all invoices
    }, []); // Run only once when the component mounts

    // Handle deleting an invoice
    const deleteInvoice = async (invoiceId) => {
        try {
            const res = await fetch(`http://localhost/API/getBalance.php?action=delete_invoice&id=${invoiceId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                toast.success('Invoice deleted successfully.');
                // Update invoices state without the deleted invoice
                setInvoices(invoices.filter((invoice) => invoice.InvoiceID !== invoiceId));
            } else {
                toast.error('Failed to delete invoice.');
            }
        } catch (error) {
            toast.error('Error deleting invoice.');
            console.error('Error deleting invoice:', error);
        }
    };

    // Filter invoices by customer name and status
    const filteredInvoices = invoices.filter(invoice => {
        const matchesCustomer = invoice.CustomerName.toLowerCase().includes(customerFilter.toLowerCase());
        const matchesStatus = statusFilter ? invoice.PaymentStatus === statusFilter : true;
        return matchesCustomer && matchesStatus;
    });

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
            <Toaster />
            <h3 className="text-2xl font-bold mb-6 text-center">View Invoices</h3>

            {/* Customer Name Filter */}
            <input
                type="text"
                placeholder="Filter by Customer Name"
                className="mb-4 px-4 py-2 rounded bg-gray-700 text-white w-full max-w-xs"
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
            />

            {/* Status Filter */}
            <select
                className="mb-4 px-4 py-2 rounded bg-gray-700 text-white w-full max-w-xs"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
            >
                <option value="">Filter by Status</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Overdue">Overdue</option>
                {/* Add more statuses as needed */}
            </select>

            <div className="overflow-x-auto w-full max-w-6xl">
                <table className="min-w-full bg-gray-800 rounded-lg shadow-lg">
                    <thead>
                        <tr className="bg-gray-700 text-left">
                            <th className="py-3 px-4">Invoice ID</th>
                            <th className="py-3 px-4">Customer</th>
                            <th className="py-3 px-4">Product</th>
                            <th className="py-3 px-4">Quantity</th>
                            <th className="py-3 px-4">Total Amount</th>
                            <th className="py-3 px-4">Invoice Date</th>
                            <th className="py-3 px-4">Due Date</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInvoices.length > 0 ? (
                            filteredInvoices.map((invoice) => (
                                <tr key={invoice.InvoiceID} className="hover:bg-gray-700 transition-colors duration-200">
                                    <td className="py-3 px-4">{invoice.InvoiceID}</td>
                                    <td className="py-3 px-4">{invoice.CustomerName}</td>
                                    <td className="py-3 px-4">{invoice.ProductName}</td>
                                    <td className="py-3 px-4">{invoice.Quantity}</td>
                                    <td className="py-3 px-4">₱{invoice.TotalAmount.toFixed(2)}</td>
                                    <td className="py-3 px-4">{new Date(invoice.InvoiceDate).toLocaleString()}</td>
                                    <td className="py-3 px-4">{new Date(invoice.DueDate).toLocaleString()}</td>
                                    <td className="py-3 px-4">{invoice.PaymentStatus}</td>
                                    <td className="py-3 px-4">
                                        <button 
                                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                            onClick={() => deleteInvoice(invoice.InvoiceID)}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9" className="py-3 px-4 text-center">No invoices found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-6">
                <BackButton />
            </div>
        </div>
    );
}
