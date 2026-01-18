import { useState } from 'react';
import { SpinWheel } from './components/SpinWheel';
import { AdminDashboard } from './components/AdminDashboard';
import { LandingPage } from './components/LandingPage';
import { Button } from './components/ui/button';
import { Settings, Sparkles, House } from 'lucide-react';
import { Toaster } from './components/ui/sonner';

function App() {
  const [view, setView] = useState<'landing' | 'user' | 'admin'>('landing');

  return (
    <>
      <div className="fixed top-4 right-4 z-50 flex gap-2 flex-wrap justify-end">
        <Button
          variant={view === 'landing' ? 'default' : 'outline'}
          onClick={() => setView('landing')}
          className={view === 'landing' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-white'}
          size="sm"
        >
          <House className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Home</span>
        </Button>
        <Button
          variant={view === 'user' ? 'default' : 'outline'}
          onClick={() => setView('user')}
          className={view === 'user' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-white'}
          size="sm"
        >
          <Sparkles className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Spin Wheel</span>
        </Button>
        <Button
          variant={view === 'admin' ? 'default' : 'outline'}
          onClick={() => setView('admin')}
          className={view === 'admin' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-white'}
          size="sm"
        >
          <Settings className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Admin</span>
        </Button>
      </div>

      {view === 'landing' && (
        <LandingPage 
          onStartSpin={() => setView('user')} 
          onViewAdmin={() => setView('admin')} 
        />
      )}
      {view === 'user' && <SpinWheel />}
      {view === 'admin' && <AdminDashboard />}

      <Toaster position="top-center" richColors />
    </>
  );
}

export default App;