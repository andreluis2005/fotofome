import { Check } from "lucide-react";

export default function Pricing() {
  const packages = [
    {
      name: "Starter",
      images: "10 Imagens",
      price: "R$ 49,90",
      features: ["Alta resolução (4K)", "Sem Watermark", "Acesso aos prompts Premium", "Sucesso garantido em Ifood"],
      popular: false
    },
    {
      name: "Growth",
      images: "30 Imagens",
      price: "R$ 119,90",
      features: ["Tudo do Starter", "Edição em Lote (Batch)", "Geração Text-to-Image", "Prioridade na Fila IA"],
      popular: true
    },
    {
      name: "Pro Agency",
      images: "100 Imagens",
      price: "R$ 349,90",
      features: ["Voltado para múltiplas filiais", "Suporte prioritário via WhatsApp", "Importação do cardápio completo", "Uso em cardápios impressos s/ restrição"],
      popular: false
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 pt-20 pb-32">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Pague por imagem, <br />não por mês.</h1>
        <p className="text-xl text-gray-400">Preços justos e pré-pagos criados para o bolso do dono do restaurante.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {packages.map((pkg, idx) => (
          <div key={idx} className={`relative glass rounded-3xl p-8 flex flex-col ${pkg.popular ? 'border-orange-500/50 shadow-[0_0_30px_rgba(234,88,12,0.15)] ring-1 ring-orange-500' : 'border-white/10'}`}>
            
            {pkg.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Mais Popular
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-300">{pkg.name}</h3>
              <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                {pkg.price}
              </div>
              <p className="mt-2 text-orange-400 font-bold">{pkg.images} de alta conversão</p>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {pkg.features.map((feature, fIdx) => (
                <li key={fIdx} className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 shrink-0" />
                  <span className="text-gray-300 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <button className={`w-full py-4 rounded-xl font-bold transition ${
              pkg.popular 
                ? 'bg-orange-600 hover:bg-orange-500 text-white' 
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}>
              Comprar Agora
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
