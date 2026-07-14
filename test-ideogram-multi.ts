import axios from 'axios';

async function test() {
  try {
    const res = await axios.post('https://api.ideogram.ai/generate', {
      image_request: {
        prompt: "A beautiful sunset",
        aspect_ratio: "ASPECT_1_1",
        model: "V_2",
        num_images: 3,
        magic_prompt_option: "AUTO"
      }
    }, {
      headers: {
        'Api-Key': 'UseZ10RT5rsI-x5MAyo_q7WGrDS3SXZPYFsjgLEmJrCBDinAaoQDSoqyjUAHgIxjSXdsp1AcYeejUMLsGN_eRQ',
        'Content-Type': 'application/json'
      }
    });
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err: any) {
    console.error(err.response?.data || err.message);
  }
}
test();
