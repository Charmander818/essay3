
import { GoogleGenAI, Type } from "@google/genai";
import { Question, ClozeBlank, ClozeFeedback } from "../types";

// Basic check for API key existence
const apiKey = process.env.API_KEY;

let ai: GoogleGenAI;
if (apiKey) {
    ai = new GoogleGenAI({ apiKey: apiKey });
} else {
    console.warn("API_KEY is missing. AI features will not work until configured.");
}

const checkForApiKey = () => {
    if (!apiKey) {
        throw new Error("API Key is missing. Please go to Vercel Settings -> Environment Variables and add API_KEY.");
    }
};

export const generateModelAnswer = async (question: Question): Promise<string> => {
  try {
    checkForApiKey();
    
    const prompt = `
      You are a world-class Cambridge International AS Level Economics teacher.
      Write a model essay answer for the following question.
      
      **Question:** ${question.questionText}
      **Max Marks:** ${question.maxMarks}
      **Mark Scheme Requirements:**
      ${question.markScheme}
      
      **Instructions:**
      - **Structure the essay strictly** using the following headers (in bold):
      
      **[AO1: Knowledge & Understanding]**
      - Define key terms clearly.
      - Describe any diagrams if required (e.g. "A diagram would show...").
      
      **[AO2: Analysis]**
      - Write **2-3 distinct paragraphs**. 
      - Each paragraph should develop a separate analytical point with a complete logical chain (Cause -> Effect -> Consequence).
      - Ensure logical links are explicit.
      
      **[AO3: Evaluation]**
      - Write **1-2 distinct paragraphs**.
      - Evaluate the extent, significance, or likelihood (e.g., Short run vs Long run, Elasticity, Magnitude).
      
      - Use precise economic terminology.
      - The tone should be academic and exam-focused.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Error generating response.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message.includes("API Key")) {
        return "Error: API Key is missing in Vercel Settings. Please configure it and redeploy.";
    }
    return "Failed to generate essay. Please check API key or try again.";
  }
};

export const gradeEssay = async (question: Question, studentEssay: string, imageBase64?: string): Promise<string> => {
  try {
    checkForApiKey();

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

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: parts },
    });
    return response.text || "Error grading essay.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message.includes("API Key")) {
        return "Error: API Key is missing in Vercel Settings.";
    }
    return "Failed to grade essay. Please check API key.";
  }
};

export const getRealTimeCoaching = async (question: Question, currentText: string): Promise<{scoreEstimate: string, advice: string}> => {
  try {
    checkForApiKey();

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
    return { scoreEstimate: "...", advice: "Check API Key" };
  }
};

export const generateClozeExercise = async (modelEssay: string): Promise<{ textWithBlanks: string, blanks: ClozeBlank[] } | null> => {
  try {
    checkForApiKey();

    const prompt = `
      You are an expert Economics teacher creating a "Logic Chain" completion exercise.
      Take the provided model essay and create a fill-in-the-blank (cloze) test to train students on precision and logic.

      **Instructions:**
      1. Identify **8 to 12** critical parts to remove across the essay.
      2. Target these specific areas:
         - **AO1 (Knowledge):** Remove 2-3 key definitions or technical terms (e.g., "opportunity cost", "non-rival").
         - **AO2 (Analysis):** Remove 4-6 parts of the logical chain. Target the connecting phrases or the middle step of a chain (e.g., "this signals producers to...", "causing a contraction in...").
         - **AO3 (Evaluation):** Remove 2-3 evaluative qualifiers (e.g., "however, in the short run", "depends on the magnitude of").
      3. Replace these parts with the placeholder format: [BLANK_1], [BLANK_2], etc.
      4. Return the modified text and the list of removed sentences/clauses.
      5. For each blank, provide a specific "hint" (e.g., "Missing logical step", "Evaluation factor", "Definition", "Effect on price").
      6. **IMPORTANT:** Preserve the paragraph structure (newlines) of the original essay.
      
      **Input Essay:**
      ${modelEssay}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            textWithBlanks: { type: Type.STRING },
            blanks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  original: { type: Type.STRING },
                  hint: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const json = JSON.parse(response.text || "{}");
    return {
      textWithBlanks: json.textWithBlanks,
      blanks: json.blanks
    };
  } catch (error) {
    console.error("Cloze Generation Error:", error);
    return null;
  }
};

export const evaluateClozeAnswers = async (
  blanks: ClozeBlank[],
  userAnswers: Record<number, string>
): Promise<Record<number, ClozeFeedback> | null> => {
  
  try {
    checkForApiKey();

    const comparisons = blanks.map(b => ({
      id: b.id,
      original: b.original,
      studentAnswer: userAnswers[b.id] || "(No answer)"
    }));

    const prompt = `
      Grade the student's answers for a fill-in-the-blank Economics exercise.
      
      **Data:**
      ${JSON.stringify(comparisons)}

      **Instructions:**
      For each item:
      1. Compare the Student Answer to the Original.
      2. Give a score (1-5), where 5 is "Perfectly captures the logic/meaning" (exact wording not required), and 1 is "Incorrect logic".
      3. Provide a brief, 1-sentence comment correcting the logic if needed.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            feedback: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  score: { type: Type.INTEGER },
                  comment: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const json = JSON.parse(response.text || "{}");
    const feedbackMap: Record<number, ClozeFeedback> = {};
    
    if (json.feedback && Array.isArray(json.feedback)) {
      json.feedback.forEach((item: any) => {
        feedbackMap[item.id] = {
          score: item.score,
          comment: item.comment
        };
      });
    }
    
    return feedbackMap;

  } catch (error) {
    console.error("Cloze Evaluation Error:", error);
    return null;
  }
};
