import {
  Flex,
  Stack,
  Select,
  Input,
  NumberInput,
  Loader,
  Modal,
  ModalProps,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { DatePicker } from '@mantine/dates';
import { TbCircleCheck, TbEdit, TbUpload } from 'react-icons/tb';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import api from 'src/utils/api';
import { useAuth } from 'src/utils/auth/authContext';
import { Campaign, Proposal } from 'src/utils/types';
import { ModalType } from '@components/pc/PCCard';
import StatCard from '@components/statCard';
import Button from '@components/buttons/button';
import { Heading1 } from '@components/typography';
import styles from './styles.module.scss';
import { useMediaQuery } from '@mantine/hooks';
import { useLanguage } from 'src/utils/lang/languageContext';

interface AdditionalProposalData {
  typeId: string;
  startTime?: number;
  endTime?: number;
  twitterLink: string | null;
  fbLink: string | null;
  igLink: string | null;
  target: number;
  costPerVote: number;
  rewardPerComment: number;
  donateRate: number;
  targetWM: number;
}

interface CType {
  _id: string;
  typeName: string;
}

interface IProps extends ModalProps {
  PC: Proposal | Campaign;
  removePC: (typeId: string) => void;
  modalDispatch: [
    ModalType | undefined,
    Dispatch<SetStateAction<ModalType | undefined>>
  ];
}

const UpgradeProposalModal = (props: IProps) => {
  const [cTypes, setCTypes] = useState<CType[]>();
  const { PC, removePC, modalDispatch, ...modalProps } = props;
  const [, setModalType] = modalDispatch;
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { lang } = useLanguage();
  const { userInfo } = useAuth();
  const router = useRouter();

  const label = {
    en: {
      heading: 'Upgraded to Campaign',
      buttonText: 'View Campaign',
      formHeading: 'Create Campaign',
      selectLabel: 'Campaign Type',
      durationLabel: 'Duration',
      durationStart: 'Start date',
      durationEnd: 'End date',
      financialHeading: 'Financials',
      campaignGoal: 'Campaign goal',
      cost: 'Cost per vote',
      commentReward: 'Comment reward',
      note: "Please note; this Campaign's wallet will be created automatically.",
      saveButton: 'Save Draft',
      publishButton: 'Publish',
      donateRate: 'Donate Rate',
      targetWM: 'WeMake goal',
    },
    ko: {
      heading: '캠페인으로 승진되었습니다',
      buttonText: '캠페인 보기',
      formHeading: '캠페인 만들기',
      selectLabel: '캠페인 유형',
      durationLabel: '기간',
      durationStart: '시작일',
      durationEnd: '종료일',
      financialHeading: '토큰 설정',
      campaignGoal: '목표금액',
      cost: '투표 당 비용',
      commentReward: '댓글 보상',
      note: '참고: 캠페인 지갑이 자동으로 생성됩니다.',
      saveButton: '임시 저장',
      publishButton: '게시',
      donateRate: '기부율',
      targetWM: '위매이크 목표금액',
    },
  };
  const handleSubmit = async (
    values: AdditionalProposalData,
    endpoint: 'create' | 'launch'
  ) => {
    const { status } = await api.proposal.post('/updateApprovalStatus', {
      _id: PC._id,
      status: 'Approval',
    });
    if (status !== 'Success') return;
    const body = {
      title: PC.title,
      details: PC.details,
      proposalId: PC._id,
      titleImage: PC.titleImage,
      supportingMaterials: PC.supportingMaterials,
      artistId: PC.artistId,
      brand: PC.brand,
      companyId: userInfo?.companyId,
      ...values,
    };
    setModalType([
      'Message',
      { icon: <Loader color="#C399FF" />, onClose: props.onClose },
    ]);
    const res = await api.campaign.post(`/${endpoint}`, body);
    if (res.status === 'Success') {
      setModalType([
        'Message',
        {
          icon: <TbCircleCheck color="#333333" size={36} />,
          heading: label[lang].heading,
          onSubmit: () =>
            router.push(
              `/admin/campaigns/statistics/${res.message.campaignId}`
            ),
          onClose: () => props.removePC(PC._id),
          buttonText: label[lang].buttonText,
          color: 'purple',
        },
      ]);
    }
  };

  const publishValidation = (values: AdditionalProposalData) => ({
    typeId: values.typeId.length > 5 ? null : 'Required',
    startTime: values.startTime ? null : 'Required',
    endTime: values.endTime ? null : 'Required',
    target: values.target > 0 ? null : 'Required',
    costPerVote: values.costPerVote > 0 ? null : 'Required',
    rewardPerComment: values.rewardPerComment > 0 ? null : 'Required',
  });

  const createCampaignHook = useForm<AdditionalProposalData>({
    initialValues: {
      typeId: '',
      startTime: PC.startTime,
      endTime: PC.endTime,
      fbLink: null,
      twitterLink: null,
      igLink: null,
      target: PC.target,
      costPerVote: PC.costPerVote,
      rewardPerComment: PC.rewardPerComment,
      donateRate: 1,
      targetWM: 0,
    },
  });

  useEffect(() => {
    api.campaign
      .get('/type/all')
      .then(({ message }) => setCTypes(message.campaignTypeList));
  }, []);

  const cTypeData = cTypes && [
    ...cTypes.map((cType) => ({
      value: cType._id,
      label: cType.typeName,
    })),
  ];

  return (
    <Modal
      {...modalProps}
      size="80%"
      fullScreen={isMobile}
      centered
      radius="xl"
      padding={25}>
      <form
        style={{ padding: 15 }}
        onSubmit={(event) => event.preventDefault()}>
        {cTypeData ? (
          <>
            <Heading1 style={{ margin: '1rem 0 2rem' }}>
              {label[lang].formHeading}
            </Heading1>
            <Flex justify="space-between" wrap="wrap">
              <Stack spacing={30} w={isMobile ? '100%' : '60%'}>
                {/* Campaign Type */}
                <Select
                  data={cTypeData}
                  label={label[lang].selectLabel}
                  placeholder={label[lang].selectLabel}
                  withAsterisk
                  onSelect={(event) =>
                    createCampaignHook.setFieldValue(
                      'typeId',
                      event.currentTarget.value
                    )
                  }
                  error={createCampaignHook.errors.campaignType}
                  styles={{ input: { height: '50px', borderRadius: '10px' } }}
                />
                {/* Duration */}
                <div>
                  <Input.Label required>
                    {label[lang].durationLabel}
                  </Input.Label>
                  <Flex gap="2rem">
                    <DatePicker
                      placeholder={label[lang].durationStart}
                      value={
                        createCampaignHook.values.startTime
                          ? new Date(createCampaignHook.values.startTime)
                          : undefined
                      }
                      onChange={(value) =>
                        createCampaignHook.setFieldValue(
                          'startTime',
                          value?.getTime()
                        )
                      }
                      minDate={new Date()}
                      maxDate={
                        createCampaignHook.values.endTime
                          ? new Date(createCampaignHook.values.endTime)
                          : undefined
                      }
                    />
                    <DatePicker
                      placeholder={label[lang].durationEnd}
                      value={
                        createCampaignHook.values.endTime
                          ? new Date(createCampaignHook.values.endTime)
                          : undefined
                      }
                      onChange={(value) =>
                        createCampaignHook.setFieldValue(
                          'endTime',
                          value?.getTime()
                        )
                      }
                      minDate={
                        createCampaignHook.values.startTime
                          ? new Date(createCampaignHook.values.startTime)
                          : undefined
                      }
                    />
                  </Flex>
                </div>
                {/* Financials */}
                <Stack spacing={10}>
                  <Input.Label required>
                    {label[lang].financialHeading}
                  </Input.Label>

                  {/* Campaign goal */}
                  <NumberInput
                    label={label[lang].campaignGoal}
                    placeholder="$SD"
                    {...createCampaignHook.getInputProps('target')}
                  />
                  {/* Cost per vote */}
                  <NumberInput
                    label={label[lang].cost}
                    placeholder="$SD"
                    {...createCampaignHook.getInputProps('costPerVote')}
                  />
                  {/* Comment reward */}
                  <NumberInput
                    label={label[lang].commentReward}
                    placeholder="$SD"
                    {...createCampaignHook.getInputProps('rewardPerComment')}
                  />
                  {/* Donation reward rate */}
                  <NumberInput
                    label={label[lang].donateRate}
                    placeholder="$WM"
                    {...createCampaignHook.getInputProps('donateRate')}
                  />
                  {/* WeMake target */}
                  <NumberInput
                    label={label[lang].targetWM}
                    placeholder="$WM"
                    {...createCampaignHook.getInputProps('targetWM')}
                  />
                </Stack>
              </Stack>
              <Stack w={isMobile ? '100%' : '30%'} spacing="xl" my="xl">
                <StatCard
                  data={null}
                  descWeight={500}
                  className={styles.note}
                  description={label[lang].note}
                />
                <Button
                  onClick={() =>
                    handleSubmit(createCampaignHook.values, 'create')
                  }
                  size="md"
                  color="black"
                  className={styles.button}>
                  <TbEdit />
                  {label[lang].saveButton}
                </Button>

                <Button
                  onClick={() =>
                    handleSubmit(createCampaignHook.values, 'launch')
                  }
                  disabled={
                    !Object.values(
                      publishValidation(createCampaignHook.values)
                    ).every((err) => err === null)
                  }
                  className={styles.button}>
                  <TbUpload />
                  {label[lang].publishButton}
                </Button>
              </Stack>
            </Flex>
          </>
        ) : (
          <Flex justify="center" align="center">
            <Loader color="#C399FF" />
          </Flex>
        )}
      </form>
    </Modal>
  );
};

export default UpgradeProposalModal;
