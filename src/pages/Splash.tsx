import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from 'next-themes';
import logoLight from '@/assets/logo-light.png';
import logoDark from '@/assets/logo-dark.png';
import logoFullHorizontal from '@/assets/logo-full-horizontal.png';

const Splash = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { theme, systemTheme } = useTheme();
  
  // Determine the current theme (respecting system preference)
  const currentTheme = theme === "system" ? systemTheme : theme;
  const logoSrc = currentTheme === "dark" ? logoDark : logoLight;

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    
    const timer = setTimeout(() => {
      if (!loading) {
        if (user) {
          navigate('/dashboard');
        } else if (hasSeenOnboarding) {
          navigate('/auth/login');
        } else {
          navigate('/onboarding');
        }
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate, user, loading]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-primary p-6">
      <div className="text-center space-y-8 animate-fade-in">
        <div className="w-40 h-40 mx-auto mb-8 animate-pulse-glow rounded-3xl bg-white/10 backdrop-blur-sm p-8 flex items-center justify-center">
          <img 
            src={logoSrc} 
            alt="MobiKudi" 
            className="w-full h-full object-contain transition-all duration-300" 
          />
        </div>
        <div className="space-y-4">
          <img 
            src={logoFullHorizontal} 
            alt="MobiKudi" 
            className="h-16 mx-auto animate-slide-up"
          />
          <p className="text-xl text-primary-foreground/90 animate-slide-up font-medium" style={{ animationDelay: '0.2s' }}>
            Smart Money. Simple Voice.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Splash;
