import { Link, useNavigate } from 'react-router-dom';
import { useLessonStore } from '../store/useLessonStore';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useAuth } from '../contexts/AuthContext';
import { AuthLayout } from '../Layouts/AuthLayout';

export const Dashboard = () => {
  const { user } = useAuth();
  const { lessons } = useLessonStore();
  const navigate = useNavigate();

 // const totalFlashcards = lessons.reduce((sum, lesson) => sum + lesson.flashcards.length, 0);
  const createLesson = () => {
    navigate('/create-flashcards');
  }



  return (
    <AuthLayout title="Dashboard" btnText="Create New Flashcard" btnFunction={() => {createLesson()}}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Lessons Created</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{lessons.length}</p>
            </div>
            <div className="text-4xl">📚</div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Flashcards</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">54</p>
            </div>
            <div className="text-4xl">💡</div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Remaining Quota</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">19</p>
            </div>
            <div className="text-4xl">⚡</div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Your Plan</h2>
          <div className="flex items-center space-x-4">
            <span className="text-2xl font-bold text-medical-600 dark:text-medical-400 capitalize">Free</span>
            <span className="text-gray-600 dark:text-gray-400">Plan</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Tokens Used</span>
            <span>1000</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div
              className="bg-medical-600 h-2.5 rounded-full transition-all"
              style={{
                width: `${user ? 0.2 * 100 : 0}%`,
              }}
            ></div>
          </div>
        </div>

      
          <Link to="/pricing">
            <Button variant="outline" className="mt-4">
              Upgrade Plan
            </Button>
          </Link>
        
      </Card>

      {lessons.length === 0 && (
        <Card className="mt-8 text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No lessons yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Start creating your first lesson to generate flashcards</p>
          <Link to="/create-lesson">
            <Button variant="primary">Create Your First Lesson</Button>
          </Link>
        </Card>
      )}
    </AuthLayout>
    
  );
};

