"use client";

export async function parsePdf(file: File): Promise<{
  success: boolean;
  message?: string;
  context?: string;
  keyPoints?: string[];
}> {
  if (typeof window === "undefined") {
    return {
      success: false,
      message: "parsePdf must be run in the browser.",
    };
  }
  // Use a lower version of pdfjs-dist for compatibility since the latest version may not work with the current setup.
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf");
  const { GlobalWorkerOptions, getDocument } = pdfjsLib;

  GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;

    if (pdf.numPages > 10) {
      return {
        success: false,
        message: "PDF has more than 10 pages.",
      };
    }

    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");
      fullText += pageText + "\n";
    }

    const keyPoints = extractKeyPoints(fullText);

    return {
      success: true,
      context: fullText,
      keyPoints,
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      message: "Error parsing PDF",
    };
  }
}

// Simple key point extraction logic using local only getting Uppercase
function extractKeyPoints(text: string): string[] {
  const lines = text
    .split(" ")
    .map((line) => line.trim())
    .filter(Boolean);

  const keyPoints: string[] = [];

  for (const line of lines) {
    if (
      line.match(/^(\d+[\.\)])\s+/) ||
      (line.length > 0 && line === line.toUpperCase())
    ) {
      keyPoints.push(line);
    }
  }

  // Optionally limit number of key points
  return keyPoints.slice(0, 25);
}