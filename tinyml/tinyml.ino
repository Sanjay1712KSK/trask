float ax, ay, az;
float gx, gy, gz;

void setup() {
  Serial.begin(9600);

  pinMode(LED_BUILTIN, OUTPUT);

  Serial.println("=== UAV FLIGHT HEALTH MONITOR ===");
  Serial.println("Send: ax ay az gx gy gz");
}

void loop() {

  if (Serial.available()) {

    ax = Serial.parseFloat();
    ay = Serial.parseFloat();
    az = Serial.parseFloat();

    gx = Serial.parseFloat();
    gy = Serial.parseFloat();
    gz = Serial.parseFloat();

    float accel = sqrt(ax * ax + ay * ay + az * az);
    float gyro  = sqrt(gx * gx + gy * gy + gz * gz);

    Serial.println();
    Serial.println("---- Flight Telemetry ----");

    Serial.print("Acceleration: ");
    Serial.println(accel);

    Serial.print("Angular Rate: ");
    Serial.println(gyro);

    if (accel > 15 || gyro > 100) {

      Serial.println("STATUS: ⚠️ ANOMALY DETECTED");
      digitalWrite(LED_BUILTIN, HIGH);

    } else {

      Serial.println("STATUS: NORMAL");
      digitalWrite(LED_BUILTIN, LOW);
    }
  }
}