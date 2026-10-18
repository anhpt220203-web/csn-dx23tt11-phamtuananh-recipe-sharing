import { describe, expect, it } from 'vitest';

import { slugify } from './slugify';

describe('slugify', () => {
  it('bỏ dấu tiếng Việt và nối bằng gạch ngang', () => {
    expect(slugify('Cơm Gà Xối Mỡ')).toBe('com-ga-xoi-mo');
    expect(slugify('Bánh mì thịt nướng')).toBe('banh-mi-thit-nuong');
  });

  it('chuyển đ/Đ thành d', () => {
    expect(slugify('Đậu Đỏ')).toBe('dau-do');
    expect(slugify('đường phèn')).toBe('duong-phen');
  });

  it('loại bỏ ký tự đặc biệt và gộp khoảng trắng thừa', () => {
    expect(slugify('Bánh mì (pate) & chả!')).toBe('banh-mi-pate-cha');
    expect(slugify('  Gà   Rán  ')).toBe('ga-ran');
  });

  it('giữ lại số trong tiêu đề', () => {
    expect(slugify('Món 3 miền')).toBe('mon-3-mien');
  });

  it('chuẩn hóa slug đã có gạch ngang', () => {
    expect(slugify('com-tam')).toBe('com-tam');
    expect(slugify('--Gà--rán--')).toBe('ga-ran');
  });

  it('trả về chuỗi rỗng khi không còn ký tự hợp lệ', () => {
    expect(slugify('')).toBe('');
    expect(slugify('!!!')).toBe('');
    expect(slugify('   ')).toBe('');
  });
});
