import { Carousel, Embla, useAnimationOffsetEffect } from '@mantine/carousel';
import { Stack, Flex, Loader, Modal, UnstyledButton } from '@mantine/core';
import { memo, useEffect, useState } from 'react';

import { Subheading1, Heading1, BodyText } from '@components/typography';
import { getUploadedFile } from 'src/utils/storage';
import { Campaign, Proposal } from 'src/utils/types';
import styles from './styles.module.scss';
import {
  TbBrandFacebook,
  TbBrandInstagram,
  TbBrandTwitter,
} from 'react-icons/tb';
import { useMediaQuery } from '@mantine/hooks';
import { useLanguage } from 'src/utils/lang/languageContext';

const getSupportingMaterials = async (materials?: string[]) => {
  let uploadedSupportingMaterials: string[] = [];
  if (materials && materials.length > 1) {
    uploadedSupportingMaterials = await Promise.all(
      materials.map(async (material) => {
        const supportingMaterialsRes = await getUploadedFile(material);
        if (supportingMaterialsRes instanceof Error) {
          return '';
        }
        return supportingMaterialsRes;
      })
    );
  }
  return uploadedSupportingMaterials;
};

const fetchPCFiles = async (pc: Proposal | Campaign) => {
  const imageResponse = pc.titleImage && (await getUploadedFile(pc.titleImage));
  const titleImage =
    !imageResponse || imageResponse instanceof Error ? '' : imageResponse;
  const supportingMaterials = await getSupportingMaterials(
    pc.supportingMaterials
  );
  return { titleImage, supportingMaterials };
};

const ANIMATION_DURATION = 200 as const;

const PCContent = (props: Proposal | Campaign) => {
  const [titleImage, setTitleImage] = useState('');
  const [supportingMaterials, setSupportingMaterials] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState<number>();
  const [embla, setEmbla] = useState<Embla>();
  const [carouselLoading, setCarouselLoading] = useState(false);
  const [slideNumber, setSlideNumber] = useState(4);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { lang } = useLanguage();
  useAnimationOffsetEffect(embla, ANIMATION_DURATION);

  useEffect(() => {
    const updateCarousel = () => {
      if (window.innerWidth < 480) setSlideNumber(2);
      else if (
        window.innerWidth < 768 ||
        (window.innerWidth > 920 && window.innerWidth < 1200)
      )
        setSlideNumber(3);
      else setSlideNumber(4);
    };
    updateCarousel();
    window.addEventListener('resize', updateCarousel);
    return () => window.removeEventListener('resize', updateCarousel);
  }, []);

  useEffect(() => {
    setCarouselLoading(true);
    setTimeout(() => setCarouselLoading(false), ANIMATION_DURATION * 2);
  }, [currentImage]);

  useEffect(() => {
    if (!props) return;
    fetchPCFiles(props).then(({ titleImage, supportingMaterials }) => {
      setTitleImage(titleImage);
      setSupportingMaterials(supportingMaterials);
      setLoading(false);
    });
  }, [props]);

  const socialMediaLinks = 'typeId' in props && {
    [props.fbLink ?? '']: <TbBrandFacebook size={32} />,
    [props.igLink ?? '']: <TbBrandInstagram size={32} />,
    [props.twitterLink ?? '']: <TbBrandTwitter size={32} />,
  };

  if (loading)
    return (
      <Flex justify="center" align="center" h={'100%'}>
        <Loader color="violet" />
      </Flex>
    );

  return (
    <>
      <Modal
        fullScreen={isMobile}
        transitionDuration={ANIMATION_DURATION}
        opened={currentImage !== undefined}
        onClose={() => setCurrentImage(undefined)}
        size={slideNumber > 2 ? '70%' : '100%'}>
        {carouselLoading ? (
          <Flex justify="center" align="center" h={550}>
            <Loader color="gray" variant="dots" />
          </Flex>
        ) : (
          <Carousel
            getEmblaApi={setEmbla}
            initialSlide={currentImage}
            align="center"
            loop>
            {supportingMaterials.map((src, index) => (
              <Carousel.Slide key={index} h={550}>
                <img className={styles.carouselImagePreview} src={src} />
              </Carousel.Slide>
            ))}
          </Carousel>
        )}
      </Modal>
      <Stack spacing={30}>
        <img
          className={styles.titleImage}
          src={titleImage}
          onError={(e) => {
            e.currentTarget.src = '/authPageLogo.svg';
            e.currentTarget.className = styles.titleImageFallback;
          }}
        />
        <Flex justify={'space-between'}>
          <Subheading1 color="#808080">
            {lang === 'en'
              ? props?.startTime
                ? new Date(props?.startTime).toDateString().slice(3)
                : '-'
              : props?.startTime
              ? new Date(props?.startTime).toLocaleDateString('ko-KR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : '-'}
          </Subheading1>
        </Flex>
        <Flex justify="space-between">
          <Heading1>{props?.title}</Heading1>
          {socialMediaLinks && (
            <Flex gap={10}>
              {Object.keys(socialMediaLinks)
                .filter((link) => link !== '')
                .map((link) => (
                  <UnstyledButton
                    className={styles.socialMediaButton}
                    onClick={() => window.open(link)}>
                    {socialMediaLinks[link]}
                  </UnstyledButton>
                ))}
            </Flex>
          )}
        </Flex>
        <BodyText className={styles.detailsText}>{props?.details}</BodyText>

        {supportingMaterials && supportingMaterials.length > 0 && (
          <Carousel
            height="15vh"
            align="start"
            slideSize={`${100 / slideNumber}%`}
            slideGap={1}
            draggable={supportingMaterials.length > slideNumber}
            withControls={supportingMaterials.length > slideNumber}
            loop>
            {supportingMaterials.map((src, index) => (
              <Carousel.Slide
                key={index}
                onClick={() => setCurrentImage(index)}>
                <img className={styles.carouselImage} src={src} />
              </Carousel.Slide>
            ))}
          </Carousel>
        )}
      </Stack>
    </>
  );
};

export default memo(PCContent);
