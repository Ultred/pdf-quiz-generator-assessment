# PDF Quiz Generator - Take-Home Assignment

## Challenge Overview
Create a simple web application that allows users to upload PDF documents and generate a quiz based on the content using OpenAI.

## Tech Stack
This starter project uses Next.js with Tailwind CSS and Shadcn UI components.

## How to install

Clone the repository -> git clone
Install dependencies -> npm install
Run the development server -> npm run dev

## Libraries Used

Main Libraries:
openai
pdfjs-dist

For design purposes:
react-confetti
react-toastify

## Approach & Design Decisions

Client-Side PDF Parsing:
- Avoids sending large PDF files to the server, improving privacy and user experience.
- Parsing is limited to 10 pages to prevent performance bottlenecks on large PDFs.
- I used simple regular expressions to filter informative sentences containing phrases like “is”, “means”, or “refers to” as potential key points.

PDF Upload & Preview Flow

- Accept PDF files via an <input type="file"> field.
- Show error messages if the file is invalid or parsing fails.
- Enable a "Generate Quiz" button once parsing succeeds.

Scoring & Feedback Logic
- A success toast is shown for 3 or more correct answers.
- A warning toast is shown for lower scores.

API Logic & Design Explanation
- Checks that the OpenAI API key is set.
- Calls OpenAI's Chat API with a prompt to generate quiz questions.
- Returns the generated quiz to the client in JSON format.


## Limitations
- When using Pdf-parser to pdf with picture it returns only /n
- Only PDFs with 10 pages or less are supported.
- Key point extraction can be improved using OpenAI.






