"use client";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Confetti from 'react-confetti';
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

type QuizItem = {
  question: string;
  options: string[];
  answer: string;
};

export default function PdfUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [parsedText, setParsedText] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<QuizItem[] | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      setParsedText(null);
      resetQuizState();

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
    resetQuizState();
    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: "A webdeveloper sample" }),
      });

      const data = await response.json();

      if (response.ok) {
        const parsedQuiz = JSON.parse(data.quiz);
        setQuiz(parsedQuiz);
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

  const resetQuizState = () => {
    setError(null);
    setQuiz(null);
    setScore(null);
    setSubmitted(false);
    setUserAnswers({});
  };

  const handleOptionChange = (questionIndex: number, selected: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionIndex]: selected }));
  };

  const handleSubmitAnswers = () => {
    if (!quiz || submitted) return;

    let correct = 0;
    quiz.forEach((q, index) => {
      if (userAnswers[index] === q.answer) correct++;
    });

    setScore(correct);
    setSubmitted(true);

    if (correct >= 3) {
      toast.success(`Great job! You scored ${correct}/5`);
    } else {
      toast.warn(`You scored ${correct}/5. Keep practicing!`);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Create a Quiz</CardTitle>
          <CardDescription>
            Upload a PDF document to generate a quiz from its content.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
            {isLoading ? "Generating Quiz..." : "Generate Quiz"}
          </Button>

          {quiz && (
            <div className="space-y-6">
              {quiz.map((q, index) => (
                <div key={index} className="border p-4 rounded space-y-2">
                  <p className="font-medium">{index + 1}. {q.question}</p>
                  {q.options.map((option) => {
                    const isCorrect = submitted && option === q.answer;
                    const isSelected = userAnswers[index] === option;
                    const isWrong = submitted && isSelected && option !== q.answer;

                    return (
                      <label key={option} className={`block p-1 rounded ${
                        isCorrect ? 'bg-green-100' : isWrong ? 'bg-red-100' : ''
                      }`}>
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={option}
                          checked={isSelected}
                          onChange={() => handleOptionChange(index, option)}
                          className="mr-2"
                          disabled={submitted}
                        />
                        {option}
                        {submitted && isCorrect && (
                          <span className="text-green-600 ml-2 font-semibold">
                            (Correct)
                          </span>
                        )}
                        {submitted && isWrong && (
                          <span className="text-red-500 ml-2 font-semibold">
                            (Your Answer)
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              ))}

              <Button
                onClick={handleSubmitAnswers}
                disabled={submitted}
                className="w-full"
              >
                {submitted ? "Submitted" : "Submit Answers"}
              </Button>

              {submitted && (
                <p className="text-blue-600 font-medium text-center">
                  You have submitted your answers. You can&apos;t submit again.
                </p>
              )}
            </div>
          )}

          {score !== null && (
            <p className="text-green-600 font-semibold text-center">
              Final Score: {score} / {quiz?.length}
            </p>
          )}
        </CardContent>
      </Card>

      <ToastContainer position="top-center" />

      {score !== null && score >= 3 && (
        <Confetti />
      )}
    </>
  );
}
