import { useState, useEffect } from "react";
import { FaCircleUser } from "react-icons/fa6";
import { MdEditSquare } from "react-icons/md";
// import UploadImage from "./"

//context
import { useAuthContext } from "../contexts/AuthContext"

import { getDatabase, ref, get, query, orderByChild, equalTo, update } from "firebase/database";
import { toast } from "react-toastify";

export default function Profile(){

	const { user, logout } = useAuthContext();

	const [isEdit, setIsEdit] = useState(false);

	const [nameError, setNameError] = useState(false);

	const [maxBirthdate, setMaxBirthdate] = useState('');

	const [viewStudent, setViewStudent] = useState({
		firstName: "",
		lastName: "",
		middleName: "",
		age: "",
		birthdate: "",
		section: "",
		schoolYear: "",
		email: "",
		contactNumber: "",
		address: "",
		gender: "",
		parentGuardianName: "",
		parentGuardianContact: "",
		status: "",
		profileImg: "",
		userType: ""
	})

	const { firstName, lastName, middleName, birthdate, contactNumber, email, 
	gender, parentGuardianContact, parentGuardianName, profileImg, schoolYear, 
	section, status, userType, age, address } = viewStudent

	const [studentInfo, setStudentInfo] = useState({
	  firstName: "",
	  lastName: "",
	  middleName: "",
	  age: "",
	  birthdate: "",
	  section: "",
	  schoolYear: "",
	  email: "",
	  contactNumber: "",
	  address: "",
	  gender: "Male",
	  parentGuardianName: "",
	  parentGuardianContact: "",
	  status: "",
	  profileImg: "",
	  userType: ""
	});

	//handlers
	const handleChange = (e) => {
	  const { name, value } = e.target;
	  if(name == "birthdate"){
	    setStudentInfo(prevState => ({
	      ...prevState,
	      age: getAge(value)
	    }));
	  }
	  setStudentInfo(prevState => ({
	    ...prevState,
	    [name]: value
	  }));
	};

	const handleFullNameChange = (e) => {
	  const { name, value } = e.target;
	  let { firstName, lastName, middleName } = studentInfo;
	  const nameRegex = /^[A-Za-z]+$/;
	  setStudentInfo(prevState => ({
	    ...prevState,
	    [name]: value
	  }));
	  firstName = "firstName" === name? value : firstName
	  lastName = "lastName" === name? value : lastName
	  middleName = "middleName" === name? value : middleName
	  let fullName = firstName + lastName + middleName
	  if (nameRegex.test(fullName) || fullName === "") {
	    setNameError(false) 
	  } else {
	    setNameError(true) 
	  }
	};

	const handleSubmit = async (e) => {
	  e.preventDefault();

	  const db = getDatabase();
	  const usersRef = ref(db, 'users');

	  const userQuery = query(usersRef, orderByChild('email'), equalTo(studentInfo.email));

	  try {
	    const snapshot = await get(userQuery);

	    if (snapshot.exists()) {
	      const userKey = Object.keys(snapshot.val())[0];
	      const userUpdateRef = ref(db, `users/${userKey}`);
	      
	      await update(userUpdateRef, studentInfo);
	      
	      setViewStudent({ ...viewStudent, ...studentInfo });
	      toast.success('Student information updated successfully');
	      setIsEdit(false);
	    } else {
	      throw new Error('No student found with the provided email address.');
	    }
	  } catch (error) {
	    console.error('Error updating student information:', error);
	    toast.error('Failed to update student information: ' + error.message);
	  }
	};

	const handleViewUserByEmail = async (email) => {
	  const db = getDatabase();
	  const usersRef = ref(db, 'users');
	  
	  try {
	    const snapshot = await get(usersRef);
	    if (snapshot.exists()) {
	      const users = snapshot.val();
	      // Find user by email
	      const userKey = Object.keys(users).find(key => users[key].email === email);
	      if (userKey) {
	        const userData = users[userKey];
	        setViewStudent(userData);
	      } else {
	        console.log('User not found');
	      }
	    } else {
	      console.log('No users data available');
	    }
	  } catch (error) {
	    console.error('Error fetching user by email:', error);
	  }
	};

	//functions
	function getAge(dateString) {
	    var today = new Date();
	    var birthDate = new Date(dateString);
	    var age = today.getFullYear() - birthDate.getFullYear();
	    var m = today.getMonth() - birthDate.getMonth();
	    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
	        age--;
	    }
	    return age;
	}

	useEffect(() => {
	    const today = new Date();
	    const maxDate = new Date(today.getFullYear() - 15, today.getMonth(), today.getDate());
	    setMaxBirthdate(maxDate.toISOString().split('T')[0]);
	  }, []);

	useEffect(() => {
		handleViewUserByEmail(user.email)
	}, [])

	useEffect(() => {
		setStudentInfo({...studentInfo, ...viewStudent})
	}, [isEdit])


	if(isEdit){
		return(		
			<div className="flex items-center justify-center">
			<form className="w-full flex flex-col md:pt-10 gap-4 max-w-[670px] border-2 p-4 rounded-xl md:mt-5" onSubmit={handleSubmit}>

			 <div className="flex flex-col md:flex-row gap-4">
			   <div className="flex flex-col md:flex-row gap-2">
			     <label for="firstName" className="font-semibold">First Name:</label>
			     <input type="text" id="firstName" name="firstName" className="border-2 border-[#D9D9D9] rounded-lg px-2" value={studentInfo.firstName} onChange={handleFullNameChange} required />
			   </div>

			   <div className="flex flex-col md:flex-row gap-2">
			     <label for="lastName" className="font-semibold">Last Name:</label>
			     <input type="text" id="lastName" name="lastName" className="border-2 border-[#D9D9D9] rounded-lg px-2" value={studentInfo.lastName} onChange={handleFullNameChange} required />
			   </div>
			 </div>

			 <div className="flex flex-col md:flex-row gap-4">
			   <div className="flex flex-col md:flex-row gap-2">
			     <label for="middleName" className="font-semibold">Middle Name:</label>
			     <input type="text" id="middleName" name="middleName" className="border-2 border-[#D9D9D9] rounded-lg px-2" value={studentInfo.middleName} onChange={handleFullNameChange}/>
			   </div>

			   <div className="flex flex-col md:flex-row gap-2">
			     <label for="email" className="font-semibold">Email:</label>
			     <input type="email" id="email" name="email" className="border-2 border-[#D9D9D9] rounded-lg px-2" value={studentInfo.email}  onChange={handleChange} required />
			   </div>
			 </div>

			 <div className="flex flex-col md:flex-row gap-4">
			   <div className="flex flex-col md:flex-row gap-2">
			     <label for="schoolYear" className="font-semibold">School Year:</label>
			     <input type="text" id="schoolYear" name="schoolYear" placeholder="e.g., 2022-2023" className="border-2 border-[#D9D9D9] rounded-lg px-2 pointer-events-none " value={studentInfo.schoolYear} disable/>
			   </div>

			   <div className="flex flex-col md:flex-row gap-2">
			     <label for="schoolYear" className="font-semibold">Section:</label>
			     <input type="text" id="section" name="section" className="border-2 border-[#D9D9D9] rounded-lg px-2 pointer-events-none " value={studentInfo.section} disable/>
			   </div>
			 </div>

			 <div className="flex flex-col md:flex-row gap-4">
			   <div className="flex flex-col md:flex-row gap-2">
			     <label for="birthdate" className="font-semibold">Birthdate:</label>
			     <input type="date" id="birthdate" name="birthdate" className={`${ studentInfo.age <= 14 ? "border-[#ff2a00]" : "border-[#D9D9D9]"} border-2 rounded-lg px-2`} max={maxBirthdate} value={studentInfo.birthdate} onChange={handleChange} required />
			   </div>

			   <div className="flex flex-col md:flex-row gap-2">
			     <label for="age" className="font-semibold">Age:</label>
			     <p>{studentInfo.age}</p>
			   </div>
			 </div>

			 <div className="flex flex-col md:flex-row gap-4">
			   <div className="flex flex-col md:flex-row gap-2">
			     <label for="gender" className="font-semibold">Gender:</label>
			     <select id="gender" name="gender" className="border-2 border-[#D9D9D9] rounded-lg px-2" value={studentInfo.gender} onChange={handleChange} required>
			       <option value="">Select a gender</option>
			       <option value="Male">Male</option>
			       <option value="Female">Female</option>
			       <option value="Other">Other</option>
			     </select>
			   </div>
			 </div>

			  <button type="submit" className={`font-bold bg-primary-green px-4 py-2 rounded-lg text-safe-white ${ studentInfo.age <= 14 ? "opacity-50" : null}`} disable={ studentInfo.age <= 14 ? true : false}>Update</button>
			  { nameError? <p className={`text-[#ff2a00] text-[14px] font-semibold`}>* Please check the name. Avoid using numbers and special characters</p> : null}
			  { studentInfo.age <= 14 ? <p className={`text-[#ff2a00] text-[14px] font-semibold`}>* Minimum Age is 15 years old and above</p> : null}
			  <button onClick={() => {
			  	setIsEdit(false)
			  	setStudentInfo({ ...studentInfo, ...viewStudent });
			  }} className="font-bold border-2 border-primary-green px-4 py-2 rounded-lg text-primary-green">Cancel</button>
			</form>
			</div>
		);
	}


	return(
		<div>
		<h1 className="text-[24px] md:text-[32px] font-bold text-primary-green">Profile</h1>
		<div className="flex flex-col gap-4 items-center p-4 h-full">
			<FaCircleUser className="w-40 h-40"/>
			<div className="text-center">
				<p className={`text-[16px] font-bold ${status === "Active"? "text-primary-green" : status === "Pending"? "text-black" : "text-[#ff2a00]" }`}>{status}</p>
				<p className="text-[24px] font-semibold uppercase">{lastName}, {firstName} {middleName[0]}.</p>
				<p className="text-[16px]">{email}</p>
				<p className="text-[14px]">{section} SY: {schoolYear}</p>
			</div>
			<div className="border-2 w-32 border-primary-green"/>

			<div className="flex flex-col gap-2 w-[600px] max-w-full py-4">
				<div className="w-full flex justify-end">
					<button 
					className="bg-primary-green h-10 w-10 flex justify-center items-center rounded-lg"
					onClick={() => {setIsEdit(true)}}
					>
						<MdEditSquare className="w-7 h-7 text-safe-white"/>
					</button>
				</div>
				
				<div className="flex flex-col md:flex-row justify-between">
					<p className="font-semibold">User Type:</p>
					<p>{userType}</p>
				</div>

				<div className="flex flex-col md:flex-row justify-between">
					<p className="font-semibold">Birthdate:</p>
					<p>{birthdate}</p>
				</div>

				<div className="flex flex-col md:flex-row justify-between">
					<p className="font-semibold">Age:</p>
					<p>{age}</p>
				</div>

				<div className="flex flex-col md:flex-row justify-between">
					<p className="font-semibold">Gender:</p>
					<p>{gender}</p>
				</div>

			</div>

		</div>
		</div>

	);

}