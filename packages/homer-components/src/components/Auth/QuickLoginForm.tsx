import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, LogIn } from 'lucide-react';
import { homerAPI } from '@/lib/homer-api';
import { useToast } from '@/hooks/use-toast';

interface QuickLoginFormProps {
  onSuccess?: () => void;
  showTitle?: boolean;
}

export function QuickLoginForm({ onSuccess, showTitle = true }: QuickLoginFormProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: t('auth.missingCredentials'),
        description: t('auth.enterBothFields'),
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await homerAPI.login(email, password);
      
      toast({
        title: t('auth.loginSuccess'),
        description: t('auth.loadingTickets'),
      });
      
      onSuccess?.();
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: t('auth.loginFailed'),
        description: error instanceof Error ? error.message : t('auth.checkCredentials'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        {showTitle && (
          <>
            <CardTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5" />
              {t('auth.authRequired')}
            </CardTitle>
            <CardDescription>
              {t('auth.authRequiredDesc')}
            </CardDescription>
          </>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('auth.email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('auth.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">{t('auth.password')}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t('auth.passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('auth.loggingIn')}
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  {t('auth.logIn')}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
