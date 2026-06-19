# راهنمای دیپلوی Mentora روی سرور Ubuntu با Nginx

این پروژه از دو بخش تشکیل شده:

- **بک‌اند:** Django + DRF (دیتابیس SQLite) که با **gunicorn** اجرا می‌شود.
- **فرانت‌اند:** React (Create React App) که build می‌شود و فایل‌های استاتیکش را **nginx** سرو می‌کند.

nginx جلوی همه چیز می‌نشیند: فایل‌های فرانت را مستقیم سرو می‌کند و درخواست‌های `/api/` و `/admin/` را به gunicorn پاس می‌دهد.

> نکته: بک‌اند به پوشه‌های `RAG/` و `Planning-Assistant/` در ریشهٔ پروژه وابسته است، پس **کل ریپو** باید روی سرور باشد، نه فقط پوشهٔ backend.

فرض می‌کنیم پروژه در مسیر `/var/www/mentora` قرار می‌گیرد.

---

## ۱) آماده‌سازی سرور (نصب پیش‌نیازها)

```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-pip nginx git

# Node.js 20 برای build فرانت‌اند
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

## ۲) ساخت کاربر و گرفتن کد

```bash
# کاربر سرویس (بدون لاگین) برای اجرای بک‌اند
sudo useradd --system --gid www-data --shell /usr/sbin/nologin mentora

# کد را در /var/www/mentora قرار بده (clone یا scp)
sudo mkdir -p /var/www/mentora
sudo chown -R $USER:www-data /var/www/mentora
git clone <YOUR_REPO_URL> /var/www/mentora
cd /var/www/mentora
```

## ۳) تنظیم فایل `.env` (کلیدها و رمزها)

```bash
cp .env.example .env
# یک SECRET_KEY قوی بساز:
python3 -c "import secrets; print(secrets.token_urlsafe(64))"
nano .env
```

در `.env` این مقادیر را پر کن:

- `DJANGO_SECRET_KEY` → رشتهٔ تصادفی بالا
- `DJANGO_DEBUG=False`
- `DJANGO_ALLOWED_HOSTS` → دامنه یا IP سرور (مثلاً `mentora.ir,1.2.3.4`)
- `DJANGO_CSRF_TRUSTED_ORIGINS` → `https://mentora.ir`
- `MODEL_API` → کلید LLM پلنر (سرویس hormouz/OpenAI-compatible)
- `GOOGLE_API_KEY` → کلید Gemini برای حل سؤال RAG

## ۴) راه‌اندازی بک‌اند (Django + gunicorn)

```bash
cd /var/www/mentora/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# مهاجرت دیتابیس و جمع‌آوری فایل‌های استاتیک ادمین
python manage.py migrate
python manage.py collectstatic --noinput

# (اختیاری) ساخت کاربر ادمین برای /admin
python manage.py createsuperuser
deactivate
```

نصب سرویس systemd برای gunicorn:

```bash
sudo cp /var/www/mentora/deploy/mentora.service /etc/systemd/system/mentora.service
sudo systemctl daemon-reload
sudo systemctl enable --now mentora
sudo systemctl status mentora      # باید active (running) باشد
```

## ۵) build فرانت‌اند

```bash
cd "/var/www/mentora/mentora frontend"
npm install
npm run build      # خروجی در پوشهٔ build/ ساخته می‌شود
```

## ۶) تنظیم دسترسی‌ها

```bash
# مالکیت کل پروژه به کاربر سرویس و گروه nginx
sudo chown -R mentora:www-data /var/www/mentora
# nginx باید بتواند مسیرها را بخواند
sudo chmod -R 755 /var/www/mentora
# دیتابیس SQLite باید برای کاربر سرویس قابل نوشتن باشد
sudo chmod 664 /var/www/mentora/backend/db.sqlite3
sudo chmod 775 /var/www/mentora/backend
```

## ۷) تنظیم nginx

```bash
sudo cp /var/www/mentora/deploy/nginx.conf /etc/nginx/sites-available/mentora
# داخل فایل، YOUR_DOMAIN_OR_IP را با دامنه یا IP خودت عوض کن:
sudo nano /etc/nginx/sites-available/mentora

sudo ln -s /etc/nginx/sites-available/mentora /etc/nginx/sites-enabled/mentora
sudo rm -f /etc/nginx/sites-enabled/default   # حذف سایت پیش‌فرض
sudo nginx -t                                  # تست صحت کانفیگ
sudo systemctl restart nginx
```

حالا سایت روی `http://دامنه-یا-IP` بالا است. 🎉

## ۸) (پیشنهادی) فعال‌سازی HTTPS با Let's Encrypt

فقط وقتی دامنه به IP سرور وصل است:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d mentora.ir -d www.mentora.ir
```

certbot خودش کانفیگ nginx را برای HTTPS آپدیت می‌کند.

---

## به‌روزرسانی بعد از تغییر کد

```bash
cd /var/www/mentora
git pull

# بک‌اند
cd backend && source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
deactivate
sudo systemctl restart mentora

# فرانت‌اند
cd "../mentora frontend" && npm install && npm run build
sudo systemctl reload nginx
```

---

## عیب‌یابی

- **502 Bad Gateway:** gunicorn بالا نیست یا nginx به سوکت دسترسی ندارد.
  ```bash
  sudo systemctl status mentora
  sudo journalctl -u mentora -n 50 --no-pager
  ls -l /run/mentora/gunicorn.sock
  ```
- **خطای ALLOWED_HOSTS / DisallowedHost:** دامنه/IP را در `DJANGO_ALLOWED_HOSTS` داخل `.env` اضافه کن و `sudo systemctl restart mentora`.
- **صفحهٔ ادمین بدون استایل:** `collectstatic` را اجرا کن و مطمئن شو nginx مسیر `/django-static/` را درست سرو می‌کند.
- **خطای LLM/RAG هنگام چت یا حل سؤال:** کلیدهای `MODEL_API` و `GOOGLE_API_KEY` در `.env` درست پر شده باشند؛ بعد سرویس را ری‌استارت کن.
- **دیتابیس "readonly":** دسترسی نوشتن روی `db.sqlite3` و پوشهٔ `backend` را طبق مرحلهٔ ۶ تنظیم کن.
