const Spinner = ({ text = "Loading..." }) => (
  <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-3">
    <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
    <p className="text-gray-500 text-sm">{text}</p>
  </div>
);

export default Spinner;
