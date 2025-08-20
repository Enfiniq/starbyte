import { Skeleton } from "../ui/skeleton";

export const BytesPlaceholder = () => (
  <div className="flex justify-center mb-16">
    <div className="w-full max-w-4xl">
      <Skeleton className="w-full aspect-video mb-3" />
      <div className="flex gap-4 p-2">
        <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
        <div className="flex flex-col gap-2 w-full">
          <div className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
          </div>
          <Skeleton className="h-4 w-1/3" />
          <div className="flex gap-2 w-1/2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </div>
    </div>
  </div>
);
export const BannerPlaceholder = () => {
  return (
    <div className="space-y-16">
      <div className="w-full flex justify-center">
        <div className="w-full flex flex-col md:flex-row items-center">
          <Skeleton className="w-full md:w-1/2 aspect-video" />
          <div className="hidden md:flex flex-col gap-5 p-5 w-1/2 aspect-video">
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-1/2 rounded-lg" />
              <Skeleton className="h-6 w-6 rounded-full ml-auto" />
            </div>

            <div className="flex flex-col gap-2 lg:gap-5">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-4 w-full rounded-lg" />
              <Skeleton className="h-4 w-full rounded-lg" />
              <Skeleton className="h-4 w-full rounded-lg" />
            </div>
          </div>

          <div className="flex md:hidden w-full gap-4 p-1 mt-6">
            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
            <div className="flex flex-col gap-2 w-full">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-6 w-full" />
              <div className="w-1/3 flex items-center gap-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
              <div className="w-1/2 flex items-center gap-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full">
        <div className="flex gap-2 md:gap-4 lg:gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-1/6" />
          ))}
        </div>
      </div>

      <div className="w-full">
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
};
