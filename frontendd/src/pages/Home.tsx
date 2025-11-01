import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageCircle, Users, Zap } from "lucide-react";
import { ModeToggle } from "../components/mode-toggle";

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  const features = [
    {
      icon: <MessageCircle className="h-8 w-8" />,
      title: "Biblioteca de Documentos Institucionales",
      description:
        "Accede a documentos académicos y formularios ya disponibles en la base de datos universitaria",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Selección de Contexto",
      description:
        "Elige documentos relevantes para enriquecer las respuestas del asistente con información específica",
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Respuestas Contextualizadas",
      description:
        "Obtén información precisa basada en la documentación oficial de la institución",
    },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-auto h-12 rounded-lg overflow-hidden">
                <img
                  src="/logo_ddper.png"
                  alt="Asistente UCT"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ModeToggle />
              <Button
                onClick={handleLoginClick}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors duration-200"
              >
                Iniciar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div className="flex flex-col justify-center">
            <div className="flex items-center mb-6">
              <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
                <span className="text-primary block">Asistente UCT</span>
              </h1>
            </div>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Asistente de inteligencia artificial especializado para académicos
              y personal administrativo. Selecciona documentos de la biblioteca
              institucional, formula preguntas y recibe respuestas precisas
              contextualizadas con la documentación oficial de la universidad.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <img
              src="/infotin.png"
              alt="Información del asistente"
              className="w-100 h-auto rounded-lg"
            />
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <CardHeader>
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                    <div className="text-primary flex items-center justify-center">
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle className="text-xl font-semibold text-card-foreground text-center">
                    {feature.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground text-center leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted text-muted-foreground py-6 mt-16 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground/80">
              © {currentYear} Universidad Católica de Temuco. Todos los derechos
              reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
