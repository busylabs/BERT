#include <ESP8266WiFi.h>
#include <ESP8266mDNS.h>
#include <ESPAsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <FS.h>
#include <SPIFFSEditor.h>


#define WIFI_CONFIG_FILE "/wifi.config"

void setupWiFi() {
  String ssid, password; 
  if (SPIFFS.exists(WIFI_CONFIG_FILE)) {
    Serial.println("WiFi configuration file found.");
    File file = SPIFFS.open(WIFI_CONFIG_FILE, "r");
    String contents = file.readString();
    int index = contents.indexOf(":");
    ssid = contents.substring(0, index);
    password = contents.substring(index+1);
    password.trim(); // remove any trailing whitespace
    file.close();
  }
}

void setup (void) {
  // start serial port
  Serial.begin(115200);

  //start file system
  SPIFFS.begin();

  //start WiFi
  setupWiFi();

}

void loop(void){
  delay(0);
}