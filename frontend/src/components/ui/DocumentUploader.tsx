import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileText,
  X,
  Loader,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "./button";

interface DocumentUploaderProps {
  onUpload?: (files: File[]) => Promise<string[]>;
  onDocumentInsert?: (url: string, filename: string) => void;
  className?: string;
  maxFiles?: number;
}

interface UploadedDocument {
  id: string;
  url: string;
  name: string;
  size: number;
  uploading?: boolean;
  error?: string;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onUpload,
  onDocumentInsert,
  className = "",
  maxFiles = 5,
}) => {
  const [uploadedDocuments, setUploadedDocuments] = useState<
    UploadedDocument[]
  >([]);
  const [uploading, setUploading] = useState(false);

  // Default document upload function
  const defaultDocumentUpload = async (files: File[]): Promise<string[]> => {
    console.log("Starting document upload for files:", files);

    if (!files || files.length === 0) {
      throw new Error("No files to upload");
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("document", file);

      const token = localStorage.getItem("authToken");
      console.log("=== DOCUMENT UPLOAD DEBUG ===");
      console.log(
        "Token from localStorage:",
        token ? `Token found (length: ${token.length})` : "No token found"
      );
      console.log(
        "Token preview (first 30 chars):",
        token ? token.substring(0, 30) + "..." : "N/A"
      );

      try {
        console.log(
          "Uploading document to: http://localhost:5000/api/upload/document"
        );

        const response = await fetch(
          "http://localhost:5000/api/upload/document",
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          }
        );

        console.log("Document upload response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Document upload error response:", errorText);

          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            throw new Error(
              `Upload failed with status ${response.status}: ${errorText}`
            );
          }

          throw new Error(
            errorData.error || `Upload failed with status ${response.status}`
          );
        }

        const data = await response.json();
        console.log("Document upload successful, response data:", data);

        if (!data.data || !data.data.url) {
          throw new Error("Invalid response format from server");
        }

        const fullUrl = `http://localhost:5000${data.data.url}`;
        console.log("Generated full document URL:", fullUrl);

        uploadedUrls.push(fullUrl);
      } catch (error) {
        console.error("Document upload failed:", error);
        throw error;
      }
    }

    return uploadedUrls;
  };

  // Handle file drops
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const uploadFunction = onUpload || defaultDocumentUpload;
      if (!uploadFunction) return;

      setUploading(true);
      try {
        // Add uploading placeholders
        const uploadingDocs = acceptedFiles.map((file, index) => ({
          id: `temp-${Date.now()}-${index}`,
          url: "",
          name: file.name,
          size: file.size,
          uploading: true,
        }));

        setUploadedDocuments((prev) => [...prev, ...uploadingDocs]);

        // Upload documents
        const uploadedUrls = await uploadFunction(acceptedFiles);

        // Replace uploading placeholders with actual URLs
        setUploadedDocuments((prev) => {
          const newDocs = [...prev];
          let uploadIndex = 0;

          for (let i = newDocs.length - 1; i >= 0; i--) {
            if (newDocs[i]?.uploading && uploadIndex < uploadedUrls.length) {
              newDocs[i] = {
                id: `uploaded-${Date.now()}-${uploadIndex}`,
                url: uploadedUrls[uploadIndex]!,
                name: acceptedFiles[uploadIndex]?.name || "document",
                size: acceptedFiles[uploadIndex]?.size || 0,
                uploading: false,
              };
              uploadIndex++;
            }
          }
          return newDocs;
        });

        console.log("Documents successfully uploaded");
      } catch (error) {
        console.error("Document upload failed:", error);

        // Mark failed uploads
        setUploadedDocuments((prev) =>
          prev.map((doc) => {
            if (
              doc.uploading &&
              acceptedFiles.some((file) => file.name === doc.name)
            ) {
              return { ...doc, uploading: false, error: "Upload failed" };
            }
            return doc;
          })
        );

        // Show user-friendly error message
        if (error instanceof Error) {
          alert(`Document upload failed: ${error.message}`);
        } else {
          alert("Document upload failed: Unknown error");
        }
      } finally {
        setUploading(false);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-powerpoint": [".ppt"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        [".pptx"],
      "text/plain": [".txt"],
      "application/rtf": [".rtf"],
    },
    maxFiles,
    disabled: uploading,
  });

  const removeDocument = (id: string) => {
    setUploadedDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  const insertDocument = (doc: UploadedDocument) => {
    if (onDocumentInsert) {
      onDocumentInsert(doc.url, doc.name);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]!;
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.toLowerCase().split(".").pop();
    switch (ext) {
      case "pdf":
        return <FileText className="w-4 h-4 text-red-500" />;
      case "doc":
      case "docx":
        return <FileText className="w-4 h-4 text-blue-500" />;
      case "xls":
      case "xlsx":
        return <FileText className="w-4 h-4 text-green-500" />;
      case "ppt":
      case "pptx":
        return <FileText className="w-4 h-4 text-orange-500" />;
      case "txt":
        return <FileText className="w-4 h-4 text-gray-500" />;
      case "rtf":
        return <FileText className="w-4 h-4 text-purple-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-200
          ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }
          ${uploading ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600 mb-1">
          {isDragActive
            ? "Drop documents here..."
            : "Drag & drop documents here, or click to browse"}
        </p>
        <p className="text-xs text-gray-500">
          Supports: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, RTF (max 25MB
          each)
        </p>
      </div>

      {/* Uploaded Documents List */}
      {uploadedDocuments.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Uploaded Documents
          </h4>
          {uploadedDocuments.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3 flex-1">
                {getFileIcon(doc.name)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {doc.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(doc.size)}
                  </p>
                </div>

                {doc.uploading && (
                  <Loader className="w-4 h-4 text-blue-500 animate-spin" />
                )}

                {doc.error && <AlertCircle className="w-4 h-4 text-red-500" />}

                {!doc.uploading && !doc.error && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
              </div>

              <div className="flex items-center space-x-2">
                {!doc.uploading && !doc.error && onDocumentInsert && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => insertDocument(doc)}
                  >
                    Insert Link
                  </Button>
                )}

                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => removeDocument(doc.id)}
                  disabled={doc.uploading}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
