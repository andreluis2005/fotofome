/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { PlusCircle, Image as ImageIcon, History, Sparkles, Clock, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CreditService } from "@/services/CreditService";

export default async function Dashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let credits = 0;
  let userName = "Chef";

  interface Generation {
    id: string;
    mode: string;
    prompt: string | null;
    output_url: string | null;
    credits_used: number;
    status: string;
    created_at: string;
  }
  let recentGenerations: Generation[] = [];

  if (user) {
    credits = await CreditService.getUserCredits(user.id);
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle();
    if (profile?.full_name) {
      userName = profile.full_name;
    }

    // F2/NF2: Query real da tabela generations
    const { data: generations } = await supabase
      .from('generations')
      .select('id, mode, prompt, output_url, credits_used, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(6);

    if (generations) {
      recentGenerations = generations;
    }
  }

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}min atrás`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    return `${days}d atrás`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header Panel */}
      <div className="glass rounded-3xl p-8 mb-8 flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 w-full mb-6 md:mb-0">
          <h1 className="text-3xl font-bold mb-2">Bem vindo de volta, {userName}!</h1>
          <p className="text-gray-400">Seu restaurante tem <span className="text-orange-400 font-bold">{credits} Créditos</span> disponíveis hoje.</p>
        </div>

        <div className="relative z-10 flex w-full md:w-auto gap-4">
          <Link href="/pricing" className="px-6 py-3 rounded-full font-medium text-sm glass hover:bg-white/10 transition whitespace-nowrap">
            Comprar Créditos
          </Link>
          <Link href="/studio" className="px-6 py-3 rounded-full font-medium text-sm bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/30 transition flex items-center whitespace-nowrap">
            <PlusCircle className="w-4 h-4 mr-2" /> Novo Prato
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-8">
        
        {/* Sidebar Actions */}
        <div className="col-span-1 space-y-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-300">Ações Rápidas</h2>
          <Link href="/studio?mode=enhance" className="w-full flex items-center p-4 glass rounded-xl hover:bg-white/10 transition text-left group">
            <ImageIcon className="w-5 h-5 text-gray-400 group-hover:text-orange-400 mr-3" />
            <span>Melhorar Foto</span>
          </Link>
          
          <Link href="/studio?mode=generate" className="w-full flex items-center p-4 glass rounded-xl hover:bg-white/10 transition text-left group">
            <Sparkles className="w-5 h-5 text-gray-400 group-hover:text-purple-400 mr-3" />
            <span>Gerar de Texto</span>
          </Link>
        </div>

        {/* History Area - Real Data */}
        <div className="col-span-1 md:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-300 flex items-center">
              <History className="w-5 h-5 mr-2" /> Geração Recente
            </h2>
          </div>

          {recentGenerations.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Nenhuma imagem gerada ainda</h3>
              <p className="text-gray-400 mb-6">Crie sua primeira imagem profissional no estúdio e ela aparecerá aqui!</p>
              <Link href="/studio" className="inline-flex items-center px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold transition">
                <PlusCircle className="w-4 h-4 mr-2" /> Criar Primeira Imagem
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentGenerations.map((gen) => (
                <div key={gen.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-orange-500/50 transition cursor-pointer group">
                  <div className="h-48 relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                    {gen.output_url ? (
                      <img 
                        src={gen.output_url} 
                        alt={gen.prompt || 'Imagem gerada'} 
                        className="object-cover w-full h-full group-hover:scale-105 transition duration-500" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-gray-600" />
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs flex items-center gap-1">
                        <Zap className="w-3 h-3 text-orange-400" /> {gen.credits_used}
                      </div>
                      <div className={`backdrop-blur-md px-2 py-1 rounded text-xs ${gen.mode === 'enhance' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                        {gen.mode === 'enhance' ? 'Melhoria' : 'Gerado'}
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-200 truncate">
                      {gen.prompt ? gen.prompt.substring(0, 40) : gen.mode === 'enhance' ? 'Foto melhorada' : 'Imagem gerada'}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatTimeAgo(gen.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
