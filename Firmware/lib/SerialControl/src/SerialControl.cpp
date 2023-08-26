#include <Arduino.h>
#include "SerialControl.hpp"
#include <WiFi.h>
#include <Web.hpp>
#include <Constants.hpp>

void SerialHandler()
{
  bool Acknowledge = true;
  bool Break = false;

  while (Serial)
  {
    String data = Serial.readStringUntil('\n');

    // Split data to its components
    String components[3];
    int i = 0;
    int pos = 0;
    while (data.indexOf(' ', pos) != -1 && i < 3)
    {
      int nextPos = data.indexOf(' ', pos);
      components[i] = data.substring(pos, nextPos);
      pos = nextPos + 1;
      i++;
    }
    if (i < 3)
    {
      components[i] = data.substring(pos);
    }

    // Connect to WiFi
    if(components[0]== "WIFI" && components[1] && components[2]){
      Serial.println("WIFI Connecting...");
      int status = connectToAccessPoint(components[1], components[2]);

      if(status==0){
        digitalWrite(2, HIGH);
        delay(2000);
        digitalWrite(2, LOW);
      } else {
        configureRoutes();
      }

      if(Acknowledge) Serial.println("OK");
    }

    // Disconnect from WiFi and create Access Point
    if (components[0] == "AP")
    {

      if(components[1] == "OFF" ){
        WiFi.disconnect();
        Serial.println("AP Disconnected");
        if(Acknowledge) Serial.println("OK");
        continue;
      }

      else if(components[1] == "ON") {
        Serial.println("AP Creating...");
      
        StationAP.ssid = "";
        StationAP.password = "";
        createAccessPoint();
  
        int numOfNetworks = WiFi.scanNetworks();
        for (int i = 0; i < numOfNetworks; i++) networkList.push_back(WiFi.SSID(i));
    
        if(Acknowledge) Serial.println("OK");
      } 

      else {
        if(Acknowledge) Serial.println("Invalid");
      }
      
    }

    // Acknowledgment
    if (components[0] == "Acknowledge" || components[0] == "A")
    {

      if (components[1] == "ON")
      {
        Acknowledge = true;
        Serial.println("OK");
      }
      else if (components[1] == "OFF")
      {
        Acknowledge = false;
        Serial.println("OK");
      }
      else
      {
        Serial.println("Invalid");
      }
    }

    // Break
    if (components[0] == "Break" || components[0] == "B")
    {
      Break = !Break;
      if (Acknowledge)
        Serial.println("OK");
    }

    // Version
    if (components[0] == "Version" || components[0] == "V")
    {
      Serial.printf("MECControl Esp32 %d", SerialVersion);
    }

    // AnalogPinMode / DigitalPinMode
    if (components[0] == "AnalogPinMode" || components[0] == "APM" || components[0] == "DigitalPinMode" || components[0] == "DPM")
    {

      // Check if the pin is valid
      if (components[1].toInt() >= 0 && components[1].toInt() <= 39)
      {

        if (components[2] == "INPUT" || components[2] == "I")
        {
          pinMode(components[1].toInt(), INPUT);
          if (Acknowledge)
            Serial.println("OK");
        }
        else if (components[2] == "OUTPUT" || components[2] == "O")
        {
          pinMode(components[1].toInt(), OUTPUT);
          if (Acknowledge)
            Serial.println("OK");
        }
        else if (components[2] == "INPUT_PULLUP" || components[2] == "IP")
        {
          pinMode(components[1].toInt(), INPUT_PULLUP);
          if (Acknowledge)
            Serial.println("OK");
        }
        else
        {
          if (Acknowledge)
            Serial.println(" Invalid");
        }
      }
      else
      {
        if (Acknowledge)
          Serial.println(" Invalid");
      }
    }

    // AnalogRead
    if (components[0] == "AnalogRead" || components[0] == "AR")
    {

      // Check if the pin is valid
      if (components[1].toInt() >= 0 && components[1].toInt() <= 39)
      {
        Serial.println(map(analogRead(components[1].toInt()), 0, 4095, 0, 100));
      }
      else
      {
        if (Acknowledge)
          Serial.println(" Invalid");
      }
    }

    // AnalogWrite
    if (components[0] == "AnalogWrite" || components[0] == "AW")
    {

      // Check if the pin is valid
      if (components[1].toInt() >= 0 && components[1].toInt() <= 39)
      {
        analogWrite(components[1].toInt(), map(components[2].toInt(), 0, 100, 0, 4095));
        if (Acknowledge)
          Serial.println("OK");
      }
      else
      {
        if (Acknowledge)
          Serial.println(" Invalid");
      }
    }

    // DigitalRead
    if (components[0] == "DigitalRead" || components[0] == "DR")
    {

      // Check if the pin is valid
      if (components[1].toInt() >= 0 && components[1].toInt() <= 39)
      {
        Serial.println(digitalRead(components[1].toInt()));
      }
      else
      {
        if (Acknowledge)
          Serial.println(" Invalid");
      }
    }

    // DigitalWrite
    if (components[0] == "DigitalWrite" || components[0] == "DW")
    {

      // Check if the pin is valid
      if (components[1].toInt() >= 0 && components[1].toInt() <= 39)
      {

        if (components[2] == "HIGH" || components[2] == "H")
        {
          digitalWrite(components[1].toInt(), HIGH);
          if (Acknowledge)
            Serial.println("OK");
        }
        else if (components[2] == "LOW" || components[2] == "L")
        {
          digitalWrite(components[1].toInt(), LOW);
          if (Acknowledge)
            Serial.println("OK");
        }
        else
        {
          if (Acknowledge)
            Serial.println(" Invalid");
        }
      }
      else
      {
        if (Acknowledge)
          Serial.println(" Invalid");
      }
    }
  }
}
