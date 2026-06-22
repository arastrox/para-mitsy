// Lee la frase del día desde el repo (raw GitHub), así se actualiza sola cuando
// la Action diaria commitea, sin necesidad de redeploy. Cache de 10 min.

const RAW = 'https://raw.githubusercontent.com/arastrox/para-mitsy/main/data/daily.json';

export const revalidate = 600;

export async function GET() {
  try {
    const res = await fetch(RAW, { next: { revalidate: 600 } });
    if (!res.ok) return Response.json({});
    const data = await res.json();
    return Response.json({ date: data?.date ?? null, message: data?.message ?? null });
  } catch {
    return Response.json({});
  }
}
