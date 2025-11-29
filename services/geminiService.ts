import { GoogleGenAI } from "@google/genai";
import { Habit, MentalState } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getHabitCoaching = async (
  habits: Habit[],
  mentalState: MentalState[]
): Promise<string> => {
  try {
    // Prepare data summary for the AI
    const habitSummary = habits.map(h => 
      `- ${h.name}: Completed ${h.completed_days.length}/${h.goal} days.`
    ).join('\n');

    const recentMood = mentalState
      .filter(m => m.mood !== null)
      .slice(-3)
      .map(m => `Day ${m.day}: Mood ${m.mood}/10`)
      .join(', ');

    const prompt = `
      You are an expert Habit Coach. Analyze the following habit tracker data for November.
      
      Habit Performance:
      ${habitSummary}

      Recent Mental State:
      ${recentMood}

      Provide a concise, motivating analysis (max 3 sentences). Identify the strongest habit, the one needing most attention, and give one specific actionable tip to improve consistency based on the mental state. 
      Be encouraging but direct.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Keep going! Consistency is key.";
  } catch (error) {
    console.error("Error fetching coaching advice:", error);
    return "Unable to connect to your AI Coach right now. Keep pushing!";
  }
};