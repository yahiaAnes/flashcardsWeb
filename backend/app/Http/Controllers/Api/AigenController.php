<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;
use App\Models\Lesson;
use App\Models\Flashcard;
use Illuminate\Support\Facades\Auth;

use Spatie\PdfToText\Pdf as PdfParser;

class AigenController extends ApiController
{
    /**
     * Generate flashcards using AI from PDF or text input.
     */
    public function generateFlashcardsAi(Request $request): JsonResponse
    {
        // Validate input
        $validator = Validator::make($request->all(), [
            'lesson_id' => 'required|exists:lessons,id',
            'pdf' => 'nullable|file|mimes:pdf|max:10240',
            'text' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid input',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $lesson = Lesson::findOrFail($request->lesson_id);
            
            if ($lesson->user_id !== auth()->id()) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }

            // 📄 Get text (from PDF or direct input)
            $pdfText = null;

            if ($request->hasFile('pdf')) {
                try {
                    // Extract text from uploaded PDF
                    $pdfText = PdfParser::getText($request->file('pdf')->path());
                    
                    // Clean UTF-8 encoding issues
                    $pdfText = $this->cleanUtf8($pdfText);
                    
                    if (empty(trim($pdfText))) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Could not extract text from PDF. Ensure it is a valid text-based PDF (not scanned images).'
                        ], 400);
                    }
                } catch (\Exception $e) {
                    \Log::error('PDF Extraction Error', [
                        'exception' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                    return response()->json([
                        'success' => false,
                        'message' => 'Failed to process PDF: ' . $e->getMessage()
                    ], 400);
                }
            } else {
                $pdfText = $this->cleanUtf8($request->text);
            }

            if (empty($pdfText)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Please provide lesson text or upload a valid PDF.'
                ], 400);
            }

            // 🔤 Limit to 4000 characters (to respect token limits)
            //$textChunk = substr($pdfText, 0, 4000);
            $ncards = $request->cards_number ?? 10;
            // 🇫🇷 Your French prompt
            $prompt = "Analysez ce texte et générez exactement ".$ncards ."flashcards au format suivant. Chaque flashcard doit être numérotée et suivre ce format strict :

                FLASHCARD 1:
                Q: [Question claire et précise]
                A: [Réponse complète et détaillée]

                FLASHCARD 2:
                Q: [Question claire et précise]
                A: [Réponse complète et détaillée]

                ... et ainsi de suite jusqu'à FLASHCARD 10.

                Règles importantes :
                - Les questions doivent être variées (définitions, concepts, applications, etc.)
                - Les réponses doivent être complètes mais concises
                - Couvrez les points les plus importants du texte
                - Utilisez un langage clair et accessible

                Texte à analyser :
                " . $pdfText;

            // Check if API key is configured
            $apiKey = config('services.openrouter.api_key');
            if (empty($apiKey)) {
                \Log::error('OpenRouter API key not configured');
                return response()->json([
                    'success' => false,
                    'message' => 'API configuration error. Please contact support.'
                ], 500);
            }
            \Log::info('Making OpenRouter API request', [
                'model' => 'mistralai/mistral-7b-instruct:free',
                'text_length' => strlen($pdfText)
            ]);
            
            $response = Http::withToken($apiKey)
                ->withHeaders([
                    'HTTP-Referer' => config('app.url') ?? 'http://localhost',
                    'X-Title' => config('app.name') ?? 'Flashcard App',
                ])
                ->timeout(60)
                ->post('https://openrouter.ai/api/v1/chat/completions', [
                    'model' => 'mistralai/mistral-7b-instruct:free',
                    'messages' => [
                        ['role' => 'user', 'content' => $prompt]
                    ],
                    'max_tokens' => 1500,
                    'temperature' => 0.3,
                ]);
            
            if (!$response->successful()) {
                \Log::error('OpenRouter API Failure', [
                    'status' => $response->status(),
                    'response' => $response->body(),
                    'headers' => $response->headers(),
                ]);
            
                return response()->json([
                    'success' => false,
                    'message' => 'OpenRouter error: ' . ($response->json('error.message') ?? 'Unknown API error')
                ], 500);
            }

            $aiResponse = $response->json();
            $aiText = $aiResponse['choices'][0]['message']['content'] ?? '';
            
            // Clean UTF-8 encoding issues from AI response
            $aiText = $this->cleanUtf8($aiText);

            \Log::info('OpenRouter response received', [
                'response_length' => strlen($aiText),
                'preview' => substr($aiText, 0, 200)
            ]);

            // 🔍 Parse flashcards using your 3 regex patterns
            $flashcards = $this->parseFlashcardsFromResponse($aiText);

            if (empty($flashcards)) {
                \Log::warning('No flashcards parsed from AI response', [
                    'raw_response' => $aiText
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to parse flashcards from AI response. Please try again.'
                ], 500);
            }

            \Log::info('Flashcards parsed successfully', ['count' => count($flashcards)]);

            // 💾 Save to DB
            $saved = [];
            foreach ($flashcards as $item) {
                try {
                    $flashcard = Flashcard::create([
                        'lesson_id' => $lesson->id,
                        'question' => $this->cleanUtf8(trim($item['question'])),
                        'answer' => $this->cleanUtf8(trim($item['answer'])),
                        'user_id' =>auth()->id(),
                    ]);
                    
                    // Verify the flashcard can be JSON encoded
                    $testJson = @json_encode($flashcard->toArray());
                    if ($testJson === false) {
                        \Log::error('Flashcard JSON encoding failed', [
                            'question_raw' => bin2hex($item['question']),
                            'answer_raw' => bin2hex($item['answer']),
                            'json_error' => json_last_error_msg()
                        ]);
                        
                        // Try to fix and re-save
                        $flashcard->question = $this->cleanUtf8($flashcard->question);
                        $flashcard->answer = $this->cleanUtf8($flashcard->answer);
                        $flashcard->save();
                    }
                    
                    $saved[] = $flashcard;
                } catch (\Exception $e) {
                    \Log::error('Failed to save flashcard', [
                        'question' => $item['question'],
                        'answer' => $item['answer'],
                        'error' => $e->getMessage()
                    ]);
                }
            }
            
            if (empty($saved)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to save flashcards. Please check logs.'
                ], 500);
            }

            // Clean the saved data before returning
            $cleanedData = $this->utf8EncodeDeep([
                'lesson_id' => $lesson->id,
                'flashcards' => $saved,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Flashcards générées avec succès',
                'data' => $cleanedData
            ], 200, [], JSON_UNESCAPED_UNICODE);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            \Log::error('Lesson not found', ['lesson_id' => $request->lesson_id]);
            return response()->json([
                'success' => false,
                'message' => 'Lesson not found'
            ], 404);
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            \Log::error('OpenRouter Connection Error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to connect to AI service. Please check your internet connection.'
            ], 500);
        } catch (\Illuminate\Http\Client\RequestException $e) {
            \Log::error('OpenRouter Request Error', [
                'message' => $e->getMessage(),
                'response' => $e->response ? $e->response->body() : null
            ]);
            return response()->json([
                'success' => false,
                'message' => 'AI service request failed: ' . $e->getMessage()
            ], 500);
        } catch (\Exception $e) {
            \Log::error('AI Flashcard Generation Error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // If it's a JSON encoding error, provide more details
            if (strpos($e->getMessage(), 'json_encode') !== false || strpos($e->getMessage(), 'UTF-8') !== false) {
                return response()->json([
                    'success' => false,
                    'message' => 'Encoding error. Please try with different text or PDF.'
                ], 500);
            }
            
            return response()->json([
                'success' => false,
                'message' => config('app.debug') 
                    ? 'Error: ' . $e->getMessage() 
                    : 'Erreur du service IA. Veuillez réessayer.'
            ], 500);
        }
    }


    public function generateFlashcardsFromText(Request $request): JsonResponse
    {
        // Validate input
        $validator = Validator::make($request->all(), [
            'lesson_id' => 'required|exists:lessons,id',
            'text' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid input',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $lesson = Lesson::findOrFail($request->lesson_id);
            
            if ($lesson->user_id !== auth()->id()) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }

            $textgen = $this->cleanUtf8($request->text);

            // 🔤 Limit to 4000 characters (to respect token limits)
            //$textChunk = substr($textgen, 0, 1000);
            $ncards = $request->cards_number ?? 10;

            // 🇫🇷 Your French prompt
            $prompt = "Analysez ce texte et générez exactement ".$ncards." flashcards au format suivant. Chaque flashcard doit être numérotée et suivre ce format strict :

                FLASHCARD 1:
                Q: [Question claire et précise]
                A: [Réponse complète et détaillée]

                FLASHCARD 2:
                Q: [Question claire et précise]
                A: [Réponse complète et détaillée]

                ... et ainsi de suite jusqu'à FLASHCARD 10.

                Règles importantes :
                - Les questions doivent être variées (définitions, concepts, applications, etc.)
                - Les réponses doivent être complètes mais concises
                - Couvrez les points les plus importants du texte
                - Utilisez un langage clair et accessible

                Texte à analyser :
                " . $textgen;

            // Check if API key is configured
            $apiKey = config('services.openrouter.api_key');
            if (empty($apiKey)) {
                \Log::error('OpenRouter API key not configured');
                return response()->json([
                    'success' => false,
                    'message' => 'API configuration error. Please contact support.'
                ], 500);
            }
            \Log::info('Making OpenRouter API request', [
                'model' => 'mistralai/mistral-7b-instruct:free',
                'text_length' => strlen($textgen)
            ]);
            
            $response = Http::withToken($apiKey)
                ->withHeaders([
                    'HTTP-Referer' => config('app.url') ?? 'http://localhost',
                    'X-Title' => config('app.name') ?? 'Flashcard App',
                ])
                ->timeout(60)
                ->post('https://openrouter.ai/api/v1/chat/completions', [
                    'model' => 'mistralai/mistral-7b-instruct:free',
                    'messages' => [
                        ['role' => 'user', 'content' => $prompt]
                    ],
                    'max_tokens' => 1500,
                    'temperature' => 0.3,
                ]);
            
            if (!$response->successful()) {
                \Log::error('OpenRouter API Failure', [
                    'status' => $response->status(),
                    'response' => $response->body(),
                    'headers' => $response->headers(),
                ]);
            
                return response()->json([
                    'success' => false,
                    'message' => 'OpenRouter error: ' . ($response->json('error.message') ?? 'Unknown API error')
                ], 500);
            }

            $aiResponse = $response->json();
            $aiText = $aiResponse['choices'][0]['message']['content'] ?? '';
            
            // Clean UTF-8 encoding issues from AI response
            $aiText = $this->cleanUtf8($aiText);

            \Log::info('OpenRouter response received', [
                'response_length' => strlen($aiText),
                'preview' => substr($aiText, 0, 200)
            ]);

            // 🔍 Parse flashcards using your 3 regex patterns
            $flashcards = $this->parseFlashcardsFromResponse($aiText);

            if (empty($flashcards)) {
                \Log::warning('No flashcards parsed from AI response', [
                    'raw_response' => $aiText
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to parse flashcards from AI response. Please try again.'
                ], 500);
            }

            \Log::info('Flashcards parsed successfully', ['count' => count($flashcards)]);

            // 💾 Save to DB
            $saved = [];
            foreach ($flashcards as $item) {
                try {
                    $flashcard = Flashcard::create([
                        'lesson_id' => $lesson->id,
                        'question' => $this->cleanUtf8(trim($item['question'])),
                        'answer' => $this->cleanUtf8(trim($item['answer'])),
                        'user_id' =>auth()->id(),
                    ]);
                    
                    // Verify the flashcard can be JSON encoded
                    $testJson = @json_encode($flashcard->toArray());
                    if ($testJson === false) {
                        \Log::error('Flashcard JSON encoding failed', [
                            'question_raw' => bin2hex($item['question']),
                            'answer_raw' => bin2hex($item['answer']),
                            'json_error' => json_last_error_msg()
                        ]);
                        
                        // Try to fix and re-save
                        $flashcard->question = $this->cleanUtf8($flashcard->question);
                        $flashcard->answer = $this->cleanUtf8($flashcard->answer);
                        $flashcard->save();
                    }
                    
                    $saved[] = $flashcard;
                } catch (\Exception $e) {
                    \Log::error('Failed to save flashcard', [
                        'question' => $item['question'],
                        'answer' => $item['answer'],
                        'error' => $e->getMessage()
                    ]);
                }
            }
            
            if (empty($saved)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to save flashcards. Please check logs.'
                ], 500);
            }

            // Clean the saved data before returning
            $cleanedData = $this->utf8EncodeDeep([
                'lesson_id' => $lesson->id,
                'flashcards' => $saved,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Flashcards générées avec succès',
                'data' => $cleanedData
            ], 200, [], JSON_UNESCAPED_UNICODE);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            \Log::error('Lesson not found', ['lesson_id' => $request->lesson_id]);
            return response()->json([
                'success' => false,
                'message' => 'Lesson not found'
            ], 404);
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            \Log::error('OpenRouter Connection Error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to connect to AI service. Please check your internet connection.'
            ], 500);
        } catch (\Illuminate\Http\Client\RequestException $e) {
            \Log::error('OpenRouter Request Error', [
                'message' => $e->getMessage(),
                'response' => $e->response ? $e->response->body() : null
            ]);
            return response()->json([
                'success' => false,
                'message' => 'AI service request failed: ' . $e->getMessage()
            ], 500);
        } catch (\Exception $e) {
            \Log::error('AI Flashcard Generation Error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // If it's a JSON encoding error, provide more details
            if (strpos($e->getMessage(), 'json_encode') !== false || strpos($e->getMessage(), 'UTF-8') !== false) {
                return response()->json([
                    'success' => false,
                    'message' => 'Encoding error. Please try with different text or PDF.'
                ], 500);
            }
            
            return response()->json([
                'success' => false,
                'message' => config('app.debug') 
                    ? 'Error: ' . $e->getMessage() 
                    : 'Erreur du service IA. Veuillez réessayer.'
            ], 500);
        }
    }

    /**
     * Parse flashcards using your 3 regex patterns.
     */
    private function parseFlashcardsFromResponse(string $response): array
    {
        $flashcards = [];

        // Pattern 1: FLASHCARD X: format
        preg_match_all('/FLASHCARD\s+\d+:\s*\n\s*Q:\s*(.*?)\n\s*A:\s*(.*?)(?=FLASHCARD\s+\d+:|\z)/s', $response, $matches1, PREG_SET_ORDER);

        // Pattern 2: Simple Q: A: format
        if (empty($matches1)) {
            preg_match_all('/Q:\s*(.*?)\n\s*A:\s*(.*?)(?=\nQ:|\z)/s', $response, $matches2, PREG_SET_ORDER);
            $matches1 = $matches2;
        }

        // Pattern 3: Numbered format (1. Q: ... A: ...)
        if (empty($matches1)) {
            preg_match_all('/\d+\.\s*Q:\s*(.*?)\n\s*A:\s*(.*?)(?=\d+\.\s*Q:|\z)/s', $response, $matches3, PREG_SET_ORDER);
            $matches1 = $matches3;
        }

        foreach ($matches1 as $match) {
            // Clean extra whitespace and newlines
            $question = preg_replace('/\s+/', ' ', trim($match[1] ?? ''));
            $answer = preg_replace('/\s+/', ' ', trim($match[2] ?? ''));

            if (!empty($question) && !empty($answer)) {
                $flashcards[] = [
                    'question' => $question,
                    'answer' => $answer,
                ];
            }
        }

        return $flashcards;
    }

    /**
     * Clean and fix UTF-8 encoding issues - AGGRESSIVE VERSION
     */
    private function cleanUtf8(?string $text): string
    {
        if (empty($text)) {
            return '';
        }

        // Step 1: Try to detect the current encoding
        $encoding = mb_detect_encoding($text, ['UTF-8', 'ISO-8859-1', 'Windows-1252', 'ASCII'], true);
        
        if ($encoding && $encoding !== 'UTF-8') {
            // Convert from detected encoding to UTF-8
            $text = mb_convert_encoding($text, 'UTF-8', $encoding);
        }
        
        // Step 2: Remove invalid UTF-8 sequences (double pass)
        $text = mb_convert_encoding($text, 'UTF-8', 'UTF-8');
        
        // Step 3: Use iconv to strip remaining invalid characters
        if (function_exists('iconv')) {
            $text = @iconv('UTF-8', 'UTF-8//IGNORE', $text);
        }
        
        // Step 4: Remove control characters except newlines and tabs
        $text = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $text);
        
        // Step 5: Remove any remaining null bytes
        $text = str_replace(["\0", "\x00"], '', $text);
        
        // Step 6: Fix common problematic characters
        $text = str_replace([
            "\xC2\xA0", // Non-breaking space
            "\xEF\xBB\xBF", // UTF-8 BOM
        ], [
            ' ',
            '',
        ], $text);
        
        // Step 7: Normalize line endings
        $text = str_replace(["\r\n", "\r"], "\n", $text);
        
        // Step 8: Remove any 4-byte UTF-8 characters (emoji, etc.) if needed
        $text = preg_replace('/[\x{10000}-\x{10FFFF}]/u', '', $text);
        
        // Step 9: Final validation - replace anything that's still invalid
        if (!mb_check_encoding($text, 'UTF-8')) {
            $text = utf8_encode(utf8_decode($text));
        }
        
        return trim($text);
    }
    
    /**
     * Safely encode data to JSON with encoding fixes
     */
    private function safeJsonEncode($data)
    {
        // Try normal encoding first
        $json = @json_encode($data);
        
        if ($json === false && json_last_error() === JSON_ERROR_UTF8) {
            // If UTF-8 error, recursively clean the data
            $data = $this->utf8EncodeDeep($data);
            $json = json_encode($data);
        }
        
        return $json;
    }
    
    /**
     * Recursively encode arrays/objects for JSON
     */
    private function utf8EncodeDeep($data)
    {
        if (is_string($data)) {
            return $this->cleanUtf8($data);
        }
        
        if (is_array($data)) {
            foreach ($data as $key => $value) {
                $data[$key] = $this->utf8EncodeDeep($value);
            }
        }
        
        if (is_object($data)) {
            foreach ($data as $key => $value) {
                $data->$key = $this->utf8EncodeDeep($value);
            }
        }
        
        return $data;
    }
}