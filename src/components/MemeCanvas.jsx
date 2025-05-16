"use client"

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react"

const MemeCanvas = forwardRef(({ image, onUpdateSelectedText }, ref) => {
  const canvasRef = useRef(null)
  const [textObjects, setTextObjects] = useState([])
  const [selectedText, setSelectedText] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [lastX, setLastX] = useState(0)
  const [lastY, setLastY] = useState(0)
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 })

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    addText: (text, options) => {
      addTextToCanvas(text, options)
    },
    getImageDataURL: () => {
      return canvasRef.current.toDataURL("image/png")
    },
    clearCanvas: () => {
      setTextObjects([])
      setSelectedText(null)
      drawCanvas()
    },
    removeSelected: () => {
      handleRemoveSelected()
    },
  }))

  // Initialize canvas when image changes
  useEffect(() => {
    if (image) {
      initCanvas()
    }
  }, [image])

  // Redraw canvas when text objects or selected text changes
  useEffect(() => {
    if (canvasRef.current) {
      drawCanvas()
    }
  }, [textObjects, selectedText])

  // Initialize the canvas
  const initCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas || !image) return

    const ctx = canvas.getContext("2d")

    // Set canvas dimensions based on image aspect ratio
    const aspectRatio = image.width / image.height

    let width, height
    if (aspectRatio > 1) {
      // Landscape image
      width = 800
      height = 800 / aspectRatio
    } else {
      // Portrait or square image
      height = 600
      width = 600 * aspectRatio
    }

    setCanvasSize({ width, height })

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw the image
    drawCanvas()
  }

  // Draw the canvas with background and text
  const drawCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas || !image) return

    const ctx = canvas.getContext("2d")

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw background image
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

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
  }

  // Add text to canvas
  const addTextToCanvas = (text, options) => {
    const textObj = {
      text,
      x: canvasSize.width / 2,
      y: canvasSize.height / 2,
      fontSize: options.fontSize || 36,
      color: options.fontColor || "#ffffff",
      strokeColor: options.strokeColor || "#000000",
      useStroke: options.useStroke !== undefined ? options.useStroke : true,
    }

    setTextObjects([...textObjects, textObj])
    setSelectedText(textObj)
  }

  // Handle mouse down event
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if a text object is clicked
    let found = false
    for (let i = textObjects.length - 1; i >= 0; i--) {
      const text = textObjects[i]

      // Calculate text width
      const ctx = canvas.getContext("2d")
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
        setSelectedText(text)
        setIsDragging(true)
        setLastX(x)
        setLastY(y)
        found = true

        // Notify parent component
        if (onUpdateSelectedText) {
          onUpdateSelectedText(text)
        }

        break
      }
    }

    // If no text is clicked, deselect
    if (!found) {
      setSelectedText(null)
      if (onUpdateSelectedText) {
        onUpdateSelectedText(null)
      }
    }
  }

  // Handle mouse move event
  const handleMouseMove = (e) => {
    if (!isDragging || !selectedText) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Calculate the movement delta
    const dx = x - lastX
    const dy = y - lastY

    // Update text position
    const updatedTextObjects = textObjects.map((text) => {
      if (text === selectedText) {
        return {
          ...text,
          x: text.x + dx,
          y: text.y + dy,
        }
      }
      return text
    })

    setTextObjects(updatedTextObjects)
    setSelectedText((prevSelected) => ({
      ...prevSelected,
      x: prevSelected.x + dx,
      y: prevSelected.y + dy,
    }))

    // Update last position
    setLastX(x)
    setLastY(y)
  }

  // Handle mouse up event
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Handle remove selected text
  const handleRemoveSelected = () => {
    if (!selectedText) return

    const updatedTextObjects = textObjects.filter((text) => text !== selectedText)
    setTextObjects(updatedTextObjects)
    setSelectedText(null)

    if (onUpdateSelectedText) {
      onUpdateSelectedText(null)
    }
  }

  // Add cursor styles when hovering over text
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Check if mouse is over any text
      let overText = false
      for (let i = textObjects.length - 1; i >= 0; i--) {
        const text = textObjects[i]
        const ctx = canvas.getContext("2d")
        ctx.font = `${text.fontSize}px Impact`
        const textWidth = ctx.measureText(text.text).width
        const textHeight = text.fontSize

        if (
          x >= text.x - textWidth / 2 - 10 &&
          x <= text.x + textWidth / 2 + 10 &&
          y >= text.y - textHeight / 2 - 10 &&
          y <= text.y + textHeight / 2 + 10
        ) {
          canvas.style.cursor = isDragging ? "grabbing" : "grab"
          overText = true
          break
        }
      }

      if (!overText && !isDragging) {
        canvas.style.cursor = "default"
      }
    }

    canvas.addEventListener("mousemove", handleMouseMove)
    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove)
    }
  }, [textObjects, isDragging])

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize.width}
      height={canvasSize.height}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="meme-canvas"
    />
  )
})

export default MemeCanvas
