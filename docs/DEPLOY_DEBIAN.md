# Debian VPS deployment (including AWS EC2)

The production site is static. Node is needed only on your build machine. Nginx serves the built files; there is no database or application server.

## Build locally

Use Node 22.13+ or a current supported Node LTS release.

```sh
npm ci
npm run build
```

Upload the **contents** of `dist/`, not the source tree or `node_modules`. For example, from the project directory using OpenSSH (replace the host and SSH user):

```sh
scp -r dist admin@YOUR_SERVER:/tmp/accessone-dist
```

## Prepare the Debian server

On the server, with a sudo-capable user:

```sh
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx
sudo install -d -m 755 /var/www/accessone
sudo cp -a /tmp/accessone-dist/. /var/www/accessone/
sudo chown -R root:root /var/www/accessone
sudo find /var/www/accessone -type d -exec chmod 755 {} \;
sudo find /var/www/accessone -type f -exec chmod 644 {} \;
```

Point a domain A record at the server’s public IPv4 address. Only add an AAAA record if IPv6 is configured and reachable. On AWS, attach an Elastic IP if you need a stable address. Allow inbound TCP 80 and 443 in the EC2 security group, and restrict SSH TCP 22 to your own IP. Permit the same ports in any configured host firewall; allow SSH before enabling a firewall so you keep your connection.

Create `/etc/nginx/sites-available/accessone`, replacing `access.example.com`:

```nginx
server {
    listen 80;
    server_name access.example.com;
    root /var/www/accessone;
    index index.html;

    # Application data never reaches Nginx. Disable optional access logging too.
    access_log off;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy no-referrer always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'" always;

    location / {
        try_files $uri $uri/ =404;
    }
    location = /index.html {
        expires -1;
    }
    location /assets/ {
        expires 1y;
    }
}
```

The site uses query parameters, not client-side path routes, so no SPA fallback is necessary. Security headers are inherited by all locations. HTML is revalidated; hashed assets use a long cache lifetime.

Enable it:

```sh
sudo ln -s /etc/nginx/sites-available/accessone /etc/nginx/sites-enabled/accessone
sudo nginx -t
sudo systemctl reload nginx
```

Before TLS, verify `http://access.example.com` works externally. Certbot must be able to reach port 80.

## HTTPS with Let’s Encrypt

```sh
sudo certbot --nginx -d access.example.com
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl enable --now certbot.timer
sudo certbot renew --dry-run
```

Follow Certbot’s prompts to configure HTTPS redirection. Check the installed package’s renewal timer with `systemctl list-timers certbot.timer`. For a different Debian release or installation method, consult the [official Certbot Nginx instructions](https://certbot.eff.org/instructions?ws=nginx&os=pip). Debian provides its own [Certbot package documentation](https://manpages.debian.org/bookworm/certbot/certbot.7.en.html).

## Updates and rollback

Back up `/var/www/accessone` before each release, then upload a fresh build. Prefer a versioned release directory and update a `current` symlink for atomic swaps if you expect frequent deployments. Keep old hashed assets available while active browser sessions complete; removing them immediately can disrupt an already-open page. To roll back, restore the prior static directory. No migrations are needed.

Smoke test: landing, manual provider route, a verification code, `?debug=1&stage=reveal`, mobile layout, and HTTPS. Do not send debug links to prank participants. Run the complete browser suite locally before publishing.

## Privacy boundary

AccessOne sends no questionnaire answers or interaction events. A server must receive ordinary static-file requests; your host, CDN, DNS provider, and TLS provider have their own operational logs. Do not enable analytics, session replay, injected tracking scripts, or third-party fonts if you want to preserve the application’s privacy design.
