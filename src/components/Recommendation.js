import React, { useEffect, useState } from 'react';
import { getDatabase, ref, query, orderByChild, equalTo, get } from "firebase/database";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";
import { useAuthContext } from "../contexts/AuthContext";
import { Chart } from "react-google-charts";


const educationTracks = [
  {
    strand: "STEM",
    title: "Science, Technology, Engineering and Mathematics (STEM) Strand",
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
    console.log(`Processing category: ${category}`);
    const code = categoryMapping[category];
    if (code) {
      acc[code] = (acc[code] || 0) + score;
    } else {
      console.log(`No mapping found for category: ${category}`);
    }
    return acc;
  }, {});


  console.log(categoryScores)

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
  console.log(strandScores)
  return strandScores;
}

function getSuggestedTrack(scores) {
  // If all scores are the same, return 'GAS' only
  if (new Set(Object.values(scores)).size === 1) {
    return ['GAS'];
  }
  console.log(scores)
  // Calculate total scores for each strand
  const strandScores = calculateStrandScores(scores);
  console.log(strandScores)

  // Sort strands by their total scores in descending order
  const sortedStrands = Object.entries(strandScores).sort((a, b) => b[1] - a[1]);
  console.log(sortedStrands)

  // Return the top 3 strands based on the highest total scores
  return sortedStrands.slice(0, 3).map(entry => entry[0]);
}


function getStrandDetails(strandKey ,educationTracks) {
  const strandDetails = educationTracks.find(strand => strand.strand === strandKey);
  return strandDetails || null;
}


export default function Recommendation() {
  const { user } = useAuthContext();
  const [categoryPoints, setCategoryPoints] = useState({});
  const [noTestTaken, setNoTestTaken] = useState(false)

  function isEmpty(obj) {
      return Object.keys(obj).length === 0;
  }

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

  const suggestedTrack = getSuggestedTrack(categoryPoints);

  const data = [
    ["Passion", "Your Passion"],
    ...Object.entries(categoryPoints).map(([key, value]) => [key, value])
  ];

  return (
    <div>
      <h1 className="text-[24px] md:text-[32px] font-bold text-primary-green">Recommendation</h1>
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