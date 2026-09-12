#define TOTAL_RAM 2048UL
#define BENCHMARK_RUNS 1000UL
int freeRAM()
{
  extern int __heap_start, *__brkval;

  int v;

  if (__brkval == 0)
  {
    return ((int)&v) - ((int)&__heap_start);
  }
  else
  {
    return ((int)&v) - ((int)__brkval);
  }
}
void showRAM()
{
  int freeMemory = freeRAM();

  if (freeMemory < 0)
    freeMemory = 0;

  unsigned long usedMemory =
    TOTAL_RAM - (unsigned long)freeMemory;

  float ramUsage =
    (usedMemory * 100.0) / TOTAL_RAM;

  Serial.println();
  Serial.println("[RAM UTILIZATION]");
  Serial.println("--------------------------------");

  Serial.print("Total SRAM : ");
  Serial.print(TOTAL_RAM);
  Serial.println(" bytes");

  Serial.print("Used SRAM  : ");
  Serial.print(usedMemory);
  Serial.println(" bytes");

  Serial.print("Free SRAM  : ");
  Serial.print(freeMemory);
  Serial.println(" bytes");

  Serial.print("RAM Usage  : ");
  Serial.print(ramUsage, 2);
  Serial.println("%");

  Serial.println("xoxoxoxoxoxoxoxoxoxoxoxoxoxoxoxo");
}
// RED
unsigned long redSum(
  unsigned long N,
  unsigned long *operations)
{
  unsigned long sum = 0;

  *operations = 0;

  for (unsigned long i = 1; i <= N; i++)
  {
    sum = sum + i;
    (*operations)++;
  }

  return sum;
}
// Green
unsigned long greenSum(
  unsigned long N,
  unsigned long *operations)
{
  *operations = 1;

  return (N * (N + 1UL)) / 2UL;
}
// CPU benchmark
void benchmarkCPU(unsigned long N)
{
  unsigned long result;

  unsigned long operations;

  unsigned long redStart;
  unsigned long greenStart;

  unsigned long redTime;
  unsigned long greenTime;

  unsigned long redTotalOperations;
  unsigned long greenTotalOperations;

  volatile unsigned long preventOptimization;


  // ========================================================
  // RED CPU BENCHMARK
  // ========================================================

  redStart = micros();

  redTotalOperations = 0;

  for (unsigned long run = 0;
       run < BENCHMARK_RUNS;
       run++)
  {
    result = redSum(N, &operations);

    redTotalOperations += operations;

    preventOptimization = result;
  }

  redTime = micros() - redStart;


  // ========================================================
  // GREEN CPU BENCHMARK
  // ========================================================

  greenStart = micros();

  greenTotalOperations = 0;

  for (unsigned long run = 0;
       run < BENCHMARK_RUNS;
       run++)
  {
    result = greenSum(N, &operations);

    greenTotalOperations += operations;

    preventOptimization = result;
  }

  greenTime = micros() - greenStart;


  // ========================================================
  // CPU UTILIZATION
  // ========================================================
  //
  // We use a 1-second reference window.
  //
  // CPU Utilization =
  // benchmark execution time / 1 second × 100
  //
  // 1 second = 1,000,000 microseconds
  // ========================================================

  float redCPU =
    (redTime * 100.0) / 1000000.0;

  float greenCPU =
    (greenTime * 100.0) / 1000000.0;


  // ========================================================
  // DISPLAY
  // ========================================================

  Serial.println();
  Serial.println();
  Serial.println("================================================");
  Serial.print("              N = ");
  Serial.println(N);
  Serial.println("================================================");


  // ========================================================
  // RED
  // ========================================================

  Serial.println();
  Serial.println("[RED ALGORITHM]");
  Serial.println("--------------------------------");

  Serial.println("Method       : Repeated Addition");
  Serial.println("Complexity   : O(N)");

  Serial.print("Result       : ");
  Serial.println(result);

  Serial.print("Operations/run : ");
  Serial.println(operations);

  Serial.print("Total operations : ");
  Serial.println(redTotalOperations);

  Serial.print("Execution Time : ");
  Serial.print(redTime);
  Serial.println(" us");

  Serial.print("CPU Utilization : ");
  Serial.print(redCPU, 2);
  Serial.println("%");


  // ========================================================
  // GREEN
  // ========================================================

  Serial.println();
  Serial.println("[GREEN ALGORITHM]");
  Serial.println("--------------------------------");

  Serial.println("Method       : Mathematical Formula");
  Serial.println("Complexity   : O(1)");

  unsigned long greenResult =
    greenSum(N, &operations);

  Serial.print("Result       : ");
  Serial.println(greenResult);

  Serial.print("Operations/run : ");
  Serial.println(operations);

  Serial.print("Total operations : ");
  Serial.println(greenTotalOperations);

  Serial.print("Execution Time : ");
  Serial.print(greenTime);
  Serial.println(" us");

  Serial.print("CPU Utilization : ");
  Serial.print(greenCPU, 2);
  Serial.println("%");


  // ========================================================
  // RESULT VERIFICATION
  // ========================================================

  Serial.println();
  Serial.println("================================================");

  if (redSum(N, &operations) == greenResult)
  {
    Serial.println("RESULT CHECK : PASS");
    Serial.println("Both algorithms produce the SAME result.");
  }
  else
  {
    Serial.println("RESULT CHECK : FAIL");
  }


  // ========================================================
  // COMPARISON
  // ========================================================

  Serial.println();
  Serial.println("[EFFICIENCY COMPARISON]");
  Serial.println("--------------------------------");

  Serial.print("RED operations/run   : ");
  Serial.println(N);

  Serial.print("GREEN operations/run : ");
  Serial.println(1);

  Serial.print("RED CPU time         : ");
  Serial.print(redTime);
  Serial.println(" us");

  Serial.print("GREEN CPU time       : ");
  Serial.print(greenTime);
  Serial.println(" us");

  float operationReduction =
    ((N - 1.0) / N) * 100.0;

  Serial.print("Operation reduction  : ");
  Serial.print(operationReduction, 2);
  Serial.println("%");


  // ========================================================
  // RAM
  // ========================================================

  showRAM();


  // ========================================================
  // GREEN COMPUTING MESSAGE
  // ========================================================

  Serial.println();
  Serial.println("[GREEN COMPUTING]");
  Serial.println("--------------------------------");

  Serial.println("Same task");
  Serial.println("Same result");
  Serial.println("Fewer operations");
  Serial.println("Less computational work");
  Serial.println("Potentially lower energy consumption");

  Serial.println("================================================");
}


// ==========================================================
// SETUP
// ==========================================================

void setup()
{
  Serial.begin(9600);

  delay(1000);

  Serial.println();
  Serial.println("==============================================");
  Serial.println();
  Serial.println("          GREEN ALGORITHM LAB");
  Serial.println();
  Serial.println("              ARDUINO UNO");
  Serial.println();
  Serial.println("==============================================");

  Serial.println();

  Serial.println("HARDWARE INFORMATION");
  Serial.println("--------------------------------");
  Serial.println("Microcontroller : ATmega328P");
  Serial.println("CPU             : 8-bit AVR");
  Serial.println("Clock Speed     : 16 MHz");
  Serial.println("SRAM            : 2 KB");
  Serial.println("Language        : Arduino C++");

  Serial.println();

  Serial.println("TASK:");
  Serial.println("Calculate SUM(1 ... N)");

  Serial.println();

  Serial.println("[RED]");
  Serial.println("Repeated Addition -> O(N)");

  Serial.println();

  Serial.println("[GREEN]");
  Serial.println("Mathematical Formula -> O(1)");

  Serial.println();

  Serial.println("==============================================");

  Serial.println("SELECT TEST:");
  Serial.println("1 -> N = 100");
  Serial.println("2 -> N = 1,000");
  Serial.println("3 -> N = 10,000");
  Serial.println("4 -> N = 50,000");

  Serial.println("==============================================");

  Serial.println();
  Serial.println("Enter 1, 2, 3 or 4:");
}


// ==========================================================
// LOOP
// ==========================================================

void loop()
{
  if (Serial.available() > 0)
  {
    char input = Serial.read();

    if (input == '1')
    {
      benchmarkCPU(100);
    }
    else if (input == '2')
    {
      benchmarkCPU(1000);
    }
    else if (input == '3')
    {
      benchmarkCPU(10000);
    }
    else if (input == '4')
    {
      benchmarkCPU(50000);
    }

    Serial.println();
    Serial.println("Enter another test:");
  }
}