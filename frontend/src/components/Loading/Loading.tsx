import { FadeLoader } from "react-spinners";

function Loading() {
  return (
    <div className="flex justify-center items-center h-full">
      <FadeLoader radius={5} color="#886bfb" />
    </div>
  );
}

export default Loading;
