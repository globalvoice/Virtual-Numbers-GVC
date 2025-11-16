export interface Country {
  id: string;
  iso: string;
  name: string;
  needs_registration: boolean;
  mobile_needs_registration?: boolean; // Override for mobile registration
  local_national_price?: number;
  mobile_price?: number;
}

export interface RequirementField {
  name: string;
  description: string;
  type: string;
}

export interface RequirementSection {
  description: string;
  fields: RequirementField[];
}

export interface RequirementDetails {
  description: string;
  address_requirements: {
    individual: RequirementSection | null;
    business: RequirementSection | null;
  };
  identity_requirements: {
    individual: RequirementSection | null;
    business: RequirementSection | null;
  };
}

export enum Tab {
  Required = 'Required',
  NotRequired = 'Not Required',
}