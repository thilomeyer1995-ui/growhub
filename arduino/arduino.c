#include <ArduinoJson.h>
#include <DHT.h>
#include <WiFiS3.h>

// ------------------ WLAN-Zugang ------------------
char ssid[] = "FRITZ!Box 7530 BI";
char password[] = "76646092655362001282";
char server[] = "157.180.34.27";
int port = 3000;
String apiPath = "/api/data/";
String timePath = "/api/time/";  // <-- Zeit-Endpunkt

// ------------------ Pins ------------------
const int trigPin = 3;
const int echoPin = 4;
const int lightPin = 2;  
const int dhtPin = 5;    
const int moisturePins[3] = {A0, A1, A2};

// ------------------ Variablen ------------------
long duration;
int distance;
float temperature;
float humidity;
int moistureValues[3];
int lightValue = 0;  // <-- Lichtsensor Wert
long long serverUnixTime = 0;   // <-- speichert die Zeit vom Server

// ------------------ DHT Setup ------------------
#define DHTTYPE DHT22
DHT dht(dhtPin, DHTTYPE);

WiFiClient client;

// ======================================================
// Hilfsfunktion: Mit WLAN verbinden
// ======================================================
void connectWiFi() {
  Serial.print("🔄 Verbinde mit WLAN: ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    attempts++;

    if (attempts > 30) {
      Serial.println("\n❌ Keine Verbindung möglich!");
      return;
    }
  }
  Serial.println("\n✅ WLAN verbunden!");
  Serial.print("IP-Adresse: ");
  Serial.println(WiFi.localIP());
}

// ======================================================
// Zeit vom Server holen
// ======================================================
void syncTimeFromServer() {
  if (client.connect(server, port)) {
    Serial.println("⏱ Hole Zeit vom Server...");

    client.println("GET " + timePath + " HTTP/1.1");
    client.println("Host: " + String(server));
    client.println("Connection: close");
    client.println();

    String response;
    while (client.connected() || client.available()) {
      if (client.available()) {
        response += client.readStringUntil('\n');
      }
    }
    client.stop();

    // JSON extrahieren (vereinfacht: ab erstem '{')
    int jsonStart = response.indexOf('{');
    if (jsonStart >= 0) {
      String json = response.substring(jsonStart);
      Serial.println("Server-Zeit Antwort: " + json);

      StaticJsonDocument<256> doc;
      DeserializationError err = deserializeJson(doc, json);
      if (!err) {
        serverUnixTime = doc["unix"]; // <-- Millisekunden vom Server
        Serial.print("✅ Zeit synchronisiert: ");
        Serial.println(serverUnixTime);
      } else {
        Serial.println("❌ JSON Fehler bei Zeitantwort!");
      }
    }
  } else {
    Serial.println("❌ Verbindung zu /api/time/ fehlgeschlagen!");
  }
}

// ======================================================
// Daten an Server senden
// ======================================================
void sendDataToServer(String jsonData) {
  if (client.connect(server, port)) {
    Serial.println("📤 Sende Daten an Server...");

    // HTTP POST Request
    client.println("POST " + apiPath + " HTTP/1.1");
    client.println("Host: " + String(server));
    client.println("Content-Type: application/json");
    client.println("Content-Length: " + String(jsonData.length()));
    client.println("Connection: close");
    client.println();
    client.println(jsonData);

    // Response lesen
    String response = "";
    while (client.connected() || client.available()) {
      if (client.available()) {
        response += client.readStringUntil('\n');
      }
    }
    client.stop();

    Serial.println("📩 Server Antwort: " + response);
  } else {
    Serial.println("❌ Verbindung zu Server fehlgeschlagen!");
  }
}

// ======================================================
// Setup
// ======================================================
void setup() {
  Serial.begin(9600);
  while (!Serial);

  connectWiFi();
  syncTimeFromServer();   // <-- gleich am Anfang Zeit holen

  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(lightPin, INPUT); // <-- Lichtsensor als Eingang

  for (int i = 0; i < 3; i++) {
    pinMode(moisturePins[i], INPUT);
  }

  dht.begin();

  Serial.println("✅ Setup abgeschlossen");
}

// ======================================================
// Loop
// ======================================================
void loop() {
  Serial.println("\n--- Neuer Messzyklus ---");

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️ WLAN getrennt! Neuer Verbindungsversuch...");
    connectWiFi();
  }

  // --- Ultraschall-Sensor messen ---
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  duration = pulseIn(echoPin, HIGH);
  distance = duration * 0.034 / 2;
  Serial.print("distance_sensor: ");
  Serial.println(distance);

  // --- DHT22 messen ---
  humidity = dht.readHumidity();
  temperature = dht.readTemperature();

  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("❌ Fehler beim Lesen des DHT22!");
    humidity = 0;
    temperature = 0;
  }

  // --- Bodenfeuchtigkeit messen ---
  for (int i = 0; i < 3; i++) {
    moistureValues[i] = analogRead(moisturePins[i]);
    Serial.print("plant");
    Serial.print(i + 1);
    Serial.print("_moisture: ");
    Serial.println(moistureValues[i]);
  }

  // --- Lichtsensor messen ---
  lightValue = digitalRead(lightPin);
  Serial.print("light_sensor: ");
  Serial.println(lightValue); // HIGH = Licht erkannt, LOW = Dunkelheit

  // --- JSON erstellen ---
  StaticJsonDocument<512> doc;
  doc["timestamp"] = serverUnixTime; // <-- echte Serverzeit statt millis()

  JsonArray sensors = doc.createNestedArray("sensors");
  JsonObject s1 = sensors.createNestedObject(); s1["sensor_name"] = "humidity"; s1["value"] = humidity;
  JsonObject s2 = sensors.createNestedObject(); s2["sensor_name"] = "temperature"; s2["value"] = temperature;
  JsonObject s3 = sensors.createNestedObject(); s3["sensor_name"] = "plant1_moisture"; s3["value"] = moistureValues[0];
  JsonObject s4 = sensors.createNestedObject(); s4["sensor_name"] = "plant2_moisture"; s4["value"] = moistureValues[1];
  JsonObject s5 = sensors.createNestedObject(); s5["sensor_name"] = "plant3_moisture"; s5["value"] = moistureValues[2];
  JsonObject s6 = sensors.createNestedObject(); s6["sensor_name"] = "distance_sensor"; s6["value"] = distance;
  JsonObject s7 = sensors.createNestedObject(); s7["sensor_name"] = "light_sensor"; s7["value"] = lightValue; // <-- Lichtsensor ins JSON

  String json;
  serializeJson(doc, json);
  Serial.print("JSON-Daten: ");
  Serial.println(json);

  // --- Daten an Server senden ---
  sendDataToServer(json);

  delay(60000);
}
