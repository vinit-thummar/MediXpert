import os
import django
import pandas as pd

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "medixpert_backend.settings")
django.setup()

from core.models import Symptom, Disease


def populate_symptoms():
    """Populate symptoms from CSV file"""
    df = pd.read_csv("data/symptoms.csv")

    for _, row in df.iterrows():
        symptom, created = Symptom.objects.get_or_create(
            name=row["symptom"], defaults={"description": row["description"]}
        )
        if created:
            print(f"Created symptom: {symptom.name}")
        else:
            print(f"Symptom already exists: {symptom.name}")


def populate_diseases():
    """Populate diseases from CSV file"""
    df = pd.read_csv("data/sample_diseases.csv")

    for _, row in df.iterrows():
        disease, created = Disease.objects.get_or_create(
            name=row["disease"],
            defaults={"description": row["description"], "severity": row["severity"]},
        )

        if created:
            print(f"Created disease: {disease.name}")

            # Add symptoms to disease
            symptom_names = row["symptoms"].split(",")
            for symptom_name in symptom_names:
                try:
                    symptom = Symptom.objects.get(name=symptom_name.strip())
                    disease.symptoms.add(symptom)
                    print(f"  Added symptom: {symptom.name}")
                except Symptom.DoesNotExist:
                    print(f"  Symptom not found: {symptom_name.strip()}")
        else:
            print(f"Disease already exists: {disease.name}")


if __name__ == "__main__":
    print("Populating database with sample data...")
    populate_symptoms()
    populate_diseases()
    print("Database population completed!")
