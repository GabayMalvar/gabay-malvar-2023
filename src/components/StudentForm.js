import React, { useState, useEffect } from 'react';
import { FaChevronLeft } from "react-icons/fa";

//firebase
import { auth, db } from '../configs/firebase';
import { getDatabase, get, ref, set, push } from "firebase/database";

//external imports
import { toast } from 'react-toastify';

const StudentForm = ({ setAddStudent }) => {
  const [studentInfo, setStudentInfo] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    age: '',
    birthdate: '',
    section: '',
    schoolYear: '',
    email: '',
    contactNumber: '',
    address: '',
    gender: 'Male',
    parentGuardianName: '',
    parentGuardianContact: ''
  });

  const [sections, setSections] = useState([]);
  const [schoolYear, setSchoolYear] = useState([])

  //handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudentInfo(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userRef = ref(db, 'temporary-users');
    const newUserRef = push(userRef);

    const defaultPassword = `${studentInfo.firstName[0]}${studentInfo.middleName[0]}${studentInfo.lastName[0]}${studentInfo.birthdate.replaceAll('-', '')}`;

    try {
      await set(newUserRef, {
        ...studentInfo,
        userType: "Student",
        status: "Pending",
        profileImg: "",
        defaultPassword
      });

      // Handle success
      setAddStudent(false)
      toast.success("User details saved to database.");
    } catch (error) {
      // Handle errors
      toast.error("Error saving user details: " + error.message);
    }
  };

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
        setSections(sectionsData);
      } else {
        console.log("No sections available");
        setSections([]);
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
        setSchoolYear(schoolYearData);
      } else {
        console.log("No schoolYear available");
        setSchoolYear([]);
      }
    }).catch((error) => {
      console.error("Error fetching schoolYear: ", error);
    });

  }, []);

  return (
    <>
    <div className="flex flex-row gap-4">
    <button onClick={() => {setAddStudent(false)}} className="bg-primary-green text-safe-white h-10 min-10 px-4 rounded-lg flex items-center justify-center"><FaChevronLeft/></button>
    <h1 className="text-[20px] md:text-[28px] font-bold text-primary-green">User Accounts / Add Student</h1>
    </div>
    <div className="flex items-center justify-center">
    <form className="flex flex-col md:pt-10 gap-4 max-w-[670px] border-2 p-4 rounded-xl md:mt-5"  onSubmit={handleSubmit}>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex flex-col md:flex-row gap-2">
          <label for="firstName" className="font-semibold">First Name:</label>
          <input type="text" id="firstName" name="firstName" className="border-2 border-[#D9D9D9] rounded-lg px-2" onChange={handleChange} required />
        </div>

        <div className="flex flex-col md:flex-row gap-2">
          <label for="lastName" className="font-semibold">Last Name:</label>
          <input type="text" id="lastName" name="lastName" className="border-2 border-[#D9D9D9] rounded-lg px-2" onChange={handleChange} required />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex flex-col md:flex-row gap-2">
          <label for="middleName" className="font-semibold">Middle Name:</label>
          <input type="text" id="middleName" name="middleName" className="border-2 border-[#D9D9D9] rounded-lg px-2" onChange={handleChange}/>
        </div>

        <div className="flex flex-col md:flex-row gap-2">
          <label for="age" className="font-semibold">Age:</label>
          <input type="number" id="age" name="age" className="border-2 border-[#D9D9D9] rounded-lg px-2" onChange={handleChange} required />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex flex-col md:flex-row gap-2">
          <label for="birthdate" className="font-semibold">Birthdate:</label>
          <input type="date" id="birthdate" name="birthdate" className="border-2 border-[#D9D9D9] rounded-lg px-2" onChange={handleChange} required />
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
            {sections.map((section) => (
              <option key={section.id} value={section.sectionName}>
                {section.sectionName}
              </option>
            ))}
          </select>
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
            {schoolYear.map((school) => (
              <option key={school.id} value={school.schoolYear}>
                {school.schoolYear}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col md:flex-row gap-2">
          <label for="email" className="font-semibold">Email:</label>
          <input type="email" id="email" name="email" className="border-2 border-[#D9D9D9] rounded-lg px-2"  onChange={handleChange} required />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex flex-col md:flex-row gap-2">
          <label for="contactNumber" className="font-semibold">Contact Number:</label>
          <input type="tel" id="contactNumber" name="contactNumber" className="border-2 border-[#D9D9D9] rounded-lg px-2"  onChange={handleChange} />
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <label for="address" className="font-semibold">Address:</label>
          <input type="text" id="address" name="address" className="border-2 border-[#D9D9D9] rounded-lg px-2"  onChange={handleChange} />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex flex-col md:flex-row gap-2">
          <label for="gender" className="font-semibold">Gender:</label>
          <select id="gender" name="gender" className="border-2 border-[#D9D9D9] rounded-lg px-2"  onChange={handleChange} required>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <label for="parentGuardianContact" className="font-semibold">Parent/Guardian Contact:</label>
          <input type="tel" id="parentGuardianContact" name="parentGuardianContact" className="border-2 border-[#D9D9D9] rounded-lg px-2"  onChange={handleChange}/>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-2">
        <label for="parentGuardianName" className="font-semibold">Parent/Guardian Name:</label>
        <input type="text" id="parentGuardianName" name="parentGuardianName" className="border-2 border-[#D9D9D9] rounded-lg px-2 grow"  onChange={handleChange} />
      </div>

      <button type="submit" className="font-bold bg-primary-green px-4 py-2 rounded-lg text-safe-white">Submit</button>
      <button onClick={() => {setAddStudent(false)}} className="font-bold border-2 border-primary-green px-4 py-2 rounded-lg text-primary-green">Cancel</button>
    </form>
    </div>
    </>
  );
};

export default StudentForm;
