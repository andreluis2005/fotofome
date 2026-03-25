"use client";

import { useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useState, useRef, Suspense } from "react";
import { Facebook, Instagram, Music, Utensils, Download, Copy, ArrowLeft, LayoutTemplate, Share2 } from "lucide-react";
import { SocialMediaCopyService, SocialNetwork, SocialFormat } from "@/lib/services/SocialMediaCopyService";
import { toast } from "sonner";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function SocialMediaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const imageUrl = searchParams.get('imageUrl');
  
  const [activeTab, setActiveTab] = useState<SocialNetwork>('instagram');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Validar Auth e Tier
    const checkTier = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setIsAuthenticated(true);
      // Validando Tier Pro/Plus (gatekeeper)
      const { data } = await supabase.from('profiles').select('tier').eq('id', user.id).single();
      if (data?.tier === 'free') {
        router.push('/pricing');
        toast.warning("Kit Social Media é exclusivo para assinantes Premium.");
      }
    };
    checkTier();
  }, [router]);

  if (!imageUrl) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <LayoutTemplate className="w-16 h-16 text-gray-600" />
        <h2 className="text-xl font-bold">Nenhuma imagem detectada</h2>
        <p className="text-gray-400">Por favor, gere uma imagem no Estúdio primeiro.</p>
        <Link href="/studio">
          <button className="bg-orange-600 px-6 py-2 rounded-xl text-white font-bold mt-4 hover:bg-orange-500 transition">
            Voltar ao Estúdio
          </button>
        </Link>
      </div>
    );
  }

  if (isAuthenticated === null) return <div className="min-h-screen pt-32 text-center text-gray-500">Validando acesso premium...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pt-28">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/studio" className="text-sm text-gray-400 hover:text-white flex items-center gap-2 mb-3">
            <ArrowLeft className="w-4 h-4" /> Voltar ao Estúdio
          </Link>
          <h1 className="text-3xl font-bold flex items-center gap-3">
             <LayoutTemplate className="text-blue-500" /> Dashboard de Kits & Redes Sociais
          </h1>
          <p className="text-gray-400 mt-2">Escolha as melhores formatações de publicação prontas para usar na sua estratégia de vendas.</p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex overflow-x-auto border-b border-white/10 pb-4 mb-8 space-x-2 md:space-x-8">
        <TabButton icon={<Instagram />} label="Instagram" id="instagram" activeTab={activeTab} onPress={setActiveTab} />
        <TabButton icon={<Facebook />} label="Facebook" id="facebook" activeTab={activeTab} onPress={setActiveTab} />
        <TabButton icon={<Music />} label="TikTok" id="tiktok" activeTab={activeTab} onPress={setActiveTab} />
        <TabButton icon={<Utensils />} label="Delivery (iFood)" id="ifood" activeTab={activeTab} onPress={setActiveTab} />
      </div>

      {/* Layout Grids */}
      {activeTab === 'instagram' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <PreviewCard network="instagram" format="post" title="Feed Vertical (4:5)" ratioClass="aspect-[4/5]" imageUrl={imageUrl} />
          <PreviewCard network="instagram" format="post" title="Feed Quadrado (1:1)" ratioClass="aspect-square" imageUrl={imageUrl} />
          <PreviewCard network="instagram" format="story" title="Stories / Reels (9:16)" ratioClass="aspect-[9/16]" imageUrl={imageUrl} />
        </div>
      )}

      {activeTab === 'facebook' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <PreviewCard network="facebook" format="post" title="Post Quadrado (1:1)" ratioClass="aspect-square" imageUrl={imageUrl} />
          <PreviewCard network="facebook" format="story" title="Capa de Página (16:9)" ratioClass="aspect-video" imageUrl={imageUrl} />
          <PreviewCard network="facebook" format="story" title="Stories (9:16)" ratioClass="aspect-[9/16]" imageUrl={imageUrl} />
        </div>
      )}

      {activeTab === 'tiktok' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
          <PreviewCard network="tiktok" format="story" title="Vídeo / Slide Vertical (9:16)" ratioClass="aspect-[9/16]" imageUrl={imageUrl} />
        </div>
      )}

      {activeTab === 'ifood' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <PreviewCard network="ifood" format="catalog" title="Cátalogo Lupa (1:1)" ratioClass="aspect-square" imageUrl={imageUrl} />
          <PreviewCard network="ifood" format="cover" title="Banner iFood (16:9)" ratioClass="aspect-video" imageUrl={imageUrl} />
        </div>
      )}

    </div>
  );
}

// ----------------------------------------------------
// Componentes Auxiliares
// ----------------------------------------------------

function TabButton({ icon, label, id, activeTab, onPress }: any) {
  const isActive = activeTab === id;
  return (
    <button 
      onClick={() => onPress(id)}
      className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition whitespace-nowrap ${
        isActive ? 'bg-white text-black shadow-lg shadow-white/20' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
      }`}
    >
      {React.cloneElement(icon, { className: 'w-5 h-5' })} {label}
    </button>
  );
}

function PreviewCard({ network, format, title, ratioClass, imageUrl }: { network: SocialNetwork, format: SocialFormat, title: string, ratioClass: string, imageUrl: string }) {
  const [copyText, setCopyText] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    SocialMediaCopyService.generateCopy(network, format).then(setCopyText);
  }, [network, format]);

  const handleCopy = () => {
    navigator.clipboard.writeText(copyText);
    toast.success("Legenda copiada com sucesso! Pronto para colar e engajar 🚀");
  };

  const generateCanvas = (): Promise<HTMLCanvasElement> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("No ctx");

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;

      img.onload = () => {
        let targetRatio = 1;
        if (ratioClass.includes("4/5")) targetRatio = 4 / 5;
        if (ratioClass.includes("9/16")) targetRatio = 9 / 16;
        if (ratioClass.includes("video")) targetRatio = 16 / 9;

        let sw = img.width;
        let sh = img.height;
        let sx = 0;
        let sy = 0;

        const imgRatio = sw / sh;

        if (imgRatio > targetRatio) {
          sw = sh * targetRatio;
          sx = (img.width - sw) / 2;
        } else {
          sh = sw / targetRatio;
          sy = (img.height - sh) / 2;
        }

        const MAX_W = 1080;
        canvas.width = MAX_W;
        canvas.height = MAX_W / targetRatio;

        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
        resolve(canvas);
      };
      
      img.onerror = reject;
    });
  };

  const handleDownload = async () => {
    try {
      const canvas = await generateCanvas();
      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
      const link = document.createElement("a");
      link.download = `fotofome-${network}-${format}-${Date.now()}.jpg`;
      link.href = dataUrl;
      link.click();
      toast.success(`Arte formatada baixada em Alta Qualidade para o seu HD!`);
    } catch (e) {
      toast.error("Erro ao preparar imagem para download.");
    }
  };

  const handleShare = async () => {
    try {
      const canvas = await generateCanvas();
      
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `fotofome-${network}-${format}.jpg`, { type: 'image/jpeg' });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'FotoFome AI',
            text: copyText, // Envia a Copy estrategica nativamente
            files: [file]
          });
          toast.success("App nativo aberto com sucesso!");
        } else if (navigator.share) {
           // Fallback para navegadores que não suportam arquivo, mas suportam texto (Safari Web)
           await navigator.share({
            title: 'FotoFome AI',
            text: copyText,
          });
          toast.success("Texto da legenda pronto para envio!");
        } else {
          toast.warning("Seu navegador não suporta a função Compartilhar nativa nativa. Por favor, baixe a imagem e cole a legenda.");
        }
      }, 'image/jpeg', 0.95);
    } catch (e) {
      console.error(e);
      // Fallback natural (usuário cancelou no celular etc)
    }
  };

  return (
    <div className="glass rounded-3xl overflow-hidden border border-white/10 flex flex-col group">
      <div className="p-4 border-b border-white/5 bg-black/40 flex justify-between items-center">
        <h3 className="font-bold text-sm text-gray-200">{title}</h3>
        <p className="text-[10px] uppercase text-gray-500 tracking-wider">Formato Otimizado</p>
      </div>

      <div className="p-6 flex flex-col items-center bg-black/20">
        <div className={`w-full max-w-[200px] border border-white/20 rounded-xl overflow-hidden shadow-2xl ${ratioClass} bg-black/50 relative group`}>
           <img src={imageUrl} alt={title} className="w-full h-full object-cover" crossOrigin="anonymous" />
           <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
             <button onClick={handleDownload} className="bg-white text-black p-3 rounded-full hover:scale-110 transition shadow-lg">
                <Download className="w-5 h-5" />
             </button>
           </div>
        </div>
      </div>

      <div className="p-6 border-t border-white/5 bg-black/40 flex-1 flex flex-col">
        <h4 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide flex items-center gap-2">
          <Copy className="w-3 h-3"/> Copy recomendada:
        </h4>
        <p className="text-sm text-gray-300 whitespace-pre-line leading-relaxed flex-1 italic relative before:content-[''] before:absolute before:-left-3 before:-top-1 before:text-3xl before:text-gray-600 before:font-serif">
          "{copyText}"
        </p>
        
        <div className="mt-6 flex flex-col gap-2">
           <button 
            onClick={handleShare}
            className="w-full bg-orange-600 hover:bg-orange-500 py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(234,88,12,0.3)] text-white"
           >
             <Share2 className="w-5 h-5"/> Compartilhar Direto
           </button>
           <div className="flex items-center gap-2">
             <button 
              onClick={handleDownload}
              className="flex-[0.8] bg-white/10 hover:bg-white/20 py-2.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2"
             >
               <Download className="w-4 h-4"/> Baixar
             </button>
             <button 
              onClick={handleCopy}
              className="flex-1 bg-blue-600 hover:bg-blue-500 py-2.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2"
             >
               <Copy className="w-4 h-4"/> Copiar Dica
             </button>
           </div>
        </div>
      </div>
      
    </div>
  );
}

export default function SocialMediaDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-32 text-center text-gray-400">Carregando dashboard de marketing...</div>}>
      <SocialMediaContent />
    </Suspense>
  );
}
