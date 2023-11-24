import React, { useState } from 'react';
import { getAuth, updatePassword } from "firebase/auth";
import { getDatabase, ref, update } from 'firebase/database';
import { toast } from 'react-toastify';

export default function ChangePasswordModal({ isVisible, setIsVisible, userUid }) {
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleChangePassword = () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      updatePassword(user, newPassword).then(() => {
        setMessage('Password updated successfully.');
        toast.success('Password updated successfully.');

        const db = getDatabase();
        const userRef = ref(db, `users/${userUid}`);

        update(userRef, {
          defaultPassword: null
        }).then(() => {
          toast.success('Default password removed from the database.');
        }).catch((error) => {
          toast.error('Failed to remove default password from the database.');
          console.error('Error removing default password:', error);
        });

      }).catch((error) => {
        setMessage('Failed to update password. Please try again.');
        console.log(error)
        toast.error('Failed to update password.');
        console.error('Error updating password:', error);
      });
    } else {
      setMessage('No user is signed in.');
      toast.error('No user is signed in.');
    }
  };

  return (
    <div className={`fixed z-50 inset-0 flex items-center justify-center overflow-y-auto backdrop-blur-lg`}>
      <div className="relative max-w-[360px] w-full bg-white rounded-lg shadow-lg text-center mx-2">
        <div className="p-4 flex flex-col items-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Change Password</h2>
          <input 
            type="password" 
            className="border-2 border-gray-300 rounded px-3 py-2 w-full"
            placeholder="Enter new password" 
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <p className="text-gray-600 text-lg mb-4">{message}</p>
          <button 
            className="bg-primary-green text-white px-4 py-2 rounded font-bold text-safe-white hover:bg-green-600"
            onClick={handleChangePassword}
          >
            Update Password
          </button>
        </div>
      </div>  
    </div>
  );
}