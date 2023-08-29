#include <Arduino.h>
#include <WiFi.h>
#include <list>
#include <ESPmDNS.h>
#include <Web.hpp>
#include <Constants.hpp>
#include <SerialControl.hpp>
#include <Preferences.h>


//#define SerialDebug

AsyncWebServer asyncServer(80);
Preferences preferences;

std::list<String> networkList;
struct station StationAP;

/*  Functions */
void BlinkLED(int num);
void createAccessPoint();
int connectToAccessPoint(String ssid, String password);
void configureRoutes();

// Tasks
void webServerTask(void *pvParameters);
void serialCommunicationTask(void *pvParameters);

void setup()
{
  // Serial
  Serial.setTimeout(250);
  Serial.begin(115200);
  pinMode(2, OUTPUT);


  // Parallel task to handle the serial communication
  xTaskCreate(serialCommunicationTask,"SerialCommunicationTask",10000,NULL,1,NULL);                       

  // Set the StationAP to empty
  StationAP.ssid = "";
  StationAP.password = "";

#ifdef SerialDebug

  // Wait for serial to initialize.
  while (Serial.available() == 0 && Serial.readStringUntil('\n') != "OK")
  {
  };

#endif

#ifdef PrefConfig
  preferences.begin("gpio", false); 

  StationAP.ssid = preferences.getString("ssid", "");
  StationAP.password = preferences.getString("password", "");
#endif

  // Set the WiFi mode to station and AP
  WiFi.mode(WIFI_AP_STA);

  // Setup the Access Point
  if (StationAP.ssid == "" && StationAP.password == ""){
    createAccessPoint();
  } else {
    connectToAccessPoint(StationAP.ssid, StationAP.password);
  }
  
  // Configure The Intial Routes
  webServerTask(NULL);

}
/*
Function running in loop to handle the web server requests
*/
void loop()
{
}

void webServerTask(void *pvParameters)
{

  // get List of SSID's
  if(StationAP.ssid == "" && StationAP.password == ""){
    int numOfNetworks = WiFi.scanNetworks();
    for (int i = 0; i < numOfNetworks; i++)
      networkList.push_back(WiFi.SSID(i));
  }

  asyncServer.onNotFound([](AsyncWebServerRequest *request)
                         { request->send(404, "text/plain", "The content you are looking for was not found."); });

  asyncServer.on("/", HTTP_GET, Main_Page_Handler).setFilter(ON_AP_FILTER); // Filter only for access point
  asyncServer.on("/credentials", HTTP_POST, handleCredentials).setFilter(ON_AP_FILTER);

  asyncServer.begin();
}

void serialCommunicationTask(void *pvParameters)
{
  while (1)
  {
    SerialHandler();
    delay(1); // Allow other tasks to run
  }
}

/*
Function to blink the LED (PIN 2) on esp32

500ms ON and 500ms OFF
*/

void BlinkLED(int num)
{
  for (int i = 0; i < num; i++)
  {
    digitalWrite(2, HIGH);
    delay(500);
    digitalWrite(2, LOW);
    delay(500);
  }
}

/*
Function that creates the access point
*/

void createAccessPoint()
{

  // set hostname
  WiFi.setHostname("esp32");

  // Setup the Access Point
  int status = WiFi.softAP("ESP32-Access-Point");

  // Print Access Point IP address
  Serial.println("");
  Serial.print("Access Point IP address: ");
  Serial.println(WiFi.softAPIP());

  // set dns
  if (!MDNS.begin("esp32"))
  {
    Serial.println("Error setting up MDNS responder!");
  }

  // If access point is successfully created, blink LED 2 times
  if (status == 1)
    BlinkLED(2);
}

/*
Function that connects to the access point

Returns 1 if connected and 0 if not connected
Modifies the global variable WifiStats to
1 - Connection Timeout
2 - Connecting
3 - Connected
*/

int connectToAccessPoint(String ssid, String password)
{
  int count = 0;

  Serial.printf("SSID: %s \nPassword: %s\n", ssid.c_str(), password.c_str());

  // Specify Hostname
  WiFi.setHostname("esp32.local");

  // Connect to the Access Point
  WiFi.begin(ssid, password);
  Serial.println("Intiated Connection");

  // Wait for connection
  Serial.print("Connecting ");
  WifiStats = 2;

  while (WiFi.status() != WL_CONNECTED && count < 15)
  {
    // Failed Connection
    if (WiFi.status() == WL_CONNECT_FAILED)
    {
      Serial.println("Connection Failed");
      return 0;
    }

    delay(500);
    Serial.print(".");
    count++;
  }

  // Connection Timeout
  if (count >= 15)
  {
    Serial.println("Connection Timeout");
    WifiStats = 1;
    return 0;
  }

  // set dns
  MDNS.begin("esp32");
  

  // If connected to access point, blink LED 3 times
  BlinkLED(3);

  // Print local IP address and start web server
  Serial.println("");
  Serial.println("WiFi connected.");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  // `Connected` status
  WifiStats = 3;

  if (WifiStats == 3)
  {
    // Close the SoftAP if connected
    WiFi.softAPdisconnect(true);

    // Configure the routes
    configureRoutes();

  }
  else
  {
    Serial.println("Failed to connect to Access Point");
    StationAP.ssid = "";
    StationAP.password = "";
  }

  #ifdef PrefConfig

    preferences.putString("ssid", StationAP.ssid);
    preferences.putString("password", StationAP.password);
    preferences.end();
    
  #endif

  
  return 1;
}
