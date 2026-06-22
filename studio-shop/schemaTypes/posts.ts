import { defineType, defineField } from 'sanity'

// Категорії збігаються з товарними (CatalogPage/CategorySidebar) — щоб стаття
// могла вести CTA на релевантну категорію.
const CATEGORY_OPTIONS = [
  { title: 'Пневматичні гвинтівки', value: 'air_rifles' },
  { title: 'PCP гвинтівки', value: 'psp-rifles' },
  { title: 'Револьвери флобера', value: 'flobers' },
  { title: 'Пневматичні пістолети', value: 'pnevmo-pistols' },
  { title: 'Стартові пістолети', value: 'start-pistols' },
  { title: 'Перцеві балончики', value: 'pepper-sprays' },
]

export const post = defineType({
  name: 'post',
  title: 'Блог / Гайди',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Заголовок (H1)',
      type: 'string',
      validation: Rule => Rule.required().max(110),
    }),
    defineField({
      name: 'slug',
      title: 'URL (slug)',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Короткий опис (для картки та meta description)',
      type: 'text',
      rows: 3,
      validation: Rule => Rule.required().max(200),
    }),
    defineField({
      name: 'mainImage',
      title: 'Обкладинка',
      type: 'image',
      options: { hotspot: true },
      description: 'Використовується в списку, у статті та для прев’ю шеру (OG).',
    }),
    defineField({
      name: 'body',
      title: 'Текст статті',
      type: 'array',
      of: [
        { type: 'block' },
        { type: 'image', options: { hotspot: true } },
      ],
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Автор',
      type: 'string',
      initialValue: 'Команда AirSoft-UA',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'authorRole',
      title: 'Хто автор (експертиза)',
      type: 'string',
      description: 'Напр.: «консультант з пневматики». Підсилює довіру (E-E-A-T).',
    }),
    defineField({
      name: 'category',
      title: 'Повʼязана категорія (для CTA)',
      type: 'string',
      options: { list: CATEGORY_OPTIONS, layout: 'dropdown' },
    }),
    defineField({
      name: 'faq',
      title: 'FAQ (необовʼязково — генерує FAQPage schema)',
      type: 'array',
      of: [
        defineField({
          name: 'item',
          title: 'Питання-відповідь',
          type: 'object',
          fields: [
            { name: 'q', title: 'Питання', type: 'string', validation: Rule => Rule.required() },
            { name: 'a', title: 'Відповідь', type: 'text', rows: 3, validation: Rule => Rule.required() },
          ],
          preview: { select: { title: 'q' } },
        }),
      ],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Дата публікації',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'updatedAt',
      title: 'Дата оновлення',
      type: 'datetime',
      description: 'Оновлюй при правках — свіжість важлива для SEO/AI.',
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO <title> (необовʼязково)',
      type: 'string',
      description: 'Якщо порожньо — береться заголовок.',
      validation: Rule => Rule.max(65),
    }),
    defineField({
      name: 'published',
      title: 'Опубліковано',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  orderings: [
    {
      title: 'Дата публікації (нові спершу)',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: { title: 'title', subtitle: 'excerpt', media: 'mainImage', published: 'published' },
    prepare({ title, subtitle, media, published }) {
      return {
        title: `${published ? '' : '📝 (чернетка) '}${title}`,
        subtitle: subtitle?.slice(0, 70),
        media,
      }
    },
  },
})
