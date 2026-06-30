cd /root/project/Mentora
git pull
cd backend && source env/bin/activate && pip install -r requirements.txt && python manage.py migrate --noinput && python manage.py collectstatic --noinput && deactivate && cd ..
cd "mentora frontend" && npm ci && npm run build && cd ..
rm -rf /var/www/mentora/build/* && cp -r "mentora frontend/build/." /var/www/mentora/build/ && chown -R www-data:www-data /var/www/mentora/build
systemctl restart mentora
systemctl reload nginx