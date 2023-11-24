// AuthContext.js
import { useState, useEffect, createContext, useContext } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../configs/firebase";
import { get, ref, set} from "firebase/database";
import { toast } from "react-toastify";

const AuthContext = createContext({});

export const useAuthContext = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const [userType, setUserType] = useState('');

  const createUser = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password).then((res) => {
      setUser(res.user);
    });
  };

  const signIn = async (email, password) => {
      try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const uid = userCredential.user.uid;

          const userRef = ref(db, 'users/' + uid);

          get(userRef).then((snapshot) => {
              if (snapshot.exists()) {
   
                  toast.success("Welcome back!");
              } else {

                  set(userRef, {
                      email: email,
                      userType: "Student",
                      profileImg: "",

                  }).then(() => {
                      toast.success("New user added to database");
                  }).catch((error) => {
                      toast.error("Failed to save new user data");
                  });
              }
          });

          toast.success("Logged in successfully as admin");
          // Redirect or other logic
      } catch (error) {
          console.error("SignIn Error: ", error);
          toast.error("Login failed: " + error.message);
      }
  };

  const logout = () => {
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userRef = ref(db, 'users/' + currentUser.uid);
        const snapshot = await get(userRef);
        if (snapshot.exists() && snapshot.val().userType) {
          setUserType(snapshot.val().userType);
        } else {
          setUserType('');
        }
      } else {
        setUser(null);
        setUserType('');
      }
    });
    return () => unsubscribe();
  }, []);

  const contextValue = {
    auth,
    user,
    userType,
    createUser,
    signIn,
    logout,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};