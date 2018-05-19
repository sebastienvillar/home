from dht import DHT22, read_retry
import sys

if __name__ == "__main__":
    pin = int(sys.argv[1])
    sensor = DHT22
    retries = int(sys.argv[2])
    humidity, temperature = read_retry(sensor, pin, retries)
    humidity = "null" if humidity is None else humidity
    temperature = "null" if temperature is None else temperature
    print('{ "humidity": %s, "temperature": %s }' % (humidity, temperature))