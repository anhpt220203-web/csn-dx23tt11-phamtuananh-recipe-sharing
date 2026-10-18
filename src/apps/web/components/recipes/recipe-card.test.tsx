import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { RecipeCard } from './recipe-card';
import type { RecipeWithCategory } from '~/lib/recipes/database';

// next/link cần App Router context khi render thật — mock thành <a> thường.
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Nút yêu thích dùng server action + next/navigation — nằm ngoài phạm vi
// unit test của card nên mock gọn.
vi.mock('./recipe-card-favorite-button', () => ({
  RecipeCardFavoriteButton: () => (
    <button type="button" data-testid="favorite-button" />
  ),
}));

function makeRecipe(
  overrides: Partial<RecipeWithCategory> = {},
): RecipeWithCategory {
  return {
    id: 1,
    category_id: 2,
    title: 'Gà rán sốt bơ tỏi',
    slug: 'ga-ran-sot-bo-toi',
    description: 'Gà rán giòn rụm, sốt bơ tỏi thơm lừng.',
    image_url: 'recipe-images/ga-ran-sot-bo-toi.png',
    source_name: null,
    source_url: null,
    servings: 4,
    cook_time: 45,
    prep_time: 15,
    difficulty: 'Dễ',
    status: 'published',
    created_by: null,
    calories: null,
    protein_g: null,
    carbs_g: null,
    sugar_g: null,
    fat_g: null,
    fiber_g: null,
    category_name: 'Món chiên',
    category_slug: 'mon-chien',
    ...overrides,
  };
}

describe('RecipeCard', () => {
  it('render đầy đủ thông tin ở happy path', () => {
    render(
      <RecipeCard
        recipe={makeRecipe()}
        rating={{ average: 4.5, count: 12 }}
      />,
    );

    // Tiêu đề và link chi tiết.
    expect(screen.getByText('Gà rán sốt bơ tỏi')).toBeDefined();
    const detailLink = screen.getByRole('link', {
      name: 'Xem công thức Gà rán sốt bơ tỏi',
    });
    expect(detailLink.getAttribute('href')).toBe(
      '/cong-thuc/ga-ran-sot-bo-toi',
    );

    // Ảnh đi qua /api/image (không lộ URL storage gốc).
    const img = screen.getByRole('img', { name: 'Gà rán sốt bơ tỏi' });
    expect(img.getAttribute('src')).toBe(
      '/api/image/recipe-images/ga-ran-sot-bo-toi.png',
    );

    // Badge nhóm món, khẩu phần, độ khó, thời gian, đánh giá.
    expect(screen.getByText('Món chiên')).toBeDefined();
    expect(screen.getByText('4 người')).toBeDefined();
    expect(screen.getByText('Dễ')).toBeDefined();
    expect(screen.getByText('45 phút')).toBeDefined();
    expect(screen.getByText('4.5')).toBeDefined();
    expect(screen.getByText('(12)')).toBeDefined();
  });

  it('render placeholder khi thiếu ảnh và ẩn đánh giá khi chưa có', () => {
    const { container } = render(
      <RecipeCard
        recipe={makeRecipe({ image_url: null, cook_time: 90 })}
      />,
    );

    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByText('Gà rán sốt bơ tỏi')).toBeDefined();
    // Nhánh giờ + phút của formatCookTime.
    expect(screen.getByText('1 giờ 30 phút')).toBeDefined();
    // Không có rating prop -> không render điểm.
    expect(screen.queryByText('(12)')).toBeNull();
  });
});
