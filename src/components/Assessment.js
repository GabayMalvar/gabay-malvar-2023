import * as React from 'react';
import { useState, useEffect } from 'react';

import { getDatabase, ref, get } from "firebase/database";

//context
import { useAuthContext } from "../contexts/AuthContext"

// components
import StartAssessment from "./StartAssessment";
import ResultAssessment from "./ResultAssessment";

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

import { HiAdjustments } from "react-icons/hi";


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

function createData( surveyName, timeLimit , category, status, isTaken, id) {
  return { surveyName, timeLimit, category, status, isTaken, id};
}

export default function Assessment(){

	const { user } = useAuthContext();

	// State for pagination
	const [rows, setRows] = useState([])
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);

	const [viewSurvey, setViewSurvey] = useState(false)
	const [viewTestResults, setViewTestResults] = useState(false)

	const [takenSurveys, setTakenSurveys] = useState({});

	// Avoid a layout jump when reaching the last page with empty rows.
	const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

	//handlers
	const handleChangePage = (event, newPage) => {
    	setPage(newPage);
  	};

  	const handleChangeRowsPerPage = (event) => {
  	  setRowsPerPage(parseInt(event.target.value, 10));
  	  setPage(0);
  	};

  	const handleViewSurvey = async (id) => {
  	  const db = getDatabase();
  	  const surveyRef = ref(db, `survey/${id}`);
  	  try {
  	    const snapshot = await get(surveyRef);
  	    if (snapshot.exists()) {
  	      setViewSurvey({
  	        ...snapshot.val(),
  	        id: id
  	      });
  	    } else {
  	      console.log('No survey data available for ID:', id);
  	    }
  	  } catch (error) {
  	    console.error('Error fetching survey:', error);
  	  }
  	};

  	const checkIfSurveyTaken = async (userId, surveyId) => {
  	  const db = getDatabase();
  	  const userTestRef = ref(db, `users/${userId}/test-taken`);
  	  
  	  try {
  	    const snapshot = await get(userTestRef);
  	    if (snapshot.exists()) {
  	      const tests = snapshot.val();
  	      if (Array.isArray(tests)) {
  	        return tests.some(test => test.surveyId === surveyId);
  	      } else {
  	        if (tests !== null && typeof tests === 'object') {
  	          return Object.values(tests).some(test => test.surveyId === surveyId);
  	        }
  	      }
  	    } else {
  	      console.log('No tests taken by the user found.');
  	    }
  	  } catch (error) {
  	    console.error('Error fetching user tests:', error);
  	  }
  	  return false;
  	};

  	const findUserTestBySurveyId = async (userId, surveyId, surveyName) => {
  	  const db = getDatabase();
  	  const userTestRef = ref(db, `users/${userId}/test-taken`);
  	  
  	  try {
  	    const snapshot = await get(userTestRef);
  	    if (snapshot.exists()) {
  	      const tests = snapshot.val();
  	      const testsArray = Array.isArray(tests) ? tests : Object.values(tests);
  	      let testTaken = testsArray.find(test => test.surveyId === surveyId);
  	      testTaken.surveyName = surveyName 

  	      if (testTaken) {
  	        console.log('Test taken:', testTaken);
  	        setViewTestResults(testTaken);
  	        return testTaken;
  	      } else {
  	        console.log('No test taken found for the given survey ID.');
  	        return null;
  	      }
  	    } else {
  	      console.log('No test taken data available for this user.');
  	      return null;
  	    }
  	  } catch (error) {
  	    console.error('Error fetching test data:', error);
  	    throw error;
  	  }
  	};


  	//useEffects
  	useEffect(() => {
  	  const db = getDatabase();
  	  const surveyRef = ref(db, 'survey');

  	  get(surveyRef).then((snapshot) => {
  	    if (snapshot.exists()) {
  	      const surveyData = [];
  	      snapshot.forEach((childSnapshot) => {
  	        const key = childSnapshot.key;
  	        const surveys = childSnapshot.val();
  	        surveyData.push({
  	          ...surveys,
  	          id: key,
  	        });
  	      });
  	      setRows(surveyData)
  	      console.log(surveyData)
  	    } else {
  	      console.log("No surveys data available");
  	    }
  	  }).catch((error) => {
  	    console.error("Error fetching surveys: ", error);
  	  });
  	}, []);

  	useEffect(() => {
  	  const fetchTakenSurveys = async () => {
  	    const db = getDatabase();
  	    const userTestRef = ref(db, `users/${user.uid}/test-taken`);
  	    try {
  	      const snapshot = await get(userTestRef);
  	      if (snapshot.exists()) {
  	        const tests = snapshot.val();
  	        const testsArray = Array.isArray(tests) ? tests : Object.values(tests);
  	        const completedOrClosedSurveyIds = testsArray
  	          .filter(test => test.status !== 'Pending' && test.surveyId)
  	          .map(test => test.surveyId);
  	        
  	        setTakenSurveys(completedOrClosedSurveyIds.reduce((acc, id) => ({ ...acc, [id]: true }), {}));
  	      }
  	    } catch (error) {
  	      console.error('Error fetching taken surveys:', error);
  	    }
  	  };

  	  fetchTakenSurveys();
  	}, [user.uid, viewSurvey]);



  	if(viewSurvey) return <StartAssessment viewSurvey={viewSurvey} setViewSurvey={setViewSurvey}/>

  	if(viewTestResults) return <ResultAssessment viewTestResults={viewTestResults} setViewTestResults={setViewTestResults}/>
	

	return(

		<div className="flex flex-col gap-4 h-full">
			<h1 className="text-[24px] md:text-[32px] font-bold text-primary-green">Assessments</h1>

			<div className="flex flex-row justify-end gap-4">
				<button className="h-10 font-bold p-2 border-primary-green text-primary-green border-2 rounded-lg"><HiAdjustments className="w-5 h-5" /></button>
			</div>

			<TableContainer component={Paper}>
			  <Table sx={{ minWidth: 700 }} aria-label="customized table">
			    <TableHead>
			      <TableRow>
			        <StyledTableCell>Questionare</StyledTableCell>
			        <StyledTableCell>Category</StyledTableCell>
			        <StyledTableCell>Status</StyledTableCell>
			        <StyledTableCell>Time Limit</StyledTableCell>
			        <StyledTableCell>Manage</StyledTableCell>
			      </TableRow>
			    </TableHead>
			    <TableBody>
			    	{(rowsPerPage > 0
			    	  ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
			    	  : rows
			    	).map((row, index) => (
			    	  <StyledTableRow key={row.sectionName + index}>
			    	    <StyledTableCell component="th" scope="row">
			    	      {row.surveyName}
			    	    </StyledTableCell>
			    	    <StyledTableCell>{row.category}</StyledTableCell>
			    	     <StyledTableCell>{row.status}</StyledTableCell>
			    	     <StyledTableCell>{`${row.timeLimit === 0? "N/A" : `${row.timeLimit} min(s)`}`}</StyledTableCell>
			    	    <StyledTableCell>
			    	    	<button
		    	                onClick={() => {
		    	                  if (takenSurveys[row.id]) {
		    	                    findUserTestBySurveyId(user.uid, row.id, row.surveyName)
		    	                  } else {
		    	                    handleViewSurvey(row.id);
		    	                  }
		    	                }}
		    	                className={`p-2 font-bold text-safe-white rounded-lg ${
		    	                  takenSurveys[row.id] ? "bg-[#edbe24]" : "bg-primary-green"
		    	                }`}
		    	              >
		    	                {takenSurveys[row.id] ? "See Test Result" : "Start"}
		    	              </button>
            			</StyledTableCell>
			    	  </StyledTableRow>
			    	))}

			    	{emptyRows > 0 && (
			    	  <TableRow style={{ height: 53 * emptyRows }}>
			    	    <TableCell colSpan={6} />
			    	  </TableRow>
			    	)}
			    </TableBody>
			  </Table>
			</TableContainer>

			<TablePagination
			  rowsPerPageOptions={[5, 10, 25, 50]}
			  component="div"
			  count={rows.length}
			  rowsPerPage={rowsPerPage}
			  page={page}
			  onPageChange={handleChangePage}
			  onRowsPerPageChange={handleChangeRowsPerPage}
			/>

		</div>
	);

}