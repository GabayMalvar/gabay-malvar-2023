import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableContainer, TableRow, Radio, RadioGroup, FormControlLabel, Paper } from '@mui/material';
import { useAuthContext } from "../contexts/AuthContext"
import { getDatabase, ref, get, set, update, push } from 'firebase/database';
import { toast } from "react-toastify";


export default function StartAssessment({ viewSurvey, setViewSurvey }){

	const { surveyName, status, questions, attemps, timeLimit, description, category, allowRetake, id } = viewSurvey;

	const { user } = useAuthContext()

	const [answers, setAnswers] = useState(questions.map(() => ""));
	const isAllAnswered = answers.every(answer => answer !== "");

	const [started, setStarted] = useState(false)

	const [timeLeft, setTimeLeft] = useState(timeLimit * 60 * 1000);

	const [categoryPoint, setCategoryPoints] = useState({
		Realistic: 0,
		Investigative: 0,
		Artistic: 0,
		Social: 0,
		Enterprise: 0,
		Conventional: 0
	})

	const handleRadioChange = (index, value, questionCategory) => {
	  const newAnswers = [...answers];
	  const oldValue = newAnswers[index];
	  newAnswers[index] = value;
	  setAnswers(newAnswers);

	  setCategoryPoints((prevPoints) => {
	    const pointsDeduction = oldValue ? parseInt(oldValue, 10) : 0;

	    const pointsAddition = value ? parseInt(value, 10) : 0;

	    const newPoints = (prevPoints[questionCategory] || 0) - pointsDeduction + pointsAddition;

	    return {
	      ...prevPoints,
	      [questionCategory]: newPoints,
	    };
	  });
	};

	const handleAssessment = () => {
	  const userId = user.uid;
	  const db = getDatabase();
	  const userTestRef = ref(db, `users/${userId}/test-taken`);

	  get(userTestRef).then((testSnapshot) => {
	    let testEntryExists = false;
	    let testKeyToUpdate = null;
	    let currentAttempts = null;

	    if (testSnapshot.exists()) {
	      testSnapshot.forEach((childSnapshot) => {
	        const test = childSnapshot.val();
	        if (test.surveyId === id) {
	          testEntryExists = true;
	          testKeyToUpdate = childSnapshot.key;
	          currentAttempts = test.attempts;
	        }
	      });
	    }

	    if (testEntryExists && testKeyToUpdate && currentAttempts !== null && currentAttempts > 0) {
	      const testToUpdateRef = ref(db, `users/${userId}/test-taken/${testKeyToUpdate}`);
	      update(testToUpdateRef, {
	        dateTaken: new Date().toISOString(),
	        attempts: currentAttempts + 1,
	        status: "Pending"
	      }).then(() => {
	        toast.success('User assessment started successfully.');
	        setStarted(true);
	      }).catch((error) => {
	        toast.error('Failed to update assessment.');
	        console.error('Error:', error);
	      });
	    } else if (!testEntryExists) {
	      const newTestRef = push(userTestRef);
	      set(newTestRef, {
	        surveyId: id,
	        dateTaken: new Date().toISOString(),
	        attempts: 1,
	        status: "Pending"
	      }).then(() => {
	        toast.success('User assessment started successfully.');
	        setStarted(false);
	      }).catch((error) => {
	        toast.error('Failed to start assessment.');
	        console.error('Error:', error);
	      });
	    } else {
	      toast.error('No attempts left or an error occurred.');
	    }
	  }).catch((error) => {
	    toast.error('Failed to start assessment.');
	    console.error('Error:', error);
	  });
	};

	useEffect(() => {
	  let timer;

	  if (started) {
	    timer = setTimeout(() => {
	      if (timeLeft <= 0) {
	        finishAssessment("Not Completed");
	      } else {
	        setTimeLeft(timeLeft - 1000);
	      }
	    }, 1000);
	  }

	  return () => clearTimeout(timer);
	}, [timeLeft, started]);

	const finishAssessment = (status) => {
	  const db = getDatabase();
	  const userTestRef = ref(db, `users/${user.uid}/test-taken`);

	  get(userTestRef).then((testSnapshot) => {
	    if (testSnapshot.exists()) {
	      let testKeyToUpdate = null;

	      testSnapshot.forEach((childSnapshot) => {
	        const test = childSnapshot.val();
	        if (test.surveyId === id) {
	          testKeyToUpdate = childSnapshot.key;
	        }
	      });

	      if (testKeyToUpdate) {

	        const testToUpdateRef = ref(db, `users/${user.uid}/test-taken/${testKeyToUpdate}`);
	        update(testToUpdateRef, {
	          status: status,

	        }).then(() => {
	          toast.success('Assessment status updated to ' + status);
	        }).catch((error) => {
	          toast.error('Failed to update assessment status: ' + error.message);
	        });
	      }
	    }
	  }).catch((error) => {
	    toast.error('Failed to update assessment status: ' + error.message);
	  });
	};

	const saveAssessmentResults = () => {
	  const db = getDatabase();
	  const userTestRef = ref(db, `users/${user.uid}/test-taken`);

	  get(userTestRef).then((testSnapshot) => {
	    if (testSnapshot.exists()) {
	      let testKeyToUpdate = null;


	      testSnapshot.forEach((childSnapshot) => {
	        const test = childSnapshot.val();
	        if (test.surveyId === id) {
	          testKeyToUpdate = childSnapshot.key;
	        }
	      });

	      if (testKeyToUpdate) {

	        const answersToSave = questions.map((question, index) => ({
	          question: question.question,
	          category: question.category,
	          answer: answers[index]
	        }));


	        const testToUpdateRef = ref(db, `users/${user.uid}/test-taken/${testKeyToUpdate}`);
	        update(testToUpdateRef, {
	          status: "Completed",
	          answers: answersToSave,
	          categoryPoints: categoryPoint
	        }).then(() => {
	          toast.success('Assessment saved successfully.');
	          setViewSurvey(false);
	        }).catch((error) => {
	          toast.error('Failed to save assessment: ' + error.message);
	        });
	      }
	    }
	  }).catch((error) => {
	    toast.error('Failed to save assessment: ' + error.message);
	  });
	};

	 const displayTimeLeft = (timeInMillis) => {
	   const minutes = Math.floor(timeInMillis / 60000);
	   const seconds = ((timeInMillis % 60000) / 1000).toFixed(0);
	   return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
	 }

	if(started){
		return(

		<div className="flex flex-col gap-4">
			<div>Time left: {displayTimeLeft(timeLeft)}</div>
			<TableContainer component={Paper}>
			 <div className="bg-[#dadce0] px-4 py-2 flex flex-wrap gap-4">
			 	<p className="text-[12px]">5 - Strongly Agree</p>
			 	<p className="text-[12px]">4 - Agree</p>
			 	<p className="text-[12px]">3 - Neutral</p>
			 	<p className="text-[12px]">2 -Disagree</p>
			 	<p className="text-[12px]">1 - Strongly Disagree</p>
			 </div>
		      <Table>
		        <TableBody>
		          {questions.map((question, index) => (
		            <TableRow key={question.question + index} sx={{ backgroundColor: answers[index] === "" ?  "inherit" : "#D5F5E6" }}>
		              <TableCell>{question.question}</TableCell>
		              <TableCell>
		                <RadioGroup
		                  row
		                  value={answers[index]}
		                  onChange={(event) => handleRadioChange(index, event.target.value, question.category)}
		                >
		                 <FormControlLabel value="5" control={<Radio />} label="5" />
		                 <FormControlLabel value="4" control={<Radio />} label="4" />
		                 <FormControlLabel value="3" control={<Radio />} label="3" />
		                 <FormControlLabel value="2" control={<Radio />} label="2" />
		                 <FormControlLabel value="1" control={<Radio />} label="1" />
		                </RadioGroup>
		              </TableCell>
		            </TableRow>
		          ))}
		        </TableBody>
		      </Table>
		    </TableContainer>
		    <button
	            type="button"
	            disabled={!isAllAnswered}
	            onClick={saveAssessmentResults}
	            className={`font-bold px-4 py-2 rounded-lg text-safe-white w-full md:w-[50%] self-end ${isAllAnswered ? "bg-primary-green" : "bg-primary-green opacity-40"}`}
	          >
		    Save</button>
	    </div>

		);
	};

	return(

		<div className="flex flex-col gap-6 items-center">
			<div className="flex flex-col text-center">
				<h1 className="text-[24px] md:text-[32px] font-bold text-primary-green">{surveyName}</h1>
				<h1 className="font-semibold">{timeLimit} min(s)</h1>
				<p className={`text-[16px] font-bold ${status === "Active"? "text-primary-green" : status === "Pending"? "text-black" : "text-[#ff2a00]" }`}>{status}</p>
				<p className="font-semibold">{category}</p>
				<p className="font-semibold text-[#ff2a00]">{allowRetake? `${attemps} remaining` : "No Retakes"}</p>
				<p className="font-semibold">{description}</p>
			</div>

			<button type="button" onClick={handleAssessment} className="font-bold bg-primary-green px-4 py-2 rounded-lg text-safe-white">Let's Go!</button>
			
			<div>

			</div>
		</div>

	);

}