import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Award, Plus, Trash2 } from 'lucide-react';

const Marks = () => {
  const { user } = useContext(AuthContext);
  const [marks, setMarks] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Admin form state
  const [studentId, setStudentId] = useState('');
  const [semester, setSemester] = useState('');
  const [subjects, setSubjects] = useState([{ subject: '', marks_obtained: '', total_marks: '' }]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user.role === 'student') {
          const res = await api.get('/marks/me');
          setMarks(res.data);
        } else {
          const res = await api.get('/students/');
          setStudents(res.data);
        }
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleAddSubject = () => {
    setSubjects([...subjects, { subject: '', marks_obtained: '', total_marks: '' }]);
  };

  const handleRemoveSubject = (index) => {
    const newSubjects = [...subjects];
    newSubjects.splice(index, 1);
    setSubjects(newSubjects);
  };

  const handleSubjectChange = (index, field, value) => {
    const newSubjects = [...subjects];
    newSubjects[index][field] = value;
    setSubjects(newSubjects);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedSubjects = subjects.map(s => ({
        subject: s.subject,
        marks_obtained: parseFloat(s.marks_obtained),
        total_marks: parseFloat(s.total_marks)
      }));
      
      await api.post('/marks/', {
        student_id: studentId,
        semester,
        subjects: formattedSubjects
      });
      
      setMsg('Marks added successfully!');
      setStudentId('');
      setSemester('');
      setSubjects([{ subject: '', marks_obtained: '', total_marks: '' }]);
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setMsg('Failed to add marks.');
    }
  };

  if (loading) return <div>Loading...</div>;

  if (user.role === 'admin') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Marks</h1>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Enter Student Marks</h2>
          {msg && <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded">{msg}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                <select 
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                >
                  <option value="" disabled>Select Student</option>
                  {students.map(s => (
                    <option key={s._id} value={s._id}>{s.full_name} ({s.roll_number})</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester / Exam Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Semester 3 Finals"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-700">Subjects</h3>
                <button type="button" onClick={handleAddSubject} className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium">
                  <Plus size={16} className="mr-1" /> Add Subject
                </button>
              </div>
              
              {subjects.map((sub, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input 
                    type="text"
                    required
                    placeholder="Subject Name"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    value={sub.subject}
                    onChange={(e) => handleSubjectChange(index, 'subject', e.target.value)}
                  />
                  <input 
                    type="number"
                    required
                    min="0"
                    step="0.1"
                    placeholder="Marks Obtained"
                    className="w-32 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    value={sub.marks_obtained}
                    onChange={(e) => handleSubjectChange(index, 'marks_obtained', e.target.value)}
                  />
                  <input 
                    type="number"
                    required
                    min="1"
                    step="0.1"
                    placeholder="Total Marks"
                    className="w-32 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    value={sub.total_marks}
                    onChange={(e) => handleSubjectChange(index, 'total_marks', e.target.value)}
                  />
                  {subjects.length > 1 && (
                    <button type="button" onClick={() => handleRemoveSubject(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <button type="submit" className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
              Save Marks
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
        <Award className="text-purple-600 dark:text-purple-400" /> Academic Results
      </h1>

      {marks.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-8 text-center text-gray-500 dark:text-gray-400 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          No marks have been recorded yet.
        </div>
      ) : (
        <div className="space-y-6">
          {marks.map((record) => (
            <div key={record._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white">{record.semester}</h3>
                <div className="font-bold text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/50 px-3 py-1 rounded-full">
                  Total: {record.total_percentage?.toFixed(2)}%
                </div>
              </div>
              <table className="w-full text-left">
                <thead className="border-b border-gray-100 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-sm">Subject</th>
                    <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-sm text-right">Marks Obtained</th>
                    <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400 text-sm text-right">Total Marks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                  {record.subjects.map((sub, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                      <td className="px-6 py-3 font-medium text-gray-700 dark:text-gray-300">{sub.subject}</td>
                      <td className="px-6 py-3 text-right text-gray-600 dark:text-gray-400">{sub.marks_obtained}</td>
                      <td className="px-6 py-3 text-right text-gray-600 dark:text-gray-400">{sub.total_marks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Marks;
