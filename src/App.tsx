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
      <AuthScreen 
        onAuth={setUser} 
        onAdminAuth={() => setIsAdmin(true)}
      />
    );
  }

  if (isAdmin) {
    return <AdminPanel onLogout={() => setIsAdmin(false)} />;
  }

  return <MainApp user={user!} onLogout={() => setUser(null)} />;
}