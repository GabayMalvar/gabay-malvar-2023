import React, { useState, useEffect } from 'react';

//firebase
import { auth, db } from '../configs/firebase';
import { getDatabase, get, ref, set, push, query, orderByChild, equalTo } from "firebase/database";

//external imports
import { toast } from 'react-toastify';


export default function SectionForm({ setAddSection }){

	const [sectionInfo, setSectionInfo] = useState({
		sectionName: '',
		schoolYear: '',
	});

	const [schoolYearArr, setSchoolYearArr] = useState([])

	//handlers
	const handleChange = (e) => {
		const { name, value } = e.target;
		setSectionInfo(prevState => ({
		  ...prevState,
		  [name]: value
		}));
	};

	const handleSubmit = async (e) => {
	  e.preventDefault();

	  const sectionsRef = ref(db, 'sections');
	  const sectionQuery = query(sectionsRef, orderByChild('sectionName'), equalTo(sectionInfo.sectionName));

	  try {
	    const sectionSnapshot = await get(sectionQuery);

	    let sectionExists = false;
	    sectionSnapshot.forEach((childSnapshot) => {
	      const sectionData = childSnapshot.val();
	      if (sectionData.schoolYear === sectionInfo.schoolYear) {
	        sectionExists = true;
	      }
	    });

	    if (sectionExists) {
	      toast.error(`A section with the name "${sectionInfo.sectionName}" already exists for the school year ${sectionInfo.schoolYear}.`);
	    } else {
	      const newSectionRef = push(sectionsRef);
	      await set(newSectionRef, {
	        ...sectionInfo,
	        status: "Active",
	      });

	      // Handle success
	      setAddSection(false);
	      toast.success("Section details saved to database.");
	    }
	  } catch (error) {
	    // Handle errors
	    console.error("Error checking section existence: ", error);
	    toast.error("Error saving section details: " + error.message);
	  }
	};


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

	return (

		<>
		<h1 className="text-[20px] md:text-[28px] font-bold text-primary-green">Sections / Add Sections</h1>
		<div className="flex items-center justify-center">
			<form className="flex flex-col md:pt-10 gap-4 max-w-[670px] border-2 p-4 rounded-xl md:mt-5"  onSubmit={handleSubmit}>

				<div className="flex flex-col md:flex-row gap-4">
				  <div className="flex flex-col md:flex-row gap-2">
				    <label for="sectionName" className="font-semibold">Section Name:</label>
				    <input type="text" id="sectionName" name="sectionName" className="border-2 border-[#D9D9D9] rounded-lg px-2" onChange={handleChange} required />
				  </div>

				  <div className="flex flex-col md:flex-row gap-2">
				    <label htmlFor="schoolYear" className="font-semibold">School Year:</label>
				    <select 
				      id="schoolYear" 
				      name="schoolYear"  
				      className="border-2 border-[#D9D9D9] rounded-lg px-2" 
				      onChange={handleChange} 
				      required
				      value={sectionInfo.schoolYear}
				    >
				      <option value="">Select School Year</option>
				      {schoolYearArr.map((school) => (
				        <option key={school.id} value={school.schoolYear}>
				          {school.schoolYear}
				        </option>
				      ))}
				    </select>
				  </div>
				</div>

				<button type="submit" className="font-bold bg-primary-green px-4 py-2 rounded-lg text-safe-white">Submit</button>
				<button onClick={() => {setAddSection(false)}} className="font-bold border-2 border-primary-green px-4 py-2 rounded-lg text-primary-green">Cancel</button>

			</form>
		</div>
		</>
	);

}