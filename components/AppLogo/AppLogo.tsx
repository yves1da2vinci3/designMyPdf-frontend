import { Box } from '@mantine/core';
import { useRouter } from 'next/router';
import Image from 'next/image';

const Images = {
  logo_white: '/static/designMyPDF_white.png',
  logo_normal: '/static/designMyPDF.png',
};

interface LogoProps {
  isWhite: boolean;
  width: number;
}

function Logo({ width, isWhite }: LogoProps) {
  const router = useRouter();

  const handleApLogoClick = () => {
    router.push('/');
  };

  return (
    <Box
      onClick={handleApLogoClick}
      style={{ cursor: 'pointer', flexShrink: 0, lineHeight: 0 }}
      title="Accueil"
    >
      {isWhite ? (
        <Image alt="Design My PDF" src={Images.logo_white} width={width} height={width} />
      ) : (
        <Image alt="Design My PDF" src={Images.logo_normal} width={width} height={width} />
      )}
    </Box>
  );
}

export default Logo;
