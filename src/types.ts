export interface SiteConfig {
  title: string;
  baseUrl: string;
  description?: string;
  author?: string;
}

export interface PageData {
  title: string;
  date?: string;
  layout?: string;
  draft?: boolean;
  description?: string;
  [key: string]: unknown;
}

export interface Page {
  slug: string;
  url: string;
  content: string;
  data: PageData;
  isPost: boolean;
  outputPath: string;
}

export interface PostSummary {
  title: string;
  date: string | undefined;
  url: string;
  description: string | undefined;
  [key: string]: unknown;
}
