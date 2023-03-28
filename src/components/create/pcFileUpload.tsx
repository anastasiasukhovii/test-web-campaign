import Button from '@components/buttons/button';
import Dropzone from '@components/create/dropzone';
import { BodyText } from '@components/typography';
import { Box, CloseButton, FileButton, Flex, Input } from '@mantine/core';
import { Language, useLanguage } from 'src/utils/lang/languageContext';

export const PCFileUpload = ({
  files,
  setFeildValue,
  removeItem,
  fileType,
}: {
  fileType: 'title' | 'supporting';
  files?: (File | string)[];
  setFeildValue: any;
  removeItem: any;
}) => {
  const { lang } = useLanguage();
  const textData: Record<
    Language,
    Record<typeof fileType, { title: string; dropzoneTitle: string }> & {
      placeholder: string;
      uploadImg: string;
    }
  > = {
    en: {
      title: { title: 'Title Image', dropzoneTitle: 'Upload title image' },
      supporting: {
        title: 'Supporting files',
        dropzoneTitle: 'Drag & Drop maximum 5 files',
      },
      placeholder: '(max. 2160 x 1080)',
      uploadImg: 'Upload image',
    },
    ko: {
      title: { title: '커버 이미지', dropzoneTitle: '이미지 올리기' },
      supporting: {
        title: '첨부 파일',
        dropzoneTitle: '끌어다 놓기 (최대 5개까지 첨부)',
      },
      placeholder: '(최대 2160 x 1080)',
      uploadImg: '이미지 올리기',
    },
  };
  return (
    <div>
      <Input.Label required={fileType === 'title'}>
        {textData[lang][fileType].title}
      </Input.Label>
      {!files || files.length < 1 ? (
        <Dropzone
          lang={lang}
          multiple
          maxFiles={5}
          type="file"
          title={textData[lang][fileType].dropzoneTitle}
          placeholder={textData[lang].placeholder}
          mt="sm"
          onDrop={(value) => setFeildValue(...(files ?? []), value)}
        />
      ) : (
        <>
          {files.map((file, i) => (
            <Box
              key={i}
              sx={{ border: '1px solid #808080', margin: '0.5rem 0' }}
              style={{ borderRadius: '0.5rem' }}>
              <Flex w="100%" p="1rem" justify="space-between">
                <BodyText>
                  {typeof file !== 'string'
                    ? file.name
                    : file.split('--')[file.split('--').length - 1]}
                </BodyText>
                <CloseButton
                  onMouseDown={() => {
                    if (files.length === 1) {
                      setFeildValue(undefined);
                    }
                    removeItem(i);
                  }}
                  variant="transparent"
                  size={22}
                  iconSize={14}
                  tabIndex={-1}
                />
              </Flex>
            </Box>
          ))}
          {fileType === 'supporting' && (
            <FileButton
              onChange={(file) => {
                file && setFeildValue([...(files ?? []), ...file]);
              }}
              multiple
              accept="image/png,image/jpeg">
              {(props) => (
                <Button
                  style={{ marginTop: '0.5rem' }}
                  type="secondary"
                  color="black"
                  onClick={(e) => {
                    e.preventDefault();
                    props.onClick();
                  }}>
                  {textData[lang].uploadImg}
                </Button>
              )}
            </FileButton>
          )}
        </>
      )}
    </div>
  );
};
