import { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";

// Dynamically set worker based on version
const version = pdfjsLib.version || "3.11.174";
const isOldVersion = parseInt(version.split(".")[0]) < 4;

pdfjsLib.GlobalWorkerOptions.workerSrc = isOldVersion
  ? `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.worker.js`
  : `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;

interface TextItem {
  str: string;
  dir: string;
  transform: number[];
  width: number;
  height: number;
  fontName: string;
}

export const PdfReader = ({ file }: { file: File }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdf, setPdf] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1.5);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);

  // Load PDF
  useEffect(() => {
    const loadPdf = async () => {
      try {
        setError(null);
        setIsLoading(true);
        const buf = await file.arrayBuffer();
        const pdfDoc = await pdfjsLib.getDocument({ data: buf }).promise;
        setPdf(pdfDoc);
        setTotalPages(pdfDoc.numPages);
      } catch (err) {
        console.error("Error loading PDF:", err);
        setError("Failed to load PDF");
      } finally {
        setIsLoading(false);
      }
    };
    loadPdf();
  }, [file]);

  // Render text layer with precise positioning
  const renderTextLayer = useCallback(
    (
      textContent: any,
      textLayerDiv: HTMLDivElement,
      viewport: any,
      styles: any
    ) => {
      textLayerDiv.innerHTML = "";

      textContent.items.forEach((item: TextItem) => {
        if (!item.str || item.str.trim() === "") return;

        const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);

        // Calculate font size from transform matrix
        const fontHeight = Math.hypot(tx[2], tx[3]);
        const fontWidth = Math.hypot(tx[0], tx[1]);

        // Get rotation angle
        const angle = Math.atan2(tx[1], tx[0]);

        // Get font info
        const fontFamily = styles[item.fontName]?.fontFamily || "sans-serif";

        const span = document.createElement("span");
        span.textContent = item.str;

        // Position and style
        span.style.cssText = `
          position: absolute;
          left: ${tx[4]}px;
          top: ${tx[5] - fontHeight}px;
          font-size: ${fontHeight}px;
          font-family: ${fontFamily};
          transform: scaleX(${fontWidth / fontHeight}) rotate(${angle}rad);
          transform-origin: left bottom;
          white-space: pre;
          color: transparent;
          user-select: text;
          cursor: text;
          line-height: 1;
          pointer-events: auto;
        `;

        textLayerDiv.appendChild(span);
      });
    },
    []
  );

  // Render PDF pages
  useEffect(() => {
    if (!pdf || !containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = "";

    const renderPages = async () => {
      try {
        
        // Get device pixel ratio for sharp rendering
        const pixelRatio = window.devicePixelRatio || 1;

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale });

          // Create page wrapper
          const pageWrapper = document.createElement("div");
          pageWrapper.className = "pdf-page-wrapper";
          pageWrapper.style.cssText = `
            margin: 0 auto 20px auto;
            position: relative;
            background: white;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            border-radius: 4px;
            overflow: hidden;
          `;
          container.appendChild(pageWrapper);

          // Create canvas container
          const canvasContainer = document.createElement("div");
          canvasContainer.style.cssText = `
            position: relative;
            width: ${viewport.width}px;
            height: ${viewport.height}px;
          `;
          pageWrapper.appendChild(canvasContainer);

          // Create high-DPI canvas
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          
          // Scale canvas for high DPI displays
          canvas.width = viewport.width * pixelRatio;
          canvas.height = viewport.height * pixelRatio;
          canvas.style.width = `${viewport.width}px`;
          canvas.style.height = `${viewport.height}px`;
          
          canvasContainer.appendChild(canvas);

          // Render PDF page with high quality
          if (context) {
            context.scale(pixelRatio, pixelRatio);
            
            await page.render({
              canvasContext: context,
              viewport: viewport,
              intent: "display",
            }).promise;
          }

          // Create text layer
          const textLayerDiv = document.createElement("div");
          textLayerDiv.className = "textLayer";
          textLayerDiv.style.cssText = `
            position: absolute;
            left: 0;
            top: 0;
            width: ${viewport.width}px;
            height: ${viewport.height}px;
            overflow: hidden;
            user-select: text;
            line-height: 1;
          `;
          canvasContainer.appendChild(textLayerDiv);

          // Get text content and render
          const textContent = await page.getTextContent();
          renderTextLayer(
            textContent,
            textLayerDiv,
            viewport,
            textContent.styles
          );

          // Add page number label
          const pageLabel = document.createElement("div");
          pageLabel.textContent = `Page ${pageNum} of ${pdf.numPages}`;
          pageLabel.style.cssText = `
            text-align: center;
            padding: 8px;
            font-size: 12px;
            color: #666;
            background: #f5f5f5;
            border-top: 1px solid #e0e0e0;
          `;
          pageWrapper.appendChild(pageLabel);
        }
      } catch (err) {
        console.error("Error rendering pages:", err);
        setError("Failed to render PDF pages");
      } finally {
        console.log("Finished rendering PDF");
      }
    };

    renderPages();
  }, [pdf, scale, renderTextLayer]);

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setScale(1.5);

  if (error) {
    return (
      <div className="h-[600px] flex items-center justify-center text-red-600 dark:text-red-400">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="font-medium">{error}</p>
          <p className="text-sm mt-2">Please try uploading a different PDF</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px]">
      {/* Toolbar */}
      {pdf && (
        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-300 dark:border-gray-600 flex-wrap">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={scale <= 0.5}
              className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded text-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              title="Zoom Out"
            >
              −
            </button>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[50px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={scale >= 4}
              className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded text-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              title="Zoom In"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={handleResetZoom}
            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
            title="Reset Zoom"
          >
            Fit
          </button>

          {/* Page info */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {totalPages} {totalPages === 1 ? "page" : "pages"}
          </div>

          {/* Selection hint */}
          <div className="ml-auto text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
            💡 Highlight text to select
          </div>
        </div>
      )}

      {/* Loading indicator - only for initial load */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-10">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Loading PDF...</span>
          </div>
        </div>
      )}

      {/* PDF Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-gray-200 dark:bg-gray-800 rounded-lg"
        style={{
          userSelect: "text",
          cursor: "text",
          padding: "20px",
        }}
      />
    </div>
  );
};