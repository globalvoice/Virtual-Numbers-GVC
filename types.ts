export interface Country {
  id: string;
  iso: string;
  name: string;
  needs_registration: boolean;
  apiId?: string; // Unique ID for fetching from the live API
  mobile_needs_registration?: boolean; // Override for mobile registration
  local_national_price?: number;
  mobile_price?: number;
}

export type ApiRequirement = {
  requirementType: string;
  htmlContent: string;
};

export type ApiRequirements = ApiRequirement[] | null;


export enum Tab {
  Required = 'Required',
  NotRequired = 'Not Required',
}
