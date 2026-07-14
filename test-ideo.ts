import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

async function run() {
  try {
    const res = await axios.post("https://api.ideogram.ai/generate", {
      image_request: {
        prompt: "A beautiful sunset over the mountains",
        aspect_ratio: "ASPECT_16_9",
        model: "V_2",
        magic_prompt_option: "AUTO"
      }
    }, {
      headers: {
        "Api-Key": process.env.IDEOGRAM_API_KEY || "",
        "Content-Type": "application/json"
      }
    });
    console.log("JSON API Success:", Object.keys(res.data));
    console.log("Images:", res.data.data?.length);
  } catch(e: any) {
    console.log("JSON API Error:", e.response?.data || e.message);
  }
}
run();
