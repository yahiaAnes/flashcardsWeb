import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLessonStore } from '../store/useLessonStore';
import { useToastStore } from '../store/useToastStore';
import { Button } from '../components/Button';
import { FileUpload } from '../components/FileUpload';
import { apiService } from '../services/api';
import { PdfReader } from '../components/PdfReader';
import { AuthLayout } from '../Layouts/AuthLayout';

export const GenerateFlashcards = () => {
  const [selectedLessonId, setSelectedLessonId] = useState<number | ''>('');
  const [selectedCardsNumber, setSelectedCardsNumber] = useState<number | ''>('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfText, setPdfText] = useState<string>('');
  const [selectedText, setSelectedText] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { lessons, fetchLessons } = useLessonStore();
  const { addToast } = useToastStore();

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  // Extract text from PDF using PDF.js
// Extract text from PDF using PDF.js
const extractTextFromPDF = async (file: File) => {

  try {
    // Load PDF.js library from CDN
    const pdfjsLib = (window as any)['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.js';

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    // Extract text from all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += `\n\n--- Page ${i} ---\n\n${pageText}`;
    }
    
    setPdfText(fullText.trim());
    addToast('PDF loaded successfully! Select the text you want to use.', 'success');
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    addToast('Failed to read PDF content', 'error');
    setApiError('Failed to extract text from PDF. Please try another file.');
  } finally {
    console.log('Finished attempting to extract text from PDF');
  }
};
  const handleFileSelect = async (file: File) => {
    if (file.type !== 'application/pdf') {
      addToast('Please upload a PDF file', 'error');
      return;
    }
    setPdfFile(file);
    setPdfText('');
    setSelectedText('');
    setApiError(null);
    
    // Extract text from PDF
    await extractTextFromPDF(file);
  };

  // Handle text selection in the viewer
  const handleTextSelection = () => {
  const text = window.getSelection()?.toString().trim();

  if (text && text.length > 10) {
    setSelectedText(text);
    addToast(`Selected ${text.length} characters`, "success");
  }
};


  const handleUseAllText = () => {
    setSelectedText(pdfText);
    addToast('Using entire PDF content', 'success');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLessonId) {
      setApiError('Please select a lesson');
      return;
    }

    if (!selectedText) {
      setApiError('Please select text from the PDF or use all text');
      return;
    }

    setIsGenerating(true);
    setApiError(null);

    try {
      // Send selected text to Laravel API
      const response = await apiService.generateFlashcardsFromText(
        Number(selectedLessonId),
        Number(selectedCardsNumber),
        selectedText,
        pdfFile?.name || 'document.pdf'
      );

      if (response.success) {
        addToast('Flashcards generated successfully!', 'success');
        navigate(`/flashcards/${response.data.lesson_id}`);
      } else {
        throw new Error(response.message || 'Failed to generate flashcards');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to generate flashcards';
      setApiError(errorMessage);
      addToast(errorMessage, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AuthLayout title="Generate Flashcards" btnText="" btnFunction={() => {}}>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      
        <div className="flex-1 flex flex-col">
          <main className="flex-1">
            <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors h-fit">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Settings</h2>
                  
                  <div className="space-y-6">
                    {/* Lesson Select */}
                    <div>
                      <label htmlFor="lessonSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Lesson
                      </label>
                      <select
                        id="lessonSelect"
                        value={selectedLessonId}
                        onChange={(e) => {
                          setSelectedLessonId(e.target.value as any);
                          setApiError(null);
                        }}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        disabled={isGenerating}
                      >
                        <option value="">-- Choose a lesson --</option>
                        {lessons.map((lesson) => (
                          <option key={lesson.id} value={lesson.id}>
                            {lesson.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {/* Number of cards */}
                    <div>
                      <label htmlFor="numberSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select cards number
                      </label>
                      <select
                        id="numberSelect"
                        value={selectedCardsNumber}
                        onChange={(e) => {
                          setSelectedCardsNumber(e.target.value as any);
                          setApiError(null);
                        }}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        disabled={isGenerating}
                      >
                        <option value="">-- Choose a number --</option>
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                      </select>
                    </div>
                    {/* PDF Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Upload PDF File
                      </label>
                      <FileUpload 
                        onFileSelect={handleFileSelect} 
                        accept=".pdf"
                      />
                      {pdfFile && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          📄 {pdfFile.name}
                        </p>
                      )}
                    </div>

                    {/* Selection Info */}
                    {pdfText && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                          📝 Text Selection
                        </h3>
                        <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
                          {selectedText 
                            ? `Selected: ${selectedText.length} characters`
                            : 'Select text from the PDF viewer or use all text'}
                        </p>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={handleUseAllText}
                          disabled={isGenerating}
                        >
                          Use All Text
                        </Button>
                      </div>
                    )}

                    {apiError && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm text-red-600 dark:text-red-400">{apiError}</p>
                        </div>
                      </div>
                    )}

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      isLoading={isGenerating}
                      disabled={isGenerating || !selectedLessonId || !selectedText}
                      className="w-full"
                    >
                      {isGenerating ? 'Generating...' : 'Generate Flashcards'}
                    </Button>
                  </div>
                </div>

                {/* Right Column: PDF Viewer */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">PDF Viewer</h2>

                    {pdfFile && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleTextSelection}
                      >
                        Capture Selection
                      </Button>
                    )}
                  </div>

                  {pdfFile ? (
                    <div
                      onMouseUp={handleTextSelection}
                      className="border border-gray-300 dark:border-gray-600 rounded-lg"
                    >
                      <PdfReader file={pdfFile} />
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg h-[600px] flex items-center justify-center">
                      <div className="text-center text-gray-500 dark:text-gray-400">
                        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 00112.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <p className="text-lg font-medium">Upload a PDF to preview it</p>
                        <p className="text-sm mt-2">Then select text from the viewer</p>
                      </div>
                    </div>
                  )}
                </div>


              </div>
            </form>
          </main>
        </div>
      </div>
    </AuthLayout>
  );
};