"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { LogOut, User as UserIcon, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold group-hover:scale-110 transition duration-300">
                FF
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                FotoFome<span className="text-orange-500">.AI</span>
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/pricing" className="text-sm font-medium text-gray-400 hover:text-white transition">Preços</Link>
            
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition">
                      <LayoutDashboard className="w-4 h-4" /> Painel
                    </Link>
                    <div className="h-4 w-px bg-white/10" />
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-300 transition"
                    >
                      <LogOut className="w-4 h-4" /> Sair
                    </button>
                    <Link href="/dashboard">
                       <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500/20 to-red-500/20 border border-orange-500/20 flex items-center justify-center text-orange-500 cursor-pointer hover:border-orange-500 transition">
                         <UserIcon className="w-5 h-5" />
                       </div>
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition">Entrar</Link>
                    <Link href="/signup">
                      <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold text-sm transition shadow-lg shadow-orange-600/20">
                        Começar agora
                      </button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Mobile menu logic could go here, keeping it clean for now */}
        </div>
      </div>
    </nav>
  );
}
