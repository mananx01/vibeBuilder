// AI Service for generating memes
// Note: In a real application, you would need to integrate with OpenAI API
// This is a simplified version for demonstration purposes

// Simulated AI meme generation
export async function generateAIMeme(topic) {
  // In a real application, you would make API calls to OpenAI for both text and image generation
  // For demo purposes, we're simulating the responses

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Generate a caption based on the topic
  const caption = generateCaption(topic)

  // Generate an image URL (in a real app, this would be from DALL-E or similar)
  const imageUrl = generatePlaceholderImage(topic, caption)

  return {
    caption,
    imageUrl,
  }
}

// Analyze an uploaded image and generate a caption
export async function analyzeImage(imageFile, topic = "") {
  // In a real application, you would use a vision model like GPT-4 with vision
  // For demo purposes, we're simulating the response

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Generate a caption based on the topic
  if (topic) {
    const topicCaptions = [
      `When you try to explain ${topic} to your grandparents`,
      `That moment when ${topic} makes no sense at all`,
      `Me pretending to understand ${topic}`,
      `${topic} experts vs. ${topic} beginners`,
      `When someone mentions ${topic} at a party`,
      `My face when I realize I've been doing ${topic} wrong the whole time`,
    ]
    return topicCaptions[Math.floor(Math.random() * topicCaptions.length)]
  }

  // Generate a random caption (in a real app, this would be from the vision model)
  const captions = [
    "When you finally understand the code you wrote last week",
    "That moment when you realize it's not a bug, it's a feature",
    "Me explaining to my cat why I need to finish this project",
    "When someone asks if you can add 'one small feature'",
    "How I look waiting for npm install to finish",
    "When the client says 'make it pop more'",
    "My face when the code works on the first try",
    "When you find the missing semicolon after 2 hours",
  ]

  return captions[Math.floor(Math.random() * captions.length)]
}

// Helper function to generate a caption
function generateCaption(topic) {
  const templates = [
    `When ${topic} is life but reality hits hard`,
    `Nobody: \nAbsolutely nobody: \nMe with ${topic}:`,
    `${topic} expectations vs reality`,
    `That moment when ${topic} makes perfect sense`,
    `${topic}? More like ${scrambleWord(topic)}!`,
    `Me trying to explain ${topic} to my parents`,
    `Day 1 of ${topic} vs Day 30`,
    `${topic} has entered the chat`,
  ]

  return templates[Math.floor(Math.random() * templates.length)]
}

// Helper function to scramble a word for humor
function scrambleWord(word) {
  return word
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("")
}

// Generate a placeholder image (in a real app, this would be from DALL-E or similar)
function generatePlaceholderImage(topic, caption) {
  // Create a canvas to generate a placeholder image
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  canvas.width = 800
  canvas.height = 600

  // Draw background
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  gradient.addColorStop(0, getRandomColor())
  gradient.addColorStop(1, getRandomColor())
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Draw topic text
  ctx.font = "bold 48px Arial"
  ctx.fillStyle = "white"
  ctx.textAlign = "center"
  ctx.fillText(topic, canvas.width / 2, canvas.height / 2)

  // Draw caption
  ctx.font = "bold 36px Impact"
  ctx.fillStyle = "white"
  ctx.strokeStyle = "black"
  ctx.lineWidth = 2

  // Split caption into lines if it's too long
  const maxWidth = canvas.width - 40
  const words = caption.split(" ")
  const lines = []
  let currentLine = words[0]

  for (let i = 1; i < words.length; i++) {
    const testLine = currentLine + " " + words[i]
    const metrics = ctx.measureText(testLine)

    if (metrics.width > maxWidth) {
      lines.push(currentLine)
      currentLine = words[i]
    } else {
      currentLine = testLine
    }
  }
  lines.push(currentLine)

  // Draw the caption at the bottom of the image
  const lineHeight = 40
  const y = canvas.height - lines.length * lineHeight - 20

  lines.forEach((line, index) => {
    const lineY = y + index * lineHeight
    ctx.strokeText(line, canvas.width / 2, lineY)
    ctx.fillText(line, canvas.width / 2, lineY)
  })

  // Return the data URL
  return canvas.toDataURL("image/png")
}

// Helper function to generate random colors
function getRandomColor() {
  const letters = "0123456789ABCDEF"
  let color = "#"
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}
