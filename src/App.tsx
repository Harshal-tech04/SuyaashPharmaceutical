import {
  Pill,
  Stethoscope,
  FileText,
  Image as ImageIcon,
  Upload,
  Loader2,
  Eye,
} from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "./components/ui/button";
import { Progress } from "./components/ui/progress";
import { Card, CardContent } from "./components/ui/card";

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  preview?: string;
  size: number;
  extractedText?: string;
}

function App() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isExtracting, setIsExtracting] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractTextFromImage = async (file: File): Promise<string> => {
    try {
      // Convert the file to base64
      const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64.split(",")[1]); // Remove the data URL prefix
        };
        reader.readAsDataURL(file);
      });

      // Make API request to Google Cloud Vision
      const response = await fetch(
        "https://vision.googleapis.com/v1/images:annotate?key=YOUR_API_KEY",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requests: [
              {
                image: {
                  content: base64Data,
                },
                features: [
                  {
                    type: "TEXT_DETECTION",
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      return data.responses[0]?.fullTextAnnotation?.text || "No text found";
    } catch (error) {
      console.error("Error extracting text:", error);
      return "Error extracting text";
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    // Create file preview for images
    let preview: string | undefined;
    if (file.type.startsWith("image/")) {
      preview = URL.createObjectURL(file);
    }

    try {
      setUploadProgress(10);

      // Create a unique filename with timestamp
      const timestamp = new Date().getTime();

      setUploadProgress(30);

      // Extract text if it's an image
      let extractedText: string | undefined;
      if (file.type.startsWith("image/")) {
        setIsExtracting(true);
        extractedText = await extractTextFromImage(file);
        setIsExtracting(false);
      }

      // Create the new file object
      const newFile: UploadedFile = {
        id: timestamp.toString(),
        name: file.name,
        type: file.type,
        size: file.size,
        preview,
        extractedText,
      };

      // Simulate upload progress
      setUploadProgress(70);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setUploadProgress(90);
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Add to uploaded files
      setUploadedFiles((prev) => [...prev, newFile]);
      setUploadProgress(100);

      // Reset progress after a short delay
      setTimeout(() => {
        setUploadProgress(0);
      }, 500);

      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload file. Please try again.");
      setUploadProgress(0);
      setIsExtracting(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const toggleTextPreview = (fileId: string) => {
    setSelectedFileId(selectedFileId === fileId ? null : fileId);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Pill className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-center text-primary">
              Suyaash Pharmaceutical
            </h1>
            <Stethoscope className="w-8 h-8 text-primary" />
          </div>

          {/* Subtitle */}
          <p className="text-center text-muted-foreground mb-8">
            Secure Document Management System
          </p>

          {/* Main content card */}
          <div className="bg-card rounded-lg shadow-lg border border-border">
            {/* Card header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-1">
                  <FileText className="w-6 h-6 text-primary" />
                  <ImageIcon className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-card-foreground">
                  Upload Medical Documents & Images
                </h2>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Upload prescriptions, medical reports, images, or other
                pharmaceutical documentation
              </p>
            </div>

            {/* Upload Area */}
            <div className="p-6">
              <div
                className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors"
                onClick={triggerFileInput}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    triggerFileInput();
                  }
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif"
                />
                <Button className="mx-auto flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Choose File
                </Button>
                <p className="mt-2 text-sm text-muted-foreground">
                  Click to select a file to upload
                </p>
              </div>

              {/* Upload Progress */}
              {(uploadProgress > 0 || isExtracting) && (
                <div className="mt-4">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                    {isExtracting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Extracting text...
                      </>
                    ) : uploadProgress === 100 ? (
                      "Upload complete!"
                    ) : (
                      `Uploading... ${uploadProgress}%`
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="px-6 pb-6">
                <h3 className="text-sm font-medium mb-2">Uploaded Files:</h3>
                <div className="space-y-2">
                  {uploadedFiles.map((file) => (
                    <div key={file.id}>
                      <div className="flex items-center justify-between p-2 bg-muted/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          {file.type.startsWith("image/") ? (
                            <ImageIcon className="w-4 h-4 text-primary" />
                          ) : (
                            <FileText className="w-4 h-4 text-primary" />
                          )}
                          <span className="text-sm">{file.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {file.extractedText && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary"
                              onClick={() => toggleTextPreview(file.id)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          <span className="text-xs text-green-600 font-medium">
                            Uploaded ✓
                          </span>
                        </div>
                      </div>
                      {selectedFileId === file.id && file.extractedText && (
                        <Card className="mt-2">
                          <CardContent className="p-4">
                            <p className="text-sm whitespace-pre-wrap">
                              {file.extractedText}
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="px-6 py-4 bg-muted/30 rounded-b-lg border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Supported formats: Images (PNG, JPG, GIF), PDF, DOC, DOCX, TXT •
                Maximum file size: 5MB
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
