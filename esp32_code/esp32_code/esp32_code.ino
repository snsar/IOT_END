#include <OneWire.h>
#include <DallasTemperature.h>
#include <WiFi.h>
#include <PubSubClient.h>

// Replace with your network credentials
const char* ssid = "HUAWEI-E8372-A5B0";
const char* password = "91119941";
// const char* ssid = "haha11";
// const char* password = "123456789@@";
// const char* ssid = "BaoKim IT 2.4GHz";
// const char* password = "BaoKim100%";

// Replace with your Mosquitto broker IP address
const char* mqttServer = "192.168.8.101";
// const char* mqttServer = "192.168.108.82";
// const char* mqttServer = "192.168.21.59";
const int mqttPort = 1883;
// const char* mqttUser = "your-mqtt-username";
// const char* mqttPassword = "your-mqtt-password";

#define ONE_WIRE_BUS 2

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

WiFiClient espClient;
PubSubClient client(espClient);

unsigned long previousMillis = 0;
const long interval = 1000;  // Interval between sending temperature data (in milliseconds)

void setup() {
  Serial.begin(115200);

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");

  // Setup MQTT
  client.setServer(mqttServer, mqttPort);
}

void loop() {
  unsigned long currentMillis = millis();

  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;

    // Fake data for heart rate (random value between 80 and 120)
    int heartRate = random(80, 121);

    // Fake data for spo2 (random value between 91 and 99)
    int spo2 = random(91, 100);

    // Fake temperature data (random value between 35 and 40)
    float temperature = random(350, 401) / 10.0;

    if (!client.connected()) {
      reconnect();
    }

    // Concatenate the data into a single string separated by commas
    String dataString = String(heartRate) + "," + String(spo2) + "," + String(temperature, 2);

    // Publish the data to the MQTT broker
    String combinedTopic = "human/combinedData";
    client.publish(combinedTopic.c_str(), dataString.c_str());
  }
  
  // Other non-blocking tasks can be added here
}

void reconnect() {
  while (!client.connected()) {
    Serial.println("Attempting MQTT connection...");
    if (client.connect("ESP32Client")) {
      Serial.println("Connected to MQTT broker");
    } else {
      Serial.print("Failed, rc=");
      Serial.print(client.state());
      Serial.println(" Retrying in 5 seconds");
      delay(5000);
    }
  }
}
