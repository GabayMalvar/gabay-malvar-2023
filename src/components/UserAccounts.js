import * as React from 'react';
import { useState, useEffect } from 'react';
import CSVImport from "./CSVImport";

import { getDatabase, ref, get, set } from "firebase/database";

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
import StudentForm from "./StudentForm"
import ViewStudent from "./ViewStudent"



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

function createData(name, email, userType, status, imgUrl, uid) {
  return { name, email, userType, status, imgUrl, uid };
}

export default function UserAccounts(){
	// State for pagination
	const [rows, setRows] = useState([])
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);

	//State for component changes
	const [addStudent, setAddStudent] = useState(false);
	const [viewStudent, setViewStudent] = useState(false);

	const [addingBulkUser, setAddingBulkUser] = useState(false)

	//state for users data
	const [usersData, setUsersData] = useState([]);
	 const [tempUsersData, setTempUsersData] = useState([]);

	// Avoid a layout jump when reaching the last page with empty rows.
	const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

	//handlers
	const handleNewUsersAdded = (newUsers) => {
	  setRows(prevRows => [...newUsers, ...prevRows]);
	};

	const handleChangePage = (event, newPage) => {
    	setPage(newPage);
  	};

  	const handleChangeRowsPerPage = (event) => {
  	  setRowsPerPage(parseInt(event.target.value, 10));
  	  setPage(0);
  	};

  	const handleViewUserById = async (userId) => {
  		console.log(userId)
  	  const db = getDatabase();

  	  const findUserById = async (refPath, userId) => {
  	    const refToSearch = ref(db, `${refPath}/${userId}`);
  	    try {
  	      const snapshot = await get(refToSearch);
  	      if (snapshot.exists()) {
  	        // Include the userId in the returned data
  	        return { userId, ...snapshot.val() };
  	      }
  	      return null;
  	    } catch (error) {
  	      console.error(`Error fetching user from ${refPath}:`, error);
  	      return null;
  	    }
  	  };

  	  let userData = await findUserById('users', userId);
  	  if (!userData) {
  	    userData = await findUserById('temporary-users', userId);
  	  }

  	  if (userData) {
  	    setViewStudent(userData);
  	  } else {
  	    console.log('User not found in both tables');
  	  }
  	};
  	//useEffects
  	useEffect(() => {
  	  const db = getDatabase();
  	  const usersRef = ref(db, 'users');
  	  const tempUsersRef = ref(db, 'temporary-users');

  	  // Fetch users
  	  const fetchUsers = async () => {
  	    const usersSnapshot = await get(usersRef);
  	    let usersList = [];
  	    if (usersSnapshot.exists()) {
  	      usersSnapshot.forEach((childSnapshot) => {
  	        const userKey = childSnapshot.key;
  	        const userData = childSnapshot.val();
  	        usersList.push({ ...userData, id: userKey });
  	      });
  	    }

  	    const tempUsersSnapshot = await get(tempUsersRef);
  	    let tempUsersList = [];
  	    if (tempUsersSnapshot.exists()) {
  	      tempUsersSnapshot.forEach((childSnapshot) => {
  	        const userKey = childSnapshot.key;
  	        const userData = childSnapshot.val();
  	        tempUsersList.push({ ...userData, id: userKey });
  	      });
  	    }

  	    // Combine data and set rows
  	    const combinedUsersList = [...usersList, ...tempUsersList].map(user => {
  	      return createData(
  	        `${user.lastName}, ${user.firstName} ${user.middleName[0]? `${user.middleName[0]}.` : ""}`, 
  	        user.email, 
  	        user.userType, 
  	        user.status, 
  	        user.profileImg, 
  	        user.id
  	      );
  	    });

  	    setRows(combinedUsersList.reverse());
  	  };

  	  fetchUsers().catch(console.error);
  	}, [addStudent, addingBulkUser]);



  	if(addStudent) return <StudentForm setAddStudent={setAddStudent}/>

  	if(viewStudent) return <ViewStudent viewStudent={viewStudent} setViewStudent={setViewStudent}/>
  

	return(

		<div className="flex flex-col gap-4 h-full">
			<h1 className="text-[24px] md:text-[32px] font-bold text-primary-green">User Accounts</h1>

			<div className="flex flex-row justify-end gap-4">
				<button onClick={() => {setAddStudent(true)}} className="h-10 font-bold px-2 border-primary-green text-primary-green border-2 rounded-lg hover:bg-primary-green hover:text-safe-white">Add User</button>
				<button className="h-10 font-bold px-2 border-primary-green text-primary-green border-2 rounded-lg relative overflow-hidden cursor-pointer hover:bg-primary-green hover:text-safe-white"><CSVImport handleNewUsersAdded={handleNewUsersAdded}/>Import File</button>
				{/*<button className="h-10 font-bold p-2 border-primary-green text-primary-green border-2 rounded-lg hover:bg-primary-green hover:text-safe-white"><HiAdjustments className="w-5 h-5" /></button>*/}
			</div>

			<TableContainer component={Paper}>
			  <Table sx={{ minWidth: 700 }} aria-label="customized table">
			    <TableHead>
			      <TableRow>
			        <StyledTableCell>Name</StyledTableCell>
			        <StyledTableCell>Email</StyledTableCell>
			        <StyledTableCell>User Type</StyledTableCell>
			        <StyledTableCell>Status</StyledTableCell>
			        <StyledTableCell>Manage</StyledTableCell>
			      </TableRow>
			    </TableHead>
			    <TableBody>
			    	{(rowsPerPage > 0
			    	  ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
			    	  : rows
			    	).map((row, index) => (
			    	  <StyledTableRow key={row.name + index}>
			    	    <StyledTableCell component="th" scope="row">
			    	      {row.name}
			    	    </StyledTableCell>
			    	    <StyledTableCell>{row.email}</StyledTableCell>
			    	    <StyledTableCell>{row.userType}</StyledTableCell>
			    	     <StyledTableCell>{row.status}</StyledTableCell>
			    	    <StyledTableCell>
			    	    	<button 
				              onClick={() => {
				              handleViewUserById(row.uid)}
				              }
				              className="p-2 font-bold text-safe-white bg-primary-green rounded-lg">
				              View
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
