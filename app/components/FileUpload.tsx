"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  selectedFile: File | null;
  isLoading: boolean;
  onAnalyze: () => void;
}

export default function FileUpload({ onFileSelected, selectedFile, isLoading, onAnalyze }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".csv")) {
      onFileSelected(file);
    }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed
          py-12 px-8 cursor-pointer transition-all duration-200
          ${isDragging
            ? "border-wo-blue bg-wo-blue-light"
            : selectedFile
              ? "border-wo-blue bg-wo-blue-50"
              : "border-wo-blue/40 bg-wo-blue-50 hover:border-wo-blue hover:bg-wo-blue-light"
          }
          ${isLoading ? "pointer-events-none opacity-60" : ""}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          onChange={handleChange}
          className="hidden"
        />

        {/* Upload icon */}
        <div className="flex h-12 w-12 items-center justify-center">
          {selectedFile ? (
            <svg className="h-8 w-8 text-wo-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          ) : (
            <svg className="h-8 w-8 text-wo-blue/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          )}
        </div>

        {selectedFile ? (
          <div className="text-center">
            <p className="text-base font-semibold text-wo-navy">{selectedFile.name}</p>
            <p className="text-sm text-wo-gray mt-1">Click to change file</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-base font-semibold text-wo-navy">
              Drop your CSV bank statement here
            </p>
            <p className="text-sm text-wo-gray mt-1">
              or click to browse — any bank export works
            </p>
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/90">
            <div className="flex items-center gap-2 text-sm font-medium text-wo-blue">
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyzing your expenses…
            </div>
          </div>
        )}
      </div>

      {/* Analyze button — always visible, enabled after file is selected */}
      <button
        onClick={onAnalyze}
        disabled={!selectedFile || isLoading}
        className="w-full rounded-xl bg-wo-blue py-3 text-sm font-semibold text-white hover:bg-wo-blue-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
      >
        {isLoading ? "Analyzing…" : "Analyze"}
      </button>
    </div>
  );
}
