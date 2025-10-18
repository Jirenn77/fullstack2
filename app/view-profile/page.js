"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function ViewProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get('http://localhost/API/cust.php?action=get_profile', { withCredentials: true });
                if (res.data.success) {
                    setProfile(res.data.profile);
                } else {
                    setError(res.data.error);
                }
            } catch (error) {
                console.error("Error fetching profile", error);
                setError('Failed to fetch profile.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchProfile();
    }, []);
    
    if (loading) return <div className="text-center text-white">Loading...</div>;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-6">
            <div className="bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full">
                <h1 className="text-3xl font-bold text-center mb-6">Profile</h1>
                {error && <p className="text-red-400 text-center">{error}</p>}
                {profile ? (
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span className="font-semibold">Name:</span>
                            <span>{profile.CustomerName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold">Email:</span>
                            <span>{profile.Email}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold">Contact Details:</span>
                            <span>{profile.ContactDetails}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold">Account Balance:</span>
                            <span>${(parseFloat(profile.Balance) || 0).toFixed(2)}</span>
                        </div>
                    </div>
                ) : (
                    <p className="text-center">No profile found.</p>
                )}
            </div>
        </div>
    );
}
