import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const slides = [
  {
    icon: '💰',
    title: 'Budget Smartly',
    description: 'Track your expenses and income effortlessly. Know where your money goes.'
  },
  {
    icon: '🤖',
    title: 'Get AI Help',
    description: 'Chat with our AI assistant for personalized financial advice anytime.'
  },
  {
    icon: '🛡️',
    title: 'Avoid Scams',
    description: 'Stay safe! Get instant alerts about suspicious transactions and messages.'
  }
];

const Onboarding = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [language, setLanguage] = useState('en');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      setShowLanguageModal(true);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleGetStarted = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    localStorage.setItem('preferredLanguage', language);
    navigate('/auth/signup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-6">
      {!showLanguageModal ? (
        <Card className="max-w-md w-full p-8 space-y-8 bg-card/95 backdrop-blur">
          <div className="text-center space-y-4 animate-fade-in">
            <div className="text-6xl mb-4">{slides[currentSlide].icon}</div>
            <h2 className="text-2xl font-bold text-foreground">
              {slides[currentSlide].title}
            </h2>
            <p className="text-muted-foreground">
              {slides[currentSlide].description}
            </p>
          </div>

          <div className="flex justify-center gap-2">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide ? 'w-8 bg-primary' : 'w-2 bg-muted'
                }`}
              />
            ))}
          </div>

          <div className="flex justify-between gap-4">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentSlide === 0}
              className="flex-1"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              className="flex-1"
            >
              {currentSlide === slides.length - 1 ? 'Continue' : 'Next'}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="max-w-md w-full p-8 space-y-6 bg-card/95 backdrop-blur animate-fade-in">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Choose Your Language</h2>
            <p className="text-muted-foreground">Select your preferred language for the app</p>
          </div>

          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="yo">Yoruba</SelectItem>
              <SelectItem value="pcm">Pidgin</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleGetStarted}
            className="w-full"
          >
            Get Started
          </Button>
        </Card>
      )}
    </div>
  );
};

export default Onboarding;
