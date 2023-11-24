import Papa from 'papaparse';
import { getDatabase, ref, set, get, query, orderByChild, equalTo, push } from "firebase/database";
import { toast } from 'react-toastify';

function CSVImport({ handleNewUsersAdded }) {
  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    Papa.parse(file, {
      header: true,
      complete: async function(results) {
        const users = results.data;

        for (const user of users) {
          if (Object.values(user).every(val => !val.trim())) {
            continue; // Skip empty rows
          }

          if (!user.firstName || !user.lastName || !user.birthdate || !user.section || !user.schoolYear || !user.gender) {
            toast.error("Missing required fields for one or more users.");
            continue; // Skip this user
          }

          const defaultPassword = generateDefaultPassword(user);

          const tempUserRef = ref(getDatabase(), 'temporary-users');
          const userRef = ref(getDatabase(), 'users');
          const tempEmailQuery = query(tempUserRef, orderByChild('email'), equalTo(user.email));
          const emailQuery = query(userRef, orderByChild('email'), equalTo(user.email));

          const tempUserSnapshot = await get(tempEmailQuery);
          const userSnapshot = await get(emailQuery);

          if (tempUserSnapshot.exists() || userSnapshot.exists()) {
            toast.error(`User with email ${user.email} already exists.`);
            continue; // Skip this user
          }

          const newUserRef = push(tempUserRef);
          set(newUserRef, { ...user, defaultPassword, status: "Pending", userType: "Student", birthdate: convertDateFormat(user.birthdate) })
            .then(() => {
            	toast.success(`User ${user.firstName} added successfully to pending users.`)
            	const newUserRow = {
        	     name: `${user.lastName}, ${user.firstName} ${user.middleName ? user.middleName[0] : ''}.`, 
        	     email: user.email, 
        	     userType: "Student", 
        	     status: "Pending", 
        	     imgUrl: user.profileImg || "", 
        	     uid: newUserRef.key
        	   };
        	   handleNewUsersAdded([newUserRow]);
            })
            .catch((error) => toast.error(`Error adding user ${user.firstName}: ${error.message}`));
        }
      }
    });
  };

  const generateDefaultPassword = (user) => {
    const middleInitial = user.middleName && user.middleName.length > 0 ? user.middleName[0] : '';
    return `${user.firstName[0]}${middleInitial}${user.lastName[0]}${convertDateFormat(user.birthdate).replaceAll('-', '').replaceAll('/', '')}`;
  };

  function convertDateFormat(dateStr) {
      // Check if the format is already YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          return dateStr;
      }

      // If the format is DD/MM/YYYY
      const parts = dateStr.split("/");
      if (parts.length === 3) {
          return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      
      return "Invalid format";
  }

  return (
    <input className="top-0 left-0 opacity-0 cursor-pointer h-full absolute" type="file" accept=".csv" onChange={handleFileUpload} />
  );
}

export default CSVImport;
