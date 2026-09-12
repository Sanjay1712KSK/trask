#include <Arduino.h>

unsigned long lastReport = 0;
unsigned long loopStart;
unsigned long lastLoopTime = 0;

int freeMemory() {
  extern int __heap_start, *__brkval;
  int v;
  return (int) &v - (__brkval == 0
                     ? (int) &__heap_start
                     : (int) __brkval);
}

void setup() {
  Serial.begin(115200);

  pinMode(LED_BUILTIN, OUTPUT);

  Serial.println("AVRSCOPE,UNO,ATMEGA328P");
}

void loop() {

  loopStart = micros();

  // --------------------------------
  // Developer's computation goes here
  // --------------------------------

  // Example computation
  volatile long result = 0;

  for (int i = 0; i < 100; i++) {
    result += i * i;
  }

  // --------------------------------

  lastLoopTime = micros() - loopStart;

  // Send telemetry every 500 ms
  if (millis() - lastReport >= 500) {

    lastReport = millis();

    Serial.print("STAT,");
    Serial.print(millis());
    Serial.print(",");
    Serial.print(freeMemory());
    Serial.print(",");
    Serial.print(lastLoopTime);
    Serial.println();
  }
}