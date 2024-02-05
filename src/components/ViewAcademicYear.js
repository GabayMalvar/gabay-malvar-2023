import { useState } from "react"
import { toast } from "react-toastify";

import { getDatabase, ref, get, update, query, orderByChild, equalTo } from "firebase/database";

export default function ViewAcademicYear({ viewAcademicYear, setViewAcademicYear }){

	const { id, schoolYear, status } = viewAcademicYear

	const [academicYearInfo, setAcademicYearInfo] = useState({
	  id: id,
	  schoolYear: schoolYear,
	  status: status,
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

	  if (!academicYearInfo.id) {
	    console.error('No ID provided for the academic year');
	    toast.error('An error occurred. No academic year ID provided.');
	    return;
	  }

	  const db = getDatabase();
	  const academicYearRef = ref(db, `academic-year/${academicYearInfo.id}`);

	  try {
	    await update(academicYearRef, {
	      schoolYear: academicYearInfo.schoolYear,
	      status: academicYearInfo.status
	    });

	    toast.success('Academic Year information updated successfully');
	    setViewAcademicYear(false)
	  } catch (error) {
	    console.error('Error updating academic year information:', error);
	    toast.error('Failed to update academic year information: ' + error.message);
	  }
	};

	const toggleAcademicYearStatusAndUpdateDependents = async (academicYearId) => {
	  const db = getDatabase();
	  const academicYearRef = ref(db, `academic-year/${academicYearId}`);

	  try {
	    const academicYearSnapshot = await get(academicYearRef);
	    if (academicYearSnapshot.exists()) {
	      const currentAcademicYear = academicYearSnapshot.val();
	      const newStatus = currentAcademicYear.status === "Active" ? "Disabled" : "Active";

	      await update(academicYearRef, { status: newStatus });

	      setAcademicYearInfo(prevAcademicYearInfo => ({
	        ...prevAcademicYearInfo,
	        status: newStatus,
	      }));

	      await updateStatusForSchoolYear(currentAcademicYear.schoolYear, newStatus, db);

	      toast.success(`Academic year status updated to ${newStatus}.`);
	    } else {
	      toast.error('Academic year not found.');
	    }
	  } catch (error) {
	    console.error('Error updating academic year status:', error);
	    toast.error(`Failed to update academic year status: ${error.message}`);
	  }
	};

	const updateStatusForSchoolYear = async (schoolYear, newStatus, db) => {
	  const sectionsRef = ref(db, 'sections');
	  const sectionsQuery = query(sectionsRef, orderByChild('schoolYear'), equalTo(schoolYear));
	  const sectionsSnapshot = await get(sectionsQuery);
	  const sectionUpdates = [];
	  if (sectionsSnapshot.exists()) {
	    sectionsSnapshot.forEach((childSnapshot) => {
	      const sectionUpdateRef = ref(db, `sections/${childSnapshot.key}`);
	      sectionUpdates.push(update(sectionUpdateRef, { status: newStatus }));
	    });
	  }

	  const userUpdates = await gatherUserUpdates('users', schoolYear, newStatus, db); 
	  if(newStatus === "Active"){ newStatus = "Pending"}
	  const tempUserUpdates = await gatherUserUpdates('temporary-users', schoolYear, newStatus, db);

	  // Wait for all updates to complete
	  await Promise.all([...sectionUpdates, ...userUpdates, ...tempUserUpdates]);
	};

	const gatherUserUpdates = async (path, schoolYear, newStatus, db) => {
	  const usersRef = ref(db, path);
	  const usersQuery = query(usersRef, orderByChild('schoolYear'), equalTo(schoolYear));
	  const usersSnapshot = await get(usersQuery);
	  const updates = [];
	  if (usersSnapshot.exists()) {
	    usersSnapshot.forEach((childSnapshot) => {
	      const userUpdateRef = ref(db, `${path}/${childSnapshot.key}`);
	      updates.push(update(userUpdateRef, { status: newStatus }));
	    });
	  }
	  return updates;
	};


	const updateUsersAndTempUsersStatus = async (path, schoolYear, newStatus, db) => {
	  const usersRef = ref(db, path);
	  const usersQuery = query(usersRef, orderByChild('schoolYear'), equalTo(schoolYear));
	  const usersSnapshot = await get(usersQuery);
	  if (usersSnapshot.exists()) {
	    usersSnapshot.forEach(async (childSnapshot) => {
	      const userUpdateRef = ref(db, `${path}/${childSnapshot.key}`);
	      await update(userUpdateRef, { status: newStatus });
	    });
	  }
	};


	return(

		<div className="flex items-center justify-center">
			<form className="w-full flex flex-col md:pt-10 gap-4 max-w-[670px] border-2 p-4 rounded-xl md:mt-5"  onSubmit={handleSubmit}>

				<div className="flex flex-col md:flex-row gap-4">
				  <div className="flex flex-col md:flex-row gap-2">
				    <label for="status" className="font-semibold">Status:</label>
				    <button type="button" onClick={() => {toggleAcademicYearStatusAndUpdateDependents(academicYearInfo.id)}} className={`border-2 border-[#D9D9D9] rounded-lg px-2 ${academicYearInfo.status === "Active"? "border-primary-green text-primary-green hover:bg-primary-green hover:text-safe-white font-bold" : "border-[#ff2a00] text-[#ff2a00] hover:bg-[#ff2a00] hover:text-safe-white font-bold" }`}>{academicYearInfo.status}</button>
				  </div>

				  <div className="flex flex-col md:flex-row gap-2">
				    <label for="schoolYear" className="font-semibold">School Year:</label>
				    <input type="text" id="schoolYear" name="schoolYear" placeholder="e.g., 2022-2023" className="border-2 border-[#D9D9D9] rounded-lg px-2" value={academicYearInfo.schoolYear} onChange={handleChange} required />
				  </div>
				</div>

				<button type="submit" className="font-bold bg-primary-green px-4 py-2 rounded-lg text-safe-white">Update</button>
				<button onClick={() => {setViewAcademicYear(false)}} className="font-bold border-2 border-primary-green px-4 py-2 rounded-lg text-primary-green">Cancel</button>

			</form>
		</div>

	);

}