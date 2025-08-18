import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TurmasList } from '@/components/turmas/TurmasList';
import { TurmaForm } from '@/components/turmas/TurmaForm';
import { AtividadesList } from '@/components/atividades/AtividadesList';
import { Plus, Users, BookOpen, LogOut, GraduationCap } from 'lucide-react';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [showTurmaForm, setShowTurmaForm] = useState(false);
  const [selectedTurma, setSelectedTurma] = useState<string | null>(null);

  const { data: turmas = [], refetch: refetchTurmas } = useQuery({
    queryKey: ['turmas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('turmas')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Sistema de Gestão Docente</h1>
              <p className="text-sm text-muted-foreground">
                Bem-vindo, {profile?.nome || user?.email}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6 mb-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Turmas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{turmas.length}</div>
              <p className="text-xs text-muted-foreground">
                turmas cadastradas
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Atividades Pendentes</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                atividades em andamento
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ano Letivo</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Date().getFullYear()}</div>
              <p className="text-xs text-muted-foreground">
                ano atual
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="turmas" className="space-y-6">
          <TabsList>
            <TabsTrigger value="turmas">Minhas Turmas</TabsTrigger>
            <TabsTrigger value="atividades" disabled={!selectedTurma}>
              Atividades {selectedTurma && `(${turmas.find(t => t.id === selectedTurma)?.nome})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="turmas" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Gerenciar Turmas</h2>
              <Button onClick={() => setShowTurmaForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Turma
              </Button>
            </div>
            
            {showTurmaForm && (
              <TurmaForm
                onSuccess={() => {
                  setShowTurmaForm(false);
                  refetchTurmas();
                }}
                onCancel={() => setShowTurmaForm(false)}
              />
            )}
            
            <TurmasList
              turmas={turmas}
              onDelete={refetchTurmas}
              onSelect={setSelectedTurma}
              selectedTurma={selectedTurma}
            />
          </TabsContent>

          <TabsContent value="atividades" className="space-y-4">
            {selectedTurma ? (
              <AtividadesList turmaId={selectedTurma} />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Selecione uma turma para ver suas atividades
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;