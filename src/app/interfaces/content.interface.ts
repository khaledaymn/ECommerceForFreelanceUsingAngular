// src/app/interfaces/admin-data.interface.ts
export interface AdminData {
  id: number;
  title: string;
  description: string;
  logo: string; // URL
  heroImage: string; // URL (كان اسمه AboutImage في الـ API)
}
