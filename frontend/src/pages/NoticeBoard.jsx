import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Trash2 } from 'lucide-react';

const NoticeBoard = () => {
  const { user } = useContext(AuthContext);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form state for admin
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const fetchNotices = async () => {
    try {
      const res = await api.get('/notices/');
      setNotices(res.data);
    } catch (error) {
      console.error("Error fetching notices", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    try {
      await api.post('/notices/', { title, content, author: user.full_name });
      setTitle('');
      setContent('');
      fetchNotices();
    } catch (error) {
      console.error("Failed to create notice", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notice?")) return;
    try {
      await api.delete(`/notices/${id}`);
      fetchNotices();
    } catch (error) {
      console.error("Failed to delete notice", error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Notice Board</h1>
      
      {user.role === 'admin' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
          <h2 className="text-xl font-semibold mb-4">Post New Notice</h2>
          <form onSubmit={handleCreateNotice} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
              <input 
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Notice Title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
              <textarea 
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 h-32"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Detailed information..."
              />
            </div>
            <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              Publish Notice
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div>Loading notices...</div>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <div key={notice._id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-start hover:shadow-md transition-shadow">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{notice.title}</h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                    {new Date(notice.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{notice.content}</p>
                <p className="text-sm text-gray-400 mt-4">Posted by {notice.author}</p>
              </div>
              
              {user.role === 'admin' && (
                <button 
                  onClick={() => handleDelete(notice._id)}
                  className="text-gray-400 hover:text-red-600 transition-colors p-2"
                  title="Delete Notice"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          ))}
          {notices.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
              No notices published yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NoticeBoard;
