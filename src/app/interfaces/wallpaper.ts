import { WallpaperLang, WallpaperPlatform } from '../enums/wallpaper';
import { QueryParam } from './common';

export interface WallpaperQueryParam extends QueryParam {
  lang?: WallpaperLang | WallpaperLang[];
  year?: string;
  month?: string;
  resolution?: string;
}

export interface Wallpaper {
  wallpaperId: string;
  bingIdPrefix: string;
  bingIdCn: string;
  bingIdEn: string;
  wallpaperDate: Date;
  wallpaperTitle: string;
  wallpaperTitleEn: string;
  wallpaperDescription?: string;
  wallpaperCaption?: string;
  wallpaperUrl: string;
  wallpaperUrl2: string;
  wallpaperThumbUrl: string;
  wallpaperUrlBase: string;
  wallpaperImageFormat: string;
  wallpaperPlatform: WallpaperPlatform;
  wallpaperQuiz: string;
  wallpaperCopyright: string;
  wallpaperCopyrightEn: string;
  wallpaperCopyrightLink: string;
  wallpaperCopyrightLinkEn: string;
  wallpaperCopyrightAuthor: string;
  wallpaperStoryTitle: string;
  wallpaperStoryTitleEn: string;
  wallpaperStory: string;
  wallpaperStoryEn: string;
  wallpaperLocation: string;
  wallpaperLocationEn: string;
  wallpaperViews: number;
  wallpaperDownloads: number;
  wallpaperLikes: number;
  wallpaperComments: number;
  wallpaperFavorites: number;
  wallpaperPlays: number;
  wallpaperModified: number;
  hasTranslation: boolean;
  isCn: boolean;
  isEn: boolean;
  isFavorite: boolean;
  isVoted: boolean;
}

export interface HotWallpaper {
  wallpaperId: string;
  wallpaperTitle: string;
  wallpaperTitleCn: string;
  wallpaperTitleEn: string;
  wallpaperCopyright: string;
  wallpaperCopyrightCn: string;
  wallpaperCopyrightEn: string;
  wallpaperUrl: string;
  wallpaperThumbUrl: string;
  score: number;
  isCn: boolean;
  isEn: boolean;
}
