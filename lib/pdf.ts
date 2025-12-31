import { spawn } from "child_process"
import { writeFileSync, unlinkSync, readFileSync } from "fs"
import { join } from "path"
import { tmpdir } from "os"
import { randomUUID } from "crypto"

interface StationeryListData {
  school: {
    name: string
    town?: string
    logo?: string
  }
  grade: {
    name: string
  }
  items: Array<{
    name: string
    quantity: number
    price: number
    isRequired: boolean
    notes?: string
  }>
  totals: {
    required: number
    optional: number
    total: number
  }
}

interface ReceiptData {
  order: {
    orderNumber: string
    createdAt: string | Date
    status: string
    subtotal: number
    deliveryFee: number
    discount?: number
    total: number
  }
  customer: {
    name: string
    email: string
    phone: string
  }
  address: {
    streetAddress: string
    suburb: string
    city: string
    postalCode: string
  }
  items: Array<{
    name: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
  payment?: {
    provider: string
    status: string
  }
}

/**
 * Generate a PDF using the Python script.
 * Falls back to a simple text response if Python is not available.
 */
async function callPythonPdfGenerator(
  type: "stationery" | "receipt",
  data: StationeryListData | ReceiptData
): Promise<Buffer> {
  const tempId = randomUUID()
  const inputPath = join(tmpdir(), `blaqmart-pdf-input-${tempId}.json`)
  const outputPath = join(tmpdir(), `blaqmart-pdf-output-${tempId}.pdf`)

  try {
    // Write input data to temp file
    writeFileSync(inputPath, JSON.stringify(data), "utf-8")

    // Call Python script
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn("python", [
        "scripts/pdf_generator.py",
        type,
        inputPath,
        outputPath,
      ])

      let stderr = ""
      pythonProcess.stderr.on("data", (data) => {
        stderr += data.toString()
      })

      pythonProcess.on("close", (code) => {
        // Clean up input file
        try {
          unlinkSync(inputPath)
        } catch {}

        if (code === 0) {
          try {
            const pdfBuffer = readFileSync(outputPath)
            // Clean up output file
            try {
              unlinkSync(outputPath)
            } catch {}
            resolve(pdfBuffer)
          } catch (err) {
            reject(new Error(`Failed to read PDF: ${err}`))
          }
        } else {
          reject(new Error(`Python script failed: ${stderr}`))
        }
      })

      pythonProcess.on("error", (err) => {
        // Clean up input file
        try {
          unlinkSync(inputPath)
        } catch {}
        reject(new Error(`Failed to start Python: ${err.message}`))
      })
    })
  } catch (err) {
    // Clean up on error
    try {
      unlinkSync(inputPath)
    } catch {}
    throw err
  }
}

/**
 * Generate a stationery list PDF.
 *
 * @example
 * const pdf = await generateStationeryListPDF({
 *   school: { name: "Warrenton Primary", town: "Warrenton" },
 *   grade: { name: "Grade 4" },
 *   items: [
 *     { name: "Exercise Book A4", quantity: 5, price: 12.99, isRequired: true },
 *   ],
 *   totals: { required: 64.95, optional: 0, total: 64.95 }
 * })
 */
export async function generateStationeryListPDF(
  data: StationeryListData
): Promise<Buffer> {
  try {
    return await callPythonPdfGenerator("stationery", data)
  } catch (error) {
    console.error("PDF generation failed:", error)
    // Return a simple fallback (could be a pre-generated template or error page)
    throw new Error(
      "PDF generation is not available. Please ensure Python and reportlab are installed."
    )
  }
}

/**
 * Generate an order receipt PDF.
 */
export async function generateReceiptPDF(data: ReceiptData): Promise<Buffer> {
  try {
    return await callPythonPdfGenerator("receipt", data)
  } catch (error) {
    console.error("Receipt PDF generation failed:", error)
    throw new Error(
      "PDF generation is not available. Please ensure Python and reportlab are installed."
    )
  }
}

/**
 * Check if PDF generation is available (Python + reportlab installed).
 */
export async function isPdfGenerationAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    const pythonProcess = spawn("python", ["-c", "import reportlab; print('ok')"])

    pythonProcess.on("close", (code) => {
      resolve(code === 0)
    })

    pythonProcess.on("error", () => {
      resolve(false)
    })

    // Timeout after 5 seconds
    setTimeout(() => {
      pythonProcess.kill()
      resolve(false)
    }, 5000)
  })
}
