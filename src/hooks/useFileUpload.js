import { useState, useCallback } from 'react';

export function useFileUpload() {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [extractedText, setExtractedText] = useState({});
  const [isExtracting, setIsExtracting] = useState({});
  const [extractionErrors, setExtractionErrors] = useState({});

  const extractTextFromImage = async (file) => {
    try {
      setIsExtracting(prev => ({ ...prev, [file.name]: true }));
      setExtractionErrors(prev => ({ ...prev, [file.name]: null }));

      // Convert file to base64
      const reader = new FileReader();
      const base64Image = await new Promise((resolve, reject) => {
        reader.onloadend = () => {
          const base64String = reader.result.split(',')[1];
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Call Google Vision API
      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${import.meta.env.VITE_GOOGLE_CLOUD_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [
              {
                image: { content: base64Image },
                features: [{ type: 'TEXT_DETECTION' }],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to extract text: ${response.status}`);
      }

      const data = await response.json();
      const extractedText = data.responses[0]?.textAnnotations?.[0]?.description || 'No text found';

      setExtractedText(prev => ({
        ...prev,
        [file.name]: extractedText
      }));

      return extractedText;
    } catch (error) {
      console.error('Error extracting text:', error);
      setExtractionErrors(prev => ({
        ...prev,
        [file.name]: error.message
      }));
      return null;
    } finally {
      setIsExtracting(prev => ({ ...prev, [file.name]: false }));
    }
  };

  const handleFileChange = useCallback(async (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(selectedFiles);

    // Create preview URLs and extract text for images
    const newPreviews = await Promise.all(selectedFiles.map(async (file) => {
      if (file.type.startsWith('image/')) {
        const extractedText = await extractTextFromImage(file);
        return {
          name: file.name,
          type: 'image',
          url: URL.createObjectURL(file),
          hasText: !!extractedText
        };
      }
      return {
        name: file.name,
        type: file.type.split('/')[1] || 'document',
        url: null,
        hasText: false
      };
    }));

    setPreviews(newPreviews);
  }, []);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);

    const fileInput = document.getElementById('file-upload');
    const dataTransfer = new DataTransfer();

    droppedFiles.forEach(file => {
      dataTransfer.items.add(file);
    });

    fileInput.files = dataTransfer.files;
    handleFileChange({ target: { files: dataTransfer.files } });
  }, [handleFileChange]);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  const handleRemove = useCallback((fileName) => {
    setPreviews(prev => prev.filter(file => file.name !== fileName));
    setFiles(prev => prev.filter(file => file.name !== fileName));
    setExtractedText(prev => {
      const newState = { ...prev };
      delete newState[fileName];
      return newState;
    });
    setIsExtracting(prev => {
      const newState = { ...prev };
      delete newState[fileName];
      return newState;
    });
    setExtractionErrors(prev => {
      const newState = { ...prev };
      delete newState[fileName];
      return newState;
    });
  }, []);

  return {
    files,
    previews,
    extractedText,
    isExtracting,
    extractionErrors,
    handleFileChange,
    handleDrop,
    handleDragOver,
    handleRemove
  };
} 