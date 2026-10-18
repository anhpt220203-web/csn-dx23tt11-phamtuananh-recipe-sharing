vi.mock('server-only', () => ({}));

// uploadRecipeImage chỉ gọi getSupabaseServerAdminClient sau khi validate
// xong — dựng mock storage tối thiểu để test được happy path thật thay vì
// dựa vào lỗi phụ khi client là undefined.
vi.mock('@kit/supabase/server-admin-client', () => ({
  getSupabaseServerAdminClient: vi.fn(),
}));

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import { uploadRecipeImage } from './upload-recipe-image';

const PUBLIC_URL = 'https://cdn.example/recipe-images/recipes/abc.png';

type StorageFns = {
  upload: ReturnType<typeof vi.fn>;
  getPublicUrl: ReturnType<typeof vi.fn>;
  from: ReturnType<typeof vi.fn>;
};

function setAdminStorageMock(uploadError: { message: string } | null = null): StorageFns {
  const upload = vi.fn().mockResolvedValue({ error: uploadError });
  const getPublicUrl = vi
    .fn()
    .mockReturnValue({ data: { publicUrl: PUBLIC_URL } });
  const from = vi.fn().mockReturnValue({ upload, getPublicUrl });

  vi.mocked(getSupabaseServerAdminClient).mockReturnValue(
    { storage: { from } } as unknown as ReturnType<
      typeof getSupabaseServerAdminClient
    >,
  );

  return { upload, getPublicUrl, from };
}

beforeEach(() => {
  vi.mocked(getSupabaseServerAdminClient).mockReset();
});

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

  it('file không phải ảnh -> ném lỗi', async () => {
    await expect(
      uploadRecipeImage(makeFile(10, 'text/plain', 'ghi-chu.txt')),
    ).rejects.toThrow('Chỉ chấp nhận file ảnh.');
  });

  it('file lỗi -> admin client không được gọi (dừng ngay vòng validate)', async () => {
    await expect(
      uploadRecipeImage(makeFile(10, 'text/plain', 'ghi-chu.txt')),
    ).rejects.toThrow();

    expect(getSupabaseServerAdminClient).not.toHaveBeenCalled();
  });
});

describe('uploadRecipeImage — happy path', () => {
  it('file hợp lệ -> upload lên bucket recipe-images, trả về public URL', async () => {
    const { upload, getPublicUrl, from } = setAdminStorageMock();
    const file = makeFile(100, 'image/jpeg', 'anh.jpg');

    const url = await uploadRecipeImage(file);

    expect(url).toBe(PUBLIC_URL);
    expect(from).toHaveBeenCalledWith('recipe-images');

    expect(upload).toHaveBeenCalledTimes(1);
    const [path, uploadedFile, options] = upload.mock.calls[0]!;
    expect(path).toMatch(/^recipes\/\d+-[0-9a-f-]+\.jpg$/);
    expect(uploadedFile).toBe(file);
    expect(options).toEqual({ contentType: 'image/jpeg', upsert: false });

    expect(getPublicUrl).toHaveBeenCalledTimes(1);
  });

  it('file đúng 5MB được chấp nhận và upload thành công', async () => {
    const { upload } = setAdminStorageMock();

    const url = await uploadRecipeImage(
      makeFile(5 * 1024 * 1024, 'image/png'),
    );

    expect(url).toBe(PUBLIC_URL);
    const [path] = upload.mock.calls[0]!;
    expect(path).toMatch(/^recipes\/\d+-[0-9a-f-]+\.png$/);
  });

  it('lỗi upload -> ném lỗi có tiền tố tiếng Việt', async () => {
    setAdminStorageMock({ message: 'bucket full' });

    await expect(
      uploadRecipeImage(makeFile(100, 'image/png')),
    ).rejects.toThrow('Tải ảnh thất bại: bucket full');
  });
});
