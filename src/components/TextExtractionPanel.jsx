// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Text, Copy, Check, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";

export function TextExtractionPanel({ extractedText, isExtracting, error, onRetry }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (extractedText) {
      await navigator.clipboard.writeText(extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      className="h-full flex flex-col"
    >
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Text className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Extracted Text
            </h3>
          </div>
          {extractedText && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        {isExtracting ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600">Extracting text...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4 max-w-md">
              <p className="font-medium mb-2">Error extracting text</p>
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={onRetry}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        ) : extractedText ? (
          <pre className="whitespace-pre-wrap text-base text-gray-700 bg-gray-50 rounded-lg p-4">
            {extractedText}
          </pre>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Text className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-500 mb-2">No text extracted yet</p>
            <p className="text-gray-400 text-sm">
              Click on an image file to extract text
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
