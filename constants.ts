import { Property, PropertyType, TransactionType, EngineeringService, Employee, PortfolioProject, ProjectCategory } from './types';
import { LOGO_DATA, LOGO_FOOTER } from './assets/logo';
import { supabase } from './supabase';

// Logotipo principal
export const LOGO_URL = LOGO_DATA;
export const LOGO_FOOTER_URL = LOGO_FOOTER;
export const LOGO_FALLBACK = "/logo.jpg";

// Dados Oficiais do Profissional
export const AGENT_INFO = {
  name: "Idelcilio Vieira",
  crea: "356611CE",
  phone: "(88) 99269-4661",
  whatsapp: "5588992694661",
  email: "idelciliovfreitas@gmail.com",
  instagram: "@idelciliovieira",
  address: "R Maria Eurivete Pinho da Silva, 110, Nova Madalena - Madalena/CE",
  avatar: "/logo.jpg"
};

// Bairros e Localidades conhecidas de Madalena/CE para auxílio na busca
export const MADALENA_NEIGHBORHOODS = [
  "Centro",
  "Nova Madalena",
  "Parque de Exposição",
  "Jardim",
  "Vila São José",
  "Paus Brancos",
  "Cajazeiras",
  "BR-020",
  "Lagoa do Meio",
  "São José",
  "Santa Clara"
];

const INITIAL_PROPERTIES: Property[] = [
  {
    id: 1,
    title: "Terreno comercial na BR-020",
    description: "Excelente terreno comercial às margens da BR-020, ideal para posto de gasolina, restaurante ou estabelecimento comercial. Área plana e documentada.",
    price: 180000,
    area: 500,
    type: "Terreno",
    transactionType: "venda",
    location: "BR-020, Madalena - CE",
    coordinates: { lat: -4.7812, lng: -39.6645 },
    images: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80"],
    isVerified: true,
    isFeatured: true,
    agent: AGENT_INFO,
    createdAt: "2023-10-15",
    views: 189,
    status: 'active'
  },
  {
    id: 2,
    title: "Casa no Centro com 3 Quartos",
    description: "Casa ampla reformada, próximo à igreja matriz. Possui garagem para 2 carros, quintal espessoso e área de serviço coberta.",
    price: 250000,
    area: 120,
    type: "Casa",
    transactionType: "venda",
    location: "Centro, Madalena - CE",
    coordinates: { lat: -4.7830, lng: -39.6660 },
    images: ["https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"],
    isVerified: true,
    isFeatured: false,
    bedrooms: 3,
    bathrooms: 2,
    agent: AGENT_INFO,
    createdAt: "2023-10-20",
    views: 450,
    status: 'active'
  },
  {
    id: 4,
    title: "Apartamento para Aluguel - Edifício Central",
    description: "Excelente apartamento mobiliado no centro de Madalena. Ideal para profissionais ou pequenas famílias.",
    price: 1200,
    area: 65,
    type: "Apartamento",
    transactionType: "aluguel",
    location: "Av. Principal, Madalena - CE",
    coordinates: { lat: -4.7840, lng: -39.6670 },
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"],
    isVerified: true,
    isFeatured: true,
    bedrooms: 2,
    bathrooms: 1,
    agent: AGENT_INFO,
    createdAt: "2024-01-10",
    views: 230,
    status: 'active'
  }
];

// Helper para garantir URL segura para avatar do agente / logotipo
export const sanitizeAvatarUrl = (url?: string): string => {
  if (!url || typeof url !== 'string') return '/logo.jpg';
  const clean = url.trim();
  if (
    clean === '' || 
    clean.includes('postimg.cc') || 
    clean.includes('RhQSsxHQ') || 
    clean.includes('postimage')
  ) {
    return '/logo.jpg';
  }
  return clean;
};

// Mapeamento de dados Banco -> Objeto do Frontend
export const mapDbToProperty = (p: any): Property => ({
  id: Number(p.id),
  title: p.title,
  description: p.description || '',
  price: Number(p.price),
  area: Number(p.area),
  type: p.type as PropertyType,
  transactionType: p.transaction_type as TransactionType,
  location: p.location,
  coordinates: { lat: Number(p.lat), lng: Number(p.lng) },
  images: p.images || [],
  isVerified: p.is_verified,
  isFeatured: p.is_featured,
  bedrooms: p.bedrooms !== null ? Number(p.bedrooms) : undefined,
  bathrooms: p.bathrooms !== null ? Number(p.bathrooms) : undefined,
  agent: p.agent ? {
    ...p.agent,
    avatar: sanitizeAvatarUrl(p.agent.avatar)
  } : AGENT_INFO,
  createdAt: p.created_at,
  views: Number(p.views || 0),
  status: p.status as 'active' | 'pending' | 'sold' | 'rented'
});

// Mapeamento de dados Objeto do Frontend -> Banco
export const mapPropertyToDb = (p: Property) => ({
  title: p.title,
  description: p.description,
  price: p.price,
  area: p.area,
  type: p.type,
  transaction_type: p.transactionType,
  location: p.location,
  lat: p.coordinates.lat,
  lng: p.coordinates.lng,
  images: p.images,
  is_verified: p.isVerified,
  is_featured: p.isFeatured,
  bedrooms: p.bedrooms !== undefined ? p.bedrooms : null,
  bathrooms: p.bathrooms !== undefined ? p.bathrooms : null,
  agent: p.agent,
  views: p.views || 0,
  status: p.status
});

// Buscar imóveis no Supabase
export const getStoredProperties = async (): Promise<Property[]> => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.warn('Erro ao conectar ao Supabase, usando dados mockados:', error);
      return getLocalProperties();
    }

    // Se estiver vazio, vamos popular o banco inicialmente
    if (!data || data.length === 0) {
      console.log('Banco de dados vazio. Semeando dados iniciais...');
      const initialDbRows = INITIAL_PROPERTIES.map(p => mapPropertyToDb(p));

      const { data: seeded, error: seedError } = await supabase
        .from('properties')
        .insert(initialDbRows)
        .select('*');

      if (!seedError && seeded) {
        return seeded.map(mapDbToProperty);
      } else {
        console.error('Erro ao semear dados no Supabase:', seedError);
      }
    }

    return (data || []).map(mapDbToProperty);
  } catch (err) {
    console.error('Exceção ao buscar propriedades do Supabase:', err);
    return getLocalProperties();
  }
};

// Fallback local se o Supabase falhar
const getLocalProperties = (): Property[] => {
  const stored = localStorage.getItem('madalena_properties');
  if (!stored) {
    localStorage.setItem('madalena_properties', JSON.stringify(INITIAL_PROPERTIES));
    return INITIAL_PROPERTIES;
  }
  const parsed = JSON.parse(stored);
  return parsed.map((p: any) => ({
    ...p,
    transactionType: p.transactionType || 'venda',
    agent: p.agent ? {
      ...p.agent,
      avatar: sanitizeAvatarUrl(p.agent.avatar)
    } : AGENT_INFO
  }));
};

// Salvar/Editar imóvel no Supabase
export const saveProperty = async (property: Property): Promise<void> => {
  const dbRow = mapPropertyToDb(property);

  try {
    // Se for um ID grande de data (Date.now()), significa que é um novo cadastro.
    // Tentamos salvar omitindo o id para que o banco autogere um ID sequencial limpo (1, 2, 3...)
    if (property.id && property.id > 1000000000) {
      const { id, ...insertRow } = dbRow as any;
      const { error } = await supabase
        .from('properties')
        .insert(insertRow);

      if (error) throw error;
    } else {
      // É uma edição ou ID pré-definido. Verificamos se existe
      const { data: existing } = await supabase
        .from('properties')
        .select('id')
        .eq('id', property.id)
        .maybeSingle();

      if (existing) {
        // Atualizar
        const { error } = await supabase
          .from('properties')
          .update(dbRow)
          .eq('id', property.id);

        if (error) throw error;
      } else {
        // Inserir com o ID fornecido
        const { error } = await supabase
          .from('properties')
          .insert({ id: property.id, ...dbRow });

        if (error) throw error;
      }
    }

    // Salvar também no localStorage como espelho rápido
    const localProps = getLocalProperties();
    const idx = localProps.findIndex(p => p.id === property.id);
    if (idx >= 0) localProps[idx] = property;
    else localProps.push(property);
    localStorage.setItem('madalena_properties', JSON.stringify(localProps));

    window.dispatchEvent(new Event('properties-updated'));
  } catch (err) {
    console.error('Erro ao salvar imóvel no Supabase:', err);
    // Fallback local
    const localProps = getLocalProperties();
    const idx = localProps.findIndex(p => p.id === property.id);
    if (idx >= 0) localProps[idx] = property;
    else localProps.push(property);
    localStorage.setItem('madalena_properties', JSON.stringify(localProps));
    window.dispatchEvent(new Event('properties-updated'));
  }
};

// Deletar imóvel no Supabase
export const deleteStoredProperty = async (id: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Remover também do local
    const localProps = getLocalProperties();
    const filtered = localProps.filter(p => p.id !== id);
    localStorage.setItem('madalena_properties', JSON.stringify(filtered));

    window.dispatchEvent(new Event('properties-updated'));
  } catch (err) {
    console.error('Erro ao deletar imóvel do Supabase:', err);
    const localProps = getLocalProperties();
    const filtered = localProps.filter(p => p.id !== id);
    localStorage.setItem('madalena_properties', JSON.stringify(filtered));
    window.dispatchEvent(new Event('properties-updated'));
  }
};

export const PROPERTY_TYPES = ['Todos', 'Casa', 'Apartamento', 'Terreno', 'Sítio', 'Comercial'];

// Helper para formatar celular para link do WhatsApp (ex: 5588992694661)
export const formatWhatsAppNumber = (phoneStr?: string): string => {
  if (!phoneStr) return "5588992694661";
  const digits = phoneStr.replace(/\D/g, '');
  if (digits.startsWith('55') && digits.length >= 12) return digits;
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return digits || "5588992694661";
};

// Serviços padrão de Engenharia e Consultoria
export const INITIAL_SERVICES: EngineeringService[] = [
  {
    id: 1,
    title: "Projetos Residenciais",
    description: "Cálculo estrutural, arquitetônico e instalações para casas de alto padrão e populares em Madalena.",
    tag: "Arquitetura & Estrutura",
    responsibleName: "Idelcilio Vieira",
    phone: "(88) 99269-4661",
    message: "Prezado(a), gostaria de solicitar um orçamento para um projeto residencial.",
    iconName: "DraftingCompass",
    active: true
  },
  {
    id: 2,
    title: "Projetos Comerciais",
    description: "Planejamento de lojas, galpões e centros comerciais com foco em viabilidade e fluxo logístico.",
    tag: "Negócios & Indústria",
    responsibleName: "Idelcilio Vieira",
    phone: "(88) 99269-4661",
    message: "Prezado(a), solicito viabilidade para um projeto comercial.",
    iconName: "Building2",
    active: true
  },
  {
    id: 3,
    title: "Execução de Obras",
    description: "Gestão completa de canteiro, execução com rigor técnico e garantia de cumprimento de cronograma.",
    tag: "Execução Técnica",
    responsibleName: "Idelcilio Vieira",
    phone: "(88) 99269-4661",
    message: "Prezado(a), gostaria de contratar a execução de minha obra.",
    iconName: "HardHat",
    active: true
  },
  {
    id: 4,
    title: "Topografia",
    description: "Levantamentos de precisão, demarcação de lotes e georreferenciamento em toda a região.",
    tag: "Precisão",
    responsibleName: "Idelcilio Vieira",
    phone: "(88) 99269-4661",
    message: "Prezado(a), solicito um serviço de topografia.",
    iconName: "Ruler",
    active: true
  },
  {
    id: 5,
    title: "Laudos e Perícias",
    description: "Inspeção predial e avaliações judiciais para garantir a estabilidade e segurança jurídica do patrimônio.",
    tag: "Segurança Jurídica",
    responsibleName: "Idelcilio Vieira",
    phone: "(88) 99269-4661",
    message: "Prezado(a), necessito de um laudo técnico de inspeção.",
    iconName: "FileCheck",
    active: true
  },
  {
    id: 6,
    title: "Regularização de Imóveis",
    description: "Averbações, retificação de área e processos de Habite-se junto aos órgãos competentes.",
    tag: "Documentação",
    responsibleName: "Idelcilio Vieira",
    phone: "(88) 99269-4661",
    message: "Prezado(a), gostaria de regularizar a documentação de meu imóvel.",
    iconName: "ClipboardList",
    active: true
  }
];

// Buscar Serviços (localStorage com sincronização de eventos)
export const getStoredServices = async (): Promise<EngineeringService[]> => {
  try {
    const stored = localStorage.getItem('madalena_services');
    if (!stored) {
      localStorage.setItem('madalena_services', JSON.stringify(INITIAL_SERVICES));
      return INITIAL_SERVICES;
    }
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SERVICES;
  } catch (err) {
    console.error('Erro ao ler serviços:', err);
    return INITIAL_SERVICES;
  }
};

// Salvar / Atualizar Serviço
export const saveService = async (service: EngineeringService): Promise<void> => {
  const current = await getStoredServices();
  const index = current.findIndex(s => String(s.id) === String(service.id));
  
  let updated: EngineeringService[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = service;
  } else {
    updated = [service, ...current];
  }
  
  localStorage.setItem('madalena_services', JSON.stringify(updated));
  window.dispatchEvent(new Event('services-updated'));
};

// Deletar Serviço
export const deleteStoredService = async (id: string | number): Promise<void> => {
  const current = await getStoredServices();
  const updated = current.filter(s => String(s.id) !== String(id));
  localStorage.setItem('madalena_services', JSON.stringify(updated));
  window.dispatchEvent(new Event('services-updated'));
};

// Agente Padrão da Empresa Vimobi
export const VIMOBI_DEFAULT_AGENT = {
  name: "Vimobi - Atendimento Central",
  role: "Central de Vendas e Negócios",
  phone: "(88) 99269-4661",
  email: "contato@vimobi.com.br",
  avatar: LOGO_URL
};

// Áreas de Atuação disponíveis para a equipe
export const EMPLOYEE_AREAS = [
  "Vendas & Negócios Imobiliários",
  "Engenharia Civil & Obras",
  "Arquitetura & Urbanismo",
  "Projetos & Desenho Técnico (Cadista)",
  "Topografia & Georreferenciamento",
  "Laudos & Avaliações Periciais",
  "Administrativo & Jurídico"
];

// Colaboradores iniciais da empresa
export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 1,
    name: "Idelcilio Vieira",
    role: "Engenheiro Civil & Fundador",
    area: "Engenharia Civil & Obras",
    creciOrCrea: "CREA 356611CE",
    phone: "(88) 99269-4661",
    email: "idelciliovfreitas@gmail.com",
    avatar: "/logo.jpg",
    active: true,
    createdAt: "2023-10-01"
  },
  {
    id: 2,
    name: "Consultoria Imobiliária Vimobi",
    role: "Corretor de Imóveis",
    area: "Vendas & Negócios Imobiliários",
    creciOrCrea: "CRECI-CE",
    phone: "(88) 99269-4661",
    email: "vendas@vimobi.com.br",
    avatar: LOGO_URL,
    active: true,
    createdAt: "2023-10-05"
  },
  {
    id: 3,
    name: "Equipe de Arquitetura",
    role: "Arquiteto(a) & Urbanista",
    area: "Arquitetura & Urbanismo",
    creciOrCrea: "CAU-CE",
    phone: "(88) 99269-4661",
    email: "arquitetura@vimobi.com.br",
    avatar: LOGO_URL,
    active: true,
    createdAt: "2023-10-10"
  },
  {
    id: 4,
    name: "Setor de Projetos & Desenho",
    role: "Cadista / Projetista Técnico",
    area: "Projetos & Desenho Técnico (Cadista)",
    phone: "(88) 99269-4661",
    email: "projetos@vimobi.com.br",
    avatar: LOGO_URL,
    active: true,
    createdAt: "2023-10-15"
  }
];

// Buscar Colaboradores (localStorage com sincronização)
export const getStoredEmployees = async (): Promise<Employee[]> => {
  try {
    const stored = localStorage.getItem('madalena_employees');
    if (!stored) {
      localStorage.setItem('madalena_employees', JSON.stringify(INITIAL_EMPLOYEES));
      return INITIAL_EMPLOYEES;
    }
    const parsed = JSON.parse(stored);
    const list = Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_EMPLOYEES;
    return list.map((e: Employee) => ({
      ...e,
      avatar: sanitizeAvatarUrl(e.avatar)
    }));
  } catch (err) {
    console.error('Erro ao ler colaboradores:', err);
    return INITIAL_EMPLOYEES;
  }
};

// Salvar / Atualizar Colaborador
export const saveEmployee = async (employee: Employee): Promise<void> => {
  const current = await getStoredEmployees();
  const index = current.findIndex(e => String(e.id) === String(employee.id));
  
  let updated: Employee[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = employee;
  } else {
    updated = [employee, ...current];
  }
  
  localStorage.setItem('madalena_employees', JSON.stringify(updated));
  window.dispatchEvent(new Event('employees-updated'));
};

// Deletar Colaborador
export const deleteStoredEmployee = async (id: string | number): Promise<void> => {
  const current = await getStoredEmployees();
  const updated = current.filter(e => String(e.id) !== String(id));
  localStorage.setItem('madalena_employees', JSON.stringify(updated));
  window.dispatchEvent(new Event('employees-updated'));
};

// Categorias Oficiais do Portfólio de Engenharia e Arquitetura
export const PORTFOLIO_CATEGORIES: (ProjectCategory | 'Todos')[] = [
  'Todos',
  'Residencial',
  'Comercial',
  'Topografia',
  'Obras & Estrutura',
  'Laudos & Perícias',
  'Interiores & Reforma'
];

// Projetos Iniciais do Portfólio (baseados na trajetória real de Idelcilio Vieira)
export const INITIAL_PORTFOLIO: PortfolioProject[] = [
  {
    id: 1,
    title: "Residência Contemporânea - Bairro Jardim",
    category: "Residencial",
    location: "Bairro Jardim, Madalena - CE",
    description: "Concepção arquitetônica e cálculo estrutural de residência de alto padrão. Fachada contemporânea imponente com brises de ventilação, iluminação zenital e integração harmoniosa com área de lazer com piscina.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80"
    ],
    year: "2024",
    area: "320 m² de área construída",
    status: "Concluído",
    features: ["Cálculo Estrutural", "Projeto Arquitetônico 3D", "Acompanhamento Técnico", "Instalações Hidrossanitárias"],
    instagramUrl: "https://www.instagram.com/idelciliovieira",
    beforeImage: "https://images.unsplash.com/photo-1590247813693-5541d1c609fd?auto=format&fit=crop&w=800&q=80",
    afterImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    responsibleName: "Eng. Idelcilio Vieira (CREA 356611CE)",
    isFeatured: true,
    active: true,
    createdAt: "2024-01-15"
  },
  {
    id: 2,
    title: "Levantamento Topográfico & Loteamento BR-020",
    category: "Topografia",
    location: "Margem da BR-020, Madalena - CE",
    description: "Levantamento planialtimétrico cadastral com estação total de alta precisão e georreferenciamento. Projeto de parcelamento de solo com demarcação exata de 240 lotes e diretrizes viárias.",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80"
    ],
    year: "2023",
    area: "14,5 Hectares demarcados",
    status: "Concluído",
    features: ["Topografia com Estação Total", "Georreferenciamento INCRA", "Curvas de Nível", "Demarcação de Lotes"],
    instagramUrl: "https://www.instagram.com/idelciliovieira",
    responsibleName: "Eng. Idelcilio Vieira (CREA 356611CE)",
    isFeatured: true,
    active: true,
    createdAt: "2023-11-20"
  },
  {
    id: 3,
    title: "Centro Comercial & Galeria Vieira",
    category: "Comercial",
    location: "Avenida Principal, Centro, Madalena - CE",
    description: "Projeto arquitetônico, elétrico de potência e segurança contra incêndio para complexo de lojas e escritórios no centro urbano de Madalena. Otimização de fluxo de pedestres e visibilidade de vitrines.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"
    ],
    year: "2023",
    area: "650 m² construídos",
    status: "Concluído",
    features: ["Estrutura Mista Concreto/Metálica", "Projeto de Prevenção a Incêndio", "Acessibilidade NBR 9050"],
    instagramUrl: "https://www.instagram.com/idelciliovieira",
    responsibleName: "Eng. Idelcilio Vieira (CREA 356611CE)",
    isFeatured: true,
    active: true,
    createdAt: "2023-08-10"
  },
  {
    id: 4,
    title: "Execução Estrutural de Galpão de Distribuição",
    category: "Obras & Estrutura",
    location: "Pólo Logístico BR-020, Madalena - CE",
    description: "Dimensionamento e supervisão integral de fundações profundas e montagem de cobertura metálica de grande vão livre, calculada para suportar ventos intensos e cargas de pontes rolantes.",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80"
    ],
    year: "2024",
    area: "1.200 m² de vão livre",
    status: "Em Execução",
    features: ["Cálculo Metálico", "Fundações Profundas", "Gestão de Obra e Cronograma", "Rigor Normativo ABNT"],
    instagramUrl: "https://www.instagram.com/idelciliovieira",
    responsibleName: "Eng. Idelcilio Vieira (CREA 356611CE)",
    isFeatured: false,
    active: true,
    createdAt: "2024-02-01"
  },
  {
    id: 5,
    title: "Inspeção Predial & Laudo de Patologias Estruturais",
    category: "Laudos & Perícias",
    location: "Madalena - CE",
    description: "Perícia de engenharia para identificação de fissuras e trincas térmicas, infiltrações e corrosão de armaduras em condomínio residencial. Emissão de ART e plano de recuperação estrutural.",
    image: "https://images.unsplash.com/photo-1541888941257-60104aa3de41?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1541888941257-60104aa3de41?auto=format&fit=crop&w=1200&q=80"
    ],
    year: "2024",
    area: "850 m² vistoriados",
    status: "Concluído",
    features: ["Perícia Judicial e Extrajudicial", "Emissão de ART / CREA", "Termografia e Ultrassom", "Plano de Recuperação"],
    instagramUrl: "https://www.instagram.com/idelciliovieira",
    responsibleName: "Eng. Idelcilio Vieira (CREA 356611CE)",
    isFeatured: false,
    active: true,
    createdAt: "2024-03-05"
  },
  {
    id: 6,
    title: "Reforma & Espaço Gourmet Integrado",
    category: "Interiores & Reforma",
    location: "Centro, Madalena - CE",
    description: "Transformação radical de uma área externa subutilizada em um espaço de convivência gourmet com churrasqueira suspensa, pérgola e forro em madeira cumaru.",
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
    ],
    year: "2024",
    area: "95 m² reformados",
    status: "Concluído",
    features: ["Reforma Completa", "Design de Interiores", "Iluminação Cênica", "Antes & Depois"],
    instagramUrl: "https://www.instagram.com/idelciliovieira",
    beforeImage: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    afterImage: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
    responsibleName: "Eng. Idelcilio Vieira (CREA 356611CE)",
    isFeatured: true,
    active: true,
    createdAt: "2024-04-12"
  }
];

// Helper para buscar Projetos (Tenta Supabase; fallback para localStorage)
export const getStoredProjects = async (): Promise<PortfolioProject[]> => {
  try {
    // 1. Tenta buscar no Supabase
    const { data, error } = await supabase
      .from('portfolio_projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      const mapped: PortfolioProject[] = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        category: item.category as ProjectCategory,
        location: item.location || '',
        description: item.description || '',
        image: item.image,
        gallery: Array.isArray(item.gallery) ? item.gallery : (item.image ? [item.image] : []),
        year: item.year || String(new Date().getFullYear()),
        area: item.area || '',
        status: item.status || 'Concluído',
        features: Array.isArray(item.features) ? item.features : [],
        instagramUrl: item.instagram_url || '',
        beforeImage: item.before_image || '',
        afterImage: item.after_image || '',
        responsibleName: item.responsible_name || 'Eng. Idelcilio Vieira (CREA 356611CE)',
        isFeatured: item.is_featured ?? false,
        active: item.active ?? true,
        createdAt: item.created_at || new Date().toISOString()
      }));
      localStorage.setItem('madalena_portfolio', JSON.stringify(mapped));
      return mapped;
    }
  } catch (supabaseErr) {
    // Supabase offline ou tabela inexistente - silencia e usa localStorage
  }

  // 2. Fallback para localStorage
  try {
    const stored = localStorage.getItem('madalena_portfolio');
    if (!stored) {
      localStorage.setItem('madalena_portfolio', JSON.stringify(INITIAL_PORTFOLIO));
      return INITIAL_PORTFOLIO;
    }
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PORTFOLIO;
  } catch (err) {
    console.error('Erro ao ler portfólio:', err);
    return INITIAL_PORTFOLIO;
  }
};

// Salvar / Atualizar Projeto
export const saveProject = async (project: PortfolioProject): Promise<void> => {
  const current = await getStoredProjects();
  const index = current.findIndex(p => String(p.id) === String(project.id));
  
  let updated: PortfolioProject[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = project;
  } else {
    updated = [project, ...current];
  }
  
  localStorage.setItem('madalena_portfolio', JSON.stringify(updated));
  window.dispatchEvent(new Event('portfolio-updated'));

  // Tenta sincronizar com Supabase em background
  try {
    const dbPayload = {
      title: project.title,
      category: project.category,
      location: project.location,
      description: project.description,
      image: project.image,
      gallery: project.gallery || [project.image],
      year: project.year,
      area: project.area || '',
      status: project.status || 'Concluído',
      features: project.features || [],
      instagram_url: project.instagramUrl || '',
      before_image: project.beforeImage || '',
      after_image: project.afterImage || '',
      responsible_name: project.responsibleName || 'Eng. Idelcilio Vieira (CREA 356611CE)',
      is_featured: project.isFeatured ?? false,
      active: project.active ?? true
    };

    if (typeof project.id === 'number' && project.id < 1000000000) {
      // Id existente do banco
      await supabase.from('portfolio_projects').upsert({ id: project.id, ...dbPayload });
    } else {
      // Novo registro
      await supabase.from('portfolio_projects').insert([dbPayload]);
    }
  } catch (err) {
    // Sincronização falhou silenciosamente no Supabase
  }
};

// Deletar Projeto
export const deleteStoredProject = async (id: string | number): Promise<void> => {
  const current = await getStoredProjects();
  const updated = current.filter(p => String(p.id) !== String(id));
  localStorage.setItem('madalena_portfolio', JSON.stringify(updated));
  window.dispatchEvent(new Event('portfolio-updated'));

  // Tenta deletar no Supabase
  try {
    await supabase.from('portfolio_projects').delete().eq('id', id);
  } catch (err) {
    // Silencioso
  }
};
