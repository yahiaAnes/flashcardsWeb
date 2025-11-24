import type { ReactNode } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Button } from '../components/Button';
import { useState } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  btnText?: string;
  btnFunction?: () => void;
}

export const AuthLayout = ({ children, title, btnText, btnFunction }: AuthLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className={`flex-1 flex flex-col mx-auto w-screen transition-all duration-300 ${
            sidebarOpen ? 'max-w-7xl' : 'max-w-full'
          }`}>
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-8 py-6 transition-colors">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
            {btnText && btnFunction && (
              <Button variant="primary" onClick={btnFunction}>
                {btnText}
              </Button>
            )}
          </div>
        </header>
        
        <main className="flex-1 p-8">
          <div className={`mx-auto transition-all duration-300 ${
            sidebarOpen ? 'max-w-7xl' : 'max-w-full'
          }`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};