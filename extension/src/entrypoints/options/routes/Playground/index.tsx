import { useState } from "react";
import { type FuriganaSegment, JapaneseTextarea } from "./components/JapaneseTextarea";
import { TextWithFurigana } from "./components/TextWithFurigana";

export const Playground = () => {
  const [furiganaSegments, setFuriganaSegments] = useState<FuriganaSegment[]>([]);
  // Always use hiragana for the playground preview.

  return (
    <div className="w-full">
      <div className="mt-3 grid w-full grid-rows-2 gap-2.5 text-xl md:grid-cols-2">
        <JapaneseTextarea onSegmentsChange={setFuriganaSegments} furiganaType="hiragana" />
        <TextWithFurigana furiganaSegments={furiganaSegments} />
      </div>
    </div>
  );
};
