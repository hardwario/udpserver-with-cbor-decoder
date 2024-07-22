# UDP Server with CBOR Decoder

Data forwarding via the HTTP endpoint is activated using the `HTTP_URL` variable. Example: HTTP_URL="https://best.app.example"

Forwarding via MQTT with `MQTT_ENABLE=true`

Support multiple decoders, check example configuration in config/config.yaml

## Environ

| Name | Default |
| ---  |-------- |
| PORT | 5000
| CONFIG_YAML | ./config/config.yaml |
| LOG_LEVEL | info
| LOG_PRETTY | false
| HTTP_URL | |
| MQTT_ENABLE | false
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

## License

This project is licensed under the [**MIT License**](https://opensource.org/licenses/MIT) - see the [**LICENSE**](LICENSE) file for details.

---

Made with ❤️ by [**HARDWARIO a.s.**](https://www.hardwario.com) in the heart of Europe.
