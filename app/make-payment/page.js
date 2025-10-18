"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'sonner';
import BackButton from '../components/BackButton'; // Import the BackButton


export default function MakePayment() {
    const [invoices, setInvoices] = useState([]);
    const [selectedInvoice, setSelectedInvoice] = useState('');
    const [amount, setAmount] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const response = await axios.get('http://localhost/API/cust.php?action=get_invoice&CustomerID=1');
                console.log('API Response:', response.data); // Log the entire response data
        
                // Check if the response contains invoices and if it is an array
                if (response.data.success && Array.isArray(response.data.invoices)) {
                    const unpaidInvoices = response.data.invoices.filter(invoice => invoice.PaymentStatus !== 'Paid');
                    setInvoices(unpaidInvoices);
                } else {
                    toast.error('Unexpected response format. Expected an array of invoices.');
                }
            } catch (error) {
                console.error('Error fetching invoices:', error); // Log error details
                toast.error('Error fetching invoices.');
            } finally {
                setLoading(false);
            }
        };               

        fetchInvoices();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        console.log('Submitting payment...');
    
        if (!selectedInvoice) {
            toast.error('Please select an invoice.');
            return;
        }
    
        if (isNaN(amount) || amount < 100) { // Minimum amount validation
            toast.error('Payment must be at least ₱100.');
            return;
        }
    
        const payload = {
            Amount: parseFloat(amount),
            InvoiceID: parseInt(selectedInvoice)
        };
        
        console.log('Payload:', payload); // Log the payload
    
        try {
            const res = await axios.post('http://localhost/API/cust.php?action=make_payment', payload, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
            console.log('Response:', res.data);
            if (res.data.success) {
                setSuccess('Payment successful!');
                setError('');
                setAmount('');
                setSelectedInvoice('');
            } else {
                setError(res.data.error || 'Payment failed.');
                setSuccess('');
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred while processing the payment.');
            setSuccess('');
        }
    };
    
    
    
    return (
        <div className="max-w-md mx-auto p-6 bg-gray-900 text-white rounded-lg shadow-lg mt-10">
            <h1 className="text-3xl font-bold mb-4 text-center">Make Payment</h1>
            {loading ? (
                <p>Loading invoices...</p>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="invoice">Select Invoice:</label>
                        <select
                            name="invoice"
                            value={selectedInvoice}
                            onChange={(e) => setSelectedInvoice(e.target.value)}
                            required
                            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring focus:ring-green-500"
                        >
                            <option value="" disabled>Select an invoice</option>
                            {invoices.length > 0 ? (
                                invoices.map((invoice) => (
                                    <option key={invoice.InvoiceID} value={invoice.InvoiceID}>
                                        Invoice ID: {invoice.InvoiceID} - Total Amount: ₱{invoice.TotalAmount} - Remaining: ₱{(invoice.TotalAmount - invoice.PaidAmount).toFixed(2)}
                                    </option>
                                ))
                            ) : (
                                <option value="" disabled>No unpaid invoices found.</option>
                            )}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium mb-1">Amount:</label>
                        <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter amount"
                            className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring focus:ring-green-500"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded transition duration-200">Pay</button>
                </form>
            )}
            {success && <p className="mt-4 text-green-400 text-center">{success}</p>}
            {error && <p className="mt-2 text-red-400 text-center">{error}</p>}
            <Toaster />
            <div className="mt-6">
                <BackButton /> {/* Add the BackButton here */}
            </div>
        </div>
    );
}
