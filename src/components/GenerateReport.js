import { useState, useEffect } from 'react';

import { getDatabase, ref, get, set } from "firebase/database";

import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

// mui styling
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TablePagination from '@mui/material/TablePagination';


const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const categoryMapping = {
  Realistic: 'R',
  Investigative: 'I',
  Artistic: 'A',
  Social: 'S',
  Enterprise: 'E',
  Conventional: 'C',
};

function calculateStrandScores(scores) {
  const categoryScores = Object.entries(scores).reduce((acc, [category, score]) => {
    const code = categoryMapping[category];
    if (code) {
      acc[code] = (acc[code] || 0) + score; // Sum scores if categories repeat
    }
    return acc;
  }, {});

  let strandScores = {
    STEM: 0,
    HUMSS: 0,
    ABM: 0,
    TVL: 0,
    SPORTS: 0,
    'ARTS AND DESIGN': 0,
    ICT: 0,
  };

  // Calculate the scores for each strand based on the category combinations
  strandScores['STEM'] = (categoryScores['R'] || 0) + (categoryScores['I'] || 0) + (categoryScores['C'] || 0);
  strandScores['HUMSS'] = (categoryScores['R'] || 0) + (categoryScores['A'] || 0) + (categoryScores['S'] || 0);
  strandScores['ABM'] = (categoryScores['I'] || 0) + (categoryScores['E'] || 0) + (categoryScores['C'] || 0);
  strandScores['TVL'] = (categoryScores['R'] || 0) + (categoryScores['I'] || 0) + (categoryScores['A'] || 0);
  strandScores['SPORTS'] = (categoryScores['C'] || 0) + (categoryScores['R'] || 0) + (categoryScores['S'] || 0);
  strandScores['ARTS AND DESIGN'] = (categoryScores['I'] || 0) + (categoryScores['A'] || 0) + (categoryScores['S'] || 0);
  strandScores['ICT'] = (categoryScores['R'] || 0) + (categoryScores['I'] || 0) + (categoryScores['E'] || 0);
  return strandScores;
}

function getSuggestedTrack(scores) {
  if (new Set(Object.values(scores)).size === 1) {
    return ['GAS'];
  }

  // Calculate total scores for each strand
  const strandScores = calculateStrandScores(scores);

  // Sort strands by their total scores in descending order
  const sortedStrands = Object.entries(strandScores).sort((a, b) => b[1] - a[1]);

  // Return the top 3 strands based on the highest total scores
  return sortedStrands.slice(0, 3).map(entry => entry[0]);
}

export default function GenerateReport({ isVisible, setIsVisible, data }) {

	const componentRef = useRef();

	const [rows, setRows] = useState([]);
	const [selectedTrack, setSelectedTrack] = useState("All Track");
	const [schoolYear, setSchoolYear] = useState("All")
	const [schoolYearArr, setSchoolYearArr] = useState([])
	const [template, setTemplate] = useState("With Assessment");

	function createData(name, email, section, status, imgUrl, uid) {
	  return { name, email, section, status, imgUrl, uid };
	}

	const now = new Date();

	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');
	const hours = String(now.getHours()).padStart(2, '0');
	const minutes = String(now.getMinutes()).padStart(2, '0');
	const seconds = String(now.getSeconds()).padStart(2, '0');
	const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

	//handlers
	const handleChange = (e) => {
		const { name, value } = e.target;
		setSchoolYear(value)
	};

	const handlePrint = useReactToPrint({
	  content: () => componentRef.current,
	  documentTitle: 'Assessment Report',
	  onAfterPrint: () => console.log('Print finished'),
	});



	useEffect(() => {
	  const db = getDatabase();
	  const usersRef = ref(db, 'users');
	  const tempUsersRef = ref(db, 'temporary-users');

	  const fetchUsers = async () => {
	    const [usersSnapshot, tempUsersSnapshot] = await Promise.all([
	      get(usersRef),
	      get(tempUsersRef),
	    ]);

	    let combinedUsersList = [];

	    const processUser = (user, userId) => {
	      if (user.status !== 'Active' || user.userType !== 'Student' || (schoolYear !== "All" && user.schoolYear !== schoolYear)) {
	        return; // Skip non-active or non-student users
	      }

	      const userTests = user['test-taken'];
	      const completedAssessment = userTests && Object.values(userTests).some(test => test.status === "Completed");
	      const totalCategoryPoints = {};
	      Object.values(userTests || {}).forEach(test => {
	        // Make sure test.categoryPoints is an object before calling Object.entries
	        if (test.categoryPoints && typeof test.categoryPoints === 'object') {
	          Object.entries(test.categoryPoints).forEach(([category, points]) => {
	            if (!totalCategoryPoints[category]) {
	              totalCategoryPoints[category] = 0;
	            }
	            totalCategoryPoints[category] += points;
	          });
	        }
	      });
	      const suggestedTracks = completedAssessment ? getSuggestedTrack(totalCategoryPoints) : [];

	      // Check the template and if the user's suggested tracks include the selected track
	      if (
	        (template === "With Assessment" && completedAssessment && (selectedTrack === "All Track" || suggestedTracks.includes(selectedTrack))) ||
	        (template === "Without Assessment" && !completedAssessment)
	      ) {
	        combinedUsersList.push(createData(
	          `${user.lastName}, ${user.firstName} ${user.middleInitial || ''}.`,
	          user.email,
	          user.section,
	          user.status,
	          user.profileImg,
	          userId
	        ));
	      }
	    };

	    // Process users node
	    if (usersSnapshot.exists()) {
	      Object.entries(usersSnapshot.val()).forEach(([userId, user]) => {
	        processUser(user, userId);
	      });
	    }

	    // Process temporary-users node
	    if (tempUsersSnapshot.exists()) {
	      Object.entries(tempUsersSnapshot.val()).forEach(([userId, user]) => {
	        processUser(user, userId);
	      });
	    }

	    // Sort by lastName
	    combinedUsersList.sort((a, b) => a.name.split(', ')[0].localeCompare(b.name.split(', ')[0]));

	    setRows(combinedUsersList);
	  };

	  fetchUsers().catch(console.error);
	}, [selectedTrack, template, schoolYear]);

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



	
	if(!isVisible)return null

	return(

		<div className="flex flex-col gap-4">
			<div className=" flex flex-col sm:flex-row gap-4 justify-center">
				<button onClick={() => {setTemplate("With Assessment")}} className={`h-10 font-bold px-2 border-primary-green text-primary-green border-2 rounded-lg relative overflow-hidden cursor-pointer hover:bg-primary-green hover:text-safe-white hover:opacity-70 ${template === "With Assessment"? "bg-primary-green text-safe-white opacity-100": null}`}>
				  With Assessment
				</button>
				<button onClick={() => {setTemplate("Without Assessment")}} className={`h-10 font-bold px-2 border-primary-green text-primary-green border-2 rounded-lg relative overflow-hidden cursor-pointer hover:bg-primary-green hover:text-safe-white hover:opacity-70 ${template === "Without Assessment"? "bg-primary-green text-safe-white": null}`}>
				  No Assessment
				</button>
			</div>
			<div>
			  <button className="bg-primary-green text-safe-white px-4 py-2 rounded-lg font-bold" onClick={handlePrint}>Generate PDF</button>
			</div>

			{
				template === "With Assessment"?
				<>
				<select value={selectedTrack} onChange={(e) => setSelectedTrack(e.target.value)} className="w-[200px] border-2 rounded-lg">
					<option value="All Track">All Track</option>
					<option value="STEM">STEM</option>
					<option value="ABM">ABM</option>
					<option value="HUMSS">HUMSS</option>
					<option value="ICT">ICT</option>
					<option value="TVL">TVL</option>
					<option value="SPORTS">SPORTS</option>
					<option value="ARTS AND DESIGN">ARTS AND DESIGN</option>
					<option value="GAS">GAS</option>
				</select>
				<div className="flex flex-col md:flex-row gap-2">
				  <label htmlFor="schoolYear" className="font-semibold">School Year:</label>
				  <select 
				    id="schoolYear" 
				    name="schoolYear"  
				    className="border-2 rounded-lg px-2" 
				    onChange={handleChange} 
				    required
				    value={schoolYear}
				  >
				    <option value="All">All</option>
				    {schoolYearArr.map((school) => (
				      <option key={school.id} value={school.schoolYear}>
				        {school.schoolYear}
				      </option>
				    ))}
				  </select>
				</div>
				<div className="border-2 border-[#D9D9D9]">
				<div ref={componentRef} className="flex flex-col gap-4 p-4">
					<h2 className="font-bold text-[20px]">Assessment per track</h2>
					<div className="h-[0.5px] w-full border-2"></div>
					<p>GABAY: Student Career Assistance for Grade 10 Students for Malvar School of Arts and Trades</p>
					<p>Students With Assessment</p>
					<p>Academic Year: {schoolYear}</p>
					<p>Date Printed: {formattedDateTime}</p>
					<TableContainer component={Paper} className="mt-4">
					  <Table sx={{ minWidth: 700 }} aria-label="customized table">
					    <TableHead>
					      <TableRow>
					        <StyledTableCell>Name</StyledTableCell>
					        <StyledTableCell>Email</StyledTableCell>
					        <StyledTableCell>Section</StyledTableCell>
					        <StyledTableCell>Status</StyledTableCell>
					      </TableRow>
					    </TableHead>
					    <TableBody>
					    	{
					    	  rows.map((row, index) => (
					    	  <StyledTableRow key={row.name + index}>
					    	    <StyledTableCell component="th" scope="row">
					    	      {row.name}
					    	    </StyledTableCell>
					    	    <StyledTableCell>{row.email}</StyledTableCell>
					    	    <StyledTableCell>{row.section}</StyledTableCell>
					    	     <StyledTableCell>{row.status}</StyledTableCell>
					    	  </StyledTableRow>
					    	))}
					    </TableBody>
					  </Table>
					</TableContainer>
				</div>
				</div>
				</>
				:
				<>
				<div className="flex flex-col md:flex-row gap-2">
				  <label htmlFor="schoolYear" className="font-semibold">School Year:</label>
				  <select 
				    id="schoolYear" 
				    name="schoolYear"  
				    className="border-2 rounded-lg px-2" 
				    onChange={handleChange} 
				    required
				    value={schoolYear}
				  >
				    <option value="All">All</option>
				    {schoolYearArr.map((school) => (
				      <option key={school.id} value={school.schoolYear}>
				        {school.schoolYear}
				      </option>
				    ))}
				  </select>
				</div>
				<div className="border-2 border-[#D9D9D9]">
				<div ref={componentRef} className="flex flex-col gap-4 p-4">
					<h2 className="font-bold text-[20px]">Students Without Assessment</h2>
					<div className="h-[0.5px] w-full border-2"></div>
					<p>GABAY: Student Career Assistance for Grade 10 Students for Malvar School of Arts and Trades</p>
					<p>Students Without Assessment</p>
					<p>Academic Year: {schoolYear}</p>
					<p>Date Printed: {formattedDateTime}</p>
					<TableContainer component={Paper}>
					  <Table sx={{ minWidth: 700 }} aria-label="customized table">
					    <TableHead>
					      <TableRow>
					        <StyledTableCell>Name</StyledTableCell>
					        <StyledTableCell>Email</StyledTableCell>
					        <StyledTableCell>Section</StyledTableCell>
					        <StyledTableCell>Status</StyledTableCell>
					      </TableRow>
					    </TableHead>
					    <TableBody>
					    	{
					    	  rows.map((row, index) => (
					    	  <StyledTableRow key={row.name + index}>
					    	    <StyledTableCell component="th" scope="row">
					    	      {row.name}
					    	    </StyledTableCell>
					    	    <StyledTableCell>{row.email}</StyledTableCell>
					    	    <StyledTableCell>{row.section}</StyledTableCell>
					    	     <StyledTableCell>{row.status}</StyledTableCell>
					    	  </StyledTableRow>
					    	))}
					    </TableBody>
					  </Table>
					</TableContainer>
				</div>
				</div>
				</>
			}
		</div>
	)

}