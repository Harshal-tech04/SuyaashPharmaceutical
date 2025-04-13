// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { File, X, Image as ImageIcon, Check } from "lucide-react";
import { TextExtractor } from "./TextExtractor";
import { useState } from "react";
import { toast } from "react-toastify";

export function FileList({
  files,
  selectedFile,
  onSelect,
  onRemove,
  onExtractedData,
  processedFiles = new Set(),
}) {
  const [processingFile, setProcessingFile] = useState(null);

  const handleFileSelect = (file) => {
    onSelect(file);

    // Only set for processing if image and not already processed
    if (file.type === "image" && !processedFiles.has(file.name)) {
      setProcessingFile(file);
    }
  };

  const handleDataExtracted = (structuredData, rawText) => {
    setProcessingFile(null);

    if (structuredData && onExtractedData) {
      onExtractedData(structuredData, rawText);
    } else {
      if (!structuredData) {
        toast.error("Failed to extract structured data from image");
      }
      console.warn(
        "Not calling onExtractedData - data missing or callback undefined"
      );
    }
  };

  return (
    <div className="p-4 space-y-4">
      <AnimatePresence>
        {files.length > 0 ? (
          files.map((file, index) => (
            <motion.div
              key={file.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedFile?.name === file.name ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => handleFileSelect(file)}
            >
              <div className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    {file.type === "image" ? (
                      <ImageIcon className="w-6 h-6 text-gray-600" />
                    ) : (
                      <File className="w-6 h-6 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <button
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemove(file.name);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 capitalize">
                        {file.type}
                      </span>
                      {processingFile?.name === file.name && (
                        <span className="text-xs text-blue-500">
                          Processing...
                        </span>
                      )}
                      {processedFiles.has(file.name) &&
                        file.type === "image" && (
                          <span className="text-xs text-green-500 flex items-center">
                            <Check className="w-3 h-3 mr-1" />
                            Processed
                          </span>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8"
          >
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No files uploaded yet</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden TextExtractor for auto-processing */}
      {processingFile && (
        <div className="hidden">
          <TextExtractor
            file={processingFile.file}
            onExtracted={handleDataExtracted}
            autoExtract={true}
          />
        </div>
      )}
    </div>
  );
}
