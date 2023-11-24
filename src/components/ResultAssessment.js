// mui styling
import { Table, TableBody, TableCell, TableContainer, TableRow, Radio, RadioGroup, FormControlLabel, Paper } from '@mui/material';
import { useEffect, useState } from "react";
import { getDatabase, ref, get } from "firebase/database";
import { useAuthContext } from "../contexts/AuthContext"
import { FaChevronLeft } from "react-icons/fa";

import { Chart } from "react-google-charts";

function createData( surveyName, timeLimit , category, status, isTaken, id) {
  return { surveyName, timeLimit, category, status, isTaken, id};
}


export const options = {
  title: "Holland Code",
  is3D: true,
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
  return sortedStrands.slice(0, 3).map(entry => entry[0]).join(", ");
}




export default function ResultAssessment({ viewTestResults, setViewTestResults }){

	const { user } = useAuthContext();

	const { answers, categoryPoints, dateTaken, status, surveyId, surveyName } = viewTestResults

	const data = [
	  ["Passion", "Your Passion"],
	  ...Object.entries(categoryPoints).map(([key, value]) => [key, value])
	];

	return(
		<div>
			<div className="flex flex-row gap-4 items-center">
			<button onClick={() => {setViewTestResults(false)}} className="bg-primary-green text-safe-white h-10 min-10 px-4 rounded-lg flex items-center justify-center"><FaChevronLeft/></button>
			<h1 className="text-[24px] md:text-[32px] font-bold text-primary-green">{surveyName}</h1>
			</div>
			<Chart
		      chartType="PieChart"
		      data={data}
		      options={options}
		      width={"100%"}
		      height={"320px"}
		    />
		    <h1 className="text-[24px] text-primary-green font-bold">Suggested Track: {getSuggestedTrack(categoryPoints)}</h1>
{/*			<div className="border-2 h-full">
		     <TableContainer component={Paper}>
		       <Table>
		         <TableBody>
		           {viewTestResults.answers.map((item, index) => (
		             <TableRow key={item.question + index}>
		               <TableCell>{item.question}</TableCell>
		               <TableCell>
		                 <RadioGroup row value={item.answer.toString()}>
		                   <FormControlLabel value="5" control={<Radio disabled />} label="5" />
		                   <FormControlLabel value="4" control={<Radio disabled />} label="4" />
		                   <FormControlLabel value="3" control={<Radio disabled />} label="3" />
		                   <FormControlLabel value="2" control={<Radio disabled />} label="2" />
		                   <FormControlLabel value="1" control={<Radio disabled />} label="1" />
		                 </RadioGroup>
		               </TableCell>
		             </TableRow>
		           ))}
		         </TableBody>
		       </Table>
		     </TableContainer>
		   </div>*/}
	   </div>
	);
}