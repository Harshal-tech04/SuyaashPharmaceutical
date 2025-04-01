// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { File, X, Image as ImageIcon } from "lucide-react";
import { TextExtractor } from "./TextExtractor";

export function FileList({
  files,
  selectedFile,
  onSelect,
  onRemove,
  onExtracted,
}) {
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
              onClick={() => onSelect(file)}
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
                      {file.type === "image" && (
                        <TextExtractor
                          file={file.file}
                          onExtracted={(text) => onExtracted(file.name, text)}
                        />
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
    </div>
  );
}
