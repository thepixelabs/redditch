import { getAllBikes } from '@/lib/bikes'
import { getBulletinPreview } from '@/lib/bulletin'
import HomeClient from './HomeClient'

export default function HomePage() {
  const bikes = getAllBikes()
  const bulletin = getBulletinPreview(4)
  return <HomeClient bikes={bikes} bulletin={bulletin} />
}
