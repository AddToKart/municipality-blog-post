import React, { useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "./button";
import { Card } from "./card";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  X,
  Maximize2,
} from "lucide-react";

interface ImageResizerProps {
  imageUrl: string;
  onImageUpdated: (newImageUrl: string) => void;
  onClose: () => void;
  className?: string;
}

interface ImageDimensions {
  width: number;
  height: number;
}

interface ImageTransform {
  scale: number;
  rotation: number;
  x: number;
  y: number;
}

export const ImageResizer: React.FC<ImageResizerProps> = ({
  imageUrl,
  onImageUpdated,
  onClose,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const [dimensions, setDimensions] = useState<ImageDimensions>({
    width: 800,
    height: 600,
  });
  const [originalDimensions, setOriginalDimensions] = useState<ImageDimensions>(
    { width: 0, height: 0 }
  );
  const [transform, setTransform] = useState<ImageTransform>({
    scale: 1,
    rotation: 0,
    x: 0,
    y: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load image and set initial dimensions
  const handleImageLoad = useCallback((img: HTMLImageElement) => {
    setOriginalDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight,
    });
    setDimensions({
      width: Math.min(img.naturalWidth, 800),
      height: Math.min(img.naturalHeight, 600),
    });
    setImageLoaded(true);
    setIsLoading(false);
    setImageError(false);
    drawCanvas(img);
  }, []);

  // Draw image on canvas with current transform
  const drawCanvas = useCallback(
    (img?: HTMLImageElement) => {
      const canvas = canvasRef.current;
      const image = img || imageRef.current;
      if (!canvas || !image) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set canvas size
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Save context
      ctx.save();

      // Apply transforms
      ctx.translate(
        canvas.width / 2 + transform.x,
        canvas.height / 2 + transform.y
      );
      ctx.rotate((transform.rotation * Math.PI) / 180);
      ctx.scale(transform.scale, transform.scale);

      // Draw image centered
      ctx.drawImage(
        image,
        -image.naturalWidth / 2,
        -image.naturalHeight / 2,
        image.naturalWidth,
        image.naturalHeight
      );

      // Restore context
      ctx.restore();
    },
    [dimensions, transform]
  );

  // Handle zoom
  const handleZoom = (zoomIn: boolean) => {
    setTransform((prev) => ({
      ...prev,
      scale: zoomIn
        ? Math.min(prev.scale * 1.1, 3)
        : Math.max(prev.scale / 1.1, 0.1),
    }));
  };

  // Handle rotation
  const handleRotate = () => {
    setTransform((prev) => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360,
    }));
  };

  // Handle dimension changes
  const handleDimensionChange = (
    field: keyof ImageDimensions,
    value: number
  ) => {
    setDimensions((prev) => ({
      ...prev,
      [field]: Math.max(50, Math.min(value, 2000)),
    }));
  };

  // Handle mouse events for dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setTransform((prev) => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Reset transform
  const handleReset = () => {
    setTransform({ scale: 1, rotation: 0, x: 0, y: 0 });
    setDimensions({
      width: Math.min(originalDimensions.width, 800),
      height: Math.min(originalDimensions.height, 600),
    });
  };

  // Save resized image
  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      // Convert canvas to blob
      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            console.error("Failed to create blob from canvas");
            alert("Failed to process the image. Please try again.");
            return;
          }

          try {
            // Create FormData and upload
            const formData = new FormData();
            const file = new File([blob], "resized-image.png", {
              type: "image/png",
            });
            formData.append("image", file);

            const token = localStorage.getItem("authToken");
            const response = await fetch(
              "http://localhost:5000/api/upload/image",
              {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
              }
            );

            if (response.ok) {
              const data = await response.json();
              const fullUrl = `http://localhost:5000${data.data.url}`;
              onImageUpdated(fullUrl);
              onClose();
            } else {
              const errorData = await response.json();
              console.error("Upload failed:", errorData);
              alert("Failed to upload the resized image. Please try again.");
            }
          } catch (uploadError) {
            console.error("Upload error:", uploadError);
            alert(
              "Network error occurred. Please check your connection and try again."
            );
          }
        },
        "image/png",
        0.9
      );
    } catch (error) {
      console.error("Failed to save resized image:", error);
      alert(
        "Failed to process the image. This might be due to security restrictions."
      );
    }
  };

  // Apply preset sizes
  const applyPresetSize = (
    preset: "small" | "medium" | "large" | "original"
  ) => {
    const presets = {
      small: { width: 400, height: 300 },
      medium: { width: 800, height: 600 },
      large: { width: 1200, height: 900 },
      original: originalDimensions,
    };
    setDimensions(presets[preset]);
  };

  // Redraw canvas when transform or dimensions change
  React.useEffect(() => {
    if (imageLoaded) {
      drawCanvas();
    }
  }, [drawCanvas, imageLoaded]);

  // Prevent body scroll and handle escape key when modal is open
  React.useEffect(() => {
    // Prevent body scroll
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";

    // Handle escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = originalStyle;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const modalContent = (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] ${className}`}
      onClick={(e) => {
        // Only close if clicking the backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          onClose();
        }
      }}
    >
      <Card
        className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white"
        onClick={(e) => {
          // Prevent modal from closing when clicking inside
          e.stopPropagation();
        }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Resize Image</h2>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Hidden image for loading */}
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Original"
            className="hidden"
            crossOrigin="anonymous"
            onLoad={(e) => handleImageLoad(e.target as HTMLImageElement)}
            onError={(e) => {
              console.error("Failed to load image:", e);
              setImageError(true);
              setIsLoading(false);
            }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Canvas Preview */}
            <div className="lg:col-span-3">
              <div className="border rounded-lg p-4 bg-gray-50">
                {isLoading && (
                  <div className="flex items-center justify-center h-96 text-gray-500">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                      <p>Loading image...</p>
                    </div>
                  </div>
                )}
                {imageError && (
                  <div className="flex items-center justify-center h-96 text-red-500">
                    <div className="text-center">
                      <p>
                        Failed to load image. Please check the image URL and
                        CORS settings.
                      </p>
                    </div>
                  </div>
                )}
                {!isLoading && !imageError && (
                  <canvas
                    ref={canvasRef}
                    className="border border-gray-300 max-w-full max-h-96 cursor-move"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  />
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              {/* Transform Controls */}
              <div>
                <h3 className="font-medium mb-2">Transform</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleZoom(true);
                    }}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleZoom(false);
                    }}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRotate();
                    }}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleReset();
                    }}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Size Presets */}
              <div>
                <h3 className="font-medium mb-2">Size Presets</h3>
                <div className="space-y-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      applyPresetSize("small");
                    }}
                  >
                    Small (400×300)
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      applyPresetSize("medium");
                    }}
                  >
                    Medium (800×600)
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      applyPresetSize("large");
                    }}
                  >
                    Large (1200×900)
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      applyPresetSize("original");
                    }}
                  >
                    Original ({originalDimensions.width}×
                    {originalDimensions.height})
                  </Button>
                </div>
              </div>

              {/* Custom Dimensions */}
              <div>
                <h3 className="font-medium mb-2">Custom Size</h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-600">Width (px)</label>
                    <input
                      type="number"
                      value={dimensions.width}
                      onChange={(e) =>
                        handleDimensionChange(
                          "width",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full px-2 py-1 border rounded text-sm"
                      min="50"
                      max="2000"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Height (px)</label>
                    <input
                      type="number"
                      value={dimensions.height}
                      onChange={(e) =>
                        handleDimensionChange(
                          "height",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full px-2 py-1 border rounded text-sm"
                      min="50"
                      max="2000"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSave();
                  }}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Save & Use
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onClose();
                  }}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  // Render modal using portal to escape form context
  return createPortal(modalContent, document.body);
};
