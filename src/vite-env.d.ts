/// <reference types="vite/client" />

declare module "front-matter" {
  interface FrontMatterResult<T> {
    attributes: T;
    body: string;
    bodyBegin: number;
    frontmatter: string;
  }

  function fm<T = unknown>(content: string): FrontMatterResult<T>;
  export default fm;
}

declare module "d3-geo-projection" {
  import { GeoProjection } from "d3-geo";

  export function geoBonne(): GeoProjection & {
    parallel(angle: number): GeoProjection;
  };
}
