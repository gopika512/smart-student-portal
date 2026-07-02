import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { BookOpen, Plus, FileText, CheckCircle } from 'lucide-react';

const Assignments = () => {
  const { user } = useContext(AuthContext);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  // Admin form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [department, setDepartment] = useState('All');

  // Student submission state
  const [submissionTexts, setSubmissionTexts] = useState({});

  useEffect(() => {
    fetchAssignments();
  }, [user]);

  const fetchAssignments = async () => {
    try {
      const res = await api.get('/assignments/');
      setAssignments(res.data);
    } catch (error) {
      console.error("Error fetching assignments", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      await api.post('/assignments/', {
        title,
        description,
        due_date: new Date(dueDate).toISOString(),
        department
      });
      setMsg('Assignment created successfully!');
      setTitle('');
      setDescription('');
      setDueDate('');
      setDepartment('All');
      fetchAssignments();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setMsg('Failed to create assignment.');
    }
  };

  const handleSubmitAssignment = async (assignmentId) => {
    const text = submissionTexts[assignmentId];
    if (!text) return;
    
    try {
      await api.post(`/assignments/${assignmentId}/submit`, {
        submission_text: text
      });
      setMsg('Assignment submitted successfully!');
      fetchAssignments();
      setSubmissionTexts({...submissionTexts, [assignmentId]: ''});
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setMsg('Failed to submit assignment.');
    }
  };

  if (loading) return <div className="text-gray-900 dark:text-white">Loading...</div>;

  if (user.role === 'admin') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <BookOpen className="text-purple-600 dark:text-purple-400" /> Manage Assignments
        </h1>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Create New Assignment</h2>
          {msg && <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">{msg}</div>}
          
          <form onSubmit={handleCreateAssignment} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input 
                  type="text" required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={title} onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Department</label>
                <select 
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={department} onChange={(e) => setDepartment(e.target.value)}
                >
                  <option value="All">All Departments</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Business">Business</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea 
                  required rows="3"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={description} onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                <input 
                  type="datetime-local" required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" className="flex items-center justify-center w-full md:w-auto bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors font-semibold">
              <Plus size={18} className="mr-2" /> Create Assignment
            </button>
          </form>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mt-8 mb-4">Existing Assignments</h2>
        <div className="space-y-4">
          {assignments.map(a => (
            <div key={a._id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-xl text-gray-900 dark:text-white">{a.title}</h3>
                <span className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full">
                  Due: {new Date(a.due_date).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{a.description}</p>
              
              <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Submissions ({a.submissions?.length || 0})</h4>
                {a.submissions?.length > 0 ? (
                  <ul className="space-y-2">
                    {a.submissions.map((sub, i) => (
                      <li key={i} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded border border-gray-100 dark:border-gray-600">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{sub.student_name}</p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{sub.submission_text}</p>
                        <p className="text-xs text-gray-400 mt-2">Submitted: {new Date(sub.submitted_at).toLocaleString()}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No submissions yet.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
        <BookOpen className="text-purple-600 dark:text-purple-400" /> My Assignments
      </h1>

      {msg && <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">{msg}</div>}

      {assignments.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-8 text-center text-gray-500 dark:text-gray-400 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          No assignments available.
        </div>
      ) : (
        <div className="grid gap-6">
          {assignments.map((assignment) => {
            const mySubmission = assignment.submissions?.find(s => s.student_id === user._id || s.student_name === user.full_name);
            
            return (
              <div key={assignment._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white">{assignment.title}</h3>
                  <div className="text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-3 py-1 rounded-full">
                    Due: {new Date(assignment.due_date).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-600 dark:text-gray-400 mb-6">{assignment.description}</p>
                  
                  {mySubmission ? (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
                      <CheckCircle className="text-green-600 dark:text-green-400 mt-0.5" size={20} />
                      <div>
                        <h4 className="font-semibold text-green-800 dark:text-green-300">Assignment Submitted</h4>
                        <p className="text-green-700 dark:text-green-400 text-sm mt-1">{mySubmission.submission_text}</p>
                        <p className="text-xs text-green-600/70 dark:text-green-500 mt-2">
                          Submitted on {new Date(mySubmission.submitted_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your Submission</label>
                      <textarea 
                        rows="3"
                        placeholder="Type your answer or paste a link here..."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        value={submissionTexts[assignment._id] || ''}
                        onChange={(e) => setSubmissionTexts({...submissionTexts, [assignment._id]: e.target.value})}
                      ></textarea>
                      <button 
                        onClick={() => handleSubmitAssignment(assignment._id)}
                        className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors font-semibold flex items-center gap-2"
                      >
                        <FileText size={18} /> Submit Work
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Assignments;
