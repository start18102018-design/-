import { useState } from 'react';
import { AuthScreen } from './components/AuthScreen';
import { MainApp } from './components/MainApp';
import { AdminPanel } from './components/admin/AdminPanel';

export interface User {
  phone: string;
  address: string;
  settlement: string;
  street: string;
  houseNumber: string;
  apartment: string;
  name: string;
  email: string;
  accountNumber: string;
  pinCode: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  if (!user && !isAdmin) {
    return (
      <div className="min-h-screen w-full">
        <AuthScreen 
          onAuth={setUser} 
          onAdminAuth={() => setIsAdmin(true)}
        />
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="min-h-screen w-full">
        <AdminPanel onLogout={() => setIsAdmin(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      <MainApp user={user!} onLogout={() => setUser(null)} />
    </div>
  );
}