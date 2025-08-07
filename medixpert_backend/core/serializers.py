from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Symptom, Disease, UserProfile, Prediction, HealthRecord


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "date_joined"]


class SymptomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Symptom
        fields = ["id", "name", "description", "created_at"]


class DiseaseSerializer(serializers.ModelSerializer):
    symptoms = SymptomSerializer(many=True, read_only=True)

    class Meta:
        model = Disease
        fields = ["id", "name", "description", "symptoms", "severity", "created_at"]


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            "id",
            "user",
            "age",
            "gender",
            "phone",
            "emergency_contact",
            "medical_history",
            "created_at",
        ]


class PredictionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    symptoms = SymptomSerializer(many=True, read_only=True)
    predicted_disease = DiseaseSerializer(read_only=True)

    class Meta:
        model = Prediction
        fields = [
            "id",
            "user",
            "symptoms",
            "predicted_disease",
            "confidence_score",
            "additional_symptoms",
            "notes",
            "timestamp",
        ]


class HealthRecordSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    prediction = PredictionSerializer(read_only=True)

    class Meta:
        model = HealthRecord
        fields = [
            "id",
            "user",
            "prediction",
            "doctor_notes",
            "prescription",
            "follow_up_date",
            "status",
            "created_at",
            "updated_at",
        ]


class PredictionCreateSerializer(serializers.Serializer):
    symptoms = serializers.ListField(child=serializers.CharField())
    additional_symptoms = serializers.CharField(required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "first_name",
            "last_name",
            "password",
            "password_confirm",
        ]

    def validate(self, data):
        if data["password"] != data["password_confirm"]:
            raise serializers.ValidationError("Passwords don't match")
        return data

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user)
        return user
