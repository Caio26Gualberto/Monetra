import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="glass-strong p-10 max-w-md w-full text-center animate-fade-in">
        <div className="h-16 w-16 rounded-2xl gradient-mix mx-auto flex items-center justify-center text-white">
          <Sparkles className="h-8 w-8" />
        </div>
        <h1 className="text-6xl font-bold text-gradient mt-6">404</h1>
        <p className="text-muted-foreground mt-2">A página que você procura não existe.</p>
        <Link to="/dashboard" className="inline-block mt-6">
          <Button>
            <ArrowLeft className="h-4 w-4" /> Voltar ao Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
