import { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Image as ImageIcon, FileText } from "lucide-react";
import { FileList } from "./FileList";
import { FilePreview } from "./FilePreview";
import { TextExtractionPanel } from "./TextExtractionPanel";

export function FileUploadLayout({ files, onRemove, onFileUpload }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedText, setExtractedText] = useState({});
  const [isExtracting, setIsExtracting] = useState({});
  const [extractionErrors, setExtractionErrors] = useState({});

  const handleExtracted = (fileName, text) => {
    setExtractedText((prev) => ({
      ...prev,
      [fileName]: text,
    }));
    setIsExtracting((prev) => ({
      ...prev,
      [fileName]: false,
    }));
  };

  const handleExtractionError = (fileName, error) => {
    setExtractionErrors((prev) => ({
      ...prev,
      [fileName]: error,
    }));
    setIsExtracting((prev) => ({
      ...prev,
      [fileName]: false,
    }));
  };

  const handleExtractText = (file) => {
    if (file.type !== "image" || !file.file) return;
    
    // If we already have extracted text, don't extract again
    if (extractedText[file.name]) return;
    
    setIsExtracting((prev) => ({
      ...prev,
      [file.name]: true,
    }));
    
    // Extract text directly instead of using the component as a constructor
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
        const text = data.responses[0]?.fullTextAnnotation?.text || "No text found";
        handleExtracted(file.name, text);
      } catch (err) {
        handleExtractionError(file.name, err.message);
      }
    };

    reader.onerror = () => {
      handleExtractionError(file.name, "Error reading file");
    };

    reader.readAsDataURL(file.file);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-gray-50">
      {/* Left Panel - File List */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-80 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col"
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-800">Files</h2>
            </div>
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Upload className="w-4 h-4" />
              Add
            </label>
            <input
              type="file"
              className="hidden"
              id="file-upload"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              onChange={(e) => {
                const selectedFiles = Array.from(e.target.files);
                const newFiles = selectedFiles.map((file) => ({
                  name: file.name,
                  type: file.type.startsWith("image/")
                    ? "image"
                    : file.type.split("/")[1] || "document",
                  url: file.type.startsWith("image/")
                    ? URL.createObjectURL(file)
                    : null,
                  file,
                }));
                onFileUpload(newFiles);
              }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <FileList
            files={files}
            selectedFile={selectedFile}
            onSelect={setSelectedFile}
            onRemove={onRemove}
            onExtractText={handleExtractText}
          />
        </div>
      </motion.div>

      {/* Main Content Area - Preview and Text Extraction Side by Side */}
      <div className="flex-1 flex gap-4 ml-4">
        {/* Preview Area */}
        <div className="flex-1">
          <AnimatePresence>
            {selectedFile ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full bg-white border border-gray-200 rounded-lg shadow-sm"
              >
                <FilePreview file={selectedFile} />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex items-center justify-center bg-white border border-gray-200 rounded-lg shadow-sm"
              >
                <div className="text-center">
                  <ImageIcon className="w-24 h-24 text-gray-400 mx-auto mb-6" />
                  <p className="text-gray-500 text-xl mb-2">
                    Select a file to preview
                  </p>
                  <p className="text-gray-400 text-lg">
                    Choose from the list on the left
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Text Extraction Panel */}
        {selectedFile?.type === "image" && (
          <div className="w-96 bg-white border border-gray-200 rounded-lg shadow-sm">
            <TextExtractionPanel
              extractedText={extractedText[selectedFile.name]}
              isExtracting={isExtracting[selectedFile.name]}
              error={extractionErrors[selectedFile.name]}
              onRetry={() => handleExtractText(selectedFile)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
