import { Configuration, OpenAIApi } from "openai";

let openai:OpenAIApi | null = null;
if (process.env.OPENAI_API_KEY) {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  openai = new OpenAIApi(configuration);  
}

const creteThankYouNote = async (question: string, answer: string) => {
  if(openai) {
    const completion = await openai.createCompletion({
      max_tokens: 64,
      temperature: 0.9,
      model: "text-davinci-003",
      prompt: `Give a short snarky thank you to a person registering a vote in a poll.\nQuestion was: ${question}\nAnswer was: ${answer}`,
    });
    return completion.data.choices[0].text?.replace(/^"/m, "").replace(/"$/m, "");  
  }
  return "Thank you for voting!"
}

export default creteThankYouNote;
