export interface StatTelemetry {
  uptime: number;
  sramFree: number;
  loopUs: number;
}

export type TelemetryMessage =
  | {
      type: "HELLO";
      board: string;
      mcu: string;
      clock: number;
    }
  | {
      type: "STAT";
      data: StatTelemetry;
    }
  | {
      type: "RAW";
      line: string;
  };

export function parseTelemetry(line: string): TelemetryMessage {
  const parts = line.trim().split("|");

  if (parts[0] !== "AVRSCOPE") {
    return {
      type: "RAW",
      line,
    };
  }

  if (parts[1] === "HELLO") {
    return {
      type: "HELLO",
      board: parts[2] ?? "Unknown",
      mcu: parts[3] ?? "Unknown",
      clock: Number(parts[4] ?? 0),
    };
  }

  if (parts[1] === "STAT") {
    const values: Record<string, string> = {};

    for (const part of parts.slice(2)) {
      const [key, value] = part.split("=");

      if (key && value !== undefined) {
        values[key] = value;
      }
    }

    return {
      type: "STAT",
      data: {
        uptime: Number(values.UPTIME ?? 0),
        sramFree: Number(values.SRAM_FREE ?? 0),
        loopUs: Number(values.LOOP_US ?? 0),
      },
    };
  }

  return {
    type: "RAW",
    line,
  };
}