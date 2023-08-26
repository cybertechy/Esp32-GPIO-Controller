# ESP32 Firmware

## Introduction

This is the firmware for the ESP32 microcontroller. This firmware is designed to be used with the Website.

## Getting Started

### Pre-requisites

1. Install PlatformIO: PlatformIO is an open-source ecosystem for IoT development that provides a unified interface for building and flashing firmware onto a variety of microcontrollers, including the ESP32. You can download and install PlatformIO from the official website: https://platformio.org/install.


2. Install the ESP32 platform: PlatformIO provides support for a wide range of microcontrollers, including the ESP32. To use PlatformIO with the ESP32, you need to install the ESP32 platform. You can do this by opening the PlatformIO Home screen, clicking on "Platforms", and searching for "esp32". Click on the "Install" button to install the ESP32 platform

3. Connect the ESP32 to your computer: To flash firmware onto the ESP32, you need to connect it to your computer using a USB cable.

### Installation Procedure
1. Create a new PlatformIO project: Open PlatformIO and create a new project by clicking on "New Project". Select the ESP32 platform and choose a board that matches your ESP32 hardware.

2. Copy the firmware source code into the project.

3. Build the firmware: Use the PlatformIO build command to compile the firmware source code into a binary file. This can be done by opening the PlatformIO terminal and running the command `pio run`.

4. Flash the firmware onto the ESP32: Use the PlatformIO upload command to flash the firmware binary file onto the ESP32. This can be done by running the command `pio run -t upload`.

## Web Control

The by default Mode of this firmware is Web Control. In this mode the ESP32 acts as a Web Server and the user can control the ESP32 using the Website.

### Starting the Web Control

Once the firmware has been flashed onto the ESP32, the ESP32 will start in Web Control Mode. 

The Web Wifi portal is intiated by default to connect to a Wifi Network. For this the Access Point Name is `ESP32-Access-Point` And once this turns on the built-in LED will blink 2 times. The user can connect to this Access Point and enter the Wifi Credentials. Once the ESP32 connects to the Wifi Network the Built-in LED will blink 3 times.

### Web Server

The ESP32 acts as a Web Server and serves the Website. The ESP32 can be accessed by the IP Address Displayed on the Serial Monitor or by the Hostname `esp32.local`.

When in Access Point Mode the ESP32 can be accessed by the IP Address `192.168.4.1` or by the Hostname `esp32.local`.

### Web Client

This Mode is activated once the ESP32 has been connected to a Wifi Network. In this mode the ESP32 acts as a Web Client and sends the data to the Website or User.


### Web Endpoints


#### Access Point Mode

- **Wifi Credentials**

    - *Endpoint*: `/`
    - *Description*: This endpoint is used to send the Wifi Credentials to the ESP32.
    - *Method*: `GET`
    - *Parameters*: `ssid`, `password`
    - *Response*: Connects to the Wifi Network

#### Web Client Mode

- ** Current State**

    - *Endpoint*: `/`
    - *Description*: This endpoint is used to get the current IP Address of the ESP32 and connected SSID. Served as a HTML Page.
    - *Method*: `GET`
    - *Parameters*: None
    - *Response*: `{"state":<state>}`

##### API Endpoints

- **IP Info**

    - *Endpoint*: `/api/establishConnection`
    - *Description*: This endpoint is used to get the current IP Address of the ESP32 and connected SSID.
    - *Method*: `GET`
    - *Parameters*: None
    - *Response*: `{"status": "success","Code": 200,"ssid": <SSID>,"ip": <IP>}`

- **Wifi Connection Info**

    - *Endpoint*: `/api/getStatus`
    - *Description*: This endpoint is used to get the current Wifi Connection Info of the ESP32.
    - *Method*: `GET`
    - *Parameters*: None
    - *Response*: `{"ssid": <SSID>,"ip": <IP>,"mac":<mac>,"rssi": <RSSI>,"Code": 200}`

- **GPIO Pins State*
  
      - *Endpoint*: `/api/gpio/all`
      - *Description*: This endpoint is used to get the current state of all GPIO Pins.
      - *Method*: `GET`
      - *Parameters*: None
      - *Response*: `{<PIN>:{"AR":<AR>,"DR":<DR"}}`

- **Set GPIO State**

    - *Endpoint*: `/api/gpio`
    - *Description*: This endpoint is used to set the state of the GPIO Pin.
    - *Method*: `POST`
    - *Parameters*: `{"pin": <pin>,"DW": <DW>,"AW": <AW>,"Digital": true/false ,"Analog": true/false}`
    - *Response*: `{"status": "success","Code": 200,"pin": <pin>,"mode": <mode>,"value": <value>}`




## Serial Control 

This firmware is designed In order to Enable the user to Control the ESP32 with the Serial Monitor.

Serial Baud Rate: 115200

### Commands

- **Acknowledge**

  - *Command*: `Acknowledge` or `A`
  - *Description*: This command sets whether to acknowledge the Serial commands or not with OK.
  - *Parameters*: `ON` or `OFF`
  - *Response*: `OK`

- **Version**

  - *Command*: `Version` or `V`
  - *Description*: This command returns the firmware version.
  - *Parameters*: None
  - *Response*: `MECControl Esp32 <version>`

#### Web Control

- **Web Wifi Connect Portal**

    - *Command*: `AP`
    - *Description*: This commands turns on the Wifi Access Point and starts the Web Wifi Connect Portal.
    - *Parameters*: `ON` or `OFF`
    - *Response*: `OK`
    - *Additional Indicator* : Upon succesfull start of Access Point the Built-in LED blinks 2 times and The Built-in LED will blink 3 times if the connection is successful

- **Connecting to Specific Wifi**

    - *Command*: `WIFI`
    - *Description*: This commands connects to a specific Wifi.
    - *Parameters*: `<ssid> <password>`
    - *Response*: `OK`
    - *Additional Indicator* : The Built-in LED will blink 3 times if the connection is successful and Remains turned on for 2 seconds if the connection is unsuccessful.

#### GPIO Control

- **GPIO Digital Pin Mode**

    - *Command*: `DigitalPinMode` or `DPM`
    - *Description*: This command sets the mode of the digital pin.
    - *Parameters*: `<pin> <mode>`
    - *Mode*: `INPUT`, `OUTPUT`, `INPUT_PULLUP`
    - *Response*: `OK`
   

- **GPIO Digital Pin Write**

    - *Command*: `DigitalWrite` or `DW`
    - *Description*: This command writes the value to the digital pin.
    - *Parameters*: `<pin> <value>`
    - *Value*: (`HIGH`|`H`) or (`LOW`|`L`)
    - *Response*: `OK`

- **GPIO Digital Pin Read**

    - *Command*: `DigitalRead` or `DR`
    - *Description*: This command reads the value of the digital pin.
    - *Parameters*: `<pin>`
    - *Response*: `<value>`
    - *Value*: `1` or `0`

- **GPIO Analog Pin Mode**

    - *Command*: `AnalogPinMode` or `APM`
    - *Description*: This command sets the mode of the analog pin.
    - *Parameters*: `<pin> <mode>`
    - *Mode*: `INPUT`, `OUTPUT`, `INPUT_PULLUP`
    - *Response*: `OK`

- **GPIO Analog Pin Write**

    - *Command*: `AnalogWrite` or `AW`
    - *Description*: This command writes the value to the analog pin.
    - *Parameters*: `<pin> <value>`
    - *Value*: `0` to `100` in percentage
    - *Response*: `OK` 

- **GPIO Analog Pin Read**

    - *Command*: `AnalogRead` or `AR`
    - *Description*: This command reads the value of the analog pin.
    - *Parameters*: `<pin>`
    - *Response*: `<value>`
    - *Value*: `0` to `100` in percentage