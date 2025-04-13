import { useState, useEffect } from "react";
import {
  Pencil,
  Save,
  X,
  ChevronDown,
  AlertCircle,
  SheetIcon,
  FileSpreadsheet,
} from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { addToSheet } from "../lib/addToSheet";

// Custom style for scrollbars
const scrollbarStyle = {
  "&::-webkit-scrollbar": {
    width: "5px",
    height: "5px",
  },
  "&::-webkit-scrollbar-track": {
    background: "transparent",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "rgba(186, 230, 253, 0.4)", // sky-200 with transparency
    borderRadius: "10px",
    "&:hover": {
      background: "rgba(125, 211, 252, 0.5)", // sky-300 with transparency
    },
  },
};

const TableRow = ({
  rowKey,
  rowValue,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  editValue,
  onEditValueChange,
}) => {
  return (
    <motion.tr
      key={rowKey}
      className="hover:bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      layout
    >
      <td className="py-2 px-3 align-middle font-medium text-gray-700 text-sm">
        {rowKey}
      </td>
      <td className="py-2 px-3 align-middle text-gray-700 text-sm">
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="editing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <input
                type="text"
                value={editValue}
                onChange={(e) => onEditValueChange(e.target.value)}
                className="w-full p-1.5 border border-gray-200 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 text-sm bg-white"
                autoFocus
              />
            </motion.div>
          ) : (
            <motion.span
              key="display"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="break-words text-gray-700"
            >
              {typeof rowValue === "string"
                ? rowValue
                : JSON.stringify(rowValue)}
            </motion.span>
          )}
        </AnimatePresence>
      </td>
      <td className="py-2 px-3 align-middle text-center">
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="editButtons"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center space-x-1 justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSave}
                className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                title="Save"
              >
                <Save className="w-3.5 h-3.5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCancel}
                className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                title="Cancel"
              >
                <X className="w-3.5 h-3.5" />
              </motion.button>
            </motion.div>
          ) : (
            <motion.button
              key="editButton"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onEdit}
              className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
              title="Edit"
            >
              <Pencil className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </AnimatePresence>
      </td>
    </motion.tr>
  );
};

const SimpleTable = ({ data, title, sectionKey, onEdit, editingState }) => {
  if (!data) return null;

  const { editingSection, editingKey, editValue, setEditValue } = editingState;

  return (
    <motion.div
      className="h-full flex flex-col relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Fixed section title */}
      <motion.div
        className="bg-white py-2 px-3 border-b border-gray-100 mb-2"
        layout
      >
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          {title}
        </h3>
      </motion.div>

      {/* Table with scrollable body */}
      <div className="overflow-auto" style={scrollbarStyle}>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-y border-gray-100">
              <th className="text-left py-2 px-3 font-medium text-gray-600 text-sm">
                Field
              </th>
              <th className="text-left py-2 px-3 font-medium text-gray-600 text-sm">
                Value
              </th>
              <th className="text-center py-2 px-3 font-medium text-gray-600 w-20 text-sm">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <AnimatePresence>
              {Object.entries(data).map(([key, value]) => (
                <TableRow
                  key={key}
                  rowKey={key}
                  rowValue={value}
                  isEditing={
                    editingSection === sectionKey && editingKey === key
                  }
                  onEdit={() => onEdit.start(sectionKey, key, value)}
                  onSave={onEdit.save}
                  onCancel={onEdit.cancel}
                  editValue={editValue}
                  onEditValueChange={setEditValue}
                />
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export function JsonDataTable({ data, containerHeight = "100%" }) {
  const [parsedData, setParsedData] = useState({
    metadata: null,
    mixingStep: null,
    phAdjustment: null,
  });
  const [editingSection, setEditingSection] = useState(null);
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [isAddingToSheet, setIsAddingToSheet] = useState(false);

  // Set height for the entire container
  const totalHeight = containerHeight || "100%";

  useEffect(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return;
    }

    // Assume the data is in the correct order: metadata, mixingStep, phAdjustment
    setParsedData({
      metadata: data[0] || null,
      mixingStep: data[1] || null,
      phAdjustment: data[2] || null,
    });
  }, [data]);

  const handleEdit = {
    start: (section, key, value) => {
      setEditingSection(section);
      setEditingKey(key);
      setEditValue(value);
    },
    save: () => {
      if (!editingSection || !editingKey) return;

      setParsedData((prevData) => ({
        ...prevData,
        [editingSection]: {
          ...prevData[editingSection],
          [editingKey]: editValue,
        },
      }));

      setEditingSection(null);
      setEditingKey(null);
      setEditValue("");
    },
    cancel: () => {
      setEditingSection(null);
      setEditingKey(null);
      setEditValue("");
    },
  };

  const editingState = {
    editingSection,
    editingKey,
    editValue,
    setEditValue,
  };

  const handleAddToSheet = async () => {
    try {
      setIsAddingToSheet(true);

      // Format the data for the sheet
      const formattedData = {
        metadata: parsedData.metadata || {},
        mixingStep: parsedData.mixingStep || {},
        phAdjustment: parsedData.phAdjustment || {},
        timestamp: new Date().toISOString(),
      };

      console.log("Adding data to sheet:", formattedData);

      // Call the addToSheet function from lib
      await addToSheet(formattedData);

      // Show success toast
      toast.success("Data successfully added to sheet!");
    } catch (error) {
      console.error("Error adding to sheet:", error);
      toast.error(`Failed to add data to sheet: ${error.message}`);
    } finally {
      setIsAddingToSheet(false);
    }
  };

  if (
    !parsedData.metadata &&
    !parsedData.mixingStep &&
    !parsedData.phAdjustment
  ) {
    return (
      <motion.div
        className="flex items-center justify-center h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="rounded-lg border bg-white p-8 text-center shadow"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <AlertCircle className="mx-auto h-8 w-8 text-gray-400 mb-3" />
          <p className="text-base font-medium text-gray-900 mb-1">
            No Data Available
          </p>
          <p className="text-gray-500 text-sm">
            Extracted data will appear here
          </p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="h-full relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Fixed header with Add to Sheet button */}
      <motion.div
        className="absolute top-0 left-0 right-0 bg-white py-3 px-4 z-30 shadow-sm flex justify-between items-center"
        style={{ borderBottom: "1px solid #e5e7eb" }}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-xl font-bold text-gray-800">
          Extracted Pharmaceutical Data
        </h2>
        <motion.button
          onClick={handleAddToSheet}
          className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isAddingToSheet}
        >
          {isAddingToSheet ? (
            <>
              <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
              Adding...
            </>
          ) : (
            <>
              <FileSpreadsheet className="w-4 h-4" />
              Add to Sheet
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Scrollable content with padding-top to account for fixed header */}
      <div
        className="h-full overflow-auto pt-14 bg-gray-50"
        style={{
          ...scrollbarStyle,
          height: totalHeight,
          maxHeight: totalHeight,
        }}
      >
        <div className="p-4">
          <motion.div
            className="space-y-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {/* Metadata Table at Top */}
            <AnimatePresence>
              {parsedData.metadata && (
                <motion.div
                  key="metadata"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="border border-gray-200 rounded-lg bg-white shadow-sm p-3"
                >
                  <SimpleTable
                    data={parsedData.metadata}
                    title="Document Metadata"
                    sectionKey="metadata"
                    onEdit={handleEdit}
                    editingState={editingState}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Process Steps Side by Side */}
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <AnimatePresence>
                {parsedData.mixingStep && (
                  <motion.div
                    key="mixingStep"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="border border-gray-200 rounded-lg bg-white shadow-sm p-3"
                  >
                    <SimpleTable
                      data={parsedData.mixingStep}
                      title="Process Step VI (Mixing Ingredients)"
                      sectionKey="mixingStep"
                      onEdit={handleEdit}
                      editingState={editingState}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {parsedData.phAdjustment && (
                  <motion.div
                    key="phAdjustment"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="border border-gray-200 rounded-lg bg-white shadow-sm p-3"
                  >
                    <SimpleTable
                      data={parsedData.phAdjustment}
                      title="Process Step VII (pH Adjustment)"
                      sectionKey="phAdjustment"
                      onEdit={handleEdit}
                      editingState={editingState}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
