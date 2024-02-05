import { useState, useEffect } from "react";
import { FaCircleUser } from "react-icons/fa6";
import { MdEditSquare } from "react-icons/md";
import { useAuthContext } from "../contexts/AuthContext"
import { FaChevronLeft } from "react-icons/fa";

import { getDatabase, ref, get, query, orderByChild, equalTo, update } from "firebase/database";
import { toast } from "react-toastify";

export default function ViewStudent({ viewStudent, setViewStudent }){

	const { user } = useAuthContext()

	const { userId, firstName, lastName, middleName, birthdate, contactNumber, email, 
	gender, parentGuardianContact, parentGuardianName, profileImg, schoolYear, 
	section, status, userType, age, address } = viewStudent

	const [isEdit, setIsEdit] = useState(false);

	const [sectionArr, setSectionArr] = useState([]);
	const [schoolYearArr, setSchoolYearArr] = useState([]);
	const [nameError, setNameError] = useState(false);
	const [maxBirthdate, setMaxBirthdate] = useState('');

	const [studentInfo, setStudentInfo] = useState({
	  id: userId,
	  firstName: firstName,
	  lastName: lastName,
	  middleName: middleName,
	  age: age,
	  birthdate: birthdate,
	  section: section,
	  schoolYear: schoolYear,
	  email: email,
	  contactNumber: contactNumber,
	  address: address,
	  gender: gender,
	  parentGuardianName: parentGuardianName,
	  parentGuardianContact: parentGuardianContact,
	  status: status,
	  profileImg: profileImg,
	  userType: userType
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

	  const updatedStudentInfo = {
	    ...studentInfo,
	    profileImg: studentInfo.profileImg || null,
	  };

	  const db = getDatabase();
	  
	  const findAndUpdateUser = async (userId, userInfo) => {
	    const userRef = ref(db, `users/${userId}`);
	    try {
	      const userSnapshot = await get(userRef);

	      if (userSnapshot.exists()) {
	        await update(userRef, userInfo);
	        setViewStudent({ ...viewStudent, ...userInfo });
	        toast.success('Student information updated successfully');
	        setIsEdit(false);
	        return true;
	      } else {
	        const tempUserRef = ref(db, `temporary-users/${userId}`);
	        const tempUserSnapshot = await get(tempUserRef);

	        if (tempUserSnapshot.exists()) {
	          await update(tempUserRef, userInfo);
	          setViewStudent({ ...viewStudent, ...userInfo });
	          toast.success('Temporary student information updated successfully');
	          setIsEdit(false);
	          return true;
	        }
	      }
	      return false;
	    } catch (error) {
	      console.error('Error updating student information:', error);
	      toast.error('Failed to update student information: ' + error.message);
	    }
	  };

	  const userFound = await findAndUpdateUser(userId, updatedStudentInfo);

	  if (!userFound) {
	    toast.error('No student found with the provided user ID.');
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
	  const db = getDatabase();
	  const sectionsRef = ref(db, 'sections');

	  get(sectionsRef).then((snapshot) => {
	    if (snapshot.exists()) {
	      const sectionsData = [];
	      snapshot.forEach((childSnapshot) => {
	        const section = childSnapshot.val();
	        if (section.status === 'Active') {
	          sectionsData.push({
	            id: childSnapshot.key,
	            ...section,
	          });
	        }
	      });
	      setSectionArr(sectionsData);
	    } else {
	      console.log("No sections available");
	      setSectionArr([]);
	    }
	  }).catch((error) => {
	    console.error("Error fetching sections: ", error);
	  });

	}, []);

	useEffect(() => {
	  const db = getDatabase();
	  const schoolYearRef = ref(db, 'academic-year');

	  get(schoolYearRef).then((snapshot) => {
	    if (snapshot.exists()) {
	      const schoolYearData = [];
	      snapshot.forEach((childSnapshot) => {
	        const schoolYear = childSnapshot.val();
	        if (schoolYear.status === 'Active') {
	          schoolYearData.push({
	            id: childSnapshot.key,
	            ...schoolYear,
	          });
	        }
	      });
	      setSchoolYearArr(schoolYearData);
	    } else {
	      console.log("No schoolYear available");
	      setSchoolYearArr([]);
	    }
	  }).catch((error) => {
	    console.error("Error fetching schoolYear: ", error);
	  });

	}, []);

	const toggleUserStatus = async () => {
		if(email === "gabaymalvar@gmail.com"){
			toast.error("You can't deactivate the default admin.")
			return
		}
	  const db = getDatabase();
	  // First check in 'users' table
	  let userRef = ref(db, `users/${userId}`);

	  try {
	    let snapshot = await get(userRef);
	    let newStatus;
	    if (snapshot.exists()) {

	      const currentUserStatus = snapshot.val().status;
	      newStatus = currentUserStatus === "Active" ? "Disabled" : "Active";
	      await update(userRef, { status: newStatus });
	    } else {

	      userRef = ref(db, `temporary-users/${userId}`);
	      snapshot = await get(userRef);
	      if (snapshot.exists()) {

	        const currentUserStatus = snapshot.val().status;
	        newStatus = currentUserStatus === "Disabled" ? "Pending" : currentUserStatus;
	        await update(userRef, { status: newStatus });
	        if(currentUserStatus === "Pending"){
	        	newStatus = currentUserStatus === "Pending" ? "Disabled" : currentUserStatus;
	        	await update(userRef, { status: newStatus });
	        }
	      } else {
	        console.error(`User not found in both 'users' and 'temporary-users' tables.`);
	      }
	    }

	    // Update the state with the new status
	    if(newStatus) {
	      setViewStudent(prevInfo => ({
	        ...prevInfo,
	        status: newStatus
	      }));
	    }

	  } catch (error) {
	    console.error('Error updating user status:', error);
	  }
	};


	if(isEdit){
		return(
			<>
			<div className="flex items-center justify-center">
			<form className="w-full  flex flex-col md:pt-10 gap-4 max-w-[670px] border-2 p-4 rounded-xl md:mt-5" onSubmit={handleSubmit}>

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
			      <label htmlFor="schoolYear" className="font-semibold">School Year:</label>
			      <select 
			        id="schoolYear" 
			        name="schoolYear"  
			        className="border-2 border-[#D9D9D9] rounded-lg px-2" 
			        onChange={handleChange} 
			        required
			        value={studentInfo.schoolYear}
			      >
			        <option value="">Select School Year</option>
			        {schoolYearArr.map((school) => (
			          <option key={school.id} value={school.schoolYear}>
			            {school.schoolYear}
			          </option>
			        ))}
			      </select>
			    </div>

			    <div className="flex flex-col md:flex-row gap-2">
			      <label htmlFor="section" className="font-semibold">Section:</label>
			      <select 
			        id="section" 
			        name="section"  
			        className="border-2 border-[#D9D9D9] rounded-lg px-2" 
			        onChange={handleChange} 
			        required
			        value={studentInfo.section}
			      >
			        <option value="">Select Section</option>
			        {sectionArr.map((section) => (
			          <option key={section.id} value={section.sectionName}>
			            {section.sectionName}
			          </option>
			        ))}
			      </select>
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
			</>
		);
	}


	return(
		<>
		<button onClick={() => {setViewStudent(false)}} className="bg-primary-green text-safe-white h-10 min-10 px-4 rounded-lg flex items-center justify-center"><FaChevronLeft/></button>
		<div className="flex flex-col gap-4 items-center p-4 h-full">
			<FaCircleUser className="w-40 h-40"/>
			<div className="text-center">
				<button onClick={toggleUserStatus} className={`text-[16px] font-bold border-2 px-2 hover:text-safe-white ${status === "Active"? "text-primary-green hover:bg-primary-green" : status === "Pending"? "text-black border-black hover:bg-[#000000]" : "text-[#ff2a00] border-[#ff2a00] hover:bg-[#ff2a00]" }`}>{status}</button>
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
		</>

	);

}