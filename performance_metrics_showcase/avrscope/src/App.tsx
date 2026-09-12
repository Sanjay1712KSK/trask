import { useState } from "react";
import { SerialManager } from "./serial/SerialManager";

const serialManager = new SerialManager();

function App() {
  const [connected, setConnected] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const connectArduino = async () => {
    try {
      setLogs((prev) => [...prev, "Requesting Arduino..."]);

      await serialManager.connect((line) => {
        setLogs((prev) => [...prev.slice(-20), line]);
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
    }
  };

  const disconnectArduino = async () => {
    await serialManager.disconnect();
    setConnected(false);

    setLogs((prev) => [...prev, "Arduino disconnected"]);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "#ffffff",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>AVRScope</h1>

      <p>
        Status:{" "}
        <strong style={{ color: connected ? "#00ff88" : "#ff5555" }}>
          {connected ? "CONNECTED" : "DISCONNECTED"}
        </strong>
      </p>

      <div style={{ display: "flex", gap: "10px" }}>
        <button onClick={connectArduino}>
          Connect Arduino
        </button>

        <button onClick={disconnectArduino}>
          Disconnect
        </button>
      </div>

      <h2>Serial Telemetry</h2>

      <div
        style={{
          background: "#111",
          border: "1px solid #333",
          borderRadius: "10px",
          padding: "20px",
          marginTop: "20px",
          fontFamily: "monospace",
          whiteSpace: "pre-wrap",
        }}
      >
        {logs.length === 0
          ? "Waiting for telemetry..."
          : logs.join("\n")}
      </div>
    </div>
  );
}

export default App;