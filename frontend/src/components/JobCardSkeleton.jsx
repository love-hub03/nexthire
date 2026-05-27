import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function JobCardSkeleton() {
  return (
    <SkeletonTheme baseColor="#1a1a1a" highlightColor="#2a2a2a">
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <Skeleton width={40} height={40} borderRadius={12} className="mb-3" />
        <Skeleton width="80%" height={14} className="mb-2" />
        <Skeleton width="60%" height={12} className="mb-1" />
        <Skeleton width="40%" height={12} className="mb-3" />
        <Skeleton width={80} height={24} borderRadius={8} className="mb-2" />
        <Skeleton width="50%" height={12} className="mb-4" />
        <div className="flex gap-2">
          <Skeleton height={30} borderRadius={8} className="flex-1" />
          <Skeleton height={30} borderRadius={8} className="flex-1" />
        </div>
      </div>
    </SkeletonTheme>
  );
}