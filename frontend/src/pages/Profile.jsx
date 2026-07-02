import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Hash, BookOpen } from 'lucide-react';

const Profile = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">My Profile</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-32"></div>
        <div className="px-8 pb-8 flex flex-col items-center">
          <div className="w-24 h-24 bg-white dark:bg-gray-900 rounded-full p-1 -mt-12 shadow-lg relative z-10">
            <div className="w-full h-full bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-300 text-3xl font-bold">
              {user.full_name.charAt(0)}
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.full_name}</h2>
            <p className="text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3 text-gray-700">
              <Mail className="text-gray-400" size={20} />
              <div>
                <p className="text-sm font-medium text-gray-500">Email Address</p>
                <p>{user.email}</p>
              </div>
            </div>
            
            {user.role === 'student' && (
              <>
                <div className="flex items-center space-x-3 text-gray-700">
                  <Hash className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Roll Number</p>
                    <p>{user.roll_number || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 text-gray-700">
                  <BookOpen className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Department</p>
                    <p>{user.department || 'N/A'}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
