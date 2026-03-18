/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { PlusCircle, Image as ImageIcon, History } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CreditService } from "@/services/CreditService";

export default async function Dashboard() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let credits = 0;
  let userName = "Chef";

  if (user) {
    credits = await CreditService.getUserCredits(user.id);
    // Tentar pegar o nome do perfil
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle();
    if (profile?.full_name) {
      userName = profile.full_name;
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header Panel */}
      <div className="glass rounded-3xl p-8 mb-8 flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
        {/* Decorative blur */}
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
            <SparklesIcon className="w-5 h-5 text-gray-400 group-hover:text-purple-400 mr-3" />
            <span>Gerar de Texto</span>
          </Link>
        </div>

        {/* History Area */}
        <div className="col-span-1 md:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-300 flex items-center">
              <History className="w-5 h-5 mr-2" /> Geração Recente
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Mocked History Card */}
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-orange-500/50 transition cursor-pointer group">
                <div className="h-48 relative overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop" alt="Burger" className="object-cover w-full h-full group-hover:scale-105 transition duration-500" />
                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs">
                    HD
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-200 truncate">Hambúrguer Caseiro</h3>
                  <p className="text-xs text-gray-500 mt-1">Realçado há 2 dias</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

// Temporary internal component icon mapping
function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
  );
}
