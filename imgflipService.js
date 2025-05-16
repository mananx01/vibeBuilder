// Imgflip API service
// Note: In a production app, you would need to handle authentication securely
// This is a simplified version for demonstration purposes

const IMGFLIP_API_URL = "https://api.imgflip.com"

// Fetch available meme templates
export async function fetchTemplates() {
  try {
    const response = await fetch(`${IMGFLIP_API_URL}/get_memes`)
    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error_message || "Failed to fetch templates")
    }

    return data.data.memes.map((meme) => ({
      id: meme.id,
      name: meme.name,
      url: meme.url,
      width: meme.width,
      height: meme.height,
      box_count: meme.box_count,
    }))
  } catch (error) {
    console.error("Error fetching templates:", error)
    throw error
  }
}

// Generate a meme using Imgflip API
export async function generateMeme(templateId, topText, bottomText) {
  // In a real application, you would need to securely handle these credentials
  // For demo purposes, we're simulating the API response

  // Normally, you would make an API call like this:
  /*
    const formData = new FormData();
    formData.append('template_id', templateId);
    formData.append('username', YOUR_IMGFLIP_USERNAME);
    formData.append('password', YOUR_IMGFLIP_PASSWORD);
    formData.append('text0', topText);
    formData.append('text1', bottomText);
    
    const response = await fetch(`${IMGFLIP_API_URL}/caption_image`, {
        method: 'POST',
        body: formData
    });
    
    const data = await response.json();
    
    if (!data.success) {
        throw new Error(data.error_message || 'Failed to generate meme');
    }
    
    return data.data.url;
    */

  // For this demo, we'll simulate the API response by creating a canvas
  return new Promise((resolve) => {
    // Find the template
    fetch(`${IMGFLIP_API_URL}/get_memes`)
      .then((response) => response.json())
      .then((data) => {
        const template = data.data.memes.find((meme) => meme.id === templateId)
        if (!template) {
          throw new Error("Template not found")
        }

        // Create a canvas to generate the meme
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height

          // Draw the image
          ctx.drawImage(img, 0, 0)

          // Add the text
          ctx.font = "bold 36px Impact"
          ctx.fillStyle = "white"
          ctx.strokeStyle = "black"
          ctx.lineWidth = 2
          ctx.textAlign = "center"

          // Top text
          if (topText) {
            const topY = 50
            ctx.strokeText(topText, canvas.width / 2, topY)
            ctx.fillText(topText, canvas.width / 2, topY)
          }

          // Bottom text
          if (bottomText) {
            const bottomY = canvas.height - 30
            ctx.strokeText(bottomText, canvas.width / 2, bottomY)
            ctx.fillText(bottomText, canvas.width / 2, bottomY)
          }

          // Convert canvas to image URL
          const memeUrl = canvas.toDataURL("image/png")
          resolve(memeUrl)
        }

        img.src = template.url
      })
      .catch((error) => {
        console.error("Error generating meme:", error)
        throw error
      })
  })
}
