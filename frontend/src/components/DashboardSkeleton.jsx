import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function DashboardSkeleton() {
  return (
    <SkeletonTheme baseColor="#1a1a1a" highlightColor="#2a2a2a">
      {/* Top row */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <Skeleton width="60%" height={12} className="mb-4" />
          <div className="flex items-center gap-4">
            <Skeleton width={100} height={60} borderRadius={8} />
            <div>
              <Skeleton width={80} height={14} className="mb-2" />
              <Skeleton width={60} height={12} />
            </div>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 col-span-2">
          <Skeleton width="40%" height={12} className="mb-4" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 rounded-xl bg-white/5">
                <Skeleton width="40%" height={28} className="mb-2 mx-auto" />
                <Skeleton width="80%" height={12} className="mb-1 mx-auto" />
                <Skeleton width="60%" height={10} className="mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Jobs */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <Skeleton width={200} height={16} />
          <Skeleton width={60} height={14} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
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
          ))}
        </div>
      </div>
    </SkeletonTheme>
  );
}