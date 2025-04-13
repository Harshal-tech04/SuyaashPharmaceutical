import { useState, useCallback, useEffect } from "react";
import { FileText, Loader2 } from "lucide-react";
import Anthropic from "@anthropic-ai/sdk";
import { toast } from "react-toastify";

export function TextExtractor({ file, onExtracted, autoExtract = false }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const extractAndProcess = useCallback(async () => {
    if (!file) {
      setError("No file selected");
      toast.error("No file selected for extraction");
      return;
    }

    if (!(file instanceof Blob)) {
      setError("Invalid file object");
      toast.error("Invalid file object");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const extractedText = await extractTextFromImage(file);

      const { structuredData, rawResponse } = await processWithClaude(
        extractedText
      );

      // Send back the structured data
      onExtracted(structuredData, rawResponse);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [file, onExtracted]);

  // Auto-extract if flag is set and file changes
  useEffect(() => {
    if (autoExtract && file) {
      extractAndProcess();
    }
  }, [autoExtract, file, extractAndProcess]);

  const extractTextFromImage = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          const base64Image = event.target.result.split(",")[1];

          const response = await fetch(
            `https://vision.googleapis.com/v1/images:annotate?key=${
              import.meta.env.VITE_GOOGLE_CLOUD_VISION_API_KEY ||
              import.meta.env.VITE_GOOGLE_CLOUD_API_KEY
            }`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                requests: [
                  {
                    image: {
                      content: base64Image,
                    },
                    features: [
                      {
                        type: "TEXT_DETECTION",
                        maxResults: 1,
                      },
                    ],
                  },
                ],
              }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            const errorMessage =
              errorData.error?.message ||
              `HTTP error! status: ${response.status}`;
            toast.error(`Vision API error: ${errorMessage}`);
            throw new Error(errorMessage);
          }

          const data = await response.json();
          const extractedText =
            data.responses[0]?.fullTextAnnotation?.text || "No text found";
          if (extractedText === "No text found") {
            toast.warning("No text found in the image");
          }
          resolve(extractedText);
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = () => {
        const error = new Error("Error reading file");
        toast.error("Error reading file");
        reject(error);
      };

      reader.readAsDataURL(file);
    });
  };

  const processWithClaude = async (extractedText) => {
    try {
      const prompt = `Extract structured data from the following pharmaceutical batch record text. I want three separate JSON objects:

Document Metadata (company, address, product name, batch number, etc.)

Process Step vi (mixing ingredients)

Process Step vii (pH adjustment)

Clean up any OCR errors if obvious (e.g., 2921 → 2021) and preserve field names clearly. Return all three JSONs separately in this format exactly:
\`\`\`json
[
  {
    "company": "...",
    "address": "...",
    ...other metadata fields
  },
  {
    "step_number": "vi",
    ...mixing step fields
  },
  {
    "step_number": "vii",
    ...pH adjustment fields
  }
]
\`\`\`

Return only the JSON without any other explanations.

the extracted text is given below:
${extractedText}`;

      console.log("Sending prompt to Claude using SDK");

      // Initialize the Anthropic client with the API key
      const anthropic = new Anthropic({
        apiKey: import.meta.env.VITE_CLOUDE_API_KEY,
        dangerouslyAllowBrowser: true,
      });

      // Create a message using the SDK
      try {
        // Log model being used and API key (masking most of it)
        const apiKey = import.meta.env.VITE_CLOUDE_API_KEY || "";
        const maskedKey = apiKey
          ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`
          : "No API key found";
        console.log("API Key (masked):", maskedKey);

        const message = await anthropic.messages.create({
          model: "claude-3-7-sonnet-20250219",
          max_tokens: 4000,
          system:
            "You are an expert at extracting structured data from pharmaceutical batch records. Please respond with clean, well-formatted JSON data.",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: prompt,
                },
              ],
            },
          ],
        });

        console.log("Raw Claude response:", message);

        // Extract the response content
        const aiResponse = message.content[0]?.text || "";
        console.log("Claude formatted response:", aiResponse);

        // Extract JSON data
        let structuredData = [];

        // Try to extract JSON objects from the response
        try {
          // Look for JSON objects in the text
          const jsonMatches = aiResponse.match(/```json\n([\s\S]*?)```/g) || [];

          if (jsonMatches.length > 0) {
            console.log("Found JSON code blocks:", jsonMatches.length);

            // Get the first JSON code block and parse it
            const content = jsonMatches[0].replace(/```json\n|```/g, "").trim();
            console.log("JSON content before parsing:", content);
            structuredData = JSON.parse(content);
            console.log("Parsed JSON Objects:", structuredData);
          } else {
            // Try to parse the entire response as JSON if no code blocks found
            try {
              console.log("Trying to parse entire response as JSON");
              structuredData = JSON.parse(aiResponse);
              console.log("Parsed JSON (full response):", structuredData);
            } catch (parseError) {
              console.log(
                "Could not parse full response as JSON, looking for embedded JSONs:",
                parseError.message
              );

              // Try to find JSON objects in curly braces
              const jsonRegex =
                /\[\s*{[^[]]*}\s*,\s*{[^[]]*}\s*,\s*{[^[]]*}\s*\]/g;
              const possibleJsons = aiResponse.match(jsonRegex) || [];

              if (possibleJsons.length > 0) {
                console.log(
                  "Found possible JSON arrays:",
                  possibleJsons.length
                );
                console.log("First match:", possibleJsons[0]);

                try {
                  structuredData = JSON.parse(possibleJsons[0]);
                  console.log("Parsed JSON array:", structuredData);
                } catch (parseError) {
                  console.log(
                    "Failed to parse JSON array:",
                    parseError.message
                  );
                }
              } else {
                console.log("No JSON arrays found in the response");
              }
            }
          }
        } catch (jsonError) {
          console.error("Error parsing JSON from AI response:", jsonError);
        }

        // Ensure structuredData is always an array before returning
        if (!Array.isArray(structuredData)) {
          console.warn("structuredData is not an array, converting to array");
          structuredData = structuredData ? [structuredData] : [];
        }

        // Log the final structuredData before returning
        console.log("Final structuredData being returned:", structuredData);
        console.log("Is final data an array?", Array.isArray(structuredData));
        console.log("Final data length:", structuredData.length);

        return {
          structuredData,
          rawResponse: aiResponse,
        };
      } catch (apiError) {
        console.error("Claude API error:", apiError);
        throw new Error(apiError.message || "Error calling Claude API");
      }
    } catch (err) {
      console.error("Error in Claude processing:", err);
      throw err;
    }
  };

  if (error) {
    return (
      <div className="text-red-500 text-sm p-2 bg-red-50 rounded-md">
        {error}
      </div>
    );
  }

  // Only show button if not auto-extracting
  if (autoExtract) {
    return isLoading ? (
      <div className="flex items-center gap-2 text-blue-600">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Processing...</span>
      </div>
    ) : null;
  }

  return (
    <button
      onClick={extractAndProcess}
      disabled={isLoading}
      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <FileText className="w-4 h-4" />
          Extract & Process
        </>
      )}
    </button>
  );
}
