export function LoadingShimmer({ height = 'h-24' }: { height?: string }) {
  return <div className={`${height} rounded-xl loading-shimmer`}></div>;
}
