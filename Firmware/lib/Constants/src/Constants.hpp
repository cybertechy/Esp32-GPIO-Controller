#include <Arduino.h>
#include <list>

#ifndef Esp32_Main_Constants
#define Esp32_Main_Constants

#define PrefConfig

struct station
{
  String ssid;
  String password;
};

extern struct station StationAP;
extern std::list<String> networkList;
static int WifiStats = 0;

// All GPIO Pins list
static std::list<int> GPIOList = {1, 2, 3, 4, 5, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 25, 26, 27, 32, 33, 34, 35, 36, 39};
#endif