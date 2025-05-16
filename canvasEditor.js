// Canvas Editor for custom meme creation

let canvas
let ctx
let backgroundImage
let textObjects = []
let selectedText = null
let isDragging = false
let lastX, lastY

// Initialize the canvas
export function initCanvas(image = null) {
  canvas = document.getElementById("meme-canvas")
  ctx = canvas.getContext("2d")

  // Set canvas dimensions
  canvas.width = 800
  canvas.height = 600

  // Clear existing content
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  textObjects = []
  selectedText = null

  // If an image is provided, set it as background
  if (image) {
    backgroundImage = image

    // Resize canvas to match image aspect ratio
    const aspectRatio = image.width / image.height

    if (aspectRatio > 1) {
      // Landscape image
      canvas.width = 800
      canvas.height = 800 / aspectRatio
    } else {
      // Portrait or square image
      canvas.height = 600
      canvas.width = 600 * aspectRatio
    }

    // Draw the image
    drawCanvas()
  } else if (backgroundImage) {
    // Redraw existing background
    drawCanvas()
  } else {
    // Draw empty canvas with placeholder background
    ctx.fillStyle = "#e0e0e0"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.font = "20px Arial"
    ctx.fillStyle = "#757575"
    ctx.textAlign = "center"
    ctx.fillText("Upload an image to start", canvas.width / 2, canvas.height / 2)
  }

  // Set up event listeners
  setupCanvasEvents()
}

// Set up canvas event listeners
function setupCanvasEvents() {
  canvas.addEventListener("mousedown", handleMouseDown)
  canvas.addEventListener("mousemove", handleMouseMove)
  canvas.addEventListener("mouseup", handleMouseUp)
  canvas.addEventListener("click", handleClick)

  // Remove event listeners before adding new ones to prevent duplicates
  document.getElementById("remove-selected").removeEventListener("click", handleRemoveSelected)
  document.getElementById("remove-selected").addEventListener("click", handleRemoveSelected)
}

// Handle mouse down event
function handleMouseDown(e) {
  const rect = canvas.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  // Check if a text object is clicked
  for (let i = textObjects.length - 1; i >= 0; i--) {
    const text = textObjects[i]

    // Calculate text width
    ctx.font = `${text.fontSize}px Impact`
    const textWidth = ctx.measureText(text.text).width
    const textHeight = text.fontSize

    // Check if click is within text bounds
    if (
      x >= text.x - textWidth / 2 - 10 &&
      x <= text.x + textWidth / 2 + 10 &&
      y >= text.y - textHeight / 2 - 10 &&
      y <= text.y + textHeight / 2 + 10
    ) {
      selectedText = text
      isDragging = true
      lastX = x
      lastY = y

      // Update UI controls to match selected text
      document.getElementById("font-size").value = text.fontSize
      document.getElementById("font-size-value").textContent = `${text.fontSize}px`
      document.getElementById("font-color").value = text.color
      document.getElementById("stroke-color").value = text.strokeColor
      document.getElementById("text-stroke").checked = text.useStroke

      drawCanvas()
      return
    }
  }

  // If no text is clicked, deselect
  selectedText = null
  drawCanvas()
}

// Handle mouse move event
function handleMouseMove(e) {
  if (!isDragging || !selectedText) return

  const rect = canvas.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  // Calculate the movement delta
  const dx = x - lastX
  const dy = y - lastY

  // Update text position
  selectedText.x += dx
  selectedText.y += dy

  // Update last position
  lastX = x
  lastY = y

  // Redraw canvas
  drawCanvas()
}

// Handle mouse up event
function handleMouseUp() {
  isDragging = false
}

// Handle click event
function handleClick(e) {
  // This is handled by mouseDown for text selection
}

// Add text to canvas
export function addTextToCanvas(text, options) {
  if (!backgroundImage) {
    alert("Please upload an image first")
    return
  }

  const textObj = {
    text,
    x: canvas.width / 2,
    y: canvas.height / 2,
    fontSize: options.fontSize || 36,
    color: options.fontColor || "#ffffff",
    strokeColor: options.strokeColor || "#000000",
    useStroke: options.useStroke !== undefined ? options.useStroke : true,
  }

  textObjects.push(textObj)
  selectedText = textObj

  drawCanvas()
}

// Update selected text properties
export function updateSelectedText(options) {
  if (!selectedText) return

  if (options.fontSize !== undefined) selectedText.fontSize = options.fontSize
  if (options.fontColor !== undefined) selectedText.color = options.fontColor
  if (options.strokeColor !== undefined) selectedText.strokeColor = options.strokeColor
  if (options.useStroke !== undefined) selectedText.useStroke = options.useStroke

  drawCanvas()
}

// Handle remove selected text
export function handleRemoveSelected() {
  if (!selectedText) return

  const index = textObjects.indexOf(selectedText)
  if (index !== -1) {
    textObjects.splice(index, 1)
    selectedText = null
    drawCanvas()
  }
}

// Draw the canvas with background and text
function drawCanvas() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Draw background image if available
  if (backgroundImage) {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height)
  } else {
    // Draw placeholder background
    ctx.fillStyle = "#e0e0e0"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  // Draw text objects
  textObjects.forEach((text) => {
    ctx.font = `${text.fontSize}px Impact`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    // Draw text with stroke if enabled
    if (text.useStroke) {
      ctx.strokeStyle = text.strokeColor
      ctx.lineWidth = text.fontSize / 15 // Scale stroke width with font size
      ctx.strokeText(text.text, text.x, text.y)
    }

    ctx.fillStyle = text.color
    ctx.fillText(text.text, text.x, text.y)

    // Draw selection box if this text is selected
    if (text === selectedText) {
      const textWidth = ctx.measureText(text.text).width
      const textHeight = text.fontSize

      ctx.strokeStyle = "#4285f4"
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.strokeRect(text.x - textWidth / 2 - 10, text.y - textHeight / 2 - 10, textWidth + 20, textHeight + 20)
      ctx.setLineDash([])
    }
  })

  // Get the current meme as data URL
  if (backgroundImage) {
    window.currentMeme = canvas.toDataURL("image/png")
  }
}
