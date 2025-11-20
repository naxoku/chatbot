import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

import logoVrae from "../assets/logo_vrae.webp";
import fondoVrae from "../assets/fondo_vrae.webp";
import clickIcon from "../assets/click.webp";
import infotin from "../assets/infotin.webp";

const Home: React.FC = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    document.title = "Inicio - Asistente virtual VRAE";
  }, []);

  const handleLoginClick = () => {
    navigate("/login");
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="h-screen bg-[#3E8BD6] relative overflow-hidden flex flex-col">
      {/* Patrón de fondo con imagen */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('${fondoVrae}')`,
          height: "calc(100vh - 120px)",
          bottom: "120px",
        }}
      />

      {/* Header */}
      <header className="relative z-10 shrink-0">
        <div className="container mx-auto px-3 py-2 md:px-4 md:py-4">
          <div className="flex items justify-start">
            {/* Logo UCT */}
            <div className="bg-transparent flex items-center p-0">
              <img
                src={logoVrae}
                alt="Logo UCT"
                className="w-full h-12 md:h-16 lg:h-20 object-contain"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Flex grow para ocupar espacio disponible */}
      <main className="relative z-10 grow flex items-center justify-center" aria-label="Contenido principal">
        <div className="container mx-auto px-3 md:px-4">
          <div className="max-w-6xl mx-auto">
            {/* Layout híbrido: texto centrado + imagen a la derecha */}
            <div className="flex flex-col lg:flex-row items-center justify-center gap-4 md:gap-6 lg:gap-8">
              {/* Contenedor de texto centrado (como 1 columna) */}
              <div className="flex-1 max-w-3xl">
                <div className="text-center space-y-3 md:space-y-4 lg:space-y-6">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight">
                    Asistente virtual VRAE
                  </h1>

                  <p className="text-sm sm:text-base md:text-lg text-white leading-relaxed px-2 md:px-0">
                    Accede a la información de documentos institucionales de
                    forma rápida y precisa. Pregúntale al bot sobre reglamentos,
                    formularios o cualquier otro documento oficial, y obtén
                    respuestas al instante.
                  </p>
                </div>
              </div>

              {/* Imagen posicionada a la derecha */}
              <div className="shrink-0 lg:ml-4 xl:ml-8 order-first lg:order-last">
                <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56">
                  <img
                    src={infotin}
                    alt="Asistente Virtual"
                    className="w-full h-full object-contain drop-shadow-2xl animate-float"
                  />
                </div>
              </div>
            </div>

            {/* Botón centrado debajo */}
            <div className="flex justify-center pt-6 md:pt-8 mt-4">
              <Button
                onClick={handleLoginClick}
                className="bg-white text-[#3E8BD6] hover:bg-white/90 transition-all duration-200 rounded-xl font-bold group relative overflow-hidden h-auto p-0 w-full max-w-sm sm:max-w-md lg:max-w-lg"
              >
                <span className="flex items-center w-full">
                  <span className="flex-1 text-center text-sm sm:text-base md:text-lg lg:text-xl px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                    Acceder al sistema
                  </span>
                  {/* Cursor icon en cuadro amarillo */}
                  <div className="bg-[#FCC200] py-3 px-3 sm:py-4 sm:px-4 md:py-5 md:px-5 rounded-r-xl flex items-center justify-center h-full">
                    <img
                      src={clickIcon}
                      alt="Click"
                      className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 object-contain"
                    />
                  </div>
                </span>
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Departments Section - Pegado al footer */}
      <div className="relative z-10">
        <div className="p-2 sm:p-3 md:p-4 lg:p-6">
          {/* Siglas */}
          <div className="text-center mb-1 md:mb-2">
            <h2 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-white tracking-wider leading-tight">
              <span className="block sm:inline">
                DIRIN - DDPER - DFIN - DGDC - DCR
              </span>
            </h2>
          </div>
          {/* Nombres completos */}
          <div className="text-center">
            <h4 className="text-xs sm:text-sm md:text-base text-white/95 leading-relaxed px-2">
              <span className="block lg:inline">
                Dirección de Informática - Dirección de Desarrollo de Personas -
                Dirección de Finanzas - Dirección de Gestión y Desarrollo de
                Campus - Dirección de Crédito y Recaudación
              </span>
            </h4>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-[#FCC200] py-3 sm:py-4 md:py-6 lg:py-8 shrink-0 flex items-center justify-center">
        <div className="container mx-auto px-3 md:px-4">
          <div className="text-center space-y-1 md:space-y-2">
            <p className="text-sm sm:text-base md:text-lg font-bold text-[#3E8BD6]">
              Asistente virtual VRAE
            </p>
            <p className="text-xs sm:text-sm md:text-base text-[#3E8BD6]/80">
              {currentYear} Asistente virtual UCT. Todos los derechos
              reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* CSS para animación float */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;
