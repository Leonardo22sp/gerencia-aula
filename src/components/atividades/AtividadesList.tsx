import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AtividadeForm } from './AtividadeForm';
import { Plus, BookOpen, Trash2, Edit, Calendar } from 'lucide-react';

interface Atividade {
  id: string;
  titulo: string;
  descricao?: string;
  tipo: string;
  data_entrega?: string;
  status: string;
  nota_maxima?: number;
  created_at: string;
}

interface AtividadesListProps {
  turmaId: string;
}

export const AtividadesList = ({ turmaId }: AtividadesListProps) => {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingAtividade, setEditingAtividade] = useState<Atividade | null>(null);

  const { data: atividades = [], refetch } = useQuery({
    queryKey: ['atividades', turmaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('atividades')
        .select('*')
        .eq('turma_id', turmaId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!turmaId,
  });

  const handleDelete = async (atividadeId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta atividade?')) {
      return;
    }

    const { error } = await supabase
      .from('atividades')
      .delete()
      .eq('id', atividadeId);

    if (error) {
      toast({
        title: "Erro ao excluir atividade",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Atividade excluída",
        description: "A atividade foi excluída com sucesso.",
      });
      refetch();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluida':
        return 'bg-green-100 text-green-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'concluida':
        return 'Concluída';
      case 'cancelada':
        return 'Cancelada';
      default:
        return 'Pendente';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Atividades da Turma</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Atividade
        </Button>
      </div>

      {(showForm || editingAtividade) && (
        <AtividadeForm
          turmaId={turmaId}
          atividade={editingAtividade}
          onSuccess={() => {
            setShowForm(false);
            setEditingAtividade(null);
            refetch();
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingAtividade(null);
          }}
        />
      )}

      {atividades.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Nenhuma atividade cadastrada</h3>
              <p>Clique em "Nova Atividade" para começar a organizar as tarefas desta turma.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {atividades.map((atividade) => (
            <Card key={atividade.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{atividade.titulo}</CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <span>Tipo: {atividade.tipo}</span>
                      {atividade.data_entrega && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Entrega: {new Date(atividade.data_entrega).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                      {atividade.nota_maxima && (
                        <span>Nota máxima: {atividade.nota_maxima}</span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setEditingAtividade(atividade)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(atividade.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {atividade.descricao && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {atividade.descricao}
                  </p>
                )}
                <div className="flex justify-between items-center">
                  <Badge className={getStatusColor(atividade.status)}>
                    {getStatusText(atividade.status)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Criada em {new Date(atividade.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};