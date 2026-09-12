export type SerialLineHandler = (line: string) => void;

export class SerialManager {
  private port: SerialPort | null = null;
  private reader: ReadableStreamDefaultReader<string> | null = null;
  private decoder: TextDecoderStream | null = null;
  private keepReading = false;

  async connect(onLine: SerialLineHandler): Promise<void> {
    if (!("serial" in navigator)) {
      throw new Error(
        "Web Serial API is not supported. Use Google Chrome or Microsoft Edge."
      );
    }

    this.port = await navigator.serial.requestPort();

    await this.port.open({
      baudRate: 115200,
    });

    this.decoder = new TextDecoderStream();

    this.port.readable?.pipeTo(this.decoder.writable);

    this.reader = this.decoder.readable.getReader();
    this.keepReading = true;

    let buffer = "";

    while (this.keepReading && this.reader) {
      const { value, done } = await this.reader.read();

      if (done) {
        break;
      }

      if (!value) {
        continue;
      }

      buffer += value;

      const lines = buffer.split("\n");

      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const cleanLine = line.trim();

        if (cleanLine.length > 0) {
          onLine(cleanLine);
        }
      }
    }
  }

  async disconnect(): Promise<void> {
    this.keepReading = false;

    try {
      await this.reader?.cancel();
    } catch {
      // Reader may already be closed.
    }

    this.reader = null;

    if (this.port) {
      try {
        await this.port.close();
      } catch {
        // Port may already be closed.
      }
    }

    this.port = null;
    this.decoder = null;
  }

  get isConnected(): boolean {
    return this.port !== null;
  }
}