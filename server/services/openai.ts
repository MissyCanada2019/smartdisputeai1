import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });
const MODEL = "gpt-4o";
const MAX_ATTEMPTS = 3;

async function safeOpenAIRequest<T>(fn: () => Promise<T>, msg: string): Promise<T> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      if (err.message.includes("API key") || err.message.includes("auth")) throw new Error("Authentication error");
      if (err.message.includes("429") || err.message.includes("rate limit")) await new Promise(r => setTimeout(r, 1000 * (2 ** attempt)));
      else throw new Error(`${msg}: ${err.message}`);
    }
  }
  throw new Error(`Failed after ${MAX_ATTEMPTS} attempts`);
}

export async function analyzeDocument(text: string, context = '') {
  return safeOpenAIRequest(async () => {
    const res = await openai.chat.completions.create({
      model: MODEL,
      temperature: 0.2,
      messages: [
        { role: "system", content: `Analyze this legal text. ${context}` },
        { role: "user", content: text.slice(0, 30000) }
      ],
      response_format: { type: "json_object" }
    });
    return JSON.parse(res.choices[0].message.content || "{}");
  }, "Error analyzing text");
}

export async function analyzeImage(base64Image: string, prompt = "Analyze this legal document image") {
  return safeOpenAIRequest(async () => {
    const res = await openai.chat.completions.create({
      model: MODEL,
      temperature: 0.2,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
          ]
        }
      ]
    });
    return { result: res.choices[0].message.content };
  }, "Error analyzing image");
}

export async function generateLegalAdvice(situation: string, documents: any[], province: string) {
  const docs = documents.map(d => `- ${d.filename || "Untitled"}: ${d.content || "No content"}`).join("\n");
  const input = `User situation: ${situation}\nProvince: ${province}\nDocuments:\n${docs}`;

  return safeOpenAIRequest(async () => {
    const res = await openai.chat.completions.create({
      model: MODEL,
      temperature: 0.5,
      messages: [
        { role: "system", content: "Give neutral legal insight (not advice). Format in markdown." },
        { role: "user", content: input }
      ]
    });
    return { result: res.choices[0].message.content };
  }, "Error generating advice");
}

export async function generateLegalDocument(templateType: string, userInputs: any, province: string) {
  const fields = Object.entries(userInputs).map(([k, v]) => `${k}: ${v}`).join('\n');
  const input = `Template: ${templateType}\nProvince: ${province}\nUser Inputs:\n${fields}`;

  return safeOpenAIRequest(async () => {
    const res = await openai.chat.completions.create({
      model: MODEL,
      temperature: 0.3,
      messages: [
        { role: "system", content: "Generate a professional document. Return only the document text." },
        { role: "user", content: input }
      ]
    });
    return { document: res.choices[0].message.content };
  }, "Error generating document");
}

export default {
  analyzeDocument,
  analyzeImage,
  generateLegalAdvice,
  generateLegalDocument
};
