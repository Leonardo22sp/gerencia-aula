-- Criar tabela de perfis de professores
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  nome VARCHAR(255) NOT NULL,
  escola VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Criar tabela de turmas
CREATE TABLE public.turmas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  serie VARCHAR(100),
  ano_letivo INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela turmas
ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;

-- Criar tabela de atividades
CREATE TABLE public.atividades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turma_id UUID NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  tipo VARCHAR(100) NOT NULL DEFAULT 'exercicio',
  data_entrega DATE,
  status VARCHAR(50) DEFAULT 'pendente',
  nota_maxima DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela atividades
ALTER TABLE public.atividades ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Usuários podem ver apenas seu próprio perfil"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar apenas seu próprio perfil"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir apenas seu próprio perfil"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Políticas RLS para turmas
CREATE POLICY "Professores podem ver apenas suas próprias turmas"
ON public.turmas
FOR SELECT
USING (auth.uid() = professor_id);

CREATE POLICY "Professores podem criar turmas para si mesmos"
ON public.turmas
FOR INSERT
WITH CHECK (auth.uid() = professor_id);

CREATE POLICY "Professores podem atualizar apenas suas próprias turmas"
ON public.turmas
FOR UPDATE
USING (auth.uid() = professor_id);

CREATE POLICY "Professores podem excluir apenas suas próprias turmas"
ON public.turmas
FOR DELETE
USING (auth.uid() = professor_id);

-- Políticas RLS para atividades
CREATE POLICY "Professores podem ver atividades de suas turmas"
ON public.atividades
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.turmas
    WHERE turmas.id = atividades.turma_id
    AND turmas.professor_id = auth.uid()
  )
);

CREATE POLICY "Professores podem criar atividades em suas turmas"
ON public.atividades
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.turmas
    WHERE turmas.id = atividades.turma_id
    AND turmas.professor_id = auth.uid()
  )
);

CREATE POLICY "Professores podem atualizar atividades de suas turmas"
ON public.atividades
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.turmas
    WHERE turmas.id = atividades.turma_id
    AND turmas.professor_id = auth.uid()
  )
);

CREATE POLICY "Professores podem excluir atividades de suas turmas"
ON public.atividades
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.turmas
    WHERE turmas.id = atividades.turma_id
    AND turmas.professor_id = auth.uid()
  )
);

-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_turmas_updated_at
  BEFORE UPDATE ON public.turmas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_atividades_updated_at
  BEFORE UPDATE ON public.atividades
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();