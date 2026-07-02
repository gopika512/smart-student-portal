import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, CheckCircle, Bell, Clock } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [attendance, setAttendance] = useState({ percentage: 0 });
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attRes, notRes] = await Promise.all([
          api.get('/attendance/me'),
          api.get('/notices/')
        ]);
        setAttendance(attRes.data);
        setNotices(notRes.data.slice(0, 5)); // top 5
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center py-12">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.full_name}!</h1>
        <p className="text-purple-100">Here is what's happening with your academic progress today.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex items-center transform transition-transform hover:-translate-y-1 hover:shadow-md">
          <div className="p-4 rounded-full bg-green-50 text-green-600 mr-4">
            <CheckCircle size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Attendance</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{attendance?.percentage || 0}%</p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
          <Bell className="mr-2 text-purple-600" /> Latest Announcements
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {notices.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {notices.map((notice) => (
                <div key={notice._id} className="p-6 hover:bg-gray-50 dark:bg-gray-900 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{notice.title}</h3>
                    <span className="text-xs font-medium bg-purple-100 text-purple-800 py-1 px-2 rounded-full">
                      {new Date(notice.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{notice.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center">
              <Bell size={40} className="text-gray-300 mb-3" />
              <p>No new announcements at this time.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
