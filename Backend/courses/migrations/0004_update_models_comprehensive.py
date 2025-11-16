# Generated migration for comprehensive model updates

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0003_course_category_course_thumbnail_image_and_more'),
    ]

    operations = [
        # Rename Chapter.number to Chapter.order
        migrations.RenameField(
            model_name='chapter',
            old_name='number',
            new_name='order',
        ),
        
        # Update Chapter unique_together
        migrations.AlterUniqueTogether(
            name='chapter',
            unique_together={('course', 'order')},
        ),
        
        # Add new fields to Chapter
        migrations.AddField(
            model_name='chapter',
            name='description',
            field=models.TextField(blank=True, default=''),
        ),
        migrations.AddField(
            model_name='chapter',
            name='content',
            field=models.TextField(blank=True, default=''),
        ),
        migrations.AddField(
            model_name='chapter',
            name='duration_minutes',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='chapter',
            name='is_free_preview',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='chapter',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
        
        # Remove old Chapter fields
        migrations.RemoveField(
            model_name='chapter',
            name='notes',
        ),
        migrations.RemoveField(
            model_name='chapter',
            name='extra_info',
        ),
        migrations.RemoveField(
            model_name='chapter',
            name='duration',
        ),
        
        # Add new fields to Course
        migrations.AddField(
            model_name='course',
            name='price',
            field=models.DecimalField(decimal_places=2, default=0.00, max_digits=10),
        ),
        migrations.AddField(
            model_name='course',
            name='is_free',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='course',
            name='difficulty_level',
            field=models.CharField(
                choices=[('beginner', 'Beginner'), ('intermediate', 'Intermediate'), ('advanced', 'Advanced')],
                default='beginner',
                max_length=20
            ),
        ),
        migrations.AddField(
            model_name='course',
            name='duration_hours',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='course',
            name='is_published',
            field=models.BooleanField(default=False),
        ),
        
        # Add new fields to Enrollment
        migrations.AddField(
            model_name='enrollment',
            name='is_active',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='enrollment',
            name='completion_date',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='enrollment',
            name='certificate_issued',
            field=models.BooleanField(default=False),
        ),
        
        # Rename Question.text to Question.question_text
        migrations.RenameField(
            model_name='question',
            old_name='text',
            new_name='question_text',
        ),
        
        # Add new fields to Question
        migrations.AddField(
            model_name='question',
            name='question_type',
            field=models.CharField(
                choices=[('multiple_choice', 'Multiple Choice'), ('true_false', 'True/False'), ('short_answer', 'Short Answer')],
                default='multiple_choice',
                max_length=20
            ),
        ),
        migrations.AddField(
            model_name='question',
            name='points',
            field=models.PositiveIntegerField(default=1),
        ),
        migrations.AddField(
            model_name='question',
            name='order',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='question',
            name='explanation',
            field=models.TextField(blank=True, default=''),
        ),
        migrations.AddField(
            model_name='question',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
        
        # Rename Option.text to Option.option_text
        migrations.RenameField(
            model_name='option',
            old_name='text',
            new_name='option_text',
        ),
        
        # Add order field to Option
        migrations.AddField(
            model_name='option',
            name='order',
            field=models.PositiveIntegerField(default=0),
        ),
        
        # Add new fields to Quiz
        migrations.RenameField(
            model_name='quiz',
            old_name='time_limit',
            new_name='time_limit_minutes',
        ),
        migrations.AddField(
            model_name='quiz',
            name='description',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='quiz',
            name='passing_score',
            field=models.PositiveIntegerField(default=70),
        ),
        migrations.AddField(
            model_name='quiz',
            name='max_attempts',
            field=models.PositiveIntegerField(default=3),
        ),
        migrations.AddField(
            model_name='quiz',
            name='is_active',
            field=models.BooleanField(default=True),
        ),
        
        # Update Quiz chapter relationship
        migrations.AlterField(
            model_name='quiz',
            name='chapter',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='quizzes',
                to='courses.chapter'
            ),
        ),
        
        # Add new fields to Progress
        migrations.AddField(
            model_name='progress',
            name='chapter',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='student_progress',
                to='courses.chapter'
            ),
        ),
        migrations.AddField(
            model_name='progress',
            name='time_spent_minutes',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='progress',
            name='last_accessed',
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AddField(
            model_name='progress',
            name='is_completed',
            field=models.BooleanField(default=False),
        ),
        
        # Rename StudentAnswer.submitted_at to StudentAnswer.answered_at
        migrations.RenameField(
            model_name='studentanswer',
            old_name='submitted_at',
            new_name='answered_at',
        ),
        
        # Add new fields to StudentAnswer
        migrations.AddField(
            model_name='studentanswer',
            name='answer_text',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='studentanswer',
            name='is_correct',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='studentanswer',
            name='time_taken_seconds',
            field=models.PositiveIntegerField(default=0),
        ),
    ]
