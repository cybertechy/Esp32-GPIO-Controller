#define SerialVersion 1
#include <Arduino.h>
#include <WiFi.h>
#include <list>

void SerialHandler();

extern int connectToAccessPoint(String ssid, String password);
extern void BlinkLED(int num);
extern void configureRoutes();
extern void createAccessPoint();
extern void webServerTask(void *pvParameters);
extern struct station StationAP;
extern std::list<String> networkList;