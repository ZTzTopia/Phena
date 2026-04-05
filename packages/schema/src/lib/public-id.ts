export function mapPublicIdToId<T extends { publicId: string } & Record<string, unknown>>(
  data: T,
): { id: string } & Omit<T, "id" | "publicId"> {
  const { publicId, id: _id, ...rest } = data;
  return Object.assign({ id: publicId }, rest) as { id: string } & Omit<T, "id" | "publicId">;
}
