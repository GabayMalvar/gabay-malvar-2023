//Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuthContext } from '../contexts/AuthContext';

import SchoolLogo from '../assets/schoollogo.png';
import GabayLogo from '../assets/gabaylogo.png';

import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, get, remove, set, query, orderByChild, equalTo } from "firebase/database";

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signIn } = useAuthContext();
    const navigate = useNavigate();

    const checkIfUserIsDisabled = async (email) => {
      const db = getDatabase();
      let isDisabled = false;
      let errorMsg = "";

      // Helper function to check status in a given path
      const checkStatusAtPath = async (path) => {
        const usersRef = query(ref(db, path), orderByChild('email'), equalTo(email));
        const snapshot = await get(usersRef);
        if (snapshot.exists()) {
          const userData = Object.values(snapshot.val())[0];
          if (userData.status === "Disabled") {
            isDisabled = true;
          }
        }
      };

      try {
        // Check status in 'users'
        await checkStatusAtPath('users');
        // If not found or not disabled, check in 'temporary-users'
        if (!isDisabled) {
          await checkStatusAtPath('temporary-users');
        }
      } catch (error) {
        errorMsg = "Failed to check user status. Please try again later.";
        console.error(error);
      }

      return { isDisabled, errorMsg };
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const auth = getAuth();
        const db = getDatabase();
        // First, check if the user is disabled
        const { isDisabled, errorMsg } = await checkIfUserIsDisabled(email);
        if (isDisabled) {
          toast.error('Your account has been disabled. Please contact support.');
          return; // Stop the login process
        }
        if (errorMsg) {
          toast.error(errorMsg);
          return; // Stop the login process
        }

        try {
            // Attempt to sign in the user
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/");
        } catch (signInError) {
            // If sign in failed, try to find the user in the Realtime Database
            const temporaryUserRef = ref(db, `temporary-users`);
            get(temporaryUserRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const users = snapshot.val();
                    // Look for the user by email
                    const userKey = Object.keys(users).find(key => users[key].email === email);
                    const user = users[userKey];
                    if (user && user.defaultPassword === password) {
                        // If the default password matches, create the user in Authentication
                        return { userKey, user };
                    } else {
                        throw new Error('Incorrect email or password.');
                    }
                } else {
                    throw new Error('No such user found.');
                }
            })
            .then(({ userKey, user }) => {
                // If the default password matches, create the user in Authentication
                return createUserWithEmailAndPassword(auth, email, password)
                  .then((userCredential) => {
                    // Now delete the temporary user
                    const userToDeleteRef = ref(db, `temporary-users/${userKey}`);
                    return remove(userToDeleteRef).then(() => {
                        return { userCredential, user };
                    });
                  });
            })
            .then(({ userCredential, user }) => {
                // Transfer the user's data to the 'users' table with the new UID
                const newUserRef = ref(db, `users/${userCredential.user.uid}`);
                return set(newUserRef, {
                    ...user,
                    // defaultPassword: null,
                    status: "Active",
                });
            })
            .then(() => {
                window.location.href="/";
            })
            .catch((error) => {
                toast.error(error.message);
            });
        }
    };


    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h2 className="text-[14px] text-center md:text-[20px] text-[#1a6306] font-bold mb-8">Take this self-assessment to discover the best career path for you!</h2>
            
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <img src={GabayLogo} className="w-80 h-auto order-2 md:order-1" />
                <img src={SchoolLogo} className="w-40 h-40 order-1 md:order-2"/>
            </div>

            <form onSubmit={handleLogin} className="w-[300px]">
                <div>
                    <input 
                        type="email" 
                        id="email" 
                        value={email} 
                        placeholder="Email"
                        onChange={(e) => setEmail(e.target.value)} 
                        className="w-full p-2 border border-gray-300 rounded mt-1" 
                        required
                    />
                </div>
                <div className="mt-4">
                    <input 
                        type="password" 
                        id="password" 
                        value={password} 
                        placeholder="Password"
                        onChange={(e) => setPassword(e.target.value)} 
                        className="w-full p-2 border border-gray-300 rounded mt-1" 
                        required
                    />
                </div>
                <div className="flex flex-row items-center justify-center">
                <button type="submit" className="font-bold text-safe-white bg-primary-green text-white p-2 mt-4 rounded">
                    Log In
                </button>
                </div>
            </form>
        </div>
    );
}
