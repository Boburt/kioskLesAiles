import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import defaultChannel from '@lib/defaultChannel'

const CartWithNoSSR = dynamic(
  () => import('@components/SmallCart'),
  { ssr: false }
)
function Footer() {
  const [channelName, setChannelName] = useState('chopar')
  const getChannel = async () => {
    const channelData = await defaultChannel()
    setChannelName(channelData.name)
  }
  return (
  <div>
    <div>
      <CartWithNoSSR channelName={channelName} />
    </div>
  </div>
  );
}
export default Footer;
