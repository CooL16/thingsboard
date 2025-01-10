///
/// Copyright © 2016-2024 The Thingsboard Authors
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///     http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///

import { DataKey, Datasource, DatasourceType, FormattedData } from '@shared/models/widget.models';
import { DataKeyType } from '@shared/models/telemetry/telemetry.models';
import { guid, hashCode, isDefinedAndNotNull, isString, mergeDeep } from '@core/utils';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { materialColors } from '@shared/models/material.models';
import L, { BaseIconOptions, Icon } from 'leaflet';
import { TbFunction } from '@shared/models/js-function.models';
import { Observable, Observer, of, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';
import { ImagePipe } from '@shared/pipe/image.pipe';

export enum MapType {
  geoMap = 'geoMap',
  image = 'image'
}

export interface MapDataSourceSettings {
  dsType: DatasourceType;
  dsDeviceId?: string;
  dsEntityAliasId?: string;
  dsFilterId?: string;
}

export interface TbMapDatasource extends Datasource {
  mapDataIds: string[];
}

export const mapDataSourceSettingsToDatasource = (settings: MapDataSourceSettings): TbMapDatasource => {
  return {
    type: settings.dsType,
    deviceId: settings.dsDeviceId,
    entityAliasId: settings.dsEntityAliasId,
    filterId: settings.dsFilterId,
    dataKeys: [],
    mapDataIds: [guid()]
  };
};

export interface MapDataLayerSettings extends MapDataSourceSettings {
  additionalDataKeys?: DataKey[];
  groups?: string[];
}

export type MapDataLayerType = 'markers' | 'polygons' | 'circles';

export const mapDataLayerValid = (dataLayer: MapDataLayerSettings, type: MapDataLayerType): boolean => {
  if (!dataLayer.dsType || ![DatasourceType.function, DatasourceType.device, DatasourceType.entity].includes(dataLayer.dsType)) {
    return false;
  }
  switch (dataLayer.dsType) {
    case DatasourceType.function:
      break;
    case DatasourceType.device:
      if (!dataLayer.dsDeviceId) {
        return false;
      }
      break;
    case DatasourceType.entity:
      if (!dataLayer.dsEntityAliasId) {
        return false;
      }
      break;
  }
  switch (type) {
    case 'markers':
      const markersDataLayer = dataLayer as MarkersDataLayerSettings;
      if (!markersDataLayer.xKey?.type || !markersDataLayer.xKey?.name ||
          !markersDataLayer.yKey?.type || !markersDataLayer.xKey?.name) {
        return false;
      }
      break;
    case 'polygons':
      const polygonsDataLayer = dataLayer as PolygonsDataLayerSettings;
      if (!polygonsDataLayer.polygonKey?.type || !polygonsDataLayer.polygonKey?.name) {
        return false;
      }
      break;
    case 'circles':
      const circlesDataLayer = dataLayer as CirclesDataLayerSettings;
      if (!circlesDataLayer.circleKey?.type || !circlesDataLayer.circleKey?.name) {
        return false;
      }
      break;
  }
  return true;
};

export const mapDataLayerValidator = (type: MapDataLayerType): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const layer: MapDataLayerSettings = control.value;
    if (!mapDataLayerValid(layer, type)) {
      return {
        layer: true
      };
    }
    return null;
  };
};

export enum MarkerType {
  default = 'default',
  image = 'image'
}

export enum DataLayerColorType {
  constant = 'constant',
  function = 'function'
}

export interface DataLayerColorSettings {
  type: DataLayerColorType;
  color: string;
  colorFunction?: TbFunction;
}

export enum MarkerImageType {
  image = 'image',
  function = 'function'
}

export interface MarkerImageSettings {
  type: MarkerImageType;
  image?: string;
  imageSize?: number;
  imageFunction?: TbFunction;
  images?: string[];
}

export interface MarkersDataLayerSettings extends MapDataLayerSettings {
  xKey: DataKey;
  yKey: DataKey;
  markerType: MarkerType;
  markerColor: DataLayerColorSettings;
  markerImage?: MarkerImageSettings;
  markerOffsetX: number;
  markerOffsetY: number;
}

const defaultMarkerLatitudeFunction = 'var value = prevValue || 15.833293;\n' +
  'if (time % 500 < 500) {\n' +
  '    value += Math.random() * 0.05 - 0.025;\n' +
  '}\n' +
  'return value;';

const defaultMarkerLongitudeFunction = 'var value = prevValue || -90.454350;\n' +
  'if (time % 500 < 500) {\n' +
  '    value += Math.random() * 0.05 - 0.025;\n' +
  '}\n' +
  'return value;';

const defaultMarkerXPosFunction = 'var value = prevValue || 0.2;\n' +
  'if (time % 500 < 500) {\n' +
  '    value += Math.random() * 0.05 - 0.025;\n' +
  '}\n' +
  'return value;';

const defaultMarkerYPosFunction = 'var value = prevValue || 0.3;\n' +
  'if (time % 500 < 500) {\n' +
  '    value += Math.random() * 0.05 - 0.025;\n' +
  '}\n' +
  'return value;';

export const defaultMarkersDataLayerSettings = (mapType: MapType, functionsOnly = false): MarkersDataLayerSettings => mergeDeep({
  dsType: functionsOnly ? DatasourceType.function : DatasourceType.entity,
  xKey: {
    name: functionsOnly ? 'f(x)' : (MapType.geoMap === mapType ? 'latitude' : 'xPos'),
    label: MapType.geoMap === mapType ? 'latitude' : 'xPos',
    type: functionsOnly ? DataKeyType.function : DataKeyType.attribute,
    funcBody: functionsOnly ? (MapType.geoMap === mapType ? defaultMarkerLatitudeFunction : defaultMarkerXPosFunction) : undefined,
    settings: {},
    color: materialColors[0].value
  },
  yKey: {
    name: functionsOnly ? 'f(x)' : (MapType.geoMap === mapType ? 'longitude' : 'yPos'),
    label: MapType.geoMap === mapType ? 'longitude' : 'yPos',
    type: functionsOnly ? DataKeyType.function : DataKeyType.attribute,
    funcBody: functionsOnly ? (MapType.geoMap === mapType ? defaultMarkerLongitudeFunction : defaultMarkerYPosFunction) : undefined,
    settings: {},
    color: materialColors[0].value
  }
} as MarkersDataLayerSettings, defaultBaseMarkersDataLayerSettings as MarkersDataLayerSettings);

export const defaultBaseMarkersDataLayerSettings: Partial<MarkersDataLayerSettings> = {
  markerType: MarkerType.default,
  markerColor: {
    type: DataLayerColorType.constant,
    color: '#FE7569'
  },
  markerOffsetX: 0.5,
  markerOffsetY: 1
};

export interface PolygonsDataLayerSettings extends MapDataLayerSettings {
  polygonKey: DataKey;
}

export const defaultPolygonsDataLayerSettings = (functionsOnly = false): PolygonsDataLayerSettings => mergeDeep({
  dsType: functionsOnly ? DatasourceType.function : DatasourceType.entity,
  polygonKey: {
    name: functionsOnly ? 'f(x)' : 'perimeter',
    label: 'perimeter',
    type: functionsOnly ? DataKeyType.function : DataKeyType.attribute,
    settings: {},
    color: materialColors[0].value
  }
} as PolygonsDataLayerSettings, defaultBasePolygonsDataLayerSettings as PolygonsDataLayerSettings);

export const defaultBasePolygonsDataLayerSettings: Partial<PolygonsDataLayerSettings> = {

}

export interface CirclesDataLayerSettings extends MapDataLayerSettings {
  circleKey: DataKey;
}

export const defaultCirclesDataLayerSettings = (functionsOnly = false): CirclesDataLayerSettings => mergeDeep({
  dsType: functionsOnly ? DatasourceType.function : DatasourceType.entity,
  circleKey: {
    name: functionsOnly ? 'f(x)' : 'perimeter',
    label: 'perimeter',
    type: functionsOnly ? DataKeyType.function : DataKeyType.attribute,
    settings: {},
    color: materialColors[0].value
  }
} as CirclesDataLayerSettings, defaultBaseCirclesDataLayerSettings as CirclesDataLayerSettings);

export const defaultBaseCirclesDataLayerSettings: Partial<CirclesDataLayerSettings> = {

}

export const defaultMapDataLayerSettings = (mapType: MapType, dataLayerType: MapDataLayerType, functionsOnly = false): MapDataLayerSettings => {
  switch (dataLayerType) {
    case 'markers':
      return defaultMarkersDataLayerSettings(mapType, functionsOnly);
    case 'polygons':
      return defaultPolygonsDataLayerSettings(functionsOnly);
    case 'circles':
      return defaultCirclesDataLayerSettings(functionsOnly);
  }
};

export interface AdditionalMapDataSourceSettings extends MapDataSourceSettings {
  dataKeys: DataKey[];
}

export const additionalMapDataSourcesToDatasources = (additionalMapDataSources: AdditionalMapDataSourceSettings[]): TbMapDatasource[] => {
  return additionalMapDataSources.map(addDs => {
    const res = mapDataSourceSettingsToDatasource(addDs);
    res.dataKeys = addDs.dataKeys;
    return res;
  });
};

export enum MapControlsPosition {
  topleft = 'topleft',
  topright = 'topright',
  bottomleft = 'bottomleft',
  bottomright = 'bottomright'
}

export enum MapZoomAction {
  scroll = 'scroll',
  doubleClick = 'doubleClick',
  controlButtons = 'controlButtons'
}

export interface BaseMapSettings {
  mapType: MapType;
  markers: MarkersDataLayerSettings[];
  polygons: PolygonsDataLayerSettings[];
  circles: CirclesDataLayerSettings[];
  additionalDataSources: AdditionalMapDataSourceSettings[];
  controlsPosition: MapControlsPosition;
  zoomActions: MapZoomAction[];
  fitMapBounds: boolean;
  useDefaultCenterPosition: boolean;
  defaultCenterPosition?: string;
  defaultZoomLevel: number;
  minZoomLevel: number;
  mapPageSize: number;
}

export const DEFAULT_MAP_PAGE_SIZE = 16384;
export const DEFAULT_ZOOM_LEVEL = 8;

export const defaultBaseMapSettings: BaseMapSettings = {
  mapType: MapType.geoMap,
  markers: [],
  polygons: [],
  circles: [],
  additionalDataSources: [],
  controlsPosition: MapControlsPosition.topleft,
  zoomActions: [MapZoomAction.scroll, MapZoomAction.doubleClick, MapZoomAction.controlButtons],
  fitMapBounds: true,
  useDefaultCenterPosition: false,
  defaultCenterPosition: '0,0',
  defaultZoomLevel: null,
  minZoomLevel: 16,
  mapPageSize: DEFAULT_MAP_PAGE_SIZE
};

export enum MapProvider {
  openstreet = 'openstreet',
  google = 'google',
  here = 'here',
  tencent = 'tencent',
  custom = 'custom'
}

export const mapProviders = Object.keys(MapProvider) as MapProvider[];

export const mapProviderTranslationMap = new Map<MapProvider, string>(
  [
    [MapProvider.openstreet, 'widgets.maps.layer.provider.openstreet.title'],
    [MapProvider.google, 'widgets.maps.layer.provider.google.title'],
    [MapProvider.here, 'widgets.maps.layer.provider.here.title'],
    [MapProvider.tencent, 'widgets.maps.layer.provider.tencent.title'],
    [MapProvider.custom, 'widgets.maps.layer.provider.custom.title']
  ]
);

export interface MapLayerSettings {
  label?: string;
  provider: MapProvider;
}

export const mapLayerValid = (layer: MapLayerSettings): boolean => {
  if (!layer.provider) {
    return false;
  }
  switch (layer.provider) {
    case MapProvider.openstreet:
      const openStreetLayer = layer as OpenStreetMapLayerSettings;
      return !!openStreetLayer.layerType;
    case MapProvider.google:
      const googleLayer = layer as GoogleMapLayerSettings;
      return !!googleLayer.layerType && !!googleLayer.apiKey;
    case MapProvider.here:
      const hereLayer = layer as HereMapLayerSettings;
      return !!hereLayer.layerType && !!hereLayer.apiKey;
    case MapProvider.tencent:
      const tencentLayer = layer as TencentMapLayerSettings;
      return !!tencentLayer.layerType;
    case MapProvider.custom:
      const customLayer = layer as CustomMapLayerSettings;
      return !!customLayer.tileUrl;
  }
};

export const mapLayerValidator = (control: AbstractControl): ValidationErrors | null => {
  const layer: MapLayerSettings = control.value;
  if (!mapLayerValid(layer)) {
    return {
      layer: true
    };
  }
  return null;
};

export const defaultLayerTitle = (layer: MapLayerSettings): string => {
  if (!layer.provider) {
    return null;
  }
  switch (layer.provider) {
    case MapProvider.openstreet:
      const openStreetLayer = layer as OpenStreetMapLayerSettings;
      return openStreetMapLayerTranslationMap.get(openStreetLayer.layerType);
    case MapProvider.google:
      const googleLayer = layer as GoogleMapLayerSettings;
      return googleMapLayerTranslationMap.get(googleLayer.layerType);
    case MapProvider.here:
      const hereLayer = layer as HereMapLayerSettings;
      return hereLayerTranslationMap.get(hereLayer.layerType);
    case MapProvider.tencent:
      const tencentLayer = layer as TencentMapLayerSettings;
      return tencentLayerTranslationMap.get(tencentLayer.layerType);
    case MapProvider.custom:
      return 'widgets.maps.layer.provider.custom.title';
  }
}

export enum OpenStreetLayerType {
  openStreetMapnik = 'OpenStreetMap.Mapnik',
  openStreetHot = 'OpenStreetMap.HOT',
  esriWorldStreetMap = 'Esri.WorldStreetMap',
  esriWorldTopoMap = 'Esri.WorldTopoMap',
  esriWorldImagery = 'Esri.WorldImagery',
  cartoDbPositron = 'CartoDB.Positron',
  cartoDbDarkMatter = 'CartoDB.DarkMatter'
}

export const openStreetLayerTypes = Object.values(OpenStreetLayerType) as OpenStreetLayerType[];

export const openStreetMapLayerTranslationMap = new Map<OpenStreetLayerType, string>(
  [
    [OpenStreetLayerType.openStreetMapnik, 'widgets.maps.layer.provider.openstreet.mapnik'],
    [OpenStreetLayerType.openStreetHot, 'widgets.maps.layer.provider.openstreet.hot'],
    [OpenStreetLayerType.esriWorldStreetMap, 'widgets.maps.layer.provider.openstreet.esri-street'],
    [OpenStreetLayerType.esriWorldTopoMap, 'widgets.maps.layer.provider.openstreet.esri-topo'],
    [OpenStreetLayerType.esriWorldImagery, 'widgets.maps.layer.provider.openstreet.esri-imagery'],
    [OpenStreetLayerType.cartoDbPositron, 'widgets.maps.layer.provider.openstreet.cartodb-positron'],
    [OpenStreetLayerType.cartoDbDarkMatter, 'widgets.maps.layer.provider.openstreet.cartodb-dark-matter']
  ]
);

export interface OpenStreetMapLayerSettings extends MapLayerSettings {
  provider: MapProvider.openstreet;
  layerType: OpenStreetLayerType;
}

export const defaultOpenStreetMapLayerSettings: OpenStreetMapLayerSettings = {
  provider: MapProvider.openstreet,
  layerType: OpenStreetLayerType.openStreetMapnik
}

export enum GoogleLayerType {
  roadmap = 'roadmap',
  satellite = 'satellite',
  hybrid = 'hybrid',
  terrain = 'terrain'
}

export const googleMapLayerTypes = Object.values(GoogleLayerType) as GoogleLayerType[];

export const googleMapLayerTranslationMap = new Map<GoogleLayerType, string>(
  [
    [GoogleLayerType.roadmap, 'widgets.maps.layer.provider.google.roadmap'],
    [GoogleLayerType.satellite, 'widgets.maps.layer.provider.google.satellite'],
    [GoogleLayerType.hybrid, 'widgets.maps.layer.provider.google.hybrid'],
    [GoogleLayerType.terrain, 'widgets.maps.layer.provider.google.terrain']
  ]
);

export interface GoogleMapLayerSettings extends MapLayerSettings {
  provider: MapProvider.google;
  layerType: GoogleLayerType;
  apiKey: string;
}

export const defaultGoogleMapLayerSettings: GoogleMapLayerSettings = {
  provider: MapProvider.google,
  layerType: GoogleLayerType.roadmap,
  apiKey: 'AIzaSyDoEx2kaGz3PxwbI9T7ccTSg5xjdw8Nw8Q'
};

export enum HereLayerType {
  hereNormalDay = 'HEREv3.normalDay',
  hereNormalNight = 'HEREv3.normalNight',
  hereHybridDay = 'HEREv3.hybridDay',
  hereTerrainDay = 'HEREv3.terrainDay'
}

export const hereLayerTypes = Object.values(HereLayerType) as HereLayerType[];

export const hereLayerTranslationMap = new Map<HereLayerType, string>(
  [
    [HereLayerType.hereNormalDay, 'widgets.maps.layer.provider.here.normal-day'],
    [HereLayerType.hereNormalNight, 'widgets.maps.layer.provider.here.normal-night'],
    [HereLayerType.hereHybridDay, 'widgets.maps.layer.provider.here.hybrid-day'],
    [HereLayerType.hereTerrainDay, 'widgets.maps.layer.provider.here.terrain-day']
  ]
);

export interface HereMapLayerSettings extends MapLayerSettings {
  provider: MapProvider.here;
  layerType: HereLayerType;
  apiKey: string;
}

export const defaultHereMapLayerSettings: HereMapLayerSettings = {
  provider: MapProvider.here,
  layerType: HereLayerType.hereNormalDay,
  apiKey: 'kVXykxAfZ6LS4EbCTO02soFVfjA7HoBzNVVH9u7nzoE'
}

export enum TencentLayerType {
  tencentNormal = 'Tencent.Normal',
  tencentSatellite = 'Tencent.Satellite',
  tencentTerrain = 'Tencent.Terrain'
}

export const tencentLayerTypes = Object.values(TencentLayerType) as TencentLayerType[];

export const tencentLayerTranslationMap = new Map<TencentLayerType, string>(
  [
    [TencentLayerType.tencentNormal, 'widgets.maps.layer.provider.tencent.normal'],
    [TencentLayerType.tencentSatellite, 'widgets.maps.layer.provider.tencent.satellite'],
    [TencentLayerType.tencentTerrain, 'widgets.maps.layer.provider.tencent.terrain']
  ]
);

export interface TencentMapLayerSettings extends MapLayerSettings {
  provider: MapProvider.tencent;
  layerType: TencentLayerType
}

export const defaultTencentMapLayerSettings: TencentMapLayerSettings = {
  provider: MapProvider.tencent,
  layerType: TencentLayerType.tencentNormal
}

export interface CustomMapLayerSettings extends MapLayerSettings {
  provider: MapProvider.custom;
  tileUrl: string;
}

export const defaultCustomMapLayerSettings: CustomMapLayerSettings = {
  provider: MapProvider.custom,
  tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
}

export const defaultMapLayerSettings = (provider: MapProvider): MapLayerSettings => {
  switch (provider) {
    case MapProvider.openstreet:
      return defaultOpenStreetMapLayerSettings;
    case MapProvider.google:
      return defaultGoogleMapLayerSettings;
    case MapProvider.here:
      return defaultHereMapLayerSettings;
    case MapProvider.tencent:
      return defaultTencentMapLayerSettings;
    case MapProvider.custom:
      return defaultCustomMapLayerSettings;
  }
};

export const defaultMapLayers: MapLayerSettings[] = (Object.keys(OpenStreetLayerType) as OpenStreetLayerType[]).map(type => ({
  provider: MapProvider.openstreet,
  layerType: OpenStreetLayerType[type]
} as MapLayerSettings));
/*.concat((Object.keys(GoogleLayerType) as GoogleLayerType[]).map(type =>
  mergeDeep({} as MapLayerSettings, defaultGoogleMapLayerSettings, {layerType: GoogleLayerType[type]} as GoogleMapLayerSettings)).concat(
  (Object.keys(TencentLayerType) as TencentLayerType[]).map(type => ({
    provider: MapProvider.tencent,
    layerType: TencentLayerType[type]
  } as MapLayerSettings))
)).concat(
  (Object.keys(HereLayerType) as HereLayerType[]).map(type =>
    mergeDeep({} as MapLayerSettings, defaultHereMapLayerSettings, {layerType: HereLayerType[type]} as HereMapLayerSettings))
).concat([
  mergeDeep({} as MapLayerSettings, defaultCustomMapLayerSettings, {label: 'Custom 1'} as CustomMapLayerSettings),
  mergeDeep({} as MapLayerSettings, defaultCustomMapLayerSettings, {
    tileUrl: 'http://a.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png',
    label: 'Custom 2'
  } as CustomMapLayerSettings),
  mergeDeep({} as MapLayerSettings, defaultCustomMapLayerSettings, {
    tileUrl: 'http://b.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png',
    label: 'Custom 3'
  } as CustomMapLayerSettings)
]);*/

export interface GeoMapSettings extends BaseMapSettings {
  layers?: MapLayerSettings[];
}

export const defaultGeoMapSettings: GeoMapSettings = {
  mapType: MapType.geoMap,
  layers: mergeDeep([], defaultMapLayers),
  ...mergeDeep({} as BaseMapSettings, defaultBaseMapSettings)
};

export enum ImageSourceType {
  image = 'image',
  attribute = 'attribute'
}

export interface ImageMapSettings extends BaseMapSettings {
  imageSourceType?: ImageSourceType;
  imageUrl?: string;
  imageEntityAlias?: string;
  imageUrlAttribute?: string;
}

export const defaultImageMapSettings: ImageMapSettings = {
  mapType: MapType.image,
  imageSourceType: ImageSourceType.image,
  imageUrl: 'data:image/svg+xml;base64,PHN2ZyBpZD0ic3ZnMiIgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMTAwIiB3aWR0aD0iMTAwIiB2ZXJzaW9uPSIxLjEiIHhtbG5zOmNjPSJodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9ucyMiIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgdmlld0JveD0iMCAwIDEwMCAxMDAiPgogPGcgaWQ9ImxheWVyMSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCAtOTUyLjM2KSI+CiAgPHJlY3QgaWQ9InJlY3Q0Njg0IiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBoZWlnaHQ9Ijk5LjAxIiB3aWR0aD0iOTkuMDEiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiB5PSI5NTIuODYiIHg9Ii40OTUwNSIgc3Ryb2tlLXdpZHRoPSIuOTkwMTAiIGZpbGw9IiNlZWUiLz4KICA8dGV4dCBpZD0idGV4dDQ2ODYiIHN0eWxlPSJ3b3JkLXNwYWNpbmc6MHB4O2xldHRlci1zcGFjaW5nOjBweDt0ZXh0LWFuY2hvcjptaWRkbGU7dGV4dC1hbGlnbjpjZW50ZXIiIGZvbnQtd2VpZ2h0PSJib2xkIiB4bWw6c3BhY2U9InByZXNlcnZlIiBmb250LXNpemU9IjEwcHgiIGxpbmUtaGVpZ2h0PSIxMjUlIiB5PSI5NzAuNzI4MDkiIHg9IjQ5LjM5NjQ3NyIgZm9udC1mYW1pbHk9IlJvYm90byIgZmlsbD0iIzY2NjY2NiI+PHRzcGFuIGlkPSJ0c3BhbjQ2OTAiIHg9IjUwLjY0NjQ3NyIgeT0iOTcwLjcyODA5Ij5JbWFnZSBiYWNrZ3JvdW5kIDwvdHNwYW4+PHRzcGFuIGlkPSJ0c3BhbjQ2OTIiIHg9IjQ5LjM5NjQ3NyIgeT0iOTgzLjIyODA5Ij5pcyBub3QgY29uZmlndXJlZDwvdHNwYW4+PC90ZXh0PgogIDxyZWN0IGlkPSJyZWN0NDY5NCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgaGVpZ2h0PSIxOS4zNiIgd2lkdGg9IjY5LjM2IiBzdHJva2U9IiMwMDAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgeT0iOTkyLjY4IiB4PSIxNS4zMiIgc3Ryb2tlLXdpZHRoPSIuNjM5ODYiIGZpbGw9Im5vbmUiLz4KIDwvZz4KPC9zdmc+Cg==',
  ...mergeDeep({} as BaseMapSettings, defaultBaseMapSettings)
}

export type MapSetting = GeoMapSettings & ImageMapSettings;

export const defaultMapSettings: MapSetting = defaultGeoMapSettings;

export interface MarkerImageInfo {
  url: string;
  size: number;
  markerOffset?: [number, number];
  tooltipOffset?: [number, number];
}

export interface MarkerIconInfo {
  icon: Icon<BaseIconOptions>;
  size: [number, number];
}

export type MapStringFunction = (data: FormattedData<TbMapDatasource>,
                                 dsData: FormattedData<TbMapDatasource>[]) => string;

export type MarkerImageFunction = (data: FormattedData<TbMapDatasource>, markerImages: string[],
                                   dsData: FormattedData<TbMapDatasource>[]) => MarkerImageInfo;

export interface TbCircleData {
  latitude: number;
  longitude: number;
  radius: number;
}

export const isJSON = (data: string): boolean => {
  try {
    const parseData = JSON.parse(data);
    return !Array.isArray(parseData);
  } catch (e) {
    return false;
  }
}

export const isValidLatitude = (latitude: any): boolean =>
  isDefinedAndNotNull(latitude) &&
  !isString(latitude) &&
  !isNaN(latitude) && isFinite(latitude) && Math.abs(latitude) <= 90;

export const isValidLongitude = (longitude: any): boolean =>
  isDefinedAndNotNull(longitude) &&
  !isString(longitude) &&
  !isNaN(longitude) && isFinite(longitude) && Math.abs(longitude) <= 180;

export const isValidLatLng = (latitude: any, longitude: any): boolean =>
  isValidLatitude(latitude) && isValidLongitude(longitude);

export const isCutPolygon = (data): boolean => {
  return data.length > 1 && Array.isArray(data[0]) && (Array.isArray(data[0][0]) || data[0][0] instanceof L.LatLng);
}

export const latLngPointToBounds = (point: L.LatLng, southWest: L.LatLng, northEast: L.LatLng, offset = 0): L.LatLng => {
  const maxLngMap = northEast.lng - offset;
  const minLngMap = southWest.lng + offset;
  const maxLatMap = northEast.lat - offset;
  const minLatMap = southWest.lat + offset;
  if (point.lng > maxLngMap) {
    point.lng = maxLngMap;
  } else if (point.lng < minLngMap) {
    point.lng = minLngMap;
  }
  if (point.lat > maxLatMap) {
    point.lat = maxLatMap;
  } else if (point.lat < minLatMap) {
    point.lat = minLatMap;
  }
  return point;
}

export const parseCenterPosition = (position: string | [number, number]): [number, number] => {
  if (typeof (position) === 'string') {
    const parts = position.split(',');
    if (parts.length === 2) {
      return [Number(parts[0]), Number(parts[1])];
    }
  }
  if (typeof (position) === 'object') {
    return position;
  }
  return [0, 0];
}

export const mergeMapDatasources = (target: TbMapDatasource[], source: TbMapDatasource[]): TbMapDatasource[] => {
  const appendDatasources: TbMapDatasource[] = [];
  for (const sourceDs of source) {
    let merged = false;
    for (let i = 0; i < target.length; i++) {
      const targetDs = target[i];
      if (mapDatasourceIsSame(targetDs, sourceDs)) {
        target[i] = mergeMapDatasource(targetDs, sourceDs);
        merged = true;
        break;
      }
    }
    if (!merged) {
      appendDatasources.push(sourceDs);
    }
  }
  target.push(...appendDatasources);
  return target;
};

const mapDatasourceIsSame = (ds1: TbMapDatasource, ds2: TbMapDatasource): boolean => {
  if (ds1.type === ds2.type) {
    switch (ds1.type) {
      case DatasourceType.function:
        return true;
      case DatasourceType.device:
      case DatasourceType.entity:
        if (ds1.filterId === ds2.filterId) {
          if (ds1.type === DatasourceType.device) {
            return ds1.deviceId === ds2.deviceId;
          } else {
            return ds1.entityAliasId === ds2.entityAliasId;
          }
        }
    }
  }
  return false;
}

const mergeMapDatasource = (target: TbMapDatasource, source: TbMapDatasource): TbMapDatasource => {
  target.mapDataIds.push(...source.mapDataIds);
  const appendKeys: DataKey[] = [];
  for (const sourceKey of source.dataKeys) {
    const found =
      target.dataKeys.find(key => key.type === sourceKey.type && key.name === sourceKey.name && key.label === sourceKey.label);
    if (!found) {
      appendKeys.push(sourceKey);
    }
  }
  target.dataKeys.push(...appendKeys);
  return target;
}

const imageAspectMap: {[key: string]: ImageWithAspect} = {};

const imageLoader = (imageUrl: string): Observable<HTMLImageElement> => new Observable((observer: Observer<HTMLImageElement>) => {
  const image = document.createElement('img'); // support IE
  image.style.position = 'absolute';
  image.style.left = '-99999px';
  image.style.top = '-99999px';
  image.onload = () => {
    observer.next(image);
    document.body.removeChild(image);
    observer.complete();
  };
  image.onerror = err => {
    observer.error(err);
    document.body.removeChild(image);
    observer.complete();
  };
  document.body.appendChild(image);
  image.src = imageUrl;
});

const loadImageAspect = (imageUrl: string): Observable<number> =>
  imageLoader(imageUrl).pipe(map(image => image.width / image.height));

export interface ImageWithAspect {
  url: string;
  aspect: number;
}

export const loadImageWithAspect = (imagePipe: ImagePipe, imageUrl: string): Observable<ImageWithAspect> => {
  if (imageUrl?.length) {
    const hash = hashCode(imageUrl);
    let imageWithAspect = imageAspectMap[hash];
    if (imageWithAspect) {
      return of(imageWithAspect);
    } else {
      return imagePipe.transform(imageUrl, {asString: true, ignoreLoadingImage: true}).pipe(
        switchMap((res) => {
          const url = res as string;
          return loadImageAspect(url).pipe(
            map((aspect) => {
              imageWithAspect = {url, aspect};
              imageAspectMap[hash] = imageWithAspect;
              return imageWithAspect;
            })
          );
        })
      );
    }
  } else {
    return of(null);
  }
};
