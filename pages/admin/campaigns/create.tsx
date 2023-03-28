import React, { useState } from 'react';
import { UseFormReturnType } from '@mantine/form';
import {
  Flex,
  Input,
  Loader,
  MultiSelect,
  NumberInput,
  Select,
  Stack,
  Textarea,
  TextInput,
} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import {
  TbCalendarEvent,
  TbCircleCheck,
  TbEdit,
  TbUpload,
} from 'react-icons/tb';
import router from 'next/router';
import api from 'src/utils/api';
import { Artist } from 'src/utils/types';
import { useAuth } from 'src/utils/auth/authContext';
import { uploadFile } from 'src/utils/storage';
import { BodyText, Heading1 } from '@components/typography';
import StatCard from '@components/statCard';
import {
  MessageModal,
  MessageModalProps,
} from '@components/modal/messageModal';
import BackButton from '@components/buttons/backButton';
import SelectItem from '@components/create/selectItem';
import ValueItem from '@components/create/valueItem';
import Button from '@components/buttons/button';
import styles from 'styles/twoColumnLayout.module.scss';
import { PCFileUpload } from '@components/create/pcFileUpload';
import {
  CFormData,
  useCreatePCInitialData,
} from '@components/create/usePCInitialData';
import { Language, useLanguage } from 'src/utils/lang/languageContext';

type ModalTypes = 'saving' | 'saved' | 'publish' | 'publishing' | 'published';

const publishValidation = (
  values: CFormData
): Record<keyof CFormData, string | null> => ({
  typeId: values.typeId.length > 5 ? null : 'Required',
  brand: values.brand.length > 0 ? null : 'Required',
  artistId: values.artistId.length > 0 ? null : 'Required',
  titleImage: values.titleImage ? null : 'Required',
  startTime: values.startTime ? null : 'Required',
  endTime: values.endTime ? null : 'Required',
  title:
    values.title.length > 3 && values.title.length <= 100
      ? null
      : values.title.length > 100
      ? 'Max. 100 characters'
      : 'Required',
  details: values.details.length > 3 ? null : 'Required',
  target: values.target > 0 ? null : 'Required',
  costPerVote: values.costPerVote > 0 ? null : 'Required',
  rewardPerComment: values.rewardPerComment > 0 ? null : 'Required',
  donateRate: values.donateRate > 0 ? null : 'Required',
  targetWM: values.target > 0 ? null : 'Required',
  // optional fields
  supportingMaterials: null,
  twitterLink: null,
  igLink: null,
  fbLink: null,
});

const CreateCampaign = () => {
  const { userInfo } = useAuth();
  const { allArtists, cTypes, createPCHook } = useCreatePCInitialData(
    'Campaign',
    router
  );
  const [status, setStatus] = useState<ModalTypes>();
  const [campaignId, setCampaignId] = useState<string>();
  const { lang } = useLanguage();

  const createCHook = createPCHook as UseFormReturnType<
    CFormData,
    (values: CFormData) => CFormData
  >;

  const textData: Record<
    Language,
    Record<
      Exclude<
        keyof CFormData,
        | 'titleImage'
        | 'supportingMaterials'
        | 'startTime'
        | 'endTime'
        | 'target'
        | 'costPerVote'
        | 'rewardPerComment'
        | 'targetWM'
        | 'donateRate'
        | 'twitterLink'
        | 'fbLink'
        | 'igLink'
      >,
      [string, string]
    >
  > = {
    en: {
      title: ['Title', 'Campaign Title (Maximum 100 characters)'],
      details: ['Description', 'What are the details of your campaign?'],
      brand: ['Record Label', 'What Record Label is involved in the Campaign?'],
      artistId: ['Artists involved', 'Which artist is the proposal for?'],
      typeId: ['Campaign Type', 'Select Campaign Type'],
    },
    ko: {
      title: ['제목', '캠페인 제목(최대 100자)'],
      details: ['상세 내용', '캠페인의 세부 사항은 무엇입니까?'],
      brand: ['음반사', '캠페인에 참여하는 음반사는 어떻게 됩니까??'],
      artistId: ['캠페인 대상', '어떤 아티스트를 위한 제안인가요?'],
      typeId: ['캠페인 유형', '캠페인 유형을 선택하세요'],
    },
  };
  const cardData: Record<Language, Record<string, string>> = {
    en: {
      saveBtn: 'Save Draft',
      publishBtn: 'Publish',
      cardText: `Please note; this Campaign’s wallet will be created automatically.`,
    },
    ko: {
      saveBtn: '임시 저장',
      publishBtn: '게시',
      cardText: `참고: 캠페인 지갑이 자동으로 생성됩니다.`,
    },
  };

  const cTypeData = cTypes && [
    { value: '', label: textData[lang].typeId[0] },
    ...cTypes.map((cType) => ({
      value: cType._id,
      label: cType.typeName,
    })),
  ];

  const filterArtists = (artists: Artist[], selectedLabels: string[]) => {
    return artists.filter((artist) => selectedLabels.includes(artist.brand));
  };

  const financialFields: Record<
    Language,
    { heading: string; data: Partial<Record<keyof CFormData, string>> }
  > = {
    en: {
      heading: 'Financials',
      data: {
        target: 'Stardust goal',
        costPerVote: 'Cost per vote',
        rewardPerComment: 'Comment reward',
        donateRate: 'Donate Rate',
        targetWM: 'WeMake goal',
      },
    },
    ko: {
      heading: '토큰 설정',
      data: {
        target: '스타더스트 목표금액',
        costPerVote: '투표 당 비용',
        rewardPerComment: '댓글 보상',
        donateRate: '기부율',
        targetWM: '위매이크 목표금액',
      },
    },
  };
  const socialFields: Record<
    Language,
    {
      heading: string;
      data: Partial<Record<keyof CFormData, string>>;
      inputPlaceholder: string;
    }
  > = {
    en: {
      heading: 'Social media',
      inputPlaceholder: 'Insert URL',
      data: {
        fbLink: 'Facebook',
        twitterLink: 'Twitter',
        igLink: 'Instagram',
      },
    },
    ko: {
      heading: '소셜미디어',
      inputPlaceholder: 'URL을 입력하세요',
      data: {
        fbLink: '페이스북',
        twitterLink: '트위터',
        igLink: '인스타그램',
      },
    },
  };
  const dateFields: Record<
    Language,
    { heading: string; data: Partial<Record<keyof CFormData, string>> }
  > = {
    en: {
      heading: 'Duration',
      data: {
        startTime: 'Start date',
        endTime: 'End date',
      },
    },
    ko: {
      heading: '기간',
      data: {
        startTime: '시작일',
        endTime: '종료일',
      },
    },
  };

  const modalHeading = {
    en: {
      savingHeading: 'Saving Draft',
      savedHeading: 'Draft Saved',
      savedButtonText: 'View Drafts',
      publishHeading: 'Publish Campaign',
      publishSubheading: 'After confirmation, this action cannot be undone',
      publishCheckmarkText: 'Confirm publish campaign',
      publishButtonText: 'Publish',
      publishingHeading: 'Publishing',
      publishedHeading: 'Campaign Published',
      publishedButtonText: 'View Campaign',
    },
    ko: {
      savingHeading: '캠패인 초안 저장중',
      savedHeading: '캠패인 초안 생성되었습니다.',
      savedButtonText: '캠패인 초안 보기',
      publishHeading: '캠패인 게시하기',
      publishSubheading: '확인 후에는 이 작업을 취소할 수 없습니다.',
      publishCheckmarkText: '캠페인 게시 확인',
      publishButtonText: '게시하기',
      publishingHeading: '게시중',
      publishedHeading: '캠페인 게시되었습니다',
      publishedButtonText: '캠페인 보기',
    },
  };
  const modalData: Record<ModalTypes, Omit<MessageModalProps, 'onClose'>> = {
    saving: {
      icon: <Loader color="#C399FF" />,
      heading: modalHeading[lang].savingHeading,
      sticky: true,
    },
    saved: {
      icon: <TbCircleCheck color="#333333" size={36} />,
      heading: modalHeading[lang].savedHeading,
      buttonText: modalHeading[lang].savedButtonText,
      onSubmit: () =>
        router.replace({
          pathname: '/admin/campaigns',
          query: { tab: 'Drafts' },
        }),
    },
    publish: {
      icon: <TbUpload color="#333333" size={36} />,
      heading: modalHeading[lang].publishHeading,
      subheading: modalHeading[lang].publishSubheading,
      checkmarkText: modalHeading[lang].publishCheckmarkText,
      buttonText: modalHeading[lang].publishButtonText,
      onSubmit: () => {
        setStatus('publishing');
        handleSubmit('Publish', createCHook.values);
      },
    },
    publishing: {
      icon: <Loader color="#C399FF" />,
      heading: modalHeading[lang].publishingHeading,
      sticky: true,
    },
    published: {
      icon: <TbCircleCheck color="#333333" size={36} />,
      heading: modalHeading[lang].publishedHeading,
      buttonText: modalHeading[lang].publishedButtonText,
      onSubmit: () => {
        campaignId && router.push(`/campaigns/${campaignId}`);
      },
    },
  };

  const handleTitleImage = async (titleImage: File | string) => {
    if (!userInfo) return;
    if (typeof titleImage === 'object') {
      // filepath: BRAND/campaigns/CAMPAIGN_TITLE/TIMESTAMP--FILENAME
      const titleImgRes = await uploadFile(
        `${userInfo.brand}/campaigns/${
          createCHook.values.title
        }/${new Date().toISOString()}--${titleImage['name']}`,
        titleImage
      );
      if (titleImgRes instanceof Error)
        throw new Error('Error: Could not upload title image');
      return titleImgRes.key;
    } else return createCHook.values.titleImage;
  };

  const handleSubmit = async (type: 'Draft' | 'Publish', values: CFormData) => {
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
          values.supportingMaterials.map(async (material) => {
            // filepath: BRAND/campaigns/CAMPAIGN_TITLE/TIMESTAMP--FILENAME
            const uploadRes =
              typeof material !== 'string'
                ? await uploadFile(
                    `${userInfo.brand}/campaigns/${
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
          ? '/updateCampaignContent'
          : '/create'
        : '/launch';

    const body = {
      ...values,
      _id: router.query.draftId,
      titleImage,
      supportingMaterials,
      startTime: values.startTime
        ? Date.parse(values.startTime.toDateString())
        : null,
      endTime: values.endTime
        ? Date.parse(values.endTime.toDateString())
        : null,
      companyId: userInfo?.companyId,
    };

    // save draft / update draft / publish
    const { message }: { message: { campaignId: string } } =
      await api.campaign.post(endpoint, body);

    if (message.campaignId) {
      setCampaignId(message.campaignId);
      setStatus(type === 'Draft' ? 'saved' : 'published');
    } else throw new Error('Error: Campaign could not be created.');
  };

  return (
    <div>
      {status && (
        <MessageModal
          opened={!!status}
          {...modalData[status]}
          onClose={() => setStatus(undefined)}
        />
      )}

      <BackButton />

      <form
        onSubmit={createCHook.onSubmit(async (values) => {
          if (status !== 'publish') {
            setStatus('saving');
            handleSubmit('Draft', values);
          }
        })}>
        {userInfo && allArtists && cTypeData ? (
          <div>
            <Heading1 style={{ margin: '1rem 0 2rem' }}>
              {lang === 'en' ? 'Create Campaign' : '캠패인 만들기'}
            </Heading1>
            <Flex gap="lg" wrap="wrap">
              <Stack className={styles.leftColumn}>
                {/* Campaign Type */}
                <Select
                  data={cTypeData}
                  label={textData[lang].typeId[0]}
                  value={createCHook.values.typeId}
                  withAsterisk
                  placeholder={textData[lang].typeId[1]}
                  onChange={(event) =>
                    createCHook.setFieldValue('typeId', event ?? '')
                  }
                  error={createCHook.errors.campaignType}
                  styles={{ input: { height: '50px' } }}
                />
                {/* Record Labels */}
                <MultiSelect
                  data={Array.from(
                    new Set(allArtists.map((artist) => artist.brand))
                  )}
                  label={textData[lang].brand[0]}
                  value={createCHook.values.brand}
                  placeholder={textData[lang].brand[1]}
                  itemComponent={SelectItem}
                  valueComponent={ValueItem}
                  withAsterisk
                  searchable
                  nothingFound="Label not found"
                  onChange={(values) =>
                    createCHook.setFieldValue('brand', values)
                  }
                />
                {/* Artists */}
                <MultiSelect
                  label={textData[lang].artistId[0]}
                  placeholder={textData[lang].artistId[1]}
                  value={createCHook.values.artistId}
                  itemComponent={SelectItem}
                  valueComponent={ValueItem}
                  data={filterArtists(allArtists, createCHook.values.brand).map(
                    (artist) => ({
                      image: artist.profilePic,
                      label: `${artist.name} (${artist.brand})`,
                      value: artist._id,
                    })
                  )}
                  // searchable
                  nothingFound="Nobody here"
                  maxDropdownHeight={400}
                  withAsterisk
                  onChange={(event) => {
                    createCHook.setFieldValue('artistId', event);
                  }}
                  filter={(value, selected, item) =>
                    !selected &&
                    (item.brand
                      .toLowerCase()
                      .includes(value.toLowerCase().trim()) ||
                      item.description
                        .toLowerCase()
                        .includes(value.toLowerCase().trim()))
                  }
                />
                {/* Title Image */}
                <PCFileUpload
                  fileType="title"
                  files={
                    createCHook.values.titleImage
                      ? [createCHook.values.titleImage]
                      : undefined
                  }
                  setFeildValue={(value: (string | File)[] | undefined) =>
                    createCHook.setFieldValue(
                      'titleImage',
                      value ? value[0] : undefined
                    )
                  }
                  removeItem={(index: number) =>
                    createCHook.removeListItem('titleImage', index)
                  }
                />

                {/* Duration */}
                <Stack spacing={10}>
                  <Input.Label required>{dateFields[lang].heading}</Input.Label>
                  <Flex gap="2rem">
                    {Object.entries(dateFields[lang].data).map(
                      ([name, placeholder]) => (
                        <DatePicker
                          key={name}
                          placeholder={placeholder}
                          icon={<TbCalendarEvent />}
                          value={
                            createCHook.values[name as keyof CFormData] as
                              | Date
                              | undefined
                          }
                          onChange={(value) =>
                            createCHook.setFieldValue(
                              name,
                              value ? value : undefined
                            )
                          }
                          minDate={createCHook.values.startTime ?? new Date()}
                          maxDate={createCHook.values.endTime ?? undefined}
                        />
                      )
                    )}
                  </Flex>
                </Stack>

                {/* Title */}
                <div>
                  <Input.Label required>{textData[lang].title[0]}</Input.Label>
                  <TextInput
                    placeholder={textData[lang].title[1]}
                    {...createCHook.getInputProps('title')}
                  />
                </div>
                {/* Description */}
                <div>
                  <Input.Label required>
                    {textData[lang].details[0]}
                  </Input.Label>
                  <Textarea
                    minRows={4}
                    placeholder={textData[lang].details[1]}
                    {...createCHook.getInputProps('details')}
                  />
                </div>

                {/* Financials */}
                <Stack spacing={10}>
                  <Input.Label required>
                    {financialFields[lang].heading}
                  </Input.Label>
                  {Object.entries(financialFields[lang].data).map(
                    ([name, label]) => (
                      <NumberInput
                        key={name}
                        label={<BodyText fw={500}>{label}</BodyText>}
                        rightSection={<></>}
                        placeholder={`${
                          name === 'donateRate' || name === 'targetWM'
                            ? '$WM'
                            : '$SD'
                        }`}
                        {...createCHook.getInputProps(name)}
                      />
                    )
                  )}
                </Stack>

                {/* Supporting files */}
                <PCFileUpload
                  fileType="supporting"
                  files={createCHook.values.supportingMaterials}
                  setFeildValue={(value: (string | File)[] | undefined) =>
                    createCHook.setFieldValue('supportingMaterials', value)
                  }
                  removeItem={(index: number) =>
                    createCHook.removeListItem('supportingMaterials', index)
                  }
                />

                {/* Social Media */}
                <Stack spacing={10}>
                  <Input.Label>{socialFields[lang].heading}</Input.Label>
                  {Object.entries(socialFields[lang].data).map(
                    ([name, label]) => (
                      <TextInput
                        key={name}
                        label={<BodyText fw={500}>{label}</BodyText>}
                        placeholder={socialFields[lang].inputPlaceholder}
                        value={createCHook.values[name as keyof CFormData]}
                        {...createCHook.getInputProps(name)}
                      />
                    )
                  )}
                </Stack>
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
                  description={cardData[lang].cardText}
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
                  {cardData[lang].saveBtn}
                </Button>

                <Button
                  onClick={() => setStatus('publish')}
                  disabled={
                    !Object.values(publishValidation(createCHook.values)).every(
                      (err) => err === null
                    )
                  }
                  style={{
                    marginLeft: 'auto',
                    marginRight: '0',
                    width: '100%',
                  }}>
                  <TbUpload />
                  {cardData[lang].publishBtn}
                </Button>
              </Stack>
            </Flex>
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

export default CreateCampaign;
