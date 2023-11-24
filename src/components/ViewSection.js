import { useState, useEffect } from "react"
import { toast } from "react-toastify";

import { getDatabase, ref, get, update } from "firebase/database";

export default function ViewSection({ viewSection, setViewSection }){

	const { id, sectionName, schoolYear, status } = viewSection

	const [sectionInfo, setSectionInfo] = useState({
	  id: id,
	  sectionName: sectionName,
	  schoolYear: schoolYear,
	  status: status,
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

	  if (!sectionInfo.id) {
	    console.error('No ID provided for the section');
	    toast.error('An error occurred. No section ID provided.');
	    return;
	  }

	  const db = getDatabase();
	  const sectionRef = ref(db, `sections/${sectionInfo.id}`);

	  try {
	    await update(sectionRef, {
	      sectionName: sectionInfo.sectionName,
	      schoolYear: sectionInfo.schoolYear,
	      status: sectionInfo.status
	    });

	    toast.success('Section information updated successfully');
	    setViewSection(false)
	  } catch (error) {
	    console.error('Error updating section information:', error);
	    toast.error('Failed to update section information: ' + error.message);
	  }
	};

	const toggleSectionStatus = async (sectionId) => {
	  const db = getDatabase();
	  const sectionRef = ref(db, `sections/${sectionId}`);

	  try {
	    const sectionSnapshot = await get(sectionRef);
	    if (sectionSnapshot.exists()) {
	      const currentSection = sectionSnapshot.val();
	      const newStatus = currentSection.status === "Active" ? "Disabled" : "Active";

	      await update(sectionRef, { status: newStatus });

	      setSectionInfo(prevSectionInfo => ({
	        ...prevSectionInfo,
	        status: newStatus,
	      }));

	      await updateUsersInSectionAndSchoolYear(currentSection.sectionName, currentSection.schoolYear, newStatus, db);


	      toast.success(`Section status updated to ${newStatus}.`);
	    } else {
	      toast.error('Section not found.');
	    }
	  } catch (error) {
	    console.error('Error updating section status:', error);
	    toast.error(`Failed to update section status: ${error.message}`);
	  }
	};

	const updateUsersInSectionAndSchoolYear = async (sectionName, schoolYear, newStatus, db) => {
	  await updateUserStatusInSectionAndSchoolYear('users', sectionName, schoolYear, newStatus, db, false);

	  await updateUserStatusInSectionAndSchoolYear('temporary-users', sectionName, schoolYear, newStatus, db, true);
	};

	const updateUserStatusInSectionAndSchoolYear = async (path, sectionName, schoolYear, newStatus, db, isTemporary) => {
	  const usersRef = ref(db, path);
	  const usersSnapshot = await get(usersRef);
	  if (usersSnapshot.exists()) {
	    const users = usersSnapshot.val();
	    const userPromises = [];
	    for (const userId in users) {
	      const user = users[userId];
	      if (user.section === sectionName && user.schoolYear === schoolYear) {
	        const statusToUpdate = isTemporary ? (newStatus === 'Disabled' ? 'Disabled' : 'Pending') : newStatus;

	        const userRef = ref(db, `${path}/${userId}`);
	        userPromises.push(update(userRef, { status: statusToUpdate }));
	        console.log(`User ${userId} status updated to ${statusToUpdate}`);
	      }
	    }
	    await Promise.all(userPromises);
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



	return(

		<div className="flex items-center justify-center">
			<form className="flex flex-col md:pt-10 gap-4 max-w-[670px] border-2 p-4 rounded-xl md:mt-5"  onSubmit={handleSubmit}>

				<div className="flex flex-col md:flex-row gap-4">
				  <div className="flex flex-col md:flex-row gap-2">
				    <label for="sectionName" className="font-semibold">Section Name:</label>
				    <input type="text" id="sectionName" name="sectionName" className="border-2 border-[#D9D9D9] rounded-lg px-2" value={sectionInfo.sectionName} onChange={handleChange} required />
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

				<div className="flex flex-col md:flex-row gap-2">
				    <label for="status" className="font-semibold">Status:</label>
				    <button type="button" onClick={() => {toggleSectionStatus(sectionInfo.id)}} className={`border-2 border-[#D9D9D9] rounded-lg px-2 ${sectionInfo.status === "Active"? "border-primary-green text-primary-green hover:bg-primary-green hover:text-safe-white font-bold" : "border-[#ff2a00] text-[#ff2a00] hover:bg-[#ff2a00] hover:text-safe-white font-bold" }`}>{sectionInfo.status}</button>
				  </div>

				<button type="submit" className="font-bold bg-primary-green px-4 py-2 rounded-lg text-safe-white">Update</button>
				<button onClick={() => {setViewSection(false)}} className="font-bold border-2 border-primary-green px-4 py-2 rounded-lg text-primary-green">Cancel</button>

			</form>
		</div>

	);

}