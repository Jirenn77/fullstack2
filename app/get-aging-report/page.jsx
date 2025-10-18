"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import BackButton from '../components/BackButton';
import { Toaster, toast } from 'sonner';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function GetAgingReport() {
  const [agingReport, setAgingReport] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgingReport = async () => {
      try {
        const response = await axios.get('http://localhost/API/getBalance.php?action=get_aging_report');

        console.log("Aging Report Response:", response.data);

        if (Array.isArray(response.data)) {
          setAgingReport(response.data);
        } else {
          toast.error('Unexpected response format. Expected an array of aging report entries.');
        }
      } catch (error) {
        console.error('Error fetching aging report:', error);
        toast.error('Error fetching aging report.');
      } finally {
        setLoading(false);
      }
    };

    fetchAgingReport();
  }, []);

  const chartData = {
    labels: agingReport.map(entry => entry.CustomerName),
    datasets: [
      {
        label: 'Total Amount Due',
        data: agingReport.map(entry => entry.TotalAmountDue),
        backgroundColor: agingReport.map(entry => {
          const days = entry.DaysOutstanding;
          if (days <= 30) return 'rgba(75, 192, 192, 0.6)';
          if (days <= 60) return 'rgba(255, 206, 86, 0.6)';
          return 'rgba(255, 99, 132, 0.6)';
        }),
        borderColor: 'rgba(0, 0, 0, 0.8)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white p-6 overflow-auto">
      <Toaster />
      <div className="bg-gray-800 rounded-lg shadow-lg p-8 max-w-5xl w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Aging Report</h2>
        {loading ? (
          <p>Loading aging report...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {agingReport.length > 0 ? (
                agingReport.map((entry) => (
                  <div key={entry.CustomerName} className="bg-gray-700 p-4 rounded-lg shadow-md">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                        <span className="text-white font-bold">{entry.CustomerName.charAt(0)}</span>
                      </div>
                      <h3 className="text-lg font-semibold">{entry.CustomerName}</h3>
                    </div>
                    <p className="mt-2"><strong>Total Amount Due:</strong> ₱{Number(entry.TotalAmountDue).toFixed(2)}</p>
                    <p className="mt-2"><strong>Days Outstanding:</strong> {entry.DaysOutstanding} days</p>
                    <div className="mt-4 h-2 bg-blue-500 rounded" style={{ width: `${Math.min(entry.DaysOutstanding * 10, 100)}%` }}></div>
                    <p className="mt-1 text-xs text-gray-400">Payment Status: Unpaid</p>
                  </div>
                ))
              ) : (
                <p>No entries found in the aging report.</p>
              )}
            </div>
            <h3 className="text-xl font-bold mb-4 text-center">Total Amount Due Overview</h3>
            <div className="relative h-72"> {/* Set a fixed height for the chart container */}
              <Bar data={chartData} options={options} />
            </div>
          </>
        )}
        <div className="mt-6 text-center">
          <BackButton />
        </div>
      </div>
    </div>
  );
}
