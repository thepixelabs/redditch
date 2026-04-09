import { getAllBikes } from '@/lib/bikes'
import HomeClient from './HomeClient'

/**
 * Home page — server component.
 *
 * getAllBikes() is called at build time (static export). The resulting data
 * is serialised into the page bundle and passed as a prop to the client
 * component, which handles the interactive onboarding flow.
 */
export default function HomePage() {
  const bikes = getAllBikes()
  return <HomeClient bikes={bikes} />
}
