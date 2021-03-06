# Setup with Raspbian

## Install Raspbian

- Format SD card with [SD formatter](https://www.sdcard.org/downloads/formatter_4/index.html)
- Download [Raspbian](https://www.raspberrypi.org/downloads/)
- Use [Etcher](https://etcher.io) to flash the image on the SD card
- Create empty file named `ssh` on the card (to enable SSH)

# Setup ssh

- Connect in ssh with `pi@<IP-ADDRESS>`, password is `raspberry`
- Copy public key to Pi: `cat ~/.ssh/id_rsa.pub | ssh pi@<IP-ADDRESS> 'cat >> .ssh/authorized_keys'`

## Change password

`passwd`

## Setup Wifi

```
sudo nano /etc/wpa_supplicant/wpa_supplicant.conf
```

Append at the end of the file

```
network={
    ssid="xxxx"
    psk="xxxx"
}
```

Reconfigure the interface

```
wpa_cli -i wlan0 reconfigure
```

## Expand space so OS can use full SD card

```
sudo raspi-config
```

Go to Advanced options and expand space

## Install git

`sudo apt-get install git`

## Install Node

```
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## Add config.js in root of project

```
module.exports = {
  thermostatSwitchIP: <IP>,
  thermostatThermometerPin: <PIN>,
  contactSmtp: <SMTP>,
  contactEmail: <EMAIL>,
  contactUsername: <USERNAME>,
  contactPassword: <PASSWORD>,
  hueIP: <IP>,
  hueUsername: <USERNAME>,
  password: <PASSWORD>,
};
```

## Add certificate and key in certificate folder
To create one:

```
openssl genrsa -out key.pem 2048
openssl req -new -sha256 -key key.pem -out csr.csr
openssl req -x509 -sha256 -days 1095 -key key.pem -in csr.csr -out certificate.pem
```

# Setup daemon

## Create `/lib/systemd/system/home.service`

```
[Unit]
Description=Home service
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
Restart=always
RestartSec=5
User=pi
ExecStart=/usr/local/bin/node /home/pi/home-server/deploy.js
Environment=NODE_ENV=production
WorkingDirectory=/home/pi/home-server

[Install]
WantedBy=multi-user.target
```

## Start service

`systemctl start home`

## Start service at boot

`systemctl enable home`


# Develop on Mac on the Pi disk

## Setup

```
brew cask install osxfuse
brew install sshfs
```

## Access files

`sshfs pi@<IP-ADDRESS>:/remote/directory/path /Volumes/pi -ovolname=pi`
