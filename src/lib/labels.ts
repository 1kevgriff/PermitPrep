/** Friendly display labels for topic slugs used across the app. */
const TOPIC_LABELS: Record<string, string> = {
  signs: 'Traffic Signs',
  'traffic-signals': 'Traffic Signals',
  'signs-and-markings': 'Signs & Pavement Markings',
  'right-of-way': 'Right of Way',
  'speed-and-stopping': 'Speed & Stopping',
  'passing-and-turning': 'Passing & Turning',
  'sharing-the-road': 'Sharing the Road',
  'visibility-and-lights': 'Visibility & Lights',
  'hazardous-conditions': 'Hazardous Conditions',
  'alcohol-drugs-and-distraction': 'Alcohol, Drugs & Distraction',
  'crashes-and-stops': 'Crashes & Traffic Stops',
  'seat-belts-and-child-safety': 'Seat Belts & Child Safety',
  'penalties-and-licensing': 'Penalties & Licensing',
}

export function topicLabel(slug: string): string {
  return (
    TOPIC_LABELS[slug] ??
    slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  )
}
