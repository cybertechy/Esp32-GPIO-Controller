#include <Constants.hpp>
#include "Web.hpp"


void Main_Page_Handler(AsyncWebServerRequest *request)
{
  // Create Iterator to iterate through the list of SSID's
  std::list<String>::iterator i = networkList.begin();

  // HTML code for the main page
  String html = "<!doctype html>\n<html>\n";
  html += "<head>\n";
  html += "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n";
  html += "<title>ESP32 Web Server</title>\n";
  html += "<style>\n";
  html += "html { font-family: Helvetica; display: inline-block; margin: 0px auto; text-align: center;}\n";
  html += "body{margin-top: 50px;} h1 {color: #444444;margin: 50px auto 30px;} h3 {color: #444444;margin-bottom: 50px;}";
  html += "select {width: 90%;padding: 16px 20px;border: none;border-radius: 4px;background-color: #f1f1f1;}";
  html += ".button {background-color: #4CAF50;border: none;color: white;padding: 16px 20px;text-decoration: none;font-size: 16px;margin: 4px 2px;cursor: pointer;}";
  html += ".password{ width: 80%;padding: 16px 20px;border: none;border-radius: 4px;background-color: #f1f1f1;}";
  html += "p {font-size: 14px;color: #888;margin-bottom: 10px;}";
  html += "</style>\n";
  html += "</head>\n";
  html += "<body>\n";
  html += "<h1> Connect to Wifi </h1>";

  if (WifiStats == 1)
    html += "<h3> Connection Timed out </h3>";
  if (WifiStats == 2)
    html += "<h3> Connecting ... </h3>";

  html += "<form action=\"/credentials\" method=\"POST\">";
  html += "<br/>";
  html += "<select id=\"networks\" name=\"networks\">";

  while (i != networkList.end())
  {
    html += "<option value=\"" + *i + "\">" + *i + "</option>";
    i++;
  }

  if (networkList.size() == 0)
    html += "<option disabled value=\"\">No Networks Found</option>";
  html += "</select>";
  html += "<br/>";
  html += "<br/>";
  if (networkList.size() != 0)
    html += "<input class=\"password\" type=\"text\" name=\"password\" placeholder=\"Password\">";
  html += "<br/>";
  html += "<br/>";
  if (networkList.size() != 0)
    html += "<input class=\"button\" type=\"submit\" value=\"Connect\">";
  html += "</form>";
  html += "</body>\n";
  html += "</html>\n";

  // Response
  AsyncWebServerResponse *response = request->beginResponse(200, "text/html", html);

  // Headers to prevent caching of the page
  response->addHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  response->addHeader("Pragma", "no-cache");
  response->addHeader("Expires", "-1");
  response->addHeader("Connection", "Keep-Alive");
  response->addHeader("Keep-Alive", "timeout=5, max=100");

  // Send Response
  request->send(response);
}

void handleCredentials(AsyncWebServerRequest *request)
{
  // Get the credentials from the form
  StationAP.ssid = request->arg("networks");
  StationAP.password = request->arg("password");
  WifiStats = 2;

   // Redirect to the main page
  request->redirect("/");

  // Connect to the access point using thread
  std::thread t(connectToAccessPoint, StationAP.ssid, StationAP.password);

  // Detach the thread
  t.detach();
}

void handle_mainpage_afterConnection(AsyncWebServerRequest *request)
{
  String html = "<!doctype html>\n<html>\n";
  html += "<head>\n";
  html += "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n";
  html += "<title>ESP32 Web Server</title>\n";
  html += "<style>\n";
  html += "html { font-family: Helvetica; display: inline-block; margin: 0px auto; text-align: center;}\n";
  html += "body{margin-top: 50px;} h1 {color: #444444;margin: 50px auto 30px;} h3 {color: #444444;margin-bottom: 50px;}";
  html += ".button {display: block;width: 80px;background-color: #1abc9c;border: none;color: white;padding: 13px 30px;text-decoration: none;font-size: 25px;margin: 0px auto 35px;cursor: pointer;border-radius: 4px;}";
  html += ".button-on {background-color: #1abc9c;}";
  html += ".button-on:active {background-color: #16a085;}";
  html += ".button-off {background-color: #34495e;}";
  html += ".button-off:active {background-color: #2c3e50;}";
  html += "p {font-size: 14px;color: #888;margin-bottom: 10px;}";
  html += "</style>\n";
  html += "</head>\n";
  html += "<body>\n";
  html += "<h1> Connected to Wifi </h1>";
  html += "<h3> SSID: " + WiFi.SSID() + "</h3>";
  html += "<h3> IP Address: " + WiFi.localIP().toString() + "</h3>";
  html += "<br/>";
  html += "</body>\n";
  html += "</html>\n";

  // Response
  AsyncWebServerResponse *response = request->beginResponse(200, "text/html", html);

  // Headers to prevent caching of the page
  response->addHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  response->addHeader("Pragma", "no-cache");
  response->addHeader("Expires", "-1");
  response->addHeader("Connection", "Keep-Alive");
  response->addHeader("Keep-Alive", "timeout=5, max=100");

  // Send Response
  request->send(response);
}

/******************************************/
/*           STA Routes                  */
/*****************************************/


void configureRoutes()
{
  asyncServer.on("/", HTTP_GET, handle_mainpage_afterConnection).setFilter(ON_STA_FILTER);

  // server.on("/api/establishConnection", establishConnection);
  asyncServer.on("/api/establishConnection", HTTP_GET, establishConnection);

  // server.on("/api/getStatus", getStatus);
  asyncServer.on("/api/getStatus", HTTP_GET, getStatus);

  // server.on("/api/gpio/all", getAllGPIOStatus);
  asyncServer.on("/api/gpio/all", HTTP_GET, getAllGPIOStatus);

  // server.on("/api/gpio", UpdateGPIO);
  asyncServer.on("/api/gpio", HTTP_OPTIONS, OptionsHeaders);
  // asyncServer.onRequestBody(UpdateGPIO);
  asyncServer.on("/api/gpio", HTTP_POST, UpdateGPIO);

  // server.on("/api/test", test);
  asyncServer.on("/api/test", HTTP_GET, test);

}

void configureHeaders(AsyncWebServerResponse *response)
{
  if (response == NULL)
    return;

  // Content Type
  response->addHeader("Content-Type", "application/json");

  // Origin and Methods
  response->addHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  response->addHeader("Access-Control-Allow-Origin", "*");
  response->addHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");

  // Remove Cache
  response->addHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  response->addHeader("Pragma", "no-cache");
  response->addHeader("Expires", "-1");
}

void OptionsHeaders(AsyncWebServerRequest *request)
{
  AsyncResponseStream *response = request->beginResponseStream("text/plain");

  response->addHeader("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
  response->addHeader("Access-Control-Allow-Origin", "*");
  response->addHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");

  request->send(response);
}

void establishConnection(AsyncWebServerRequest *request)
{
  AsyncResponseStream *response = request->beginResponseStream("application/json");

  configureHeaders(response);

  StaticJsonDocument<1024> doc;

  doc["status"] = "success";
  doc["Code"] = 200;
  doc["ssid"] = StationAP.ssid;
  doc["ip"] = WiFi.localIP().toString();

  String responseString;
  serializeJson(doc, responseString);

  response->print(responseString);
  request->send(response);
}

void getStatus(AsyncWebServerRequest *request)
{
  AsyncResponseStream *response = request->beginResponseStream("application/json");

  configureHeaders(response);

  StaticJsonDocument<1024> doc;

  doc["ssid"] = StationAP.ssid;
  doc["ip"] = WiFi.localIP().toString();
  doc["mac"] = WiFi.macAddress();
  doc["rssi"] = WiFi.RSSI();
  doc["code"] = 201;

  String responseString;
  serializeJson(doc, responseString);

  response->print(responseString);
  request->send(response);
}

void getAllGPIOStatus(AsyncWebServerRequest *request)
{
  AsyncResponseStream *response = request->beginResponseStream("application/json");

  configureHeaders(response);

  DynamicJsonDocument doc(1400);

  std::list<int>::iterator it = GPIOList.begin();

  // check if the pins support adc
  while (it != GPIOList.end())
  {
    doc[String(*it)]["DR"] = digitalRead(*it);
    doc[String(*it)]["AR"] = *it < 40 && *it > 31 ? map(analogRead(*it), 0, 4095, 0, 100) : 0;
    it++;
  }

  String responseString;
  serializeJson(doc, responseString);

  response->print(responseString);
  request->send(response);
}

void UpdateGPIO(AsyncWebServerRequest *request)
{
 

  AsyncResponseStream *response = request->beginResponseStream("application/json");

  configureHeaders(response);

  //Default Values
  int pin = -1;
  int DW = 0;
  int AW = 0;
  bool Digital = false;
  bool Analog = false;

  //Get all parmas
  int params = request->params();

  for (int i = 0; i < params; i++)
  {
    AsyncWebParameter *p = request->getParam(i);

    if (p->name() == "pin")
      pin = p->value().toInt();
    else if (p->name() == "DW")
      DW = p->value().toInt();
    else if (p->name() == "AW")
      AW = p->value().toInt();
    else if (p->name() == "Digital")
      Digital = p->value().toInt();
    else if (p->name() == "Analog")
      Analog = p->value().toInt();
  }

  // print the values to the serial monitor
  Serial.println("Pin: " + String(pin));
  Serial.println("DW: " + String(DW));
  Serial.println("AW: " + String(AW));
  Serial.println("Digital: " + String(Digital));
  Serial.println("Analog: " + String(Analog));



  StaticJsonDocument<1024> Json;
  String responseString;

  if (pin < 0 || pin > 39)
  {
    Json["status"] = "error";
    Json["code"] = 200;
    Json["message"] = "Invalid GPIO Pin";

    serializeJson(Json, responseString);
    response->print(responseString);
    request->send(response);
    return;
  }

  if(Digital && Analog)
  {
    Json["status"] = "error";
    Json["code"] = 200;
    Json["message"] = "Analog and Digital cannot be true at the same time";

    serializeJson(Json, responseString);
    response->print(responseString);
    request->send(response);
    return;
  }

  if (Digital || Analog)
    pinMode(pin, OUTPUT);

  if ((DW && Digital) || (DW == 0 && Digital))
  {
    digitalWrite(pin, DW);
  }
  else if (!Digital && DW)
  {
    Json["status"] = "error";
    Json["code"] = 200;
    Json["message"] = "Digital cannot be false when DW is non zero";

    serializeJson(Json, responseString);
    response->print(responseString);
    request->send(response);
    return;
  }

  if ((AW && Analog) || (AW == 0 && Analog))
  {
    analogWrite(pin, map(AW, 0, 100, 0, 4095));
  }
  else if (!Analog && AW)
  {
    Json["status"] = "error";
    Json["code"] = 200;
    Json["message"] = "Analog cannot be false when AW is non zero";

    serializeJson(Json, responseString);
    response->print(responseString);
    request->send(response);
    return;
  }
  
  if (Analog == false && Digital == false)
    pinMode(pin, INPUT);

  Json["status"] = "success";
  Json["code"] = 200;

  serializeJson(Json, responseString);

  response->print(responseString);

  // Send the response

  request->send(response);
}

void test(AsyncWebServerRequest *request)
{
  AsyncResponseStream *response = request->beginResponseStream("application/json");

  configureHeaders(response);

  DynamicJsonDocument doc(1024);
  String responseString;

  doc["status"] = "success";
  doc["code"] = 200;
  doc["message"] = "Test Successful";

  Serial.println(adcAttachPin(23));
  Serial.println(adcAttachPin(25));
  Serial.println(analogRead(25));

  serializeJson(doc, responseString);

  response->print(responseString);
  request->send(response);
}
