import React, { useState } from "react";
import _ from "lodash";
import Link from "next/link";
// import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Tabs from "@radix-ui/react-tabs";
import { useAuth } from "contexts/UserContext";

import { Text } from "components/atoms";
import Sidebar from "components/common/Sidebar";
import FilterByDistanceModal from "components/connect/FilterByDistanceModal";
import SimilarUsers from "components/connect/SimilarUsers";
import AllUsers from "components/connect/AllUsers";

export default function Connect() {
  const { userDetails } = useAuth();
  const [radius, setRadius] = useState<number | null>(null);

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-grow h-screen overflow-scroll">
        <div className="max-w-[1184px] px-[64px] pt-[64px] pb-[104px] mx-auto">
          <Text
            size="text-size_heading1"
            weight="font-semibold"
            className="mb-[8px]"
          >
            Connect
          </Text>
          <Text
            size="text-size_title1"
            weight="font-medium"
            className="mb-[40px]"
          >
            Meet people with similar interests as yours based on your prompts.
          </Text>
          <Tabs.Root defaultValue="similar">
            <Tabs.List className="border-b border-gray-75 mb-[24px] flex justify-between">
              <div className="flex gap-[24px]">
                <Tabs.Trigger
                  value="similar"
                  className="pb-[12px] text-size_body2 font-semibold border-b-2 border-transparent transition text-gray-500 data-[state=active]:border-primary-500 data-[state=active]:text-gray-900"
                >
                  Similar Users
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="all"
                  className="pb-[12px] text-size_body2 font-semibold border-b-2 border-transparent transition text-gray-500 data-[state=active]:border-primary-500 data-[state=active]:text-gray-900"
                >
                  All Users
                </Tabs.Trigger>
              </div>
              {userDetails.longitude && userDetails.latitude && (
                <FilterByDistanceModal radius={radius} setRadius={setRadius} />
              )}
            </Tabs.List>
            {!(userDetails.longitude && userDetails.latitude) && (
              <div className="flex py-[8px] px-[16px] bg-danger-50 rounded-[8px] mb-[32px]">
                <Text
                  size="text-size_body2"
                  weight="font-medium"
                  color="text-gray-900"
                  className="font-semibold"
                >
                  You haven't set your location. You need to{" "}
                  <Link href="/chat" className="text-primary-500 underline">
                    set it here
                  </Link>{" "}
                  if you want to use location filters
                </Text>
              </div>
            )}
            <Tabs.Content value="similar">
              <SimilarUsers radius={radius} />
            </Tabs.Content>
            <Tabs.Content value="all">
              <AllUsers radius={radius} />
            </Tabs.Content>
          </Tabs.Root>
        </div>
      </div>
    </div>
  );
}
