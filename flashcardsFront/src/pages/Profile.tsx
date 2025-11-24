
// import { useState } from 'react';
// import { useToastStore } from '../store/useToastStore';
// import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useAuth } from '../contexts/AuthContext';
import { AuthLayout } from '../Layouts/AuthLayout'; // ✅ Import new layout

export const Profile = () => {
  const { user } = useAuth();
  // const { addToast } = useToastStore();
  // const [name, setName] = useState(user?.name || '');
  // const [email, setEmail] = useState(user?.email || '');
  // const [currentPassword, setCurrentPassword] = useState('');
  // const [newPassword, setNewPassword] = useState('');
  // const [confirmPassword, setConfirmPassword] = useState('');
  // const [isLoading, setIsLoading] = useState(false);

  // const handleUpdateProfile = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsLoading(true);
  //   try {
  //     await new Promise((resolve) => setTimeout(resolve, 1000));
  //     addToast('Profile updated successfully', 'success');
  //   } catch (error: any) {
  //     addToast(error.response?.data?.message || 'Failed to update profile', 'error');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const handleChangePassword = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (newPassword !== confirmPassword) {
  //     addToast('New passwords do not match', 'error');
  //     return;
  //   }
  //   setIsLoading(true);
  //   try {
  //     await new Promise((resolve) => setTimeout(resolve, 1000));
  //     setCurrentPassword('');
  //     setNewPassword('');
  //     setConfirmPassword('');
  //     addToast('Password changed successfully', 'success');
  //   } catch (error: any) {
  //     addToast(error.response?.data?.message || 'Failed to change password', 'error');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  return (
    <AuthLayout title="Profile Settings">
      <div className="space-y-6">
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Account Information</h2>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Plan</p>
                <p className="text-2xl font-bold text-medical-600 dark:text-medical-400 capitalize">Demo</p>
              </div>
              <div>
                {/* <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tokens Used</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">1°°°</p> */}
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
              <div
                className="bg-medical-600 h-2.5 rounded-full transition-all"
                style={{ width: `${user ? 1 * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </Card>

        {/* <Card>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Update Profile</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Update Profile
            </Button>
          </form>
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Change Password
            </Button>
          </form>
        </Card> */}
      </div>
    </AuthLayout>
  );
};