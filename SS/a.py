import serial
import time

PORT = "COM5"
BAUDRATE = 9600

arduino = serial.Serial(PORT, BAUDRATE, timeout=1)

time.sleep(2)

print("""
╔════════════════════════════════════════╗
║       ARDUINO CONTROL TERMINAL         ║
╠════════════════════════════════════════╣
║  Arduino UNO Command Interface         ║
╚════════════════════════════════════════╝

Type 'help' for available commands.
""")

while True:

    command = input("arduino> ")

    if command.lower() == "exit":
        print("Closing connection...")
        break

    arduino.write((command + "\n").encode())

    time.sleep(0.1)

    while arduino.in_waiting:

        response = arduino.readline().decode(errors="ignore").strip()

        if response:
            print(response)

arduino.close()