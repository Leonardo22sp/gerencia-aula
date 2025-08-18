import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Users, BookOpen, Shield, Smartphone, ArrowRight } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold">Sistema de Gestão Docente</h1>
          </div>
          <div className="flex gap-3">
            {user ? (
              <Button asChild>
                <Link to="/dashboard">Acessar Dashboard</Link>
              </Button>
            ) : (
              <Button asChild>
                <Link to="/auth">Entrar / Cadastrar</Link>
              </Button>
            )}
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Organize suas 
            <span className="text-primary"> atividades pedagógicas</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Sistema desenvolvido especialmente para professores de áreas remotas do Brasil. 
            Gerencie turmas, organize atividades e otimize seu processo educacional de forma simples e eficiente.
          </p>
          {!user && (
            <Button size="lg" asChild>
              <Link to="/auth">
                Começar agora <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          )}
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
          <Card>
            <CardHeader>
              <Users className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Gestão de Turmas</CardTitle>
              <CardDescription>
                Cadastre e organize suas turmas por série, ano letivo e matéria. 
                Tenha controle total sobre cada grupo de alunos.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BookOpen className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Atividades Organizadas</CardTitle>
              <CardDescription>
                Registre provas, exercícios, projetos e trabalhos. 
                Acompanhe prazos e status de cada atividade.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Seguro e Privado</CardTitle>
              <CardDescription>
                Seus dados ficam protegidos e apenas você tem acesso às suas turmas e atividades.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="bg-card rounded-lg p-8 text-center">
          <Smartphone className="h-16 w-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Pensado para infraestrutura limitada</h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Interface intuitiva e funcionalidade simples, adequada para uso em regiões com 
            conectividade limitada. Foque no ensino, não na tecnologia.
          </p>
          {!user && (
            <Button size="lg" asChild>
              <Link to="/auth">Criar conta gratuita</Link>
            </Button>
          )}
        </div>
      </main>

      <footer className="container mx-auto px-4 py-8 border-t">
        <div className="text-center text-muted-foreground">
          <p>&copy; 2024 Sistema de Gestão Docente. Desenvolvido para educadores brasileiros.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
