"use client"

import { useState } from "react"
import TemplateMeme from "./components/TemplateMeme"
import AIMeme from "./components/AIMeme"
import CustomMeme from "./components/CustomMeme"
import "./App.css"

function App() {
  const [activeTab, setActiveTab] = useState("template")
  const [generatedMeme, setGeneratedMeme] = useState(null)

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setGeneratedMeme(null)
  }

  const handleMemeGenerated = (memeUrl) => {
    setGeneratedMeme(memeUrl)
  }

  const handleCreateNew = () => {
    setGeneratedMeme(null)
  }

  const handleDownload = () => {
    if (!generatedMeme) return

    const link = document.createElement("a")

    // If it's a URL, we need to fetch it first
    if (typeof generatedMeme === "string" && generatedMeme.startsWith("http")) {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        const dataUrl = canvas.toDataURL("image/png")
        link.href = dataUrl
        link.download = "meme.png"
        link.click()
      }
      img.src = generatedMeme
    } else {
      // If it's already a data URL
      link.href = generatedMeme
      link.download = "meme.png"
      link.click()
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Meme Generator</h1>
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === "template" ? "active" : ""}`}
            onClick={() => handleTabChange("template")}
          >
            Template Memes
          </button>
          <button className={`tab-btn ${activeTab === "ai" ? "active" : ""}`} onClick={() => handleTabChange("ai")}>
            AI Memes
          </button>
          <button
            className={`tab-btn ${activeTab === "custom" ? "active" : ""}`}
            onClick={() => handleTabChange("custom")}
          >
            Custom Upload
          </button>
        </div>
      </header>

      <main className="main-content">
        {activeTab === "template" && <TemplateMeme onMemeGenerated={handleMemeGenerated} />}

        {activeTab === "ai" && <AIMeme onMemeGenerated={handleMemeGenerated} />}

        {activeTab === "custom" && <CustomMeme onMemeGenerated={handleMemeGenerated} />}

        {generatedMeme && (
          <div className="download-section">
            <h2>Your Meme is Ready!</h2>
            <div className="download-preview">
              <img src={generatedMeme || "/placeholder.svg"} alt="Generated Meme" />
            </div>
            <div className="download-options">
              <button className="action-btn" onClick={handleDownload}>
                Download Meme
              </button>
              <button className="action-btn secondary" onClick={handleCreateNew}>
                Create Another
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Created with ❤️ | Meme Generator 2023</p>
      </footer>
    </div>
  )
}

export default App
