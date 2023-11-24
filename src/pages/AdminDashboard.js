import { useState, useEffect } from "react";

//context
import { useAuthContext } from "../contexts/AuthContext"

//components
import UserAccounts from "../components/UserAccounts";
import Sections from "../components/Sections";
import AcademicYear from "../components/AcademicYear";
import Survey from "../components/Survey";
import Reports from "../components/Reports";


// assets
import { IoLogOutOutline } from "react-icons/io5";
import { FaCircleUser } from "react-icons/fa6";
import { HiMenu } from "react-icons/hi";
import { FaUsers } from "react-icons/fa";
import { IoAppsSharp } from "react-icons/io5";
import { BsClipboard2Data } from "react-icons/bs";
import { TbBrandGoogleAnalytics } from "react-icons/tb";
import { FaRegCalendarAlt } from "react-icons/fa";
import SchoolLogo from "../assets/schoollogo.png"

export default function AdminDashboard() {

	const { user, userType, logout } = useAuthContext();

	const userAccounts = localStorage.getItem('isUsersAccount') === "true"? true : false
	const sections = localStorage.getItem('isSections') === "true"? true : false  
	const survey = localStorage.getItem('isSurvey') === "true"? true : false 
	const reports = localStorage.getItem('isReports') === "true"? true : false 
	const academic = localStorage.getItem('isAcademic') === "true"? true : false 

	//states
	const [isUsersAccount, setIsUserAccount] = useState(userAccounts || (!sections && !survey && !reports && !academic));
	const [isSections, setIsSections] = useState(sections);
	const [isSurvey, setIsSurvey] = useState(survey);
	const [isReports, setIsReports] = useState(reports);
	const [isAcademic, setIsAcademic] = useState(academic);

	useEffect(() => {
	  saveStateToLocalStorage();
	}, [isUsersAccount, isSections, isSurvey, isReports, isAcademic]);

	const saveStateToLocalStorage = () => {
	  localStorage.setItem('isUsersAccount', isUsersAccount);
	  localStorage.setItem('isSections', isSections);
	  localStorage.setItem('isSurvey', isSurvey);
	  localStorage.setItem('isReports', isReports);
	  localStorage.setItem('isAcademic', isAcademic);
	};

	const handleLogout = () => {
	  clearStateFromLocalStorage();
	  logout();
	};

	const clearStateFromLocalStorage = () => {
	  localStorage.removeItem('isUsersAccount');
	  localStorage.removeItem('isSections');
	  localStorage.removeItem('isSurvey');
	  localStorage.removeItem('isReports');
	  localStorage.removeItem('isAcademic');
	};


	// handlers
	const handleNavigation = (openComponent) => {
	  // Reset all states
	  setIsUserAccount(false);
	  setIsSections(false);
	  setIsSurvey(false);
	  setIsReports(false);
	  setIsAcademic(false);

	  // Activate the selected component
	  switch (openComponent) {
	    case 'users':
	      setIsUserAccount(true);
	      break;
	    case 'sections':
	      setIsSections(true);
	      break;
	    case 'survey':
	      setIsSurvey(true);
	      break;
	    case 'reports':
	      setIsReports(true);
	      break;
	    case 'academic':
	      setIsAcademic(true);
	      break;
	    default:
	      break;
	  }
	};

	return (

		<div className="min-h-screen flex flex-col">
			{/* Navbar */}
			<div className="h-[90px] border-b-2 border-[#D9D9D9] w-full flex flex-row items-center gap-8 px-4">
				<div className="flex flex-row gap-8 w-full items-center">
					<img src={SchoolLogo} alt="Logo" className="w-20 h-auto"/>
					<h2 className="text-primary-green border-y-2 hidden sm:flex text-[12px] md:text-[14px] h-max">GABAY:Student Career Assistance for Grade 10 Students of Malvar School of Arts and Trades</h2>
				</div>
				<button className="flex flex-row gap-4"><FaCircleUser className="h-10 w-10" /></button>
			</div>

			{/* Page Content */}
			<div className="flex flex-row grow h-full">
				{/* OffCanvas */}
				<div className="hidden md:flex flex-col items-center gap-4 sm:gap-6 min-w-[80px] mt-8 p-4 rounded-tr-lg rounded-br-lg bg-secondary-green h-max">
					<button onClick={() => handleNavigation('users')}>
					  <FaUsers className={`${isUsersAccount ? "text-black" : "text-safe-white"} w-10 h-10`}/>
					</button>
					<button onClick={() => handleNavigation('sections')}>
					  <IoAppsSharp className={`${isSections ? "text-black" : "text-safe-white"} w-10 h-10`}/>
					</button>
					<button onClick={() => handleNavigation('survey')}>
					  <BsClipboard2Data className={`${isSurvey ? "text-black" : "text-safe-white"} w-10 h-10`}/>
					</button>
					<button onClick={() => handleNavigation('reports')}>
					  <TbBrandGoogleAnalytics className={`${isReports ? "text-black" : "text-safe-white"} w-10 h-10`}/>
					</button>
					<button onClick={() => handleNavigation('academic')}>
					  <FaRegCalendarAlt className={`${isAcademic ? "text-black" : "text-safe-white"} w-10 h-10`}/>
					</button>
					<button>
					  <IoLogOutOutline onClick={handleLogout} className={`w-10 h-10 mt-10 text-safe-white`}/>
					</button>
				</div>

				<div className="w-full p-4 mb-20 md:mb-0 md:mt-4">
					
					{ 
						isUsersAccount?
						<UserAccounts />
						: isSections?
						<Sections />
						: isAcademic?
						<AcademicYear />
						: isSurvey?
						<Survey />
						: isReports ?
						<Reports />
						:
						null
					}

				</div>

				{/* Navbar on Mobile */}
				<div className="md:hidden fixed bottom-0 flex flex-row justify-between items-center w-full p-4 bg-secondary-green">
					<button onClick={() => handleNavigation('users')}>
					  <FaUsers className={`${isUsersAccount ? "text-black" : "text-safe-white"} w-8 h-8`}/>
					</button>
					<button onClick={() => handleNavigation('sections')}>
					  <IoAppsSharp className={`${isSections ? "text-black" : "text-safe-white"} w-8 h-8`}/>
					</button>
					<button onClick={() => handleNavigation('survey')}>
					  <BsClipboard2Data className={`${isSurvey ? "text-black" : "text-safe-white"} w-8 h-8`}/>
					</button>
					<button onClick={() => handleNavigation('reports')}>
					  <TbBrandGoogleAnalytics className={`${isReports ? "text-black" : "text-safe-white"} w-8 h-8`}/>
					</button>
					<button onClick={() => handleNavigation('academic')}>
					  <FaRegCalendarAlt className={`${isAcademic ? "text-black" : "text-safe-white"} w-8 h-8`}/>
					</button>
					<button>
					  <IoLogOutOutline onClick={handleLogout} className={`w-8 h-8 text-safe-white`}/>
					</button>
				</div>
			</div>
			
		</div>

	);
}