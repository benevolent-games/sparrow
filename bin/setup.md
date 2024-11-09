
# setting up the sparrow signaller server

### users and packages
1. setup a debian droplet on digitalocean
1. configure a `root` and `deployer` user
    - setup ssh keys or whatever
    - deployer does *not* need sudo privileges
1. login as `root`, install all this stuff
    ```bash
    apt update -y
    apt install -y ranger rsync nginx ufw certbot python3-certbot-nginx
    ```

### nvm, pm2, deployment
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
1. 🚀 i think that's it -- now it's up to the `release.yaml` github workflow...

### nginx, certbox
1. login as `root`
1. setup ufw firewall
    ```bash
    ufw allow OpenSSH
    ufw allow 'Nginx Full'
    ufw enable
    ufw status
    ```
1. add `/etc/nginx/sites-available/signaller.sparrow.benev.gg`
    ```bash
    server {
      listen 80;
      listen [::]:80;
      server_name signaller.sparrow.benev.gg;

      location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
        include proxy_params;
      }
    }
    ```
1. link it to sites-enabled
    ```bash
    ln -s /etc/nginx/sites-available/signaller.sparrow.benev.gg /etc/nginx/sites-enabled/
    ```
1. test nginx config and restart the service
    ```bash
    nginx -t
    systemctl restart nginx
    ```
1. be wise and actually check if the nginx reverse proxy actually works over ordinary non-ssl http -- if it doesn't work, certbot will get Angry, and you will regret
1. do the certbot
    ```bash
    certbot --nginx -d signaller.sparrow.benev.gg
    ```
    - follow its interactive instructions

### establish `.env.prod`
1. login as the deployer `su - deployer`
1. create file `~/.env.prod` with contents copied from the `.env.dev` in the repo
1. the app deployment script will copy from that `~/.env.prod` each deployment

