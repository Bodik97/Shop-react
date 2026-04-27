import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';

export const client = createClient({
  projectId: 'xzcx3aim', // Ваш ID з терміналу
  dataset: 'production',    // Ви вказували при створенні
  useCdn: true,             // true для швидкої відповіді (кеш), false для миттєвого оновлення
  apiVersion: '2024-01-01', // Дата поточної версії API
});

// Допоміжна функція для роботи з картинками (named import замість deprecated default)
const builder = createImageUrlBuilder(client);

export const urlFor = (source) => builder.image(source);