import React, { useRef, useEffect, useState, ChangeEvent } from "react";
import _ from "lodash";
import * as Slider from "@radix-ui/react-slider";

import { Button, Input } from "components/atoms";

export default function FilterByDistanceModal({ radius, setRadius }: any) {
  const modalRef = useRef<any>(null);
  const [formRadius, setFormRadius] = useState<number>(radius);

  useEffect(() => {
    if (radius) {
      setFormRadius(radius);
    } else {
      setFormRadius(100000);
    }
  }, [radius]);

  useEffect(() => {
    closeModalOnOverlayClick();
  }, []);

  const showModal = () => {
    modalRef.current?.showModal();
  };

  const closeModalOnOverlayClick = () => {
    modalRef.current?.addEventListener("click", (e: any) => {
      const dialogDimensions = modalRef.current?.getBoundingClientRect();
      if (
        e.clientX < dialogDimensions.left ||
        e.clientX > dialogDimensions.right ||
        e.clientY < dialogDimensions.top ||
        e.clientY > dialogDimensions.bottom
      ) {
        modalRef.current?.close();
      }
    });
  };

  return (
    <>
      <Button
        onClick={showModal}
        size="sm"
        variant={radius ? "secondary_success" : "quaternary"}
        leftIcon="HiOutlineFilter"
        className="mb-[12px]"
      >
        {radius ? `Within ${radius}kms` : "Filter by distance"}
      </Button>
      <dialog
        aria-modal
        ref={modalRef}
        className="p-[32px] w-[480px] rounded-[12px] shadow-e5 bg-neutral_white"
      >
        <p className="text-size_body2 font-semibold mb-[8px]">
          Within a distance of
        </p>
        <Input
          value={formRadius}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setFormRadius(parseInt(e.target.value))
          }
          onBlur={(e: ChangeEvent<HTMLInputElement>) => {
            if (parseInt(e.target.value) < 50) {
              setFormRadius(50);
            }
            if (parseInt(e.target.value) > 100000) {
              setFormRadius(100000);
            }
          }}
          size="md"
          placeholder="distance"
          type="number"
          className="mb-[16px]"
          rightElement={<p className="text-size_body2 font-semibold">kms</p>}
        />
        <Slider.Root
          value={[formRadius]}
          onValueChange={(e: number[]) => setFormRadius(e[0])}
          className="relative flex w-full touch-none select-none items-center bg-neutral_white"
          max={100000}
          step={50}
        >
          <Slider.Track className="relative h-[4px] w-full grow overflow-hidden rounded-full bg-gray-100">
            <Slider.Range className="absolute h-full bg-primary" />
          </Slider.Track>
          <Slider.Thumb className="block h-[12px] w-[12px] rounded-full border bg-neutral_white border-gray-200 bg-background ring-offset-background  transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ring-primary-75 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50" />
        </Slider.Root>
        <div className="flex justify-between mt-[4px]">
          <p className="text-size_caption2 text-gray-500">50</p>
          <p className="text-size_caption2 text-gray-500">100,000</p>
        </div>
        <div className="flex justify-end gap-[8px] mt-[32px]">
          <Button
            size="md"
            variant="tertiary"
            onClick={() => {
              setRadius(null);
              modalRef.current?.close();
            }}
          >
            Clear Filter
          </Button>
          <Button
            onClick={() => {
              setRadius(formRadius);
              modalRef.current?.close();
            }}
            size="md"
            variant="primary"
            disabled={formRadius === radius}
          >
            Apply
          </Button>
        </div>
      </dialog>
    </>
  );
}
