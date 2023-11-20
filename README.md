# UDP Server ith CBOR Decoder

## Environ

| Name | Default |
| ---  |-------- |
| PORT | 5000
| DECODER_YAML | ./decoder.yaml |
| LOG_LEVEL | info
| LOG_PRETTY | false
| MQTT_BROKER_URL | mqtt://localhost:1883
| MQTT_USERNAME | null |
| MQTT_PASSWORD | null |
| MQTT_CLIENT_ID | null |
| MQTT_CA | null |
| MQTT_CERT | null |
| MQTT_KEY | null |


## Local dev

```
pnpm install

pnpm run dev
```

Dev MQTT Broker
```
docker run --rm -it -p 1883:1883 eclipse-mosquitto mosquitto -c /mosquitto-no-auth.conf
```

## Run docker compose

```
DOCKER_BUILDKIT=1 docker compose up
```
