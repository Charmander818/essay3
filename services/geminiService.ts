
import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateModelAnswer = async (question: Question): Promise<string> => {
  const prompt = `
    You are a world-class Cambridge International AS Level Economics teacher.
    Write a model essay answer for the following question.
    
    **Question:** ${question.questionText}
    **Max Marks:** ${question.maxMarks}
    **Mark Scheme Requirements:**
    ${question.markScheme}
    
    **Instructions:**
    - Expand strictly upon the mark scheme points to create a full, well-structured essay.
    - Use economic terminology precisely.
    - If the question asks for a diagram, describe the diagram clearly in text (e.g., "A diagram would show...").
    - For 8-mark questions, ensure a 3/3/2 split (Knowledge/Analysis/Evaluation).
    - For 12-mark questions, ensure an 8/4 split (Analysis/Evaluation).
    - The tone should be academic and exam-focused.
    - Format with clear paragraphs.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Error generating response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate essay. Please check API key or try again.";
  }
};

export const gradeEssay = async (question: Question, studentEssay: string, imageBase64?: string): Promise<string> => {
  const parts: any[] = [];
  
  let essayContentText = studentEssay;

  if (imageBase64) {
     // Clean base64 string if it has data prefix
     const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
     
     parts.push({
        inlineData: {
           mimeType: 'image/jpeg', // Assuming jpeg for simplicity, Gemini is flexible
           data: cleanBase64
        }
     });
     essayContentText = "See attached image for the student's handwritten essay.";
  }

  const prompt = `
    You are a strict Cambridge International AS Level Economics examiner.
    Grade the following student essay based *strictly* on the provided mark scheme.

    **Question:** ${question.questionText}
    **Max Marks:** ${question.maxMarks}
    **Mark Scheme:**
    ${question.markScheme}

    **Student Essay:**
    ${essayContentText}

    **Instructions:**
    - If an image is provided, transcribe the handwriting internally and then grade it.
    - Provide a score out of ${question.maxMarks}.
    - Provide a breakdown: 
      - Knowledge & Understanding (AO1)
      - Analysis (AO2)
      - Evaluation (AO3)
    - Provide specific feedback on what was good and what was missing based on the mark scheme.
    - Be constructive but realistic.
  `;

  parts.push({ text: prompt });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: parts },
    });
    return response.text || "Error grading essay.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to grade essay. Please check API key.";
  }
};

export const getRealTimeCoaching = async (question: Question, currentText: string): Promise<{scoreEstimate: string, advice: string}> => {
  const prompt = `
    You are a helpful Economics tutor watching a student write an essay in real-time.
    
    **Question:** ${question.questionText}
    **Mark Scheme:** ${question.markScheme}
    **Current Draft:** "${currentText}"

    **Task:**
    1. Estimate the current mark range (e.g., "2-3 marks").
    2. Provide ONE specific, actionable tip to get the *next* mark based on the Mark Scheme. Do not give the whole answer, just a nudge.
    3. Keep it brief (under 50 words).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scoreEstimate: { type: Type.STRING },
            advice: { type: Type.STRING }
          },
          propertyOrdering: ["scoreEstimate", "advice"]
        }
      }
    });
    
    const json = JSON.parse(response.text || "{}");
    return {
        scoreEstimate: json.scoreEstimate || "Unknown",
        advice: json.advice || "Keep writing..."
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { scoreEstimate: "...", advice: "Analyzing..." };
  }
};
