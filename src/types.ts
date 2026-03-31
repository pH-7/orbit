export type HeaderMap = Record<string, string>;

export interface RouteResponse {
  status: number;
  headers: HeaderMap;
  body: string;
}

export interface PageSection {
  title: string;
  body: string;
}

export interface PageModel {
  title: string;
  eyebrow: string;
  headline: string;
  description: string;
  sections?: PageSection[];
}
