import { describe, expect, it } from 'vitest';

import { resolveRecipeImageSrc } from './images';

describe('resolveRecipeImageSrc', () => {
  it('trả về null khi image_url rỗng', () => {
    expect(resolveRecipeImageSrc(null)).toBeNull();
    expect(resolveRecipeImageSrc(undefined)).toBeNull();
    expect(resolveRecipeImageSrc('')).toBeNull();
  });

  it('giữ nguyên đường dẫn nội bộ trong /public', () => {
    expect(resolveRecipeImageSrc('/images/placeholder.png')).toBe(
      '/images/placeholder.png',
    );
  });

  it('chuyển object path trong Storage thành /api/image/<path>', () => {
    expect(resolveRecipeImageSrc('recipe-images/ga-ran.png')).toBe(
      '/api/image/recipe-images/ga-ran.png',
    );
  });

  it('tách path từ URL storage đầy đủ của hệ thống', () => {
    expect(
      resolveRecipeImageSrc(
        'https://xyz.supabase.co/storage/v1/object/public/recipe-images/ga-ran.png',
      ),
    ).toBe('/api/image/recipe-images/ga-ran.png');
  });

  it('giữ nguyên URL ngoài không thuộc storage của hệ thống', () => {
    const external = 'https://cdn.example.com/anh-mon-an.jpg';

    expect(resolveRecipeImageSrc(external)).toBe(external);
  });
});
