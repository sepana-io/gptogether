import React, { Dispatch, SetStateAction } from "react";
import { Icon, Text } from "components/atoms";

interface GptSuggestionProps {
  onSelect: any;
}

export default function GptSuggestion({ onSelect }: GptSuggestionProps) {
  return (
    <div className="grid grid-cols-3 gap-[20px] px-[32px]">
      <div>
        <Icon name="HiOutlineSun" size={28} className="mx-auto mb-[8px]" />
        <Text
          size="text-size_title1"
          className="text-center mb-[24px] font-semibold"
        >
          Examples
        </Text>
        <div className="flex flex-col gap-[12px]">
          {[
            "Explain Quantum Computing in Simple terms",
            "Got any Creative ideas for 10 year old’s birthday?",
            "How do I make HTTP request in Javascript",
          ].map((item) => (
            <button
              key={item}
              onClick={() => onSelect(item)}
              className="bg-gray-25 hover:bg-gray-75 transition text-size_body2 px-[16px] py-[8px] rounded-[4px] font-medium text-center"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div>
        <Icon
          name="HiOutlineLightningBolt"
          size={28}
          className="mx-auto mb-[8px]"
        />
        <Text
          size="text-size_title1"
          className="text-center mb-[24px] font-semibold"
        >
          Capabilities
        </Text>
        <div className="flex flex-col gap-[12px]">
          {[
            "Remembers what user said earlier in the conversation",
            "Allows user to provide follow-up corrections",
            "Trained to decline inappropriate requests",
          ].map((item) => (
            <div
              key={item}
              className="bg-gray-25 text-size_body2 px-[16px] py-[8px] rounded-[4px] font-medium text-center"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
      <div>
        <Icon
          name="HiOutlineExclamation"
          size={28}
          className="mx-auto mb-[8px]"
        />
        <Text
          size="text-size_title1"
          className="text-center mb-[24px] font-semibold"
        >
          Limitations
        </Text>
        <div className="flex flex-col gap-[12px]">
          {[
            "May occasionally generate incorrect information",
            "May occasionally produce harmful instructions or biased content",
            "Limited knowledge of world and events after 2021",
          ].map((item) => (
            <div
              key={item}
              className="bg-gray-25 text-size_body2 px-[16px] py-[8px] rounded-[4px] font-medium text-center"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
