import express from "express";
import { transcript } from "./assemblyAi.js";

const app = express();
app.use(express.raw({ limit: "50mb" }));

app.get("/", (req, res) => {
  res.status(200).send("Service is running");
});

function transformAudio(audio) {
  return audio;
}

app.post("/stt", async (req, res) => {
  // req.body buffer to utf8 string
  const audio = req.body;
  const transformedAudio = transformAudio(audio);
  try {
    const text = await transcript(transformedAudio);
    res.status(200).send(text);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
