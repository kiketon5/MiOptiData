import { useState, useRef, useEffect } from "react";
import { Info } from "lucide-react";

export const InfoTooltip = ({ text }) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: "50%", transform: "-50%" });
  const iconRef = useRef();
  const tooltipRef = useRef();

  const updatePosition = () => {
    if (!iconRef.current || !tooltipRef.current) return;
    const iconRect = iconRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const isMobile = window.innerWidth < 768;

    let left = iconRect.left + iconRect.width / 2 - tooltipRect.width / 2;
    // Evitar que se salga horizontalmente
    const margin = 8;
    if (left < margin) left = margin;
    if (left + tooltipRect.width > window.innerWidth - margin)
      left = window.innerWidth - tooltipRect.width - margin;

    let top;
    if (isMobile) {
      // En móviles, mostrar debajo
      top = iconRect.bottom + 6;
    } else {
      // En PC/tablet, mostrar arriba
      top = iconRect.top - tooltipRect.height - 6;
    }

    setPosition({ top: `${top}px`, left: `${left}px`, transform: "0" });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target) &&
        iconRef.current &&
        !iconRef.current.contains(event.target)
      ) {
        setVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", updatePosition);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", updatePosition);
    };
  }, []);

  useEffect(() => {
    if (visible) updatePosition();
  }, [visible]);

  return (
    <span className="relative inline-block ml-1">
      <Info
        ref={iconRef}
        className="w-4 h-4 text-blue-500 cursor-pointer"
        onClick={() => setVisible((prev) => !prev)}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      />
      {visible && (
        <span
          ref={tooltipRef}
          style={{ top: position.top, left: position.left, transform: position.transform }}
          className="fixed bg-gray-800 text-white text-xs rounded-md px-2 py-1 z-50 transition-opacity duration-200 opacity-100"
        >
          {text}
          <span
            className={`absolute w-2 h-2 bg-gray-800 rotate-45 ${
              window.innerWidth < 768
                ? "top-[-6px] left-1/2 -translate-x-1/2"
                : "bottom-[-6px] left-1/2 -translate-x-1/2"
            }`}
          ></span>
        </span>
      )}
    </span>
  );
};
