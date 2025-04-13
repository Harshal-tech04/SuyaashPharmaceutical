import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileImage } from "lucide-react";
import { useState, useCallback } from "react";
import { FileUploadLayout } from "./components/FileUploadLayout";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
            <h2 className="text-2xl font-semibold text-gray-800">Add Files</h2>
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
                  Click to add
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
    toast.success(`File added successfully`);
  };

  const handleFileRemove = (fileName) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };

  return (
    <Router>
      <div className="min-h-screen p-10 bg-gray-50 flex flex-col">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <main className="flex-1">
          <AnimatePresence>
            {files.length === 0 ? (
              <FileUploadForm onFileUpload={handleFileUpload} />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className=""
              >
                <FileUploadLayout
                  files={files}
                  onRemove={handleFileRemove}
                  onFileUpload={handleFileUpload}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </Router>
  );
}
