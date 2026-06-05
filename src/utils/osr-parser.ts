import { OSU_MODS_FLAGS } from "@/constants";
import { type IParsedOsr } from "@/types/scores";

export class OsrParser {
  private view: DataView;
  private offset: number = 0;

  constructor(buffer: ArrayBuffer) {
    this.view = new DataView(buffer);
  }

  private readByte(): number {
    const val = this.view.getUint8(this.offset);
    this.offset++;
    return val;
  }

  private readShort(): number {
    const val = this.view.getUint16(this.offset, true);
    this.offset += 2;
    return val;
  }

  private readInt(): number {
    const val = this.view.getInt32(this.offset, true);
    this.offset += 4;
    return val;
  }

  private readLong(): bigint {
    const val = this.view.getBigInt64(this.offset, true);
    this.offset += 8;
    return val;
  }

  private readULEB128(): number {
    let result = 0;
    let shift = 0;
    while (true) {
      const byte = this.readByte();
      result |= (byte & 0x7f) << shift;
      if ((byte & 0x80) === 0) break;
      shift += 7;
    }
    return result;
  }

  private readString(): string {
    const head = this.readByte();
    if (head === 0x00) return "";
    if (head !== 0x0b) throw new Error("Неверный формат строки в .osr файле");

    const length = this.readULEB128();
    if (length === 0) return "";

    const bytes = new Uint8Array(this.view.buffer, this.offset, length);
    this.offset += length;
    return new TextDecoder().decode(bytes);
  }

  private parseMods(modsFlag: number): string[] {
    const mods: string[] = [];
    if (modsFlag === OSU_MODS_FLAGS.None) return ["NM"];

    if (modsFlag & OSU_MODS_FLAGS.Hidden) mods.push("HD");
    if (modsFlag & OSU_MODS_FLAGS.HardRock) mods.push("HR");
    if (modsFlag & OSU_MODS_FLAGS.DoubleTime) mods.push("DT");
    if (modsFlag & OSU_MODS_FLAGS.Easy) mods.push("EZ");
    if (modsFlag & OSU_MODS_FLAGS.Flashlight) mods.push("FL");

    return mods.length > 0 ? mods : ["NM"];
  }

  private calculateAccuracy(
    c300: number,
    c100: number,
    c50: number,
    cMiss: number
  ): number {
    const totalHits = c300 + c100 + c50 + cMiss;
    if (totalHits === 0) return 0;
    return (c300 * 300 + c100 * 100 + c50 * 50) / (totalHits * 300);
  }

  public parse(): IParsedOsr {
    try {
      const mode = this.readByte();
      const version = this.readInt();
      const beatmapMD5 = this.readString();
      const playerName = this.readString();
      const replayMD5 = this.readString();
      const count300 = this.readShort();
      const count100 = this.readShort();
      const count50 = this.readShort();
      const countGeki = this.readShort();
      const countKatu = this.readShort();
      const countMiss = this.readShort();
      const totalScore = this.readInt();
      const maxCombo = this.readShort();
      const isPerfectCombo = this.readByte() === 1;
      const modsFlag = this.readInt();

      this.readString(); // lifeBarGraph
      const timestampTicks = this.readLong();

      const ticksSinceEpoch = timestampTicks - 621355968000000000n;
      const dateMs = Number(ticksSinceEpoch / 10000n);

      const isScoreV2 = (modsFlag & 536870912) !== 0;

      return {
        mode,
        version,
        beatmapMD5,
        playerName,
        replayMD5,
        count300,
        count100,
        count50,
        countGeki,
        countKatu,
        countMiss,
        totalScore,
        maxCombo,
        isPerfectCombo,
        modsFlag,
        parsedMods: this.parseMods(modsFlag),
        accuracy: this.calculateAccuracy(
          count300,
          count100,
          count50,
          countMiss
        ),
        date: new Date(dateMs),
        isScoreV2,
      };
    } catch (error) {
      console.error(`Ошибка при чтении .osr файла:`, error);
      throw new Error("Не удалось прочитать .osr файл. Возможно, он поврежден");
    }
  }
}
