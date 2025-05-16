"use client"

import { useState, useEffect } from "react"
import { fetchTemplates, generateMeme } from "../services/imgflipService"

function TemplateMeme({ onMemeGenerated }) {
  const [templates, setTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [topText, setTopText] = useState("")
  const [bottomText, setBottomText] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const fetchedTemplates = await fetchTemplates()
        setTemplates(fetchedTemplates)
      } catch (error) {
        console.error("Error loading templates:", error)
      }
    }

    loadTemplates()
  }, [])

  const handleTemplateChange = (e) => {
    const templateId = e.target.value
    if (!templateId) {
      setSelectedTemplate(null)
      return
    }

    const template = templates.find((t) => t.id === templateId)
    setSelectedTemplate(template)
  }

  const handleGenerateMeme = async () => {
    if (!selectedTemplate) {
      alert("Please select a template first")
      return
    }

    setLoading(true)

    // Add CSS styles for the meme text preview
    const style = document.createElement("style")
    style.innerHTML = `
  .meme-text {
    position: absolute;
    width: 100%;
    text-align: center;
    font-family: Impact, sans-serif;
    font-size: 2em;
    color: white;
    text-shadow: 2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000;
    padding: 0 10px;
  }
  .top-text {
    top: 10px;
  }
  .bottom-text {
    bottom: 10px;
  }
  .template-image-container {
    display: inline-block;
    position: relative;
  }
`
    document.head.appendChild(style)

    try {
      const memeUrl = await generateMeme(selectedTemplate.id, topText, bottomText)
      onMemeGenerated(memeUrl)
    } catch (error) {
      console.error("Error generating meme:", error)
      alert("Failed to generate meme. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="template-meme-container">
      <div className="controls">
        <h2>Create a Template Meme</h2>

        <div className="template-selector">
          <label htmlFor="template-select">Choose a template:</label>
          <select id="template-select" onChange={handleTemplateChange} value={selectedTemplate?.id || ""}>
            <option value="">Select a template</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-inputs">
          <div className="input-group">
            <label htmlFor="top-text">Top Text:</label>
            <input
              type="text"
              id="top-text"
              placeholder="Enter top text"
              value={topText}
              onChange={(e) => setTopText(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label htmlFor="bottom-text">Bottom Text:</label>
            <input
              type="text"
              id="bottom-text"
              placeholder="Enter bottom text"
              value={bottomText}
              onChange={(e) => setBottomText(e.target.value)}
            />
          </div>
        </div>

        <button className="action-btn" onClick={handleGenerateMeme} disabled={loading}>
          {loading ? "Generating..." : "Generate Meme"}
        </button>
      </div>

      <div className="preview">
        <h3>Preview</h3>
        <div className="preview-container">
          {selectedTemplate ? (
            <div className="template-preview">
              <div className="template-image-container" style={{ position: "relative" }}>
                <img
                  src={selectedTemplate.url || "/placeholder.svg"}
                  alt={selectedTemplate.name}
                  className="template-preview-img"
                />
                {topText && <div className="meme-text top-text">{topText}</div>}
                {bottomText && <div className="meme-text bottom-text">{bottomText}</div>}
              </div>
            </div>
          ) : (
            <p className="placeholder-text">Select a template to preview</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default TemplateMeme
