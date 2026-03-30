"use client";

/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  UploadCloud, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Camera, 
  Clock
} from "lucide-react";
import ImageCompareSlider from "@/components/ImageCompareSlider";
import { createClient } from "@/lib/supabase/client";

// Mock images for the gallery
const galleryImages = [
  {
    title: "Burger Premium",
    url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "Pizza Artesanal",
    url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "Sushi Elegante",
    url: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "Fritas Crocantes",
    url: "https://images.unsplash.com/photo-1573016608438-301f6fea21d9?q=80&w=800&auto=format&fit=crop",
  }
];

const pricingPlans = [
  { name: "Teste Grátis", credits: 2, price: "Grátis", description: "Perfeito para testar a magia", popular: false },
  { name: "Starter", credits: 10, price: "R$ 49,90", description: "Para pequenos menus", popular: false },
  { name: "Growth", credits: 30, price: "R$ 119,90", description: "O favorito dos restaurantes", popular: true },
  { name: "Pro", credits: 100, price: "R$ 349,90", description: "Alta demanda profissional", popular: false },
];

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  const ctaHref = isLoggedIn ? "/dashboard" : "/login";

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white selection:bg-orange-500/30">
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/80 via-[#0f172a]/95 to-[#0f172a]" />
          <img 
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2000&auto=format&fit=crop" 
            alt="Food background" 
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 mb-8">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-semibold uppercase tracking-wider">Nova era da fotografia gastronômica</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold mb-8 bg-gradient-to-r from-white via-white to-gray-500 bg-clip-text text-transparent leading-tight">
              Transforme fotos simples em imagens profissionais com IA
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-400 mb-10 leading-relaxed max-w-2xl mx-auto">
              Aumente suas vendas em delivery com fotos de estúdio criadas em segundos. 
              Sem fotógrafos caros, sem prazos longos.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={ctaHref}>
                <button className="px-10 py-5 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 font-bold text-lg transition shadow-[0_0_30px_-5px_rgba(234,88,12,0.4)] flex items-center justify-center gap-2">
                  Testar grátis <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <button 
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-10 py-5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-bold text-lg transition backdrop-blur-sm"
              >
                Ver planos
              </button>
            </div>
            
            <div className="mt-12 flex items-center justify-center gap-6 text-gray-500 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>+10k imagens geradas</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>98% de satisfação</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-24 bg-[#0f172a]">
        <div className="container mx-auto px-6">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Veja a transformação</h2>
            <p className="text-xl text-gray-400">Arraste para ver a diferença que a IA FotoFome faz no seu prato</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-white/5"
          >
            <ImageCompareSlider 
              beforeImage="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200&auto=format&fit=crop"
              afterImage="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop"
            />
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-600/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Como funciona</h2>
            <p className="text-xl text-gray-400">Em apenas 3 passos sua foto está pronta para vender</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { 
                icon: <UploadCloud className="w-8 h-8 text-orange-500" />, 
                title: "1. Envie sua foto", 
                desc: "Tire uma foto simples do prato, mesmo que seja com celular comum e iluminação caseira." 
              },
              { 
                icon: <Zap className="w-8 h-8 text-orange-500" />, 
                title: "2. A IA melhora a imagem", 
                desc: "Nossa IA processa as texturas, iluminação e apetite visual usando algoritmos avançados." 
              },
              { 
                icon: <Camera className="w-8 h-8 text-orange-500" />, 
                title: "3. Receba uma foto profissional", 
                desc: "Baixe o resultado profissional em alta resolução pronto para iFood, Rappi e redes sociais." 
              }
            ].map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="glass p-8 rounded-2xl border border-white/5 hover:border-orange-500/30 transition group"
              >
                <div className="w-16 h-16 rounded-xl bg-orange-500/10 flex items-center justify-center mb-6 border border-orange-500/20 group-hover:scale-110 transition">
                  {step.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-24 bg-[#0d1321]">
        <div className="container mx-auto px-6">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Nossa Galeria</h2>
            <p className="text-xl text-gray-400">Qualidade de estúdio para todos os tipos de cozinha</p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {galleryImages.map((img, idx) => (
              <motion.div 
                key={idx}
                {...fadeInUp}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -10 }}
                className="group relative h-80 rounded-2xl overflow-hidden border border-white/5"
              >
                <img 
                  src={img.url} 
                  alt={img.title}
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-6">
                  <span className="text-lg font-bold">{img.title}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 relative">
        <div className="container mx-auto px-6">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Escolha seu pacote</h2>
            <p className="text-xl text-gray-400">Sem assinaturas, pague apenas pelo que usar</p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {pricingPlans.map((plan, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`p-8 rounded-3xl border ${plan.popular ? 'border-orange-500 bg-orange-500/5 relative' : 'border-white/5 bg-white/5'} flex flex-col`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-orange-500 text-white text-xs font-bold rounded-full uppercase tracking-widest">
                    Mais popular
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="text-4xl font-extrabold mb-4">{plan.price}</div>
                <div className="text-gray-400 mb-6 flex-grow">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-500" />
                    <span className="text-white font-semibold">{plan.credits} imagens</span>
                  </div>
                  <p className="text-sm">{plan.description}</p>
                </div>
                <button className={`w-full py-3 rounded-xl font-bold transition ${plan.popular ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
                  Selecionar
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass relative overflow-hidden rounded-[2.5rem] p-12 md:p-24 text-center border border-white/10 bg-gradient-to-br from-orange-600/20 to-red-600/10"
          >
            <div className="absolute top-0 right-0 p-8">
              <Sparkles className="w-24 h-24 text-orange-500/10 rotate-12" />
            </div>
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-black mb-8">Pronto para aumentar suas vendas?</h2>
              <p className="text-xl text-gray-300 mb-10">
                Junte-se a centenas de restaurantes que já usam FotoFome para brilhar nos apps de entrega.
              </p>
              <Link href={ctaHref}>
                <button className="px-12 py-6 rounded-2xl bg-white text-black font-black text-xl hover:bg-orange-500 hover:text-white transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 mx-auto shadow-2xl">
                  Criar minha primeira imagem <ArrowRight className="w-6 h-6" />
                </button>
              </Link>
              <p className="mt-8 text-gray-400 text-sm flex items-center justify-center gap-2 italic">
                <Clock className="w-4 h-4" /> Leva menos de 30 segundos
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-2xl font-black italic">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white not-italic text-sm">
              FF
            </div>
            <span>Foto<span className="text-orange-500 text-3xl italic">Fome</span></span>
          </div>
          <p className="text-gray-500 text-sm">© 2026 FotoFome AI. Todos os direitos reservados.</p>
          <div className="flex gap-8 text-gray-400 text-sm">
            <a href="/termos" className="hover:text-white transition">Termos</a>
            <a href="/privacidade" className="hover:text-white transition">Privacidade</a>
            <a href="mailto:suporte@fotofome.ai" className="hover:text-white transition">Suporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
