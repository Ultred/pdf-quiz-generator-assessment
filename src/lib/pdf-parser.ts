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

    return {
      success: true,
      context: fullText,
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      message: "Error parsing PDF",
    };
  }
}