const Groq = require("groq-sdk");
// Ensure your API key is being read
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const generateSkillQuiz = async (skills) => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a technical interviewer. Return ONLY a JSON object: { \"questions\": [\"q1\", \"q2\", \"q3\"] }"
        },
        { role: "user", content: `Generate 3 questions for: ${skills.join(", ")}` }
      ],
      model: "llama-3.3-70b-versatile",
      // Important: Ensure the prompt explicitly asks for JSON when using this flag
      response_format: { type: "json_object" }
    });

    const rawContent = completion.choices[0]?.message?.content;
    const data = JSON.parse(rawContent);
    
    // Return the array specifically
    return data.questions || ["Explain the event loop.", "What is JSX?", "Define Middleware."];
  } catch (error) {
    console.error("Groq Quiz Error:", error.message);
    return ["Explain the concept of Middleware.", "How do you handle state in large apps?", "What is the difference between SQL and NoSQL?"];
  }
};

const verifyAnswers = async (questions, answers) => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Grade these answers. Return JSON: { \"status\": \"VERIFIED\" } or { \"status\": \"FAILED\" }."
        },
        { role: "user", content: `Questions: ${JSON.stringify(questions)}. User Answers: ${JSON.stringify(answers)}` }
      ],
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" }
    });

    const data = JSON.parse(completion.choices[0]?.message?.content);
    return data;
  } catch (error) {
    console.error("Groq Verification Error:", error.message);
    return { status: "FAILED" };
  }
};

module.exports = { generateSkillQuiz, verifyAnswers };