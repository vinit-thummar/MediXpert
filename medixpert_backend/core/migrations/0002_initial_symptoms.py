from django.db import migrations

def create_initial_symptoms(apps, schema_editor):
    Symptom = apps.get_model('core', 'Symptom')
    symptoms = [
        "Fever",
        "Cough",
        "Fatigue",
        "Difficulty Breathing",
        "Headache",
        "Body Aches",
        "Sore Throat",
        "Runny Nose",
        "Nausea",
        "Diarrhea",
        "Loss of Taste or Smell",
        "Chest Pain",
        "Dizziness",
        "Vomiting",
        "Abdominal Pain",
        "Joint Pain",
        "Rash",
        "Chills",
        "Sweating",
        "Loss of Appetite"
    ]
    
    for symptom_name in symptoms:
        Symptom.objects.create(
            name=symptom_name,
            description=f"Patient experiences {symptom_name.lower()}"
        )

def remove_initial_symptoms(apps, schema_editor):
    Symptom = apps.get_model('core', 'Symptom')
    Symptom.objects.all().delete()

class Migration(migrations.Migration):
    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_initial_symptoms, remove_initial_symptoms),
    ]
