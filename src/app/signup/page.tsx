"use client";

/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Mail, 
  Lock, 
  User,
  Sparkles,
  Eye,
  EyeOff
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (authError) {
        throw authError;
      }

      // O perfil e os créditos são criados exclusivamente pela trigger `handle_new_user` no banco.
      // Isso elimina logs de erro de duplicação e garante integridade referencial.
      
      toast.success("Bem-vindo! Levando você ao estúdio...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: unknown) {
      console.error("Signup error:", err);
      if (err instanceof Error && err.message.includes("Failed to fetch")) {
        setError("Authentication service unavailable");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Account could not be created");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-3xl font-black italic mb-6 group">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white not-italic text-base group-hover:scale-110 transition duration-300 shadow-lg shadow-orange-600/20">
              FF
            </div>
            <span className="text-white">Foto<span className="text-orange-500 italic">Fome</span></span>
          </Link>
          <h2 className="text-3xl font-bold text-white mb-2">Comece a vender mais</h2>
          <p className="text-gray-400">Crie sua conta e ganhe 2 imagens profissionais grátis.</p>
        </div>

        <div className="glass p-8 rounded-[2rem] border border-white/10 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">Nome Completo</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-orange-500 transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Seu nome ou nome do restaurante"
                  className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">E-mail</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-orange-500 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="exemplo@restaurante.com"
                  className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">Senha</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-orange-500 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Mínimo 8 caracteres"
                  className="w-full pl-11 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm"
              >
                {error}
              </motion.div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold text-lg transition-all transform active:scale-[0.98] shadow-xl shadow-orange-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 h-14"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Criar conta grátis <Sparkles className="w-5 h-5" /></>
              )}
            </button>

            <p className="text-[11px] text-center text-gray-500 leading-relaxed mt-4">
              Ao criar sua conta, você concorda com nossos <br className="sm:hidden" />
              <Link href="#" className="underline hover:text-gray-300 transition-colors">Termos de Uso</Link> e <Link href="#" className="underline hover:text-gray-300 transition-colors">Política de Privacidade</Link>.
            </p>
          </form>

          {/* Google / Github Login buttons commented out per Auth Fix Phase request
          <div className="relative my-8 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <span className="relative px-4 bg-[#0f172a] text-gray-500 text-sm">Ou cadastre-se com</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition group">
              <Github className="w-5 h-5 group-hover:text-white transition-colors" />
              <span className="text-sm font-medium">Github</span>
            </button>
            <button className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition group">
              <ChefHat className="w-5 h-5 text-orange-500 group-hover:scale-110 transition" />
              <span className="text-sm font-medium">Google</span>
            </button>
          </div>
          */}

        </div>

        <p className="text-center mt-8 text-gray-500">
          Já tem uma conta? <Link href="/login" className="text-orange-500 font-bold hover:text-orange-400 transition underline underline-offset-4">Fazer login</Link>
        </p>
      </motion.div>
    </div>
  );
}

