import { GoogleGenAI } from "@google/genai";
import { Habit, MentalState } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getCoaching = async (habits: Habit[], mental: MentalState[]): Promise<string> => {
  try {
    const habitSummary = habits.map(h => `${h.name}: ${h.completed_days.length}/${h.goal}`).join(', ');
    const moodSummary = mental.filter(m => m.mood).map(m => `Day ${m.day}: ${m.mood}/10`).join(', ');
    
    const prompt = `You are a strict but encouraging Habit Coach. Data:
    Habits: ${habitSummary}
    Moods: ${moodSummary}
    
    Give 1 short, punchy paragraph of advice. Focus on the link between mood and completion.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Keep pushing forward!";
  } catch (error) {
    console.error("AI Error", error);
    return "Focus on one small win today. You got this.";
  }
};