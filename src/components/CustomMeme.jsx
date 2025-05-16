"use client"

import { useState, useRef } from "react"
import MemeCanvas from "./MemeCanvas"

function CustomMeme({ onMemeGenerated }) {
  const [image, setImage] = useState(null)
  const [text, setText] = useState("")
  const [fontSize, setFontSize] = useState(36)
  const [fontColor, setFontColor] = useState("#ffffff")
  const [strokeColor, setStrokeColor] = useState("#000000")
  const [useStroke, setUseStroke] = useState(true)
  const [imageLoaded, setImageLoaded] = useState(false)

  const canvasRef = useRef(null)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        setImage(img)
        setImageLoaded(true)
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  }

  const handleAddText = () => {
    if (!text.trim() || !canvasRef.current) return

    canvasRef.current.addText(text, {
      fontSize,
      fontColor,
      strokeColor,
      useStroke,
    })

    setText("")
    // Show instructions after adding first text
    document.querySelector(".instructions")?.classList.add("show")
  }

  const handleGenerateMeme = () => {
    if (!canvasRef.current) return

    const memeUrl = canvasRef.current.getImageDataURL()
    onMemeGenerated(memeUrl)
  }

  return (
    <div className="custom-meme-container">
      <div className="controls">
        <h2>Create a Custom Meme</h2>

        <div className="input-group">
          <label htmlFor="custom-image">Upload Your Image:</label>
          <input type="file" id="custom-image" accept="image/*" onChange={handleImageUpload} />
        </div>

        {imageLoaded && (
          <>
            <div className="text-editor">
              <h3>Add Text</h3>
              <div className="input-group">
                <label htmlFor="custom-text">Text:</label>
                <input
                  type="text"
                  id="custom-text"
                  placeholder="Enter text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <button className="small-btn" onClick={handleAddText}>
                  Add Text
                </button>
              </div>

              <div className="text-controls">
                <div className="input-group">
                  <label htmlFor="font-size">Font Size:</label>
                  <input
                    type="range"
                    id="font-size"
                    min="12"
                    max="72"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                  />
                  <span>{fontSize}px</span>
                </div>

                <div className="input-group">
                  <label htmlFor="font-color">Font Color:</label>
                  <input
                    type="color"
                    id="font-color"
                    value={fontColor}
                    onChange={(e) => setFontColor(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="stroke-color">Stroke Color:</label>
                  <input
                    type="color"
                    id="stroke-color"
                    value={strokeColor}
                    onChange={(e) => setStrokeColor(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label>
                    <input
                      type="checkbox"
                      id="text-stroke"
                      checked={useStroke}
                      onChange={(e) => setUseStroke(e.target.checked)}
                    />
                    Add text stroke
                  </label>
                </div>
              </div>

              <div className="canvas-controls">
                <button className="small-btn" onClick={() => canvasRef.current?.removeSelected()}>
                  Remove Selected Text
                </button>
                <button className="small-btn" onClick={() => canvasRef.current?.clearCanvas()}>
                  Clear All Text
                </button>
              </div>

              <div className="instructions">
                <p>
                  <strong>Instructions:</strong>
                </p>
                <ul>
                  <li>Click on text to select it</li>
                  <li>Drag selected text to reposition</li>
                  <li>Use controls above to style selected text</li>
                  <li>Click "Remove Selected Text" to delete the selected text</li>
                </ul>
              </div>
            </div>

            <button className="action-btn" onClick={handleGenerateMeme}>
              Generate Meme
            </button>
          </>
        )}
      </div>

      <div className="preview">
        <h3>Editor</h3>
        <div className="preview-container">
          {imageLoaded ? (
            <MemeCanvas
              ref={canvasRef}
              image={image}
              onUpdateSelectedText={(selected) => {
                if (selected) {
                  setFontSize(selected.fontSize)
                  setFontColor(selected.color)
                  setStrokeColor(selected.strokeColor)
                  setUseStroke(selected.useStroke)
                }
              }}
            />
          ) : (
            <p className="placeholder-text">Upload an image to start editing</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default CustomMeme
