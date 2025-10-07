# Server Configuration for Lighthouse Optimization

## Compression (Gzip/Brotli)

### For Apache (.htaccess)
```apache
# Enable compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json application/xml
</IfModule>

# Enable Brotli if available
<IfModule mod_brotli.c>
  AddOutputFilterByType BROTLI_COMPRESS text/html text/plain text/xml text/css text/javascript application/javascript application/json application/xml
</IfModule>
```

### For Nginx (nginx.conf)
```nginx
# Enable Gzip compression
gzip on;
gzip_vary on;
gzip_min_length 256;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;

# Enable Brotli if available
brotli on;
brotli_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;
```

## Cache-Control Headers

### For Apache (.htaccess)
```apache
# Cache static assets for 1 year
<IfModule mod_expires.c>
  ExpiresActive On
  
  # Images
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  
  # Fonts
  ExpiresByType font/woff2 "access plus 1 year"
  ExpiresByType font/woff "access plus 1 year"
  ExpiresByType font/ttf "access plus 1 year"
  ExpiresByType font/otf "access plus 1 year"
  
  # CSS and JavaScript
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType text/javascript "access plus 1 year"
  
  # HTML
  ExpiresByType text/html "access plus 0 seconds"
</IfModule>

# Set Cache-Control headers
<IfModule mod_headers.c>
  # Cache static assets immutably for 1 year
  <FilesMatch "\.(jpg|jpeg|png|gif|svg|webp|woff|woff2|ttf|otf|eot|css|js)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  
  # Don't cache HTML
  <FilesMatch "\.(html|htm)$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires "0"
  </FilesMatch>
</IfModule>
```

### For Nginx (nginx.conf)
```nginx
# Cache static assets
location ~* \.(jpg|jpeg|png|gif|svg|webp|woff|woff2|ttf|otf|eot|css|js)$ {
  expires 1y;
  add_header Cache-Control "public, max-age=31536000, immutable";
  access_log off;
}

# Don't cache HTML
location ~* \.(html|htm)$ {
  add_header Cache-Control "no-cache, no-store, must-revalidate";
  add_header Pragma "no-cache";
  add_header Expires "0";
}
```

## Security Headers (Additional Lighthouse Best Practices)

### For Apache (.htaccess)
```apache
<IfModule mod_headers.c>
  # X-Content-Type-Options
  Header always set X-Content-Type-Options "nosniff"
  
  # X-Frame-Options
  Header always set X-Frame-Options "SAMEORIGIN"
  
  # Referrer-Policy
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  
  # Permissions-Policy
  Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"
</IfModule>
```

### For Nginx (nginx.conf)
```nginx
# Security headers
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

## Installation Instructions

1. **For Apache hosting**: Copy the Apache configuration to your `.htaccess` file in the root directory
2. **For Nginx hosting**: Add the Nginx configuration to your server block in the main nginx configuration
3. **For other hosting**: Contact your hosting provider for assistance with enabling compression and cache headers

## Verification

After applying the configuration:
1. Test compression: https://www.giftofspeed.com/gzip-test/
2. Check headers: Use browser DevTools Network tab
3. Run Lighthouse again to verify improvements
