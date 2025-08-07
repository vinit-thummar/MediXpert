from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"symptoms", views.SymptomViewSet)
router.register(r"diseases", views.DiseaseViewSet)
router.register(r"user-profiles", views.UserProfileViewSet, basename="userprofile")
router.register(r"predictions", views.PredictionViewSet, basename="prediction")
router.register(r"health-records", views.HealthRecordViewSet, basename="healthrecord")

urlpatterns = [
    path("", include(router.urls)),
    path("register/", views.register, name="register"),
    path("login/", views.login_view, name="login"),
    path("predict/", views.predict_disease, name="predict_disease"),
    path("health-check/", views.health_check, name="health_check"),
    path("dashboard/", views.user_dashboard, name="user_dashboard"),
]
