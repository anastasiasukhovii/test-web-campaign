import {
  Anchor,
  Flex,
  Input,
  Loader,
  MultiSelect,
  Stack,
  Textarea,
  TextInput,
} from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import router from 'next/router';
import { TbCircleCheck, TbEdit, TbUpload } from 'react-icons/tb';
import { useState } from 'react';
import api from 'src/utils/api';
import { useAuth } from 'src/utils/auth/authContext';
import { Artist } from 'src/utils/types';
import { uploadFile } from 'src/utils/storage';
import { PROPOSAL_COST } from 'src/utils/constants';
import {
  MessageModal,
  MessageModalProps,
} from '@components/modal/messageModal';
import PaymentCalculation from '@components/paymentCalc';
import BackButton from '@components/buttons/backButton';
import ValueItem from '@components/create/valueItem';
import StatCard from '@components/statCard';
import { Heading1 } from '@components/typography';
import SelectItem from '@components/create/selectItem';
import Button from '@components/buttons/button';
import styles from 'styles/twoColumnLayout.module.scss';
import {
  PFormData,
  useCreatePCInitialData,
} from '@components/create/usePCInitialData';
import { PCFileUpload } from '@components/create/pcFileUpload';
import { Language, useLanguage } from 'src/utils/lang/languageContext';

type ModalTypes = 'saving' | 'saved' | 'publish' | 'publishing' | 'published';

const publishValidation = (values: PFormData) => ({
  title:
    values.title.length > 3 && values.title.length <= 100
      ? null
      : values.title.length > 100
      ? 'Max. 100 characters'
      : 'Required',
  details: values.details && values.details.length > 3 ? null : 'Required',
  artistId: values.artistId && values.artistId.length > 0 ? null : 'Required',
  sponsors: values.sponsors && values.sponsors.length > 0 ? null : 'Required',
  titleImage: values.titleImage ? null : 'Required',
});

const CreateProposal = () => {
  const { userInfo } = useAuth();
  const { balance, allArtists, allSponsors, createPCHook } =
    useCreatePCInitialData('Proposal', router);
  const [proposalId, setProposalId] = useState('');
  const [status, setStatus] = useState<ModalTypes>();
  const { lang } = useLanguage();

  const createPHook = createPCHook as UseFormReturnType<
    PFormData,
    (values: PFormData) => PFormData
  >;

  const textData: Record<
    Language,
    Record<
      Exclude<keyof PFormData, 'brand' | 'titleImage' | 'supportingMaterials'>,
      [string, string]
    > & {
      pageTitle: string;
      saveBtn: string;
      publishBtn: string;
      cardText: string;
    }
  > = {
    en: {
      pageTitle: 'Create Proposal',
      title: ['Title', 'What are you proposing? (Maximum 100 characters)'],
      details: ['Description', 'What are the details of your proposal?'],
      artistId: ['Artist', 'Which artist is this proposal for?'],
      sponsors: ['Sponsors', 'Type the artist name to find a related sponsor'],
      saveBtn: 'Save Draft',
      publishBtn: 'Publish',
      cardText: `Note: \n All proposals are live for 1 week. \n\nPro Tip: Pick a sponsor to participate in the campaign to improve your credibility.This will help you level up faster! `,
    },
    ko: {
      pageTitle: '제안서 만들기',
      title: ['제목', '무엇을 제안하고 있습니까? (최대 100자)'],
      details: ['상세 내용', '제안의 세부 사항은 무엇입니까?'],
      artistId: ['제안 대상', '어떤 아티스트를 위한 제안인가요?'],
      sponsors: ['스폰서', '관련 스폰서를 찾으세요.'],
      saveBtn: '임시 저장',
      publishBtn: '게시',
      cardText: `모든 제안은 1주일 동안 유효합니다. \n\n 프로 팁: 캠페인에 참여할 스폰서를 선택하여 신뢰도를 높이세요. 더 빨리 레벨을 올릴 수 있습니다! `,
    },
  };

  const modalHeading = {
    en: {
      savingHeading: 'Saving Draft',
      publishHeading: 'Publish Your Proposal',
      publishSubheading: 'Publishing requires sufficient stardust',
      publishButton: 'Publish',
      checkboxText:
        'By clicking “Publish", you confirm that you have read, understood,and accepted our',
      terms: 'terms ',
      publishedHeading: 'Proposal has been Published',
      publishedButton: 'View Proposal',
      savedHeading: 'Proposal Draft has been Created',
      savedButton: 'View Drafts',
    },
    ko: {
      savingHeading: '초안 저장중',
      publishHeading: '제안 게시',
      publishSubheading: '게시하려면 스타더스트 유효해야 합니다.',
      publishButton: '게시 하기',
      checkboxText:
        '게시를 클릭하면 당사를 읽고, 이해하고, 수락했음을 확인하는 것입니다.',
      terms: '이용 약관 ',
      publishedHeading: '제안서가 게시되었습니다.',
      publishedButton: '제안서 보기',
      savedHeading: '제안서 초안이 생성되었습니다.',
      savedButton: '초안 보기',
    },
  };
  const modalData: Record<ModalTypes, Omit<MessageModalProps, 'onClose'>> = {
    saving: {
      icon: <Loader color="#C399FF" />,
      heading: modalHeading[lang].savingHeading,
      sticky: true,
    },
    publish: {
      buttonDisabled: balance! < PROPOSAL_COST,
      icon: <TbUpload color="#6a00ff" size={36} />,
      heading: modalHeading[lang].publishHeading,
      subheading: modalHeading[lang].publishSubheading,
      buttonText: modalHeading[lang].publishButton,
      onSubmit: () => {
        setStatus('publishing');
        handleSubmit('Publish', createPHook.values);
      },
      checkmarkText:
        balance! < PROPOSAL_COST ? undefined : (
          <>
            {modalHeading[lang].checkboxText}
            <Anchor size="sm" target="_blank" color="black" underline>
              {modalHeading[lang].terms}
            </Anchor>
            .
          </>
        ),
      bodyContent: (
        <PaymentCalculation
          balance={balance}
          cost={PROPOSAL_COST}
          currency="Stardust"
        />
      ),
    },
    publishing: {
      icon: <Loader color="#C399FF" />,
      heading: modalHeading[lang].publishHeading,
      sticky: true,
    },
    published: {
      icon: <TbCircleCheck color="#333333" size={36} />,
      heading: modalHeading[lang].publishedHeading,
      buttonText: modalHeading[lang].publishedButton,
      onSubmit: () => router.replace(`/proposals/${proposalId}`),
    },
    saved: {
      icon: <TbCircleCheck color="#333333" size={36} />,
      heading: modalHeading[lang].savedHeading,
      buttonText: modalHeading[lang].savedButton,
      onSubmit: () =>
        router.replace({ pathname: '/user/profile', query: { tab: 'Drafts' } }),
    },
  };

  const handleTitleImage = async (titleImage: File | string) => {
    if (!userInfo) return;
    if (typeof titleImage === 'object') {
      // filepath: USER_EMAIL/proposals/PROPOSAL_TITLE/TIMESTAMP--FILENAME
      const titleImgRes = await uploadFile(
        `${userInfo.email}/proposals/${
          createPHook.values.title
        }/${new Date().toISOString()}--${titleImage['name']}`,
        titleImage
      );
      if (titleImgRes instanceof Error)
        throw new Error('Error: Could not upload title image');
      return titleImgRes.key;
    } else return createPHook.values.titleImage;
  };

  const getArtistCompany = (artists: string[]) => {
    const artistlist: Artist[] = [];
    artists.forEach((item) => {
      let temp = allArtists!.find((artist: Artist) => artist._id === item)!;
      artistlist.push(temp);
    });

    const companyIds = artistlist
      .map((artist) => artist.companyId)
      .filter((value, index, self) => {
        return self.indexOf(value) === index;
      });
    return companyIds;
  };

  const getArtistBrand = (artists: string[]) => {
    const artistlist: Artist[] = [];
    artists.forEach((item) => {
      let temp = allArtists!.find((artist: Artist) => artist._id === item)!;
      artistlist.push(temp);
    });

    const brands = artistlist
      .map((artist) => artist.brand)
      .filter((value, index, self) => {
        return self.indexOf(value) === index;
      });
    return brands;
  };

  const getSponsorlist = (artists: string[]) => {
    if (!allSponsors) return;
    const brands = getArtistBrand(artists);

    const result = allSponsors.filter(
      (sponsor) => sponsor.brand && brands.includes(sponsor.brand)
    );
    return result;
  };

  const handleSubmit = async (type: 'Draft' | 'Publish', values: PFormData) => {
    if (!userInfo) return;
    // upload title image to S3 bucket
    if (type === 'Publish' && !values.titleImage)
      throw new Error(
        'No title image provided. Title image is required for publishing proposal'
      );
    const titleImage = values.titleImage
      ? await handleTitleImage(values.titleImage)
      : null;

    // upload supporting material to S3 bucket
    const supportingMaterials = values.supportingMaterials
      ? await Promise.all(
          values.supportingMaterials!.map(async (material) => {
            const uploadRes =
              typeof material !== 'string'
                ? await uploadFile(
                    `${userInfo.email}/proposals/${
                      values.title
                    }/${new Date().toISOString()}--${material.name}`,
                    material
                  )
                : material;
            if (uploadRes instanceof Error)
              throw new Error('Image upload failed -- ', uploadRes);
            return typeof uploadRes === 'string' ? uploadRes : uploadRes.key;
          })
        )
      : [];

    const endpoint =
      type === 'Draft'
        ? router.query.draftId
          ? '/updateProposalContent'
          : '/create'
        : '/submit';

    const body = {
      ...values,
      _id: router.query.draftId,
      titleImage,
      supportingMaterials,
      author: userInfo.email,
      companyId:
        values.artistId && values.artistId.length >= 1
          ? getArtistCompany(values.artistId)[0]
          : '',
      brand: values.artistId && getArtistBrand(values.artistId),
    };

    const res = await api.proposal.post(endpoint, body);
    if (res.message._id || res.message.proposalId) {
      setProposalId(res.message._id ?? res.message.proposalId);
      setStatus(type === 'Publish' ? 'published' : 'saved');
    } else throw new Error('Error: Proposal could not be created');
  };

  return (
    <div>
      {status && (
        <MessageModal
          opened={!!status}
          onClose={() => setStatus(undefined)}
          {...modalData[status]}
        />
      )}

      <BackButton />

      <form
        onSubmit={createPHook.onSubmit(async (values) => {
          if (status !== 'publish') {
            setStatus('saving');
            handleSubmit('Draft', values);
          }
        })}>
        {userInfo && allArtists && allSponsors ? (
          <div>
            <Heading1 style={{ margin: '1rem 0 2rem' }}>
              {textData[lang].pageTitle}
            </Heading1>
            <Flex gap="lg" wrap="wrap">
              <Stack className={styles.leftColumn}>
                <MultiSelect
                  label={textData[lang].artistId[0]}
                  required
                  data={allArtists.map((artist) => ({
                    value: artist._id,
                    label: `${artist.name} (${artist.brand})`,
                    image: artist.profilePic,
                  }))}
                  value={createPHook.values.artistId}
                  placeholder={textData[lang].artistId[1]}
                  itemComponent={SelectItem}
                  valueComponent={ValueItem}
                  searchable
                  nothingFound="Nobody here"
                  maxDropdownHeight={400}
                  filter={(value, selected, item) =>
                    !selected &&
                    item
                      .label!.split(' ')[0]
                      .toLowerCase()
                      .includes(value.toLowerCase().trim())
                  }
                  onChange={(values) => {
                    createPHook.setFieldValue('artistId', values);
                  }}
                />

                <MultiSelect
                  label={textData[lang].sponsors[0]}
                  required
                  placeholder={textData[lang].sponsors[1]}
                  itemComponent={SelectItem}
                  valueComponent={ValueItem}
                  data={
                    createPHook.values.artistId &&
                    getSponsorlist(createPHook.values.artistId)?.map(
                      (sponsor) => ({
                        value: sponsor.email,
                        label: `${sponsor.username} (${sponsor.brand})`,
                        image: sponsor.profilePicture,
                      })
                    )
                  }
                  searchable
                  nothingFound="No Sponsors"
                  maxDropdownHeight={400}
                  filter={(value, selected, item) =>
                    !selected &&
                    item
                      .label!.split(' ')[0]
                      .toLowerCase()
                      .includes(value.toLowerCase().trim())
                  }
                  {...createPHook.getInputProps('sponsors')}
                />

                <PCFileUpload
                  fileType="title"
                  files={
                    createPHook.values.titleImage
                      ? [createPHook.values.titleImage]
                      : undefined
                  }
                  setFeildValue={(value: (string | File)[] | undefined) =>
                    createPHook.setFieldValue(
                      'titleImage',
                      value ? value[0] : undefined
                    )
                  }
                  removeItem={(index: number) =>
                    createPHook.removeListItem('titleImage', index)
                  }
                />

                <div>
                  <Input.Label required>{textData[lang].title[0]}</Input.Label>
                  <TextInput
                    placeholder={textData[lang].title[1]}
                    {...createPHook.getInputProps('title')}
                  />
                </div>
                <div>
                  <Input.Label required>
                    {textData[lang].details[0]}
                  </Input.Label>
                  <Textarea
                    minRows={4}
                    placeholder={textData[lang].details[1]}
                    {...createPHook.getInputProps('details')}
                  />
                </div>

                <PCFileUpload
                  fileType="supporting"
                  files={createPHook.values.supportingMaterials}
                  setFeildValue={(value: (string | File)[] | undefined) =>
                    createPHook.setFieldValue('supportingMaterials', value)
                  }
                  removeItem={(index: number) =>
                    createPHook.removeListItem('supportingMaterials', index)
                  }
                />
              </Stack>

              <Stack className={styles.rightColumn}>
                <StatCard
                  descWeight={500}
                  data={null}
                  style={{
                    whiteSpace: 'pre-wrap',
                    alignContent: 'left',
                    maxHeight: '200px',
                  }}
                  description={textData[lang].cardText}
                />
                <Button
                  type="secondary"
                  size="md"
                  color="black"
                  style={{
                    marginLeft: 'auto',
                    marginRight: '0',
                    width: '100%',
                  }}>
                  <TbEdit />
                  {textData[lang].saveBtn}
                </Button>
                <Button
                  type="primary"
                  size="md"
                  color="purple"
                  disabled={
                    !Object.values(publishValidation(createPHook.values)).every(
                      (err) => err === null
                    )
                  }
                  onClick={() => setStatus('publish')}
                  style={{
                    marginLeft: 'auto',
                    marginRight: '0',
                    width: '100%',
                  }}>
                  <TbUpload />
                  {textData[lang].publishBtn}
                </Button>
              </Stack>
            </Flex>
            <BackButton up centered mt="lg" />
          </div>
        ) : (
          <Flex justify="center" align="center">
            <Loader color="violet" />
          </Flex>
        )}
      </form>
    </div>
  );
};

export default CreateProposal;
