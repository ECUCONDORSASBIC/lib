// This is a simple SVG logo placeholder
export default function LogoPlaceholder({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      className={className || "w-auto h-12"}
      fill="none"
    >
      <rect width="200" height="50" rx="5" fill="#4F46E5" />
      <text x="25" y="33" fontFamily="Arial" fontSize="22" fontWeight="bold" fill="white">
        PR QUALITY
      </text>
    </svg>
  );
}
