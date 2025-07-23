export interface RPOCompany {
  id: number;
  identifiers: Identifier[];
  fullNames: NameEntry[];
  addresses: AddressEntry[];
  establishment: string;
  termination?: string;
}

interface Identifier {
  type: string;
  value: string;
}

interface NameEntry {
  value: string;
  type?: string;
  validFrom?: string;
  validTo?: string;
}

interface AddressEntry {
  municipality: {
    value: string;
  };
}
