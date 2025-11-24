import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLessonStore } from '../store/useLessonStore';
import { useToastStore } from '../store/useToastStore';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { AuthLayout } from '../Layouts/AuthLayout';

export const FlashcardsView = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { lessons, fetchLessonWithFlashcards, createFlashcard,updateFlashcard, updateContentFlashcard , deleteFlashcard} = useLessonStore();
  const { addToast } = useToastStore();

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [newCards, setNewCards] = useState<{ question: string; answer: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // ✅ Track edited flashcards locally
  const [editedCards, setEditedCards] = useState<Record<number, { question: string; answer: string }>>({});

  const lessonIdNum = lessonId ? Number(lessonId) : NaN;
  const lesson = lessons.find(l => l.id === lessonIdNum);

  // 🔁 Load flashcards on mount or when lessonId changes
  useEffect(() => {
    const loadFlashcards = async () => {
      if (!lessonId || isNaN(lessonIdNum)) {
        addToast('Invalid lesson ID', 'error');
        navigate('/lessons');
        return;
      }

      setLoading(true);
      try {
        const currentLesson = lessons.find(l => l.id === lessonIdNum);
        if (!currentLesson || !currentLesson.flashcards?.length) {
          await fetchLessonWithFlashcards(lessonIdNum);
        }
      } catch (error) {
        addToast('Failed to load flashcards', 'error');
        navigate('/lessons');
      } finally {
        setLoading(false);
      }
    };

    loadFlashcards();
  }, [lessonId, lessonIdNum, lessons, fetchLessonWithFlashcards, addToast, navigate]);

  // 🔄 Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [currentCardIndex]);

  // ✅ Initialize edited cards when modal opens
  useEffect(() => {
    if (isEditing && lesson?.flashcards) {
      const initial: Record<number, { question: string; answer: string }> = {};
      lesson.flashcards.forEach(card => {
        initial[card.id] = { question: card.question, answer: card.answer };
      });
      setEditedCards(initial);
    }
  }, [isEditing, lesson?.flashcards]);

  // ✅ Track cards to delete (we'll delete them when saving)
  const [cardsToDelete, setCardsToDelete] = useState<number[]>([]);

  // ✅ Mark card for deletion (doesn't delete immediately)
  const handleMarkForDelete = (id: number) => {
    setCardsToDelete(prev => [...prev, id]);
    
    // Also remove from editedCards
    setEditedCards(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  // ✅ Undo delete (before saving)
  const handleUndoDelete = (id: number) => {
    setCardsToDelete(prev => prev.filter(cardId => cardId !== id));
    
    // Restore to editedCards
    const card = flashcards.find(f => f.id === id);
    if (card) {
      setEditedCards(prev => ({
        ...prev,
        [id]: { question: card.question, answer: card.answer }
      }));
    }
  };
  if (loading) {
    return (
      <AuthLayout title="Loading Flashcards...">
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-xl text-gray-600 dark:text-gray-300">Loading flashcards...</div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (!lesson || !lesson.flashcards || lesson.flashcards.length === 0) {
    return (
      <AuthLayout title={lesson ? lesson.name : 'Flashcards'}>
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
          <div className="flex-1 p-8">
            <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                No Flashcards Found
              </h2>
              <Button variant="primary" onClick={() => navigate('/lessons')}>
                Go Back to Lessons
              </Button>
            </div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  const flashcards = lesson.flashcards;
  const currentCard = flashcards[currentCardIndex];

  const goToNext = () => {
    setCurrentCardIndex((prev) => (prev + 1) % flashcards.length);
  };

  const goToPrev = () => {
    setCurrentCardIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const handleDifficultySelect = async (difficulty: 'easy' | 'medium' | 'hard') => {
    try {
      await updateFlashcard(currentCard.id, {
        difficulty,
        repetition: (currentCard.repetition || 0) + 1,
      });
      goToNext();
    } catch (error) {
      addToast('Failed to save feedback', 'error');
    }
  };

  // ✅ Update local state when editing
  const handleInputChange = (id: number, field: 'question' | 'answer', value: string) => {
    setEditedCards(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };
// ✅ Add new empty card to repeater
  const handleAddNewCard = () => {
    setNewCards(prev => [...prev, { question: '', answer: '' }]);
  };

  // ✅ Update new card field
  const handleNewCardChange = (index: number, field: 'question' | 'answer', value: string) => {
    setNewCards(prev => prev.map((card, i) => 
      i === index ? { ...card, [field]: value } : card
    ));
  };

  // ✅ Remove new card from repeater
  const handleRemoveNewCard = (index: number) => {
    setNewCards(prev => prev.filter((_, i) => i !== index));
  };
  // ✅ Save all changes (update, delete, create)
  const handleSaveAll = async () => {
    try {
      // 1. Delete marked cards
      const deletePromises = cardsToDelete.map(id => deleteFlashcard(id));
      
      // 2. Update existing cards
      const updatePromises = Object.entries(editedCards)
        .filter(([id]) => !cardsToDelete.includes(Number(id)))
        .map(([id, data]) => updateContentFlashcard(Number(id), data));
      
      // 3. Create new cards (filter out empty ones)
      const validNewCards = newCards.filter(card => 
        card.question.trim() !== '' && card.answer.trim() !== ''
      );
      const createPromises = validNewCards.map(card => 
        createFlashcard(lessonIdNum, card)
      );
      
      // 4. Wait for all operations
      await Promise.all([...deletePromises, ...updatePromises, ...createPromises]);
      
      addToast('Flashcards saved!', 'success');
      
      // 5. Reset state
      setCardsToDelete([]);
      setNewCards([]);
      setIsEditing(false);
      
      if (currentCardIndex >= flashcards.length - cardsToDelete.length) {
        setCurrentCardIndex(0);
      }
    } catch (error) {
      addToast('Failed to save changes', 'error');
    }
  };

  // Cancel and discard all changes
  const handleCancel = () => {
    setEditedCards({});
    setCardsToDelete([]);
    setNewCards([]);
    setIsEditing(false);
  };
  return (
    <AuthLayout title={lesson.name} btnText='Edit flashcard' btnFunction={() => setIsEditing(true)}>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="flex-1">
          {/* Flashcard */}
          <main className="flex-1 flex flex-col items-center justify-center ">
            <div className="w-full max-w-2xl">
              <div
                className="relative h-80 mb-6 cursor-pointer"
                style={{ perspective: '1000px' }}
                onClick={() => {
                  if (!isFlipped) setIsFlipped(true);
                }}
              >
                <div
                  className="relative w-full h-full transition-transform duration-700"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                >
                  {/* Front - Question */}
                  <div
                    className="absolute w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-xl shadow-2xl p-8 flex flex-col justify-center items-center text-center"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <div className="text-sm uppercase tracking-wide text-blue-100 mb-4 font-semibold">
                      Question
                    </div>
                    <div className="text-2xl font-bold text-white leading-relaxed">
                      {currentCard.question}
                    </div>
                    <div className="mt-8 text-blue-100 text-sm">Click to reveal answer</div>
                  </div>

                  {/* Back - Answer */}
                  <div
                    className="absolute w-full h-full bg-gradient-to-br from-green-500 to-teal-600 dark:from-green-600 dark:to-teal-700 rounded-xl shadow-2xl p-8 flex flex-col justify-center items-center text-center"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    <div className="text-sm uppercase tracking-wide text-green-100 mb-4 font-semibold">
                      Answer
                    </div>
                    <div className="text-xl font-medium text-white leading-relaxed">
                      {currentCard.answer}
                    </div>

                    <div className="mt-6 flex flex-col items-center w-full">
                      <div className="text-green-100 text-sm mb-3">How well did you know it?</div>
                      <div className="flex gap-3 w-full justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDifficultySelect('hard');
                          }}
                          className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium"
                        >
                          😞 Hard
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDifficultySelect('medium');
                          }}
                          className="flex-1 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium"
                        >
                          🙂 Medium
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDifficultySelect('easy');
                          }}
                          className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium"
                        >
                          🤩 Easy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Info */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Repetitions: {currentCard.repetition || 0}</span>
                  <span>
                    Next review:{' '}
                    {currentCard.next_review_at
                      ? new Date(currentCard.next_review_at).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
                <div className="mt-2 text-center">
                  Difficulty:{' '}
                  <span className="font-medium capitalize">{currentCard.difficulty || 'medium'}</span>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between gap-4">
                <Button variant="outline" onClick={goToPrev} disabled={flashcards.length <= 1}>
                  ← Previous
                </Button>
                <Button
                  variant="primary"
                  onClick={goToNext}
                  size="lg"
                  disabled={flashcards.length <= 1}
                >
                  Next →
                </Button>
              </div>
            </div>
          </main>
        </div>

        {/* ✏️ Edit Modal */}
        <Modal
          isOpen={isEditing}
          onClose={handleCancel}
          title="Edit Flashcards"
          size="lg"
        >
          <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
            {/* ✅ Existing Cards Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Existing Cards ({flashcards.length})
              </h3>
              
              {flashcards.map((card) => {
                const isMarkedForDelete = cardsToDelete.includes(card.id);
                
                return (
                  <div
                    key={card.id}
                    className={`p-4 rounded-lg border ${
                      isMarkedForDelete
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 opacity-60'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {isMarkedForDelete ? (
                      <div className="flex items-center justify-between">
                        <span className="text-red-600 dark:text-red-400 text-sm">
                          This card will be deleted
                        </span>
                        <button
                          onClick={() => handleUndoDelete(card.id)}
                          className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                        >
                          Undo
                        </button>
                      </div>
                    ) : (
                      <>
                        <input
                          type="text"
                          value={editedCards[card.id]?.question ?? card.question}
                          onChange={(e) => handleInputChange(card.id, 'question', e.target.value)}
                          className="w-full px-3 py-2 mb-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="Question"
                        />
                        <input
                          type="text"
                          value={editedCards[card.id]?.answer ?? card.answer}
                          onChange={(e) => handleInputChange(card.id, 'answer', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          placeholder="Answer"
                        />
                        <div className="mt-2 flex justify-between items-center">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ID: {card.id}
                          </span>
                          <button
                            onClick={() => handleMarkForDelete(card.id)}
                            className="text-red-500 hover:text-red-600 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ✅ New Cards Section (Repeater) */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  Add New Cards ({newCards.length})
                </h3>
                <button
                  onClick={handleAddNewCard}
                  className="flex items-center gap-1 text-blue-500 hover:text-blue-600 text-sm font-medium"
                >
                  <span className="text-lg">+</span> Add Card
                </button>
              </div>

              {newCards.length === 0 ? (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
                  Click "Add Card" to create new flashcards
                </div>
              ) : (
                newCards.map((card, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border border-dashed border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                        New Card #{index + 1}
                      </span>
                      <button
                        onClick={() => handleRemoveNewCard(index)}
                        className="text-red-500 hover:text-red-600 text-sm"
                      >
                        ✕ Remove
                      </button>
                    </div>
                    <input
                      type="text"
                      value={card.question}
                      onChange={(e) => handleNewCardChange(index, 'question', e.target.value)}
                      className="w-full px-3 py-2 mb-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Enter question..."
                    />
                    <input
                      type="text"
                      value={card.answer}
                      onChange={(e) => handleNewCardChange(index, 'answer', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Enter answer..."
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ✅ Footer with stats and buttons */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500 dark:text-gray-400 space-x-4">
                {cardsToDelete.length > 0 && (
                  <span className="text-red-500">
                    {cardsToDelete.length} to delete
                  </span>
                )}
                {newCards.filter(c => c.question && c.answer).length > 0 && (
                  <span className="text-green-500">
                    {newCards.filter(c => c.question && c.answer).length} to add
                  </span>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSaveAll}>
                  Save All
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </AuthLayout>
  );
};