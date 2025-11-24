import { useState } from 'react';
import type { Flashcard as FlashcardType } from '../types';

interface FlashcardProps {
  flashcard: FlashcardType;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export const Flashcard = ({ flashcard, isFavorite, onToggleFavorite }: FlashcardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="perspective-1000 relative w-full max-w-2xl mx-auto h-96">
      <div
        className={`card-flip ${isFlipped ? 'flipped' : ''} cursor-pointer relative w-full h-full`}
        onClick={handleFlip}
      >
        {/* Front (Question) */}
        <div className="card-face absolute inset-0 bg-gradient-to-br from-medical-500 to-medical-700 rounded-xl shadow-2xl flex items-center justify-center p-8 text-white">
          <div className="text-center w-full">
            <div className="absolute top-4 right-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite();
                }}
                className="text-white hover:text-yellow-300 transition-colors"
              >
                <svg
                  className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`}
                  fill={isFavorite ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </button>
            </div>
            <h3 className="text-xl font-semibold mb-4">Question</h3>
            <p className="text-lg">{flashcard.question}</p>
            <p className="text-sm mt-4 opacity-80">Click to reveal answer</p>
          </div>
        </div>

        {/* Back (Answer) */}
        <div className="card-face card-back absolute inset-0 bg-gradient-to-br from-medical-600 to-medical-800 rounded-xl shadow-2xl flex items-center justify-center p-8 text-white">
          <div className="text-center w-full">
            <h3 className="text-xl font-semibold mb-4">Answer</h3>
            <p className="text-lg">{flashcard.answer}</p>
            <p className="text-sm mt-4 opacity-80">Click to see question</p>
          </div>
        </div>
      </div>
    </div>
  );
};

