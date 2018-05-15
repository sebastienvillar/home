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

## Install git

`sudo apt-get install git`

# Develop on Mac on the Pi disk

## Setup

```
brew cask install osxfuse
brew install sshfs
```

## Access files

`sshfs pi@<IP-ADDRESS>:/remote/directory/path /Volumes/pi -ovolname=pi`
