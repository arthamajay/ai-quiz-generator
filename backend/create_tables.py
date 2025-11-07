# insert_students.py
from database import SessionLocal
from models import Student

db = SessionLocal()

students = [
    Student(id=6701,name="Abhilash", age=23),
    Student(id=6702,name="Abhinav", age=19)
]

db.add_all(students)
db.commit()

print("✅ Inserted students successfully!")
db.close()
