import Link from 'next/link';

const customerCardData = [
    { href: "/view-profile", label: "View Profile", icon: "👤", description: "Check your personal information and settings.", bgColor: "bg-blue-600" },
    { href: "/view-invoices", label: "View Invoices", icon: "🧾", description: "Check all your issued invoices.", bgColor: "bg-green-600" },
    { href: "/make-payment", label: "Make Payment", icon: "💳", description: "Pay your outstanding invoices.", bgColor: "bg-yellow-600" },
    { href: "/payment-history", label: "Payment History", icon: "📜", description: "Review your past payments.", bgColor: "bg-orange-600" },
    { href: "/contact-support", label: "Contact Support", icon: "🆘", description: "Get help with your account.", bgColor: "bg-red-600" },
];

export default function CustomerDashboard() {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-6 relative">
            <h1 className="text-4xl font-bold mb-8 text-blue-400 text-center">Customer Dashboard</h1>
            
            {/* Logout Button */}
            <Link href="/" className="absolute top-4 right-4 flex items-center bg-red-600 p-2 rounded-lg shadow-lg transition-transform transform hover:scale-105">
                <span className="text-2xl mr-2">🚪</span>
                <span className="font-semibold">Logout</span>
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
                {customerCardData.map(item => (
                    <div key={item.href} className={`p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 ${item.bgColor}`}>
                        <Link href={item.href} className="block text-center">
                            <div className="text-3xl">{item.icon}</div>
                            <h2 className="text-lg font-semibold">{item.label}</h2>
                            <p className="text-sm mt-2">{item.description}</p>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
