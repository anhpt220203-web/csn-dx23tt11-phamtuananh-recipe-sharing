vi.mock('server-only', () => ({}));

// Module import getSupabaseServerAdminClient nhưng chỉ GỌI sau khi validate
// xong — các test validate sớm không cần client thật, mock gọn để import an toàn.
vi.mock('@kit/supabase/server-admin-client', () => ({
  getSupabaseServerAdminClient: vi.fn(),
}));

import { describe, expect, it, vi } from 'vitest';

import { uploadRecipeImage } from './upload-recipe-image';

function makeFile(size: number, type: string, name = 'anh.png'): File {
  return new File(['x'.repeat(size)], name, { type });
}

describe('uploadRecipeImage — validate đầu vào', () => {
  it('file rỗng -> ném lỗi', async () => {
    await expect(
      uploadRecipeImage(makeFile(0, 'image/png')),
    ).rejects.toThrow('File ảnh rỗng.');
  });

  it('file vượt quá 5MB -> ném lỗi', async () => {
    await expect(
      uploadRecipeImage(makeFile(5 * 1024 * 1024 + 1, 'image/png')),
    ).rejects.toThrow('Ảnh vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn.');
  });

  it('file đúng 5MB vẫn được chấp nhận qua vòng validate', async () => {
    // Không assert upload thành công (cần Storage thật) — chỉ đảm bảo
    // không ném lỗi validate kích thước. Hàm sẽ đi tiếp tới
    // getSupabaseServerAdminClient (đã mock) nên có thể ném lỗi khác,
    // nhưng KHÔNG phải lỗi validate.
    const promise = uploadRecipeImage(makeFile(5 * 1024 * 1024, 'image/png'));

    await expect(promise).rejects.not.toThrow(
      'Ảnh vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn.',
    );
  });

  it('file không phải ảnh -> ném lỗi', async () => {
    await expect(
      uploadRecipeImage(makeFile(10, 'text/plain', 'ghi-chu.txt')),
    ).rejects.toThrow('Chỉ chấp nhận file ảnh.');
  });

  it('file ảnh hợp lệ qua được vòng validate (không ném lỗi validate)', async () => {
    const promise = uploadRecipeImage(makeFile(100, 'image/jpeg', 'anh.jpg'));

    await expect(promise).rejects.not.toThrow('File ảnh rỗng.');
    await expect(promise).rejects.not.toThrow('Chỉ chấp nhận file ảnh.');
  });
});
