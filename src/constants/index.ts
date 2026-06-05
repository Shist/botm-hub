import { OsuMapCategory } from "@/types/osumaps";
import { BotmClub, type IClubConfig } from "@/types/clubs";
import { type OsuScoreMod } from "@/types/scores";

export const SHIST_UID = "mjFMxVxnVrdAuYf0wYHY7Zb3KRl2";

export const MAX_ROSTERS_COUNT = 32;

export const MAPS_CATEGORIES: Record<OsuMapCategory, string> = {
  [OsuMapCategory.NM1]: "NM1 (Raw Aim)",
  [OsuMapCategory.NM2]: "NM2 (Flow Tapping)",
  [OsuMapCategory.NM3]: "NM3 (Alternate)",
  [OsuMapCategory.NM4]: "NM4 (Technical)",
  [OsuMapCategory.NM5]: "NM5 (Finger Control)",
  [OsuMapCategory.NM6]: "NM6 (Reading)",
  [OsuMapCategory.NM7]: "NM7 (Polyrhythm)",
  [OsuMapCategory.HD1]: "HD1 (Consistency)",
  [OsuMapCategory.HD2]: "HD2 (Low AR)",
  [OsuMapCategory.HD3]: "HD3 (Technical)",
  [OsuMapCategory.HR1]: "HR1 (Consistency)",
  [OsuMapCategory.HR2]: "HR2 (High CS)",
  [OsuMapCategory.HR3]: "HR3 (Technical)",
  [OsuMapCategory.DT1]: "DT1 (Consistency)",
  [OsuMapCategory.DT2]: "DT2 (High BPM)",
  [OsuMapCategory.DT3]: "DT3 (Technical)",
  [OsuMapCategory.DT4]: "DT4 (Old Mapping)",
  [OsuMapCategory.FM1]: "FM1 (Consistency)",
  [OsuMapCategory.FM2]: "FM2 (Antimod)",
  [OsuMapCategory.FM3]: "FM3 (Technical)",
  [OsuMapCategory.TB]: "TB (Long Consistency)",
};

export const CATEGORIES_SORT_PRIORITIES: Record<OsuMapCategory, number> = {
  [OsuMapCategory.NM1]: 1,
  [OsuMapCategory.NM2]: 2,
  [OsuMapCategory.NM3]: 3,
  [OsuMapCategory.NM4]: 4,
  [OsuMapCategory.NM5]: 5,
  [OsuMapCategory.NM6]: 6,
  [OsuMapCategory.NM7]: 7,
  [OsuMapCategory.HD1]: 8,
  [OsuMapCategory.HD2]: 9,
  [OsuMapCategory.HD3]: 10,
  [OsuMapCategory.HR1]: 11,
  [OsuMapCategory.HR2]: 12,
  [OsuMapCategory.HR3]: 13,
  [OsuMapCategory.DT1]: 14,
  [OsuMapCategory.DT2]: 15,
  [OsuMapCategory.DT3]: 16,
  [OsuMapCategory.DT4]: 17,
  [OsuMapCategory.FM1]: 18,
  [OsuMapCategory.FM2]: 19,
  [OsuMapCategory.FM3]: 20,
  [OsuMapCategory.TB]: 21,
};

export const CATEGORIES_COLORS = {
  [OsuMapCategory.NM1]: "#64b5f6",
  [OsuMapCategory.NM2]: "#42a5f5",
  [OsuMapCategory.NM3]: "#2196f3",
  [OsuMapCategory.NM4]: "#1976d2",
  [OsuMapCategory.NM5]: "#1565c0",
  [OsuMapCategory.NM6]: "#0d47a1",
  [OsuMapCategory.NM7]: "#003366",
  [OsuMapCategory.HD1]: "#ffd600",
  [OsuMapCategory.HD2]: "#f9a825",
  [OsuMapCategory.HD3]: "#c66900",
  [OsuMapCategory.HR1]: "#f0baba",
  [OsuMapCategory.HR2]: "#e57373",
  [OsuMapCategory.HR3]: "#c62828",
  [OsuMapCategory.DT1]: "#cda6d5",
  [OsuMapCategory.DT2]: "#ba68c8",
  [OsuMapCategory.DT3]: "#7e57c2",
  [OsuMapCategory.DT4]: "#5b259d",
  [OsuMapCategory.FM1]: "#94c596",
  [OsuMapCategory.FM2]: "#55aa59",
  [OsuMapCategory.FM3]: "#277d2b",
  [OsuMapCategory.TB]: "#d4ac7c",
};

export const MODS_ONLY_NM: OsuScoreMod[] = ["nm"];
export const MODS_ONLY_HD: OsuScoreMod[] = ["hd"];
export const MODS_ONLY_HR: OsuScoreMod[] = ["hr"];
export const MODS_ONLY_DT: OsuScoreMod[] = ["dt"];
export const MODS_WITHOUT_EZ: OsuScoreMod[] = [
  "nm",
  "hd",
  "hr",
  "fl",
  "hdhr",
  "flhd",
  "flhr",
  "flhdhr",
];
export const MODS_WITH_EZ_OR_FL: OsuScoreMod[] = [
  "ez",
  "fl",
  "flhd",
  "flhr",
  "flhdhr",
  "ezhd",
  "ezfl",
  "ezflhd",
];
export const MODS_WITH_HD: OsuScoreMod[] = ["hd", "ezhd", "flhd", "ezflhd"];
export const MODS_WITH_HR: OsuScoreMod[] = ["hr", "hdhr", "flhr", "flhdhr"];
export const ALL_FM_TB_MODS: OsuScoreMod[] = [
  "nm",
  "hd",
  "hr",
  "ez",
  "fl",
  "hdhr",
  "ezhd",
  "flhd",
  "flhr",
  "ezfl",
  "flhdhr",
  "ezflhd",
];

export const VALID_MODS_FOR_CATEGORY: Record<OsuMapCategory, OsuScoreMod[]> = {
  [OsuMapCategory.NM1]: MODS_ONLY_NM,
  [OsuMapCategory.NM2]: MODS_ONLY_NM,
  [OsuMapCategory.NM3]: MODS_ONLY_NM,
  [OsuMapCategory.NM4]: MODS_ONLY_NM,
  [OsuMapCategory.NM5]: MODS_ONLY_NM,
  [OsuMapCategory.NM6]: MODS_ONLY_NM,
  [OsuMapCategory.NM7]: MODS_ONLY_NM,
  [OsuMapCategory.HD1]: MODS_ONLY_HD,
  [OsuMapCategory.HD2]: MODS_ONLY_HD,
  [OsuMapCategory.HD3]: MODS_ONLY_HD,
  [OsuMapCategory.HR1]: MODS_ONLY_HR,
  [OsuMapCategory.HR2]: MODS_ONLY_HR,
  [OsuMapCategory.HR3]: MODS_ONLY_HR,
  [OsuMapCategory.DT1]: MODS_ONLY_DT,
  [OsuMapCategory.DT2]: MODS_ONLY_DT,
  [OsuMapCategory.DT3]: MODS_ONLY_DT,
  [OsuMapCategory.DT4]: MODS_ONLY_DT,
  [OsuMapCategory.FM1]: ALL_FM_TB_MODS,
  [OsuMapCategory.FM2]: ALL_FM_TB_MODS,
  [OsuMapCategory.FM3]: ALL_FM_TB_MODS,
  [OsuMapCategory.TB]: ALL_FM_TB_MODS,
};

export const CLUB_SETTINGS: Record<BotmClub, IClubConfig> = {
  [BotmClub.AIM]: {
    id: BotmClub.AIM,
    title: "Aim Клуб",
    skillsets: [
      { category: OsuMapCategory.NM1, allowedMods: MODS_ONLY_NM },
      { category: OsuMapCategory.HD1, allowedMods: MODS_ONLY_HD },
      { category: OsuMapCategory.HR1, allowedMods: MODS_ONLY_HR },
      { category: OsuMapCategory.DT1, allowedMods: MODS_ONLY_DT },
      { category: OsuMapCategory.FM1, allowedMods: MODS_WITHOUT_EZ },
      { category: OsuMapCategory.TB, allowedMods: MODS_WITHOUT_EZ },
    ],
  },
  [BotmClub.SPEED]: {
    id: BotmClub.SPEED,
    title: "Speed Клуб",
    skillsets: [
      { category: OsuMapCategory.NM2, allowedMods: MODS_ONLY_NM },
      { category: OsuMapCategory.NM5, allowedMods: MODS_ONLY_NM },
      { category: OsuMapCategory.DT1, allowedMods: MODS_ONLY_DT },
      { category: OsuMapCategory.DT2, allowedMods: MODS_ONLY_DT },
      { category: OsuMapCategory.DT3, allowedMods: MODS_ONLY_DT },
      { category: OsuMapCategory.DT4, allowedMods: MODS_ONLY_DT },
    ],
  },
  [BotmClub.TECH]: {
    id: BotmClub.TECH,
    title: "Tech Клуб",
    skillsets: [
      { category: OsuMapCategory.NM3, allowedMods: MODS_ONLY_NM },
      { category: OsuMapCategory.NM4, allowedMods: MODS_ONLY_NM },
      { category: OsuMapCategory.HD3, allowedMods: MODS_ONLY_HD },
      { category: OsuMapCategory.HR3, allowedMods: MODS_ONLY_HR },
      { category: OsuMapCategory.FM3, allowedMods: MODS_WITHOUT_EZ },
      { category: OsuMapCategory.TB, allowedMods: MODS_WITHOUT_EZ },
    ],
  },
  [BotmClub.READING]: {
    id: BotmClub.READING,
    title: "Reading Клуб",
    skillsets: [
      { category: OsuMapCategory.NM6, allowedMods: MODS_ONLY_NM },
      { category: OsuMapCategory.NM7, allowedMods: MODS_ONLY_NM },
      { category: OsuMapCategory.HD2, allowedMods: MODS_ONLY_HD },
      {
        category: OsuMapCategory.FM1,
        allowedMods: MODS_WITH_EZ_OR_FL,
      },
      {
        category: OsuMapCategory.FM2,
        allowedMods: [
          "nm",
          "hd",
          "ez",
          "fl",
          "flhd",
          "flhr",
          "flhdhr",
          "ezhd",
          "ezfl",
          "ezflhd",
        ],
      },
      {
        category: OsuMapCategory.FM3,
        allowedMods: MODS_WITH_EZ_OR_FL,
      },
    ],
  },
  [BotmClub.HIDDEN]: {
    id: BotmClub.HIDDEN,
    title: "Hidden Клуб",
    skillsets: [
      { category: OsuMapCategory.HD1, allowedMods: MODS_ONLY_HD },
      { category: OsuMapCategory.HD2, allowedMods: MODS_ONLY_HD },
      { category: OsuMapCategory.HD3, allowedMods: MODS_ONLY_HD },
      {
        category: OsuMapCategory.FM1,
        allowedMods: MODS_WITH_HD,
      },
      {
        category: OsuMapCategory.FM2,
        allowedMods: MODS_WITH_HD,
      },
      {
        category: OsuMapCategory.FM3,
        allowedMods: MODS_WITH_HD,
      },
    ],
  },
  [BotmClub.HARDROCK]: {
    id: BotmClub.HARDROCK,
    title: "Hardrock Клуб",
    skillsets: [
      { category: OsuMapCategory.HR1, allowedMods: MODS_ONLY_HR },
      { category: OsuMapCategory.HR2, allowedMods: MODS_ONLY_HR },
      { category: OsuMapCategory.HR3, allowedMods: MODS_ONLY_HR },
      {
        category: OsuMapCategory.FM1,
        allowedMods: MODS_WITH_HR,
      },
      {
        category: OsuMapCategory.FM2,
        allowedMods: MODS_WITH_HR,
      },
      {
        category: OsuMapCategory.FM3,
        allowedMods: MODS_WITH_HR,
      },
    ],
  },
};

export const OSU_MODS_FLAGS = {
  None: 0,
  NoFail: 1,
  Easy: 2,
  TouchDevice: 4,
  Hidden: 8,
  HardRock: 16,
  SuddenDeath: 32,
  DoubleTime: 64,
  Relax: 128,
  HalfTime: 256,
  Nightcore: 512,
  Flashlight: 1024,
  SpunOut: 4096,
};
