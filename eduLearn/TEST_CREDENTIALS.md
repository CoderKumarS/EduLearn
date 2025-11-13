# Test Credentials

## Current Working Credentials

Based on the successful test, these credentials work:

```json
{
  "username": "instructor1",
  "password": "StrongPass123!"
}
```

## How to Add/Edit Users in Django

### Method 1: Django Admin Panel

1. Create superuser (if not already done):
   ```bash
   cd D:\LMS\Backend
   python manage.py createsuperuser
   ```

2. Access admin panel:
   - URL: `http://127.0.0.1:8000/admin/`
   - Login with superuser credentials
   - Navigate to Users section
   - Add/Edit users as needed

### Method 2: Django Shell

```bash
cd D:\LMS\Backend
python manage.py shell
```

Then:

```python
from django.contrib.auth.models import User

# Create new user
User.objects.create_user(
    username='student1',
    password='StudentPass123!',
    email='student1@example.com'
)

# Change existing user password
user = User.objects.get(username='instructor1')
user.set_password('NewPassword123!')
user.save()

# List all users
for user in User.objects.all():
    print(f"{user.username} - {user.email}")
```

### Method 3: Django Management Command

Create a custom management command in your Django app:

`your_app/management/commands/create_test_users.py`:

```python
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Creates test users'

    def handle(self, *args, **kwargs):
        users = [
            {'username': 'student1', 'password': 'Pass123!', 'email': 'student1@test.com'},
            {'username': 'instructor1', 'password': 'Pass123!', 'email': 'instructor1@test.com'},
            {'username': 'admin1', 'password': 'Pass123!', 'email': 'admin1@test.com'},
        ]
        
        for user_data in users:
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults={'email': user_data['email']}
            )
            if created:
                user.set_password(user_data['password'])
                user.save()
                self.stdout.write(f"Created user: {user.username}")
            else:
                self.stdout.write(f"User already exists: {user.username}")
```

Then run:
```bash
python manage.py create_test_users
```

## Recommended Test Users

For testing the app, create these users:

| Username | Password | Role |
|----------|----------|------|
| student1 | StudentPass123! | Student |
| instructor1 | InstructorPass123! | Instructor |
| admin1 | AdminPass123! | Admin |

## Security Note

⚠️ These are TEST credentials only. Never use simple passwords in production!
