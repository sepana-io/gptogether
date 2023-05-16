import React, { useEffect, useRef } from "react";
import Link from "next/link";
import {
  RiDiscordLine,
  RiFacebookCircleLine,
  RiInstagramLine,
  RiLinkedinBoxLine,
  RiTelegramLine,
  RiTwitterLine,
  RiYoutubeLine,
} from "react-icons/ri";
import { useRouter } from "next/router";

import { Button, Text } from "components/atoms";
import UserAvatar from "components/common/UserAvatar";
import SendMessageModal from "components/connect/SendMessageModal";

interface UserListItemProps {
  promptDetail: any;
  userDetails: any;
}

export default function UserListItem({
  promptDetail,
  userDetails,
}: UserListItemProps) {
  const router = useRouter();

  return (
    <div className="flex gap-[40px] py-[12px] px-[20px] border border-gray-100 rounded-[12px]">
      <div className="flex-grow flex gap-[40px] items-start">
        <div className="flex flex-grow gap-[16px] items-center">
          <UserAvatar size="lg" user={userDetails} />
          <div>
            <Text size="text-size_title2" weight="font-semibold">
              {userDetails?.name || userDetails?.user_id}
            </Text>
            <Text size="text-size_body2">{promptDetail?.prompt_subject}</Text>
          </div>
        </div>
        <div className="flex gap-[8px] flex-wrap justify-end py-[6px] w-[76px] min-w-[76px]">
          {/* <Link
            href={`https://www.instagram.com/${userDetails?.instagram_handle}`}
            target="_blank"
          >
            <Button
              variant="tertiary"
              className="rounded-full"
              size="xs"
              iconElement={<RiInstagramLine size="20px" />}
              disabled={!userDetails?.instagram_handle}
            />
          </Link> */}
          <Link
            href={`https://twitter.com/${userDetails?.twitter_handle}`}
            target="_blank"
          >
            <Button
              variant="tertiary"
              className="rounded-full"
              size="xs"
              iconElement={<RiTwitterLine size="20px" />}
              disabled={!userDetails?.twitter_handle}
            />
          </Link>
          {/* <Link
            href={`https://www.youtube.com/@${userDetails?.youtube_channel}`}
            target="_blank"
          >
            <Button
              variant="tertiary"
              className="rounded-full"
              size="xs"
              iconElement={<RiYoutubeLine size="20px" />}
              disabled={!userDetails?.youtube_channel}
            />
          </Link> */}
          {/* <Link
            href={`https://t.me/${userDetails?.telegram_handle}`}
            target="_blank"
          >
            <Button
              variant="tertiary"
              className="rounded-full"
              size="xs"
              iconElement={<RiTelegramLine size="20px" />}
              disabled={!userDetails?.telegram_handle}
            />
          </Link> */}
          {/* <Link
            href={`https://www.facebook.com/${userDetails?.facebook_handle}`}
            target="_blank"
          >
            <Button
              variant="tertiary"
              className="rounded-full"
              size="xs"
              iconElement={<RiFacebookCircleLine size="20px" />}
              disabled={!userDetails?.facebook_handle}
            />
          </Link> */}
          <Link
            href={`https://discord.com/channels/@${userDetails?.discord_handle}`}
            target="_blank"
          >
            <Button
              variant="tertiary"
              className="rounded-full"
              size="xs"
              iconElement={<RiDiscordLine size="20px" />}
              disabled={!userDetails?.discord_handle}
            />
          </Link>
        </div>
      </div>
      <div className="flex gap-[12px] items-start w-[264px] min-w-[264px] py-[6px]">
        <Link href={`/profile/${userDetails?.user_id}`} target="_blank">
          <Button
            rightIcon="HiOutlineArrowUp"
            iconClassName="transform rotate-45"
            variant="secondary"
            size="sm"
          >
            View Prompts
          </Button>
        </Link>
        <SendMessageModal userDetails={userDetails} />
      </div>
    </div>
  );
}
