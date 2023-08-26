#include <ESPAsyncWebServer.h>
#include <ArduinoJson.h>
#include <WiFi.h>
#include <Preferences.h>
#include <thread>

void handle_mainpage_afterConnection(AsyncWebServerRequest *request);
void Main_Page_Handler(AsyncWebServerRequest *request);
void handleCredentials(AsyncWebServerRequest *request);

/*  Routes Functions */
void establishConnection(AsyncWebServerRequest *request);
void getStatus(AsyncWebServerRequest *request);
void getAllGPIOStatus(AsyncWebServerRequest *request);
void UpdateGPIO(AsyncWebServerRequest *request);
void test(AsyncWebServerRequest *request);

/* Helper Functions */
void configureHeaders(AsyncWebServerResponse *response);
void OptionsHeaders(AsyncWebServerRequest *request);
void configureRoutes();

/* Used Constants */

#define Refferer "http://localhost:3000"


/* External Functions/Constants */
extern AsyncWebServer asyncServer;
extern struct station StationAP;
extern std::list<String> networkList;
extern Preferences preferences;
extern int connectToAccessPoint(String ssid, String password);
extern void BlinkLED(int num);
