"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import BackButton from '../components/BackButton';
import { Toaster, toast } from 'sonner';

export default function MarkInvoicePaid() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState('');

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
          const response = await axios.get('http://localhost/API/getBalance.php?action=get_invoices');
          console.log('Response data:', response.data); // Debugging line
  
          // If the response is an object (not an array), convert it to an array
          const data = response.data;
          const invoicesArray = Array.isArray(data) ? data : Object.values(data);
  
          if (Array.isArray(invoicesArray)) {
              // Filter out paid invoices
              const unpaidInvoices = invoicesArray.filter(invoice => invoice.PaymentStatus !== 'Paid');
              setInvoices(unpaidInvoices);
          } else {
              toast.error('Unexpected response format. Expected an array of invoices.');
          }
      } catch (error) {
          console.error('Error details:', error); // Debugging line
          toast.error('Error fetching invoices.');
      } finally {
          setLoading(false);
      }
  };
    

    fetchInvoices();
  }, []);

  const handleMarkAsPaid = async (e) => {
    e.preventDefault();

    if (!selectedInvoice) {
      toast.error('Please select an invoice.');
      return;
    }

    try {
      const response = await axios.post('http://localhost/API/getBalance.php?action=mark_invoice_paid', {
        InvoiceID: selectedInvoice,
      });

      if (response.data && response.data.success) {
        toast.success('Invoice marked as paid successfully!');
        // Remove the marked invoice from the state
        setInvoices(invoices.filter(invoice => invoice.InvoiceID !== selectedInvoice));
        setSelectedInvoice('');
      } else {
        toast.error(response.data.error || 'Failed to mark invoice as paid.');
      }
    } catch (error) {
      console.error('Error details:', error.response ? error.response.data : error);
      toast.error('Error marking invoice as paid. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white p-6">
      <Toaster />
      <div className="bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Mark Invoice as Paid</h2>
        {loading ? (
          <p>Loading invoices...</p>
        ) : (
          <form onSubmit={handleMarkAsPaid} className="space-y-4">
            <div>
              <label className="block mb-1" htmlFor="invoice">Select Invoice</label>
              <select
                name="invoice"
                value={selectedInvoice}
                onChange={(e) => setSelectedInvoice(e.target.value)}
                required
                className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>Select an invoice</option>
                {invoices.map((invoice) => (
                  <option key={invoice.InvoiceID} value={invoice.InvoiceID}>
                    Invoice ID: {invoice.InvoiceID} - {invoice.CustomerName}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className={`w-full py-2 mt-4 ${!selectedInvoice ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'} transition rounded-md`}
              disabled={!selectedInvoice}
            >
              Mark as Paid
            </button>
          </form>
        )}
        <div className="mt-6 text-center">
          <BackButton />
        </div>
      </div>
    </div>
  );
}
