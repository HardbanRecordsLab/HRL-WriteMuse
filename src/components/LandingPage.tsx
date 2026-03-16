import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Sparkles, 
  Image, 
  FileText, 
  Zap, 
  ArrowRight,
  Play,
  PenTool,
  Layers,
  Shield,
  Star
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface LandingPageProps {
  onStartDemo: () => void;
  onLogin: () => void;
}

const FEATURES = [
  {
    icon: Sparkles,
    title: 'Asystent AI',
    description: 'Streaming w czasie rzeczywistym. Kontynuuj, poprawiaj, rozwijaj tekst jednym kliknięciem.',
    accent: 'from-primary to-purple-400',
  },
  {
    icon: Image,
    title: 'Generowanie ilustracji',
    description: 'Profesjonalne ilustracje do rozdziałów w wielu stylach artystycznych.',
    accent: 'from-gold to-amber-400',
  },
  {
    icon: FileText,
    title: 'Import & Export',
    description: 'PDF, DOCX, TXT, EPUB. Eksportuj zachowując pełne formatowanie.',
    accent: 'from-emerald-500 to-teal-400',
  },
  {
    icon: Zap,
    title: 'Autosave',
    description: 'Automatyczne zapisywanie co 2 sekundy. Nigdy nie stracisz pracy.',
    accent: 'from-blue-500 to-cyan-400',
  },
  {
    icon: Layers,
    title: 'Struktura książki',
    description: 'Rozdziały, prolog, epilog. Profesjonalne szablony na start.',
    accent: 'from-rose-500 to-pink-400',
  },
  {
    icon: Shield,
    title: 'Pełna kontrola',
    description: 'Tryb Assembly — zero ingerencji AI w treść. Twój tekst jest świętością.',
    accent: 'from-violet-500 to-indigo-400',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
};

const heroVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut" as const,
    },
  },
};

export const LandingPage = ({ onStartDemo, onLogin }: LandingPageProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);
  const orb1Y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const orb2Y = useTransform(scrollYProgress, [0, 1], ["0%", "70%"]);
  const orb3Y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);

  return (
    <div ref={containerRef} className="min-h-screen bg-background overflow-x-hidden">
      {/* Parallax Ambient Background */}
      <motion.div 
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ opacity: backgroundOpacity }}
      >
        <motion.div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/8 rounded-full blur-[120px]" 
          style={{ y: orb1Y }}
        />
        <motion.div 
          className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[100px]" 
          style={{ y: orb2Y }}
        />
        <motion.div 
          className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-primary/6 rounded-full blur-[80px]" 
          style={{ y: orb3Y }}
        />
        {/* Grid overlay */}
        <motion.div 
          className="absolute inset-0 bg-[linear-gradient(hsl(var(--muted)/0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--muted)/0.03)_1px,transparent_1px)] bg-[size:64px_64px]" 
          style={{ y: backgroundY }}
        />
      </motion.div>

      {/* Navigation */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-5 max-w-7xl mx-auto"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl editor-gradient flex items-center justify-center shadow-glow">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-semibold text-foreground tracking-tight">
              WriterStudio
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            className="text-muted-foreground hover:text-foreground transition-colors"
            onClick={onLogin}
          >
            Zaloguj się
          </Button>
          <Button 
            className="editor-gradient text-white shadow-medium hover:shadow-strong hover:scale-[1.02] transition-all duration-300"
            onClick={onStartDemo}
          >
            Wypróbuj za darmo
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 lg:px-12 pt-20 pb-16 max-w-6xl mx-auto">
        <motion.div 
          className="text-center space-y-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Badge */}
          <motion.div 
            variants={heroVariants}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-muted-foreground"
          >
            <motion.div 
              className="w-1.5 h-1.5 rounded-full bg-gold"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span>Profesjonalna platforma dla autorów</span>
          </motion.div>
          
          {/* Headline */}
          <motion.h1 
            variants={heroVariants}
            className="text-5xl sm:text-6xl lg:text-8xl font-bold leading-[0.9] tracking-tight"
          >
            <span className="text-foreground">Twórz książki</span>
            <br />
            <motion.span 
              className="text-gradient-primary italic inline-block"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              bez kompromisów
            </motion.span>
          </motion.h1>
          
          {/* Subheadline */}
          <motion.p 
            variants={heroVariants}
            className="text-lg lg:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed"
          >
            Edytor nowej generacji z AI, automatycznymi ilustracjami 
            i pełną kontrolą nad każdym słowem.
          </motion.p>
          
          {/* CTA */}
          <motion.div 
            variants={heroVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                size="lg"
                className="editor-gradient text-white shadow-strong glow-violet transition-all duration-300 text-base px-8 py-6 rounded-xl"
                onClick={onStartDemo}
              >
                <Play className="w-5 h-5 mr-2" />
                Rozpocznij pisanie
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                size="lg"
                variant="outline"
                className="border-border text-foreground hover:bg-secondary transition-all px-8 py-6 rounded-xl"
                onClick={onLogin}
              >
                Mam już konto
              </Button>
            </motion.div>
          </motion.div>

          {/* Trust signals */}
          <motion.div 
            variants={heroVariants}
            className="flex items-center justify-center gap-6 text-sm text-muted-foreground pt-2"
          >
            <span className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-gold" fill="currentColor" />
              Bez rejestracji
            </span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-gold" fill="currentColor" />
              Pełna funkcjonalność
            </span>
            <span className="w-1 h-1 rounded-full bg-border hidden sm:block" />
            <span className="hidden sm:flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-gold" fill="currentColor" />
              Przykładowa książka
            </span>
          </motion.div>
        </motion.div>
      </section>

      {/* Preview Window */}
      <section className="relative z-10 px-6 lg:px-12 pb-20 max-w-5xl mx-auto">
        <motion.div 
          className="glass rounded-2xl p-1.5 shadow-strong"
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-destructive/60" />
              <div className="w-3 h-3 rounded-full bg-gold/60" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="px-4 py-1 rounded-md bg-secondary/50 text-xs text-muted-foreground">
                writerstudio.app
              </div>
            </div>
          </div>
          {/* Content */}
          <div className="aspect-[16/9] rounded-b-xl bg-gradient-to-br from-secondary/80 to-background flex items-center justify-center">
            <motion.div 
              className="text-center space-y-5"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <motion.div 
                className="w-16 h-16 rounded-2xl editor-gradient flex items-center justify-center mx-auto shadow-glow"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Play className="w-8 h-8 text-white ml-0.5" />
              </motion.div>
              <div className="space-y-2">
                <p className="text-foreground font-medium">Zobacz jak działa WriterStudio</p>
                <p className="text-sm text-muted-foreground">Kliknij „Rozpocznij pisanie" powyżej</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 px-6 lg:px-12 py-24 max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-16 space-y-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm font-medium text-gold uppercase tracking-widest">
            Funkcje
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground font-serif">
            Wszystko w jednym miejscu
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            Narzędzia, których potrzebujesz — nic więcej, nic mniej.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
        >
          {FEATURES.map((feature) => (
            <motion.div 
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group p-6 rounded-2xl glass-subtle hover:shadow-medium transition-all duration-500 border-glow"
            >
              <div className="space-y-4">
                <motion.div 
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.accent} flex items-center justify-center shadow-lg`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <feature.icon className="w-5 h-5 text-white" />
                </motion.div>
                <h3 className="text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 px-6 lg:px-12 py-20 max-w-5xl mx-auto">
        <motion.div 
          className="glass rounded-2xl p-10 lg:p-14"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '∞', label: 'Słów bez limitu', accent: 'text-foreground' },
              { value: '7', label: 'Formatów eksportu', accent: 'text-primary' },
              { value: '< 2s', label: 'Autosave', accent: 'text-gold' },
              { value: '0%', label: 'Utraty danych', accent: 'text-emerald-400' },
            ].map((stat, idx) => (
              <motion.div 
                key={stat.label} 
                className="space-y-2"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
              >
                <p className={`text-3xl lg:text-4xl font-bold ${stat.accent}`}>{stat.value}</p>
                <p className="text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 px-6 lg:px-12 py-24 max-w-4xl mx-auto text-center">
        <motion.div 
          className="space-y-8"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight font-serif">
            Gotowy na <span className="text-gradient-gold italic">nowy rozdział</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Zacznij pisać w ciągu 30 sekund. Bez rejestracji, bez karty kredytowej.
          </p>
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              size="lg"
              className="editor-gradient text-white shadow-strong glow-violet transition-all duration-300 text-base px-10 py-7 rounded-xl"
              onClick={onStartDemo}
            >
              <PenTool className="w-5 h-5 mr-2" />
              Zacznij pisać teraz
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 lg:px-12 py-8 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <span>WriterStudio © {new Date().getFullYear()}</span>
          </div>
          <span>Profesjonalna platforma dla autorów</span>
        </div>
      </footer>
    </div>
  );
};
