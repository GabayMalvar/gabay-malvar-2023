import React, { useState, useEffect } from 'react';
import { FiTrash2 } from "react-icons/fi";

//firebase
import { db } from '../configs/firebase'; // assuming db is already initialized
import { ref, update, push, set } from "firebase/database";

//external imports
import { toast } from 'react-toastify';

const categoryOptions = [
    "Realistic", "Investigative", "Artistic", "Social", "Enterprise", "Conventional",
];

const ViewSurvey = ({ viewSurvey, setViewSurvey }) => {
    const initialSurveyState = viewSurvey || {
        surveyName: '',
        description: '',
        timeLimit: 0,
        attemps: 0,
        category: '',
        allowRetake: false,
        questions: [{ question: '', category: '' }],
    };

    const [surveyInfo, setSurveyInfo] = useState(initialSurveyState);

    useEffect(() => {
        console.log(viewSurvey)
        if (viewSurvey) {
            setSurveyInfo(viewSurvey);
        }
    }, [viewSurvey]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSurveyInfo({
            ...surveyInfo,
            [name]: value,
        });
    };

    const handleQuestionChange = (index, e) => {
        const updatedQuestions = [...surveyInfo.questions];
        updatedQuestions[index][e.target.name] = e.target.value;
        setSurveyInfo({
            ...surveyInfo,
            questions: updatedQuestions,
        });
    };

    const addQuestion = () => {

        if (surveyInfo.questions.slice(-1)[0].question.trim() === "" || surveyInfo.questions.slice(-1)[0].category === "") {
            toast.error('Please complete the last question before adding a new one.');
            return;
        }

        setSurveyInfo({
            ...surveyInfo,
            questions: [...surveyInfo.questions, { question: '', category: '' }],
        });
    };

    const removeQuestion = (index) => {
        if (surveyInfo.questions.length <= 1) {

            toast.error('You cannot delete the last question.');
            return; // Exit the function early if there's only one question
        }

        const filteredQuestions = surveyInfo.questions.filter((_, i) => i !== index);
        setSurveyInfo({
            ...surveyInfo,
            questions: filteredQuestions,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (viewSurvey) {

            try {
                await update(ref(db, 'survey/' + surveyInfo.id), {
                    ...surveyInfo,
                });
                toast.success('Survey updated successfully');
            } catch (error) {
                toast.error('Error updating survey: ' + error.message);
            }
        } else {

            const newSurveyRef = push(ref(db, 'survey'));
            try {
                await set(newSurveyRef, {
                    ...surveyInfo,
                    status: "Active",
                });
                toast.success('Survey created successfully');
            } catch (error) {
                toast.error('Error creating survey: ' + error.message);
            }
        }

        setViewSurvey(false);
    };

    return (
        <>
        <h1 className="text-[20px] md:text-[28px] font-bold text-primary-green">Survey / Add Survey</h1>
        <div className="flex items-center justify-center">
        <form className="flex flex-col md:pt-10 gap-4 max-w-[670px] w-full border-2 p-4 rounded-xl md:mt-5" onSubmit={handleSubmit}>
            
            <div className="flex flex-col md:flex-row gap-4 justify-between">
                <label className="font-bold">Survey Name:</label>
                <input
                    type="text"
                    name="surveyName"
                    className="grow border-2 border-[#D9D9D9] rounded-lg px-2"
                    value={surveyInfo.surveyName}
                    onChange={handleInputChange}
                    required
                />
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-between">
                <label className="font-bold">Description:</label>
                <textarea
                    name="description"
                    className="grow border-2 border-[#D9D9D9] rounded-lg px-2"
                    value={surveyInfo.description}
                    onChange={handleInputChange}
                />
            </div>

            <div className="flex flex-row gap-4">
                <label className="font-bold">Time Limit (minutes):</label>
                <input
                    type="number"
                    name="timeLimit"
                    className="w-24 border-2 border-[#D9D9D9] rounded-lg px-2"
                    min="0"
                    value={surveyInfo.timeLimit}
                    onChange={handleInputChange}
                />
            </div>

            <div className="flex flex-row gap-4">
                <label className="font-bold">Allow Retake:</label>
                <input
                    type="checkbox"
                    name="allowRetake"
                    checked={surveyInfo.allowRetake}
                    onChange={(e) =>
                        setSurveyInfo({
                            ...surveyInfo,
                            allowRetake: e.target.checked,
                        })
                    }
                />
            </div>

            <div className="flex flex-row gap-4">
                <label className="font-bold">Attemps:</label>
                <input
                    type="number"
                    name="attemps"
                    className="w-24 border-2 border-[#D9D9D9] rounded-lg px-2"
                    min="0"
                    value={surveyInfo.attemps}
                    onChange={handleInputChange}
                />
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-between">
                <label className="font-bold">Category:</label>
                <input
                    type="text"
                    name="category"
                    className="grow border-2 border-[#D9D9D9] rounded-lg px-2"
                    value={surveyInfo.category}
                    onChange={handleInputChange}
                />
            </div>

            <div className="flex flex-col gap-4">
                {surveyInfo.questions.map((question, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-4 items-center">
                        <label className="font-bold">Question {index + 1}:</label>
                        <input
                            type="text"
                            name="question"
                            className="grow border-2 border-[#D9D9D9] rounded-lg px-2"
                            value={question.question}
                            onChange={(e) => handleQuestionChange(index, e)}
                            required
                        />
                        <label className="font-bold">Category:</label>
                        <select
                            name="category"
                            value={question.category}
                            className="grow border-2 border-[#D9D9D9] rounded-lg px-2"
                            onChange={(e) => handleQuestionChange(index, e)}
                            required
                        >
                            <option value="">Select Category</option>
                            {categoryOptions.map((option, i) => (
                                <option key={i} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                        <button type="button" className="h-10 w-10 bg-[#ff2a00] flex justify-center items-center rounded-lg" onClick={() => removeQuestion(index)}>
                            <FiTrash2 className="w-5 h-5 text-safe-white" />
                        </button>
                    </div>
                ))}
                <button type="button" className="border-2 px-4 w-max border-primary-green rounded-lg font-bold text-primary-green" onClick={addQuestion}>
                    + Add Question
                </button>
            </div>

            <button type="submit" className="font-bold bg-primary-green px-4 py-2 rounded-lg text-safe-white">Submit</button>
            <button onClick={() => {setViewSurvey(false)}} className="font-bold border-2 border-primary-green px-4 py-2 rounded-lg text-primary-green">Cancel</button>
        </form>
        </div>
        </>
    );
};

export default ViewSurvey;