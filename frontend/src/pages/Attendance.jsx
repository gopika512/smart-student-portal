import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Attendance = () => {
  const { user } = useContext(AuthContext);
  const [attendance, setAttendance] = useState({ records: [], percentage: 0 });
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Admin form state
  const [selectedStudent, setSelectedStudent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('present');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user.role === 'student') {
          const res = await api.get('/attendance/me');
          setAttendance(res.data);
        } else {
          const res = await api.get('/students/');
          setStudents(res.data);
          // could also fetch all attendance here
        }
      } catch (error) {
        console.error("Error fetching attendance", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    try {
      await api.post('/attendance/mark', {
        student_id: selectedStudent,
        date,
        status
      });
      setMsg('Attendance marked successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setMsg('Failed to mark attendance.');
    }
  };

  if (loading) return <div>Loading...</div>;

  if (user.role === 'admin') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Manage Attendance</h1>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Mark Attendance</h2>
          {msg && <div className="mb-4 p-3 bg-purple-50 text-purple-700 rounded">{msg}</div>}
          <form onSubmit={handleMarkAttendance} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Student</label>
                <select 
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800"
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                >
                  <option value="" disabled>Select Student</option>
                  {students.map(s => (
                    <option key={s._id} value={s._id}>{s.full_name} ({s.roll_number})</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <input 
                  type="date"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select 
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                </select>
              </div>
            </div>
            
            <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              Submit Record
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">My Attendance</h1>
        <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 font-semibold text-lg">
          Overall: <span className={attendance.percentage >= 75 ? "text-green-600" : "text-red-600"}>{attendance.percentage}%</span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {attendance.records.length > 0 ? (
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Date</th>
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {attendance.records.map((record, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:bg-gray-900">
                  <td className="px-6 py-4">{record.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                      record.status === 'present' ? 'bg-green-100 text-green-800' :
                      record.status === 'absent' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No attendance records found.
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
