import React, { useState, useCallback, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useDropzone } from "react-dropzone";
import { ImageResizer } from "./ImageResizer";
import {
  Bold,
  Italic,
  Underline,
  Link,
  List,
  ListOrdered,
  Image,
  AtSign,
  Hash,
  Upload,
  X,
  Loader,
} from "lucide-react";
import { Button } from "../ui/button";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onImageUpload?: (files: File[]) => Promise<string[]>;
}

interface UploadedImage {
  id: string;
  url: string;
  name: string;
  uploading?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "What's on your mind?",
  onImageUpload,
}) => {
  const [quillRef, setQuillRef] = useState<ReactQuill | null>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showImageResizer, setShowImageResizer] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState("");
  const [selectedImageRange, setSelectedImageRange] = useState<{
    index: number;
    length: number;
  } | null>(null);
  const [focusCount, setFocusCount] = useState(0);

  // Handle image selection for resizing
  const handleImageClick = useCallback(
    (e: Event) => {
      e.preventDefault();
      e.stopPropagation();

      const target = e.target as HTMLElement;

      if (target.tagName === "IMG") {
        const img = target as HTMLImageElement;

        // Prevent any default link behavior
        if (img.closest("a")) {
          return;
        }

        setSelectedImageUrl(img.src);

        // Find the image position in the editor
        if (quillRef) {
          const quill = quillRef.getEditor();
          const delta = quill.getContents();
          let index = 0;

          delta.ops?.forEach((op) => {
            if (
              op.insert &&
              typeof op.insert === "object" &&
              op.insert.image === img.src
            ) {
              setSelectedImageRange({ index, length: 1 });
            } else if (typeof op.insert === "string") {
              index += op.insert.length;
            } else {
              index += 1;
            }
          });
        }

        setShowImageResizer(true);
      }
    },
    [quillRef]
  );

  // Handle image update after resizing
  const handleImageUpdated = useCallback(
    (newImageUrl: string) => {
      if (quillRef && selectedImageRange) {
        const quill = quillRef.getEditor();

        // Replace the old image with the new resized image
        quill.deleteText(selectedImageRange.index, selectedImageRange.length);
        quill.insertEmbed(selectedImageRange.index, "image", newImageUrl);
        quill.setSelection(selectedImageRange.index + 1, 0);
      }

      setShowImageResizer(false);
      setSelectedImageUrl("");
      setSelectedImageRange(null);
    },
    [quillRef, selectedImageRange]
  );

  // Add event listener for image clicks
  React.useEffect(() => {
    const addImageClickListener = () => {
      const editorElement = document.querySelector(".ql-editor");
      if (editorElement) {
        // Remove any existing listeners first
        editorElement.removeEventListener("click", handleImageClick);
        // Add the new listener with capture to ensure it runs before other handlers
        editorElement.addEventListener("click", handleImageClick, {
          capture: true,
        });

        return () => {
          editorElement.removeEventListener("click", handleImageClick, {
            capture: true,
          });
        };
      }
    };

    // Add listener immediately if editor exists
    const cleanup = addImageClickListener();

    // Also add listener after a short delay to catch dynamically rendered content
    const timeoutId = setTimeout(addImageClickListener, 100);

    return () => {
      if (cleanup) cleanup();
      clearTimeout(timeoutId);
    };
  }, [handleImageClick, focusCount]);

  // Default image upload function
  const defaultImageUpload = async (files: File[]): Promise<string[]> => {
    if (!files || files.length === 0) {
      throw new Error("No files to upload");
    }

    const formData = new FormData();
    formData.append("image", files[0]);

    const token = localStorage.getItem("authToken");

    try {
      const response = await fetch("http://localhost:5000/api/upload/image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();

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

      if (!data.data || !data.data.url) {
        throw new Error("Invalid response format from server");
      }

      const fullUrl = `http://localhost:5000${data.data.url}`;

      return [fullUrl];
    } catch (error) {
      // Show user-friendly error message
      if (error instanceof Error) {
        alert(`Image upload failed: ${error.message}`);
      } else {
        alert("Image upload failed: Unknown error");
      }

      throw error;
    }
  };

  // Custom toolbar configuration
  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["link", "image"],
        ["clean"],
      ],
    },
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "list",
    "bullet",
    "align",
    "link",
    "image",
  ];

  // Handle image uploads via drag and drop
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const uploadFunction = onImageUpload || defaultImageUpload;
      if (!uploadFunction) return;

      setUploading(true);
      try {
        // Add uploading placeholders
        const uploadingImages = acceptedFiles.map((file, index) => ({
          id: `temp-${Date.now()}-${index}`,
          url: URL.createObjectURL(file),
          name: file.name,
          uploading: true,
        }));

        setUploadedImages((prev) => [...prev, ...uploadingImages]);

        // Upload images
        const uploadedUrls = await uploadFunction(acceptedFiles);

        // Replace uploading placeholders with actual URLs
        setUploadedImages((prev) => {
          const newImages = [...prev];
          let uploadIndex = 0;

          for (let i = newImages.length - 1; i >= 0; i--) {
            if (newImages[i]?.uploading && uploadIndex < uploadedUrls.length) {
              newImages[i] = {
                id: `uploaded-${Date.now()}-${uploadIndex}`,
                url: uploadedUrls[uploadIndex]!,
                name: acceptedFiles[uploadIndex]?.name || "image",
                uploading: false,
              };
              uploadIndex++;
            }
          }

          return newImages;
        });

        // Insert images into editor
        if (quillRef) {
          const quill = quillRef.getEditor();
          const range = quill.getSelection(true);

          uploadedUrls.forEach((url, index) => {
            quill.insertEmbed(range.index + index, "image", url);
            quill.setSelection(range.index + index + 1, 0);
          });
        }
      } catch (error) {
        // Remove failed uploads from the UI
        setUploadedImages((prev) =>
          prev.filter(
            (img) => !acceptedFiles.some((file) => img.name === file.name)
          )
        );
      } finally {
        setUploading(false);
      }
    },
    [onImageUpload, quillRef]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    multiple: true,
    noClick: true,
    noKeyboard: true,
  });

  // Remove uploaded image
  const removeImage = (imageId: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  // Handle editor focus
  const handleFocus = () => {
    setShowToolbar(true);
    setFocusCount((prev) => prev + 1);
  };

  // Handle editor blur with delay to allow toolbar interactions
  const handleBlur = () => {
    setTimeout(() => {
      setFocusCount((prev) => prev - 1);
    }, 150);
  };

  useEffect(() => {
    if (focusCount <= 0) {
      setShowToolbar(false);
    }
  }, [focusCount]);

  // Insert emoji
  const insertEmoji = (emoji: string) => {
    if (quillRef) {
      const quill = quillRef.getEditor();
      const range = quill.getSelection(true);
      quill.insertText(range.index, emoji);
      quill.setSelection(range.index + emoji.length);
    }
  };

  // Insert mention
  const insertMention = () => {
    if (quillRef) {
      const quill = quillRef.getEditor();
      const range = quill.getSelection(true);
      quill.insertText(range.index, "@");
      quill.setSelection(range.index + 1);
    }
  };

  // Insert hashtag
  const insertHashtag = () => {
    if (quillRef) {
      const quill = quillRef.getEditor();
      const range = quill.getSelection(true);
      quill.insertText(range.index, "#");
      quill.setSelection(range.index + 1);
    }
  };

  const commonEmojis = [
    "😀",
    "😂",
    "😍",
    "😎",
    "🤔",
    "👍",
    "❤️",
    "🎉",
    "🔥",
    "💯",
  ];

  return (
    <div className="w-full">
      {/* Main Editor Container */}
      <div
        {...getRootProps()}
        className={`
          relative border border-gray-300 rounded-lg bg-white transition-all duration-200
          ${isDragActive ? "border-blue-500 bg-blue-50" : ""}
          ${showToolbar ? "border-blue-500" : "hover:border-gray-400"}
        `}
      >
        <input {...getInputProps()} />

        {/* Drag overlay */}
        {isDragActive && (
          <div className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-500 rounded-lg flex items-center justify-center z-10">
            <div className="text-center">
              <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-blue-600 font-medium">
                Drop images here to upload
              </p>
            </div>
          </div>
        )}

        {/* Custom Toolbar */}
        {showToolbar && (
          <div className="border-b border-gray-200 p-3">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Text formatting */}
              <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
                <button
                  type="button"
                  className="p-2 hover:bg-gray-100 rounded"
                  onClick={() => quillRef?.getEditor().format("bold", true)}
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-2 hover:bg-gray-100 rounded"
                  onClick={() => quillRef?.getEditor().format("italic", true)}
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-2 hover:bg-gray-100 rounded"
                  onClick={() =>
                    quillRef?.getEditor().format("underline", true)
                  }
                >
                  <Underline className="w-4 h-4" />
                </button>
              </div>

              {/* Lists */}
              <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
                <button
                  type="button"
                  className="p-2 hover:bg-gray-100 rounded"
                  onClick={() => quillRef?.getEditor().format("list", "bullet")}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-2 hover:bg-gray-100 rounded"
                  onClick={() =>
                    quillRef?.getEditor().format("list", "ordered")
                  }
                >
                  <ListOrdered className="w-4 h-4" />
                </button>
              </div>

              {/* Insert options */}
              <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
                <button
                  type="button"
                  className="p-2 hover:bg-gray-100 rounded"
                  onClick={() => {
                    const url = prompt("Enter link URL:");
                    if (url) quillRef?.getEditor().format("link", url);
                  }}
                >
                  <Link className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-2 hover:bg-gray-100 rounded"
                  onClick={insertMention}
                >
                  <AtSign className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-2 hover:bg-gray-100 rounded"
                  onClick={insertHashtag}
                >
                  <Hash className="w-4 h-4" />
                </button>
              </div>

              {/* Emojis */}
              <div className="flex items-center gap-1">
                {commonEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className="p-1 hover:bg-gray-100 rounded text-lg"
                    onClick={() => insertEmoji(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Rich Text Editor */}
        <div className="p-4">
          <ReactQuill
            ref={(ref) => {
              setQuillRef(ref);
              if (ref) {
                // Add custom image handlers when Quill is ready
                const quill = ref.getEditor();

                // Single click handler
                quill.root.addEventListener("click", (e: Event) => {
                  const target = e.target as HTMLElement;
                  if (target.tagName === "IMG") {
                    e.preventDefault();
                    e.stopPropagation();
                    handleImageClick(e);
                  }
                });

                // Double click handler as backup
                quill.root.addEventListener("dblclick", (e: Event) => {
                  const target = e.target as HTMLElement;
                  if (target.tagName === "IMG") {
                    e.preventDefault();
                    e.stopPropagation();
                    handleImageClick(e);
                  }
                });

                // Right click handler for context menu
                quill.root.addEventListener("contextmenu", (e: Event) => {
                  const target = e.target as HTMLElement;
                  if (target.tagName === "IMG") {
                    e.preventDefault();
                    e.stopPropagation();
                    handleImageClick(e);
                  }
                });
              }
            }}
            theme="snow"
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            modules={modules}
            formats={formats}
            style={{
              minHeight: showToolbar ? "200px" : "120px",
              border: "none",
            }}
          />
        </div>

        {/* Image Upload Area */}
        <div className="border-t border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => document.getElementById("image-upload")?.click()}
              >
                <Image className="w-4 h-4" />
                Add Photos
              </Button>

              {/* Test Image Resizer Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => {
                  // Test with a sample image URL
                  setSelectedImageUrl("https://via.placeholder.com/600x400");
                  setShowImageResizer(true);
                }}
              >
                🔧 Test Resizer
              </Button>

              <input
                id="image-upload"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length > 0) {
                    onDrop(files);
                  }
                  e.target.value = ""; // Reset input
                }}
              />

              {uploading && (
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Uploading...</span>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-500">
              Drag & drop images or click to browse
            </p>
          </div>

          {/* Uploaded Images Preview */}
          {uploadedImages.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {uploadedImages.map((image) => (
                <div key={image.id} className="relative">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border">
                    {image.uploading ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <Loader className="w-4 h-4 animate-spin text-gray-400" />
                      </div>
                    ) : (
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  {!image.uploading && (
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Custom Quill Styles */}
      <style>{`
        .ql-toolbar {
          display: none !important;
        }
        
        .ql-container {
          border: none !important;
          font-family: inherit;
        }
        
        .ql-editor {
          padding: 0 !important;
          min-height: 100px;
          font-size: 16px;
          line-height: 1.6;
        }
        
        .ql-editor.ql-blank::before {
          font-style: normal;
          color: #9ca3af;
          left: 0;
        }
        
        .ql-editor p {
          margin: 0 0 8px 0;
        }
        
        .ql-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 8px 0;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.2s;
          position: relative;
        }
        
        .ql-editor img:hover {
          border-color: #3b82f6;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
          transform: scale(1.02);
        }
        
        .ql-editor img:hover::after {
          content: "Click to resize";
          position: absolute;
          top: -25px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(59, 130, 246, 0.9);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          white-space: nowrap;
          pointer-events: none;
        }
      `}</style>

      {/* Image Resizer Modal */}
      {showImageResizer && selectedImageUrl && (
        <ImageResizer
          imageUrl={selectedImageUrl}
          onImageUpdated={handleImageUpdated}
          onClose={() => {
            setShowImageResizer(false);
            setSelectedImageUrl("");
            setSelectedImageRange(null);
          }}
        />
      )}
    </div>
  );
};
