/*
 ============================================================
             GREEN ALGORITHM DEMONSTRATION
                    ARDUINO UNO
 ============================================================

 Task:
 Calculate the sum of numbers from 1 to N.

 RED   : Iterative Sum       O(N)
 GREEN : Mathematical Formula O(1)

 RED:
     1 + 2 + 3 + ... + N

 GREEN:
     N * (N + 1) / 2

 We compare:
     - Number of operations
     - Execution time
     - Computational load

 NOTE:
 This demonstrates computational efficiency.
 Actual electrical energy requires current measurement.
 ============================================================
*/


// ------------------------------------------------------------
// RED ALGORITHM
// Iterative calculation
// Complexity: O(N)
// ------------------------------------------------------------

unsigned long long nonGreenSum(
  unsigned long N,
  unsigned long *operations
)
{
  unsigned long long sum = 0;

  *operations = 0;

  for (unsigned long i = 1; i <= N; i++)
  {
    sum = sum + i;

    (*operations)++;
  }

  return sum;
}


// ------------------------------------------------------------
// GREEN ALGORITHM
// Mathematical formula
// Complexity: O(1)
// ------------------------------------------------------------

unsigned long long greenSum(
  unsigned long N,
  unsigned long *operations
)
{
  *operations = 1;

  return ((unsigned long long)N * (N + 1)) / 2;
}


// ------------------------------------------------------------
// Print computational load bar
// ------------------------------------------------------------

void printLoad(unsigned long operations)
{
  unsigned int bars;

  if (operations >= 1000)
  {
    bars = 40;
  }
  else
  {
    bars = operations / 25;

    if (bars < 1)
    {
      bars = 1;
    }
  }

  for (unsigned int i = 0; i < bars; i++)
  {
    Serial.print("#");
  }

  Serial.println();
}


// ------------------------------------------------------------
// Benchmark
// ------------------------------------------------------------

void benchmark(unsigned long N)
{
  unsigned long redOperations;
  unsigned long greenOperations;

  unsigned long redTime;
  unsigned long greenTime;

  unsigned long long redResult;
  unsigned long long greenResult;

  unsigned long start;


  // ==========================================================
  // RED ALGORITHM
  // ==========================================================

  start = micros();

  redResult =
    nonGreenSum(N, &redOperations);

  redTime =
    micros() - start;


  // ==========================================================
  // GREEN ALGORITHM
  // ==========================================================

  start = micros();

  greenResult =
    greenSum(N, &greenOperations);

  greenTime =
    micros() - start;


  // ==========================================================
  // DISPLAY
  // ==========================================================

  Serial.println();
  Serial.println("==============================================");
  Serial.println("       GREEN COMPUTING BENCHMARK");
  Serial.println("==============================================");

  Serial.print("N = ");
  Serial.println(N);

  Serial.println();


  // ==========================================================
  // NON-GREEN
  // ==========================================================

  Serial.println("[RED] NON-GREEN ALGORITHM");
  Serial.println("----------------------------------------------");

  Serial.println("Method       : Repeated addition");
  Serial.println("Complexity   : O(N)");

  Serial.print("Result       : ");
  Serial.println((unsigned long)redResult);

  Serial.print("Operations   : ");
  Serial.println(redOperations);

  Serial.print("CPU time     : ");
  Serial.print(redTime);
  Serial.println(" us");

  Serial.print("Load         : ");
  printLoad(redOperations);

  Serial.println();


  // ==========================================================
  // GREEN
  // ==========================================================

  Serial.println("[GREEN] ENERGY-EFFICIENT ALGORITHM");
  Serial.println("----------------------------------------------");

  Serial.println("Method       : Mathematical formula");
  Serial.println("Complexity   : O(1)");

  Serial.print("Result       : ");
  Serial.println((unsigned long)greenResult);

  Serial.print("Operations   : ");
  Serial.println(greenOperations);

  Serial.print("CPU time     : ");
  Serial.print(greenTime);
  Serial.println(" us");

  Serial.print("Load         : ");
  printLoad(greenOperations);

  Serial.println();


  // ==========================================================
  // COMPARISON
  // ==========================================================

  Serial.println("==============================================");
  Serial.println("              COMPARISON");
  Serial.println("==============================================");

  if (redOperations > 0)
  {
    unsigned long reduction =
      ((redOperations - greenOperations) * 100UL)
      / redOperations;

    Serial.print("Operation reduction : ");
    Serial.print(reduction);
    Serial.println("%");
  }

  Serial.println();

  Serial.println("RED   : ");
  printLoad(redOperations);

  Serial.println("GREEN : ");
  printLoad(greenOperations);

  Serial.println();

  Serial.println("----------------------------------------------");

  if (redResult == greenResult)
  {
    Serial.println("RESULT VERIFIED: YES");
  }
  else
  {
    Serial.println("RESULT VERIFIED: NO");
  }

  Serial.println();

  Serial.println("GREEN COMPUTING PRINCIPLE");
  Serial.println("----------------------------------------------");
  Serial.println("Same result");
  Serial.println("Less computation");
  Serial.println("Less CPU activity");
  Serial.println("Lower computational energy demand");

  Serial.println();

  Serial.println("==============================================");
}


// ------------------------------------------------------------
// Setup
// ------------------------------------------------------------

void setup()
{
  Serial.begin(9600);

  delay(1000);

  Serial.println();
  Serial.println();
  Serial.println("==============================================");
  Serial.println("          GREEN ALGORITHM LAB");
  Serial.println("              ARDUINO UNO");
  Serial.println("==============================================");

  Serial.println();

  Serial.println("TASK:");
  Serial.println("Calculate SUM(1 ... N)");

  Serial.println();

  Serial.println("[RED]");
  Serial.println("Repeated addition -> O(N)");

  Serial.println();

  Serial.println("[GREEN]");
  Serial.println("Mathematical formula -> O(1)");

  Serial.println();

  Serial.println("Commands:");
  Serial.println("1 = N = 100");
  Serial.println("2 = N = 1000");
  Serial.println("3 = N = 10000");
  Serial.println("4 = N = 50000");

  Serial.println();

  Serial.println("Select a test...");
}


// ------------------------------------------------------------
// Main loop
// ------------------------------------------------------------

void loop()
{
  if (Serial.available() > 0)
  {
    char command = Serial.read();

    if (command == '1')
    {
      benchmark(100);
    }

    else if (command == '2')
    {
      benchmark(1000);
    }

    else if (command == '3')
    {
      benchmark(10000);
    }

    else if (command == '4')
    {
      benchmark(50000);
    }
  }
}