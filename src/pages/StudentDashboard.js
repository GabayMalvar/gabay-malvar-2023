import { useState, useEffect } from "react";

import { getDatabase, ref, get } from 'firebase/database';

//context
import { useAuthContext } from "../contexts/AuthContext"

//components
import Profile from "../components/Profile";
import Assessment from "../components/Assessment";
import Recommendation from "../components/Recommendation";

// import ChangePasswordModal from "../components/ChangePasswordModal"


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
import { TbReportAnalytics } from "react-icons/tb";


export default function StudentDashboard({ viewTestResults, setViewTestResults }) {



	const { user, userType, logout } = useAuthContext();

	const profile = localStorage.getItem('isProfile') === "true"? true : false
	const assesment = localStorage.getItem('isAssessment') === "true"? true : false  
	const recommentdation = localStorage.getItem('isRecommendation') === "true"? true : false 

	//states
	const [isProfile, setIsUserAccount] = useState(profile || (!assesment && !recommentdation));
	const [isAssessment, setIsAssessment] = useState(assesment);
	const [isRecommendation, setIsRecommendation] = useState(recommentdation);

	useEffect(() => {
	  saveStateToLocalStorage();
	}, [user, isProfile, isAssessment, isRecommendation]);

	const saveStateToLocalStorage = () => {
	  localStorage.setItem('isProfile', isProfile);
	  localStorage.setItem('isAssessment', isAssessment);
	  localStorage.setItem('isRecommendation', isRecommendation);

	};

	const handleLogout = () => {
	  clearStateFromLocalStorage();
	  logout();
	};

	const clearStateFromLocalStorage = () => {
	  localStorage.removeItem('isProfile');
	  localStorage.removeItem('isAssessment');
	  localStorage.removeItem('isRecommendation');
	};

	const handleNavigation = (openComponent) => {
	  // Reset all states
	  setIsUserAccount(false);
	  setIsAssessment(false);
	  setIsRecommendation(false);


	  // Activate the selected component
	  switch (openComponent) {
	    case 'profile':
	      setIsUserAccount(true);
	      break;
	    case 'assessment':
	      setIsAssessment(true);
	      break;
	    case 'recommendation':
	      setIsRecommendation(true);
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
			</div>

			{/* Page Content */}
			<div className="flex flex-row grow h-full">
				{/* OffCanvas */}
				<div className="hidden md:flex flex-col items-center gap-4 sm:gap-6 min-w-[80px] mt-8 p-4 rounded-tr-lg rounded-br-lg bg-secondary-green h-max">
					<button onClick={() => handleNavigation('profile')}>
					  <FaCircleUser className={`${isProfile ? "text-black" : "text-safe-white"} w-10 h-10`}/>
					</button>
					<button onClick={() => handleNavigation('assessment')}>
					  <IoAppsSharp className={`${isAssessment ? "text-black" : "text-safe-white"} w-10 h-10`}/>
					</button>
					<button onClick={() => handleNavigation('recommendation')}>
					  <BsClipboard2Data className={`${isRecommendation ? "text-black" : "text-safe-white"} w-10 h-10`}/>
					</button>
					<button>
					  <IoLogOutOutline onClick={handleLogout} className={`w-10 h-10 mt-10 text-safe-white`}/>
					</button>
				</div>

				<div className="w-full p-4 mb-20 md:mb-0 md:mt-4">
					
					{
						isProfile?
						<Profile />
						: isAssessment ?
						<Assessment />
						: isRecommendation?
						<Recommendation/>
						:
						null
					}

				</div>

				{/* Navbar on Mobile */}
				<div className="md:hidden fixed bottom-0 flex flex-row justify-between items-center w-full p-4 bg-secondary-green">
					<button onClick={() => handleNavigation('profile')}>
					  <FaCircleUser className={`${isProfile ? "text-black" : "text-safe-white"} w-8 h-8`}/>
					</button>
					<button onClick={() => handleNavigation('assessment')}>
					  <IoAppsSharp className={`${isAssessment ? "text-black" : "text-safe-white"} w-8 h-8`}/>
					</button>
					<button onClick={() => handleNavigation('recommendation')}>
					  <BsClipboard2Data className={`${isRecommendation ? "text-black" : "text-safe-white"} w-8 h-8`}/>
					</button>
					<button>
					  <IoLogOutOutline onClick={handleLogout} className={`w-8 h-8 text-safe-white`}/>
					</button>
				</div>
			</div>
			
		</div>

	);
}