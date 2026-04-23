export enum RequestType {
    Pothole = 0,
    MissedBin = 1,
    NoiseComplaint = 2,
    PlanningQuery = 3,
    StreetLighting = 4,
    Other = 5
  }
  
  export enum RequestStatus {
    Submitted = 0,
    InReview = 1,
    InProgress = 2,
    Resolved = 3,
    Closed = 4
  }
  
  export interface ServiceRequest {
    id: number
    referenceNumber: string
    type: RequestType
    status: RequestStatus
    fullName: string
    email: string
    addressOrLocation: string
    description: string
    adminNotes?: string
    createdAt: string
  }
  
  export interface CreateServiceRequestDto {
    type: RequestType
    fullName: string
    email: string
    addressOrLocation: string
    description: string
  }
  
  export interface UpdateStatusDto {
    status: RequestStatus
    adminNotes?: string
  }
  
  export interface ChatMessage {
    role: 'user' | 'assistant'
    content: string
  }
  
  export interface PreFill {
    type: string
    description: string
  }
  
  export interface ChatResponse {
    reply: string
    preFill?: PreFill
  }

export interface LoginDto {
  username: string
  password: string
}

export interface ResidentLoginDto {
  email: string
  referenceNumber: string
}

export interface AuthTokenDto {
  token: string
  expiresAt: string
}
