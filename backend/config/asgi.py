import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import apps.support.routing


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings') # Thay 'core' bằng tên app chứa settings của bạn

# Import file routing của app bookings (ta sẽ tạo ở bước sau)
import apps.bookings.routing 

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            apps.bookings.routing.websocket_urlpatterns +
            apps.support.routing.websocket_urlpatterns
        )
    ),
})