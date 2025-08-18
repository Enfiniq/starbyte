import Image from "next/image";
import React from "react";

const AvatarGallery = ({
  setPreBuildAvatar,
}: {
  setPreBuildAvatar: (avatar: string) => void;
}) => {
  const images = Array.from(
    { length: 55 },
    (_, i) => `/signatures/${i + 1}.png`
  );

  return (
    <div className="h-[200px] w-full p-2 overflow-y-auto">
      <div className="grid grid-cols-3 gap-x-3 gap-y-6 justify-items-center">
        {images.map((src, index) => (
          <button
            key={`Image-${index}`}
            className="relative flex h-20 w-20 rounded-full p-2 hover:shadow-lg hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
            type="button"
            onClick={() => setPreBuildAvatar(src)}
          >
            <Image
              priority
              src={src}
              alt={`Signature snap - ${index + 1}`}
              width={80}
              height={80}
              quality={100}
              className="aspect-square h-full w-full rounded-full"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default AvatarGallery;
