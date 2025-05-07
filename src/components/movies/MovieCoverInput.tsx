// components/CoverInput.tsx
"use client";

import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Image from "next/image";

interface CoverInputProps {
  defaultValue?: string;
  onChange?: (file: File | null) => void;
  required?: boolean;
}

export function CoverInput({
  defaultValue,
  onChange,
  required = false,
}: CoverInputProps) {
  const [preview, setPreview] = useState<string | null>(defaultValue || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateImage = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const imgElement = new window.Image();

      imgElement.onload = () => {
        const width = imgElement.width;
        const height = imgElement.height;
        const aspectRatio = width / height;

        // Check aspect ratio (should be 2:3)
        const targetAspectRatio = 2 / 3;
        const aspectRatioTolerance = 0.05; // 5% tolerance
        const isAspectRatioValid =
          Math.abs(aspectRatio - targetAspectRatio) <= aspectRatioTolerance;

        // Check dimensions
        const isMinSizeValid = width >= 500 && height >= 750;
        const isMaxSizeValid = width <= 2000 && height <= 3000;

        if (!isAspectRatioValid) {
          setError("Image must have an aspect ratio of 2:3");
          resolve(false);
        } else if (!isMinSizeValid) {
          setError("Image must be at least 500x750 pixels");
          resolve(false);
        } else if (!isMaxSizeValid) {
          setError("Image must be at most 2000x3000 pixels");
          resolve(false);
        } else {
          setError(null);
          resolve(true);
        }
      };

      imgElement.onerror = () => {
        setError("Invalid image file");
        resolve(false);
      };

      imgElement.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files && files.length > 0) {
      const file = files[0];

      if (!file.type.startsWith("image/")) {
        setError("File must be an image");
        setPreview(null);
        onChange?.(null);
        return;
      }

      const isValid = await validateImage(file);

      if (isValid) {
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        onChange?.(file);
      } else {
        setPreview(null);
        onChange?.(null);
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onChange?.(null);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="cover">Movie Poster</Label>

      <div className="flex flex-col items-center space-y-2">
        {preview ? (
          <div className="relative w-full aspect-[2/3]">
            <Image
              src={preview}
              alt="Movie poster preview"
              fill
              className="object-cover rounded-md"
              sizes="(max-width: 768px) 100vw, 300px"
              priority
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={handleRemove}
              className="absolute top-2 right-2 h-8 w-8 rounded-full z-10"
            >
              <X size={16} />
            </Button>
          </div>
        ) : (
          <div className="w-full border-2 border-dashed border-muted-foreground/50 rounded-md flex flex-col items-center justify-center py-6 aspect-[2/3]">
            <p className="text-sm text-muted-foreground mb-2">
              Upload movie poster
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer"
            >
              Select Image
            </Button>
          </div>
        )}

        <Input
          ref={fileInputRef}
          id="cover"
          name="cover"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          required={required && !preview}
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <p className="text-xs text-muted-foreground max-w-md text-center">
          Image must have a 2:3 aspect ratio. Minimum size: 500×750px. Maximum
          size: 2000×3000px. Recommended: 1000×1500px.
        </p>
      </div>
    </div>
  );
}
