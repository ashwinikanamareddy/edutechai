from twilio.rest import Client
import core.config as config

# Initialize client using constants from config
client = Client(
    config.TWILIO_ACCOUNT_SID,
    config.TWILIO_AUTH_TOKEN
)

def send_sms(to_number: str, message_body: str):
    """
    Strictly uses messaging_service_sid and removes from_ parameter.
    """
    try:
        # Normalize number (remove spaces and strip)
        to_number = str(to_number).replace(" ", "").strip()

        message = client.messages.create(
            body=message_body,
            messaging_service_sid=config.TWILIO_MESSAGING_SERVICE_SID,
            to=to_number
        )

        print("SMS SENT:", message.sid)
        return {"status": "sent", "sid": message.sid}

    except Exception as e:
        print("Twilio Error:", str(e))
        return {"status": "failed", "error": str(e)}

# Keeping an alias for compatibility if needed, but the user requested send_sms
def send_parent_sms(to_number: str, message: str) -> str:
    res = send_sms(to_number, message)
    return "sent" if res["status"] == "sent" else "failed"
