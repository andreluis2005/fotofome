"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, UploadCloud, RefreshCw } from "lucide-react";
import ImageCompareSlider from "@/components/ImageCompareSlider";
import { createClient } from "@/lib/supabase/client";

function StudioContent() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'generate' ? 'generate' : 'enhance';
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<'enhance' | 'generate'>(initialMode);
  const [credits, setCredits] = useState<number | null>(null);
  
  // Imagem base forçada mockada para efeito
  const mockBeforeImg = "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&auto=format&fit=crop&blur=10";

  // Buscar créditos reais do perfil
  useEffect(() => {
    const fetchCredits = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('credits')
          .eq('id', user.id)
          .maybeSingle();
        setCredits(profile?.credits ?? 0);
      }
    };
    fetchCredits();
  }, []);

  // Helpers to fetch the image as base64 so we can send it to enhance
  const getBase64FromUrl = async (url: string): Promise<string> => {
    const data = await fetch(url);
    const blob = await data.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob); 
      reader.onloadend = () => {
        resolve(reader.result as string);
      }
    });
  }

  const handleGenerate = async () => {
    if (!prompt) {
      alert("Por favor, insira um prompt para a IA.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      let endpoint = '/api/enhance';
      const body: Record<string, string> = { prompt };

      if (mode === 'enhance') {
        endpoint = '/api/enhance';
        const base64 = await getBase64FromUrl(mockBeforeImg);
        body.imageBase64 = base64;
      } else {
        endpoint = '/api/generate';
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao processar imagem');
      }

      setResult(data.image);

      // Atualiza créditos após geração bem-sucedida
      if (credits !== null) {
        setCredits(prev => (prev !== null ? prev - 1 : 0));
      }
    } catch (error: unknown) {
      console.error("AI Error:", error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Erro desconhecido");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold flex items-center">
          <Sparkles className="text-orange-500 mr-2" /> Estúdio IA
        </h1>
        <div className="text-sm px-3 py-1 bg-white/10 rounded-full border border-white/20">
          Você tem <span className="font-bold text-orange-400">{credits !== null ? credits : '...'} Créditos</span>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="flex space-x-4 mb-6">
        <button 
          onClick={() => setMode('enhance')}
          className={`px-4 py-2 rounded-full font-medium text-sm transition ${mode === 'enhance' ? 'bg-orange-600 text-white' : 'glass text-gray-400 hover:text-white'}`}
        >
          Melhorar Foto base
        </button>
        <button 
          onClick={() => setMode('generate')}
          className={`px-4 py-2 rounded-full font-medium text-sm transition ${mode === 'generate' ? 'bg-orange-600 text-white' : 'glass text-gray-400 hover:text-white'}`}
        >
          Gerar do Zero (Texto)
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Painel Esquerdo: Controles */}
        <div className="glass rounded-3xl p-6 lg:p-8 flex flex-col space-y-8 h-fit">
          
          {mode === 'enhance' && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Upload Base da Foto</h2>
              <div className="border-2 border-dashed border-gray-600 rounded-2xl h-48 flex items-center justify-center flex-col hover:border-orange-500/50 transition cursor-pointer bg-black/40">
                <UploadCloud className="w-8 h-8 text-gray-500 mb-2" />
                <p className="text-sm text-gray-400">Arraste a foto do prato ou <span className="text-orange-500">clique</span></p>
              </div>
              <div className="mt-4 flex items-center space-x-4">
                <div className="w-16 h-16 rounded overflow-hidden relative">
                  <img src={mockBeforeImg} alt="Preview thumbnail" className="object-cover w-full h-full" />
                </div>
                <p className="text-xs text-gray-500 flex-1">A imagem carregada será enviada aos nossos provedores de re-iluminação para aprimoramento culinário.</p>
              </div>
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold mb-3">Refinamento (Prompt Engineer)</h2>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none h-28"
              placeholder={mode === 'enhance' ? "Ex: Reforce o cheddar derretido e crie fumaça no Hambúrguer." : "Ex: Um hambúrguer artesanal suculento com bacon, foto comercial 4k de estúdio."}
            ></textarea>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center transition-all ${
              loading ? 'bg-orange-600/50 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-500 shadow-[0_0_20px_rgba(234,88,12,0.4)]'
            }`}
          >
            {loading ? (
              <><RefreshCw className="animate-spin mr-2 w-5 h-5"/> Processando IA...</>
            ) : (
              <><Sparkles className="mr-2 w-5 h-5" /> Transformar Mágica (Custa 1 Crédito)</>
            )}
          </button>
        </div>

        {/* Painel Direito: Resultado Dinâmico (Slider) */}
        <div className="flex flex-col">
          <div className="flex-1 glass rounded-3xl overflow-hidden flex items-center justify-center p-2 border border-white/10 h-[500px]">
            {loading ? (
              <div className="flex flex-col items-center">
                <RefreshCw className="w-10 h-10 animate-spin text-orange-500 mb-4" />
                <p className="text-gray-400 animate-pulse">Injetando luz de estúdio culinário...</p>
              </div>
            ) : result ? (
              mode === 'enhance' ? (
                <ImageCompareSlider 
                  beforeImage={mockBeforeImg}
                  afterImage={result}
                />
              ) : (
                <img src={result} alt="Generated Result" className="w-full h-full object-cover rounded-2xl" />
              )
            ) : (
              <div className="text-center p-8">
                <ImageIconPlaceholder className="mx-auto w-12 h-12 text-gray-700 mb-2" />
                <p className="text-gray-500">Sua renderização final aparecerá aqui</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function Studio() {
  return (
    <Suspense fallback={<div className="max-w-6xl mx-auto px-4 py-8 text-gray-400">Carregando estúdio...</div>}>
      <StudioContent />
    </Suspense>
  );
}

function ImageIconPlaceholder(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
  );
}
