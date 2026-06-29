import http.client
import json
import os


SMS_IR_API_KEY = os.environ.get("SMS_IR_API_KEY", "")
SMS_IR_TEMPLATE_ID = int(os.environ.get("SMS_IR_TEMPLATE_ID", "0"))


def send_otp(phone: str, code: str) -> bool:
    """ارسال کد OTP با SMS.ir — True یعنی موفق"""
    if not SMS_IR_API_KEY or not SMS_IR_TEMPLATE_ID:
        raise RuntimeError("SMS_IR_API_KEY یا SMS_IR_TEMPLATE_ID در .env تنظیم نشده.")

    payload = json.dumps({
        "mobile": phone,
        "templateId": SMS_IR_TEMPLATE_ID,
        "parameters": [
            {"name": "CODE", "value": code}
        ]
    })

    headers = {
        "Content-Type": "application/json",
        "Accept": "text/plain",
        "x-api-key": SMS_IR_API_KEY,
    }

    try:
        conn = http.client.HTTPSConnection("api.sms.ir")
        conn.request("POST", "/v1/send/verify", payload, headers)
        res = conn.getresponse()
        data = json.loads(res.read().decode("utf-8"))
        return data.get("status") == 1
    except Exception as exc:
        raise RuntimeError(f"خطا در ارسال SMS: {exc}")
    finally:
        conn.close()