export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }

    try {
      if (request.method !== 'POST') {
        throw new Error('Expected POST');
      }

      const formData = await request.formData();
      const prompt = formData.get('prompt');
      let image = formData.get('image');

      if (!prompt || !image) {
        throw new Error('Missing prompt or image');
      }

      // Convert the image to the format expected by the model
      const imageByteArray = await image.arrayBuffer();
      const imageData = [...new Uint8Array(imageByteArray)];

      const generationInputs = {
        prompt: prompt,
        image: imageData,
        strength: 0.7, // Controls how much to follow the input image (0.0 = ignore image, 1.0 = follow image closely)
        num_steps: 20, // Number of denoising steps
        guidance: 7.5, // How closely to follow the prompt
      };

      const response = await env.AI.run(
        '@cf/runwayml/stable-diffusion-v1-5-img2img',
        generationInputs
      );

      return new Response(response, {
        headers: {
          'Content-Type': 'image/png',
          'Access-Control-Allow-Origin': '*', // Allow any origin
        },
      });

    } catch (e) {
      console.error(e);
      return new Response(e.stack || e.toString(), {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*', // Allow any origin
        },
      });
    }
  },
};

function handleOptions(request) {
  const headers = request.headers;
  if (
    headers.get('Origin') !== null &&
    headers.get('Access-Control-Request-Method') !== null &&
    headers.get('Access-Control-Request-Headers') !== null
  ) {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
  return new Response(null, {
    headers: {
      Allow: 'POST, GET, OPTIONS',
    },
  });
} 