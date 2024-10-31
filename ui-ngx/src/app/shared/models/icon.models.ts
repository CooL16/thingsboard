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

import { ResourcesService } from '@core/services/resources.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isNotEmptyStr } from '@core/utils';

export const svgIcons: {[key: string]: string} = {
  'google-logo': '<svg viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 ' +
    '2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" ' +
    'd="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 ' +
    '7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 ' +
    '16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 ' +
    '15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 ' +
    '24 48z"/><path fill="none" d="M0 0h48v48H0z"/></svg>',
  'github-logo': '<svg viewBox="0 0 32.7 32.7"><path d="M16.3 0C7.3 0 0 7.3 0 16.3c0 7.2 4.7 13.3 11.1 15.5.8.1 ' +
    '1.1-.4 1.1-.8v-2.8c-4.5 1-5.5-2.2-5.5-2.2-.7-1.9-1.8-2.4-1.8-2.4-1.5-1 .1-1 .1-1 1.6.1 2.5 1.7 2.5 1.7 1.5 ' +
    '2.5 3.8 1.8 4.7 1.4.1-1.1.6-1.8 1-2.2-3.6-.4-7.4-1.8-7.4-8.1 0-1.8.6-3.2 1.7-4.4-.2-.4-.7-2.1.2-4.3 0 0 ' +
    '1.4-.4 4.5 1.7 1.3-.4 2.7-.5 4.1-.5s2.8.2 4.1.5c3.1-2.1 4.5-1.7 4.5-1.7.9 2.2.3 3.9.2 4.3 1 1.1 1.7 2.6 ' +
    '1.7 4.4 0 6.3-3.8 7.6-7.4 8 .6.5 1.1 1.5 1.1 3v4.5c0 .4.3.9 1.1.8 6.5-2.2 11.1-8.3 11.1-15.5C32.6 7.3 ' +
    '25.3 0 16.3 0z" fill="#211c19"/></svg>',
  'facebook-logo': '<svg viewBox="0 0 263 263"><path d="M263 131.5C263 58.9 204.1 0 131.5 0S0 58.9 0 131.5c0 ' +
    '65.6 48.1 120 110.9 129.9v-91.9H77.5v-38h33.4v-29c0-33 19.6-51.2 49.7-51.2 14.4 0 29.4 2.6 29.4 ' +
    '2.6v32.4h-16.5c-16.3 0-21.4 10.1-21.4 20.5v24.7h36.4l-5.8 38h-30.6v91.9c62.8-9.9 110.9-64.3 110.9-129.9z" ' +
    'fill="#1877f2"/><path d="M182.7 169.5l5.8-38H152v-24.7c0-10.4 5.1-20.5 21.4-20.5H190V53.9s-15-2.6-29.4-2.6c-30 ' +
    '0-49.7 18.2-49.7 51.2v29H77.5v38h33.4v91.9c6.7 1.1 13.6 1.6 20.5 1.6s13.9-.5 20.5-1.6v-91.9h30.8z" fill="#fff"/></svg>',
  'apple-logo': '<svg viewBox="0 0 256 315"><path d="M213.803394,167.030943 C214.2452,214.609646 255.542482,230.442639 ' +
    '256,230.644727 C255.650812,231.761357 249.401383,253.208293 234.24263,275.361446 C221.138555,294.513969 ' +
    '207.538253,313.596333 186.113759,313.991545 C165.062051,314.379442 158.292752,301.507828 134.22469,301.507828 ' +
    'C110.163898,301.507828 102.642899,313.596301 82.7151126,314.379442 C62.0350407,315.16201 46.2873831,293.668525 ' +
    '33.0744079,274.586162 C6.07529317,235.552544 -14.5576169,164.286328 13.147166,116.18047 C26.9103111,92.2909053 ' +
    '51.5060917,77.1630356 78.2026125,76.7751096 C98.5099145,76.3877456 117.677594,90.4371851 130.091705,90.4371851 ' +
    'C142.497945,90.4371851 165.790755,73.5415029 190.277627,76.0228474 C200.528668,76.4495055 229.303509,80.1636878 ' +
    '247.780625,107.209389 C246.291825,108.132333 213.44635,127.253405 213.803394,167.030988 M174.239142,50.1987033 ' +
    'C185.218331,36.9088319 192.607958,18.4081019 190.591988,0 C174.766312,0.636050225 155.629514,10.5457909 ' +
    '144.278109,23.8283506 C134.10507,35.5906758 125.195775,54.4170275 127.599657,72.4607932 C145.239231,73.8255433 ' +
    '163.259413,63.4970262 174.239142,50.1987249" fill="#000000"></path></svg>',
  'queues-list': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
    '<path fill="#fff" d="M9 4V2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h5v-2H4V4h5z"/>' +
    '<path fill="#fff" d="M7 18V6h2v12H7zM11 6v12h2V6h-2zM15 20v2h5a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-5v2h5v16h-5z"/>' +
    '<path fill="#fff" d="M15 18V6h2v12h-2z"/>' +
    '</svg>',
  trendz: '<svg viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="m 17.329936,0 1.999613,2.003952 -2.674056,' +
    '2.679916 2.661746,2.6765649 2.678508,-2.684351 1.999613,2.0039449 -2.682055,2.6878227 2.661607,2.6763665 -2.641298,2.656033 ' +
    '2.661746,2.66751 -1.999613,2.004017 -2.658338,-2.664181 -2.661607,2.676508 2.653887,2.659575 -1.999614,2.003804 L 14.679666,' +
    '21.39152 11.997681,24.088432 9.3156944,21.39152 6.6653477,24.047482 4.6657413,22.043678 7.3194891,19.384103 4.6578333,16.707382 ' +
    '1.9996133,19.371421 0,17.367405 2.6616488,14.700107 0.02053398,12.044216 2.6820275,9.3678495 1.4263538e-5,6.6800126 1.9996273,' +
    '4.6760606 4.678212,7.3604329 7.3397982,4.6839955 4.6657413,2.0041717 6.6653477,2.2309572e-4 9.3360035,2.6766286 11.997681,' +
    '0 14.659287,2.6765011 Z m -5.332255,4.0079963 1.999613,2.003945 -7.99844,8.0158157 -1.9996133,-2.004017 z m 1.676684,4.3522483 ' +
    '1.999613,2.0039454 -6.6654242,6.679793 -1.9996133,-2.003874 z m 2.988987,7.0033574 -1.999544,-2.003945 -4.6658108,4.675848 ' +
    '1.9996128,2.004015 z"/></svg>',
  tb_gateway: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="6 4 42 46" width="18" height="18">
    <path d="M41.633 47.719c0-.559.453-1.012 1.008-1.012.554 0 1.007.453 1.007 1.012v1.008c0 .558-.453 1.011-1.007 1.011a1.011 1.011 0 0 1-1.008-1.011ZM38.617 47.719c0-.559.45-1.012 1.004-1.012.559 0 1.008.453 1.008 1.012v1.008c0 .558-.45 1.011-1.008 1.011a1.008 1.008 0 0 1-1.004-1.011ZM35.598 47.719c0-.559.449-1.012 1.004-1.012.558 0 1.007.453 1.007 1.012v1.008c0 .558-.449 1.011-1.007 1.011a1.008 1.008 0 0 1-1.004-1.011ZM32.578 47.719c0-.559.453-1.012 1.008-1.012.555 0 1.004.453 1.004 1.012v1.008c0 .558-.45 1.011-1.004 1.011a1.011 1.011 0 0 1-1.008-1.011ZM44.652 44.684a1.01 1.01 0 0 1 1.008-1.008h1.004c.559 0 1.008.453 1.008 1.008 0 .558-.45 1.011-1.008 1.011H45.66a1.011 1.011 0 0 1-1.008-1.011ZM28.555 44.684c0-.555.449-1.008 1.004-1.008h1.007a1.01 1.01 0 0 1 0 2.02H29.56a1.008 1.008 0 0 1-1.004-1.012Z"/>
    <path d="M15.477 35.59h-3.02v3.031c0 2.234 1.8 4.043 4.023 4.043h2.012a4.035 4.035 0 0 0 4.028-4.043V35.59H19.5v2.023h-4.023ZM7.074 41.309a.75.75 0 0 0-.746.75c0 3.73 3.012 6.754 6.723 6.754a.751.751 0 0 0 0-1.504c-2.887 0-5.227-2.352-5.227-5.25a.75.75 0 0 0-.75-.75Z"/>
    <path d="M9.977 41.023a.75.75 0 0 0-.747.75 4.118 4.118 0 0 0 4.11 4.125.747.747 0 0 0 .746-.75.747.747 0 0 0-.746-.75 2.622 2.622 0 0 1-2.617-2.625.747.747 0 0 0-.746-.75Z"/>
    <path d="M44.652 41.66c0-.558.453-1.012 1.008-1.012h1.004c.559 0 1.008.454 1.008 1.012 0 .555-.45 1.008-1.008 1.008H45.66a1.01 1.01 0 0 1-1.008-1.008ZM28.555 41.66c0-.558.449-1.012 1.004-1.012h1.007a1.01 1.01 0 0 1 0 2.02H29.56a1.007 1.007 0 0 1-1.004-1.008ZM44.652 38.621c0-.559.453-1.012 1.008-1.012h1.004c.559 0 1.008.453 1.008 1.012 0 .559-.45 1.012-1.008 1.012H45.66a1.011 1.011 0 0 1-1.008-1.012ZM28.555 38.621c0-.559.449-1.012 1.004-1.012h1.007a1.011 1.011 0 0 1 0 2.024H29.56a1.008 1.008 0 0 1-1.004-1.012ZM44.652 35.594c0-.559.453-1.012 1.008-1.012h1.004c.559 0 1.008.453 1.008 1.012 0 .558-.45 1.011-1.008 1.011H45.66a1.011 1.011 0 0 1-1.008-1.011ZM28.555 35.594c0-.559.449-1.012 1.004-1.012h1.007a1.011 1.011 0 0 1 0 2.023H29.56a1.008 1.008 0 0 1-1.004-1.011Z"/>
    <path d="M12.457 33.57c0-.558.45-1.011 1.004-1.011h8.05c.555 0 1.009.453 1.009 1.011v1.008H12.457Z"/>
    <path d="M41.633 31.55c0-.558.453-1.01 1.008-1.01.554 0 1.007.452 1.007 1.01v1.009c0 .558-.453 1.011-1.007 1.011a1.011 1.011 0 0 1-1.008-1.011Z"/>
    <path d="M27.547 10.184v2.168h2.015v-2.168a3.592 3.592 0 0 1-2.015 0Zm3.02 16.316v-4.043h2.011V26.5h4.027c1.11 0 2.012.906 2.012 2.023v2.02h-2.012v-2.02h-4.027a2.019 2.019 0 0 1-2.012-2.023Zm-4.024-4.043V26.5a2.019 2.019 0 0 1-2.012 2.023h-6.039v2.02H16.48v-2.02c0-1.117.903-2.023 2.012-2.023h6.04v-4.043Z"/>
    <path d="M32.578 31.55c0-.558.453-1.01 1.008-1.01.555 0 1.004.452 1.004 1.01v1.009c0 .558-.45 1.011-1.004 1.011a1.011 1.011 0 0 1-1.008-1.011Z"/>
    <path d="M32.578 32.559c-1.11 0-2.012.906-2.012 2.02v11.116c0 1.117.903 2.024 2.012 2.024h11.067a2.02 2.02 0 0 0 2.015-2.024V34.578c0-1.113-.902-2.02-2.015-2.02Zm1.008 2.02c-.559 0-1.008.452-1.008 1.01v9.099c0 .558.45 1.007 1.008 1.007h9.055c.554 0 1.004-.449 1.004-1.008V35.59c0-.559-.45-1.012-1.004-1.012Z"/>
    <path d="M38.617 40.648h3.016v3.032h-3.016ZM34.59 40.648h3.02v3.032h-3.02ZM38.617 36.602h3.016v3.035h-3.016ZM34.59 36.602h3.02v3.035h-3.02Z"/>
    <path d="M28.555 9.313a2.518 2.518 0 0 0 2.515-2.524 2.519 2.519 0 0 0-2.515-2.527 2.519 2.519 0 0 0-2.516 2.527 2.518 2.518 0 0 0 2.516 2.524Zm-11.067 4.042a2.02 2.02 0 0 0-2.015 2.024v4.043c0 1.113.902 2.02 2.015 2.02h22.133a2.016 2.016 0 0 0 2.012-2.02v-4.043a2.016 2.016 0 0 0-2.012-2.024Zm1.004 4.043a1.01 1.01 0 0 0 0-2.02c-.555 0-1.004.454-1.004 1.013 0 .554.45 1.007 1.004 1.007Zm4.028-1.007a1.01 1.01 0 0 1-1.008 1.007 1.01 1.01 0 0 1 0-2.02c.554 0 1.008.454 1.008 1.013Z"/>
  </svg>`,
};

export const svgIconsUrl: { [key: string]: string } = {
  windows: '/assets/windows.svg',
  macos: '/assets/macos.svg',
  linux: '/assets/linux.svg',
  docker: '/assets/docker.svg'
};

const svgIconNamespaces: string[] = ['mdi'];
const svgIconNames = [...Object.keys(svgIcons), ...Object.keys(svgIconsUrl)];

export const splitIconName = (iconName: string): [string, string] => {
  if (!iconName) {
    return ['', ''];
  }
  const parts = iconName.split(':');
  switch (parts.length) {
    case 1:
      return ['', parts[0]];
    case 2:
      return parts as [string, string];
    default:
      throw Error(`Invalid icon name: "${iconName}"`);
  }
};

export const isSvgIcon = (icon: string): boolean => {
  const [namespace, iconName] = splitIconName(icon);
  return svgIconNamespaces.includes(namespace) || svgIconNames.includes(iconName);
};

export interface MaterialIcon {
  name: string;
  displayName?: string;
  tags: string[];
}

export const iconByName = (icons: Array<MaterialIcon>, name: string): MaterialIcon => icons.find(i => i.name === name);

const searchIconTags = (icon: MaterialIcon, searchText: string): boolean =>
  !!icon.tags.find(t => t.toUpperCase().includes(searchText.toUpperCase()));

const searchIcons = (_icons: Array<MaterialIcon>, searchText: string): Array<MaterialIcon> => _icons.filter(
  i => i.name.toUpperCase().includes(searchText.toUpperCase()) ||
    i.displayName.toUpperCase().includes(searchText.toUpperCase()) ||
    searchIconTags(i, searchText)
);

const getCommonMaterialIcons = (icons: Array<MaterialIcon>, chunkSize: number): Array<MaterialIcon> => icons.slice(0, chunkSize * 4);

export const getMaterialIcons = (resourcesService: ResourcesService,  chunkSize = 11,
                                 all = false, searchText: string): Observable<MaterialIcon[][]> =>
  resourcesService.loadJsonResource<Array<MaterialIcon>>('/assets/metadata/material-icons.json',
    (icons) => {
      for (const icon of icons) {
        const iconName = splitIconName(icon.name)[1];
        const words = iconName.replace(/[_\-]/g, ' ').split(' ');
        for (let i = 0; i < words.length; i++) {
          words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
        }
        icon.displayName = words.join(' ');
      }
      return icons;
    }
  ).pipe(
    map((icons) => {
      if (isNotEmptyStr(searchText)) {
        return searchIcons(icons, searchText);
      } else if (!all) {
        return getCommonMaterialIcons(icons, chunkSize);
      } else {
        return icons;
      }
    }),
    map((icons) => {
      const iconChunks: MaterialIcon[][] = [];
      for (let i = 0; i < icons.length; i += chunkSize) {
        const chunk = icons.slice(i, i + chunkSize);
        iconChunks.push(chunk);
      }
      return iconChunks;
    })
  );