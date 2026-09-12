import { useEffect, useMemo, useState } from "react";
import { SerialManager } from "./serial/SerialManager";
import { parseTelemetry, type StatTelemetry } from "./telemetry/parser";
import "./App.css";

const serialManager = new SerialManager();

const SRAM_TOTAL = 2048;
const FLASH_TOTAL = 32768;
const EEPROM_TOTAL = 1024;

interface HistoryPoint {
  time: number;
  loopUs: number;
}

function App() {
  const [connected, setConnected] = useState(false);
  const [board, setBoard] = useState("Arduino UNO");
  const [mcu, setMcu] = useState("ATmega328P");
  const [clock, setClock] = useState(16_000_000);

  const [telemetry, setTelemetry] = useState<StatTelemetry | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  const connectArduino = async () => {
    try {
      setLogs((prev) => [...prev, "Requesting Arduino..."]);

      await serialManager.connect((line) => {
        setLogs((prev) => [...prev.slice(-49), line]);

        const message = parseTelemetry(line);

        if (message.type === "HELLO") {
          setBoard(message.board);
          setMcu(message.mcu);
          setClock(message.clock);
          setConnected(true);
        }

        if (message.type === "STAT") {
          setTelemetry(message.data);

          setHistory((prev) => {
            const next = [
              ...prev,
              {
                time: message.data.uptime,
                loopUs: message.data.loopUs,
              },
            ];

            return next.slice(-30);
          });
        }
      });

      setConnected(true);
    } catch (error) {
      console.error(error);

      setLogs((prev) => [
        ...prev,
        `ERROR: ${
          error instanceof Error ? error.message : "Connection failed"
        }`,
      ]);

      setConnected(false);
    }
  };

  const disconnectArduino = async () => {
    await serialManager.disconnect();

    setConnected(false);

    setLogs((prev) => [...prev, "Arduino disconnected"]);
  };

  const sramUsed = telemetry
    ? Math.max(0, SRAM_TOTAL - telemetry.sramFree)
    : 0;

  const sramPercent = (sramUsed / SRAM_TOTAL) * 100;

  const loopRate = telemetry?.loopUs
    ? 1_000_000 / telemetry.loopUs
    : 0;

  const avgLoopUs = useMemo(() => {
    if (history.length === 0) return 0;

    const total = history.reduce((sum, point) => sum + point.loopUs, 0);

    return total / history.length;
  }, [history]);

  const minLoopUs = useMemo(() => {
    if (history.length === 0) return 0;

    return Math.min(...history.map((point) => point.loopUs));
  }, [history]);

  const maxLoopUs = useMemo(() => {
    if (history.length === 0) return 0;

    return Math.max(...history.map((point) => point.loopUs));
  }, [history]);

  const status = !connected
    ? "DISCONNECTED"
    : telemetry
      ? "HEALTHY"
      : "CONNECTING";

  return (
    <div className="app-shell">
      {/* TOP BAR */}
      <header className="topbar">
        <div>
          <div className="brand">AVRScope</div>
          <div className="subtitle">
            Embedded System Performance Monitor
          </div>
        </div>

        <div className="connection-area">
          <div
            className={`connection-indicator ${
              connected ? "online" : "offline"
            }`}
          >
            <span className="status-dot" />
            {connected ? "Arduino Connected" : "Arduino Disconnected"}
          </div>

          {!connected ? (
            <button className="connect-button" onClick={connectArduino}>
              Connect Arduino
            </button>
          ) : (
            <button className="disconnect-button" onClick={disconnectArduino}>
              Disconnect
            </button>
          )}
        </div>
      </header>

      <main className="dashboard">
        {/* HERO */}
        <section className="hero-grid">
          {/* BOARD */}
          <div className="panel board-panel">
            <div className="panel-header">
              <div>
                <span className="eyebrow">HARDWARE</span>
                <h2>{board}</h2>
              </div>

              <div className="chip-badge">{mcu}</div>
            </div>

            <div className="board-container">
              <div className="arduino-board">
                <div className="usb-port">
                  USB
                </div>

                <div className="board-label">
                  <strong>ARDUINO</strong>
                  <span>UNO</span>
                </div>

                <div className="microcontroller">
                  <span>ATmega328P</span>
                  <small>16 MHz</small>
                </div>

                <div className="board-power">
                  <span className="power-led" />
                  POWER
                </div>

                <div className="board-led">
                  <span className="led-dot" />
                  L
                </div>

                <div className="digital-header">
                  {Array.from({ length: 14 }, (_, index) => (
                    <Pin
                      key={`D${index}`}
                      label={`D${index}`}
                      active={index === 13}
                    />
                  ))}
                </div>

                <div className="analog-header">
                  {Array.from({ length: 6 }, (_, index) => (
                    <Pin
                      key={`A${index}`}
                      label={`A${index}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SYSTEM */}
          <div className="panel system-panel">
            <div className="panel-header">
              <div>
                <span className="eyebrow">SYSTEM</span>
                <h2>Runtime Status</h2>
              </div>

              <span
                className={`health-badge ${
                  status === "HEALTHY" ? "healthy" : "neutral"
                }`}
              >
                {status}
              </span>
            </div>

            <div className="metric-grid">
              <Metric
                label="CPU Clock"
                value={`${(clock / 1_000_000).toFixed(0)} MHz`}
              />

              <Metric
                label="Uptime"
                value={
                  telemetry
                    ? `${(telemetry.uptime / 1000).toFixed(2)} s`
                    : "—"
                }
              />

              <Metric
                label="Loop Time"
                value={
                  telemetry
                    ? `${telemetry.loopUs} µs`
                    : "—"
                }
              />

              <Metric
                label="Loop Rate"
                value={
                  loopRate
                    ? `${(loopRate / 1000).toFixed(2)} kHz`
                    : "—"
                }
              />
            </div>

            <div className="runtime-info">
              <div>
                <span>MCU</span>
                <strong>{mcu}</strong>
              </div>

              <div>
                <span>Architecture</span>
                <strong>8-bit AVR</strong>
              </div>

              <div>
                <span>Serial</span>
                <strong>115200 baud</strong>
              </div>
            </div>
          </div>
        </section>

        {/* MEMORY */}
        <section>
          <div className="section-heading">
            <div>
              <span className="eyebrow">MEMORY</span>
              <h2>Resource Utilization</h2>
            </div>
          </div>

          <div className="memory-grid">
            <MemoryCard
              title="SRAM"
              total={`${SRAM_TOTAL} B`}
              used={`${sramUsed} B`}
              free={`${telemetry?.sramFree ?? "—"} B`}
              percent={sramPercent}
            />

            <MemoryCard
              title="FLASH"
              total={`${FLASH_TOTAL / 1024} KB`}
              used="Build data"
              free="Not reported"
              percent={0}
              neutral
            />

            <MemoryCard
              title="EEPROM"
              total={`${EEPROM_TOTAL / 1024} KB`}
              used="—"
              free="Available"
              percent={0}
              neutral
            />
          </div>
        </section>

        {/* PERFORMANCE */}
        <section className="panel performance-panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">PERFORMANCE</span>
              <h2>Loop Execution</h2>
            </div>

            <div className="live-label">
              <span className="status-dot online-dot" />
              LIVE
            </div>
          </div>

          <div className="chart">
            {history.length === 0 ? (
              <div className="chart-empty">
                Waiting for telemetry...
              </div>
            ) : (
              <div className="bars">
                {history.map((point, index) => {
                  const max =
                    Math.max(
                      ...history.map((item) => item.loopUs),
                      1
                    );

                  const height =
                    Math.max(
                      8,
                      (point.loopUs / max) * 100
                    );

                  return (
                    <div
                      className="bar-wrapper"
                      key={`${point.time}-${index}`}
                      title={`${point.loopUs} µs`}
                    >
                      <div
                        className="bar"
                        style={{
                          height: `${height}%`,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="performance-stats">
            <Metric
              label="Current"
              value={
                telemetry
                  ? `${telemetry.loopUs} µs`
                  : "—"
              }
            />

            <Metric
              label="Average"
              value={
                avgLoopUs
                  ? `${avgLoopUs.toFixed(1)} µs`
                  : "—"
              }
            />

            <Metric
              label="Minimum"
              value={
                minLoopUs
                  ? `${minLoopUs} µs`
                  : "—"
              }
            />

            <Metric
              label="Maximum"
              value={
                maxLoopUs
                  ? `${maxLoopUs} µs`
                  : "—"
              }
            />
          </div>
        </section>

        {/* GPIO */}
        <section className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">GPIO</span>
              <h2>Digital Pins</h2>
            </div>

            <span className="panel-note">
              ATmega328P I/O
            </span>
          </div>

          <div className="gpio-grid">
            {Array.from({ length: 14 }, (_, index) => {
              const capabilities: Record<number, string> = {
                0: "RX",
                1: "TX",
                2: "DIGITAL",
                3: "PWM",
                4: "DIGITAL",
                5: "PWM",
                6: "PWM",
                7: "DIGITAL",
                8: "DIGITAL",
                9: "PWM",
                10: "SPI SS",
                11: "SPI MOSI",
                12: "SPI MISO",
                13: "LED / SPI SCK",
              };

              return (
                <div
                  className={`gpio-card ${
                    index === 13 ? "active-pin" : ""
                  }`}
                  key={index}
                >
                  <div className="gpio-number">
                    D{index}
                  </div>

                  <div className="gpio-capability">
                    {capabilities[index]}
                  </div>

                  <div className="gpio-state">
                    {index === 13 ? "OUTPUT" : "AVAILABLE"}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SERIAL */}
        <section className="panel serial-panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">SERIAL</span>
              <h2>Telemetry Stream</h2>
            </div>

            <span className="panel-note">
              115200 baud
            </span>
          </div>

          <div className="serial-console">
            {logs.length === 0 ? (
              <div className="console-empty">
                Connect an Arduino to begin receiving telemetry.
              </div>
            ) : (
              logs.map((log, index) => (
                <div
                  className="console-line"
                  key={`${index}-${log}`}
                >
                  <span className="console-prefix">
                    &gt;
                  </span>
                  {log}
                </div>
              ))
            )}
          </div>
        </section>

        {/* EVENTS */}
        <section className="panel events-panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">EVENTS</span>
              <h2>System Events</h2>
            </div>
          </div>

          <div className="event">
            <span className="event-indicator info" />
            <div>
              <strong>
                {connected
                  ? "Arduino telemetry active"
                  : "Waiting for Arduino"}
              </strong>
              <span>
                {connected
                  ? "AVRScope is receiving live telemetry."
                  : "Connect the UNO to start monitoring."}
              </span>
            </div>
          </div>

          {telemetry && (
            <div className="event">
              <span className="event-indicator info" />

              <div>
                <strong>
                  Telemetry updated
                </strong>

                <span>
                  SRAM and loop metrics received from
                  ATmega328P.
                </span>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function MemoryCard({
  title,
  total,
  used,
  free,
  percent,
  neutral = false,
}: {
  title: string;
  total: string;
  used: string;
  free: string;
  percent: number;
  neutral?: boolean;
}) {
  return (
    <div className="memory-card">
      <div className="memory-top">
        <div>
          <span className="eyebrow">
            {title}
          </span>

          <h3>{total}</h3>
        </div>

        <span className="memory-percent">
          {neutral
            ? "—"
            : `${percent.toFixed(1)}%`}
        </span>
      </div>

      <div className="memory-bar">
        <div
          className={`memory-fill ${
            neutral ? "neutral-fill" : ""
          }`}
          style={{
            width: neutral
              ? "0%"
              : `${Math.min(percent, 100)}%`,
          }}
        />
      </div>

      <div className="memory-details">
        <div>
          <span>Used</span>
          <strong>{used}</strong>
        </div>

        <div>
          <span>Free</span>
          <strong>{free}</strong>
        </div>
      </div>
    </div>
  );
}

function Pin({
  label,
  active = false,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <div className={`board-pin ${active ? "pin-active" : ""}`}>
      <span />
      {label}
    </div>
  );
}

export default App;