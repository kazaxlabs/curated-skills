import os
SECRET_KEY = os.environ["SECRET_KEY"]
DEBUG = False
ALLOWED_HOSTS = ["example.org"]
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
