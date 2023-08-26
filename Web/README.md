## Web Controller for ESP32 - 30 pins version

This is the web controller for the ESP32 - 30 pins version and helps control the ESP32 GPIO pins via a web interface.

### Architecture

The web controller is based on the Client - Server Architecture and uses the ESP32 as a server and the client is the web browser. 

### Prerequisites

- ESP32 - 30 pins version
- ESp32 flashed with the esp32 Handler firmware
- Esp32 connected to the same network as the client

### How to use 

Once the Esp32 and the client are connected to the same network, The Client can press the connect button. After it has been succesfully been connected it fetchs the curren state of all GPIO pins. 

For the Pins Recieving an **INPUT** signal (Digital or Analog) the GPIO button will be displayed in **blue**
colour and the value will be displayed beside the button.

For Analog Inputs the value will be displayed in the range of 0 - 100 %.
For Digital Inputs the value will be displayed as **1** or **0**.

The Off state of the Pins are denoted in red colour. To supply an Output to the pin, the user can press the button and the pin will be set to the **ON** state. The button will be displayed in **green** colour. 

OUTPUT Modes:

The default mode for the output pins is **Digital**. The user can change the mode to **Analog** by pressing the **~** button. 

The Default Analog value is 0% , To set the analog the Uses can use the slider to set the value and **Press the purple button** to apply the value.
