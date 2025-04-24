'use client'
import { useEffect, useState } from 'react';
import { AIMessage } from '@/types/aiMessage';
import { SupportedLanguages } from '@/types/supportedLanguages';
import Navbar from '@/components/Navbar';
// No need to import Flowbite's init functions if doing it manually

// Define types for clarity
interface EvaluationDetails {
  problem_understanding: string;
  code_quality_and_structure: string;
  programming_language_proficiency: string;
  technical_communication_effectiveness: string;
  final_solution_effectiveness: string;
}

interface Scores {
  Communication: string;
  Problem_Solving: string;
  Code_Quality: string;
  Overall_Performance: string;
  Final_Grade: string;
}

interface ParsedEvaluation {
  evaluation: EvaluationDetails;
  scores: Scores;
}

// Define the radius and stroke width for the main circular progress bar
const CIRCLE_RADIUS = 60; // Radius of the circle
const STROKE_WIDTH = 8; // Width of the progress stroke
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS; // Circumference for stroke-dasharray

export default function Page({ params }: { params: { slug: string } }) {
  const [evaluationApiResponse, setEvaluationApiResponse] = useState<any>(null);
  const [parsedEvaluation, setParsedEvaluation] = useState<ParsedEvaluation | null>(null); // Use defined type
  const [loading, setLoading] = useState(true);
  const [parsingError, setParsingError] = useState<string | null>(null);
  const [overallProgress, setOverallProgress] = useState(0); // Progress for the main circular animation
  // State to track the currently open accordion item ID (null if none open)
  const [openAccordionId, setOpenAccordionId] = useState<string | null>(null);


  // Function to call the AI API
  const getResults = async (
    currentLanguage: SupportedLanguages,
    codeValue: string,
    problemName: string,
    message: string,
    chatHistory: AIMessage[]
  ) => {
    const payload = {
      language: currentLanguage,
      code: codeValue,
      problemName: problemName,
      chat: message,
      history: chatHistory ? chatHistory : [] as AIMessage[],
    };

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
          const errorData = await response.json();
          console.error("API Error:", errorData);
          return null;
      }

      const data = await response.json();
      return data; // Return the AI response
    } catch (error) {
      console.error('Error with API request:', error);
      return null;
    }
  };

  // Effect to fetch the evaluation from the API
  useEffect(() => {
    // Retrieve data from localStorage only once when the component mounts
    const currentLanguage = localStorage.getItem('currentLangugage') as SupportedLanguages;
    const codeValue = localStorage.getItem('codeValue');
    const problemName = localStorage.getItem('problemName')!;
    const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]') as AIMessage[];

    const fetchEvaluation = async () => {
      try {
        if (codeValue && problemName) {
          const formattedPrompt = `You are an AI evaluation assistant. Please analyze this completed coding interview:
          Problem: ${problemName}
          Language: ${currentLanguage}
          Candidate's Solution:
          \`\`\`${currentLanguage.toLowerCase()}
          ${codeValue}
          \`\`\`

          Chat History:
          \`\`\`json
          ${JSON.stringify(chatHistory, null, 2)}
          \`\`\`

          IMPORTANT: Provide your complete evaluation SOLELY as a single JSON object within a markdown code block, exactly matching the following structure:

          \`\`\`json
          {
            "evaluation": {
              "problem_understanding": "Detailed assessment of how well the candidate understood the problem...",
              "code_quality_and_structure": "Assessment of code organization, readability, and best practices...",
              "programming_language_proficiency": "Evaluation of how effectively they used the programming language...",
              "technical_communication_effectiveness": "Assessment of how clearly they communicated their approach...",
              "final_solution_effectiveness": "Evaluation of whether their solution works and is optimal..."
            },
            "scores": {
              "Communication": "X/10",
              "Problem_Solving": "X/10",
              "Code_Quality": "X/10",
              "Overall_Performance": "X/10",
              "Final_Grade": "A+/A/A-/B+/B/B-/C+/C/C-/D+/D/D-/F"
            }
          }
          \`\`\`

          Ensure your complete evaluation fits within this JSON structure and markdown block. DO NOT include any text before or after the JSON markdown block. Keep your total response under 900 tokens.`;

          const result = await getResults(
            currentLanguage,
            codeValue,
            problemName,
            formattedPrompt,
            chatHistory
          );

          setEvaluationApiResponse(result); // Store the raw API response

        } else {
            console.warn("Missing codeValue or problemName in localStorage.");
            // If essential data is missing, stop loading and indicate error
            setLoading(false);
            setParsingError("Required data for evaluation is missing.");
        }

      } catch (error) {
        console.error("Error fetching evaluation:", error);
        setParsingError("Failed to fetch evaluation from API.");
      } finally {
        // Only set loading to false if we successfully fetched or encountered an error
        // where we can't proceed. If codeValue/problemName were missing, it's already set above.
        if (codeValue && problemName) {
           setLoading(false);
        }
      }
    };

    fetchEvaluation();

  }, [params.slug]); // Depend on params.slug if it affects the data to fetch

  // Effect to parse the AI response when it's received
  useEffect(() => {
    if (evaluationApiResponse && evaluationApiResponse.aiResponse) {
      const aiResponseText = evaluationApiResponse.aiResponse;
      // Use a more robust regex to capture content within the json markdown block
      const jsonMatch = aiResponseText.match(/```json\s*([\s\S]*?)\s*```/);

      if (jsonMatch && jsonMatch[1]) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          // Validate the parsed structure matches expected types before setting state
          if (parsed && parsed.evaluation && parsed.scores) {
             setParsedEvaluation(parsed as ParsedEvaluation); // Cast to defined type
             setParsingError(null); // Clear any previous parsing errors
          } else {
             console.error("Parsed JSON does not match expected structure:", parsed);
             setParsedEvaluation(null);
             setParsingError("Parsed evaluation JSON has an unexpected structure.");
          }
        } catch (error) {
          console.error("Error parsing JSON from AI response:", error);
          setParsedEvaluation(null); // Clear parsed data on error
          setParsingError("Failed to parse evaluation JSON from AI response.");
        }
      } else {
          console.warn("No JSON markdown block found in AI response.");
          setParsedEvaluation(null); // Clear parsed data if block not found
          setParsingError("Could not find evaluation JSON block in AI response.");
      }
    } else if (evaluationApiResponse && !evaluationApiResponse.aiResponse) {
         console.warn("AI response received, but it does not contain 'aiResponse' text.");
         setParsedEvaluation(null);
         setParsingError("AI response did not contain the expected evaluation text.");
         // setLoading(false); // Loading should already be false from the fetch effect
    }
    // This effect depends on evaluationApiResponse changing
  }, [evaluationApiResponse]);


  // Effect for the main circular progress bar animation (Overall Performance)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    // Only start the animation if parsedEvaluation and the required score data are available
    if (parsedEvaluation?.scores?.Overall_Performance) {
      const [earned, total] = parsedEvaluation.scores.Overall_Performance.split('/').map(Number);
      // Ensure total is not zero to avoid division by zero
      const targetPercent = total > 0 ? Math.round((earned / total) * 100) : 0;

      // Clear any existing interval before starting a new one
      if (interval) {
          clearInterval(interval);
      }

      // Start the animation only if targetPercent is greater than current overallProgress
      // We animate the `overallProgress` state from 0 up to targetPercent
      if (targetPercent > overallProgress) {
        interval = setInterval(() => {
          setOverallProgress((prev) => {
            const nextProgress = prev + 1;
            if (nextProgress >= targetPercent) {
              clearInterval(interval!);
              return targetPercent;
            }
            return nextProgress;
          });
        }, 20); // speed of animation
      } else {
          // If target is lower than current, reset progress
          setOverallProgress(targetPercent);
      }
    } else {
        // If data becomes unavailable after being available, clear the interval and reset progress
        if (interval) {
            clearInterval(interval);
        }
        setOverallProgress(0); // Reset progress if data is not available
    }

    // Cleanup function to clear the interval when the component unmounts
    // or when the dependencies change
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
    // This effect depends on parsedEvaluation changing
  }, [parsedEvaluation]); // Depend only on parsedEvaluation


  // Calculate the stroke-dashoffset based on the current overallProgress state
  const overallStrokeDashoffset = CIRCLE_CIRCUMFERENCE - (CIRCLE_CIRCUMFERENCE * overallProgress) / 100;

  // Determine the color className for the circular progress bar based on the Overall Performance score
  const getOverallProgressColorClass = (overallPerformance: string | undefined): string => {
      if (!overallPerformance) return 'stroke-gray-500'; // Default color if score is not available

      const [earned, total] = overallPerformance.split('/').map(Number);

      if (earned < 5) {
          return 'stroke-red-500'; // Below 5/10 is red
      } else if (earned >= 5 && earned <= 7) {
          return 'stroke-yellow-500'; // 5/10 to 7/10 is yellow
      } else if (earned >= 8 && earned <= 10) {
          return 'stroke-green-500'; // 8/10 to 10/10 is green
      } else {
          return 'stroke-gray-500'; // Fallback for unexpected values
      }
  };

  // Determine the color className for the linear progress bars based on individual scores
  const getLinearProgressColorClass = (score: string | undefined): string => {
    if (!score) return 'bg-gray-500'; // Default color if score is not available

    const [earned, total] = score.split('/').map(Number);

    if (earned < 5) {
        return 'bg-red-500'; // Below 5/10 is red
    } else if (earned >= 5 && earned <= 7) {
        return 'bg-yellow-500'; // 5/10 to 7/10 is yellow
    } else if (earned >= 8 && earned <= 10) {
        return 'bg-green-500'; // 8/10 to 10/10 is green
    } else {
        return 'bg-gray-500'; // Fallback for unexpected values
    }
  };

  // Get the color className based on the current parsed evaluation scores for the overall circle
  const overallProgressColorClass = getOverallProgressColorClass(parsedEvaluation?.scores?.Overall_Performance);

  // Helper function to toggle accordion item visibility
  const toggleAccordion = (id: string) => {
    setOpenAccordionId(openAccordionId === id ? null : id);
  };

  // Render loading state
  if (loading) {
    return (
      <>
        <Navbar/>
        <div className="flex justify-center items-center h-screen text-white text-2xl bg-slate-950">
        <div className="text-center">
        <div role="status">
            <div className='mb-5 text-center'> Loading Results</div>
            <svg aria-hidden="true" className="w-12 h-12 text-gray-200 mx-auto animate-spin dark:text-gray-600 fill-purple-500" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
            <span className="sr-only">Loading...</span>
        </div>
        </div>
        </div>
      </>
    );
  }

  // Render error state
  if (parsingError) {
      return (
        <>
          <Navbar/>
          <div className="flex justify-center items-center h-screen text-red-500 text-xl">
              Error displaying evaluation: {parsingError}
          </div>
        </>
      );
  }

  // Render no data state
  if (!parsedEvaluation) {
       return (
        <>
          <Navbar/>
          <div className="flex justify-center items-center h-screen text-yellow-500 text-xl">
              No evaluation data available or parsing failed.
          </div>
        </>
       );
  }

  // If we reach here, parsedEvaluation is guaranteed to be available
  const evaluationDetails = parsedEvaluation.evaluation;
  const scores = parsedEvaluation.scores;

  // Define unique IDs for each accordion item
  const ACCORDION_IDS = {
      PROBLEM_UNDERSTANDING: 'problem-understanding',
      CODE_QUALITY: 'code-quality',
      LANGUAGE_PROFICIENCY: 'language-proficiency',
      COMMUNICATION: 'communication',
      SOLUTION_EFFECTIVENESS: 'solution-effectiveness',
  };


  return (
    <>
    <Navbar/>

    <section className="relative isolate bg-slate-950 px-6 py-24 sm:py-32 lg:px-8">
    <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,var(--color-purple-900),theme(colors.slate.950))] opacity-20" />
    <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-slate-950 shadow-xl ring-1 shadow-purple-600/90 ring-indigo-50 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center" />
    <div className="mx-auto max-w-2xl lg:max-w-4xl">
        <div className="text-center text-white text-6xl mb-10 font-bold">
            RESULTS
        </div>
        {/* Render evaluation details and scores only if parsedEvaluation is available */}
        {parsedEvaluation && ( // 'parsedEvaluation' must be defined and accessible
            <>
                {/* Circular Progress Bar and Final Grade */}
                <div className="flex flex-col items-center justify-center mb-8">
                    <div className="relative w-[150px] h-[150px]"> {/* Container for SVG and text */}
                        {/* CIRCLE_RADIUS, STROKE_WIDTH, overallProgressColorClass, overallStrokeDashoffset, CIRCLE_CIRCUMFERENCE must be defined and accessible */}
                        <svg className="w-full h-full" viewBox={`0 0 ${2 * CIRCLE_RADIUS + 2 * STROKE_WIDTH} ${2 * CIRCLE_RADIUS + 2 * STROKE_WIDTH}`}>
                            {/* Background circle */}
                            <circle
                                cx={CIRCLE_RADIUS + STROKE_WIDTH}
                                cy={CIRCLE_RADIUS + STROKE_WIDTH}
                                r={CIRCLE_RADIUS}
                                fill="none"
                                strokeWidth={STROKE_WIDTH}
                                className="stroke-gray-700" // Tailwind className for stroke color
                            />
                            {/* Progress circle */}
                            <circle
                                cx={CIRCLE_RADIUS + STROKE_WIDTH}
                                cy={CIRCLE_RADIUS + STROKE_WIDTH}
                                r={CIRCLE_RADIUS}
                                fill="none"
                                strokeWidth={STROKE_WIDTH}
                                className={`${overallProgressColorClass} transition-all duration-300 ease-linear`} // Apply dynamic color className here
                                strokeDasharray={CIRCLE_CIRCUMFERENCE}
                                strokeDashoffset={overallStrokeDashoffset} // Animated offset
                                strokeLinecap="round" // Rounded ends for the stroke
                                transform={`rotate(-90 ${CIRCLE_RADIUS + STROKE_WIDTH} ${CIRCLE_RADIUS + STROKE_WIDTH})`} // Start from the top
                            />
                        </svg>
                        {/* Text inside the circle */}
                        {/* scores and overallProgress must be defined and accessible */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white font-bold text-center">
                            <div className="text-5xl mb-1">{scores.Final_Grade}</div> {/* Display Final Grade */}
                            <div className="text-2xl">{overallProgress}%</div> {/* Display percentage */}
                        </div>
                    </div>
                    {/* Display Overall Score text below the circle */}
                    {/* scores must be defined and accessible */}
                    <div className="text-base font-medium text-purple-500 mt-4">
                        Overall Score: {scores.Overall_Performance}
                    </div>
                </div>

                {/* Manual Accordion Implementation */}
                <div id="evaluation-accordion"> {/* Wrapper div */}
                    {/* ACCORDION_IDS, openAccordionId, and toggleAccordion must be defined and accessible */}

                    {/* Problem Understanding Accordion Item */}
                    <h2 id={`heading-${ACCORDION_IDS.PROBLEM_UNDERSTANDING}`}>
                        <button
                            type="button"
                            className="flex items-center justify-between w-full p-5 font-medium text-lg rtl:text-right text-gray-500 rounded-t-xl border border-b-0 border-gray-200 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3"
                            onClick={() => toggleAccordion(ACCORDION_IDS.PROBLEM_UNDERSTANDING)}
                            aria-expanded={openAccordionId === ACCORDION_IDS.PROBLEM_UNDERSTANDING}
                            aria-controls={`body-${ACCORDION_IDS.PROBLEM_UNDERSTANDING}`}
                        >
                            <span>Problem Understanding</span>
                            <svg className={`w-3 h-3 shrink-0 ${openAccordionId === ACCORDION_IDS.PROBLEM_UNDERSTANDING ? 'rotate-0' : 'rotate-180'}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5 5 1 1 5"/>
                            </svg>
                        </button>
                    </h2>
                    {/* Added bg-gray-100 when open, and increased text size on the <p> tag */}
                    <div
                        id={`body-${ACCORDION_IDS.PROBLEM_UNDERSTANDING}`}
                        className={`${openAccordionId === ACCORDION_IDS.PROBLEM_UNDERSTANDING ? 'bg-gray-100' : 'hidden'} p-5 border border-b-0 border-gray-200 dark:border-gray-700 dark:bg-gray-900`}
                        aria-labelledby={`heading-${ACCORDION_IDS.PROBLEM_UNDERSTANDING}`}
                    >
                        {/* evaluationDetails must be defined and accessible */}
                        <p className="mb-2 text-base text-gray-500 dark:text-gray-400">{evaluationDetails.problem_understanding}</p>
                    </div>

                    {/* Code Quality Accordion Item */}
                    <h2 id={`heading-${ACCORDION_IDS.CODE_QUALITY}`}>
                        <button
                            type="button"
                            className="flex items-center justify-between w-full p-5 font-medium text-lg rtl:text-right text-gray-500 border border-b-0 border-gray-200 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3"
                            onClick={() => toggleAccordion(ACCORDION_IDS.CODE_QUALITY)}
                            aria-expanded={openAccordionId === ACCORDION_IDS.CODE_QUALITY}
                            aria-controls={`body-${ACCORDION_IDS.CODE_QUALITY}`}
                        >
                            <span>Code Quality and Structure</span>
                            <svg className={`w-3 h-3 shrink-0 ${openAccordionId === ACCORDION_IDS.CODE_QUALITY ? 'rotate-0' : 'rotate-180'}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5 5 1 1 5"/>
                            </svg>
                        </button>
                    </h2>
                    {/* Added bg-gray-100 when open, and increased text size on the <p> tag */}
                    <div
                        id={`body-${ACCORDION_IDS.CODE_QUALITY}`}
                        className={`${openAccordionId === ACCORDION_IDS.CODE_QUALITY ? 'bg-gray-100' : 'hidden'} p-5 border border-b-0 border-gray-200 dark:border-gray-700 dark:bg-gray-900`}
                        aria-labelledby={`heading-${ACCORDION_IDS.CODE_QUALITY}`}
                    >
                        {/* evaluationDetails must be defined and accessible */}
                        <p className="mb-2 text-base text-gray-500 dark:text-gray-400">{evaluationDetails.code_quality_and_structure}</p>
                    </div>

                    {/* Programming Language Proficiency Accordion Item */}
                    <h2 id={`heading-${ACCORDION_IDS.LANGUAGE_PROFICIENCY}`}>
                        <button
                            type="button"
                            className="flex items-center justify-between w-full p-5 font-medium text-lg rtl:text-right text-gray-500 border border-b-0 border-gray-200 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3"
                            onClick={() => toggleAccordion(ACCORDION_IDS.LANGUAGE_PROFICIENCY)}
                            aria-expanded={openAccordionId === ACCORDION_IDS.LANGUAGE_PROFICIENCY}
                            aria-controls={`body-${ACCORDION_IDS.LANGUAGE_PROFICIENCY}`}
                        >
                            <span>Programming Language Proficiency</span>
                            <svg className={`w-3 h-3 shrink-0 ${openAccordionId === ACCORDION_IDS.LANGUAGE_PROFICIENCY ? 'rotate-0' : 'rotate-180'}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5 5 1 1 5"/>
                            </svg>
                        </button>
                    </h2>
                    {/* Added bg-gray-100 when open, and increased text size on the <p> tag */}
                    <div
                        id={`body-${ACCORDION_IDS.LANGUAGE_PROFICIENCY}`}
                        className={`${openAccordionId === ACCORDION_IDS.LANGUAGE_PROFICIENCY ? 'bg-gray-100' : 'hidden'} p-5 border border-b-0 border-gray-200 dark:border-gray-700 dark:bg-gray-900`}
                        aria-labelledby={`heading-${ACCORDION_IDS.LANGUAGE_PROFICIENCY}`}
                    >
                        {/* evaluationDetails must be defined and accessible */}
                        <p className="mb-2 text-base text-gray-500 dark:text-gray-400">{evaluationDetails.programming_language_proficiency}</p>
                    </div>

                    {/* Technical Communication Accordion Item */}
                    <h2 id={`heading-${ACCORDION_IDS.COMMUNICATION}`}>
                        <button
                            type="button"
                            className="flex items-center justify-between w-full p-5 font-medium text-lg rtl:text-right text-gray-500 border border-b-0 border-gray-200 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3"
                            onClick={() => toggleAccordion(ACCORDION_IDS.COMMUNICATION)}
                            aria-expanded={openAccordionId === ACCORDION_IDS.COMMUNICATION}
                            aria-controls={`body-${ACCORDION_IDS.COMMUNICATION}`}
                        >
                            <span>Technical Communication Effectiveness</span>
                            <svg className={`w-3 h-3 shrink-0 ${openAccordionId === ACCORDION_IDS.COMMUNICATION ? 'rotate-0' : 'rotate-180'}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5 5 1 1 5"/>
                            </svg>
                        </button>
                    </h2>
                    {/* Added bg-gray-100 when open, and increased text size on the <p> tag */}
                    <div
                        id={`body-${ACCORDION_IDS.COMMUNICATION}`}
                        className={`${openAccordionId === ACCORDION_IDS.COMMUNICATION ? 'bg-gray-100' : 'hidden'} p-5 border border-b-0 border-gray-200 dark:border-gray-700 dark:bg-gray-900`}
                        aria-labelledby={`heading-${ACCORDION_IDS.COMMUNICATION}`}
                    >
                        {/* evaluationDetails must be defined and accessible */}
                        <p className="mb-2 text-base text-gray-500 dark:text-gray-400">{evaluationDetails.technical_communication_effectiveness}</p>
                    </div>

                    {/* Final Solution Effectiveness Accordion Item */}
                    <h2 id={`heading-${ACCORDION_IDS.SOLUTION_EFFECTIVENESS}`}>
                        <button
                            type="button"
                            className="flex items-center justify-between w-full p-5 font-medium text-lg rtl:text-right text-gray-500 border border-gray-200 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 gap-3"
                            onClick={() => toggleAccordion(ACCORDION_IDS.SOLUTION_EFFECTIVENESS)}
                            aria-expanded={openAccordionId === ACCORDION_IDS.SOLUTION_EFFECTIVENESS}
                            aria-controls={`body-${ACCORDION_IDS.SOLUTION_EFFECTIVENESS}`}
                        >
                            <span>Final Solution Effectiveness</span>
                            <svg className={`w-3 h-3 shrink-0 ${openAccordionId === ACCORDION_IDS.SOLUTION_EFFECTIVENESS ? 'rotate-0' : 'rotate-180'}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5 5 1 1 5"/>
                            </svg>
                        </button>
                    </h2>
                    {/* Added bg-gray-100 when open, and increased text size on the <p> tag */}
                    <div
                        id={`body-${ACCORDION_IDS.SOLUTION_EFFECTIVENESS}`}
                        className={`${openAccordionId === ACCORDION_IDS.SOLUTION_EFFECTIVENESS ? 'bg-gray-100' : 'hidden'} p-5 border border-t-0 border-gray-200 dark:border-gray-700 dark:bg-gray-900`}
                        aria-labelledby={`heading-${ACCORDION_IDS.SOLUTION_EFFECTIVENESS}`}
                    >
                        {/* evaluationDetails must be defined and accessible */}
                        <p className="mb-2 text-base text-gray-500 dark:text-gray-400">{evaluationDetails.final_solution_effectiveness}</p>
                    </div>


                    {/* This div contains the scores, which aren't part of the accordion structure */}
                    <div className='mt-8'> {/* Added margin-top for separation */}
                        <h2 className="text-2xl font-semibold mb-3 text-purple-500">Scores:</h2>
                        <div className=" bg-slate-950 shadow-[0px_0px_6px_0px_#9f7aea] text-gray-200 p-6 rounded-lg shadow-lg">
                             {/* scores, getLinearProgressColorClass must be defined and accessible */}
                            {/* Individual Score with Linear Progress Bar */}
                            <div className="mb-4">
                                <div className="flex justify-between mb-1 text-gray-200 text-sm">
                                    <span><strong>Communication:</strong> {scores.Communication}</span>
                                    {/* Optional: Display percentage for individual scores */}
                                    {/* <span>{Math.round((Number(scores.Communication.split('/')[0]) / Number(scores.Communication.split('/')[1])) * 100)}%</span> */}
                                </div>
                                <div className="w-full bg-gray-600 rounded-full h-2">
                                    <div
                                        className={`${getLinearProgressColorClass(scores.Communication)} h-2 rounded-full transition-all duration-300`}
                                        style={{ width: `${Math.round((Number(scores.Communication.split('/')[0]) / Number(scores.Communication.split('/')[1])) * 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Individual Score with Linear Progress Bar */}
                            <div className="mb-4">
                                <div className="flex justify-between mb-1 text-gray-200 text-sm">
                                    <span><strong>Problem Solving:</strong> {scores.Problem_Solving}</span>
                                </div>
                                <div className="w-full bg-gray-600 rounded-full h-2">
                                    <div
                                        className={`${getLinearProgressColorClass(scores.Problem_Solving)} h-2 rounded-full transition-all duration-300`}
                                        style={{ width: `${Math.round((Number(scores.Problem_Solving.split('/')[0]) / Number(scores.Problem_Solving.split('/')[1])) * 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Individual Score with Linear Progress Bar */}
                            <div className="mb-4">
                                <div className="flex justify-between mb-1 text-gray-200 text-sm">
                                    <span><strong>Code Quality:</strong> {scores.Code_Quality}</span>
                                </div>
                                <div className="w-full bg-gray-600 rounded-full h-2">
                                    <div
                                        className={`${getLinearProgressColorClass(scores.Code_Quality)} h-2 rounded-full transition-all duration-300`}
                                        style={{ width: `${Math.round((Number(scores.Code_Quality.split('/')[0]) / Number(scores.Code_Quality.split('/')[1])) * 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Individual Score with Linear Progress Bar */}
                            <div className="mb-4">
                                <div className="flex justify-between mb-1 text-gray-200 text-sm">
                                    <span><strong>Overall Performance:</strong> {scores.Overall_Performance}</span>
                                </div>
                                <div className="w-full bg-gray-600 rounded-full h-2">
                                    <div
                                        className={`${getLinearProgressColorClass(scores.Overall_Performance)} h-full rounded-full transition-all duration-300 `}
                                        style={{
                                            width: `${Math.round(
                                                (Number(scores.Overall_Performance.split('/')[0]) /
                                                    Number(scores.Overall_Performance.split('/')[1])) *
                                                100
                                            )}%`,
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Final Grade (no bar needed here) */}
                            <p className='text-3xl'><strong>Final Grade:</strong> {scores.Final_Grade}</p>
                        </div>
                    </div>
                </div>
            </>
        )}
    </div>
</section>
  </>
  );
}