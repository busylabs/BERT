// #include "config.h"
#include "motor.h"
#include "pinAssignments.h"
#include "RemoteControl.h"
#include <ESP8266WiFi.h>
#include <ESP8266mDNS.h>
#include <ESPAsyncWebServer.h>    // https://github.com/me-no-dev/ESPAsyncWebServer
#include <FS.h>
#include <SPIFFSEditor.h>
#include <Servo.h>
#include "DNSServer.h"            // https://github.com/idolpx/mobile-rr

#define HEARTBEAT_MESSAGE "--heartbeat--"
#define HTTP_PORT 80
#define HOST_NAME "bert"      // http://bert.local/ or http://10.10.10.1/ 
#define SSID_NAME_BASE "bert-" 

Motor leftMotor(MOTOR_A_PWM_PIN, MOTOR_A_DIRECTION_PIN);    // motorA = left motor viewed from back
Motor rightMotor(MOTOR_B_PWM_PIN, MOTOR_B_DIRECTION_PIN);   // motorB = right motor viewed from back
Servo kickerServo;
RemoteControl control = RemoteControl();

IPAddress apIpAddress(10, 10, 10, 1);

String tempMessage;
int leftMotorSpeed = 0;
int rightMotorSpeed = 0;
int kickerServoAngle = 180;

DNSServer dnsServer;                    // create DNS Server instance
AsyncWebServer webServer(HTTP_PORT);    // create webserver instance
AsyncWebSocket ws("/ws");               // create websocket instance
AsyncWebSocketClient *_activeClient;    // websocket client instance

String macToString(int val) {
  String name="";
  char alphaNum[] = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  while (val > 0) {
    name = name + alphaNum[val%36];
    val = val/36;
  }
  return name;
}

void setupWifi() {
  byte macAddr[6];
  int mac;
  String ssid;

  WiFi.softAPmacAddress(macAddr);
  mac = (macAddr[3] && 0x0F) << 16 | macAddr[4] << 8 | macAddr[5];

  ssid = SSID_NAME_BASE + macToString(mac);
  Serial.println("Starting Access Point, SSID: " + ssid);

  WiFi.mode(WIFI_AP);
  WiFi.softAPConfig(apIpAddress, apIpAddress, IPAddress(255, 255, 255, 0));  
  WiFi.softAP(ssid.c_str());
  Serial.print("\nStarted! IP address: ");
  Serial.println(WiFi.softAPIP());
}

void setupDNS() {
  // if DNSServer is started with "*" for domain name, 
  // it will reply with the provided IP to all DNS requests
  // https://github.com/idolpx/mobile-rr
  dnsServer.onQuery ( [] ( const IPAddress & remoteIP, const char *domain, const IPAddress & resolvedIP ) {
      if ( strstr(domain, "connectivitycheck.gstatic.com") )
        dnsServer.overrideIP =  IPAddress(74, 125, 21, 113);
      
      // connectivitycheck.android.com -> 74.125.21.113
      if ( strstr(domain, "connectivitycheck.android.com") )
        dnsServer.overrideIP =  IPAddress(74, 125, 21, 113);

      // dns.msftncsi.com -> 131.107.255.255
      if ( strstr(domain, "msftncsi.com") )
        dnsServer.overrideIP =  IPAddress(131, 107, 255, 255);

      // connectivitycheck.android.com -> 74.125.21.113
      if ( strstr( "clients1.google.com|clients2.google.com|clients3.google.com|clients4.google.com|connectivitycheck.android.com|connectivitycheck.gstatic.com", domain ) )
          dnsServer.overrideIP =  IPAddress(74, 125, 21, 113);
  });

  dnsServer.setTTL(0);
  dnsServer.start(53, "*", apIpAddress); 
}

void onRequest(AsyncWebServerRequest *request) {
  IPAddress remoteIP = request->client()->remoteIP();
  String path = request->url();
  Serial.printf("Path=%s: ", path.c_str());
  if ((!SPIFFS.exists(path) && !SPIFFS.exists(path + ".gz")) || (request->host() != "10.10.10.1")) {
    Serial.println("redirected.");
    AsyncWebServerResponse *response = request->beginResponse(302, "text/plain", "");
    response->addHeader("Location", "http://10.10.10.1/index.html");
    request->send(response);
  }
  else {
    Serial.println("served.");
    char s_tmp[] = "";
    AsyncWebServerResponse *response;

    response=request->beginResponse(SPIFFS, path);
    response->addHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    response->addHeader("Pragma", "no-cache");
    response->addHeader("Expires", "-1");
    request->send(response);
  }
}

void setupWebServer() {
    // Handle requests
    webServer.on("/generate_204", onRequest);   //Android captive portal. Maybe not needed. Might be handled by notFound handler.
    webServer.on("/fwlink", onRequest);         //Microsoft captive portal. Maybe not needed. Might be handled by notFound handler.
    webServer.onNotFound(onRequest);
    
    // attach WebSocket interface
    ws.onEvent(onWSEvent);
    webServer.addHandler(&ws);

    webServer.begin();
}

void onWSEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type, void *arg, uint8_t *data, size_t len){
  if(type == WS_EVT_CONNECT){
    //client connected
    Serial.printf("ws[%s][%u] connect\n", server->url(), client->id());
    client->printf("Hello Client %u :)", client->id());
    client->ping();
    _activeClient = client;
  } else if(type == WS_EVT_DISCONNECT){
    //client disconnected
    Serial.printf("ws[%s][%u] disconnect: %u\n", server->url(), client->id());
    _activeClient = NULL;
  } else if(type == WS_EVT_ERROR){
    //error was received from the other end
    Serial.printf("ws[%s][%u] error(%u): %s\n", server->url(), client->id(), *((uint16_t*)arg), (char*)data);
  } else if(type == WS_EVT_PONG){
    //pong message was received (in response to a ping request maybe)
    Serial.printf("ws[%s][%u] pong[%u]: %s\n", server->url(), client->id(), len, (len)?(char*)data:"");
  } else if(type == WS_EVT_DATA){
    //data packet
    tempMessage = "";
    for(int i=0; i < len; i++) {
      tempMessage += (char) data[i];
    }
    if (tempMessage.equals(HEARTBEAT_MESSAGE)) {
      client->printf(HEARTBEAT_MESSAGE);
    } else {
      control.handle(tempMessage);
    }    
  }
}

// send a message to the active web socket
void webSocketMessage(String msg) {
  if(!_activeClient) return;
  Serial.printf("[%u] send message: %s\n", _activeClient->id(), msg.c_str());
  _activeClient->text(msg.c_str());
}

void setup() {
  // start serial port
  Serial.begin(115200);
  Serial.println();   //clear any garbage on screen
  Serial.println();

  Serial.println("Controller started . . . ");
  kickerServo.attach(SERVO_PIN);
  kickerServo.write(90);

  control.variable("leftMotorSpeed", &leftMotorSpeed);        // TODO: added value/function if disconnected
  control.variable("rightMotorSpeed", &rightMotorSpeed);
  control.variable("kickerServoAngle", &kickerServoAngle);

  //start file system
  SPIFFS.begin(); 

  Serial.println("Starting wifi . . .");
  setupWifi();

  Serial.println("Starting DNS Server . . .");
  setupDNS();

  webServer.serveStatic("/", SPIFFS, "/").setDefaultFile("index.html");  // serve static file system
  webServer.addHandler(new SPIFFSEditor());                              // file system editor at ../edit

  // attach WebSocket interface
  ws.onEvent(onWSEvent);
  webServer.addHandler(&ws);

  setupWebServer();
}

void loop() {
  dnsServer.processNextRequest();
  
  rightMotor.speed(rightMotorSpeed);
  leftMotor.speed(leftMotorSpeed);
  kickerServo.write(kickerServoAngle);

  /*
  if (controller.connected) {
    leftMotor.speed(leftMotorSpeed);
    rightMotor.speed(rightMotorSpeed);
    kickerServo.angle(kickerServoAngle);
  } else {
    leftMotor.speed(0);
    rightMotor.speed(0);
    kickerServo.angle(0);
  }
  */
  delay(0);
}