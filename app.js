import { fetchTemplates, generateMeme } from "./imgflipService.js"
import { generateAIMeme, analyzeImage } from "./aiService.js"
import { initCanvas, addTextToCanvas, updateSelectedText } from "./canvasEditor.js"

// DOM Elements
const tabButtons = document.querySelectorAll(".tab-btn")
const tabContents = document.querySelectorAll(".tab-content")
const templateSelect = document.getElementById("template-select")
const topTextInput = document.getElementById("top-text")
const bottomTextInput = document.getElementById("bottom-text")
const generateTemplateBtn = document.getElementById("generate-template-meme")
const templatePreview = document.getElementById("template-preview")
const aiModeRadios = document.querySelectorAll('input[name="ai-mode"]')
const textPromptInputs = document.getElementById("text-prompt-inputs")
const imagePromptInputs = document.getElementById("image-prompt-inputs")
const aiTopicInput = document.getElementById("ai-topic")
const referenceImageInput = document.getElementById("reference-image")
const generateAIBtn = document.getElementById("generate-ai-meme")
const aiPreview = document.getElementById("ai-preview")
const aiLoading = document.getElementById("ai-loading")
const customImageInput = document.getElementById("custom-image")
const textEditor = document.getElementById("text-editor")
const canvasControls = document.getElementById("canvas-controls")
const customTextInput = document.getElementById("custom-text")
const addTextBtn = document.getElementById("add-text-btn")
const fontSizeInput = document.getElementById("font-size")
const fontSizeValue = document.getElementById("font-size-value")
const fontColorInput = document.getElementById("font-color")
const strokeColorInput = document.getElementById("stroke-color")
const textStrokeCheckbox = document.getElementById("text-stroke")
const clearCanvasBtn = document.getElementById("clear-canvas")
const removeSelectedBtn = document.getElementById("remove-selected")
const canvasPlaceholder = document.getElementById("canvas-placeholder")
const downloadSection = document.getElementById("download-section")
const downloadBtn = document.getElementById("download-meme")
const createNewBtn = document.getElementById("create-new")

// State
let currentMeme = null
let templates = []
let currentTemplate = null

// Initialize the application
async function init() {
  setupEventListeners()
  await loadTemplates()
  initCanvas()
}

// Set up event listeners
function setupEventListeners() {
  // Tab navigation
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      tabButtons.forEach((btn) => btn.classList.remove("active"))
      tabContents.forEach((content) => content.classList.remove("active"))

      button.classList.add("active")
      const tabId = button.dataset.tab
      document.getElementById(`${tabId}-section`).classList.add("active")
    })
  })

  // Template meme generation
  generateTemplateBtn.addEventListener("click", handleTemplateGeneration)

  // AI mode selection
  aiModeRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      const mode = radio.value
      if (mode === "text") {
        textPromptInputs.classList.remove("hidden")
        imagePromptInputs.classList.add("hidden")
      } else {
        textPromptInputs.classList.add("hidden")
        imagePromptInputs.classList.remove("hidden")
      }
    })
  })

  // AI meme generation
  generateAIBtn.addEventListener("click", handleAIGeneration)

  // Custom meme creation
  customImageInput.addEventListener("change", handleCustomImageUpload)
  addTextBtn.addEventListener("click", handleAddText)
  fontSizeInput.addEventListener("input", updateFontSizeValue)
  clearCanvasBtn.addEventListener("click", handleClearCanvas)
  removeSelectedBtn.addEventListener("click", handleRemoveSelected)

  // Download and create new
  downloadBtn.addEventListener("click", handleDownload)
  createNewBtn.addEventListener("click", handleCreateNew)
}

// Load meme templates from Imgflip API
async function loadTemplates() {
  try {
    templates = await fetchTemplates()
    populateTemplateSelect(templates)
  } catch (error) {
    console.error("Error loading templates:", error)
    templateSelect.innerHTML = '<option value="">Error loading templates</option>'
  }
}

// Populate template dropdown
function populateTemplateSelect(templates) {
  templateSelect.innerHTML = ""

  const defaultOption = document.createElement("option")
  defaultOption.value = ""
  defaultOption.textContent = "Select a template"
  templateSelect.appendChild(defaultOption)

  templates.forEach((template) => {
    const option = document.createElement("option")
    option.value = template.id
    option.textContent = template.name
    templateSelect.appendChild(option)
  })

  // Add change event listener
  templateSelect.addEventListener("change", handleTemplateChange)
}

// Handle template selection change
function handleTemplateChange() {
  const templateId = templateSelect.value
  if (!templateId) return

  currentTemplate = templates.find((t) => t.id === templateId)

  // Show template preview
  templatePreview.innerHTML = ""
  const img = document.createElement("img")
  img.src = currentTemplate.url
  img.alt = currentTemplate.name
  templatePreview.appendChild(img)
}

// Handle template meme generation
async function handleTemplateGeneration() {
  if (!currentTemplate) {
    alert("Please select a template first")
    return
  }

  const topText = topTextInput.value
  const bottomText = bottomTextInput.value

  try {
    const memeUrl = await generateMeme(currentTemplate.id, topText, bottomText)
    displayGeneratedMeme(memeUrl)
  } catch (error) {
    console.error("Error generating meme:", error)
    alert("Failed to generate meme. Please try again.")
  }
}

// Handle AI meme generation
async function handleAIGeneration() {
  const mode = document.querySelector('input[name="ai-mode"]:checked').value

  if (mode === "text") {
    const topic = aiTopicInput.value.trim()
    if (!topic) {
      alert("Please enter a topic or idea")
      return
    }

    aiLoading.classList.remove("hidden")

    try {
      const memeData = await generateAIMeme(topic)
      displayAIMeme(memeData)
    } catch (error) {
      console.error("Error generating AI meme:", error)
      alert("Failed to generate AI meme. Please try again.")
    } finally {
      aiLoading.classList.add("hidden")
    }
  } else {
    if (!referenceImageInput.files[0]) {
      alert("Please upload a reference image")
      return
    }

    aiLoading.classList.remove("hidden")

    try {
      const file = referenceImageInput.files[0]
      const imageUrl = URL.createObjectURL(file)
      const caption = await analyzeImage(file)

      // Display the image with the generated caption
      displayAIMemeWithCaption(imageUrl, caption)
    } catch (error) {
      console.error("Error analyzing image:", error)
      alert("Failed to analyze image. Please try again.")
    } finally {
      aiLoading.classList.add("hidden")
    }
  }
}

// Handle custom image upload
function handleCustomImageUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      initCanvas(img)
      textEditor.classList.remove("hidden")
      canvasControls.classList.remove("hidden")
      canvasPlaceholder.classList.add("hidden")
    }
    img.src = e.target.result
  }
  reader.readAsDataURL(file)
}

// Handle adding text to canvas
function handleAddText() {
  const text = customTextInput.value.trim()
  if (!text) return

  const fontSize = Number.parseInt(fontSizeInput.value)
  const fontColor = fontColorInput.value
  const strokeColor = strokeColorInput.value
  const useStroke = textStrokeCheckbox.checked

  addTextToCanvas(text, {
    fontSize,
    fontColor,
    strokeColor,
    useStroke,
  })

  customTextInput.value = ""
}

// Update font size value display
function updateFontSizeValue() {
  fontSizeValue.textContent = `${fontSizeInput.value}px`
  updateSelectedText({
    fontSize: Number.parseInt(fontSizeInput.value),
    fontColor: fontColorInput.value,
    strokeColor: strokeColorInput.value,
    useStroke: textStrokeCheckbox.checked,
  })
}

// Handle clear canvas button
function handleClearCanvas() {
  if (confirm("Are you sure you want to clear all text from the canvas?")) {
    initCanvas()
  }
}

// Handle remove selected text
function handleRemoveSelected() {
  // This function is implemented in canvasEditor.js
}

// Display generated meme
function displayGeneratedMeme(memeUrl) {
  currentMeme = memeUrl

  // Display in preview
  templatePreview.innerHTML = ""
  const img = document.createElement("img")
  img.src = memeUrl
  img.alt = "Generated Meme"
  templatePreview.appendChild(img)

  // Show download section
  downloadSection.classList.remove("hidden")
}

// Display AI generated meme
function displayAIMeme(memeData) {
  currentMeme = memeData.imageUrl

  // Display in preview
  aiPreview.innerHTML = ""
  const img = document.createElement("img")
  img.src = memeData.imageUrl
  img.alt = memeData.caption || "AI Generated Meme"
  aiPreview.appendChild(img)

  // Show download section
  downloadSection.classList.remove("hidden")
}

// Display AI meme with caption
function displayAIMemeWithCaption(imageUrl, caption) {
  // Create a canvas to add the caption to the image
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  const img = new Image()
  img.onload = () => {
    canvas.width = img.width
    canvas.height = img.height

    // Draw the image
    ctx.drawImage(img, 0, 0)

    // Add the caption
    ctx.font = "bold 36px Impact"
    ctx.fillStyle = "white"
    ctx.strokeStyle = "black"
    ctx.lineWidth = 2
    ctx.textAlign = "center"

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

    // Convert canvas to image URL
    const memeUrl = canvas.toDataURL("image/png")
    currentMeme = memeUrl

    // Display in preview
    aiPreview.innerHTML = ""
    const memeImg = document.createElement("img")
    memeImg.src = memeUrl
    memeImg.alt = "AI Generated Meme"
    aiPreview.appendChild(memeImg)

    // Show download section
    downloadSection.classList.remove("hidden")
  }

  img.crossOrigin = "anonymous"
  img.src = imageUrl
}

// Handle download button
function handleDownload() {
  if (!currentMeme) return

  const link = document.createElement("a")

  // If currentMeme is a URL, we need to fetch it first
  if (currentMeme.startsWith("http")) {
    // Create a temporary canvas to download the image
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      // Convert canvas to data URL and download
      const dataUrl = canvas.toDataURL("image/png")
      link.href = dataUrl
      link.download = "meme.png"
      link.click()
    }
    img.src = currentMeme
  } else {
    // If it's already a data URL, download directly
    link.href = currentMeme
    link.download = "meme.png"
    link.click()
  }
}

// Handle create new button
function handleCreateNew() {
  // Reset the current state
  currentMeme = null
  downloadSection.classList.add("hidden")

  // Reset form inputs
  topTextInput.value = ""
  bottomTextInput.value = ""
  aiTopicInput.value = ""
  referenceImageInput.value = ""
  customImageInput.value = ""
  customTextInput.value = ""

  // Reset previews
  templatePreview.innerHTML = '<p class="placeholder-text">Your meme will appear here</p>'
  aiPreview.innerHTML = '<p class="placeholder-text">Your AI meme will appear here</p>'

  // Reset canvas
  initCanvas()
  textEditor.classList.add("hidden")
  canvasControls.classList.add("hidden")
  canvasPlaceholder.classList.remove("hidden")
}

// Initialize the app
document.addEventListener("DOMContentLoaded", init)
