export type LocomotiveType   = 'ELECTRIC' | 'DIESEL';
export type LocomotiveStatus = 'ACTIVE' | 'MAINTENANCE' | 'DECOMMISSIONED';

export interface Locomotive {
  id: string;
  code: string;
  model: string;
  type: LocomotiveType;
  status: LocomotiveStatus;
  manufacturedAt: string;
  createdAt: string;
}

export interface CreateLocomotiveRequest {
  code: string;
  model: string;
  type: LocomotiveType;
  status: LocomotiveStatus;
  manufacturedAt: string;
}

export interface UpdateLocomotiveRequest {
  code?: string;
  model?: string;
  type?: LocomotiveType;
  status?: LocomotiveStatus;
  manufacturedAt?: string;
}
