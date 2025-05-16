"use client"

import { useState } from "react"
import { generateAIMeme, analyzeImage } from "../services/aiService"

function AIMeme({ onMemeGenerated }) {
  const [mode, setMode] = useState("text")
  const [topic, setTopic] = useState("")
  const [referenceImage, setReferenceImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)

  const handleModeChange = (e) => {
    setMode(e.target.value)
    setPreviewUrl(null)
    setTopic("") // Reset topic on mode change
    setReferenceImage(null)
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setReferenceImage(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleGenerateMeme = async () => {
    if (mode === "text" && !topic.trim()) {
      alert("Please enter a topic or idea")
      return
    }

    if (mode === "image" && !referenceImage) {
      alert("Please upload a reference image")
      return
    }

    setLoading(true)

    try {
      if (mode === "text") {
        const memeData = await generateAIMeme(topic)
        onMemeGenerated(memeData.imageUrl)
      } else {
        const promptTopic = prompt("Enter a topic for the caption (e.g., 'programming', 'cats'):", "")

        if (!promptTopic) {
          setLoading(false)
          return
        }

        const imageUrl = URL.createObjectURL(referenceImage)
        const caption = await analyzeImage(referenceImage, promptTopic)

        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        const img = new Image()

        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height

          ctx.drawImage(img, 0, 0)
          ctx.font = "bold 36px Impact"
          ctx.fillStyle = "white"
          ctx.strokeStyle = "black"
          ctx.lineWidth = 2
          ctx.textAlign = "center"

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

          const lineHeight = 40
          const y = canvas.height - lines.length * lineHeight - 20

          lines.forEach((line, index) => {
            const lineY = y + index * lineHeight
            ctx.strokeText(line, canvas.width / 2, lineY)
            ctx.fillText(line, canvas.width / 2, lineY)
          })

          const memeUrl = canvas.toDataURL("image/png")
          onMemeGenerated(memeUrl)
        }

        img.crossOrigin = "anonymous"
        img.src = imageUrl
      }
    } catch (error) {
      console.error("Error generating AI meme:", error)
      alert("Failed to generate AI meme. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ai-meme-container">
      <div className="controls">
        <h2>Create an AI Meme</h2>

        <div className="ai-mode-selector">
          <label>
            <input type="radio" name="ai-mode" value="text" checked={mode === "text"} onChange={handleModeChange} />
            Generate from text prompt
          </label>

          <label>
            <input type="radio" name="ai-mode" value="image" checked={mode === "image"} onChange={handleModeChange} />
            Generate from reference image
          </label>
        </div>

        {mode === "text" ? (
          <div className="ai-input-group">
            <div className="input-group">
              <label htmlFor="ai-topic">Topic or Idea:</label>
              <input
                type="text"
                id="ai-topic"
                placeholder="Enter a topic (e.g., 'cats in space')"
                value={topic || ""}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div className="ai-input-group">
            <div className="input-group">
              <label htmlFor="reference-image">Upload Reference Image:</label>
              <input type="file" id="reference-image" accept="image/*" onChange={handleImageUpload} />
            </div>
          </div>
        )}

        <button className="action-btn" onClick={handleGenerateMeme} disabled={loading}>
          {loading ? "Generating..." : "Generate AI Meme"}
        </button>
      </div>

      <div className="preview">
        <h3>Preview</h3>
        <div className="preview-container">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Generating your meme...</p>
            </div>
          ) : previewUrl ? (
            <img src={previewUrl} alt="Reference" className="reference-preview-img" />
          ) : (
            <p className="placeholder-text">
              {mode === "text" ? "Enter a topic to generate an AI meme" : "Upload an image to analyze"}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default AIMeme
