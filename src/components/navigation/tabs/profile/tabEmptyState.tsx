import { BodyText, Subheading1 } from '@components/typography';
import { Stack } from '@mantine/core';

export const EmptyState = (props: { title: string; text: string }) => (
  <Stack align="center" justify="center" h="40vh" w="35%" miw="15rem" m="auto">
    <Subheading1 fw={600}>{props.title}</Subheading1>
    <BodyText color="#5C5C5C" ta="center">
      {props.text}
    </BodyText>
  </Stack>
);
