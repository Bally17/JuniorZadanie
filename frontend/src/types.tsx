export interface Company {
  id: number;
  rpoId: number;
  ico: string;
  name: string;
  municipality: string;
  establishment: string;
  termination: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Ad {
  id: number;
  adText: string;
  logoPath?: string;
  createdAt: string;
  isTop: boolean;
  company: Company;
}
