import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileImage, File, X, ZoomIn, FileText } from "lucide-react";
import { useFileUpload } from "./hooks/useFileUpload";
import { useState } from "react";

function FileUploadForm({ handleFileChange, handleDrop, handleDragOver }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 p-6"
    >
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <motion.div
            className="flex items-center gap-2 mb-6"
            initial={{ x: -20 }}
            animate={{ x: 0 }}
          >
            <Upload className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-semibold text-gray-800">
              Upload Files
            </h2>
          </motion.div>

          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              type="file"
              className="hidden"
              id="file-upload"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileChange}
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center gap-3"
            >
              <FileImage className="w-12 h-12 text-blue-600" />
              <div className="text-gray-600">
                <span className="font-semibold text-blue-600">
                  Click to upload
                </span>{" "}
                or drag and drop
              </div>
              <p className="text-sm text-gray-500">
                PDF, DOC, DOCX or images (max. 10MB each)
              </p>
            </label>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ImagePreviewModal({ image, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-lg"
        >
          <X className="w-6 h-6" />
        </button>
        <img
          src={image.url}
          alt={image.name}
          className="w-full h-full object-contain"
        />
      </motion.div>
    </motion.div>
  );
}

function TextExtractionModal({ text, fileName, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Extracted Text from {fileName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-lg">
            {text}
          </pre>
        </div>
      </motion.div>
    </motion.div>
  );
}

function FilePreview({
  previews,
  extractedText,
  isExtracting,
  extractionErrors,
  handleRemove,
}) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedText, setSelectedText] = useState(null);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-80 bg-gray-50 border-l border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Preview</h3>
        <AnimatePresence>
          {previews.length > 0 ? (
            <motion.div className="space-y-4">
              {previews.map((file, index) => (
                <motion.div
                  key={file.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg p-3 shadow-sm flex items-center gap-3"
                >
                  <div
                    className={`relative group ${
                      file.type === "image" ? "cursor-pointer" : ""
                    }`}
                    onClick={() =>
                      file.type === "image" && setSelectedImage(file)
                    }
                  >
                    {file.type === "image" ? (
                      <>
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded transition-all flex items-center justify-center">
                          <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </>
                    ) : (
                      <File className="w-10 h-10 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-500">{file.type}</p>
                      {file.type === "image" && (
                        <>
                          {isExtracting[file.name] ? (
                            <p className="text-xs text-blue-600">
                              Extracting text...
                            </p>
                          ) : extractionErrors[file.name] ? (
                            <p
                              className="text-xs text-red-600"
                              title={extractionErrors[file.name]}
                            >
                              Error extracting text
                            </p>
                          ) : extractedText[file.name] ? (
                            <button
                              onClick={() => setSelectedText(file.name)}
                              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                              <FileText className="w-3 h-3" />
                              View Text
                            </button>
                          ) : null}
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => handleRemove(file.name)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <p className="text-gray-500 text-sm">No files selected</p>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {selectedImage && (
          <ImagePreviewModal
            image={selectedImage}
            onClose={() => setSelectedImage(null)}
          />
        )}
        {selectedText && (
          <TextExtractionModal
            fileName={selectedText}
            text={extractedText[selectedText]}
            onClose={() => setSelectedText(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function App() {
  const {
    previews,
    extractedText,
    isExtracting,
    extractionErrors,
    handleFileChange,
    handleDrop,
    handleDragOver,
    handleRemove,
  } = useFileUpload();

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-2xl font-bold text-blue-800"
            >
              Suyaash Pharmaceutical
            </motion.h1>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6">
          <div className="flex">
            <Routes>
              <Route
                path="/"
                element={
                  <>
                    <FileUploadForm
                      handleFileChange={handleFileChange}
                      handleDrop={handleDrop}
                      handleDragOver={handleDragOver}
                    />
                    <FilePreview
                      previews={previews}
                      extractedText={extractedText}
                      isExtracting={isExtracting}
                      extractionErrors={extractionErrors}
                      handleRemove={handleRemove}
                    />
                  </>
                }
              />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
