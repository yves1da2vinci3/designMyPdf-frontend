import { Group } from '@mantine/core';
import { useRouter } from 'next/router';
import Image from 'next/image'

const Images = {
    "logo_white" :  "/static/designMyPDF_white.png",
    "logo_normal" :  "/static/designMyPDF.png"
}
interface LogoProps  {
  isWhite: boolean;
  width : number;
}

export function Logo({ width, isWhite }: LogoProps) {
  console.log('Logo', { width });

  const router = useRouter();

  const handleApLogoClick = () => {
    router.push('/');
  };
  return (
    <Group onClick={handleApLogoClick} visibleFrom="sm">
      {isWhite ? (
        <Image alt='logo_white' src={Images.logo_white} width={width} height={width} />
      ) : (
        <Image alt='logo' src={Images.logo_normal} width={width} height={width} />
      )}
    </Group>
  );
}
