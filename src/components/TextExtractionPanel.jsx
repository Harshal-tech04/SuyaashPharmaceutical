// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { Text, Copy, Check } from "lucide-react";
import { useState } from "react";

export function TextExtractionPanel({ extractedText }) {
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
      className="bg-white border-t border-gray-200 p-6"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Text className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Extracted Text
            </h3>
          </div>
          {extractedText && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Text
                </>
              )}
            </button>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          {extractedText ? (
            <pre className="whitespace-pre-wrap text-base text-gray-700 overflow-y-auto max-h-[calc(100vh-20rem)]">
              {extractedText}
            </pre>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No text extracted yet. Click the extract button in the file list
              to begin.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
