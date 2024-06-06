import React, { FC } from 'react';
import { useDrag } from 'react-dnd';
import { Badge, Group } from '@mantine/core';
import { IconBraces, IconTable } from '@tabler/icons-react'; // Assuming you're using Tabler Icons

interface VariableBadgeProps {
  varName: string;
  type: string;
}

const VariableBadge: FC<VariableBadgeProps> = ({ varName, type }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'VARIABLE',
    item: { varName,type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const getIcon = (type: string) => {
    switch (type) {
      case 'array':
        return <IconTable size={10} />;
      case 'object':
        return <IconBraces size={10} />;
      default:
        return null;
    }
  };

  return (
    <Badge
      ref={drag}
      color="black"
      style={{ opacity: isDragging ? 0.5 : 1, background: isDragging ? 'transparent' : 'black' }}
    >
      <Group gap={2}>
        {getIcon(type)} {varName}
      </Group>
    </Badge>
  );
};

export default VariableBadge;
