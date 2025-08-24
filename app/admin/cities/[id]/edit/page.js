import CityEditor from '@/components/admin/cities/CityEditor'

export default async function EditCityPage({ params }) {
  const { id } = await params
  return <CityEditor cityId={id} />
}