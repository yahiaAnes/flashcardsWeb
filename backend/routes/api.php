<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\LessonController;
use App\Http\Controllers\Api\AigenController;



Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/verify-email', [AuthController::class, 'verifyEmail']);

// Password reset routes
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);


// Protected routes (authentication required)
Route::middleware(['auth:sanctum'])->group(function () {
    // Auth routes that don't require email verification
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/resend-verification-email', [AuthController::class, 'resendVerificationEmail']);
    
    // Routes that require email verification
    Route::middleware(['verified'])->group(function () {
        Route::post('/change-password', [AuthController::class, 'changePassword']);
        
        // User management routes
        Route::apiResource('users', UserController::class);
    });

    // Lessons routes
    Route::post('createLesson', [LessonController::class , 'createLesson']);
    Route::get('lessons', [LessonController::class , 'getLessons']);
    Route::delete('/lessons/{lesson}', [LessonController::class, 'deleteLesson']);
    Route::get('getFlashcards', [LessonController::class , 'getFlashcards']);
    Route::post('createFlashcards', [LessonController::class , 'createFlashcards']);
    Route::post('/flashcards/{flashcard}/rate', [LessonController::class, 'rate']);
    Route::put('/flashcards/{flashcard}', [LessonController::class, 'update']);
    Route::delete('/deleteFlashcard/{flashcard}', [LessonController::class, 'deleteFlashcard']);
    Route::get('/lessons/{lesson}/with-flashcards', [LessonController::class, 'showWithFlashcards']);

    // flashcards routes
    Route::post('generateFlashcardsAi', [AigenController::class , 'generateFlashcardsAi']);
    Route::post('generateFlashcardsFromText', [AigenController::class , 'generateFlashcardsFromText']);
});
