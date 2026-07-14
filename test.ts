import axios from 'axios';
import FormData from 'form-data';

async function test() {
  try {
    const form = new FormData();
    form.append("text_prompt", "A photo of a cat");
    form.append("aspect_ratio", "ASPECT_1_1");
    form.append("magic_prompt_option", "AUTO");

    const res = await axios.post('https://api.ideogram.ai/v1/ideogram-v4/generate', form, {
      headers: {
        'Api-Key': 'fake-key',
        ...form.getHeaders()
      }
    });
    console.log(res.data);
  } catch (err: any) {
    console.error(err.response?.data || err.message);
  }
}

test();
