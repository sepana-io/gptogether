import React, { Fragment } from "react";
import Link from "next/link";
import clsx from "clsx";
import { useRouter } from "next/router";
import { getAuth } from "firebase/auth";
import { Text, Icon } from "components/atoms";
import { useAuthState } from "react-firebase-hooks/auth";
import { Menu, Transition } from "@headlessui/react";

import UserAvatar from "components/common/UserAvatar";
import { useAuth } from "contexts/UserContext";

const sidebarLinks = [
  {
    route: "/chat",
    icon: <Icon name="HiOutlineChat" size={24} className="min-w-[24px]" />,
    activeIcon: <Icon name="HiChat" size={24} className="min-w-[24px]" />,
  },
  {
    route: "/connect",
    icon: <Icon name="HiOutlineUserGroup" size={24} className="min-w-[24px]" />,
    activeIcon: <Icon name="HiUserGroup" size={24} className="min-w-[24px]" />,
  },
];

export default function Sidebar() {
  const router = useRouter();
  const auth = getAuth();
  const { userDetails } = useAuth();

  return (
    <div className="py-[24px] px-[12px] bg-gray-25 border-r border-gray-75 h-screen relative z-10">
      <Menu as="div" className="relative inline-block text-left">
        <Menu.Button className="mb-[40px] focus:shadow-outline-focus_primary rounded-full focus:outline-none">
          <UserAvatar user={userDetails} size="md" />
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute top-[0] left-[48px] origin-top-left bg-neutral_white-100 w-[216px] shadow-e5 rounded-[12px] border border-gray-100 focus:outline-none">
            <div className="py-[16px] px-[20px] flex gap-[12px] items-end border-b border-gray-100">
              <UserAvatar user={userDetails} size="sm" />
              <div>
                <Text
                  size="text-size_body2"
                  weight="font-semibold"
                  className="mb-[-2px]"
                >
                  {userDetails?.name}
                </Text>
                <Text
                  size="text-size_caption1"
                  weight="font-semibold"
                  color="text-gray-700"
                >
                  {userDetails?.email}
                </Text>
              </div>
            </div>
            <div className="px-[4px] py-[8px]">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => router.push("/profile")}
                    className={clsx(
                      "flex items-center rounded-[8px] gap-[8px] py-[2px] px-[8px] hover:bg-primary-50 hover:text-primary-600 w-full transition",
                      active && "bg-primary-50 text-primary-600"
                    )}
                  >
                    <Icon name="HiOutlineUser" size={18} />
                    <Text size="text-size_body2" weight="font-semibold">
                      Account Settings
                    </Text>
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => auth.signOut()}
                    className={clsx(
                      "flex items-center rounded-[8px] gap-[8px] py-[2px] px-[8px] hover:bg-primary-50 hover:text-primary-600 w-full transition",
                      active && "bg-primary-50 text-primary-600"
                    )}
                  >
                    <Icon name="HiOutlineLogin" size={18} />
                    <Text size="text-size_body2" weight="font-semibold">
                      Logout
                    </Text>
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
      <div className="flex flex-col gap-[16px]">
        {sidebarLinks.map((item) => {
          const active = router.pathname.includes(item.route);
          return (
            <Link
              key={item.route}
              href={item.route}
              className={clsx(
                "block p-[8px] rounded-[12px] border transition focus:outline-none",
                active
                  ? "text-primary-600 shadow-outline-focus_primary border-primary-100 bg-primary-50 focus:bg-primary-75"
                  : "text-gray-600 border-transparent hover:bg-primary-50 hover:text-primary-600 focus:bg-primary-50 focus:text-primary-600"
              )}
            >
              {active ? item.activeIcon : item.icon}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
