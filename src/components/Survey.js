import * as React from 'react';
import { useState, useEffect } from 'react';

import { getDatabase, ref, get } from "firebase/database";

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

//components
import SurveyForm from "./SurveyForm"
import ViewSurvey from "./ViewSurvey"



const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: `#40916C`,
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

function createData( surveyName, timeLimit , category, status, id) {
  return { surveyName, timeLimit, category, status, id};
}

export default function Survey(){

	// State for pagination
	const [rows, setRows] = useState([])
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);

	//State for component changes
	const [addSurvey, setAddSurvey] = useState(false);
	const [viewSurvey, setViewSurvey] = useState(false);

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
  	}, [addSurvey, viewSurvey]);

  	if(addSurvey) return <SurveyForm setAddSurvey={setAddSurvey}/>

  	if(viewSurvey) return <ViewSurvey viewSurvey={viewSurvey} setViewSurvey={setViewSurvey}/>
  

	return(

		<div className="flex flex-col gap-4 h-full">
			<h1 className="text-[24px] md:text-[32px] font-bold text-primary-green">Survey Questionares</h1>

			<div className="flex flex-row justify-end gap-4">
				<button onClick={() => {setAddSurvey(true)}} className="h-10 font-bold px-2 border-primary-green text-primary-green border-2 rounded-lg hover:bg-primary-green hover:text-safe-white">Add Survey</button>
				{/*<button className="h-10 font-bold p-2 border-primary-green text-primary-green border-2 rounded-lg hover:bg-primary-green hover:text-safe-white"><HiAdjustments className="w-5 h-5" /></button>*/}
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
				              	handleViewSurvey(row.id)
				              }}
				              className="p-2 font-bold text-safe-white bg-primary-green rounded-lg">
				              Edit
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