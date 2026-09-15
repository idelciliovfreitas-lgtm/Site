
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Sparkles, Bot, User, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Property } from '../types';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface AIAssistantProps {
  contextProperty?: Property;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ contextProperty }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Olá! Sou o assistente virtual da Idelcilio Vieira. Como posso ajudar você hoje com investimentos imobiliários em Madalena?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      let prompt = `Você é o assistente virtual da plataforma imobiliária Idelcilio Vieira em Madalena, Ceará. 
      Seja profissional, prestativo e persuasivo sobre investimentos na região. 
      
      Contexto atual: ${contextProperty 
        ? `O usuário está visualizando o imóvel "${contextProperty.title}" em ${contextProperty.location}. Preço: R$ ${contextProperty.price}. Área: ${contextProperty.area}m2. Tipo: ${contextProperty.type}.` 
        : 'O usuário está navegando no catálogo geral de imóveis.'}
      
      Informações sobre Madalena: Fica no Sertão Central, a 180km de Fortaleza, acesso pela BR-020. Economia forte em agropecuária e comércio.
      
      Pergunta do usuário: ${userMessage}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: "Você é um consultor imobiliário especializado na região de Madalena/CE. Responda de forma concisa e amigável.",
          temperature: 0.7,
        }
      });

      const text = response.text || "Desculpe, tive um problema ao processar sua solicitação.";
      setMessages(prev => [...prev, { role: 'model', text }]);
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Houve um erro técnico. Por favor, tente novamente em instantes." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[100] bg-gold-500 text-white p-4 rounded-full shadow-2xl hover:bg-gold-600 hover:scale-110 transition-all duration-300 group flex items-center gap-2"
      >
        <Sparkles className="animate-pulse" size={24} />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap text-xs font-black uppercase tracking-widest px-0 group-hover:px-2">
          Perguntar à IA
        </span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-[100] bg-white rounded-[32px] shadow-2xl border border-slate-100 flex flex-col transition-all duration-300 ${isMinimized ? 'h-16 w-64' : 'h-[550px] w-[380px]'} overflow-hidden`}>
      {/* Header */}
      <div className="bg-primary-600 p-4 flex items-center justify-between text-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center shadow-lg">
            <Bot size={18} />
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest">IA Assistente</h4>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[8px] font-bold text-primary-200 uppercase">Consultor Ativo</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-primary-600 text-white rounded-tr-none' 
                    : 'bg-white border border-slate-100 text-slate-600 rounded-tl-none shadow-sm'
                }`}>
                  <div className="flex items-center gap-2 mb-1 opacity-50">
                    {msg.role === 'user' ? <User size={10} /> : <Bot size={10} />}
                    <span className="text-[8px] font-black uppercase tracking-widest">{msg.role === 'user' ? 'Você' : 'Gemini AI'}</span>
                  </div>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-in fade-in">
                <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2 text-slate-400">
                  <Loader2 size={14} className="animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Analisando...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-slate-100 shrink-0">
            <div className="relative flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-1 focus-within:ring-2 focus-within:ring-gold-500/10 transition-all">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ex: Por que investir em Madalena?"
                className="flex-1 bg-transparent px-4 py-3 text-xs font-medium text-slate-700 outline-none"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="bg-primary-600 text-white p-3 rounded-xl hover:bg-gold-500 transition-all disabled:opacity-50 active:scale-95"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-[8px] text-center text-slate-400 mt-2 font-bold uppercase tracking-widest">
              Powered by Google Gemini
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default AIAssistant;
