import { useState } from "react";
import { Info } from "lucide-react";

export const InfoTooltip = ({ text }) => {
  const [visible, setVisible] = useState(false);

  return (
    <span className="relative inline-block ml-1">
      <Info
        className="w-4 h-4 text-blue-500 cursor-pointer"
        onClick={() => setVisible((prev) => !prev)}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      />
      {(visible) && (
        <span className="absolute left-1/2 -translate-x-1/2 -top-10 w-48 bg-gray-800 text-white text-xs rounded-md px-2 py-1 z-10">
          {text}
        </span>
      )}
    </span>
  );
};
