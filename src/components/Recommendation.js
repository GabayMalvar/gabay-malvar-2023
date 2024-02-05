import React, { useEffect, useState } from 'react';
import { getDatabase, ref, query, orderByChild, equalTo, get } from "firebase/database";
import { getStorage, ref as storageRef, getDownloadURL } from "firebase/storage";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";
import { useAuthContext } from "../contexts/AuthContext";
import { Chart } from "react-google-charts";
import { toast } from 'react-toastify';
import emailjs from "@emailjs/browser";
import $ from "jquery";


const educationTracks = [
  {
    strand: "STEM",
    title: "Science, Technology, Engineering and Mathematics (STEM) Strand",
    title2: "Science, Technology, Engineering and Mathematics",
    color:  "#ffbd59",
    schools: [
		"Environmental Science (BSES)",
		"Geology (BS Geology)",
		"Molecular Biology (BS Molecular Biology)",
		"Physics (BS Physics)",
		'Applied Physics (BS Applied Physics)',
		'Chemistry (BS Chemistry)',
		'Food Technology (BS Food Technology)',
		'Nutrition and Dietetics (BS Nutrition and Dietetics)',
		'Medical Technology (BS Med Tech)',
		'Midwifery (BS Midwifery)',
		'Nursing (BSN)',
		'Occupational Therapy (BSOT)',
		'Pharmacy (BS Pharmacy)',
		' Radiologic Technology (BS Rad Tech)',
		'Respiratory Therapy (BSRT)',
		'Speech-Language Pathology',
		'Computer Science (BSCS)',
		'Information Technology (BSIT)',
		'Information Systems (BSIS)',
		'Aeronautical Engineering (BS AeroE)',
		'Ceramic Engineering (BSCerE)',
		'Chemical Engineering (BSChE)',
		'Civil engineering (BSCE)',
		'Computer Engineering (BSCpE)',
		'Electrical Engineering (BSEE)',
		'Electronics and Communications Engineering (BSECE)',
		'Geodetic Engineering (BSGE)',
		'Geological Engineering (BSGeoE)',
		'Industrial Engineering (BSIE)',
		'Marine Engineering (BSMarE)',
		'Materials Engineering (BSMatE)',
		'Mechanical Engineering (BSME)',
		'Metallurgical Engineering (BSMetE)',
		'Mining Engineering (BSEM)',
		'Petroleum Engineering (BSPetE)',
		'Sanitary Engineering (BSSE)',
		'Marine Transportation (BSMT)',
		'Mathematics (BS Mathematics)',
		"Applied Mathematics (BS Applied Mathematics)",
		"Statistics (BS Stat)",
    ],
  },
  {
    strand: "ABM",
    title: "Accountancy, Business and Management (ABM) Strand",
    title2: "Accountancy, Business and Management",
    color:  "#f1da00",
    schools: [
		"Bachelor of Science in Accountancy (BSA)",
		'Bachelor of Science in Accountancy (BSA)',
		'Bachelor of Science in Accounting Technology (BSAcT)',
		'Bachelor of Science in Business Economics (BSBA)',
		'Bachelor of Science in Financial Management (BSBA major in FM)',
		'Bachelor of Science in Human Resource Development (BSBA major in HRDM)',
		'Bachelor of Science in Marketing Management (BSBA major in MM)',
		'Bachelor of Science in Operations Management (BSBA major in OM)',
		'Bachelor of Science in Entrepreneurship (BS Entrep)',
		'Bachelor of Science in Agribusiness (BS Agribusiness)',
		'Bachelor of Science in Hotel and Restaurant Management (BS HRM)',
		'Bachelor of Science in Office Administration (BSOA)',
		'Bachelor of Science in Real Estate Management (BS REM)',
		'Bachelor of Science in Tourism Management (BSTM)',
		'Bachelor of Science in Community Development (BS Community Development)',
		'Bachelor of Science in Foreign Service (BS Foreign Service)',
		'Bachelor of Science in International Studies (BSIS)',
		'Bachelor of Science in  Public Safety (BSPS)',
		'Bachelor of Science in Social Work (BS Social Work)',
    ],
  },
  {
    strand: "HUMSS",
    title: "Humanities and Social Sciences Strand (HUMSS)",
    title2: "Humanities and Social Sciences Strand",
    color:  "#5271ff",
    schools: [
		"Bachelor of Science in Communication",
		'Bachelor of Science in Philosophy (AB Philosophy)',
		'Bachelor of Science in Psycology (AB Psycology)',
		'Bachelor of Science in Sociology (AB Sociology)',
		'Bachelor of Science in Political Science ( AB Political Science)',
		'Bachelor of Science in English (AB English)',
		'Bachelor of Science in Linguistics (AB Linguistics)',
		'Bachelor of Science in Literature (AB Literature)',
		'Bachelor of Science in Filipino (AB Filipino)',
		'Bachelor of Science in Islamic Studies (AB Islamic Studies)',
		'Bachelor of Fine Arts in Visual Arts (BFA)',
		'Bachelor of Social Work (BSW)',
		'Bachelor of Music (BMus)',
		'Bachelor of Library and Information Science (B.L.I.S.)',
		'Bachelor of Education (B.Ed.)',
    ],
  },
  {
    strand: "SPORTS",
    title: "Sports Track",
    title2: "Sports Track",
    color:  "#e14a4a",
    schools: [
		"Bachelor of Science in Sports Science",
		'Bachelor of Science in Athletic Training',
		'Bachelor of Science in Physical Therapy',
		'Bachelor of Science in Kinesiology',
		'Bachelor of Science in Recreation and Leisure Studies',
		'Bachelor of Science in Sports Management',
		'Bachelor of Science in Health and Physical Education',
		'Bachelor of Science in Bachelor of Physical Education (B.P.E.)',
		'Bachelor of Science in Nursing (B.S.N.)',
		'Bachelor of Arts (B.A.) in Sports Journalism',
		'Bachelor of Education (B.Ed.):',
    ],
  },
  {
    strand: "ARTS AND DESIGN",
    title: "Arts and Design Track",
    title2: "Arts and Design Track",
    color:  "#029880",
    schools: [
      "Bachelor of Arts in Music",
      'Bachelor of Arts in Communication',
      'Bachelor of Arts in Fashion Design',
      'Bachelor of Arts in Visual Communication',
      'Bachelor of Arts in Dance',
      'Bachelor of Arts in  Art History',
      'Bachelor of Fine Arts (B.F.A.):',
      'Bachelor of Performing Arts (B.P.A.):',
      'Bachelor of Interior Design (B.I.D.):',
      'Bachelor of Multimedia Arts (B.M.M.A.):',
      'Bachelor of Landscape Architecture (B.L.A.):',
      'Bachelor of Architecture (B.Arch.)',
      'Bachelor of Film and Television Production (B.F.T.P.)',
      'Bachelor of Theater Arts (B.T.A.)',
      'Bachelor of Industrial Design (B.I.D.)',
      'Bachelor of Music Education (B.M.E.)',
      'Bachelor of Industrial Technology (B.I.T.)',
    ],
  },
  {
    strand: "TVL",
    title: "Technical Vocational Livelihood (TVL) Track",
    title2: "Technical Vocational Livelihood",
    color:  "#ff6025",
    schools: [
      "Bachelor of Science in Information Technology",
      'Bachelor of Science in Computer Science',
      'Bachelor of Science in Electronics Engineering',
      'Bachelor of Science in Electrical Engineering',
      'Bachelor of Science in Mechanical Engineering',
      'Bachelor of Science in Civil Engineering',
      'Bachelor of Science in Welding Engineering',
      'Bachelor of Science in Automotive Technology',
      'Bachelor of Science in Electrical Technology',
      'Bachelor of Science in Plumbing Technology',
      'Bachelor of Science in Air Conditioning and Refrigeration Technology',
      'Bachelor of Science in Carpentry',
      'Bachelor of Science in Electronics Technology',
      'Bachelor of Science in Food Technology',
      'Bachelor of Science in Fashion Design and Merchandising',
      'Bachelor of Science in Industrial Design',
      'Bachelor of Science in Agri-Fishery Arts',
      'Bachelor of Science in Agri-production',
      'Bachelor of Science in Animal Production',
      'Bachelor of Science in Agricultural Technology',
      'Bachelor of Science in Agricultural Machinery and Equipment',
      'Bachelor of Science in Agri-Business Management',
      'Bachelor of Science in Agriculture',
    ],
  },
  {
    strand: "ICT",
    title: "Information and Communications Technology (ICT)",
    title2: "Information and Communications Technology",
    color:  "#a29685",
    schools: [
      "Bachelor of Science in Information Technology",
      'Bachelor of Science in Computer Science',
      'Bachelor of Science in Network Administration',
      'Bachelor of Science in Computer Engineering',
      'Bachelor of Science in Graphic Design',
      'Bachelor of Science in Computer Systems Servicing',
      'Bachelor of Science in Electronics Engineering',
      'Bachelor of Science in Information Systems ',
      'Bachelor of Science in Cybersecurity',
      'Bachelor of Science in Multimedia Arts',
      'Bachelor of Science in Digital Marketing',
      'Bachelor of Science in Mobile App Development',
      'Bachelor of Science in Game Artificial Intelligence',
      'Bachelor of Science in Data Science',
      'Bachelor of Science in Cloud Computing',
      'Bachelor of Science in Information Security',
      'Bachelor of Science in Network Engineering',
      'Bachelor of Science in Software Engineering',
    ],
  },
  {
    strand: "GAS",
    title: "General Academic Strand (GAS)",
    title2: "General Academic Strand",
    color:  "#cb6ce6",
    schools: [
    'Bachelor of Science in Business Administration (BSBA)',
    'Bachelor of Science in Accountancy (BSA)',
    'Bachelor of Science in Economics (BSEcon)',
    'Bachelor of Science in Marketing Management (BSMM)',
    'Bachelor of Science in Entrepreneurship (BSE)',
    'Bachelor of Science in Hospitality Management (BSHM)',
    'Bachelor of Science in Tourism Management (BS Tourism)',
    'Bachelor of Science in Office Administration (BSOA)',
    'Bachelor of Science in Business Information Systems (BS BIS)',
    'Bachelor of Science in Human Resource Management (BS HRM)',
    'Bachelor of Science in Finance (BS Finance)',
    'Bachelor of Science in Real Estate Management (BS REM)',
    'Bachelor of Arts in Communication Arts (AB Comm)',
    'Bachelor of Arts in English Language Studies (ABELS)',
    'Bachelor of Arts in History (AB History)',
    'Bachelor of Arts in Philosophy (AB Philo)',
    'Bachelor of Arts in Psychology (AB Psych)',
    'Bachelor of Arts in Sociology (AB Socio)',
    'Bachelor of Arts in Social Work (AB SW)',
    'Bachelor of Arts in Political Science (AB PolSci)',
    `Bachelor of Arts in International Studies (AB Int'l Studies)`,
    'Bachelor of Arts in Tourism (AB Tourism)',
    'Bachelor of Fine Arts (BFA)',
    'Bachelor of Arts in Multimedia Arts (AB MMA)',
    'Bachelor of Arts in Digital Cinema (AB Digital Cinema)',
    'Bachelor of Arts in Animation (AB Animation)',
    'Bachelor of Arts in Interior Design (AB IntDes)',
    'Bachelor of Science in Biology (BS Bio)',
    'Bachelor of Science in Chemistry (BS Chem)',
    'Bachelor of Science in Physics (BS Phys)',
    'Bachelor of Science in Mathematics (BS Math)',
    'Bachelor of Science in Computer Science (BSCS)',
    'Bachelor of Science in Information Technology (BSIT)',
    'Bachelor of Science in Information Systems (BSIS)',
    'Bachelor of Science in Electrical Engineering (BSEE)',
    'Bachelor of Science in Electronics Engineering (BSElecE)',
    'Bachelor of Science in Mechanical Engineering (BSME)',
    'Bachelor of Science in Civil Engineering (BSCE)',
    'Bachelor of Science in Chemical Engineering (BS ChemE)',
    'Bachelor of Science in Geodetic Engineering (BS GeodeticE)',
    'Bachelor of Science in Architecture (BSA)',
    'Bachelor of Elementary Education (BEEd)',
    'Bachelor of Secondary Education (BSEd)',
    'Bachelor of Arts in Education (AB Ed)',
    'Bachelor of Science in Education (BS Ed)',
    'Bachelor of Science in Nursing (BSN)',
    'Bachelor of Science in Medical Technology (BS MT)',
    'Bachelor of Science in Pharmacy (BS Pharm)',
    'Bachelor of Science in Public Health (BS PH)',
    'Bachelor of Science in Physical Education (BS PE)',
    'Bachelor of Science in Occupational Therapy (BS OT)',
    'Bachelor of Science in Agriculture (BSA)',
    'Bachelor of Science in Forestry (BSF)',
    'Bachelor of Science in Criminology (BSCrim)',
    'Bachelor of Laws (LLB)',
    'Bachelor of Arts in Journalism (AB Journalism)',
    'Bachelor of Science in Hotel and Restaurant Management (BS HRM)',
    ],
  },
];

const hollandCodes = [
  {
    code: "Artistic",
    title: "Artistic",
    color: "#7edf9f",
    description: "Your creativity thrives in artistic expression. Pursue careers that involve creativity and self-expression, such as writing, design, or performing arts. You'll find fulfillment in roles like artist, writer, or musician.",
    imgUrl: "https://firebasestorage.googleapis.com/v0/b/gabay-malvar.appspot.com/o/artistic.png?alt=media&token=d1e095a3-27c8-4ae5-ac17-92dd1400c044",
  },
  {
    code: "Conventional",
    title: "Conventional",
    color: "#cd816f",
    description: "You appreciate structure and order. Explore careers that involve organizing and managing information, such as accounting, administration, or data analysis. Jobs like accountant, administrative assistant, or data analyst may align with your preferences.",
    imgUrl: "https://firebasestorage.googleapis.com/v0/b/gabay-malvar.appspot.com/o/coventional.png?alt=media&token=5d170fb6-fb85-40fb-9f91-d77e078921aa",
  },
  {
    code: "Enterprise",
    title: "Enterprising",
    color: "#f9f3dd",
    description: "You're ambitious and enjoy taking charge. Look into careers that involve leadership, sales, or entrepreneurship. Your assertiveness is well-suited for roles like manager, salesperson, or business owner.",
    imgUrl: "https://firebasestorage.googleapis.com/v0/b/gabay-malvar.appspot.com/o/enterprising.png?alt=media&token=752ad879-935c-4f91-84dd-182c3fc06fab",
  },
  {
    code: "Investigative",
    title: "Investigative",
    color: "#6fe5e7",
    description: "You appreciate structure and order. Explore careers that involve organizing and managing information, such as accounting, administration, or data analysis. Jobs like accountant, administrative assistant, or data analyst may align with your preferences.",
    imgUrl: "https://firebasestorage.googleapis.com/v0/b/gabay-malvar.appspot.com/o/social.png?alt=media&token=9ab941c4-7833-4615-a48d-bc573dc4b4ef",
  },
  {
    code: "Realistic",
    title: "Realistic",
    color: "#fd6d5a",
    description: "You enjoy hands-on activities and practical problem-solving. Consider careers that involve working with tools, machines, or physical tasks. Your skills are best utilized in jobs like construction, farming, or engineering.",
    imgUrl: "https://firebasestorage.googleapis.com/v0/b/gabay-malvar.appspot.com/o/realistic.png?alt=media&token=e0f49de3-1dd7-4feb-902f-9fbcc4aa8c18",
  },
  {
    code: "Social",
    title: "Social",
    color: "#bbeaf2",
    description: "You thrive in social interactions and have a passion for helping others. Consider careers in fields like counseling, education, or healthcare, where your people skills can make a positive impact. Jobs such as teacher, counselor, or nurse may align with your personality.",
    imgUrl: "https://firebasestorage.googleapis.com/v0/b/gabay-malvar.appspot.com/o/investigative.png?alt=media&token=54ea9970-149d-4208-8478-a4ce9ff04b41",
  },
]


export const options = {
  title: "Holland Code",
  is3D: true,
};

const AccordionItem = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 h-max">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-left text-black"
      >
        <span className="ml-4 text-primary-green font-bold my-2">{title}</span>
        {isOpen ? <IoChevronUp className="w-5 h-5 mx-2"/> : <IoChevronDown className="w-5 h-5 mx-2"/> }
      </button>
      <div
        className={`${
          isOpen ? 'max-h' : 'max-h-0'
        } overflow-hidden duration-300 ease-in-out bg-white mb-2`}
      >
        {children}
      </div>
    </div>
  );
};

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
      acc[code] = (acc[code] || 0) + score;
    } else {
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
  // If all scores are the same, return 'GAS' only
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


function getStrandDetails(strandKey) {
  const strandDetails = educationTracks.find(strand => strand.strand === strandKey);
  return strandDetails || null;
}

function getTopThreeCategoryScores(categoryPoints) {
  const scoresArray = Object.entries(categoryPoints);
  scoresArray.sort((a, b) => b[1] - a[1]);

  const topThreeScores = scoresArray.slice(0, 3);
  const topThreeWithDetails = topThreeScores.map(([code, score]) => {
    const details = hollandCodes.find(hollandCode => hollandCode.code === code);
    return { code, score, ...details };
  });

  return topThreeWithDetails;
}


export default function Recommendation() {
  const { user } = useAuthContext();
  const [categoryPoints, setCategoryPoints] = useState({});
  const [noTestTaken, setNoTestTaken] = useState(false)

  const [studentInfo, setStudentInfo] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    age: "",
    birthdate: "",
    section: "",
    schoolYear: "",
    email: "",
    contactNumber: "",
    address: "",
    gender: "Male",
    parentGuardianName: "",
    parentGuardianContact: "",
    status: "",
    profileImg: "",
    userType: ""
  });

  const [viewStudent, setViewStudent] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    age: "",
    birthdate: "",
    section: "",
    schoolYear: "",
    email: "",
    contactNumber: "",
    address: "",
    gender: "",
    parentGuardianName: "",
    parentGuardianContact: "",
    status: "",
    profileImg: "",
    userType: ""
  })

  const { firstName, lastName, middleName, birthdate, contactNumber, email, 
  gender, parentGuardianContact, parentGuardianName, profileImg, schoolYear, 
  section, status, userType, age, address } = viewStudent

  function isEmpty(obj) {
      return Object.keys(obj).length === 0;
  }

  const handleViewUserByEmail = async (email) => {
    const db = getDatabase();
    const usersRef = ref(db, 'users');
    
    try {
      const snapshot = await get(usersRef);
      if (snapshot.exists()) {
        const users = snapshot.val();
        // Find user by email
        const userKey = Object.keys(users).find(key => users[key].email === email);
        if (userKey) {
          const userData = users[userKey];
          setViewStudent(userData);
        } else {
          console.log('User not found');
        }
      } else {
        console.log('No users data available');
      }
    } catch (error) {
      console.error('Error fetching user by email:', error);
    }
  };

  useEffect(() => {
    const fetchCompletedTests = async () => {
      const db = getDatabase();
      const testTakenRef = query(ref(db, `users/${user.uid}/test-taken`), orderByChild('status'), equalTo('Completed'));
      
      try {
        const snapshot = await get(testTakenRef);
        if (snapshot.exists()) {
          const tests = snapshot.val();
          const totalCategoryPoints = {};
          Object.values(tests).forEach(test => {
            Object.entries(test.categoryPoints).forEach(([category, points]) => {
              if (!totalCategoryPoints[category]) {
                totalCategoryPoints[category] = 0;
              }
              totalCategoryPoints[category] += points;
            });
          });
          setCategoryPoints(totalCategoryPoints);
        } else {
          setNoTestTaken(true)
        }
      } catch (error) {
        console.error('Error fetching completed tests:', error);
      }
    };

    fetchCompletedTests();
  }, [user.uid]);

  useEffect(() => {
    handleViewUserByEmail(user.email)
  }, [])

  const suggestedTrack = getSuggestedTrack(categoryPoints);

  const data = [
    ["Passion", "Your Passion"],
    ...Object.entries(categoryPoints).map(([key, value]) => [key, value])
  ];


  const storage = getStorage();
  const imageFileNames = [
    'gabaylogo1.png',
    'logo1.png',
  ];

  function sendEmail() {
      const hollandDetails = getTopThreeCategoryScores(categoryPoints);
      const suggestedTracks = getSuggestedTrack(categoryPoints);
      const strandDetail = (strand) => getStrandDetails(strand);

      const imageUrlPromises = imageFileNames.map(fileName => {
        const storageRefe = storageRef(storage, fileName);
        return getDownloadURL(storageRefe);
      });

      Promise.all(imageUrlPromises)
        .then((imageUrls) => {

          let htmlContent = `
            <head>
              <style>
                /* Desktop styles */
                .image-cell {
                  text-align: center;
                }
                .baseAssessment {
                  margin: 40px
                }
                .center-table {
                  width: 100%;
                  table-layout: fixed;
                }
                .center-cell {
                  text-align: center;
                  vertical-align: middle;
                  padding: 10px;
                }
                .center-cell div {
                  margin: auto;
                }
                .bestSuited {
                  font-size: 30px;
                }
                .logo-cell {
                  width: 100px;
                  text-align: right;
                }
              
                .title-cell {
                  text-align: left;
                  vertical-align: middle;
                  padding-left: 50px; 
                }
                .dosis {
                  font-family: 'Dosis', sans-serif;
                }

                /* Mobile styles */
                @media only screen and (max-width: 480px) {
                  .image-cell {
                    display: block !important;
                    width: 100% !important;
                    max-width: 100% !important;
                  }

                  .hidden {
                    display: none !important;
                  }

                  .baseAssessment {
                    margin: 27px
                  }

                  .responsive-table {
                    width: 100% !important;
                    border-collapse: collapse;
                  }
                  .responsive-table, .responsive-table tr, .responsive-table td {
                    display: block !important;
                  }
                  .responsive-table td {
                    width: 100% !important;
                    text-align: left !important;
                  }
                  .center-cell {
                    display: block;
                    width: 100%;
                  }
                  .center-cell div {
                    display: block;
                    width: 100%;
                    text-align: center;
                  }
                  .bestSuited {
                    font-size: 24px;
                  }
                }
              </style>
            </head>
            <body>
              <table style="background-color: #d5f5e6; padding: 4px;" role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tbody>
                <tr>
                  <td style="text-align: left;"><img style="width: 150px; height: auto;" src=${imageUrls[0]} alt="Artistic Content"></td>
                    <td style="text-align: center;">
                      <span class="hidden dosis" style="font-size: 20px; margin: auto; color: #029880; font-weight: bold;">STUDENT ASSESSMENT RESULT</span>
                    </td>
                  <td style="text-align: right;"><img style="width: 80px; height: auto;" src=${imageUrls[1]} alt="Second Image Content"></td>
                </tbody>
              </table>

              <table class="responsive-table" style="border: 4px solid #F4F4D0; padding: 16px; margin-top: 4px;" role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tbody>
                <tr>
                  <td class="image-cell" style="text-align: left;">
                    <p>First Name: <span style="font-weight: bold;">${firstName}</span></p>
                    <p>Middle Name: <span style="font-weight: bold;">${middleName}</span></p>
                    <p>Last Name: <span style="font-weight: bold;">${lastName}</span></p>
                    <p>Gender: <span style="font-weight: bold;">${gender}</span></p>
                  </td>

                  <td class="image-cell" style="text-align: right; vertical-align: top;">
                    <p>School Year: <span style="font-weight: bold;">${schoolYear}</span></p>
                    <p>Email: <span style="font-weight: bold;">${user.email}</span></p>
                  </td>
                </tbody>
              </table>

              <div style="border: 4px solid #90CBB0; margin-top: 4px;">
                <table class="responsive-table" style="padding: 16px;" role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tbody>
                    <tr>

                      <td class="image-cell" style="text-align: left; width: 50%;">
                        <div>
                          <p class="baseAssessment dosis" style="font-size: 24px; text-align: center;"><span style="background-color: rgba(241, 89, 240, 0.57); padding: 2px;   line-height: 0.75;">Base on your assessment,<br> you are...</span></p>
                        </div>
                      </td>

                      <td class="image-cell" style="text-align: left; width: 50%;">

                        <table class="responsive-table" role="presentation" width="100%" cellspacing="0" cellpadding="0">
                          <tbody>
                            <tr>
                              <td class="image-cell" style="text-align: left; width: 50%;">
                                <img style="width: 200px; height: auto;" src=${hollandDetails[0].imgUrl} alt="Artistic Content">
                              </td>

                              <td class="image-cell" style="text-align: left; vertical-align:top ; width: 50%;">
                                <p class="dosis" style="background-color: ${hollandDetails[0].color}; border-radius: 10px; padding: 8px; width: max-content; font-weight: bold">You're ${hollandDetails[0].title}</p>
                                <p class="dosis">${hollandDetails[0].description}</p>
                              </td>
                          </tbody>
                        </table>

                      </td>
                  </tbody>
                </table>

              <table class="responsive-table" style="padding: 16px;" role="presentation" width="100%" cellspacing="0" cellpadding="0">
              <tbody>
              <tr>
              <td class="image-cell" style="text-align: left; width: 50%;">
              <table class="responsive-table" role="presentation" width="100%" cellspacing="0" cellpadding="0">
              <tbody>
              <tr>
              <td class="image-cell" style="text-align: left; width: 50%;">
              <img style="width: 200px; height: auto;" src=${hollandDetails[1].imgUrl} alt="Artistic Content">
              </td>
              <td class="image-cell" style="text-align: left; vertical-align:top ; width: 50%;">
              <p class="dosis" style="background-color: ${hollandDetails[1].color}; border-radius: 10px; padding: 8px; width: max-content; font-weight: bold">You're ${hollandDetails[1].title}</p>
              <p class="dosis">${hollandDetails[1].description}</p>
              </td>
              </tbody>
              </table>

              </td>
              <td class="image-cell" style="text-align: left; width: 50%;">

              <table class="responsive-table" role="presentation" width="100%" cellspacing="0" cellpadding="0">
              <tbody>
              <tr>
              <td class="image-cell" style="text-align: left; width: 50%;">
              <img style="width: 200px; height: auto;" src=${hollandDetails[2].imgUrl} alt="Artistic Content">
              </td>
              <td class="image-cell" style="text-align: left; vertical-align:top ; width: 50%;">
              <p class="dosis" style="background-color: ${hollandDetails[2].color}; border-radius: 10px; padding: 8px; width: max-content; font-weight: bold">You're ${hollandDetails[2].title}</p>
              <p class="dosis">${hollandDetails[2].description}</p>
              </td>
              </tbody>
              </table>

              </td>
              </tbody>
              </table>
              </div>

              <div style="border: 4px solid #EDADFF; margin-top: 4px; padding: 16px; text-align: center;">
                <table role="presentation" style="border-collapse: collapse; margin: auto;" cellspacing="0" cellpadding="0">
                  <tr>
                    <td class="logo-cell">
                      <img style="width: 100px; height: auto; vertical-align: middle;" src="https://firebasestorage.googleapis.com/v0/b/gabay-malvar.appspot.com/o/best_logo.png?alt=media&token=1b1c0ff8-91e2-42c6-9f97-d232f6b10b5c" alt="Best Logo">
                    </td>
                    <td class="title-cell">
                      <p class="bestSuited dosis">Strand best suited for you</p>
                    </td>
                  </tr>
                </table>


                <table class="center-table" style="margin: auto;">
                  <tr>
                    ${
                      suggestedTracks.length > 1?
                      `
                      <td class="center-cell">
                        <div>
                          <p class="dosis" style="background-color: ${strandDetail(suggestedTracks[0]).color}; border-radius: 10px; padding: 8px; font-weight: bold; color: white; font-size: 20px; width: max-content; margin: auto;">${strandDetail(suggestedTracks[0]).strand}</p>
                          <p class="dosis" style="color: ${strandDetail(suggestedTracks[0]).color};">${strandDetail(suggestedTracks[0]).title2}</p>
                        </div>
                      </td>

                      <td class="center-cell">
                        <div>
                          <p class="dosis" style="background-color: ${strandDetail(suggestedTracks[1]).color}; border-radius: 10px; padding: 8px; font-weight: bold; color: white; font-size: 20px; width: max-content; margin: auto;">${strandDetail(suggestedTracks[1]).strand}</p>
                          <p class="dosis" style="color: ${strandDetail(suggestedTracks[1]).color};">${strandDetail(suggestedTracks[1]).title2}</p>
                        </div>
                      </td>

                      <td class="center-cell">
                        <div>
                          <p class="dosis" style="background-color: ${strandDetail(suggestedTracks[2]).color}; border-radius: 10px; padding: 8px; font-weight: bold; color: white; font-size: 20px; width: max-content; margin: auto;">${strandDetail(suggestedTracks[2]).strand}</p>
                          <p class="dosis" style="color: ${strandDetail(suggestedTracks[2]).color};">${strandDetail(suggestedTracks[2]).title2}</p>
                        </div>
                      </td>
                      `
                      :
                      `
                      <td class="center-cell">
                        <div>
                          <p class="dosis" style="background-color: ${strandDetail(suggestedTracks[0]).color}; border-radius: 10px; padding: 8px; font-weight: bold; color: white; font-size: 20px; width: max-content; margin: auto;">${strandDetail(suggestedTracks[0]).strand}</p>
                          <p class="dosis" style="color: ${strandDetail(suggestedTracks[0]).color};">${strandDetail(suggestedTracks[0]).title2}</p>
                        </div>
                      </td>
                      `
                    }
                    
                  </tr>
                </table>

              </div>
            </body>
          `;

        var emailjsData = {
          service_id: "service_84w6qa9",
          template_id: "template_henjvjj",
          user_id: "T2STfXJpj4IwgfT4m",
          template_params: {
            user_email: `${user.email}`,
            html: htmlContent
          }
        };

        return emailjs.send(emailjsData.service_id, emailjsData.template_id, emailjsData.template_params, emailjsData.user_id);
      })
      .then(function(response) {
        toast.success("Email has been sent to you!");
      })
      .catch(function(error) {
        console.error('FAILED...', error);
      });
  }

  return (
    <div>
      <h1 className="text-[24px] md:text-[32px] font-bold text-primary-green">Recommendation</h1>
        <button onClick={sendEmail} className="h-10 font-bold px-2 border-primary-green text-primary-green border-2 rounded-lg hover:bg-primary-green hover:text-safe-white" disable={suggestedTrack.length > 0 ? false : true}>Recieve Result</button>
      	<Chart
            chartType="PieChart"
            data={data}
            options={options}
            width={"100%"}
            height={"320px"}
          />
        { 
          suggestedTrack.length > 0 && !isEmpty(categoryPoints)?
        	suggestedTrack.map((track, index) => {
        		const strandDetails = getStrandDetails(track, educationTracks)
            if(track){
              return(

                <AccordionItem title={strandDetails.title}>
                  <div className="flex flex-col gap-2 ml-6">
                    {
                      strandDetails.schools.map((course, index) => {
                        return(
                        <button 
                          key={index}
                          className="font-bold text-start"
                        >{course}</button>)
                      })
                    }
                  </div>
              </AccordionItem>
              )
            }
        		
        	})
          :
          null
        }
    </div>
  );
}