import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  DollarSign, 
  TrendingUp, 
  PieChart, 
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Loader2,
  BarChart3,
  Globe,
  Wallet,
  CreditCard,
  Trash2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

interface SalesData {
  id: string;
  document_id: string;
  platform_id: string | null;
  sale_date: string;
  units_sold: number;
  revenue: number;
  royalty_amount: number;
  currency: string;
  country: string | null;
}

interface RoyaltySplit {
  id: string;
  document_id: string;
  email: string;
  name: string;
  percentage: number;
  role: string | null;
}

interface RoyaltiesPanelProps {
  documentId: string;
  documentTitle: string;
  userId: string;
  isDemoMode?: boolean;
}

const COLORS = ['hsl(var(--primary))', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export const RoyaltiesPanel: React.FC<RoyaltiesPanelProps> = ({
  documentId,
  documentTitle,
  userId,
  isDemoMode = false,
}) => {
  const { toast } = useToast();
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [royaltySplits, setRoyaltySplits] = useState<RoyaltySplit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingSplit, setIsAddingSplit] = useState(false);

  // New split form
  const [newSplitName, setNewSplitName] = useState('');
  const [newSplitEmail, setNewSplitEmail] = useState('');
  const [newSplitPercentage, setNewSplitPercentage] = useState('');
  const [newSplitRole, setNewSplitRole] = useState('');

  useEffect(() => {
    fetchData();
  }, [documentId]);

  const fetchData = async () => {
    if (isDemoMode) {
      // Demo data - minimal for demo mode, showing empty state as example
      setSalesData([]);
      setRoyaltySplits([
        { id: '1', document_id: documentId, email: 'autor@demo.pl', name: 'Demo Autor', percentage: 100, role: 'Autor' },
      ]);
      setIsLoading(false);
      return;
    }

    try {
      const [salesRes, splitsRes] = await Promise.all([
        supabase.from('sales_data').select('*').eq('document_id', documentId).order('sale_date', { ascending: false }),
        supabase.from('royalty_splits').select('*').eq('document_id', documentId),
      ]);

      if (salesRes.data) setSalesData(salesRes.data);
      if (splitsRes.data) setRoyaltySplits(splitsRes.data);
    } catch (error) {
      console.error('Error fetching royalties data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSplit = async () => {
    if (isDemoMode) {
      toast({ title: 'Tryb Demo', description: 'Załóż konto, aby dodawać podziały!' });
      return;
    }

    if (!newSplitName.trim() || !newSplitEmail.trim() || !newSplitPercentage) {
      toast({ title: 'Wypełnij wszystkie pola', variant: 'destructive' });
      return;
    }

    const percentage = parseFloat(newSplitPercentage);
    const currentTotal = royaltySplits.reduce((sum, s) => sum + s.percentage, 0);
    
    if (currentTotal + percentage > 100) {
      toast({ 
        title: 'Przekroczono 100%', 
        description: `Możesz przydzielić maksymalnie ${100 - currentTotal}%`,
        variant: 'destructive' 
      });
      return;
    }

    setIsAddingSplit(true);
    try {
      const { error } = await supabase.from('royalty_splits').insert({
        document_id: documentId,
        user_id: userId,
        email: newSplitEmail.trim(),
        name: newSplitName.trim(),
        percentage,
        role: newSplitRole.trim() || null,
      });

      if (error) throw error;

      toast({ title: 'Dodano podział tantiem' });
      setNewSplitName('');
      setNewSplitEmail('');
      setNewSplitPercentage('');
      setNewSplitRole('');
      fetchData();
    } catch (error) {
      console.error('Error adding split:', error);
      toast({ title: 'Błąd', description: 'Nie udało się dodać podziału.', variant: 'destructive' });
    } finally {
      setIsAddingSplit(false);
    }
  };

  const handleRemoveSplit = async (splitId: string) => {
    if (isDemoMode) return;
    
    try {
      const { error } = await supabase.from('royalty_splits').delete().eq('id', splitId);
      if (error) throw error;
      toast({ title: 'Usunięto podział' });
      fetchData();
    } catch (error) {
      console.error('Error removing split:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate stats
  const totalRevenue = salesData.reduce((sum, s) => sum + s.revenue, 0);
  const totalRoyalties = salesData.reduce((sum, s) => sum + s.royalty_amount, 0);
  const totalUnits = salesData.reduce((sum, s) => sum + s.units_sold, 0);
  const avgRevenuePerUnit = totalUnits > 0 ? totalRevenue / totalUnits : 0;

  // Last 30 days vs previous 30 days
  const last30Days = salesData.filter(s => {
    const date = new Date(s.sale_date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return date >= thirtyDaysAgo;
  });
  const last30Revenue = last30Days.reduce((sum, s) => sum + s.revenue, 0);

  // Chart data
  const chartData = salesData.slice(0, 30).reverse().map(s => ({
    date: new Date(s.sale_date).toLocaleDateString('pl-PL', { day: '2-digit', month: 'short' }),
    revenue: s.revenue,
    units: s.units_sold,
  }));

  // Country data
  const countryData: Record<string, number> = {};
  salesData.forEach(s => {
    if (s.country) {
      countryData[s.country] = (countryData[s.country] || 0) + s.revenue;
    }
  });
  const pieData = Object.entries(countryData).map(([name, value]) => ({ name, value }));

  const totalSplitPercentage = royaltySplits.reduce((sum, s) => sum + s.percentage, 0);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-600">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +12%
              </Badge>
            </div>
            <div className="text-2xl font-bold">{totalRevenue.toFixed(2)} zł</div>
            <div className="text-xs text-muted-foreground">Całkowity przychód</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Wallet className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">{totalRoyalties.toFixed(2)} zł</div>
            <div className="text-xs text-muted-foreground">Tantiemy</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold">{totalUnits}</div>
            <div className="text-xs text-muted-foreground">Sprzedane kopie</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-2xl font-bold">{avgRevenuePerUnit.toFixed(2)} zł</div>
            <div className="text-xs text-muted-foreground">Śr. przychód/kopię</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="charts" className="w-full">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="charts" className="flex-1">
            <BarChart3 className="w-4 h-4 mr-2" />
            Wykresy
          </TabsTrigger>
          <TabsTrigger value="splits" className="flex-1">
            <PieChart className="w-4 h-4 mr-2" />
            Podziały
          </TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-4">
          {/* Revenue Chart */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Przychody (ostatnie 30 dni)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Country Breakdown */}
          {pieData.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Sprzedaż wg krajów
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="splits" className="space-y-4">
          {/* Add Split Form */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5" />
                Podział tantiem
              </CardTitle>
              <CardDescription>
                Przydzielone: {totalSplitPercentage}% | Pozostało: {100 - totalSplitPercentage}%
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={totalSplitPercentage} className="h-2" />

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full" disabled={totalSplitPercentage >= 100}>
                    <Plus className="w-4 h-4 mr-2" />
                    Dodaj beneficjenta
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Dodaj podział tantiem</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Imię i nazwisko</Label>
                      <Input
                        value={newSplitName}
                        onChange={(e) => setNewSplitName(e.target.value)}
                        placeholder="Jan Kowalski"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={newSplitEmail}
                        onChange={(e) => setNewSplitEmail(e.target.value)}
                        placeholder="email@example.com"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Procent (%)</Label>
                        <Input
                          type="number"
                          min="1"
                          max={100 - totalSplitPercentage}
                          value={newSplitPercentage}
                          onChange={(e) => setNewSplitPercentage(e.target.value)}
                          placeholder="np. 10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Rola (opcjonalna)</Label>
                        <Input
                          value={newSplitRole}
                          onChange={(e) => setNewSplitRole(e.target.value)}
                          placeholder="np. Redaktor"
                        />
                      </div>
                    </div>
                    <Button onClick={handleAddSplit} disabled={isAddingSplit} className="w-full">
                      {isAddingSplit ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4 mr-2" />
                      )}
                      Dodaj
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Splits List */}
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {royaltySplits.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      Brak zdefiniowanych podziałów
                    </div>
                  ) : (
                    royaltySplits.map((split) => (
                      <div
                        key={split.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-card border"
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-primary-foreground"
                            style={{ 
                              background: COLORS[royaltySplits.indexOf(split) % COLORS.length] 
                            }}
                          >
                            {split.percentage}%
                          </div>
                          <div>
                            <div className="font-medium text-sm">{split.name}</div>
                            <div className="text-xs text-muted-foreground">{split.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {split.role && (
                            <Badge variant="secondary" className="text-xs">
                              {split.role}
                            </Badge>
                          )}
                          <div className="text-sm font-medium text-green-600">
                            {((totalRoyalties * split.percentage) / 100).toFixed(2)} zł
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveSplit(split.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
