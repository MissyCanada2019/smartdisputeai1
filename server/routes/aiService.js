// server/services/aiService.js

export async function getStatus() {
  return {
    status: "ok",
    services: ["chat", "analyzeText", "generateResponse", "analyzeImage"]
  };
}

export async function analyzeText(text, province = "ON") {
  return {
    result: `Analyzed text for province ${province}: ${text}`,
    serviceName: "DummyAI",
    modelName: "basic-analyzer"
  };
}

export async function generateResponse(analysisResult, originalText, userInfo, province = "ON") {
  return {
    result: `Generated response based on: ${originalText}`,
    serviceName: "DummyAI",
    modelName: "basic-generator"
  };
}

export async function chat(message) {
  return {
    result: `AI says: ${message}`,
    serviceName: "DummyAI",
    modelName: "basic-chat"
  };
}

export async function analyzeImage(base64Image) {
  return {
    result: `Analyzed image of length ${base64Image.length}`,
    serviceName: "DummyAI",
    modelName: "vision-analyzer"
  };
}
