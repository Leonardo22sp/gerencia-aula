import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Atividade {
  id: string;
  titulo: string;
  descricao?: string;
  tipo: string;
  data_entrega?: string;
  status: string;
  nota_maxima?: number;
}

interface AtividadeFormProps {
  turmaId: string;
  atividade?: Atividade | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AtividadeForm = ({ turmaId, atividade, onSuccess, onCancel }: AtividadeFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const titulo = formData.get('titulo') as string;
    const descricao = formData.get('descricao') as string;
    const tipo = formData.get('tipo') as string;
    const data_entrega = formData.get('data_entrega') as string;
    const status = formData.get('status') as string;
    const nota_maxima = formData.get('nota_maxima') as string;

    const activityData = {
      titulo,
      descricao: descricao || null,
      tipo,
      data_entrega: data_entrega || null,
      status,
      nota_maxima: nota_maxima ? parseFloat(nota_maxima) : null,
    };

    if (atividade) {
      // Update existing activity
      const { error } = await supabase
        .from('atividades')
        .update(activityData)
        .eq('id', atividade.id);

      if (error) {
        toast({
          title: "Erro ao atualizar atividade",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Atividade atualizada",
          description: "A atividade foi atualizada com sucesso.",
        });
        onSuccess();
      }
    } else {
      // Create new activity
      const { error } = await supabase
        .from('atividades')
        .insert({
          turma_id: turmaId,
          ...activityData,
        });

      if (error) {
        toast({
          title: "Erro ao criar atividade",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Atividade criada",
          description: "A atividade foi criada com sucesso.",
        });
        onSuccess();
      }
    }

    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {atividade ? 'Editar Atividade' : 'Nova Atividade'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título da Atividade *</Label>
            <Input
              id="titulo"
              name="titulo"
              placeholder="Ex: Prova de Matemática, Exercícios de Casa"
              defaultValue={atividade?.titulo || ''}
              required
            />
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select name="tipo" defaultValue={atividade?.tipo || 'exercicio'}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exercicio">Exercício</SelectItem>
                  <SelectItem value="prova">Prova</SelectItem>
                  <SelectItem value="projeto">Projeto</SelectItem>
                  <SelectItem value="trabalho">Trabalho</SelectItem>
                  <SelectItem value="apresentacao">Apresentação</SelectItem>
                  <SelectItem value="seminario">Seminário</SelectItem>
                  <SelectItem value="pesquisa">Pesquisa</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select name="status" defaultValue={atividade?.status || 'pendente'}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="data_entrega">Data de Entrega</Label>
              <Input
                id="data_entrega"
                name="data_entrega"
                type="date"
                defaultValue={atividade?.data_entrega || ''}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nota_maxima">Nota Máxima</Label>
              <Input
                id="nota_maxima"
                name="nota_maxima"
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="Ex: 10.0"
                defaultValue={atividade?.nota_maxima || ''}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              name="descricao"
              placeholder="Detalhes sobre a atividade, instruções, critérios de avaliação..."
              rows={4}
              defaultValue={atividade?.descricao || ''}
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading 
                ? (atividade ? "Atualizando..." : "Criando...") 
                : (atividade ? "Atualizar" : "Criar Atividade")
              }
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};