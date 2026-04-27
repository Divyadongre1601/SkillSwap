const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Changed name to getAiSkillSuggestions to match your route import
const getAiSkillSuggestions = async (skillsOffered, skillsWanted) => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a career coach. Return a JSON object with a key 'skills' containing an array of 5 trending strings."
        },
        {
          role: "user",
          content: `User teaches: ${skillsOffered.join(", ")}. User wants to learn: ${skillsWanted.join(", ")}.`
        }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" } 
    });

    const data = JSON.parse(completion.choices[0].message.content);
    
    // Since we used json_object, we look for the 'skills' key we defined in the system prompt
    return data.skills || data.suggestions || (Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Groq Suggestion Error:", error);
    return ["TypeScript", "System Design", "AWS", "Docker", "GraphQL"];
  }
};

module.exports = { getAiSkillSuggestions }; // Match this name