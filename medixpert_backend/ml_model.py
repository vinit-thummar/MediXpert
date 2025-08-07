import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, MultiLabelBinarizer
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib
import os
import django

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "medixpert_backend.settings")
django.setup()

from core.models import Symptom, Disease


class DiseasePredictor:
    def __init__(self):
        self.model = None
        self.symptom_encoder = None
        self.disease_encoder = None
        self.symptom_names = []

    def prepare_data(self):
        """Prepare training data from database"""
        print("Preparing training data...")

        # Get all symptoms and diseases from database
        symptoms = list(Symptom.objects.all().values_list("name", flat=True))
        diseases = Disease.objects.all()

        self.symptom_names = symptoms

        # Create training data
        X_data = []
        y_data = []

        for disease in diseases:
            disease_symptoms = list(disease.symptoms.values_list("name", flat=True))

            # Create binary vector for symptoms
            symptom_vector = [
                1 if symptom in disease_symptoms else 0 for symptom in symptoms
            ]

            X_data.append(symptom_vector)
            y_data.append(disease.name)

            # Create variations with partial symptoms (data augmentation)
            if len(disease_symptoms) > 1:
                # Create more samples with 60-90% of symptoms
                for i in range(5):  # Increased from 3 to 5
                    sample_size = max(1, int(len(disease_symptoms) * (0.6 + i * 0.075)))
                    if sample_size < len(disease_symptoms):
                        sampled_symptoms = np.random.choice(
                            disease_symptoms, sample_size, replace=False
                        )
                    else:
                        sampled_symptoms = disease_symptoms

                    symptom_vector = [
                        1 if symptom in sampled_symptoms else 0 for symptom in symptoms
                    ]
                    X_data.append(symptom_vector)
                    y_data.append(disease.name)

        return np.array(X_data), np.array(y_data)

    def train_model(self):
        """Train the disease prediction model"""
        print("Training disease prediction model...")

        X, y = self.prepare_data()

        if len(X) == 0:
            print("No training data available!")
            return False

        # Split data
        if len(X) < 30:  # If we have limited data, don't use stratify
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.3, random_state=42
            )
        else:
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, stratify=y
            )

        # Train Random Forest model
        self.model = RandomForestClassifier(
            n_estimators=100, max_depth=10, random_state=42, class_weight="balanced"
        )

        self.model.fit(X_train, y_train)

        # Evaluate model
        y_pred = self.model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)

        print(f"Model Accuracy: {accuracy:.2f}")
        print("\nClassification Report:")
        print(classification_report(y_test, y_pred))

        return True

    def predict_disease(self, symptoms):
        """Predict disease based on symptoms"""
        if not self.model or not self.symptom_names:
            print("Model or symptom names not initialized")
            return None, 0.0

        # Normalize symptoms (lowercase and strip whitespace)
        symptoms = [s.lower().strip() for s in symptoms]
        symptom_names_normalized = [s.lower().strip() for s in self.symptom_names]
        
        print(f"Predicting disease for symptoms: {symptoms}")
        print(f"Available symptoms: {symptom_names_normalized}")

        # Create symptom vector
        symptom_vector = [1 if symptom in symptom_names_normalized else 0 for symptom in symptom_names_normalized]
        print(f"Created symptom vector with {sum(symptom_vector)} active symptoms")

        # Make prediction
        try:
            if sum(symptom_vector) == 0:
                print("No valid symptoms found in input")
                return None, 0.0

            # Get prediction probabilities
            proba = self.model.predict_proba([symptom_vector])[0]
            predicted_class = self.model.predict([symptom_vector])[0]
            confidence = max(proba)

            print(f"Predicted disease: {predicted_class} with confidence: {confidence:.2f}")
            
            # If confidence is too low, return None
            if confidence < 0.2:  # Lowered threshold from 0.3 to 0.2
                print(f"Confidence too low ({confidence:.2f}), returning None")
                return None, 0.0
                
            return predicted_class, confidence
        except Exception as e:
            print(f"Prediction error: {e}")
            return None, 0.0

    def get_feature_importance(self):
        """Get feature importance for symptoms"""
        if not self.model:
            return None

        importance = self.model.feature_importances_
        feature_importance = list(zip(self.symptom_names, importance))
        feature_importance.sort(key=lambda x: x[1], reverse=True)

        return feature_importance

    def save_model(self, filepath="models/disease_predictor.pkl"):
        """Save the trained model"""
        os.makedirs(os.path.dirname(filepath), exist_ok=True)

        model_data = {"model": self.model, "symptom_names": self.symptom_names}

        joblib.dump(model_data, filepath)
        print(f"Model saved to {filepath}")

    def load_model(self, filepath="models/disease_predictor.pkl"):
        """Load a trained model"""
        if os.path.exists(filepath):
            model_data = joblib.load(filepath)
            self.model = model_data["model"]
            self.symptom_names = model_data["symptom_names"]
            print(f"Model loaded from {filepath}")
            return True
        else:
            print(f"Model file not found: {filepath}")
            return False


def train_and_save_model():
    """Train and save the disease prediction model"""
    predictor = DiseasePredictor()

    if predictor.train_model():
        predictor.save_model()

        # Show feature importance
        print("\nTop 10 Most Important Symptoms:")
        importance = predictor.get_feature_importance()
        if importance:
            for symptom, score in importance[:10]:
                print(f"{symptom}: {score:.4f}")
        else:
            print("No feature importance available.")

        return True
    return False


if __name__ == "__main__":
    print("Starting ML model training...")
    success = train_and_save_model()
    if success:
        print("Model training completed successfully!")
    else:
        print("Model training failed!")
