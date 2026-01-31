export default function repaireLeave() {
    return (
        <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Time In/Out System
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
                Clock in and out functionality coming soon
            </p>
            <div className="flex justify-center gap-4">
                <button className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                    Clock In
                </button>
                <button className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                    Clock Out
                </button>
            </div>
        </div>
    );
}
