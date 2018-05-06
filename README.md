# Setup with Raspbian

## Install Raspbian

- Format SD card with [SD formatter](https://www.sdcard.org/downloads/formatter_4/index.html)
- Download [Raspbian](https://www.raspberrypi.org/downloads/)
- Use [Etcher](https://etcher.io) to flash the image on the SD card
- Copy empty file named `ssh` on the card (to enable SSH)

# Setup ssh

- Connect in ssh with `pi@ip`, password is `raspberry`
- Copy public key to Pi: `cat ~/.ssh/id_rsa.pub | ssh pi@<IP-ADDRESS> 'cat >> .ssh/authorized_keys'`
- Remove password access:
  - Delete `/etc/profile.d/sshpwd.sh`
  - Edit `/etc/ssh/sshd_config` and set
    ```
    - ChallengeResponseAuthentication no
    - PasswordAuthentication no
    - UsePAM no
    ```
  - Restart ssh: `sudo systemctl reload ssh`

## Change password

`passwd`

## Setup vnc

```
sudo apt-get update 
sudo apt-get install realvnc-vnc-server 
sudo apt-get install realvnc-vnc-viewer
sudo raspi-config
```

Go to Interfacing Options > VNC

## Install git

`sudo apt-get install git`

# Develop on Mac on the Pi disk

## Setup

```
brew cask install osxfuse
brew install sshfs
```

## Access files

`sshfs pi@IP-ADDRESS>:/remote/directory/path /Volumes/pi -ovolname=pi`
