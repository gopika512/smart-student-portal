import { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, CheckCircle, Bell, FileText } from 'lucide-react';

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get('/dashboard/summary');
        setSummary(res.data);
      } catch (error) {
        console.error("Error fetching summary", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return <div className="text-center py-12">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex items-center">
          <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Students</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{summary?.total_students || 0}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Overall Attendance</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{summary?.overall_attendance_percentage || 0}%</p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800 dark:text-white">
            <Bell className="mr-2 text-purple-500" size={20} /> Recent Notices
          </h2>
          {summary?.recent_notices?.length > 0 ? (
            <div className="space-y-4">
              {summary.recent_notices.map((notice) => (
                <div key={notice._id} className="border-l-4 border-purple-500 pl-4 py-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">{notice.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{notice.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No recent notices.</p>
          )}
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-800 dark:text-white">
            <FileText className="mr-2 text-purple-500" size={20} /> Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <a href="/admin/attendance" className="block text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 hover:text-purple-600 transition-colors">
              Mark Attendance
            </a>
            <a href="/admin/notices" className="block text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 hover:text-purple-600 transition-colors">
              Create Notice
            </a>
            <a href="/admin/marks" className="block text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 hover:text-purple-600 transition-colors">
              Update Marks
            </a>
            <a href="/admin/leave" className="block text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 hover:text-purple-600 transition-colors">
              Leave Requests
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
