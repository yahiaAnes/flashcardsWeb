
export interface Lesson {
    id: number;
    name: string;
    user_id: number;
    created_at: string; 
    flashcards?: Flashcard[]; 
}

export interface GeneratedFlashcard {
    id: number;
    question: string;
    answer: string;
}

export interface Flashcard {
    id: number;
    question: string;
    answer: string;
    isFavorite?: boolean;
    lesson_id: number;
    difficulty: 'easy' | 'medium' | 'hard';
    repetition: number;
    last_reviewed_at: string | null;
    next_review_at: string | null;
}

export interface GeneratedFlashcardsResponse {
    lesson_id: number;
    flashcards: GeneratedFlashcard[];
}