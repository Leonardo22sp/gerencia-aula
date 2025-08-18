import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface TurmaFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const TurmaForm = ({ onSuccess, onCancel }: TurmaFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const nome = formData.get('nome') as string;
    const serie = formData.get('serie') as string;
    const ano_letivo = parseInt(formData.get('ano_letivo') as string);
    const descricao = formData.get('descricao') as string;

    const { error } = await supabase
      .from('turmas')
      .insert({
        professor_id: user?.id,
        nome,
        serie: serie || null,
        ano_letivo,
        descricao: descricao || null,
      });

    if (error) {
      toast({
        title: "Erro ao criar turma",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Turma criada",
        description: "A turma foi criada com sucesso.",
      });
      onSuccess();
    }

    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova Turma</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Turma *</Label>
              <Input
                id="nome"
                name="nome"
                placeholder="Ex: 9º A, Matemática Avançada"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serie">Série/Nível</Label>
              <Input
                id="serie"
                name="serie"
                placeholder="Ex: 9º ano, Ensino Médio"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ano_letivo">Ano Letivo *</Label>
            <Input
              id="ano_letivo"
              name="ano_letivo"
              type="number"
              defaultValue={new Date().getFullYear()}
              min="2020"
              max="2030"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              name="descricao"
              placeholder="Informações adicionais sobre a turma..."
              rows={3}
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
              {isLoading ? "Criando..." : "Criar Turma"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};