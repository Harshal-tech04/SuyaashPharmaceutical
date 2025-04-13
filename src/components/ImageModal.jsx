import { useState, useRef } from "react";
// eslint-disable-next-line
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ZoomOut, RotateCw, Download } from "lucide-react";

export function ImageModal({ isOpen, onClose, imageUrl, fileName }) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const imageRef = useRef(null);

  const handleClose = () => {
    setScale(1);
    setRotation(0);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-w-[90vw] max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-4 right-4 flex gap-2 z-10">
              <button
                onClick={handleClose}
                className="p-2 text-black bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              ref={imageRef}
              src={imageUrl}
              alt={fileName}
              className="max-w-full max-h-[90vh] object-contain"
              style={{
                transform: `scale(${scale}) rotate(${rotation}deg)`,
                transition: "transform 0.2s ease-in-out",
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
