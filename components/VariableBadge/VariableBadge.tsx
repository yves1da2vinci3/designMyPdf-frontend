import React, { FC } from 'react';
import { useDrag } from 'react-dnd';
import { Badge } from '@mantine/core';

interface VariableBadgeProps {
  varName: string;
}

const VariableBadge: FC<VariableBadgeProps> = ({ varName }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'VARIABLE',
    item: { varName },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <Badge
      ref={drag}
      style={{ opacity: isDragging ? 0.5 : 1, background: isDragging ? 'transparent' : 'black' }}
    >
      {varName}
    </Badge>
  );
};

export default VariableBadge;
