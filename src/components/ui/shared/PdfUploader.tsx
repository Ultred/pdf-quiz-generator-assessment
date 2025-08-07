"use client";

import React, { useCallback, useState } from "react";
import { parsePdf } from "../../../lib/pdf-parser";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../card";
import { Input } from "../input";
import { Button } from "../button";


export default function PdfUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [parsedText, setParsedText] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<string | null>(null);
  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      setParsedText(null);
      setError(null);
      setFile(null);

      if (selectedFile) {
        setFile(selectedFile);
        setIsLoading(true);

        const result = await parsePdf(selectedFile);

        setIsLoading(false);

        if (result.success) {
          setParsedText(result.context || "");
        } else {
          setError(result.message || "Failed to parse PDF.");
        }
      }
    },
    []
  );

  const handleGenerateClick = useCallback(async () => {
    if (!parsedText) return;
    setIsLoading(true);
    setError(null);
    setQuiz(null);
    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: "Web developer in a simple day" }),
      });

      const data = await response.json();

      if (response.ok) {
        setQuiz(data.quiz);
      } else {
        setError(data.error || "Failed to generate quiz.");
      }
    } catch (err) {
      console.log(err);
      setError("Network error while generating quiz.");
    } finally {
      setIsLoading(false);
    }
  }, [parsedText]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a Quiz</CardTitle>
        <CardDescription>
          Upload a PDF document to generate a quiz from its content.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={isLoading}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button
            onClick={handleGenerateClick}
            disabled={!file || !parsedText || isLoading}
            className="w-full"
          >
            {isLoading ? "Parsing PDF..." : "Generate Quiz"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
