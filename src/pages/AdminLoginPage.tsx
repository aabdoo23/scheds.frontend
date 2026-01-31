import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const ok = await login(password);
      if (ok) {
        navigate('/admin', { replace: true });
      } else {
        setError('Invalid password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-[var(--dark)]">
      <div className="w-full max-w-sm p-6 rounded-xl bg-[var(--lighter-dark)] border border-white/10">
        <h1 className="text-xl font-semibold text-[var(--light-text)] mb-4">Admin Login</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="current-password"
            required
            disabled={loading}
          />
          {error && (
            <p className="text-[#dc3545] text-sm" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>
    </main>
  );
}
