import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Calendar } from 'lucide-react';

const LeaveRequests = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Student form state
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [msg, setMsg] = useState('');

  const fetchRequests = async () => {
    try {
      const endpoint = user.role === 'admin' ? '/leave/all' : '/leave/me';
      const res = await api.get(endpoint);
      setRequests(res.data);
    } catch (error) {
      console.error("Error fetching leave requests", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leave/', {
        reason,
        start_date: startDate,
        end_date: endDate,
        student_id: user._id
      });
      setMsg('Leave request submitted successfully!');
      setReason('');
      setStartDate('');
      setEndDate('');
      fetchRequests();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setMsg('Failed to submit request.');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/leave/${id}/status?status=${status}`);
      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${colors[status]}`}>
        {status}
      </span>
    );
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
        <Calendar className="text-purple-600" /> Leave Management
      </h1>

      {user.role === 'student' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
          <h2 className="text-xl font-semibold mb-4">Request Leave</h2>
          {msg && <div className="mb-4 p-3 bg-purple-50 text-purple-700 rounded">{msg}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason</label>
              <textarea 
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 h-24"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please state your reason for leave..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                <input 
                  type="date"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                <input 
                  type="date"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              Submit Request
            </button>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold">Leave History</h2>
        </div>
        {requests.length > 0 ? (
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
              <tr>
                {user.role === 'admin' && <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Student ID</th>}
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Reason</th>
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Dates</th>
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                {user.role === 'admin' && <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.map((req) => (
                <tr key={req._id} className="hover:bg-gray-50 dark:bg-gray-900">
                  {user.role === 'admin' && (
                    <td className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-gray-400">{req.student_id.substring(0, 8)}...</td>
                  )}
                  <td className="px-6 py-4 text-gray-800 dark:text-white">{req.reason}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{req.start_date} to {req.end_date}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={req.status} />
                  </td>
                  {user.role === 'admin' && (
                    <td className="px-6 py-4 text-right space-x-2">
                      {req.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleStatusUpdate(req._id, 'approved')}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 font-medium text-sm transition-colors"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(req._id, 'rejected')}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 font-medium text-sm transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No leave requests found.
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveRequests;
