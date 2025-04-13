import { useState, useRef, useEffect } from "react";
import {
  ScrollText,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Edit2,
  Save,
  X,
} from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

// Custom scrollbar styling
const scrollbarStyle = {
  "&::-webkit-scrollbar": {
    width: "5px",
    height: "5px",
  },
  "&::-webkit-scrollbar-track": {
    background: "transparent",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "rgba(186, 230, 253, 0.4)", // sky-200 with transparency
    borderRadius: "10px",
    "&:hover": {
      background: "rgba(125, 211, 252, 0.5)", // sky-300 with transparency
    },
  },
};

export function TextExtractionPanel({ extractedText, onTextUpdate }) {
  const [expanded, setExpanded] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(extractedText);
  const textareaRef = useRef(null);

  useEffect(() => {
    setEditedText(extractedText);
  }, [extractedText]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleCopy = async () => {
    if (!extractedText) return;

    try {
      await navigator.clipboard.writeText(extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (onTextUpdate) {
      onTextUpdate(editedText);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedText(extractedText);
    setIsEditing(false);
  };

  if (!extractedText) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 p-8 text-center">
        <div>
          <ScrollText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No extracted text</p>
          <p className="text-gray-400 text-sm">
            Use the "Extract & Process" button to get text from this image
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col bg-white rounded-lg shadow-sm relative"
    >
      {/* Fixed header */}
      <div className="border-b border-gray-200 bg-white p-4 absolute top-0 left-0 right-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-800">
              Extracted Text
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <button
                  onClick={handleCopy}
                  className="text-gray-500 hover:text-gray-700 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={handleEdit}
                  className="text-gray-500 hover:text-gray-700 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                  title="Edit text"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-gray-500 hover:text-gray-700 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                  title={expanded ? "Collapse" : "Expand"}
                >
                  {expanded ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="text-green-500 hover:text-green-600 p-1.5 rounded-md hover:bg-green-50 transition-colors"
                  title="Save changes"
                >
                  <Save className="w-5 h-5" />
                </button>
                <button
                  onClick={handleCancel}
                  className="text-red-500 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                  title="Cancel editing"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="flex-1 p-4 overflow-auto pt-16" style={scrollbarStyle}>
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full h-full p-3 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              style={{ minHeight: "200px" }}
            />
          ) : (
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed bg-gray-50 p-3 rounded-lg">
                {extractedText}
              </pre>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
