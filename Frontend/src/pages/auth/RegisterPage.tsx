import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User as UserIcon, Sparkles, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { extractApiError } from '@/lib/api';

const passwordSchema = z.string().min(8, 'Mínimo 8 caracteres')
  .regex(/[A-Z]/, 'Inclua uma letra maiúscula')
  .regex(/[a-z]/, 'Inclua uma letra minúscula')
  .regex(/[0-9]/, 'Inclua um número');

const schema = z.object({
  firstName: z.string().min(2, 'Mínimo 2 caracteres'),
  lastName: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().min(1, 'E-mail obrigatório').email('E-mail inválido'),
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword']
});
type FormValues = z.infer<typeof schema>;

const passwordRules = [
  { label: 'Mínimo 8 caracteres', test: (s: string) => s.length >= 8 },
  { label: 'Letra maiúscula', test: (s: string) => /[A-Z]/.test(s) },
  { label: 'Letra minúscula', test: (s: string) => /[a-z]/.test(s) },
  { label: 'Número', test: (s: string) => /[0-9]/.test(s) }
];

export function RegisterPage() {
  const { register: registerUser } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const password = watch('password') || '';

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      await registerUser({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password
      });
      success('Conta criada com sucesso!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toastError(extractApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="w-full max-w-md glass-strong p-8 animate-fade-in">
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="h-14 w-14 rounded-2xl gradient-mix flex items-center justify-center text-white shadow-lg shadow-primary/30">
            <Sparkles className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-gradient">Crie sua conta</h1>
          <p className="text-sm text-muted-foreground">Comece a controlar suas finanças</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="firstName">Nome</Label>
              <div className="relative mt-1">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="firstName" placeholder="João" className="pl-10" {...register('firstName')} />
              </div>
              {errors.firstName && <span className="text-xs text-rose-600">{errors.firstName.message}</span>}
            </div>
            <div>
              <Label htmlFor="lastName">Sobrenome</Label>
              <Input id="lastName" placeholder="Silva" className="mt-1" {...register('lastName')} />
              {errors.lastName && <span className="text-xs text-rose-600">{errors.lastName.message}</span>}
            </div>
          </div>

          <div>
            <Label htmlFor="email">E-mail</Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="email" type="email" placeholder="seu@email.com" className="pl-10" {...register('email')} />
            </div>
            {errors.email && <span className="text-xs text-rose-600">{errors.email.message}</span>}
          </div>

          <div>
            <Label htmlFor="password">Senha</Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="password" type="password" className="pl-10" {...register('password')} />
            </div>
            <ul className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-2">
              {passwordRules.map(r => {
                const ok = r.test(password);
                return (
                  <li key={r.label} className={`text-[11px] flex items-center gap-1 ${ok ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                    {ok ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />} {r.label}
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirmar senha</Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="confirmPassword" type="password" className="pl-10" {...register('confirmPassword')} />
            </div>
            {errors.confirmPassword && <span className="text-xs text-rose-600">{errors.confirmPassword.message}</span>}
          </div>

          <Button type="submit" disabled={submitting} className="w-full mt-2" size="lg">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar conta'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Já tem conta?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
