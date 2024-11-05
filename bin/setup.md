
# setting up the sparrow signaller server

1. setup a debian droplet on digitalocean
1. configure a `root` and `deployer` user
    - setup ssh keys or whatever
    - deployer does *not* need sudo privileges
1. login as `deployer` (`su - deployer`)
1. install [nvm](https://github.com/nvm-sh/nvm) and node
    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
    source ~/.bashrc
    nvm install 22
    npm i -g npm@latest
    ```
1. install pm2, and follow its instructions
    ```bash
    npm i -g pm2
    pm2 startup
    ```
1. login as `root`, and paste that script pm2 spat out (without the sudo prefix)
1. continuing as root, install `rsync`
    ```bash
    apt update -y
    apt install -y rsync
    ```
1. 🚀 i think that's it -- now it's up to the `release.yaml` github workflow...

