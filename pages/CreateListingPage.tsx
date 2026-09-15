
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Upload, MapPin, DollarSign, Layout, FileText, Check, X, 
  Bed, Bath, Car, ArrowLeft, Info, Sparkles, Globe, 
  Building, Landmark, TreePine, Warehouse, Home, Camera,
  ShieldCheck, Search, Loader2, Maximize2, Minimize2,
  Maximize, Layers, Ruler, Tag, ArrowRight, Wand2, HandCoins, Key,
  ZoomIn, UserCheck, Phone, Mail, Users, CheckCircle2
} from 'lucide-react';
import GoogleMap from '../components/GoogleMap';
import ImageLightboxModal from '../components/ImageLightboxModal';
import { 
  getStoredProperties, saveProperty, LOGO_URL, MADALENA_NEIGHBORHOODS,
  getStoredEmployees, VIMOBI_DEFAULT_AGENT, sanitizeAvatarUrl 
} from '../constants';
import { Property, PropertyType, TransactionType, Employee } from '../types';
import { GoogleGenAI } from "@google/genai";
import { supabase } from '../supabase';

const CreateListingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditing = editId !== null;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const agentAvatarInputRef = useRef<HTMLInputElement>(null);
  const [previewImageIndex, setPreviewImageIndex] = useState<number | null>(null);
  
  const [employeesList, setEmployeesList] = useState<Employee[]>([]);
  const [agentMode, setAgentMode] = useState<'vimobi' | 'employee' | 'custom'>('vimobi');
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');

  const [formData, setFormData] = useState({
    title: '',
    type: 'Casa' as PropertyType,
    transactionType: 'venda' as TransactionType,
    price: '',
    area: '',
    description: '',
    address: '',
    bedrooms: '',
    bathrooms: '',
    parking: '',
    lat: -4.7833,
    lng: -39.6667,
    agentName: VIMOBI_DEFAULT_AGENT.name,
    agentRole: VIMOBI_DEFAULT_AGENT.role,
    agentPhone: VIMOBI_DEFAULT_AGENT.phone,
    agentEmail: VIMOBI_DEFAULT_AGENT.email,
    agentAvatar: LOGO_URL
  });

  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  useEffect(() => {
    const initPageData = async () => {
      try {
        const emps = await getStoredEmployees();
        const activeEmps = emps.filter(e => e.active !== false);
        setEmployeesList(activeEmps);

        if (isEditing) {
          const properties = await getStoredProperties();
          const target = properties.find(p => p.id === Number(editId));
          if (target) {
            const agName = target.agent?.name || VIMOBI_DEFAULT_AGENT.name;
            const agPhone = target.agent?.phone || VIMOBI_DEFAULT_AGENT.phone;
            const agEmail = target.agent?.email || VIMOBI_DEFAULT_AGENT.email;
            const agAvatar = sanitizeAvatarUrl(target.agent?.avatar);
            const agRole = target.agent?.role || VIMOBI_DEFAULT_AGENT.role;

            setFormData({
              title: target.title,
              type: target.type,
              transactionType: target.transactionType || 'venda',
              price: target.price.toString(),
              area: target.area.toString(),
              description: target.description,
              address: target.location,
              bedrooms: target.bedrooms?.toString() || '',
              bathrooms: target.bathrooms?.toString() || '',
              parking: '0',
              lat: target.coordinates.lat,
              lng: target.coordinates.lng,
              agentName: agName,
              agentRole: agRole,
              agentPhone: agPhone,
              agentEmail: agEmail,
              agentAvatar: agAvatar
            });
            setImages(target.images);

            // Determine agent mode
            if (agName.toLowerCase().includes('vimobi')) {
              setAgentMode('vimobi');
            } else {
              const matchedEmp = activeEmps.find(e => e.name.toLowerCase() === agName.toLowerCase());
              if (matchedEmp) {
                setAgentMode('employee');
                setSelectedEmpId(String(matchedEmp.id));
              } else {
                setAgentMode('custom');
              }
            }
          }
        }
      } catch (err) {
        console.error("Erro ao carregar dados para anúncio:", err);
      }
    };
    initPageData();
  }, [isEditing, editId]);

  const generateWithAI = async () => {
    if (!formData.title) {
      alert("Por favor, preencha o título antes de gerar a descrição.");
      return;
    }
    setIsGeneratingAI(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const prompt = `Crie uma descrição persuasiva e profissional para um anúncio imobiliário de ${formData.transactionType} em Madalena, Ceará.
      Título: ${formData.title}
      Tipo: ${formData.type}
      Área: ${formData.area}m²
      Características: ${formData.bedrooms} quartos, ${formData.bathrooms} banheiros.
      
      A descrição deve focar no potencial de ${formData.transactionType === 'venda' ? 'investimento' : 'locação'} e na localização estratégica em Madalena. Use parágrafos curtos e um tom convidativo.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });

      if (response.text) {
        setFormData(prev => ({ ...prev, description: response.text }));
      }
    } catch (error) {
      console.error("AI Generation Error:", error);
      alert("Erro ao gerar descrição com IA.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const searchAddressOnMap = async () => {
    if (!formData.address || formData.address.length < 3) return;
    setIsSearchingAddress(true);
    try {
      // Madalena, Ceará bounding box aproximado para restringir a busca
      // viewbox=left,top,right,bottom
      const viewbox = "-39.80,-4.70,-39.50,-4.90";
      const query = `${formData.address}, Madalena, Ceará, Brasil`;
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&viewbox=${viewbox}&bounded=1`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setFormData(prev => ({ ...prev, lat: parseFloat(lat), lng: parseFloat(lon) }));
      } else {
        // Fallback: busca sem bounding box restrito se não encontrar nada
        const fallbackUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
        const fallbackResponse = await fetch(fallbackUrl);
        const fallbackData = await fallbackResponse.json();
        
        if (fallbackData && fallbackData.length > 0) {
          const { lat, lon } = fallbackData[0];
          setFormData(prev => ({ ...prev, lat: parseFloat(lat), lng: parseFloat(lon) }));
        } else {
          alert("Não foi possível localizar o endereço exato. Você pode marcar a localização manualmente no mapa clicando no ponto correto.");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao conectar com o serviço de mapas. Tente novamente ou marque manualmente.");
    } finally {
      setIsSearchingAddress(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, lat, lng }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files) as File[];
      const readAsBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      };
      try {
        const base64Images = await Promise.all(fileArray.map(file => readAsBase64(file)));
        setImages(prev => [...prev, ...base64Images].slice(0, 12));
      } catch (err) {
        alert("Erro ao processar imagens.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.address) return;

    setIsSubmitting(true);

    try {
      const uploadedImages: string[] = [];

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (img.startsWith('data:image/')) {
          try {
            const parts = img.split(';base64,');
            const contentType = parts[0].split(':')[1];
            const raw = window.atob(parts[1]);
            const rawLength = raw.length;
            const uInt8Array = new Uint8Array(rawLength);
            for (let j = 0; j < rawLength; ++j) {
              uInt8Array[j] = raw.charCodeAt(j);
            }
            const blob = new Blob([uInt8Array], { type: contentType });
            
            const fileExt = contentType.split('/')[1] || 'jpg';
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { data, error } = await supabase.storage
              .from('property-images')
              .upload(filePath, blob, {
                contentType: contentType,
                cacheControl: '3600',
                upsert: false
              });

            if (error) {
              console.error('Erro no upload de imagem:', error);
              // Fallback se falhar
              uploadedImages.push(img);
            } else {
              const { data: { publicUrl } } = supabase.storage
                .from('property-images')
                .getPublicUrl(filePath);
              uploadedImages.push(publicUrl);
            }
          } catch (uploadErr) {
            console.error('Falha ao processar imagem:', uploadErr);
            uploadedImages.push(img);
          }
        } else {
          uploadedImages.push(img);
        }
      }

      // Buscar propriedade original se for edição
      let originalProperty = null;
      if (isEditing) {
        const list = await getStoredProperties();
        originalProperty = list.find(p => p.id === Number(editId));
      }

      const newProperty: Property = {
        id: isEditing ? Number(editId) : Date.now(),
        title: formData.title,
        description: formData.description || 'Sem descrição.',
        price: Number(formData.price),
        area: Number(formData.area) || 0,
        type: formData.type,
        transactionType: formData.transactionType,
        location: formData.address,
        coordinates: { lat: formData.lat, lng: formData.lng },
        images: uploadedImages.length > 0 ? uploadedImages : ["https://picsum.photos/seed/default/800/600"],
        isVerified: true,
        isFeatured: originalProperty ? originalProperty.isFeatured : false,
        bedrooms: Number(formData.bedrooms) || undefined,
        bathrooms: Number(formData.bathrooms) || undefined,
        agent: {
          name: formData.agentName.trim() || VIMOBI_DEFAULT_AGENT.name,
          role: formData.agentRole.trim() || VIMOBI_DEFAULT_AGENT.role,
          phone: formData.agentPhone.trim() || VIMOBI_DEFAULT_AGENT.phone,
          email: formData.agentEmail.trim() || VIMOBI_DEFAULT_AGENT.email,
          avatar: formData.agentAvatar || LOGO_URL
        },
        createdAt: originalProperty ? originalProperty.createdAt : new Date().toISOString(),
        views: originalProperty ? originalProperty.views : 0,
        status: originalProperty ? originalProperty.status : 'active'
      };

      await saveProperty(newProperty);
      setIsSuccess(true);
    } catch (err) {
      console.error("Erro ao salvar imóvel:", err);
      alert("Ocorreu um erro ao salvar o anúncio no Supabase.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white p-12 rounded-[48px] shadow-2xl max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Anúncio Publicado!</h2>
          <p className="text-slate-500 mb-8">Seu imóvel já está visível na plataforma Idelcilio Vieira.</p>
          <button onClick={() => navigate('/admin')} className="bg-primary-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest w-full shadow-xl shadow-primary-900/20 active:scale-95 transition-transform">Voltar ao Painel</button>
        </div>
      </div>
    );
  }

  const showTechnicalDetails = formData.type === 'Casa' || formData.type === 'Apartamento' || formData.type === 'Sítio';

  return (
    <div className="bg-[#fcfcfd] min-h-screen pb-24 pt-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header Compacto */}
        <div className="flex items-center gap-6 mb-12">
          <button onClick={() => navigate(-1)} className="p-4 bg-white border border-slate-100 text-slate-400 rounded-2xl shadow-sm hover:text-primary-600 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 bg-gold-500 rounded-full"></span>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Registro de Ativo</p>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{isEditing ? 'Ajustar Detalhes' : 'Cadastrar Imóvel'}</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. Tipo de Negócio */}
          <section className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100/60">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                <HandCoins size={18} className="text-gold-500" /> Tipo de Negócio
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(p => ({...p, transactionType: 'venda'}))}
                  className={`py-6 rounded-3xl border-2 transition-all font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 ${
                    formData.transactionType === 'venda' ? 'bg-primary-600 border-primary-600 text-white shadow-xl' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-white'
                  }`}
                >
                  <DollarSign size={20} /> Imóvel para Venda
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(p => ({...p, transactionType: 'aluguel'}))}
                  className={`py-6 rounded-3xl border-2 transition-all font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 ${
                    formData.transactionType === 'aluguel' ? 'bg-primary-600 border-primary-600 text-white shadow-xl' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-white'
                  }`}
                >
                  <Key size={20} /> Imóvel para Aluguel
                </button>
              </div>
          </section>

          {/* 2. Identificação */}
          <section className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100/60">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                <Tag size={18} className="text-gold-500" /> Identificação do Imóvel
              </h2>
              
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Título do Anúncio</label>
                  <input 
                    required 
                    name="title" 
                    value={formData.title} 
                    onChange={handleInputChange} 
                    className="w-full h-14 bg-slate-50/50 border-2 border-slate-50 rounded-2xl px-6 py-3.5 font-bold text-slate-700 outline-none focus:border-gold-500 focus:bg-white transition-all" 
                    placeholder="Ex: Terreno Comercial na BR-020" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Categoria Física</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {(['Casa', 'Apartamento', 'Terreno', 'Sítio', 'Comercial'] as PropertyType[]).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setFormData(p => ({...p, type: t}))}
                          className={`py-4 rounded-2xl border-2 transition-all font-black text-[9px] uppercase tracking-widest flex flex-col items-center justify-center gap-2 ${
                            formData.type === t ? 'bg-primary-600 border-primary-600 text-white shadow-lg' : 'bg-white border-slate-50 text-slate-400 hover:border-gold-200'
                          }`}
                        >
                          {t === 'Casa' && <Home size={16} />}
                          {t === 'Apartamento' && <Building size={16} />}
                          {t === 'Terreno' && <Layers size={16} />}
                          {t === 'Sítio' && <TreePine size={16} />}
                          {t === 'Comercial' && <Warehouse size={16} />}
                          {t}
                        </button>
                    ))}
                  </div>
                </div>
              </div>
          </section>

          {/* 3. Valores e Características */}
          <section className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100/60">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
              <Ruler size={18} className="text-gold-500" /> Especificações Técnicas
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="relative">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                  {formData.transactionType === 'venda' ? 'Valor de Venda (R$)' : 'Valor do Aluguel Mensal (R$)'}
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input required name="price" type="number" value={formData.price} onChange={handleInputChange} className="w-full h-14 bg-slate-50/50 border-2 border-slate-50 rounded-2xl pl-14 pr-6 py-3.5 font-black text-lg text-primary-600 outline-none focus:border-gold-500 focus:bg-white transition-all" placeholder="0,00" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Área Total (m²)</label>
                <div className="relative">
                  <Maximize className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input name="area" type="number" value={formData.area} onChange={handleInputChange} className="w-full h-14 bg-slate-50/50 border-2 border-slate-50 rounded-2xl pl-14 pr-6 py-3.5 font-black text-lg outline-none focus:border-gold-500 focus:bg-white transition-all" placeholder="0" />
                </div>
              </div>
            </div>

            {showTechnicalDetails && (
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-50">
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Quartos</label>
                  <div className="relative">
                    <Bed className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input name="bedrooms" type="number" value={formData.bedrooms} onChange={handleInputChange} className="w-full bg-slate-50/50 border-2 border-slate-50 rounded-xl pl-12 pr-4 py-3 font-bold outline-none focus:border-gold-500 transition-all" placeholder="0" />
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Suítes/Banh.</label>
                  <div className="relative">
                    <Bath className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input name="bathrooms" type="number" value={formData.bathrooms} onChange={handleInputChange} className="w-full bg-slate-50/50 border-2 border-slate-50 rounded-xl pl-12 pr-4 py-3 font-bold outline-none focus:border-gold-500 transition-all" placeholder="0" />
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Vagas</label>
                  <div className="relative">
                    <Car className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input name="parking" type="number" value={formData.parking} onChange={handleInputChange} className="w-full bg-slate-50/50 border-2 border-slate-50 rounded-xl pl-12 pr-4 py-3 font-bold outline-none focus:border-gold-500 transition-all" placeholder="0" />
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* 4. Descrição & Fotos */}
          <section className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100/60">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                <FileText size={18} className="text-gold-500" /> Conteúdo e Mídia
              </h2>
              <button 
                type="button" 
                onClick={generateWithAI}
                disabled={isGeneratingAI}
                className="flex items-center gap-2 bg-gold-50 text-gold-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gold-500 hover:text-white transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                {isGeneratingAI ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                {isGeneratingAI ? 'Gerando...' : 'Gerar com IA'}
              </button>
            </div>
            
            <div className="space-y-8">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Descrição Detalhada</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows={5} className="w-full bg-slate-50/50 border-2 border-slate-50 rounded-[32px] px-8 py-6 outline-none focus:border-gold-500 focus:bg-white transition-all resize-none font-medium text-slate-600" placeholder="Descreva os pontos fortes do imóvel..." />
              </div>

              <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Galeria de Fotos</label>
                    <span className="text-[9px] text-slate-300 font-bold uppercase">{images.length}/12 fotos</span>
                  </div>
                  <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((src, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => setPreviewImageIndex(idx)}
                        className="relative aspect-video rounded-2xl overflow-hidden group border border-slate-100 shadow-sm cursor-pointer hover:ring-2 ring-gold-500/50 transition-all"
                        title="Clique para ver em tamanho maior ou dar zoom"
                      >
                        <img src={src} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                          <span className="bg-slate-900/80 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-xl flex items-center gap-1.5 backdrop-blur-xs border border-white/20 shadow">
                            <ZoomIn size={12} className="text-gold-400" /> Ampliar
                          </span>
                        </div>
                        <button 
                          type="button" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setImages(prev => prev.filter((_, i) => i !== idx));
                          }} 
                          title="Remover foto"
                          className="absolute top-2 right-2 bg-white/90 text-red-500 p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white z-10"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {images.length < 12 && (
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-video rounded-2xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300 hover:border-gold-300 hover:text-gold-500 transition-all bg-slate-50/30 group">
                        <Camera size={24} className="group-hover:scale-110 transition-transform mb-2" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Adicionar</span>
                      </button>
                    )}
                  </div>
              </div>
            </div>
          </section>

          {/* 5. Localização */}
          <section className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100/60 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                <MapPin size={18} className="text-gold-500" /> Localização Exata
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Endereço / Referência em Madalena</label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      name="address" 
                      list="neighborhoods"
                      value={formData.address} 
                      onChange={handleInputChange} 
                      className="w-full bg-slate-50/50 border-2 border-slate-50 rounded-2xl pl-14 pr-6 py-4 font-bold text-slate-700 outline-none focus:border-gold-500 focus:bg-white transition-all" 
                      placeholder="Rua, Bairro ou Ponto Próximo..." 
                    />
                    <datalist id="neighborhoods">
                      {MADALENA_NEIGHBORHOODS.map(n => <option key={n} value={n} />)}
                    </datalist>
                  </div>
                  <button type="button" onClick={searchAddressOnMap} disabled={isSearchingAddress} className="bg-primary-600 text-white px-8 rounded-2xl hover:bg-gold-500 transition-all flex items-center justify-center min-w-[120px] font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary-900/10">
                    {isSearchingAddress ? <Loader2 size={20} className="animate-spin" /> : 'Localizar'}
                  </button>
                </div>
              </div>

              <div className="relative h-96 rounded-[32px] overflow-hidden shadow-inner border border-slate-100">
                <GoogleMap 
                  interactive={true} 
                  className="h-full"
                  onLocationSelect={handleLocationSelect} 
                  center={{ lat: formData.lat, lng: formData.lng }} 
                />
              </div>
            </div>
          </section>

          {/* 6. Responsável pelo Atendimento & Agente Imobiliário */}
          <section className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-8">
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                  <UserCheck size={18} className="text-gold-500" /> Agente Imobiliário & Responsável pelo Anúncio
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Selecione quem atenderá os interessados ou mantenha a empresa Vimobi como responsável oficial.
                </p>
              </div>
              <span className="text-[9px] text-gold-600 bg-gold-50 font-bold uppercase px-3 py-1.5 rounded-full border border-gold-200/50 w-fit">
                Vimobi ou Agente
              </span>
            </div>

            {/* Mode Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {/* Option 1: Vimobi Central */}
              <div 
                onClick={() => {
                  setAgentMode('vimobi');
                  setSelectedEmpId('');
                  setFormData(prev => ({
                    ...prev,
                    agentName: VIMOBI_DEFAULT_AGENT.name,
                    agentRole: VIMOBI_DEFAULT_AGENT.role,
                    agentPhone: VIMOBI_DEFAULT_AGENT.phone,
                    agentEmail: VIMOBI_DEFAULT_AGENT.email,
                    agentAvatar: LOGO_URL
                  }));
                }}
                className={`p-5 rounded-3xl border-2 cursor-pointer transition-all duration-300 flex items-start gap-4 ${
                  agentMode === 'vimobi'
                    ? 'border-gold-500 bg-gold-50/30 ring-4 ring-gold-500/20 shadow-md'
                    : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  agentMode === 'vimobi' ? 'bg-primary-600 text-gold-400' : 'bg-slate-200 text-slate-600'
                }`}>
                  <Building size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Vimobi (Padrão)</h4>
                    {agentMode === 'vimobi' && <CheckCircle2 size={14} className="text-gold-500" />}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium leading-relaxed">
                    Atendimento central da empresa. Usa a <strong>logo oficial</strong> como foto.
                  </p>
                </div>
              </div>

              {/* Option 2: Employee from Team */}
              <div 
                onClick={() => {
                  setAgentMode('employee');
                  if (employeesList.length > 0) {
                    const firstEmp = employeesList[0];
                    setSelectedEmpId(String(firstEmp.id));
                    setFormData(prev => ({
                      ...prev,
                      agentName: firstEmp.name,
                      agentRole: firstEmp.role,
                      agentPhone: firstEmp.phone,
                      agentEmail: firstEmp.email || '',
                      agentAvatar: firstEmp.avatar || LOGO_URL
                    }));
                  }
                }}
                className={`p-5 rounded-3xl border-2 cursor-pointer transition-all duration-300 flex items-start gap-4 ${
                  agentMode === 'employee'
                    ? 'border-gold-500 bg-gold-50/30 ring-4 ring-gold-500/20 shadow-md'
                    : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  agentMode === 'employee' ? 'bg-primary-600 text-gold-400' : 'bg-slate-200 text-slate-600'
                }`}>
                  <Users size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Membro da Equipe</h4>
                    {agentMode === 'employee' && <CheckCircle2 size={14} className="text-gold-500" />}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium leading-relaxed">
                    Selecione um corretor, engenheiro ou arquiteto cadastrado.
                  </p>
                </div>
              </div>

              {/* Option 3: Custom / External Partner */}
              <div 
                onClick={() => {
                  setAgentMode('custom');
                  setSelectedEmpId('');
                }}
                className={`p-5 rounded-3xl border-2 cursor-pointer transition-all duration-300 flex items-start gap-4 ${
                  agentMode === 'custom'
                    ? 'border-gold-500 bg-gold-50/30 ring-4 ring-gold-500/20 shadow-md'
                    : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  agentMode === 'custom' ? 'bg-primary-600 text-gold-400' : 'bg-slate-200 text-slate-600'
                }`}>
                  <UserCheck size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Outro Parceiro</h4>
                    {agentMode === 'custom' && <CheckCircle2 size={14} className="text-gold-500" />}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium leading-relaxed">
                    Cadastre dados e foto de um terceiro (logo como foto opcional).
                  </p>
                </div>
              </div>
            </div>

            {/* Dropdown for Team Members */}
            {agentMode === 'employee' && (
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-8 space-y-3 animate-in fade-in">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Selecione o Colaborador Responsável:
                </label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => {
                    const empId = e.target.value;
                    setSelectedEmpId(empId);
                    const emp = employeesList.find(x => String(x.id) === String(empId));
                    if (emp) {
                      setFormData(prev => ({
                        ...prev,
                        agentName: emp.name,
                        agentRole: emp.role,
                        agentPhone: emp.phone,
                        agentEmail: emp.email || '',
                        agentAvatar: emp.avatar || LOGO_URL
                      }));
                    }
                  }}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-800 outline-none focus:border-gold-500 transition-all text-sm"
                >
                  {employeesList.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} — {emp.role} ({emp.area})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Detail / Custom Fields */}
            <div className="space-y-6">
              {/* Agent Representative Preview & Optional Photo Upload */}
              <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-50/60 p-6 rounded-3xl border border-slate-100">
                <div className="relative group">
                  <img
                    src={sanitizeAvatarUrl(formData.agentAvatar)}
                    alt={formData.agentName}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md bg-white"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/logo.jpg';
                    }}
                  />
                  {agentMode === 'custom' && (
                    <button
                      type="button"
                      onClick={() => agentAvatarInputRef.current?.click()}
                      className="absolute inset-0 bg-black/50 text-white rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[8px] font-black uppercase transition-opacity"
                    >
                      <Camera size={16} className="mb-1" />
                      Alterar
                    </button>
                  )}
                </div>

                <input
                  type="file"
                  accept="image/*"
                  ref={agentAvatarInputRef}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === 'string') {
                          setFormData(prev => ({ ...prev, agentAvatar: reader.result as string }));
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />

                <div className="flex-1 text-center sm:text-left space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="text-sm font-black text-slate-900">{formData.agentName}</span>
                    <span className="text-[9px] bg-gold-50 text-gold-600 px-2 py-0.5 rounded-full font-bold uppercase border border-gold-200/50">
                      {formData.agentRole || 'Representante'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Foto atual: {formData.agentAvatar === LOGO_URL ? 'Logo Oficial Vimobi (Padrão)' : 'Foto personalizada do representante'}
                  </p>
                  {agentMode === 'custom' && (
                    <div className="flex flex-wrap gap-2 pt-1 justify-center sm:justify-start">
                      <button
                        type="button"
                        onClick={() => agentAvatarInputRef.current?.click()}
                        className="px-3 py-1.5 bg-primary-600 text-white rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-primary-700 transition-all shadow-xs"
                      >
                        Enviar Foto
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, agentAvatar: LOGO_URL }))}
                        className="px-3 py-1.5 bg-white text-slate-600 border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-slate-100 transition-all"
                      >
                        Usar Logo Vimobi
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Input Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                    Nome do Agente / Responsável
                  </label>
                  <div className="relative">
                    <UserCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input
                      name="agentName"
                      type="text"
                      disabled={agentMode === 'vimobi'}
                      value={formData.agentName}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50/50 border-2 border-slate-50 rounded-2xl pl-14 pr-6 py-4 font-bold text-slate-800 outline-none focus:border-gold-500 focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      placeholder="Ex: Vimobi ou Nome do Agente"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                    Celular / WhatsApp (com DDD) *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input
                      name="agentPhone"
                      type="text"
                      disabled={agentMode === 'vimobi'}
                      value={formData.agentPhone}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50/50 border-2 border-slate-50 rounded-2xl pl-14 pr-6 py-4 font-bold text-slate-800 outline-none focus:border-gold-500 focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      placeholder="(88) 99269-4661"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                    E-mail para Propostas
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input
                      name="agentEmail"
                      type="email"
                      disabled={agentMode === 'vimobi'}
                      value={formData.agentEmail}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50/50 border-2 border-slate-50 rounded-2xl pl-14 pr-6 py-4 font-bold text-slate-800 outline-none focus:border-gold-500 focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      placeholder="contato@vimobi.com.br"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Finalização */}
          <section className="bg-primary-600 p-12 rounded-[48px] text-white shadow-2xl overflow-hidden relative">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
              <div className="flex-1">
                <h3 className="text-3xl font-black mb-4 tracking-tight">Pronto para publicar?</h3>
                <p className="text-primary-100/70 text-sm leading-relaxed max-w-md">
                  Confira todos os dados antes de salvar. Seu imóvel passará por uma revisão técnica e ficará disponível para a maior base de investidores de Madalena.
                </p>
              </div>

              <div className="w-full md:w-auto flex flex-col gap-4 min-w-[280px]">
                <button 
                  disabled={isSubmitting} 
                  type="submit" 
                  className="w-full py-6 bg-white text-primary-600 rounded-3xl font-black uppercase text-xs tracking-[0.2em] hover:bg-gold-500 hover:text-white transition-all shadow-2xl active:scale-[0.98] flex items-center justify-center gap-4 group"
                >
                  {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : (
                    <>
                      {isEditing ? 'Salvar Alterações' : 'Publicar Agora'}
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>
        </form>
      </div>
      {/* Lightbox / Zoom Modal for Preview */}
      <ImageLightboxModal
        isOpen={previewImageIndex !== null}
        onClose={() => setPreviewImageIndex(null)}
        images={images}
        initialIndex={previewImageIndex || 0}
        title={formData.title || "Fotos do Anúncio"}
        onIndexChange={(idx) => setPreviewImageIndex(idx)}
      />
    </div>
  );
};

export default CreateListingPage;
