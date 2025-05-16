// Utility functions for the meme generator

// Format date for filenames
export function formatDate() {
  const date = new Date()
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}_${date.getHours().toString().padStart(2, "0")}-${date.getMinutes().toString().padStart(2, "0")}`
}

// Generate a random ID
export function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Debounce function to limit how often a function can be called
export function debounce(func, wait) {
  let timeout
  return function (...args) {
    
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

// Check if a URL is valid
export function isValidUrl(string) {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

// Convert data URL to Blob
export function dataURLtoBlob(dataURL) {
  const parts = dataURL.split(";base64,")
  const contentType = parts[0].split(":")[1]
  const raw = window.atob(parts[1])
  const rawLength = raw.length
  const uInt8Array = new Uint8Array(rawLength)

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i)
  }

  return new Blob([uInt8Array], { type: contentType })
}

// Get file extension from filename
export function getFileExtension(filename) {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2)
}

// Convert hex color to RGB
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : null
}

// Calculate contrast color (black or white) based on background
export function getContrastColor(hexColor) {
  const rgb = hexToRgb(hexColor)
  if (!rgb) return "#000000"

  // Calculate luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255

  // Return black for bright colors, white for dark colors
  return luminance > 0.5 ? "#000000" : "#ffffff"
}
