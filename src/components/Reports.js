import { Chart } from "react-google-charts";
import React, { useEffect, useState } from 'react';
import { getDatabase, ref, get } from "firebase/database";
import { FaChevronLeft } from "react-icons/fa";


import GenerateReport from './GenerateReport';

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

  strandScores['STEM'] = (categoryScores['R'] || 0) + (categoryScores['I'] || 0) + (categoryScores['C'] || 0);
  strandScores['HUMSS'] = (categoryScores['R'] || 0) + (categoryScores['A'] || 0) + (categoryScores['S'] || 0);
  strandScores['ABM'] = (categoryScores['I'] || 0) + (categoryScores['E'] || 0) + (categoryScores['C'] || 0);
  strandScores['TVL'] = (categoryScores['R'] || 0) + (categoryScores['I'] || 0) + (categoryScores['A'] || 0);
  strandScores['SPORTS'] = (categoryScores['C'] || 0) + (categoryScores['R'] || 0) + (categoryScores['A'] || 0);
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

const useFetchAllUsersWithTests = (schoolYearFilter) => {
  const initialRecommendationCounts = {
    STEM: { Male: 0, Female: 0, Other: 0 },
    ABM: { Male: 0, Female: 0, Other: 0 },
    HUMSS: { Male: 0, Female: 0, Other: 0 },
    ICT: { Male: 0, Female: 0, Other: 0 },
    TVL: { Male: 0, Female: 0, Other: 0 },
    SPORTS: { Male: 0, Female: 0, Other: 0 },
    'ARTS AND DESIGN': { Male: 0, Female: 0, Other: 0 },
    GAS: { Male: 0, Female: 0, Other: 0 },
  };
  const [userParticipation, setUserParticipation] = useState({ participants: 0, nonParticipants: 0 });
  const [hollandCodeTotals, setHollandCodeTotals] = useState({});
  const [sectionParticipationCounts, setSectionParticipationCounts] = useState({});
  const [recommendationCounts, setRecommendationCounts] = useState(initialRecommendationCounts);


  useEffect(() => {
    const fetchAllUsersWithTests = async () => {
      const db = getDatabase();
      const usersRef = ref(db, 'users');
      try {
        const snapshot = await get(usersRef);
        if (snapshot.exists()) {
          const usersData = snapshot.val();
          let participants = 0;
          let nonParticipants = 0;
          let categoryPoints = {};
          let sectionCounts = {};
          let newRecommendationCounts = { ...initialRecommendationCounts };

          Object.values(usersData).forEach(user => {
            user.gender = user.gender.charAt(0).toUpperCase() + user.gender.slice(1).toLowerCase();
            // Apply the school year filter if it's not 'All'
            if (schoolYearFilter === 'All' || user.schoolYear === schoolYearFilter) {
              if (user.userType !== 'admin') {
                if (user['test-taken']) {
                  const testsTaken = Object.values(user['test-taken']);
                  const completedTests = testsTaken.filter(test => test.status === 'Completed');
                  if (completedTests.length > 0) {
                    participants++;
                    completedTests.forEach(test => {
                      const userRecommendations = getSuggestedTrack(test.categoryPoints);
                      userRecommendations.forEach(track => {
                        if (user.gender === 'Male' || user.gender === 'Female' || user.gender === 'Other') {
                          newRecommendationCounts[track][user.gender]++;
                        }
                      });
                      Object.entries(test.categoryPoints).forEach(([category, points]) => {
                        categoryPoints[category] = (categoryPoints[category] || 0) + points;
                      });
                    });
                    sectionCounts[user.section] = (sectionCounts[user.section] || 0) + 1;
                  } else {
                    nonParticipants++;
                  }
                } else {
                  console.log("Non Participant:", user.lastName)
                  nonParticipants++;
                }
              }
            }
          });
          setRecommendationCounts(newRecommendationCounts);
          setUserParticipation({ participants, nonParticipants });
          setHollandCodeTotals(categoryPoints);
          setSectionParticipationCounts(sectionCounts);
        } else {
          console.log('No users found.');
        }
      } catch (error) {
        console.error('Error fetching users and tests:', error);
      }
    };

    fetchAllUsersWithTests();
  }, [schoolYearFilter]);

  return { userParticipation, hollandCodeTotals, sectionParticipationCounts, recommendationCounts };
};

export default function Reports() {
  
  const [schoolYearArr, setSchoolYearArr] = useState([])
  const [schoolYear, setSchoolYear] = useState("All");
  const [generateReport, setGenerateReport] = useState(false);
  const {
    userParticipation,
    hollandCodeTotals,
    sectionParticipationCounts,
    recommendationCounts, 
  } = useFetchAllUsersWithTests(schoolYear);

  const data = [
    ["Year", "Participants", "Non-Participants"],
    [new Date().getFullYear().toString(), userParticipation.participants, userParticipation.nonParticipants],
  ];

  const options = {
    chart: {
      title: "Student Participation",
      subtitle: "Participants and Non-Participants for the current year",
    },
  };

  const pieChartData = [
    ["Category", "Total Points"],
    ...Object.entries(hollandCodeTotals).map(([key, value]) => [key, value]),
  ];

  const pieChartOptions = {
    title: `Holland Code Distribution ${schoolYear}`,
    pieHole: 0.4,
    is3D: true,
  };

  const sectionData = Object.entries(sectionParticipationCounts).map(([sectionName, count]) => {
    return [sectionName, count];
  });

  const chartData = [["Section", "Number of Participants"], ...sectionData];

  const optionsSection = {
    title: 'Assessment by Section',
    chartArea: { width: '50%' },
    hAxis: {
      title: 'Number of Takers',
      minValue: 0,
    },
    vAxis: {
      title: 'Section',
    },
    seriesType: 'bars',
    colors: ['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02', '#a6761d', '#666666', '#1b9e77'],
  };

  const dataGender = Object.entries(recommendationCounts).reduce((acc, [track, genders]) => {
    acc.push([track, genders.Male, genders.Female, genders.Other]);
    return acc;
  }, [['Strand', 'Male', 'Female', 'Other']]);

  const optionsGender = {
    title: 'Ranking of Recommended Strand based on Gender',
    chartArea: { width: '50%' },
    hAxis: {
      title: 'Participants',
      minValue: 0,
    },
    vAxis: {
      title: 'Strand',
    },
    bars: 'vertical',
    colors: ['#2596be', '#FFC0CB', '#e619b2'],
  };

  const handleChange = (e) => {
    setSchoolYear(e.target.value)
  }

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

  if(generateReport){

    return(

      <div className="flex flex-col gap-4">
        <div className="flex flex-row items-center gap-4">
          <button onClick={() => {setGenerateReport(false)}} className="bg-primary-green text-safe-white h-10 min-10 px-4 rounded-lg flex items-center justify-center"><FaChevronLeft/></button>
          <h1 className="text-[24px] md:text-[32px] font-bold text-primary-green">Generate Reports</h1>
        </div>
        <GenerateReport isVisible={generateReport} setIsVisible={setGenerateReport} />
      </div>

    );

  };

  return (
    <div>
      <h1 className="text-[24px] md:text-[32px] font-bold text-primary-green">Reports</h1>
      <div className="flex flex-col md:flex-row gap-2">
        <label htmlFor="schoolYear" className="font-semibold">School Year:</label>
        <select 
          id="schoolYear" 
          name="schoolYear"  
          className="border-2 border-[#D9D9D9] rounded-lg px-2 h-max" 
          onChange={handleChange} 
          required
          value={schoolYear}
        >
          <option value="All">All Time</option>
          {schoolYearArr.map((school) => (
            <option key={school.id} value={school.schoolYear}>
              {school.schoolYear}
            </option>
          ))}
        </select>
        <button onClick={() => {setGenerateReport(true)}} className="h-10 font-bold px-2 border-primary-green text-primary-green border-2 rounded-lg relative overflow-hidden cursor-pointer hover:bg-primary-green hover:text-safe-white ml-auto">
          Generate Report
        </button>
      </div>
      <Chart
        chartType="PieChart"
        width="100%"
        height="400px"
        data={pieChartData}
        options={pieChartOptions}
      />

      <Chart
        chartType="Bar"
        width="100%"
        height="400px"
        data={dataGender}
        options={optionsGender}
      />

      <Chart
        chartType="BarChart"
        width="100%"
        height="400px"
        data={chartData}
        options={optionsSection}
      />

      <Chart
        chartType="Bar"
        width="100%"
        height="400px"
        data={data}
        options={options}
      />
    </div>
  );
}
