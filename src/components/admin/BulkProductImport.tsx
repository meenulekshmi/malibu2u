'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RotateCcw,
  Layers,
  ChevronDown,
  ChevronUp,
  Package,
  Boxes,
  Tag,
  AlertTriangle,
  Loader2,
  FileCheck,
  Gamepad2,
  Sparkles,
} from 'lucide-react';
import {
  transformProductItem,
  TransformedProduct,
  getConditionDisplay,
} from '@/lib/product-import-utils';

interface BulkProductImportProps {
  onImportComplete?: () => void;
}

interface ImportReport {
  totalProcessed: number;
  imported: number;
  duplicatesSkipped: number;
  invalidCount: number;
  categoriesCreatedCount: number;
  newCategories: string[];
  skippedSkus: string[];
  invalidRecords: { index: number; sku?: string; name?: string; reason: string }[];
}

export function BulkProductImport({ onImportComplete }: BulkProductImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<any[] | null>(null);
  const [transformedPreview, setTransformedPreview] = useState<TransformedProduct[]>([]);
  const [detectedFormat, setDetectedFormat] = useState<'scraped' | 'native'>('native');
  const [isImporting, setIsImporting] = useState(false);
  const [importReport, setImportReport] = useState<ImportReport | null>(null);
  const [showInvalidDetails, setShowInvalidDetails] = useState(false);
  const [showDuplicateDetails, setShowDuplicateDetails] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const validateAndParseJson = (fileToParse: File) => {
    setFileError(null);
    setImportReport(null);

    if (!fileToParse.name.toLowerCase().endsWith('.json')) {
      setFileError('Invalid file type. Please upload a valid .json file.');
      setFile(null);
      setParsedData(null);
      setTransformedPreview([]);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text || text.trim() === '') {
          setFileError('The selected JSON file is empty.');
          setParsedData(null);
          setTransformedPreview([]);
          return;
        }

        const json = JSON.parse(text);
        let productsArray: any[] = [];

        if (Array.isArray(json)) {
          productsArray = json;
        } else if (json && Array.isArray(json.products)) {
          productsArray = json.products;
        } else {
          setFileError('Invalid JSON structure: Root must be an array of products or an object with a "products" array.');
          setParsedData(null);
          setTransformedPreview([]);
          return;
        }

        if (productsArray.length === 0) {
          setFileError('The JSON file contains an empty products array.');
          setParsedData(null);
          setTransformedPreview([]);
          return;
        }

        // Test format detection & transform items for preview
        let isScrapedFormat = false;
        const transformedList: TransformedProduct[] = [];
        const sampleErrors: string[] = [];

        productsArray.forEach((rawItem, index) => {
          if (rawItem && (rawItem.title || rawItem.web_scraper_order || rawItem.data4 || rawItem.price2)) {
            isScrapedFormat = true;
          }

          const transformed = transformProductItem(rawItem, index);
          if (transformed) {
            transformedList.push(transformed);
          } else {
            if (sampleErrors.length < 3) {
              const itemLabel = rawItem?.title || rawItem?.name || `Record #${index + 1}`;
              sampleErrors.push(`${itemLabel}: Missing valid title or price`);
            }
          }
        });

        if (transformedList.length === 0) {
          setFileError(`No valid products could be detected from this JSON. Issues found: ${sampleErrors.join(', ')}`);
          setParsedData(null);
          setTransformedPreview([]);
          return;
        }

        setFile(fileToParse);
        setParsedData(productsArray);
        setTransformedPreview(transformedList);
        setDetectedFormat(isScrapedFormat ? 'scraped' : 'native');
        setFileError(null);
      } catch (err: any) {
        setFileError(`Failed to parse JSON file: ${err.message || 'Syntax Error'}`);
        setParsedData(null);
        setTransformedPreview([]);
      }
    };

    reader.onerror = () => {
      setFileError('Error reading file from disk. Please try again.');
      setParsedData(null);
      setTransformedPreview([]);
    };

    reader.readAsText(fileToParse);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      validateAndParseJson(droppedFiles[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      validateAndParseJson(selectedFiles[0]);
    }
  };

  const handleClearFile = () => {
    setFile(null);
    setParsedData(null);
    setTransformedPreview([]);
    setFileError(null);
    setImportReport(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImport = async () => {
    if (!parsedData || parsedData.length === 0 || isImporting) return;

    setIsImporting(true);
    setFileError(null);

    try {
      const response = await fetch('/api/admin/products/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsedData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete bulk product import');
      }

      setImportReport(data.summary);
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (err: any) {
      setFileError(err.message || 'An unexpected error occurred during import.');
    } finally {
      setIsImporting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const previewSlice = transformedPreview.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#111726] to-cyan-950/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4" /> Admin Data Pipeline
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1">Bulk Product Import</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Accepts both <strong>Malibu2u standard</strong> and <strong>GameNation scraped JSON</strong> with automatic price, platform, and condition mapping.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {file && (
            <button
              onClick={handleClearFile}
              disabled={isImporting}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Form
            </button>
          )}
        </div>
      </div>

      {/* Upload Drop Zone */}
      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-cyan-400 bg-cyan-950/20 scale-[0.99]'
              : 'border-slate-800 hover:border-slate-700 bg-[#111726]/80 hover:bg-[#111726]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 shadow-lg shadow-cyan-500/10">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Drag & drop your products.json file</h3>
              <p className="text-xs text-slate-400 mt-1">
                or <span className="text-cyan-400 font-bold hover:underline">browse from your computer</span>
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
                <FileText className="w-3.5 h-3.5 text-cyan-400" /> Supports GameNation Scraped JSON
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Auto Price & Platform Detection
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Selected File Card */
        <div className="p-6 rounded-2xl bg-[#111726] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm">{file.name}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  {detectedFormat === 'scraped' ? 'Scraped Format Detected' : 'Standard JSON Ready'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-1">
                <span>Size: {formatFileSize(file.size)}</span>
                <span>•</span>
                <span>Total Detected: {transformedPreview.length} items</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleClearFile}
              disabled={isImporting}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <XCircle className="w-4 h-4 text-red-400" /> Change File
            </button>
            <button
              onClick={handleImport}
              disabled={isImporting || transformedPreview.length === 0}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  Importing ({transformedPreview.length} items)...
                </>
              ) : (
                <>
                  <Package className="w-4 h-4 text-slate-950" />
                  Import Products ({transformedPreview.length})
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {fileError && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-white">Validation Error</p>
            <p className="mt-0.5 text-slate-300">{fileError}</p>
          </div>
        </div>
      )}

      {/* Product Preview Section with Transformed Values */}
      {transformedPreview.length > 0 && !importReport && (
        <div className="p-6 rounded-2xl bg-[#111726] border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Boxes className="w-4 h-4 text-cyan-400" /> Dataset Preview (First {previewSlice.length} Products)
              </h3>
              <p className="text-xs text-slate-400">
                Showing {previewSlice.length} of {transformedPreview.length} products automatically normalized and ready to import.
              </p>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-3 py-1 rounded-full self-start sm:self-auto">
              Ready to Import: {transformedPreview.length} Products
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono">
                  <th className="py-3 px-2">Image</th>
                  <th className="py-3 px-2">Name</th>
                  <th className="py-3 px-2">Platform</th>
                  <th className="py-3 px-2">Condition</th>
                  <th className="py-3 px-2">Price</th>
                  <th className="py-3 px-2">Original Price</th>
                  <th className="py-3 px-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {previewSlice.map((p, idx) => {
                  const imageUrl =
                    (p.images && p.images[0]) ||
                    'https://images.unsplash.com/photo-1606813907291-d86efa9b94db';

                  return (
                    <tr key={idx} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-3 px-2">
                        <div className="w-12 h-12 rounded-lg bg-slate-900 overflow-hidden relative shrink-0 border border-slate-800">
                          <Image
                            src={imageUrl}
                            alt={p.name || 'Product preview'}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span className="font-bold text-white line-clamp-2 max-w-[240px]">{p.name}</span>
                        <span className="text-[10px] font-mono text-slate-400 block mt-0.5">SKU: {p.sku}</span>
                      </td>
                      <td className="py-3 px-2 font-mono">
                        <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold text-[10px]">
                          {p.platform}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.condition.includes('PREOWNED')
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {getConditionDisplay(p.condition)}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-bold font-mono text-emerald-400 text-sm">
                        ₹{p.price.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 font-mono text-slate-400 text-xs">
                        {p.mrp ? (
                          <span className="line-through">₹{p.mrp.toLocaleString()}</span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3 text-cyan-400" /> Ready
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Import Report Dialog / Summary Box */}
      {importReport && (
        <div className="p-8 rounded-3xl bg-gradient-to-b from-[#111726] to-slate-950 border border-cyan-500/40 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white tracking-tight">Import Process Completed</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Processed {importReport.totalProcessed} records from uploaded file.
                </p>
              </div>
            </div>
            <button
              onClick={handleClearFile}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors self-start sm:self-auto flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Import Another File
            </button>
          </div>

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
                <span>Imported Products</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-emerald-400 font-mono">{importReport.imported}</p>
              <p className="text-[10px] text-emerald-300/80">Added to live catalog</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
                <span>Duplicates Skipped</span>
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <p className="text-2xl font-black text-amber-400 font-mono">{importReport.duplicatesSkipped}</p>
              <p className="text-[10px] text-amber-300/80">Existing SKUs protected</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
                <span>Categories Created</span>
                <Tag className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <p className="text-2xl font-black text-cyan-400 font-mono">{importReport.categoriesCreatedCount}</p>
              <p className="text-[10px] text-cyan-300/80">New categories added</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-red-500/30 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
                <span>Invalid Records</span>
                <XCircle className="w-3.5 h-3.5 text-red-400" />
              </div>
              <p className="text-2xl font-black text-red-400 font-mono">{importReport.invalidCount}</p>
              <p className="text-[10px] text-red-300/80">Rejected records</p>
            </div>
          </div>

          {/* Created Categories List */}
          {importReport.newCategories && importReport.newCategories.length > 0 && (
            <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
              <p className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> Newly Created Categories:
              </p>
              <div className="flex flex-wrap gap-2">
                {importReport.newCategories.map((catName, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-cyan-900/40 border border-cyan-500/40 text-[11px] font-mono text-cyan-200">
                    {catName}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Collapsible Duplicate SKUs List */}
          {importReport.skippedSkus && importReport.skippedSkus.length > 0 && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/10 overflow-hidden">
              <button
                onClick={() => setShowDuplicateDetails(!showDuplicateDetails)}
                className="w-full p-4 flex items-center justify-between text-left text-xs font-bold text-amber-300 hover:bg-amber-950/20 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>View Skipped Duplicate SKUs ({importReport.skippedSkus.length})</span>
                </div>
                {showDuplicateDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showDuplicateDetails && (
                <div className="p-4 pt-0 border-t border-amber-500/20 space-y-2 text-xs">
                  <p className="text-[11px] text-slate-400">
                    The following SKUs were already present in the catalog and were skipped to avoid overwriting existing products:
                  </p>
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 rounded-xl bg-slate-950 border border-slate-800">
                    {importReport.skippedSkus.map((sku, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 border border-amber-500/40 font-mono text-[10px] text-amber-300">
                        {sku}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Collapsible Invalid Records List */}
          {importReport.invalidRecords && importReport.invalidRecords.length > 0 && (
            <div className="rounded-2xl border border-red-500/30 bg-red-950/10 overflow-hidden">
              <button
                onClick={() => setShowInvalidDetails(!showInvalidDetails)}
                className="w-full p-4 flex items-center justify-between text-left text-xs font-bold text-red-300 hover:bg-red-950/20 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span>View Rejected Records ({importReport.invalidRecords.length})</span>
                </div>
                {showInvalidDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showInvalidDetails && (
                <div className="p-4 pt-0 border-t border-red-500/20 space-y-2 text-xs">
                  <p className="text-[11px] text-slate-400">
                    These entries had missing required fields or invalid formatting:
                  </p>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto">
                    {importReport.invalidRecords.map((err, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-red-500/20 flex items-start justify-between gap-3">
                        <div>
                          <span className="font-mono text-[10px] text-red-400 font-bold">Record #{err.index}</span>
                          {err.sku && <span className="ml-2 font-mono text-[10px] text-slate-400">SKU: {err.sku}</span>}
                          {err.name && <span className="ml-2 text-xs text-white font-bold truncate max-w-xs inline-block">({err.name})</span>}
                        </div>
                        <span className="text-[11px] text-red-300">{err.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
