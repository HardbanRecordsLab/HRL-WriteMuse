import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { EmptyState } from '@/components/EmptyState';
import { 
  BookOpen, 
  Target, 
  TrendingUp, 
  Calendar,
  FileText,
  PenTool,
  BarChart3,
  Clock,
  Sparkles,
  Rocket,
  Flame,
  Award,
  ArrowUpRight,
  Plus,
  Zap,
  BookMarked,
  Edit3,
  ChevronRight,
  Trophy,
  Star,
  Coffee
} from 'lucide-react';
import { formatDistanceToNow, format, differenceInDays, isToday, isYesterday, subDays } from 'date-fns';
import { pl } from 'date-fns/locale';

interface DashboardProps {
  userId: string;
  onSelectDocument: (doc: any) => void;
  onCreateDocument: () => void;
  isDemoMode?: boolean;
  demoStats?: {
    totalBooks: number;
    totalChapters: number;
    totalWords: number;
    wordsToday: number;
    wordsThisWeek: number;
  };
  demoDocuments?: any[];
}

export const Dashboard = ({ 
  userId, 
  onSelectDocument, 
  onCreateDocument,
  isDemoMode = false,
  demoStats,
  demoDocuments
}: DashboardProps) => {
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalChapters: 0,
    totalWords: 0,
    wordsToday: 0,
    wordsThisWeek: 0,
  });
  const [loading, setLoading] = useState(true);
  const [todayGoal] = useState(parseInt(localStorage.getItem('wordGoal') || '500'));
  const [writingStreak, setWritingStreak] = useState(0);
  const [weeklyData, setWeeklyData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    if (isDemoMode && demoStats && demoDocuments) {
      setStats(demoStats);
      setRecentDocuments(demoDocuments);
      setWritingStreak(7);
      setWeeklyData([320, 450, 280, 520, 380, 620, demoStats.wordsToday]);
      setLoading(false);
    } else {
      fetchDashboardData();
    }
  }, [userId, isDemoMode, demoStats, demoDocuments]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch recent documents
      const { data: docs } = await supabase
        .from('documents')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(5);

      if (docs) {
        setRecentDocuments(docs);
      }

      // Fetch all documents for stats
      const { count: docCount } = await supabase
        .from('documents')
        .select('*', { count: 'exact' });

      // Fetch all chapters
      const { count: chapterCount } = await supabase
        .from('chapters')
        .select('*', { count: 'exact' });

      // Calculate total words
      const { data: chapters } = await supabase
        .from('chapters')
        .select('content, updated_at');

      let totalWords = 0;
      let wordsToday = 0;
      let wordsThisWeek = 0;
      const dailyWords: { [key: string]: number } = {};

      if (chapters) {
        chapters.forEach((chapter: any) => {
          const words = chapter.content ? chapter.content.split(/\s+/).filter(Boolean).length : 0;
          totalWords += words;
          
          const updateDate = new Date(chapter.updated_at);
          const dateKey = format(updateDate, 'yyyy-MM-dd');
          dailyWords[dateKey] = (dailyWords[dateKey] || 0) + words;
        });
      }

      // Get chapters updated today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: todayChapters } = await supabase
        .from('chapters')
        .select('content')
        .gte('updated_at', today.toISOString());

      if (todayChapters) {
        todayChapters.forEach((chapter: any) => {
          const words = chapter.content ? chapter.content.split(/\s+/).filter(Boolean).length : 0;
          wordsToday += words;
        });
      }

      // Get chapters updated this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { data: weekChapters } = await supabase
        .from('chapters')
        .select('content')
        .gte('updated_at', weekAgo.toISOString());

      if (weekChapters) {
        weekChapters.forEach((chapter: any) => {
          const words = chapter.content ? chapter.content.split(/\s+/).filter(Boolean).length : 0;
          wordsThisWeek += words;
        });
      }

      // Calculate weekly data for chart
      const weekData: number[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
        weekData.push(dailyWords[date] || 0);
      }
      setWeeklyData(weekData);

      // Calculate writing streak
      let streak = 0;
      let checkDate = new Date();
      while (true) {
        const dateKey = format(checkDate, 'yyyy-MM-dd');
        if (dailyWords[dateKey] && dailyWords[dateKey] > 0) {
          streak++;
          checkDate = subDays(checkDate, 1);
        } else {
          break;
        }
      }
      setWritingStreak(streak);

      setStats({
        totalBooks: docCount || 0,
        totalChapters: chapterCount || 0,
        totalWords,
        wordsToday,
        wordsThisWeek,
      });
    } finally {
      setLoading(false);
    }
  };

  const goalProgress = Math.min((stats.wordsToday / todayGoal) * 100, 100);
  const maxWeeklyWords = Math.max(...weeklyData, 1);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Dzień dobry';
    if (hour < 18) return 'Cześć';
    return 'Dobry wieczór';
  };

  const getMotivationalMessage = () => {
    if (writingStreak >= 7) return 'Niesamowita passa! Jesteś na fali twórczej.';
    if (writingStreak >= 3) return 'Świetnie Ci idzie! Utrzymaj tempo.';
    if (stats.wordsToday >= todayGoal) return 'Cel dzienny osiągnięty! Brawo!';
    if (stats.wordsToday > 0) return 'Dobry początek dnia. Pisz dalej!';
    return 'Czas zacząć pisać. Każde słowo się liczy!';
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
          <div className="space-y-2">
            <div className="h-10 w-48 bg-muted rounded-lg animate-pulse" />
            <div className="h-5 w-64 bg-muted/50 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="h-48 bg-muted rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  const dayNames = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];
  const todayIndex = new Date().getDay();
  const reorderedDays = [...dayNames.slice(todayIndex - 6 >= 0 ? todayIndex - 6 : todayIndex + 1), ...dayNames.slice(0, todayIndex - 6 >= 0 ? todayIndex - 6 : todayIndex + 1)].slice(-7);

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8">
        {/* Header with greeting */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
              <span className="text-foreground">{getGreeting()}</span>
              <span className="text-muted-foreground">, pisarzu</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base flex items-center gap-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              <Sparkles className="w-4 h-4 text-gold" />
              {getMotivationalMessage()}
            </p>
          </div>
          <Button 
            onClick={onCreateDocument}
            className="editor-gradient text-white hover:scale-[1.02] shadow-medium transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nowa Książka
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {/* Writing Streak */}
          <Card className="p-4 md:p-6 glass-subtle border-glow transition-all group">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs md:text-sm text-muted-foreground" style={{ fontFamily: 'Inter, sans-serif' }}>Seria pisania</p>
                <p className="text-2xl md:text-3xl font-bold text-foreground">{writingStreak}</p>
                <p className="text-xs text-muted-foreground" style={{ fontFamily: 'Inter, sans-serif' }}>dni z rzędu</p>
              </div>
              <div className="p-2 md:p-3 rounded-xl bg-gold/10 group-hover:bg-gold/20 transition-colors">
                <Flame className="w-5 h-5 md:w-6 md:h-6 text-gold" />
              </div>
            </div>
          </Card>

          {/* Words Today */}
          <Card className="p-4 md:p-6 glass-subtle border-glow transition-all group">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs md:text-sm text-muted-foreground" style={{ fontFamily: 'Inter, sans-serif' }}>Dzisiaj</p>
                <p className="text-2xl md:text-3xl font-bold text-foreground">{stats.wordsToday.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground" style={{ fontFamily: 'Inter, sans-serif' }}>słów napisanych</p>
              </div>
              <div className="p-2 md:p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Edit3 className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
            </div>
          </Card>

          {/* Total Words */}
          <Card className="p-4 md:p-6 glass-subtle border-glow transition-all group">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs md:text-sm text-muted-foreground" style={{ fontFamily: 'Inter, sans-serif' }}>Wszystkie słowa</p>
                <p className="text-2xl md:text-3xl font-bold text-foreground">{stats.totalWords.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground" style={{ fontFamily: 'Inter, sans-serif' }}>w {stats.totalBooks} {stats.totalBooks === 1 ? 'książce' : 'książkach'}</p>
              </div>
              <div className="p-2 md:p-3 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                <BookMarked className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
              </div>
            </div>
          </Card>

          {/* Weekly Progress */}
          <Card className="p-4 md:p-6 glass-subtle border-glow transition-all group">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs md:text-sm text-muted-foreground" style={{ fontFamily: 'Inter, sans-serif' }}>Ten tydzień</p>
                <p className="text-2xl md:text-3xl font-bold text-foreground">{stats.wordsThisWeek.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground" style={{ fontFamily: 'Inter, sans-serif' }}>słów</p>
              </div>
              <div className="p-2 md:p-3 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Daily Goal Progress */}
        <Card className="p-4 md:p-6 glass-subtle overflow-hidden relative border-glow">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2 md:p-3 rounded-xl editor-gradient shadow-glow">
                  <Target className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-base md:text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>Cel dzienny: {todayGoal} słów</h3>
                  <p className="text-xs md:text-sm text-muted-foreground" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {goalProgress >= 100 ? (
                      <span className="text-gold flex items-center gap-1">
                        <Trophy className="w-3 h-3" /> Cel osiągnięty!
                      </span>
                    ) : (
                      `Pozostało ${todayGoal - stats.wordsToday} słów`
                    )}
                  </p>
                </div>
              </div>
              <div className="text-2xl md:text-4xl font-bold text-gradient-primary">
                {Math.round(goalProgress)}%
              </div>
            </div>
            <Progress value={goalProgress} className="h-3 md:h-4" />
            
            {/* Milestone markers */}
            <div className="flex justify-between text-xs text-muted-foreground px-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              <span>0</span>
              <span>{Math.round(todayGoal * 0.25)}</span>
              <span>{Math.round(todayGoal * 0.5)}</span>
              <span>{Math.round(todayGoal * 0.75)}</span>
              <span>{todayGoal}</span>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Weekly Activity Chart */}
          <Card className="lg:col-span-2 p-4 md:p-6 glass-subtle border-glow">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                <h2 className="text-lg md:text-xl font-semibold">Aktywność tygodniowa</h2>
              </div>
              <div className="text-xs md:text-sm text-muted-foreground" style={{ fontFamily: 'Inter, sans-serif' }}>
                Średnio: {Math.round(weeklyData.reduce((a, b) => a + b, 0) / 7)} słów/dzień
              </div>
            </div>
            
            {/* Simple bar chart */}
            <div className="flex items-end justify-between gap-1 md:gap-2 h-32 md:h-40">
              {weeklyData.map((words, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-secondary rounded-t-lg relative group overflow-hidden" 
                       style={{ height: `${(words / maxWeeklyWords) * 100}%`, minHeight: '4px' }}>
                    <div className="absolute inset-0 editor-gradient opacity-60 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-card px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg border border-border z-10" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {words} słów
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground" style={{ fontFamily: 'Inter, sans-serif' }}>{reorderedDays[index]}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-4 md:p-6 glass-subtle border-glow">
            <div className="flex items-center gap-2 mb-4 md:mb-6">
              <Zap className="w-4 h-4 md:w-5 md:h-5 text-gold" />
              <h2 className="text-lg md:text-xl font-semibold">Szybkie akcje</h2>
            </div>
            
            <div className="space-y-2 md:space-y-3">
              <button 
                onClick={onCreateDocument}
                className="w-full p-3 md:p-4 rounded-xl bg-secondary/50 hover:bg-secondary border border-transparent hover:border-primary/30 transition-all flex items-center gap-3 group"
              >
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Plus className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-sm md:text-base" style={{ fontFamily: 'Inter, sans-serif' }}>Nowa książka</p>
                  <p className="text-xs text-muted-foreground" style={{ fontFamily: 'Inter, sans-serif' }}>Rozpocznij nowy projekt</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>
              
              {recentDocuments.length > 0 && (
                <button 
                  onClick={() => onSelectDocument(recentDocuments[0])}
                  className="w-full p-3 md:p-4 rounded-xl bg-secondary/50 hover:bg-secondary border border-transparent hover:border-primary/30 transition-all flex items-center gap-3 group"
                >
                  <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                    <Edit3 className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-sm md:text-base" style={{ fontFamily: 'Inter, sans-serif' }}>Kontynuuj pisanie</p>
                    <p className="text-xs text-muted-foreground truncate" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {(recentDocuments[0] as any)?.title || 'Ostatni projekt'}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              )}

              <div className="w-full p-3 md:p-4 rounded-xl bg-secondary/50 border border-transparent flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gold/10">
                  <Coffee className="w-4 h-4 text-gold" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-sm md:text-base" style={{ fontFamily: 'Inter, sans-serif' }}>Wskazówka dnia</p>
                  <p className="text-xs text-muted-foreground" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Zaznacz tekst i użyj AI do ulepszenia
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Documents */}
        <Card className="p-4 md:p-6 glass-subtle border-glow">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              <h2 className="text-lg md:text-xl font-semibold">Ostatnie projekty</h2>
            </div>
            {recentDocuments.length > 0 && (
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                Zobacz wszystkie
                <ArrowUpRight className="w-3 h-3 ml-1" />
              </Button>
            )}
          </div>

          {recentDocuments.length === 0 ? (
            <EmptyState
              icon={Rocket}
              title="Rozpocznij swoją podróż pisarską"
              description="Stwórz swoją pierwszą książkę i odkryj moc AI w pisaniu. Twoje pomysły czekają na realizację!"
              action={{
                label: "Utwórz Pierwszą Książkę",
                onClick: onCreateDocument
              }}
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                <Sparkles className="w-4 h-4 text-gold" />
                <span>AI pomoże Ci w każdym etapie pisania</span>
              </div>
            </EmptyState>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {recentDocuments.map((doc: any) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl bg-secondary/40 hover:bg-secondary/70 cursor-pointer transition-all duration-300 border border-transparent hover:border-primary/30 group"
                  onClick={() => onSelectDocument(doc)}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-secondary group-hover:bg-primary/10 transition-colors">
                      <BookOpen className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm md:text-base group-hover:text-primary transition-colors truncate" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {doc.title}
                      </h3>
                      <p className="text-xs md:text-sm text-muted-foreground line-clamp-1 mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {doc.description || 'Brak opisu'}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground" style={{ fontFamily: 'Inter, sans-serif' }}>
                          <Clock className="w-3 h-3" />
                          <span>
                            {formatDistanceToNow(new Date(doc.updated_at), { 
                              addSuffix: true,
                              locale: pl 
                            })}
                          </span>
                        </div>
                        <div className={`px-2 py-0.5 rounded-full text-xs ${
                          doc.status === 'completed' ? 'bg-emerald-500/15 text-emerald-300' :
                          doc.status === 'in_progress' ? 'bg-blue-500/15 text-blue-300' :
                          doc.status === 'published' ? 'bg-primary/15 text-primary' :
                          'bg-secondary text-muted-foreground'
                        }`} style={{ fontFamily: 'Inter, sans-serif' }}>
                          {doc.status === 'completed' ? 'Ukończono' :
                           doc.status === 'in_progress' ? 'W trakcie' :
                           doc.status === 'published' ? 'Opublikowano' :
                           'Robocza'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Achievements/Badges Section */}
        <Card className="p-4 md:p-6 glass-subtle border-glow">
          <div className="flex items-center gap-2 mb-4 md:mb-6">
            <Award className="w-4 h-4 md:w-5 md:h-5 text-gold" />
            <h2 className="text-lg md:text-xl font-semibold">Twoje osiągnięcia</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className={`p-3 md:p-4 rounded-xl border text-center transition-all duration-300 ${
              stats.totalWords >= 1000 
                ? 'bg-gold/5 border-gold/20' 
                : 'bg-secondary/30 border-border opacity-50'
            }`}>
              <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 rounded-full flex items-center justify-center bg-gold/10">
                <Star className={`w-5 h-5 md:w-6 md:h-6 ${stats.totalWords >= 1000 ? 'text-gold' : 'text-muted-foreground'}`} />
              </div>
              <p className="font-medium text-xs md:text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>Pierwszy Tysiąc</p>
              <p className="text-xs text-muted-foreground" style={{ fontFamily: 'Inter, sans-serif' }}>1,000 słów</p>
            </div>
            
            <div className={`p-3 md:p-4 rounded-xl border text-center transition-all duration-300 ${
              stats.totalBooks >= 1 
                ? 'bg-blue-500/5 border-blue-500/20' 
                : 'bg-secondary/30 border-border opacity-50'
            }`}>
              <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 rounded-full flex items-center justify-center bg-blue-500/10">
                <BookOpen className={`w-5 h-5 md:w-6 md:h-6 ${stats.totalBooks >= 1 ? 'text-blue-400' : 'text-muted-foreground'}`} />
              </div>
              <p className="font-medium text-xs md:text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>Autor</p>
              <p className="text-xs text-muted-foreground" style={{ fontFamily: 'Inter, sans-serif' }}>Pierwsza książka</p>
            </div>
            
            <div className={`p-3 md:p-4 rounded-xl border text-center transition-all duration-300 ${
              writingStreak >= 7 
                ? 'bg-gold/5 border-gold/20' 
                : 'bg-secondary/30 border-border opacity-50'
            }`}>
              <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 rounded-full flex items-center justify-center bg-gold/10">
                <Flame className={`w-5 h-5 md:w-6 md:h-6 ${writingStreak >= 7 ? 'text-gold' : 'text-muted-foreground'}`} />
              </div>
              <p className="font-medium text-xs md:text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>Wytrwały</p>
              <p className="text-xs text-muted-foreground" style={{ fontFamily: 'Inter, sans-serif' }}>7 dni z rzędu</p>
            </div>
            
            <div className={`p-3 md:p-4 rounded-xl border text-center transition-all duration-300 ${
              stats.totalWords >= 10000 
                ? 'bg-primary/5 border-primary/20' 
                : 'bg-secondary/30 border-border opacity-50'
            }`}>
              <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 rounded-full flex items-center justify-center bg-primary/10">
                <Trophy className={`w-5 h-5 md:w-6 md:h-6 ${stats.totalWords >= 10000 ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <p className="font-medium text-xs md:text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>Profesjonalista</p>
              <p className="text-xs text-muted-foreground" style={{ fontFamily: 'Inter, sans-serif' }}>10,000 słów</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
