<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\Lesson;
use App\Models\Flashcard;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class LessonController extends ApiController
{
    public function createLesson(REQUEST $request){
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // Create new lesson
            $lesson = Lesson::create([
                'name' => $request->name,
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Lesson created successfully',
                'lesson' => $lesson,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create lesson',
                'error' => $e->getMessage(),
            ], 500);
        }               

    }   

    public function getLessons(Request $request): JsonResponse
    {
        $lessons = Lesson::where('user_id', $request->user()->id)
            ->select('id', 'name', 'user_id', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'lessons' => $lessons
        ]);
    }

    public function deleteLesson(Lesson $lesson): JsonResponse
    {
        // 🔐 Ensure user can only delete their own lessons
        // if ($lesson->user_id !== auth()->id()) {
        //     return response()->json([
        //         'success' => false,
        //         'message' => 'Unauthorized: You cannot delete this lesson.'
        //     ], 403);
        // }

        // 🗑 Delete the lesson (hard delete)
        $lesson->delete();

        // ✅ Return success response
        return response()->json([
            'success' => true,
            'message' => 'Lesson deleted successfully'
        ], 200);
    }


    // Get Flashcards

    public function getFlashcards(Request $request): JsonResponse
    {
        $request->validate(['lesson_id' => 'required|exists:lessons,id']);
        
        $lesson = Lesson::findOrFail($request->lesson_id);
        
        // Ensure user owns the lesson
        // if ($lesson->user_id !== auth()->id()) {
        //     return response()->json(['error' => 'Unauthorized'], 403);
        // }

        $flashcards = $lesson->flashcards; // Assumes relationship exists

        return response()->json(['flashcards' => $flashcards]);
    }
    
    public function showWithFlashcards(Lesson $lesson)
    {
        if ($lesson->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json([
            'lesson' => $lesson,
            'flashcards' => $lesson->flashcards
        ]);
    }   

    public function createFlashcards(Request $request): JsonResponse
    {
        $request->validate([
            'lesson_id' => 'required|exists:lessons,id',
            'question' => 'required|string|max:1000',
            'answer' => 'required|string|max:2000',
        ]);
        
        $lesson = Lesson::findOrFail($request->lesson_id);
        
        // Ensure user owns the lesson
        if ($lesson->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $flashcard = Flashcard::create([
            'lesson_id' => $lesson->id,
            'user_id' => auth()->id(),
            'question' => $request->question,
            'answer' => $request->answer,
            'difficulty' => 'medium', // default difficulty
            'repetition' => 0,
            'next_review_at' => now(),
        ]);

        return response()->json(['flashcard' => $flashcard], 201);
    }

    public function rate(Request $request, Flashcard $flashcard)
    {
        $request->validate(['difficulty' => 'required|in:easy,medium,hard']);
        
        if ($flashcard->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Simple spaced repetition logic
        $interval = match($request->difficulty) {
            'easy' => 3,    // 3 days
            'medium' => 1,  // 1 day
            'hard' => 0,    // review again today
        };

        $flashcard->update([
            'difficulty' => $request->difficulty,
            'repetition' => $flashcard->repetition + 1,
            'last_reviewed_at' => now(),
            'next_review_at' => now()->addDays($interval),
        ]);

        return response()->json($flashcard);
    }
    
    public function update(Request $request, Flashcard $flashcard)
    {
        $request->validate([
            'question' => 'sometimes|string|max:1000',
            'answer' => 'sometimes|string|max:2000',
        ]);

        if ($flashcard->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $flashcard->update($request->only(['question', 'answer']));
        return response()->json($flashcard);
    }

    public function deleteFlashcard(Flashcard $flashcard)
    {
        if ($flashcard->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $flashcard->delete();

        return response()->json(['message' => 'Flashcard deleted successfully']);
    }
}
