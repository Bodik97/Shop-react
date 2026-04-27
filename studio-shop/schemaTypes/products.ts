import { defineType, defineField } from 'sanity'

export const product = defineType({
  name: 'product',
  title: 'Товари',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Назва товару',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Посилання (Slug)',
      type: 'slug',
      options: { source: 'title' },
      description: 'Генерується автоматично з назви. Використовується для URL.'
    }),
    defineField({
      name: 'price',
      title: 'Ціна (грн)',
      type: 'number',
    }),
    defineField({
      name: 'oldPrice',
      title: 'Стара ціна (для знижки)',
      type: 'number',
    }),
    defineField({
      name: 'mainImage',
      title: 'Головне фото',
      type: 'image',
      options: { hotspot: true }
    }),
    defineField({
      name: 'images',
      title: 'Галерея фото (imgs)',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }]
    }),
    defineField({
      name: 'videoUrl',
      title: 'Посилання на відео (YouTube/Vimeo)',
      type: 'url',
    }),
    defineField({
      name: 'description',
      title: 'Опис',
      type: 'text',
    }),
    defineField({
      name: 'category',
      title: 'Категорія',
      type: 'string',
      options: {
        list: [
          { title: 'Пневматичні гвинтівки', value: 'air_rifles' },
          { title: 'PCP гвинтівки', value: 'psp-rifles' },
          { title: 'Револьвери флобера', value: 'flobers' },
          { title: 'Пневматичні пістолети', value: 'pvevmo-pistols' },
          { title: 'Стартові пістолети', value: 'start-pistols' },
          { title: 'Аксесуари', value: 'accessories' },
        ]
      }
    }),
    defineField({
      name: 'popularityScore',
      title: 'Рейтинг популярності (для сортування)',
      type: 'number',
      description: 'Чим більше число — тим вище в списку Товари Популярні '
    }),
    defineField({
      name: 'order',
      title: 'Пріоритет на сторінці категорії',
      type: 'number',
      description: 'Чим менше число — тим вище товар у своїй категорії. Залиште порожнім, щоб відобразити в кінці списку.',
      validation: Rule => Rule.integer().min(0)
    }),
    // Характеристики (specs)
    defineField({
      name: 'specs',
      title: 'Характеристики',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'label', type: 'string', title: 'Назва (напр. Калібр)' },
          { name: 'value', type: 'string', title: 'Значення (напр. 4,5)' }
        ]
      }]
    }),
    // Бейджі та подарунки
    defineField({
      name: 'giftBadge',
      title: 'Текст бейджа (напр. Подарунок)',
      type: 'string',
    }),
    defineField({
      name: 'giftText',
      title: 'Опис подарунка',
      type: 'string',
    }),
    defineField({
      name: 'warranty',
      title: 'Гарантія',
      type: 'string',
    }),
    defineField({
      name: 'stock',
      title: 'Кількість в наявності',
      type: 'number',
    }),
    defineField({
      name: 'popular',
      title: 'Популярний товар',
      type: 'boolean',
    }),
    // Аддони (Додаткові товари)
    defineField({
      name: 'addons',
      title: 'Додаткові товари (Addons)',
      type: 'array',
      of: [{
        type: 'object',
        name: 'addon',
        fields: [
          { name: 'name', type: 'string', title: 'Назва' },
          { name: 'price', type: 'number', title: 'Ціна' },
          { name: 'image', type: 'image', title: 'Фото аддона' } // Додали картинку для аддона
        ]
      }]
    }),
  ]
})