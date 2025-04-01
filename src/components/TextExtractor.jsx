import { useState, useCallback } from "react";
import { FileText, Loader2 } from "lucide-react";

export function TextExtractor({ file, onExtracted }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const extractText = useCallback(async () => {
    if (!file) {
      setError("No file selected");
      return;
    }

    if (!(file instanceof Blob)) {
      setError("Invalid file object");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64Image = e.target.result.split(",")[1];
          const response = await fetch(
            `https://vision.googleapis.com/v1/images:annotate?key=${
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
            throw new Error(
              errorData.error?.message ||
                `HTTP error! status: ${response.status}`
            );
          }

          const data = await response.json();
          const extractedText =
            data.responses[0]?.fullTextAnnotation?.text || "No text found";
          onExtracted(extractedText);
        } catch (err) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };

      reader.onerror = () => {
        setError("Error reading file");
        setIsLoading(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  }, [file, onExtracted]);

  if (error) {
    return (
      <div className="text-red-500 text-sm p-2 bg-red-50 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <button
      onClick={extractText}
      disabled={isLoading}
      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Extracting...
        </>
      ) : (
        <>
          <FileText className="w-4 h-4" />
          Extract Text
        </>
      )}
    </button>
  );
}
