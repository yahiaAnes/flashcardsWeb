// src/store/useLessonStore.ts
import { create } from 'zustand';
import {apiService} from '../services/api'; 
import type { Lesson,Flashcard } from '../types'; 

interface LessonStore {
  lessons: Lesson[];
  loading: boolean;
  fetchLessons: () => Promise<void>;
  fetchLessonWithFlashcards: (lessonId: number) => Promise<void>;
  createLesson: (name: string) => Promise<Lesson | null>;
  deleteLesson: (id: number) => void;
  fetchFlashcards: (lessonId:number) => Promise<void>;
  updateFlashcard: (flashcardId: number, updates: Partial<Flashcard>) => Promise<void>;
  updateContentFlashcard: (flashcardId: number, updates: Partial<Flashcard>) => Promise<void>;
  deleteFlashcard: (flashcardId: number) => Promise<void>;
  createFlashcard: (lessonId: number, data: { question: string; answer: string }) => Promise<void>;

}

export const useLessonStore = create<LessonStore>((set, get) => ({
  lessons: [],
  loading: false,

  fetchLessons: async () => {
    set({ loading: true });
    try {
      const response = await apiService.getLessons(); 
      set({
        lessons: response.lessons.map((lesson: any) => ({
          ...lesson,
          flashcards: lesson.flashcards ?? []   
        }))
      });

    } catch (error) {
      console.error('Failed to fetch lessons:', error);
    } finally {
      set({ loading: false });
    }
  },
  fetchLessonWithFlashcards: async (lessonId: number) => {
    try {
      const data = await apiService.getLessonWithFlashcards(lessonId); // New API method
      
      set(state => {
        const lessonExists = state.lessons.some(l => l.id === lessonId);
        
        if (lessonExists) {
          // Update existing
          return {
            lessons: state.lessons.map(l =>
              l.id === lessonId ? { ...l, ...data.lesson, flashcards: data.flashcards } : l
            )
          };
        } else {
          // Add new lesson to store
          return {
            lessons: [...state.lessons, { ...data.lesson, flashcards: data.flashcards }]
          };
        }
      });
    } catch (error) {
      console.error('Failed to fetch lesson with flashcards:', error);
      throw error;
    }
  },
  createLesson: async (name: string) => {
    try {
      const response = await apiService.createLesson({ name });
      const newLesson = response.lesson; // ✅ Remove .data
      set({ lessons: [...get().lessons, newLesson] });
      return newLesson;
    } catch (error) {
      console.error('Failed to create lesson:', error);
      return null;
    }
  },

  deleteLesson: async (id: number) => {
    try {
      await apiService.deleteLesson(id); // ✅ call API
      // ✅ Optimistically remove from local state on success
      set({ lessons: get().lessons.filter(lesson => lesson.id !== id) });
    } catch (error) {
      console.error('Failed to delete lesson:', error);
      throw error; // Re-throw so UI can show error
    }
  },
  fetchFlashcards: async (lessonId: number) => {
    try {
      const data = await apiService.getFlashcards(lessonId);
      
      // Update the lesson in the store with flashcards
      set(state => ({
        lessons: state.lessons.map(lesson =>
          lesson.id === lessonId
            ? { ...lesson, flashcards: data.flashcards }
            : lesson
        )
      }));
    } catch (error) {
      console.error('Failed to fetch flashcards:', error);
      throw error;
    }
  },

  updateFlashcard: async (flashcardId, updates) => {
    await apiService.updateFlashcardDifficulty(flashcardId, updates.difficulty!);
    
    // Optimistically update local state
    set(state => ({
      lessons: state.lessons.map(lesson => ({
        ...lesson,
        flashcards: lesson.flashcards?.map(f => 
          f.id === flashcardId ? { ...f, ...updates } : f
        )
      }))
    }));
  },
  updateContentFlashcard: async (flashcardId, updates) => {
    await apiService.updateFlashcard(flashcardId, updates!);
    
    // Optimistically update local state
    set(state => ({
      lessons: state.lessons.map(lesson => ({
        ...lesson,
        flashcards: lesson.flashcards?.map(f => 
          f.id === flashcardId ? { ...f, ...updates } : f
        )
      }))
    }));
  },
  deleteFlashcard: async (flashcardId: number) => {
    await apiService.deleteFlashcard(flashcardId);
    
    // Remove from local state
    set(state => ({
      lessons: state.lessons.map(lesson => ({
        ...lesson,
        flashcards: lesson.flashcards?.filter(f => f.id !== flashcardId)
      }))
    }));
  },
  createFlashcard: async (lessonId: number, data: { question: string; answer: string }) => {
    const response = await apiService.createFlashcard(lessonId, data);
    const newFlashcard = response.flashcard;
    
    // Add to local state
    set(state => ({
      lessons: state.lessons.map(lesson =>
        lesson.id === lessonId
          ? { ...lesson, flashcards: [...(lesson.flashcards || []), newFlashcard] }
          : lesson
      )
    }));
  },
}));