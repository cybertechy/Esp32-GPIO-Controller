## ESP 32 GPIO Controller

This is a simple ESP32 project to control GPIO pins via a web interface. It is based on the [ESP32 Async Web Server](https://github.com/me-no-dev/ESPAsyncWebServer) library. 

The Web Interface is built using Nextjs 13 and Tailwind CSS 3.3.

Website: [Esp32-GPIO-Controller]()
Firmware Documentation: [Esp32-GPIO-Controller-Firmware]()
Website Guide: [Esp32-GPIO-Controller-User-Guide]()

ESP32 Domain: `esp32.local`
Access Point: `ESP32-Access-Point`

## Features

- Control GPIO pins via a web interface
- Control GPIO pins via a REST API
- Control GPIO pins via Serial Communication using Simple Text Commands

## Screenshots

![Web Interface]()

## Installation

### Prerequisites

- [PlatformIO](https://platformio.org/) (Optional)
- [Nodejs](https://nodejs.org/en/) (Optional)

### PlatformIO

1. Clone the repository
2. Open the project in PlatformIO
3. Build and Upload the project to your ESP32
4. Follow the instructions in the [Firmware Documentation]() to setup Web Mode

### Arduino IDE

1. Clone the repository
2. Open the project in Arduino IDE
3. Build and Upload the project to your ESP32
4. Follow the instructions in the [Firmware Documentation]() to setup Web Mode

### Web Interface

1. Clone the repository
2. Install the dependencies using `npm install` or `yarn install`
3. Run the Server using `npm run start` or `yarn start`
4. Open the Web Interface in your browser at `http://localhost:3000`

For Development, you can use `npm run dev` or `yarn dev` to run the server in development mode.

## Usage

### Web Interface

1. Open the Web Interface in your browser at `http://localhost:3000`
2. Press the `Connect` button to connect to your ESP32 (Ensure that your ESP32 is connected to the same network as your computer)

For more information on how to use the Web Interface, check the [User Guide]()

### REST API

- Check the Firmware Documentation for the REST API [here]()

### Serial Communication

- Check the Firmware Documentation for the Serial Communication [here]()




