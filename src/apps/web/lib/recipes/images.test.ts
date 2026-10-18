import { describe, expect, it } from 'vitest';

import { resolveRecipeImageSrc } from './images';

describe('resolveRecipeImageSrc', () => {
  it('trả về null khi image_url rỗng hoặc không hợp lệ', () => {
    expect(resolveRecipeImageSrc(null)).toBeNull();
    expect(resolveRecipeImageSrc(undefined)).toBeNull();
    expect(resolveRecipeImageSrc('')).toBeNull();
    expect(resolveRecipeImageSrc('   ')).toBeNull();
  });

  it('giữ nguyên preview blob: và data: URI từ client', () => {
    expect(resolveRecipeImageSrc('blob:http://localhost:3000/test-uuid')).toBe(
      'blob:http://localhost:3000/test-uuid',
    );
    expect(resolveRecipeImageSrc('data:image/png;base64,iVBORw0KGgo=')).toBe(
      'data:image/png;base64,iVBORw0KGgo=',
    );
  });

  it('giữ nguyên URL đã là proxy /api/image/...', () => {
    expect(resolveRecipeImageSrc('/api/image/recipe-images/ga-ran.png')).toBe(
      '/api/image/recipe-images/ga-ran.png',
    );
  });

  it('chuyển object path không có slash đầu thành /api/image/<path>', () => {
    expect(resolveRecipeImageSrc('recipe-images/ga-ran.png')).toBe(
      '/api/image/recipe-images/ga-ran.png',
    );
  });

  it('chuyển object path có slash đầu (/recipe-images/...) thành /api/image/recipe-images/...', () => {
    expect(resolveRecipeImageSrc('/recipe-images/ga-ran.png')).toBe(
      '/api/image/recipe-images/ga-ran.png',
    );
  });

  it('chuyển đường dẫn relative storage marker /storage/v1/object/public/...', () => {
    expect(
      resolveRecipeImageSrc('/storage/v1/object/public/recipe-images/ga-ran.png'),
    ).toBe('/api/image/recipe-images/ga-ran.png');
  });

  it('tách path từ URL storage đầy đủ của Supabase', () => {
    expect(
      resolveRecipeImageSrc(
        'https://xyz.supabase.co/storage/v1/object/public/recipe-images/ga-ran.png',
      ),
    ).toBe('/api/image/recipe-images/ga-ran.png');
  });

  it('chuyển đường dẫn legacy seed /images/recipes/<file> về bucket recipe-images', () => {
    expect(resolveRecipeImageSrc('/images/recipes/com-chien.jpg')).toBe(
      '/api/image/recipe-images/com-chien.jpg',
    );
    expect(resolveRecipeImageSrc('images/recipes/com-chien.jpg')).toBe(
      '/api/image/recipe-images/com-chien.jpg',
    );
  });

  it('chuyển tên file hoặc relative subpath thành /api/image/recipe-images/<path>', () => {
    expect(resolveRecipeImageSrc('recipes/uuid-123.jpg')).toBe(
      '/api/image/recipe-images/recipes/uuid-123.jpg',
    );
    expect(resolveRecipeImageSrc('anh-mon-an.png')).toBe(
      '/api/image/recipe-images/anh-mon-an.png',
    );
  });

  it('giữ nguyên các file tĩnh khác trong /public không thuộc công thức món ăn', () => {
    expect(resolveRecipeImageSrc('/images/logo-cong-thuc-mon-ngon.webp')).toBe(
      '/images/logo-cong-thuc-mon-ngon.webp',
    );
  });

  it('giữ nguyên URL ngoài không thuộc storage Supabase', () => {
    const external = 'https://cdn.example.com/anh-mon-an.jpg';
    expect(resolveRecipeImageSrc(external)).toBe(external);
  });
});
