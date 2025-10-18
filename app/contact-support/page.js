"use client";

import { useState } from 'react';
import axios from 'axios';

export default function ContactSupport() {
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost/API/contactSupport.php', { message });
            if (res.data.success) {
                setSuccess('Message sent successfully!');
                setError('');
                setMessage(''); // Clear the message after successful submission
            } else {
                setError(res.data.error || 'Failed to send message.');
                setSuccess('');
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred. Please try again.');
            setSuccess('');
        }
    };

    return (
        <div className="p-6 bg-gray-900 text-white rounded-lg shadow-md">
            <h1 className="text-3xl mb-4 text-center font-bold">Contact Support</h1>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Your message"
                    className="p-2 rounded mb-4 w-full h-32 bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                />
                <button type="submit" className="bg-blue-600 p-2 rounded w-full hover:bg-blue-700 transition-colors duration-200">
                    Send
                </button>
            </form>
            {success && <p className="text-green-400 mt-4 text-center">{success}</p>}
            {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
        </div>
    );
}
