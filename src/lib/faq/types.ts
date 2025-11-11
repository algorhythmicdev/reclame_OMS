// src/lib/faq/types.ts

export interface FAQCategory {
  id: string;
  nameEn: string;
  nameRu?: string;
  nameLv?: string;
  slug: string;
  descriptionEn?: string;
  descriptionRu?: string;
  descriptionLv?: string;
  icon?: string;
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FAQItem {
  id: string;
  categoryId: string;
  questionEn: string;
  questionRu?: string;
  questionLv?: string;
  answerEn: string;
  answerRu?: string;
  answerLv?: string;
  slug: string;
  orderIndex: number;
  viewCount: number;
  isFeatured: boolean;
  isActive: boolean;
  tags?: string[];
  attachments?: FAQAttachment[];
  relatedFaqs?: FAQItem[];
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface FAQAttachment {
  id: string;
  faqItemId: string;
  fileName: string;
  filePath: string;
  fileType?: string;
  fileSize?: number;
  description?: string;
  orderIndex: number;
  url?: string;
  createdAt: string;
}

export interface FAQTag {
  id: string;
  name: string;
  slug: string;
  usageCount: number;
  createdAt: string;
}

export interface FAQView {
  id: string;
  faqItemId: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  viewedAt: string;
}
