import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileImage } from "lucide-react";
import { useState, useCallback } from "react";
import { FileUploadLayout } from "./components/FileUploadLayout";

function FileUploadForm({ onFileUpload }) {
  const handleFileChange = useCallback(
    async (event) => {
      const selectedFiles = Array.from(event.target.files);

      // Create preview URLs
      const newFiles = selectedFiles.map((file) => ({
        name: file.name,
        type: file.type.startsWith("image/")
          ? "image"
          : file.type.split("/")[1] || "document",
        url: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
        file,
      }));

      onFileUpload(newFiles);
    },
    [onFileUpload]
  );

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      const droppedFiles = Array.from(event.dataTransfer.files);

      const fileInput = document.getElementById("file-upload");
      const dataTransfer = new DataTransfer();

      droppedFiles.forEach((file) => {
        dataTransfer.items.add(file);
      });

      fileInput.files = dataTransfer.files;
      handleFileChange({ target: { files: dataTransfer.files } });
    },
    [handleFileChange]
  );

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full p-6"
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

export default function App() {
  const [files, setFiles] = useState([]);

  const handleFileUpload = (newFiles) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const handleFileRemove = (fileName) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
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
          <div className="flex flex-col">
            <AnimatePresence>
              {files.length === 0 ? (
                <FileUploadForm onFileUpload={handleFileUpload} />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-8"
                >
                  <FileUploadLayout
                    files={files}
                    onRemove={handleFileRemove}
                    onFileUpload={handleFileUpload}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </Router>
  );
}
