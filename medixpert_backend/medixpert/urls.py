"""
URL configuration for medixpert project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response

# Import views from the app where predict_disease is defined
from core import views

# Add an OPTIONS view to handle preflight requests
@api_view(['OPTIONS'])
def api_options(request):
    return Response()

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('core.urls')),
    # Add a catch-all OPTIONS handler
    path('api/<path:path>', csrf_exempt(api_options)),
]
