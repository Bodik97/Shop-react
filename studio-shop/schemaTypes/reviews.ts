import { defineType, defineField } from 'sanity'

export const review = defineType({
  name: 'review',
  title: 'Відгуки',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: "Ім'я клієнта",
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'rating',
      title: 'Рейтинг (1-5 зірок)',
      type: 'number',
      validation: Rule => Rule.required().min(1).max(5).integer(),
      initialValue: 5,
    }),
    defineField({
      name: 'message',
      title: 'Текст відгуку',
      type: 'text',
      rows: 4,
      validation: Rule => Rule.required().max(500),
    }),
    defineField({
      name: 'image',
      title: 'Фото',
      type: 'image',
      options: { hotspot: true },
      description: 'Фото клієнта, товару або процесу використання.',
    }),
    defineField({
      name: 'order',
      title: 'Пріоритет (порядок у слайдері)',
      type: 'number',
      description:
        'Чим менше число — тим раніше відгук показується. Залиште порожнім, щоб додати в кінець.',
      validation: Rule => Rule.integer().min(0),
    }),
    defineField({
      name: 'published',
      title: 'Опубліковано (показувати в слайдері)',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'message',
      media: 'image',
      rating: 'rating',
    },
    prepare({ title, subtitle, media, rating }) {
      return {
        title: title,
        subtitle: `${'⭐'.repeat(rating || 0)} ${subtitle?.slice(0, 60) || ''}`,
        media,
      }
    },
  },
})
