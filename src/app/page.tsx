import { getAllBikes } from '@/lib/bikes'
import { getBulletinPreview } from '@/lib/bulletin'
import HomeClient from './HomeClient'

/**
 * Home page — server component.
 *
 * Bike data and the bulletin board preview are both read at build time
 * (static export). Both are serialised into the page bundle and passed
 * to the client component. Zero runtime cost.
 */
export default function HomePage() {
  const bikes = getAllBikes()
  const bulletin = getBulletinPreview(4)
  return <HomeClient bikes={bikes} bulletin={bulletin} />
}
