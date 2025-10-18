"use client";

import { useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';
import BackButton from '../components/BackButton';

export default function ViewInvoice() {
    const [invoices, setInvoices] = useState([]); // Change to array state

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const res = await fetch('http://localhost/API/cust.php?action=get_invoice&CustomerID=1'); // Ensure the endpoint is correct
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await res.json();
                
                // Check if the response indicates success
                if (data.success) {
                    // Set invoices to the data received
                    setInvoices(data.invoices);
                } else {
                    // Handle error case from the API
                    toast.error(data.error || 'Error fetching invoices.');
                }
            } catch (error) {
                toast.error('Error fetching invoices: ' + error.message);
                console.error('Error fetching invoices:', error);
            }
        };

        fetchInvoices();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
            <Toaster />
            <h3 className="text-2xl font-bold mb-6 text-center">View Invoices</h3>
            <div className="overflow-x-auto w-full max-w-6xl">
                {invoices.length > 0 ? (
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
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map(invoice => (
                                <tr key={invoice.InvoiceID} className="hover:bg-gray-700 transition-colors duration-200">
                                    <td className="py-3 px-4">{invoice.InvoiceID}</td>
                                    <td className="py-3 px-4">{invoice.CustomerName}</td>
                                    <td className="py-3 px-4">{invoice.ProductName}</td>
                                    <td className="py-3 px-4">{invoice.Quantity}</td>
                                    <td className="py-3 px-4">₱{Number(invoice.TotalAmount).toFixed(2)}</td>
                                    <td className="py-3 px-4">{new Date(invoice.InvoiceDate).toLocaleString()}</td>
                                    <td className="py-3 px-4">{new Date(invoice.DueDate).toLocaleString()}</td>
                                    <td className="py-3 px-4">{invoice.PaymentStatus}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="py-3 px-4 text-center">No invoices found.</p>
                )}
            </div>
            <div className="mt-6">
                <BackButton />
            </div>
        </div>
    );
}
