
# self-hosting your own instance of sparrow's signaller
- remember, there's a free one here if you want to use that instead: `https://signaller.sparrow.benev.gg/`
- this guide is a little rough because they're just my notes i took while setting up the official signaller
- you will see `signaller.sparrow.benev.gg` throughout the guide, which you must replace with your own domain name you intend to host on

## users and packages
1. setup a debian droplet on digitalocean
1. configure a `root` and `deployer` user
    - setup ssh keys or whatever
    - deployer does *not* need sudo privileges
1. login as `root`, install all this stuff
    ```bash
    apt update -y
    apt install -y ranger rsync nginx ufw certbot python3-certbot-nginx
    ```

## nvm, pm2, deployment
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

## nginx, certbox
1. login as `root`
1. remember to replace `signaller.sparrow.benev.gg` with your own domain name
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
    - the sparrow signaller has an http `/health` page here: http://signaller.sparrow.benev.gg/health (but your own domain name)
    - if the nginx reverse proxy is working, you should see a timestamp when you hit that page
1. do the certbot
    ```bash
    certbot --nginx -d signaller.sparrow.benev.gg
    ```
    - follow its interactive instructions diligently

## establish `.env.prod`
1. login as the deployer `su - deployer`
1. create file `~/.env.prod` with contents copied from the `.env.dev` in the repo
1. the app deployment script will copy from that `~/.env.prod` each deployment

## *(optional)* setup your own cloudflare integration
1. on cloudflare's dashboard thing, create a TURN server, it'll give you two keys which you'll put in your `.env.prod`, and also add your origins to the sparrow turn allow list:
    - `SPARROW_TURN_ALLOW="http://localhost:8080,https://example.com"`
    - `SPARROW_TURN_CLOUDFLARE_ID="YOUR_TOKEN_ID"`
    - `SPARROW_TURN_CLOUDFLARE_SECRET="YOUR_TOKEN_SECRET"`
1. in your browser client code where you call Sparrow.host or Sparrow.join, provide the `turnRtcConfigurator` as your rtcConfigurator:
    ```ts
    const joined = await Sparrow.join({
      invite,
      disconnected,
      url: "https://signaller.example.com/", // your own sparrow instance
      rtcConfigurator: Sparrow.turnRtcConfigurator, // uses cloudflare turn
    })
    ```
1. if you did it right, you should see those three environment variables in your logs marked with `set`.
    - if you're using the turnRtcConfigurator, but your sparrow instance isn't configured with cloudflare correctly, it will print a warning to the clientside console like "server is not configured for turn" or something like that.
    - if sparrow isn't correctly configured for TURN, then it will just ignore TURN and continue with only STUN -- the turnRtcConfigurator is supposed to gracefully fallback to STUN when the turn setup isn't happy.

