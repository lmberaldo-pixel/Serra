import React, { useState } from 'react';
import { 
  Wrench, 
  ShieldCheck, 
  Hammer, 
  Phone, 
  User, 
  MessageSquare, 
  CheckCircle2,
  MapPin,
  Bike,
  Grid,
  UserPlus,
  X
} from 'lucide-react';
import { ServiceCategory, ServiceRequest } from './types';
import { supabase } from './supabaseClient';

const WHATSAPP_NUMBER = "5511970210989";
const WEBHOOK_URL = "https://hook.us2.make.com/y3r9f3q3tled8wlycdwn3wktxy2swnyi";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const App: React.FC = () => {
  const [formData, setFormData] = useState<ServiceRequest>({
    clientName: '',
    phone: '',
    description: '',
    serviceType: ServiceCategory.PORTAO
  });

  // State for the Registration Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [popupData, setPopupData] = useState({ name: '', whatsapp: '' });
  const [isRegistering, setIsRegistering] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePopupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPopupData(prev => ({ ...prev, [name]: value }));
  };

  const handleWhatsAppRedirect = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Try to save to Supabase "orcamentos" table (fire and forget logic to not delay user)
    try {
      supabase.from('orcamentos').insert([
        { 
          client_name: formData.clientName,
          phone: formData.phone,
          service_type: formData.serviceType,
          description: formData.description,
          created_at: new Date()
        }
      ]).then(({ error }) => {
        if (error) console.error("Erro ao salvar no Supabase:", error);
      });
    } catch (err) {
      console.error("Erro de conexão Supabase:", err);
    }

    const message = `*Solicitação de Orçamento - Serralheria Delivery*%0A%0A` +
      `*Cliente:* ${formData.clientName}%0A` +
      `*Telefone:* ${formData.phone}%0A` +
      `*Categoria:* ${formData.serviceType}%0A` +
      `*Descrição:* ${formData.description}`;

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    
    // Simulate some feedback before redirecting
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
      setIsSubmitting(false);
    }, 800);
  };

  const handlePopupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);

    try {
      // 1. Send to Webhook (Make.com) as requested
      const webhookPromise = fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(popupData),
      });

      // 2. Save to Supabase "leads" table
      const supabasePromise = supabase.from('leads').insert([
        { 
          name: popupData.name, 
          whatsapp: popupData.whatsapp,
          created_at: new Date()
        }
      ]);

      await Promise.allSettled([webhookPromise, supabasePromise]);

      alert("Solicitação enviada com sucesso!");
      setIsModalOpen(false);
      setPopupData({ name: '', whatsapp: '' });
    } catch (error) {
      console.error("Erro ao processar solicitação:", error);
      alert("Ocorreu um erro ao enviar. Verifique sua conexão e tente novamente.");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Header - Centralized */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-lg border-b border-slate-800">
        <div className="container mx-auto px-4 py-4 flex flex-col items-center">
          <div className="flex flex-col items-center text-center group cursor-default">
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-amber-500 p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-amber-500/20">
                <Wrench className="text-slate-900" size={26} />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tighter uppercase">
                Serralheria <span className="text-amber-500">Delivery</span>
              </h1>
            </div>
            <p className="text-[10px] md:text-xs text-slate-400 uppercase tracking-[0.3em] font-medium leading-none mt-3">
              Reparos Rápidos e Confiáveis
            </p>
          </div>
          
          <div className="mt-3 flex items-center justify-center gap-4 text-[10px] md:text-xs text-slate-500 border-t border-slate-800/50 pt-2 w-full max-w-xs">
            <span className="flex items-center gap-1.5"><MapPin size={12} className="text-amber-500/70"/> Osasco e Região</span>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[450px] flex items-center justify-center overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=2070&auto=format&fit=crop" 
            className="absolute inset-0 w-full h-full object-cover grayscale brightness-50"
            alt="Welding Background"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/80 to-slate-900"></div>
          
          <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
            <div className="inline-block bg-amber-500 text-slate-900 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 animate-pulse">
              Atendimento Expresso
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Precisando de um <br className="hidden md:block" /> <span className="text-amber-500 underline decoration-amber-500/30 underline-offset-8">Serralheiro?</span>
            </h2>
            <p className="text-lg md:text-xl text-slate-300 mb-10 font-light">
              Pequenos reparos, soldas, portões e fechaduras com a agilidade que você precisa.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 px-5 py-2.5 rounded-full text-white text-sm">
                <ShieldCheck size={18} className="text-amber-500" /> Garantia de Qualidade
              </div>
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 px-5 py-2.5 rounded-full text-white text-sm">
                <Bike size={18} className="text-amber-500" /> Chegamos Rápido de Moto
              </div>
            </div>
          </div>
        </section>

        {/* Services Showcase */}
        <section className="py-16 bg-white relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">O que Resolvemos</h3>
              <div className="w-16 h-1.5 bg-amber-500 mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: 'Portões', desc: 'Reparos em trilhos, roldanas e guias de portões automáticos ou manuais.', icon: <CheckCircle2 className="text-amber-500" /> },
                { title: 'Fechaduras', desc: 'Troca e instalação de fechaduras, trincos e travas de segurança.', icon: <ShieldCheck className="text-amber-500" /> },
                { title: 'Grades', desc: 'Fabricação e reparo de grades de proteção para janelas e portas.', icon: <Grid className="text-amber-500" /> },
                { title: 'Corrimão', desc: 'Instalação e conserto de corrimãos para escadas e rampas.', icon: <Hammer className="text-amber-500" /> },
              ].map((item, idx) => (
                <div key={idx} className="p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:border-amber-200 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300 group">
                  <div className="mb-5 bg-white w-12 h-12 flex items-center justify-center rounded-2xl shadow-sm group-hover:bg-amber-500 transition-colors duration-300">
                    <div className="group-hover:text-slate-900 transition-colors">
                      {item.icon}
                    </div>
                  </div>
                  <h4 className="font-bold text-xl mb-3 text-slate-800">{item.title}</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section id="orcamento" className="py-20 bg-slate-50 border-t border-slate-200">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-slate-100">
              <div className="lg:w-[35%] bg-slate-900 p-10 text-white flex flex-col justify-between relative overflow-hidden">
                {/* Decorative element */}
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>
                
                <div className="relative z-10">
                  <h3 className="text-3xl font-bold mb-6">Orçamento Rápido</h3>
                  <p className="text-slate-400 text-base mb-8 leading-relaxed">
                    Estamos prontos para atender seu chamado. Descreva o serviço e receba um retorno imediato.
                  </p>
                  
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 group">
                      <div className="bg-amber-500/20 p-3 rounded-xl group-hover:bg-amber-500 transition-colors">
                        <Phone size={20} className="text-amber-500 group-hover:text-slate-900" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">WhatsApp</p>
                        <p className="text-lg font-medium">(11) 97021-0989</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 group">
                      <div className="bg-amber-500/20 p-3 rounded-xl group-hover:bg-amber-500 transition-colors">
                        <Bike size={20} className="text-amber-500 group-hover:text-slate-900" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest"></p>
                        <p className="text-xl font-black text-amber-500 uppercase tracking-wide">Motocicleta</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 mt-12 pt-8 border-t border-slate-800">
                   <p className="text-xl md:text-2xl text-white font-bold leading-relaxed">"Atendimento de moto para atender você mais rápido"</p>
                </div>
              </div>

              <div className="lg:w-[65%] p-10 lg:p-14">
                <form onSubmit={handleWhatsAppRedirect} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <User size={16} className="text-amber-500" /> Seu Nome
                      </label>
                      <input 
                        required
                        type="text" 
                        name="clientName"
                        value={formData.clientName}
                        onChange={handleInputChange}
                        placeholder="Ex: João Silva"
                        className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all placeholder:text-slate-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Phone size={16} className="text-amber-500" /> WhatsApp
                      </label>
                      <input 
                        required
                        type="tel" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="(11) 99999-9999"
                        className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all placeholder:text-slate-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <Wrench size={16} className="text-amber-500" /> Categoria do Serviço
                    </label>
                    <select 
                      name="serviceType"
                      value={formData.serviceType}
                      onChange={handleInputChange}
                      className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all bg-white cursor-pointer"
                    >
                      <option value={ServiceCategory.PORTAO}>{ServiceCategory.PORTAO}</option>
                      <option value={ServiceCategory.FECHADURA}>{ServiceCategory.FECHADURA}</option>
                      <option value={ServiceCategory.GRADES}>{ServiceCategory.GRADES}</option>
                      <option value={ServiceCategory.CORRIMAO}>{ServiceCategory.CORRIMAO}</option>
                      <option value={ServiceCategory.SOLDA}>{ServiceCategory.SOLDA}</option>
                      <option value={ServiceCategory.OUTROS}>{ServiceCategory.OUTROS}</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <MessageSquare size={16} className="text-amber-500" /> O que você precisa?
                    </label>
                    <textarea 
                      required
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Descreva brevemente o problema para agilizarmos seu orçamento..."
                      rows={4}
                      className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all resize-none placeholder:text-slate-300"
                    ></textarea>
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-green-600/20 hover:shadow-green-600/30 transition-all duration-300 active:scale-[0.98] disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Enviando...
                      </span>
                    ) : (
                      <>
                        <WhatsAppIcon className="w-6 h-6" />
                        Solicitar Orçamento
                      </>
                    )}
                  </button>

                  <p className="text-center text-[11px] text-slate-400 font-medium">
                    Sem compromisso. Resposta rápida garantida.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center gap-8">
            <div className="flex flex-col items-center gap-3">
              <div className="bg-amber-500 p-2 rounded-xl">
                <Wrench className="text-slate-900" size={24} />
              </div>
              <h4 className="text-2xl font-bold text-white uppercase tracking-tighter">Serralheria <span className="text-amber-500">Delivery</span></h4>
              <p className="max-w-md text-sm text-slate-500">
                Especialistas em reparos rápidos de serralheria residencial e comercial. Soldas, portões e segurança.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8 text-sm font-medium">
              <a href="#" className="hover:text-amber-500 transition-colors uppercase tracking-widest">Início</a>
              <a href="#orcamento" className="hover:text-amber-500 transition-colors uppercase tracking-widest">Orçamento</a>
              <a href="https://wa.me/5511970210989" target="_blank" className="hover:text-amber-500 transition-colors uppercase tracking-widest">WhatsApp</a>
            </div>

            <div className="w-full border-t border-slate-800 pt-10 mt-2 flex flex-col md:flex-row justify-between items-center text-[10px] md:text-xs uppercase tracking-widest gap-4">
              <p>&copy; Serralheria Delivery - Todos os direitos reservados</p>
              <div className="flex gap-4">
                <span>Atendendo Osasco e Região</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Registration Modal Popup */}
      {isModalOpen && (
        <div 
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 relative"
          >
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 z-20 text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
            >
              <X size={20} />
            </button>
            
            <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
               <div className="absolute -left-10 -top-10 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl"></div>
               <div className="inline-block bg-amber-500 p-3 rounded-2xl mb-4 relative z-10 shadow-lg shadow-amber-500/20">
                 <UserPlus size={32} className="text-slate-900" />
               </div>
               <h3 className="text-2xl font-bold text-white relative z-10">Aguardar Contato</h3>
               <p className="text-slate-400 text-sm mt-2 relative z-10">Receba ofertas exclusivas e atendimento prioritário.</p>
            </div>

            <div className="p-8">
              <form onSubmit={handlePopupSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">Seu Nome</label>
                  <input 
                    required
                    type="text" 
                    name="name"
                    value={popupData.name}
                    onChange={handlePopupChange}
                    placeholder="Como podemos te chamar?"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all bg-slate-50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">WhatsApp</label>
                  <input 
                    required
                    type="tel" 
                    name="whatsapp"
                    value={popupData.whatsapp}
                    onChange={handlePopupChange}
                    placeholder="(11) 99999-9999"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all bg-slate-50"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isRegistering}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isRegistering ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Enviando...
                    </span>
                  ) : (
                    <>
                      <UserPlus size={18} className="text-amber-500" />
                      Solicitar Contato
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Floating Budget CTA (Right Side - Mobile Only) */}
      <div className="md:hidden fixed bottom-6 right-6 z-40">
        <button 
          onClick={() => document.getElementById('orcamento')?.scrollIntoView({ behavior: 'smooth' })}
          className="bg-amber-500 text-slate-900 h-16 w-16 rounded-full shadow-2xl flex items-center justify-center transition-transform active:scale-90 animate-bounce shadow-amber-500/40"
          aria-label="Pedir Orçamento"
        >
          <MessageSquare size={28} />
        </button>
      </div>
    </div>
  );
};

export default App;