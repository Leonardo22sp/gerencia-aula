import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Turma {
  id: string;
  nome: string;
  serie?: string;
  ano_letivo: number;
  descricao?: string;
  created_at: string;
}

interface TurmasListProps {
  turmas: Turma[];
  onDelete: () => void;
  onSelect: (turmaId: string) => void;
  selectedTurma: string | null;
}

export const TurmasList = ({ turmas, onDelete, onSelect, selectedTurma }: TurmasListProps) => {
  const { toast } = useToast();

  const handleDelete = async (turmaId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta turma? Todas as atividades associadas também serão excluídas.')) {
      return;
    }

    const { error } = await supabase
      .from('turmas')
      .delete()
      .eq('id', turmaId);

    if (error) {
      toast({
        title: "Erro ao excluir turma",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Turma excluída",
        description: "A turma foi excluída com sucesso.",
      });
      onDelete();
    }
  };

  if (turmas.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Nenhuma turma cadastrada</h3>
            <p>Clique em "Nova Turma" para começar a organizar suas atividades.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {turmas.map((turma) => (
        <Card 
          key={turma.id}
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedTurma === turma.id ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => onSelect(turma.id)}
        >
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{turma.nome}</CardTitle>
                <CardDescription>
                  {turma.serie && `${turma.serie} • `}
                  Ano letivo: {turma.ano_letivo}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(turma.id);
                }}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {turma.descricao && (
              <p className="text-sm text-muted-foreground mb-3">
                {turma.descricao}
              </p>
            )}
            <div className="flex justify-between items-center">
              <Badge variant="secondary">
                {selectedTurma === turma.id ? 'Selecionada' : 'Clique para selecionar'}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(turma.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};