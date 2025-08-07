from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from .models import Symptom, Disease, UserProfile, Prediction, HealthRecord
from .serializers import (
    SymptomSerializer,
    DiseaseSerializer,
    UserProfileSerializer,
    PredictionSerializer,
    HealthRecordSerializer,
    PredictionCreateSerializer,
    UserRegistrationSerializer,
    UserSerializer,
)
import joblib
import os
import numpy as np


class SymptomViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Symptom.objects.all()
    serializer_class = SymptomSerializer
    permission_classes = [AllowAny]


class DiseaseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Disease.objects.all()
    serializer_class = DiseaseSerializer
    permission_classes = [AllowAny]


from typing import Any, Dict, TypedDict, List, Optional
from django.db.models.query import QuerySet
from rest_framework.request import Request
from rest_framework.response import Response

class PredictionData(TypedDict):
    symptoms: List[str]
    additional_symptoms: str
    notes: str

class UserProfileViewSet(viewsets.ModelViewSet):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self) -> "QuerySet[UserProfile]":  # type: ignore
        return UserProfile.objects.filter(user=self.request.user)


class PredictionViewSet(viewsets.ModelViewSet):
    serializer_class = PredictionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self) -> "QuerySet[Prediction]":  # type: ignore
        return Prediction.objects.filter(user=self.request.user)


class HealthRecordViewSet(viewsets.ModelViewSet):
    serializer_class = HealthRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self) -> "QuerySet[HealthRecord]":  # type: ignore
        return HealthRecord.objects.filter(user=self.request.user)


@api_view(["POST", "OPTIONS"])
@permission_classes([AllowAny])
def register(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response(
            {"message": "User created successfully", "user": UserSerializer(user).data},
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST", "OPTIONS"])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get("username")
    password = request.data.get("password")

    if username and password:
        user = authenticate(username=username, password=password)
        if user:
            from rest_framework_simplejwt.tokens import RefreshToken

            refresh = RefreshToken.for_user(user)

            return Response(
                {
                    "message": "Login successful",
                    "user": UserSerializer(user).data,
                    "token": str(refresh.access_token),
                    "refresh": str(refresh),
                }
            )
        else:
            return Response(
                {"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
            )
    return Response(
        {"error": "Username and password required"}, status=status.HTTP_400_BAD_REQUEST
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def predict_disease(request: Request) -> Response:
    serializer = PredictionCreateSerializer(data=request.data)
    if serializer.is_valid():
        validated_data = {str(k): v for k, v in serializer.validated_data.items()}  # type: ignore
        symptoms_list: List[str] = validated_data.get("symptoms", [])
        additional_symptoms: str = validated_data.get("additional_symptoms", "")
        notes: str = validated_data.get("notes", "")

        print(f"Debug - Received symptoms: {symptoms_list}")  # Debug log

        # Load ML model and make prediction
        try:
            import sys
            import os  # Add os import here

            sys.path.append(os.path.dirname(__file__))
            from ml_model import DiseasePredictor

            predictor = DiseasePredictor()
            if predictor.load_model():
                predicted_disease_name, confidence = predictor.predict_disease(
                    symptoms_list
                )
                
                print(f"Debug - Predicted disease: {predicted_disease_name}, confidence: {confidence}")  # Debug log

                # Find the disease object
                try:
                    predicted_disease = Disease.objects.get(name=predicted_disease_name)
                    print(f"Debug - Found disease in database: {predicted_disease.name}")  # Debug log
                except Disease.DoesNotExist:
                    print(f"Debug - Disease not found in database: {predicted_disease_name}")  # Debug log
                    return Response(
                        {"error": f"Predicted disease '{predicted_disease_name}' not found in database"},
                        status=status.HTTP_404_NOT_FOUND,
                    )

                # Find symptoms in database
                symptoms = Symptom.objects.filter(name__in=symptoms_list)

                # Create prediction record
                prediction = Prediction.objects.create(
                    user=request.user,
                    predicted_disease=predicted_disease,
                    confidence_score=confidence * 100,  # Convert to percentage
                    additional_symptoms=additional_symptoms,
                    notes=notes,
                )
                prediction.symptoms.set(symptoms)

                return Response(
                    {
                        "prediction": PredictionSerializer(prediction).data,
                        "message": "Prediction created successfully using ML model",
                    }
                )
            else:
                # Fallback to simple logic if model loading fails
                return _simple_prediction_fallback(
                    request, symptoms_list, additional_symptoms, notes
                )

        except Exception as e:
            print(f"ML prediction error: {e}")
            # Fallback to simple logic
            return _simple_prediction_fallback(
                request, symptoms_list, additional_symptoms, notes
            )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def _simple_prediction_fallback(request, symptoms_list, additional_symptoms, notes):
    """Fallback prediction method using simple symptom matching"""
    # Remove duplicates from symptoms list while preserving order
    symptoms_list = list(dict.fromkeys(symptoms_list))
    print(f"Debug - Fallback method symptoms (after deduplication): {symptoms_list}")
    print(f"Debug - All diseases in DB: {[d.name for d in Disease.objects.all()]}")
    for disease in Disease.objects.all():
        print(f"Debug - Disease: {disease.name}, Symptoms: {[s.name for s in disease.symptoms.all()]}")

    # Find symptoms in database
    symptoms = Symptom.objects.filter(name__in=symptoms_list)
    
    if not symptoms.exists():
        return Response(
            {"error": "No valid symptoms found"}, status=status.HTTP_400_BAD_REQUEST
        )

    print(f"Debug - Found {symptoms.count()} valid symptoms in database")

    # Simple prediction logic - find disease with most matching symptoms
    diseases = Disease.objects.all()
    best_match = None
    best_score = 0
    
    symptom_ids = set(symptoms.values_list("id", flat=True))

    for disease in diseases:
        disease_symptom_ids = set(disease.symptoms.values_list("id", flat=True))
        matching_count = len(symptom_ids.intersection(disease_symptom_ids))
        total_symptoms = len(disease_symptom_ids)
        
        # Calculate score based on both matching ratio and absolute number of matches
        score = (matching_count / total_symptoms) if total_symptoms > 0 else 0
        
        print(f"Debug - Disease: {disease.name}, Score: {score}, Matches: {matching_count}/{total_symptoms}")
        
        if score > best_score:
            best_score = score
            best_match = disease

    if best_match:
        print(f"Debug - Best match found: {best_match.name} with score {best_score}")
        # Create prediction record
        prediction = Prediction.objects.create(
            user=request.user,
            predicted_disease=best_match,
            confidence_score=best_score * 100,  # Convert to percentage
            additional_symptoms=additional_symptoms,
            notes=notes,
        )
        prediction.symptoms.set(symptoms)

        return Response(
            {
                "prediction": PredictionSerializer(prediction).data,
                "message": "Prediction created successfully using fallback method",
            }
        )
    else:
        print("Debug - No matching disease found")
        return Response(
            {"error": "No matching disease found"}, status=status.HTTP_404_NOT_FOUND
        )


@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    return Response({"status": "healthy", "message": "MediXpert API is running"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_dashboard(request):
    user = request.user
    predictions = Prediction.objects.filter(user=user)[:5]  # Last 5 predictions
    health_records = HealthRecord.objects.filter(user=user)[:5]  # Last 5 records

    return Response(
        {
            "user": UserSerializer(user).data,
            "recent_predictions": PredictionSerializer(predictions, many=True).data,
            "recent_health_records": HealthRecordSerializer(
                health_records, many=True
            ).data,
            "total_predictions": Prediction.objects.filter(user=user).count(),
            "total_health_records": HealthRecord.objects.filter(user=user).count(),
        }
    )
