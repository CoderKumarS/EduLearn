# Generated migration for converting chapter data to topics

from django.db import migrations
from django.utils import timezone


def migrate_chapter_content_to_topics(apps, schema_editor):
    """
    Migrate existing chapter content to Topic model.
    For chapters without topics, create a default topic from chapter content.
    
    Note: This migration runs after the removal of chapter.topics, chapter.video_url,
    and chapter.duration_minutes fields (migration 0009). If you need to migrate
    data from those fields, restore them temporarily before running this migration.
    """
    Chapter = apps.get_model('courses', 'Chapter')
    Topic = apps.get_model('courses', 'Topic')
    
    chapters = Chapter.objects.all()
    created_count = 0
    skipped_count = 0
    empty_chapters = 0
    
    for chapter in chapters:
        # Check if chapter already has topics
        existing_topics = Topic.objects.filter(chapter=chapter).count()
        
        if existing_topics > 0:
            # Chapter already has topics, skip
            skipped_count += 1
            continue
        
        # Create a default topic from chapter content if chapter has content
        if chapter.content and chapter.content.strip():
            # Chapter has content, create a topic from it
            Topic.objects.create(
                chapter=chapter,
                title=f"{chapter.title} - Overview",
                content=chapter.content,
                example='',
                video_url='',
                order=1,
                duration_minutes=15,  # Default 15 minutes
                created_at=timezone.now(),
                updated_at=timezone.now()
            )
            created_count += 1
        elif chapter.description and chapter.description.strip():
            # No content but has description, use that
            Topic.objects.create(
                chapter=chapter,
                title=f"{chapter.title} - Introduction",
                content=chapter.description,
                example='',
                video_url='',
                order=1,
                duration_minutes=10,  # Default 10 minutes
                created_at=timezone.now(),
                updated_at=timezone.now()
            )
            created_count += 1
        else:
            # Create a placeholder topic for empty chapters
            Topic.objects.create(
                chapter=chapter,
                title=f"{chapter.title} - Getting Started",
                content=f"Welcome to {chapter.title}. This chapter will cover important concepts. Content will be added by the instructor.",
                example='',
                video_url='',
                order=1,
                duration_minutes=5,  # Default 5 minutes for placeholder
                created_at=timezone.now(),
                updated_at=timezone.now()
            )
            created_count += 1
            empty_chapters += 1
    
    print(f"Migration complete:")
    print(f"  - Created {created_count} topics")
    print(f"  - Skipped {skipped_count} chapters (already have topics)")
    print(f"  - Empty chapters with placeholders: {empty_chapters}")


def reverse_migration(apps, schema_editor):
    """
    Reverse the migration by removing auto-generated topics.
    Only removes topics that match the pattern of auto-generated content.
    """
    Topic = apps.get_model('courses', 'Topic')
    
    # Remove topics that were auto-generated (have "Overview" or "Introduction" in title)
    auto_generated = Topic.objects.filter(
        title__icontains='Overview'
    ) | Topic.objects.filter(
        title__icontains='Introduction'
    )
    
    count = auto_generated.count()
    auto_generated.delete()
    print(f"Rollback complete: Removed {count} auto-generated topics")


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0009_remove_deprecated_chapter_fields'),
    ]

    operations = [
        migrations.RunPython(
            migrate_chapter_content_to_topics,
            reverse_migration
        ),
    ]
