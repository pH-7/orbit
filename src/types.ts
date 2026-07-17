import type { IncomingMessage } from 'node:http';

export type HeaderMap = Record<string, string>;

export interface RouteResponse {
  status: number;
  headers: HeaderMap;
  body: string;
}

export interface OrbitRequest {
  method: string;
  request: IncomingMessage;
  url: URL;
}

export type OrbitRouteHandler = (
  context: OrbitRequest
) => RouteResponse | null | Promise<RouteResponse | null>;

export type OrbitNotFoundHandler = (
  context: OrbitRequest
) => RouteResponse | Promise<RouteResponse>;

export interface OrbitAppOptions {
  route?: OrbitRouteHandler;
  publicDir?: string | false;
  notFound?: RouteResponse | OrbitNotFoundHandler;
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
