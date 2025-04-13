import { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { FileList } from "./FileList";
import { FilePreview } from "./FilePreview";
import { JsonDataTable } from "./JsonDataTable";
import { toast } from "react-toastify";

export function FileUploadLayout({ files, onRemove, onFileUpload }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [processedFiles, setProcessedFiles] = useState(new Set());
  const [extractedData, setExtractedData] = useState(null);

  const handleExtractedData = (data) => {
    setIsLoading(false);
    setExtractedData(data);
    toast.success(`Data extracted successfully`);

    if (selectedFile) {
      setProcessedFiles((prev) => {
        const newSet = new Set(prev);
        newSet.add(selectedFile.name);
        return newSet;
      });
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);

    if (file?.type === "image") {
      if (!processedFiles.has(file.name)) {
        setIsLoading(true);
        toast.info(`Processing - extracting text and analyzing content`, {
          icon: "🔍",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    }
  };

  const handleFileUpload = (newFiles) => {
    onFileUpload(newFiles);
    toast.success(`File added successfully`);
  };

  const handleFileRemove = (fileName) => {
    setProcessedFiles((prev) => {
      const newSet = new Set(prev);
      newSet.delete(fileName);
      return newSet;
    });
    onRemove(fileName);
    toast.info(`File removed`);
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] bg-gray-50">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-1/5 min-w-[280px] h-full flex flex-col border-r border-gray-200 bg-white"
      >
        <div className="h-1/2 flex flex-col border-b border-gray-200">
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-800">Files</h2>
              </div>
              <div className="flex gap-2">
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex items-center gap-2 px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
                >
                  <Upload className="w-3 h-3" />
                  Add
                </label>
              </div>
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
                  handleFileUpload(newFiles);
                }}
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <FileList
              files={files}
              selectedFile={selectedFile}
              onSelect={handleFileSelect}
              onRemove={handleFileRemove}
              onExtractedData={handleExtractedData}
              processedFiles={processedFiles}
            />
          </div>
        </div>

        <div className="h-1/2 flex flex-col">
          <div className="p-3 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800">Preview</h2>
          </div>
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              {selectedFile ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full"
                >
                  <FilePreview file={selectedFile} />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex items-center justify-center"
                >
                  <div className="text-center p-4">
                    <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">
                      Select a file to preview
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <div className="flex-1 h-full p-4">
        <AnimatePresence mode="wait">
          {selectedFile?.type === "image" ? (
            isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex items-center justify-center"
              >
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-600 text-lg font-medium">
                    Processing document...
                  </p>
                  <p className="text-gray-400">
                    Extracting and structuring data with Claude AI
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="data"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full w-full"
              >
                <JsonDataTable
                  data={extractedData}
                  containerHeight="calc(100vh - 6rem)"
                />
              </motion.div>
            )
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex items-center justify-center"
            >
              <div className="text-center bg-white p-12 rounded-lg shadow-sm border border-gray-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="72"
                  height="72"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mx-auto mb-4 text-gray-300"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" />
                  <path d="M16 13H8" />
                  <path d="M16 17H8" />
                  <path d="M10 9H8" />
                </svg>
                <p className="text-gray-500 text-xl mb-2">
                  Select an image to extract data
                </p>
                <p className="text-gray-400 text-base">
                  Pharmaceutical document data will appear here
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
