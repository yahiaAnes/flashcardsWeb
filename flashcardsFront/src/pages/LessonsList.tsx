// src/pages/LessonsList.tsx
import { useEffect, useState } from 'react';
import { useLessonStore } from '../store/useLessonStore';
import { useToastStore } from '../store/useToastStore';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../Layouts/AuthLayout';

export const LessonsList = () => {
  const { lessons, createLesson, deleteLesson, fetchLessons } = useLessonStore();
  const { addToast } = useToastStore();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<number | null>(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newLessonName, setNewLessonName] = useState('');
  const [creating, setCreating] = useState(false);

  // ✅ Fetch lessons when component mounts
  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const handleDeleteClick = (lessonId: number) => {
    setLessonToDelete(lessonId);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (lessonToDelete === null) return;
  
    try {
      await deleteLesson(lessonToDelete); 
      addToast('Lesson deleted successfully', 'success');
    } catch (error) {
      addToast('Failed to delete lesson', 'error');
    } finally {
      setDeleteModalOpen(false);
      setLessonToDelete(null);
    }
  };

  const handleCreateLesson = async () => {
    if (!newLessonName.trim()) {
      addToast('Lesson name cannot be empty', 'error');
      return;
    }

    try {
      setCreating(true);
      const newLesson = await createLesson(newLessonName);

      if (newLesson) {
        addToast('Lesson created successfully', 'success');
        setNewLessonName('');
        setCreateModalOpen(false);
      } else {
        addToast('Failed to create lesson', 'error');
      }
    } catch (error) {
      console.error(error);
      addToast('Failed to create lesson', 'error');
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <AuthLayout title='Lessons' btnText='Create New Lesson' btnFunction={() => setCreateModalOpen(true)}>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="flex-1 flex flex-col">
        

        <main className="flex-1">
          {lessons.length === 0 ? (
            <Card className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No lessons yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Start creating your first lesson</p>
              <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
                Create Your First Lesson
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lessons.map((lesson) => (
                <Card key={lesson.id} className="hover:shadow-lg transition-shadow">
                  <div className="flex flex-col h-full">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                        {lesson.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Created: {formatDate(lesson.created_at)}
                      </p>
                      {lesson.flashcards !== undefined && (
                        <div className="flex items-center text-emerald-600 dark:text-emerald-400 mb-4">
                          <span className="font-medium">
                            {lesson.flashcards.length} flashcard{lesson.flashcards.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Link
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center px-4 py-2 rounded-md transition-colors"
                        to={`/flashcards/${lesson.id}`} 
                      >
                        View
                      </Link>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteClick(lesson.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setLessonToDelete(null);
        }}
        title="Delete Lesson"
        size="sm"
      >
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Are you sure you want to delete this lesson? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </div>
      </Modal>

      {/* Create Lesson Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setNewLessonName('');
        }}
        title="Create New Lesson"
        size="sm"
      >
        <div className="flex flex-col space-y-4">
          <input
            type="text"
            placeholder="Lesson Name"
            value={newLessonName}
            onChange={(e) => setNewLessonName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
          />
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => {
                setCreateModalOpen(false);
                setNewLessonName('');
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateLesson} disabled={creating}>
              {creating ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
    </AuthLayout>
  );
};