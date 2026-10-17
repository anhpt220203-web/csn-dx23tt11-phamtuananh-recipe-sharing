/**
 * Tạo slug từ chuỗi tiếng Việt.
 *
 * Bỏ dấu (đ -> d), thường hóa, loại ký tự đặc biệt, thay khoảng trắng
 * bằng gạch ngang. Dùng cho slug công thức / danh mục trong trang admin.
 */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
