import { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Image as ImageIcon } from "lucide-react";

export function FilePreview({ file }) {
  return (
    <div className="h-full flex flex-col">
      {/* Preview Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-900">{file.name}</span>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 p-4 overflow-auto">
        <AnimatePresence mode="wait">
          {file.type === "image" ? (
            <motion.div
              key="image"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex items-center justify-center"
            >
              <img
                src={file.url}
                alt={file.name}
                className="max-h-full max-w-full object-contain"
              />
            </motion.div>
          ) : (
            <motion.div
              key="document"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex items-center justify-center"
            >
              <FileText className="w-24 h-24 text-gray-400" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
