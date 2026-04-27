const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const getAiSuggestions = async (skillsOffered, skillsWanted) => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a career coach. Return ONLY a JSON array of 5 strings representing trending skills that complement the user's profile."
        },
        {
          role: "user",
          content: `User teaches: ${skillsOffered.join(", ")}. User wants to learn: ${skillsWanted.join(", ")}.`
        }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" } // Groq forces clean JSON
    });

    const data = JSON.parse(completion.choices[0].message.content);
    // If the AI wraps it in a key, extract it; otherwise return the array
    return data.skills || data.suggestions || data;
  } catch (error) {
    console.error("Groq Suggestion Error:", error);
    return ["TypeScript", "System Design", "AWS", "Docker", "GraphQL"]; // Fallback
  }
};

module.exports = { getAiSuggestions };