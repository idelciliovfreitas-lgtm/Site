
export type PropertyType = 'Casa' | 'Apartamento' | 'Terreno' | 'Sítio' | 'Comercial';
export type TransactionType = 'venda' | 'aluguel';
export type SortOption = 'popularity' | 'price-asc' | 'price-desc' | 'newest';

export interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  area: number;
  type: PropertyType;
  transactionType: TransactionType;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  images: string[];
  isVerified: boolean;
  isFeatured: boolean;
  bedrooms?: number;
  bathrooms?: number;
  agent: {
    name: string;
    phone: string;
    email: string;
    avatar?: string;
    role?: string;
  };
  createdAt: string;
  views: number;
  status: 'active' | 'pending' | 'sold' | 'rented';
}

export interface FilterState {
  type: PropertyType | 'Todos';
  transactionType: TransactionType | 'Todos';
  minPrice: number;
  maxPrice: number;
  search: string;
  sortBy: SortOption;
}

export interface EngineeringService {
  id: string | number;
  title: string;
  description: string;
  tag: string;
  responsibleName?: string;
  phone: string; // Celular/WhatsApp de contato específico
  email?: string;
  message?: string;
  iconName?: string;
  active?: boolean;
}

export interface Employee {
  id: string | number;
  name: string;
  role: string; // Ex: Corretor de Imóveis, Engenheiro Civil, Arquiteto & Urbanista, Cadista / Projetista, Topógrafo
  area: string; // Ex: Vendas & Locação, Projetos & Arquitetura, Engenharia & Obras, Topografia, Administrativo
  creciOrCrea?: string; // Registro profissional
  phone: string; // Celular / WhatsApp
  email?: string;
  avatar?: string; // Foto (opcional, fallback logo Vimobi)
  active?: boolean;
  createdAt?: string;
}

export type ProjectCategory = 'Residencial' | 'Comercial' | 'Topografia' | 'Obras & Estrutura' | 'Laudos & Perícias' | 'Interiores & Reforma';

export interface PortfolioProject {
  id: string | number;
  title: string;
  category: ProjectCategory;
  location: string;
  description: string;
  image: string; // Imagem de capa
  gallery?: string[]; // Imagens adicionais / renders / canteiro
  year: string;
  area?: string; // Ex: 250 m², 12 hectares, etc.
  status?: 'Concluído' | 'Em Andamento' | 'Projeto Aprovado' | 'Em Execução';
  features: string[]; // Disciplinas e diferenciais (ex: Topografia, Estrutural, 3D)
  instagramUrl?: string; // Link direto do post do Instagram (@idelciliovieira)
  beforeImage?: string; // Foto do Antes (reformas/obras)
  afterImage?: string; // Foto do Depois (reformas/obras)
  responsibleName?: string; // Ex: Idelcilio Vieira - CREA 356611CE
  isFeatured?: boolean; // Destaque na Home
  active?: boolean; // Visível no site
  createdAt?: string;
}
