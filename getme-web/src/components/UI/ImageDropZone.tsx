import React, { useRef, useState } from 'react';
import { BiCloudUpload, BiCheckCircle, BiTrash } from 'react-icons/bi';

interface ImageDropzoneProps {
  label: string;
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  maxSizeKB?: number;
  submitError?: string;
}

export default function ImageDropzone({ 
  label, 
  selectedFile, 
  onFileSelect, 
  maxSizeKB = 2048 ,
  submitError,
}: ImageDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  // Combine client-side validation errors and server-side errors
  const activeError = localError || submitError;

  const handleFileValidation = (file: File) => {
    setLocalError(null);
    if (!file.type.startsWith('image/')) {
      setLocalError('Invalid file type. Please supply a JPG, JPEG, or PNG image map.');
      return;
    }
    if (file.size > maxSizeKB * 1024) {
      setLocalError(`File size limit exceeded. Max size allowed is ${maxSizeKB / 1024}MB.`);
      return;
    }
    onFileSelect(file);
  };

  // ... replace your bottom JSX check with {activeError && ...}

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-xs font-bold text-on-surface-variant tracking-wide">{label} <span className="text-error">*</span></label>
      
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[140px] ${
          selectedFile 
            ? 'border-success bg-success/5' 
            : activeError 
              ? 'border-error bg-error/5' 
              : 'border-outline-variant hover:border-primary bg-surface-container-low'
        }`}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          accept="image/jpeg,image/png,image/jpg"
          onChange={(e) => e.target.files?.[0] && handleFileValidation(e.target.files[0])}
        />

        {selectedFile ? (
          <div className="text-center space-y-2">
            <BiCheckCircle className="text-success text-3xl mx-auto" />
            <p className="text-xs font-bold text-on-surface truncate max-w-[200px]">{selectedFile.name}</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFileSelect(null);
              }}
              className="text-[11px] text-error flex items-center gap-1 mx-auto hover:underline font-semibold"
            >
              <BiTrash /> Remove file
            </button>
          </div>
        ) : (
          <div className="text-center space-y-1 text-muted-foreground">
            <BiCloudUpload className="text-3xl mx-auto text-primary" />
            <p className="text-xs font-bold text-on-surface">Click or Drag to Upload image</p>
            <p className="text-[10px]">JPEG, JPG, or PNG (Max {maxSizeKB / 1024}MB)</p>
          </div>
        )}
      </div>
      {activeError && <p className="text-[11px] text-error font-medium">{activeError}</p>}
    </div>
  );
}