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

// Simple key point extraction logic using regular expressions
// This can be improved with more sophisticated NLP techniques if needed.
function extractKeyPoints(text: string): string[] {

   const sentences = text
    .split(/(?<=[.?!])\s+(?=[A-Z])/)
    .map(s => s.trim())
    .filter(s => s.length > 20);

  return sentences.filter(s =>
    /( is | are | means | refers to | defined as | caused by | due to )/i.test(s)
  ).slice(0, 10);
}