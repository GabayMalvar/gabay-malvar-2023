import React, { useState } from 'react';

//firebase
import { auth, db } from '../configs/firebase';
import { ref, set, push } from "firebase/database";

//external imports
import { toast } from 'react-toastify';

export default function AcademicYearForm({ setAddAcademicYear }){

	const [academicYearInfo, setAcademicYearInfo] = useState({
		schoolYear: '',
		status: '',
	});

	//handlers
	const handleChange = (e) => {
		const { name, value } = e.target;
		setAcademicYearInfo(prevState => ({
		  ...prevState,
		  [name]: value
		}));
	};

	const handleSubmit = async (e) => {
	  e.preventDefault();

	  const academicYearRef = ref(db, 'academic-year');
	  const newAcademicYearRef = push(academicYearRef);

	  try {
	    await set(newAcademicYearRef, {
	      ...academicYearInfo,
	      status: "Active",
	    });

	    setAddAcademicYear(false)
	    toast.success("Academic year datails saved to database.");
	  } catch (error) {
	    toast.error("Error saving academic year details: " + error.message);
	  }
	};

	return(
		<>
		<h1 className="text-[20px] md:text-[28px] font-bold text-primary-green">Academic Year / Add Academic Year</h1>
		<div className="flex items-center justify-center">
			<form className="flex flex-col md:pt-10 gap-4 max-w-[670px] border-2 p-4 rounded-xl md:mt-5"  onSubmit={handleSubmit}>

				<div className="flex flex-col md:flex-row gap-4">
				  <div className="flex flex-col md:flex-row gap-2">
				    <label for="status" className="font-semibold">Status:</label>
				    <input type="text" id="status" name="status" className="border-2 border-[#D9D9D9] rounded-lg px-2" onChange={handleChange} required />
				  </div>

				  <div className="flex flex-col md:flex-row gap-2">
				    <label for="schoolYear" className="font-semibold">Academic Year:</label>
				    <input type="text" id="schoolYear" name="schoolYear" placeholder="e.g., 2022-2023" className="border-2 border-[#D9D9D9] rounded-lg px-2"  onChange={handleChange} required />
				  </div>
				</div>

				<button type="submit" className="font-bold bg-primary-green px-4 py-2 rounded-lg text-safe-white">Submit</button>
				<button onClick={() => {setAddAcademicYear(false)}} className="font-bold border-2 border-primary-green px-4 py-2 rounded-lg text-primary-green">Cancel</button>

			</form>
		</div>
		</>
	);

}