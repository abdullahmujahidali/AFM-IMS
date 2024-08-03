from django.utils.text import slugify


def generate_unique_slug(name, model):
    base_slug = slugify(name)
    slug = base_slug
    counter = 1
    while model.objects.filter(slug=slug).exists():
        slug = f"{base_slug}-{counter}"
        counter += 1
    return slug
