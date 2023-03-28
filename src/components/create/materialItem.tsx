import { BodyText } from '@components/typography';
import { Box, Flex, CloseButton } from '@mantine/core';

interface IProps {
  item: string | File;
  onClose: () => void;
}

const MaterialItem = (props: IProps) => {
  const { item, onClose } = props;
  return (
    <Box sx={{ border: '1px solid #808080', borderRadius: '0.5rem' }}>
      <Flex w="100%" p="md" justify="space-between">
        <BodyText style={{ overflow: 'hidden', maxHeight: '1.5rem' }}>
          {typeof item !== 'string'
            ? item.name
            : item.split('--')[item.split('--').length - 1]}
        </BodyText>
        <CloseButton
          onClick={onClose}
          variant="transparent"
          size={22}
          iconSize={14}
          tabIndex={-1}
        />
      </Flex>
    </Box>
  );
};

export default MaterialItem;
