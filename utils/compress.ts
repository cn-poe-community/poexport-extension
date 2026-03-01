/**
 * 使用 Deflate 算法（zlib格式）压缩文本并返回 Blob 对象
 */
export async function deflateCompressToBlob(text: string): Promise<Blob> {
  const cs = new CompressionStream("deflate");
  const compressedStream = new Blob([text]).stream().pipeThrough(cs);
  return new Response(compressedStream).blob();
}
