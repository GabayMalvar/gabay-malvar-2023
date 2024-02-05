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
import SectionForm from "./SectionForm"
import ViewSection from "./ViewSection"



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

function createData( sectionName, schoolYear, status , id) {
  return { sectionName, schoolYear, status, id};
}

export default function Sections(){

	// State for pagination
	const [rows, setRows] = useState([])
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);

	//State for component changes
	const [addSection, setAddSection] = useState(false);
	const [viewSection, setViewSection] = useState(false);

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

  	const handleViewSection = async (id) => {
  	  const db = getDatabase();
  	  const sectionRef = ref(db, `sections/${id}`);
  	  try {
  	    const snapshot = await get(sectionRef);
  	    if (snapshot.exists()) {
  	      setViewSection({
  	        ...snapshot.val(),
  	        id: id
  	      });
  	    } else {
  	      console.log('No section data available for ID:', id);
  	    }
  	  } catch (error) {
  	    console.error('Error fetching section:', error);
  	  }
  	};

  	//useEffects
  	useEffect(() => {
  	  const db = getDatabase();
  	  const sectionsRef = ref(db, 'sections');

  	  get(sectionsRef).then((snapshot) => {
  	    if (snapshot.exists()) {
  	      const sectionsData = [];
  	      snapshot.forEach((childSnapshot) => {
  	        const key = childSnapshot.key;
  	        const section = childSnapshot.val();
  	        sectionsData.push({
  	          ...section,
  	          id: key,
  	        });
  	      });
  	      setRows(sectionsData)
  	      console.log(sectionsData)
  	    } else {
  	      console.log("No sections data available");
  	    }
  	  }).catch((error) => {
  	    console.error("Error fetching sections: ", error);
  	  });
  	}, [addSection, viewSection]);

  	if(addSection) return <SectionForm setAddSection={setAddSection}/>

  	if(viewSection) return <ViewSection viewSection={viewSection} setViewSection={setViewSection}/>
  

	return(

		<div className="flex flex-col gap-4 h-full">
			<h1 className="text-[24px] md:text-[32px] font-bold text-primary-green">Sections</h1>

			<div className="flex flex-row justify-end gap-4">
				<button onClick={() => {setAddSection(true)}} className="h-10 font-bold px-2 border-primary-green text-primary-green border-2 rounded-lg hover:bg-primary-green hover:text-safe-white">Add Section</button>
				{/*<button className="h-10 font-bold p-2 border-primary-green text-primary-green border-2 rounded-lg hover:bg-primary-green hover:text-safe-white"><HiAdjustments className="w-5 h-5" /></button>*/}
			</div>

			<TableContainer component={Paper}>
			  <Table sx={{ minWidth: 700 }} aria-label="customized table">
			    <TableHead>
			      <TableRow>
			        <StyledTableCell>Section</StyledTableCell>
			        <StyledTableCell>School Year</StyledTableCell>
			        <StyledTableCell>Status</StyledTableCell>
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
			    	      {row.sectionName}
			    	    </StyledTableCell>
			    	    <StyledTableCell>{row.schoolYear}</StyledTableCell>
			    	     <StyledTableCell>{row.status}</StyledTableCell>
			    	    <StyledTableCell>
			    	    	<button 
				              onClick={() => {
				              	handleViewSection(row.id)
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