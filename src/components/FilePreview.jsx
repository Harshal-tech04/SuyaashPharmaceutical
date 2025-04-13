// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Image as ImageIcon, ZoomIn } from "lucide-react";
import { useState } from "react";
import { ImageModal } from "./ImageModal";

export function FilePreview({ file }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="h-full flex flex-col">
      {/* Preview Content */}
      <div className="flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {file.type === "image" ? (
            <motion.div
              key="image"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full flex items-center justify-center"
            >
              <div
                className="relative group cursor-pointer w-[200px] h-[200px]"
                onClick={() => setIsModalOpen(true)}
              >
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-full object-contain rounded-lg shadow-sm"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-lg">
                  <div className="bg-white p-2 rounded-full">
                    <ZoomIn className="w-6 h-6 text-gray-800" />
                  </div>
                </div>
              </div>
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

      {/* Image Modal */}
      <ImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageUrl={file?.url}
        fileName={file?.name}
      />
    </div>
  );
}
