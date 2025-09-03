#include "esp_camera.h"
#include <WiFi.h>
#include <HTTPClient.h>

// Kamera-Modell: AI Thinker ESP32-CAM
#define CAMERA_MODEL_AI_THINKER
#include "camera_pins.h"

// WLAN
const char* ssid = "FRITZ!Box 7530 BI";
const char* password = "76646092655362001282";

// Server
const char* server = "157.180.34.27";
int port = 3000;
String apiPath = "/api/uploadImage";

// Intervall (5 Sekunden)
const unsigned long interval = 5000;
unsigned long lastCapture = 0;

void setupCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer   = LEDC_TIMER_0;
  config.pin_d0       = Y2_GPIO_NUM;
  config.pin_d1       = Y3_GPIO_NUM;
  config.pin_d2       = Y4_GPIO_NUM;
  config.pin_d3       = Y5_GPIO_NUM;
  config.pin_d4       = Y6_GPIO_NUM;
  config.pin_d5       = Y7_GPIO_NUM;
  config.pin_d6       = Y8_GPIO_NUM;
  config.pin_d7       = Y9_GPIO_NUM;
  config.pin_xclk     = XCLK_GPIO_NUM;
  config.pin_pclk     = PCLK_GPIO_NUM;
  config.pin_vsync    = VSYNC_GPIO_NUM;
  config.pin_href     = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn     = PWDN_GPIO_NUM;
  config.pin_reset    = RESET_GPIO_NUM;

  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;

  // Hier die Bildgröße / Qualität festlegen
  config.frame_size   = FRAMESIZE_QVGA; // z.B. QVGA = 320x240
  config.jpeg_quality = 50;             // 0-63, kleiner = bessere Qualität
  config.fb_count     = 1;              // 1 Buffer spart RAM
  config.fb_location  = CAMERA_FB_IN_PSRAM;
  config.grab_mode    = CAMERA_GRAB_WHEN_EMPTY;

  if (esp_camera_init(&config) != ESP_OK) {
    Serial.println("❌ Kamera konnte nicht initialisiert werden!");
    while (true);
  }
}

void setup() {
  Serial.begin(115200);

  // WLAN verbinden
  WiFi.begin(ssid, password);
  Serial.print("🔌 Verbinde mit WLAN");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WLAN verbunden");

  setupCamera();
  lastCapture = millis() - interval; // sofort erstes Bild
}

void loop() {
  if (millis() - lastCapture >= interval) {
    lastCapture = millis();
    Serial.println("📸 Aufnahme gestartet...");

    camera_fb_t* fb = esp_camera_fb_get();
    if (!fb) {
      Serial.println("❌ Fehler: Kein Bild erhalten!");
      return;
    }

    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      WiFiClient client;

      String url = String("http://") + server + ":" + String(port) + apiPath;
      http.begin(client, url);

      // Multipart boundary
      String boundary = "----ESP32Boundary";
      http.addHeader("Content-Type", "multipart/form-data; boundary=" + boundary);

      // Komplettes Body zusammenbauen
      String body = "";
      body += "--" + boundary + "\r\n";
      body += "Content-Disposition: form-data; name=\"image\"; filename=\"esp32cam.jpg\"\r\n";
      body += "Content-Type: image/jpeg\r\n\r\n";

      // Content-Length berechnen
      int contentLength = body.length() + fb->len + boundary.length() + 6;
      http.addHeader("Content-Length", String(contentLength));

      // POST Request mit komplettem Body
      int httpCode = http.POST(body + String((char*)fb->buf, fb->len) + "\r\n--" + boundary + "--\r\n");
      
      if (httpCode == HTTP_CODE_OK) {
        String response = http.getString();
        Serial.println("✅ Upload erfolgreich!");
        Serial.println("📩 Server Antwort: " + response);
      } else {
        Serial.printf("❌ Upload-Fehler: %d - %s\n", httpCode, http.errorToString(httpCode).c_str());
      }

      http.end();
    }

    esp_camera_fb_return(fb);
  }
}