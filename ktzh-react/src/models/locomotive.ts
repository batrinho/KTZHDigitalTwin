/* ═══════════════════════════════════════════════════════════
   Locomotive CRUD types — auto-derived from Swagger /v3/api-docs
   Server tag: "Locomotives"
   ═══════════════════════════════════════════════════════════ */

export type LocomotiveType = 'ELECTRIC' | 'DIESEL';

export type LocomotiveStatus = 'ACTIVE' | 'MAINTENANCE' | 'DECOMMISSIONED';

/** GET /api/locomotives  ·  GET /api/locomotives/{id} */
export interface Locomotive {
  id: string;                        // uuid
  code: string;
  model: string;
  type: LocomotiveType;
  status: LocomotiveStatus;
  manufacturedAt: string;            // date  (yyyy-MM-dd)
  createdAt: string;                 // date-time (ISO-8601)
}

/** POST /api/locomotives */
export interface CreateLocomotiveRequest {
  code: string;
  model: string;
  type: LocomotiveType;
  status: LocomotiveStatus;
  manufacturedAt: string;            // date  (yyyy-MM-dd)
}

/** PUT /api/locomotives/{id} — partial update */
export interface UpdateLocomotiveRequest {
  code?: string;
  model?: string;
  type?: LocomotiveType;
  status?: LocomotiveStatus;
  manufacturedAt?: string;           // date  (yyyy-MM-dd)
}
