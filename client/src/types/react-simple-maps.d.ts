declare module 'react-simple-maps' {
  import * as React from 'react';
  
  // ComposableMap component
  export interface ComposableMapProps {
    projection?: string;
    projectionConfig?: {
      rotate?: [number, number, number];
      scale?: number;
      [key: string]: any;
    };
    width?: number;
    height?: number;
    style?: React.CSSProperties;
    className?: string;
    [key: string]: any;
  }
  export const ComposableMap: React.FC<ComposableMapProps>;

  // ZoomableGroup component
  export interface ZoomableGroupProps {
    center?: [number, number];
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    translateExtent?: [[number, number], [number, number]];
    onMoveStart?: (position: any) => void;
    onMove?: (position: any) => void;
    onMoveEnd?: (position: any) => void;
    onZoomStart?: (event: any) => void;
    onZoom?: (event: any) => void;
    onZoomEnd?: (event: any) => void;
    className?: string;
    style?: React.CSSProperties;
    [key: string]: any;
  }
  export const ZoomableGroup: React.FC<ZoomableGroupProps>;

  // Geographies component
  export interface GeographiesProps {
    geography: string | object;
    children: (props: { geographies: Geography[] }) => React.ReactNode;
    parseGeographies?: (features: any) => any[];
    className?: string;
    style?: React.CSSProperties;
    [key: string]: any;
  }
  export const Geographies: React.FC<GeographiesProps>;

  // Geography component
  export interface Geography {
    rsmKey: string;
    properties: {
      [key: string]: any;
    };
    [key: string]: any;
  }
  
  export interface GeographyProps {
    geography: Geography;
    style?: {
      default?: React.CSSProperties;
      hover?: React.CSSProperties;
      pressed?: React.CSSProperties;
    };
    className?: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    onClick?: (event: React.MouseEvent, geography: Geography) => void;
    onMouseEnter?: (event: React.MouseEvent, geography: Geography) => void;
    onMouseLeave?: (event: React.MouseEvent, geography: Geography) => void;
    [key: string]: any;
  }
  export const Geography: React.FC<GeographyProps>;

  // Marker component
  export interface MarkerProps {
    coordinates: [number, number];
    className?: string;
    style?: React.CSSProperties;
    onClick?: (event: React.MouseEvent) => void;
    onMouseEnter?: (event: React.MouseEvent) => void;
    onMouseLeave?: (event: React.MouseEvent) => void;
    [key: string]: any;
  }
  export const Marker: React.FC<MarkerProps>;
}