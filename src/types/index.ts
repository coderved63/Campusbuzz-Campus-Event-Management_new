export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IEvent {
  _id: string;
  owner: string | IUser;
  title: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  category: string;
  price: number;
  image: string;
  host: string;
  isApproved: boolean;
  // Enhanced fields for complete event management
  capacity?: number;
  status?: 'draft' | 'published' | 'cancelled' | 'completed';
  attendeesCount?: number;
  tags?: string[];
  categoryData?: ICategory;
  ticketTypes?: Array<{
    name: string;
    price: number;
    description?: string;
    quantity?: number;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITicket {
  _id: string;
  userid: string;
  eventid: string;
  ticketDetails: {
    name: string;
    email: string;
    eventname: string;
    eventdate: Date;
    eventtime: string;
    ticketprice: number;
    qr?: string;
  };
  count: number;
  verified?: boolean;
  verifiedAt?: Date;
  // Additional fields for enhanced ticket system
  user?: string | IUser;
  event?: string | IEvent;
  ticketType?: string;
  quantity?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface INotification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'event' | 'ticket' | 'system';
  read: boolean;
  eventId?: string;
  createdAt: Date;
}

export interface ICategory {
  _id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  createdAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  price: number;
  host: string;
  image?: File;
}

export interface BookTicketRequest {
  eventId: string;
  name: string;
  email: string;
}