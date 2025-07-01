
export interface ShortenedUrl {
  id: string;
  originalUrl: string;
  shortCode: string;
  customCode?: string;
  createdAt: Date;
  clicks: number;
  lastClickedAt?: Date;
}

export interface UrlStatistic {
  shortCode: string;
  clicks: number;
  originalUrl: string;
  createdAt: Date;
  lastClickedAt?: Date;
}
