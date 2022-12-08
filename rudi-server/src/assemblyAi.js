import { ASSEMBLY_AI_API_KEY, ASSEMBLY_AI_API_URL } from "./config.js";
import axios from "axios";

async function getUploadUrl(audioData) {
  const headers = {
    authorization: ASSEMBLY_AI_API_KEY,
    "content-type": "application/json",
    "transfer-encoding": "chunked",
  };
  const assembly = axios.create({
    baseURL: ASSEMBLY_AI_API_URL,
    headers,
  });
  return assembly.post("/upload", audioData);
}

async function pollStatus(id) {
  const headers = {
    authorization: ASSEMBLY_AI_API_KEY,
  };
  const assembly = axios.create({
    baseURL: ASSEMBLY_AI_API_URL,
    headers,
  });
  for (;;) {
    const response = await assembly.get(`/transcript/${id}`);
    const { status } = response.data;
    if (status === "completed") {
      return response.data.text;
    }
    if (status === "error") {
      throw new Error(response.data.error);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

export async function transcript(audioData) {
  if (!audioData) {
    throw new Error("No audio data provided");
  }
  const respone = await getUploadUrl(audioData);
  const uploadUrl = respone.data.upload_url;
  if (!uploadUrl) {
    throw new Error("Failed to get upload url");
  }
  const headers = {
    authorization: ASSEMBLY_AI_API_KEY,
    "content-type": "application/json",
  };

  const body = {
    audio_url: uploadUrl,
  };

  const assembly = axios.create({
    baseURL: ASSEMBLY_AI_API_URL,
    headers,
  });

  const response = await assembly.post("/transcript", body);
  return pollStatus(response.data.id);
}
